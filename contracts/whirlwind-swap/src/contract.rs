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
use crate::msg::{
    DenomUnvalidated, ExecuteMsg, InstantiateMsg, OsmosisRoute, OsmosisSwap, OsmosisSwapValue,
    QueryMsg,
};
use crate::state::{
    Denom, DenomOwnership, SwapContext, ALLOWED_POOLS, COMMITMENTS, DEPOSIT_AMOUNT, DEPOSIT_DENOM,
    DEPOSIT_VERIFIER, MIGRATE_VERIFIER, NULLIFIER_HASHES, OWNERSHIP_HASHES, POOL_ADMIN, SWAP_CTX,
    SWAP_VERIFIER, WITHDRAW_VERIFIER,
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
    MIGRATE_VERIFIER.save(deps.storage, &swap_deposit_v)?;
    SWAP_VERIFIER.save(deps.storage, &swap_v)?;
    WITHDRAW_VERIFIER.save(deps.storage, &withdraw_v)?;

    let tree = MerkleTreeWithHistory::new(20);
    COMMITMENTS.save(deps.storage, &tree)?;

    match msg.pool_admin {
        Some(addr) => {
            let addr = deps.api.addr_validate(&addr)?;
            POOL_ADMIN.save(deps.storage, &addr)?;
        }
        // No admin makes allowed pool list immutable
        None => (),
    };
    ALLOWED_POOLS.save(deps.storage, &msg.allowed_pools)?;

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
            deposit_credential_hash,
            withdraw_addr,
        } => {
            let withdraw_addr = deps.api.addr_validate(&withdraw_addr)?;
            execute_deposit(
                deps,
                info,
                env,
                proof.to_proof(),
                deposit_credential_hash,
                withdraw_addr,
            )
        }
        _ => unimplemented!(),
    }
}

pub fn execute_deposit(
    deps: DepsMut,
    info: MessageInfo,
    env: Env,
    proof: Proof<Bn254>,
    deposit_credential_hash: String,
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
    // Verify SNARK
    let verifier = DEPOSIT_VERIFIER.load(deps.storage)?;
    let public_signals = PublicSignals(vec![
        withdraw_addr.to_string(),
        deposit_credential_hash.clone(),
    ]);
    let success = verifier.verify_proof(proof, &public_signals.get());
    if !success {
        return Err(ContractError::InvalidProof {});
    }

    // insert commitment into merkle tree
    let mut commitment_mt = COMMITMENTS.load(deps.storage)?;
    // confirm insert worked
    let success = commitment_mt.insert(&Uint256::from_str(&deposit_credential_hash)?);
    if success.is_none() {
        return Err(ContractError::InvalidCommitment {});
    }

    COMMITMENTS.save(deps.storage, &commitment_mt)?;

    Ok(Response::new()
        .add_messages(msgs)
        .add_attribute("action", "deposit")
        .add_attribute("from", info.sender))
}

