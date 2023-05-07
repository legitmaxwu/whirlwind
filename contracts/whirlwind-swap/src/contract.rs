use std::str::FromStr;

use ark_bn254::Bn254;
use ark_groth16::Proof;
#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{
    to_binary, Addr, BankMsg, Binary, Coin, CosmosMsg, Deps, DepsMut, Env, MessageInfo, Reply,
    Response, StdError, StdResult, SubMsg, Uint128, Uint256, WasmMsg,
};
use cw2::set_contract_version;
use cw20::Cw20ExecuteMsg;
use lib::msg::PublicSignals;

use crate::error::ContractError;
use crate::msg::{DenomUnvalidated, ExecuteMsg, InstantiateMsg, QueryMsg};
use crate::state::{
    Denom, DenomOwnership, SwapContext, COMMITMENTS, DEPOSIT_AMOUNT, DEPOSIT_DENOM,
    NULLIFIER_HASHES, OWNERSHIP_HASHES, SWAP_CTX, SWAP_DEPOSIT_VERIFIER, SWAP_VERIFIER, DEPOSIT_VERIFIER,
    WITHDRAW_VERIFIER,
};
use lib::merkle_tree::MerkleTreeWithHistory;
use lib::verifier::Verifier;

// version info for migration info
const CONTRACT_NAME: &str = "crates.io:whirlwind";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

const SWAP_REPLY_ID: u64 = 1;

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

    let denom = match msg.denom {
        DenomUnvalidated::Native(denom) => Denom::Native(denom),
        DenomUnvalidated::Cw20(addr) => Denom::Cw20(deps.api.addr_validate(&addr)?),
    };
    DEPOSIT_DENOM.save(deps.storage, &denom)?;
    DEPOSIT_AMOUNT.save(deps.storage, &msg.amount)?;

    // Instantiate verifiers
    let deposit_v = Verifier::from_vk(msg.vk_deposit);
    let swap_deposit_v = Verifier::from_vk(msg.vk_swap_deposit);
    let swap_v = Verifier::from_vk(msg.vk_swap);
    let withdraw_v = Verifier::from_vk(msg.vk_withdraw);

    DEPOSIT_VERIFIER.save(deps.storage, &deposit_v)?;  
    SWAP_DEPOSIT_VERIFIER.save(deps.storage, &swap_deposit_v)?;
    SWAP_VERIFIER.save(deps.storage, &swap_v)?;
    WITHDRAW_VERIFIER.save(deps.storage, &withdraw_v)?;

    let tree = MerkleTreeWithHistory::new(20);
    COMMITMENTS.save(deps.storage, &tree)?;

    Ok(Response::default())
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::Deposit {
            proof,
            deposit_credential,
            withdraw_addr,
        } => {
            let withdraw_addr = deps.api.addr_validate(&withdraw_addr)?;
            execute_deposit(deps, info, env, proof, deposit_credential, withdraw_addr)
        }
        _ => unimplemented!(),
    }
}

pub fn execute_deposit(
    deps: DepsMut,
    info: MessageInfo,
    env: Env,
    proof: String,
    deposit_credential: String,
    withdraw_addr: Addr,
) -> Result<Response, ContractError> {
    // confirm deposit amount and denom
    let deposit_amount = DEPOSIT_AMOUNT.load(deps.storage)?;
    let deposit_denom = DEPOSIT_DENOM.load(deps.storage)?;
    let mut msgs: Vec<CosmosMsg> = vec![];
    match deposit_denom {
        Denom::Native(denom) => {
            if info.funds.len() != 1 {
                return Err(ContractError::InvalidDeposit {});
            }
            if info.funds[0].amount != deposit_amount {
                return Err(ContractError::InvalidDeposit {});
            }
            if info.funds[0].denom != denom {
                return Err(ContractError::InvalidDeposit {});
            }
        }
        Denom::Cw20(addr) => {
            msgs.push(CosmosMsg::Wasm(WasmMsg::Execute {
                contract_addr: addr.to_string(),
                msg: to_binary(&Cw20ExecuteMsg::Transfer {
                    recipient: env.contract.address.to_string(),
                    amount: deposit_amount,
                })?,
                funds: vec![],
            }));
        }
    }
    // TODO(max): Verify proof here

    // insert commitment into merkle tree
    let mut commitment_mt = COMMITMENTS.load(deps.storage)?;
    // confirm insert worked
    let success = commitment_mt.insert(&Uint256::from_str(&deposit_credential)?);
    if success.is_none() {
        return Err(ContractError::InvalidCommitment {});
    }

    COMMITMENTS.save(deps.storage, &commitment_mt)?;

    Ok(Response::new()
        .add_messages(msgs)
        .add_attribute("action", "deposit")
        .add_attribute("from", info.sender))
}

pub fn execute_swap_deposit(
    deps: DepsMut,
    info: MessageInfo,
    proof: Proof<Bn254>,
    root: String,
    nullifier_hash: String,
    deposit_credential_hash: String,
    min_output: Uint128,
    output_denom: Denom,
) -> Result<Response, ContractError> {
    // Reject if nullifier hash is in map
    match NULLIFIER_HASHES.may_load(deps.storage, nullifier_hash.clone())? {
        Some(_) => return Err(ContractError::DuplicateCommitment {}),
        None => (),
    };

    // Confirm root is ok
    let commitment_mt = COMMITMENTS.load(deps.storage)?;
    assert_ne!(
        commitment_mt.current_root_index, 0,
        "Commitment merkle tree shouldn't be 0"
    );
    if !commitment_mt.is_known_root(&Uint256::from_str(&root).unwrap()) {
        return Err(ContractError::UnknownRoot {});
    }

    // Verify SNARK
    let verifier = SWAP_DEPOSIT_VERIFIER.load(deps.storage)?;
    let public_signals = PublicSignals(vec![
        root.clone(),
        nullifier_hash.clone(),
        deposit_credential_hash.clone(),
    ]);
    let success = verifier.verify_proof(proof, &public_signals.get());
    if !success {
        return Err(ContractError::InvalidProof {});
    }

    // Insert nullifier hash into map
    NULLIFIER_HASHES.save(deps.storage, nullifier_hash, &true)?;

    // Add swap message with reply handler
    let input_denom = DEPOSIT_DENOM.load(deps.storage)?;
    let input_amount = DEPOSIT_AMOUNT.load(deps.storage)?;
    let msg = get_osmosis_swap_msg(input_amount, input_denom, min_output, output_denom.clone())?;
    let sub_msg = SubMsg::reply_on_success(msg, SWAP_REPLY_ID);
    SWAP_CTX.save(
        deps.storage,
        &SwapContext {
            // This is to save the output of the swap into the contract state
            deposit_credential_hash: deposit_credential_hash.clone(),
            output_denom,
            // This number is the first `n + 1` due to swap deposit
            // See design document for more details.
            counter: 3,
        },
    )?;

    Ok(Response::new()
        .add_submessage(sub_msg)
        .add_attribute("action", "swap_deposit")
        .add_attribute("from", info.sender))
}

pub fn execute_swap(
    deps: DepsMut,
    info: MessageInfo,
    proof: Proof<Bn254>,
    deposit_credential_hash: String,
    new_deposit_credential_hash: String,
    min_output: Uint128,
    output_denom: Denom,
) -> Result<Response, ContractError> {
    // Confirm deposit credential hash is in map
    let (ownership, counter) = OWNERSHIP_HASHES
        .load(deps.storage, deposit_credential_hash.clone())
        .map_err(|_| ContractError::InvalidDepositCredential {})?;

    // Verify SNARK
    let verifier = SWAP_VERIFIER.load(deps.storage)?;
    let public_signals = PublicSignals(vec![
        deposit_credential_hash.clone(),
        new_deposit_credential_hash.clone(),
    ]);
    let success = verifier.verify_proof(proof, &public_signals.get());
    if !success {
        return Err(ContractError::InvalidProof {});
    }

    // Remove old deposit credential hash from map
    OWNERSHIP_HASHES.remove(deps.storage, deposit_credential_hash.clone());

    // Add swap message with reply handler
    let msg = get_osmosis_swap_msg(
        ownership.amount,
        ownership.denom,
        min_output,
        output_denom.clone(),
    )?;
    let sub_msg = SubMsg::reply_on_success(msg, SWAP_REPLY_ID);
    SWAP_CTX.save(
        deps.storage,
        &SwapContext {
            // This is to save the output of the swap into the contract state
            deposit_credential_hash: new_deposit_credential_hash.clone(),
            output_denom,
            counter: counter + 1,
        },
    )?;

    Ok(Response::new()
        .add_submessage(sub_msg)
        .add_attribute("action", "swap")
        .add_attribute("from", info.sender))
}