pub fn execute_migrate_deposit(
    deps: DepsMut,
    info: MessageInfo,
    _env: Env,
    proof: Proof<Bn254>,
    root: String,
    nullifier_hash: String,
    new_deposit_credential_hash: String,
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
    let verifier = MIGRATE_VERIFIER.load(deps.storage)?;
    let public_signals = PublicSignals(vec![
        root.clone(),
        nullifier_hash.clone(),
        new_deposit_credential_hash.clone(),
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
    OWNERSHIP_HASHES.save(
        deps.storage,
        new_deposit_credential_hash.clone(),
        &(
            DenomOwnership {
                amount: input_amount,
                denom: input_denom,
            },
            2,
        ),
    )?;

    Ok(Response::new()
        .add_attribute("action", "migrate_deposit")
        .add_attribute("from", info.sender))
}

pub fn execute_swap(
    deps: DepsMut,
    info: MessageInfo,
    env: Env,
    proof: Proof<Bn254>,
    deposit_credential_hash: String,
    new_deposit_credential_hash: String,
    routes: Vec<OsmosisRoute>,
    min_output: Uint128,
    output_denom: Denom,
) -> Result<Response<OsmosisSwap>, ContractError> {
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
    let allowed_pool_ids = ALLOWED_POOLS.load(deps.storage)?;
    let msg = get_osmosis_swap_msg(
        allowed_pool_ids,
        env.contract.address.clone(),
        routes,
        ownership.amount,
        ownership.denom,
        min_output,
        output_denom.clone(),
    )?;
    let sub_msg = SubMsg::reply_on_success(msg, SWAP_REPLY_ID);
    let output_balance_before_swap =
        get_denom_balance(deps.as_ref(), output_denom.clone(), env.contract.address)?;
    SWAP_CTX.save(
        deps.storage,
        &SwapContext {
            // This is to save the output of the swap into the contract state
            deposit_credential_hash: new_deposit_credential_hash.clone(),
            output_balance_before_swap,
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

pub fn execute_update_allowed_pools(
    deps: DepsMut,
    info: MessageInfo,
    pools: Vec<String>,
) -> Result<Response, ContractError> {
    // No admin makes allowed pool list immutable
    let admin = POOL_ADMIN.load(deps.storage)?;
    if info.sender != admin {
        return Err(ContractError::Unauthorized {});
    }
    ALLOWED_POOLS.save(deps.storage, &pools)?;

    Ok(Response::default()
        .add_attribute("action", "update_allowed_pools")
        .add_attribute("from", info.sender))
}

pub fn get_osmosis_swap_msg(
    allowed_pool_ids: Vec<String>,
    contract_addr: Addr,
    routes: Vec<OsmosisRoute>,
    input_amount: Uint128,
    input_denom: Denom,
    min_output: Uint128,
    output_denom: Denom,
) -> Result<CosmosMsg<OsmosisSwap>, ContractError> {
    let input_denom = match input_denom {
        Denom::Native(denom) => Ok(denom),
        Denom::Cw20(_) => Err(ContractError::Std(StdError::GenericErr {
            msg: "Not yet supported".into(),
        })),
    }?;
    let output_denom = match output_denom {
        Denom::Native(denom) => Ok(denom),
        Denom::Cw20(_) => Err(ContractError::Std(StdError::GenericErr {
            msg: "Not yet supported".into(),
        })),
    }?;
    for (i, route) in routes.iter().enumerate() {
        if !allowed_pool_ids.contains(&route.pool_id.clone()) {
            return Err(ContractError::InvalidPoolId {
                id: route.pool_id.clone(),
            });
        }
        // Quite important to check that the output denom is the last element
        if (i == routes.len() - 1) && (route.token_out_denom != output_denom) {
            return Err(ContractError::Std(StdError::GenericErr {
                msg: "Output denom must be last element of routes".into(),
            }));
        }
    }
    let msg = CosmosMsg::Custom(OsmosisSwap {
        _type: "osmosis/gamm/swap-exact-amount-in".into(),
        value: OsmosisSwapValue {
            routes,
            sender: contract_addr.into(),
            token_in: Coin {
                denom: input_denom,
                amount: input_amount,
            },
            token_out_min_amount: min_output,
        },
    });
    Ok(msg)
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn reply(deps: DepsMut, env: Env, msg: Reply) -> Result<Response, ContractError> {
    match msg.id {
        SWAP_REPLY_ID => {
            let SwapContext {
                deposit_credential_hash,
                output_balance_before_swap,
                output_denom,
                counter,
            } = SWAP_CTX.load(deps.storage)?;

            // Output of Osmosis swap is the difference between
            // the output denom balance before and after swap
            let output_balance_after_swap =
                get_denom_balance(deps.as_ref(), output_denom.clone(), env.contract.address)?;
            let output_amount = output_balance_after_swap
                .checked_sub(output_balance_before_swap)
                .map_err(|_| {
                    ContractError::Std(StdError::GenericErr {
                        msg: "Output amount overflow".to_string(),
                    })
                })?;

            OWNERSHIP_HASHES.save(
                deps.storage,
                deposit_credential_hash,
                &(
                    DenomOwnership {
                        amount: output_amount,
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

fn get_denom_balance(deps: Deps, denom: Denom, target_addr: Addr) -> StdResult<Uint128> {
    match denom {
        Denom::Native(denom) => {
            let balance = deps.querier.query_balance(target_addr, denom)?;
            Ok(balance.amount)
        }
        Denom::Cw20(cw20_addr) => {
            let cw20::BalanceResponse { balance } = deps.querier.query_wasm_smart(
                cw20_addr.clone(),
                &cw20::Cw20QueryMsg::Balance {
                    address: target_addr.to_string(),
                },
            )?;
            Ok(balance)
        }
    }
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(_deps: Deps, _env: Env, _msg: QueryMsg) -> StdResult<Binary> {
    unimplemented!()
}

#[cfg(test)]
mod tests {
    use cosmwasm_schema::cw_serde;
    use lib::msg::CircomProof;
    use serde_json;
    use super::*;

    #[cw_serde]
    pub struct ProofData {
        pub proof: CircomProof,
        pub public_signals: Vec<String>,
    }

    #[test]
    fn test_sanity() {
        let deposit_vk: &str = include_str!("../../../circuits/verification_keys/deposit.vk.json");
        let v = Verifier::from_vk(deposit_vk.to_string()); 
        let proof_data_json: ProofData = serde_json::from_str(include_str!("../../../generate-proofs/outputs/deposit1.json")).unwrap();
        let proof = proof_data_json.proof.clone();

        let public_signals = PublicSignals::from_json(serde_json::to_string(&proof_data_json.public_signals).unwrap());
        let res = v.clone().verify_proof(proof.clone().to_proof(), &public_signals.clone().get());
        assert_eq!(res, true);

        // Bad public signal address
        let bad_signals = PublicSignals(vec![
            // Bech32 addresses have characters and PublicSignals can only take Uint256  
            "432".into(),
            public_signals.0[1].clone(),
        ]); 
        let res = v.verify_proof(proof.to_proof(), &bad_signals.get());
        assert_eq!(res, false);
    }
}