pub fn execute_withdraw(
    deps: DepsMut,
    info: MessageInfo,

    proof: Proof<Bn254>,
    withdraw_addr: Addr,
    deposit_credential_hash: String,
) -> Result<Response, ContractError> {
    // Confirm deposit credential hash is in map
    let (ownership, _) = OWNERSHIP_HASHES
        .load(deps.storage, deposit_credential_hash.clone())
        .map_err(|_| ContractError::InvalidDepositCredential {})?;

    // Verify SNARK
    let verifier = WITHDRAW_VERIFIER.load(deps.storage)?;
    let public_signals = PublicSignals(vec![
        withdraw_addr.to_string(),
        deposit_credential_hash.clone(),
    ]);
    let success = verifier.verify_proof(proof, &public_signals.get());
    if !success {
        return Err(ContractError::InvalidProof {});
    }

    // Remove old deposit credential hash from map
    OWNERSHIP_HASHES.remove(deps.storage, deposit_credential_hash.clone());

    // Send funds to withdraw address
    let mut msgs: Vec<CosmosMsg> = vec![];
    match ownership.denom {
        Denom::Native(denom) => {
            msgs.push(CosmosMsg::Bank(BankMsg::Send {
                to_address: withdraw_addr.to_string(),
                amount: vec![Coin {
                    amount: ownership.amount,
                    denom,
                }],
            }));
        }
        Denom::Cw20(addr) => {
            msgs.push(CosmosMsg::Wasm(WasmMsg::Execute {
                contract_addr: addr.to_string(),
                msg: to_binary(&Cw20ExecuteMsg::Transfer {
                    recipient: withdraw_addr.to_string(),
                    amount: ownership.amount,
                })?,
                funds: vec![],
            }));
        }
    }

    Ok(Response::default()
        .add_messages(msgs)
        .add_attribute("action", "withdraw")
        .add_attribute("from", info.sender))
}

pub fn get_osmosis_swap_msg(
    input_amount: Uint128,
    input_denom: Denom,
    min_output: Uint128,
    output_denom: Denom,
) -> Result<CosmosMsg, ContractError> {
    unimplemented!()
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn reply(deps: DepsMut, _env: Env, msg: Reply) -> Result<Response, ContractError> {
    match msg.id {
        SWAP_REPLY_ID => {
            let SwapContext {
                deposit_credential_hash,
                output_denom,
                counter,
            } = SWAP_CTX.load(deps.storage)?;

            // TODO(!): Get output of Osmosis transaction
            // from transaction success

            OWNERSHIP_HASHES.save(
                deps.storage,
                deposit_credential_hash,
                &(
                    DenomOwnership {
                        // TODO(!): Get output amount from Osmosis transaction
                        amount: Uint128::zero(),
                        denom: output_denom,
                    },
                    counter,
                ),
            )?;
            Ok(Response::default())
        }
        _ => Err(ContractError::Std(StdError::GenericErr {
            msg: "Unknown reply ID".to_string(),
        })),
    }
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(_deps: Deps, _env: Env, _msg: QueryMsg) -> StdResult<Binary> {
    unimplemented!()
}

#[cfg(test)]
mod tests {}
