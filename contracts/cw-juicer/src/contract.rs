use cosmwasm_std::entry_point;

use cosmwasm_std::{
    coin, to_binary, BankMsg, Binary, Coin, Deps, DepsMut, Env, MessageInfo, Response, StdResult,
    Uint128 as U128, Uint256 as U256,
};

use crate::coin_helpers::assert_sent_exact_coin;

use std::str::FromStr;

use cw2::set_contract_version;

use lib::merkle_tree::MerkleTreeWithHistory;
use lib::msg::PublicSignals;
use lib::verifier::Verifier;

use crate::error::ContractError;
use crate::msg::{
    AdminMsg, DepositMsg, ExecuteMsg, InstantiateMsg, IsKnownRootMsg, QueryMsg, WithdrawMsg,
};
use crate::state::{COMMITMENTS, COUNTER, NULLIFIER_HASHES, VERIFIER};

// version info for migration info
const CONTRACT_NAME: &str = "juicy-10000";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

const JUNO: &str = "ujuno";
const ADMIN: &str = "juno10ve2n3n97sxzpykfu2g5hys04fmyl8lwxq6e0hemdn0xhestzcaq5lzua0";

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    _msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

    let verifier = Verifier::new();
    VERIFIER.save(deps.storage, &verifier)?;

    COUNTER.save(deps.storage, &0)?;

    let tree = MerkleTreeWithHistory::new(20);
    COMMITMENTS.save(deps.storage, &tree)?;

    Ok(Response::default())
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::Deposit(msg) => execute_deposit(deps, info, msg),
        ExecuteMsg::Withdraw(msg) => execute_withdraw(deps, env, info, msg),
        ExecuteMsg::AdminWithdraw(msg) => execute_admin_withdraw(deps, env, info, msg),
    }
}

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::IsKnownRoot(msg) => to_binary(&query_is_known_root(deps, msg)?),
    }
}

pub fn query_is_known_root(deps: Deps, msg: IsKnownRootMsg) -> StdResult<bool> {
    let commitment_mt = COMMITMENTS.load(deps.storage)?;

    Ok(commitment_mt.is_known_root(&U256::from_str(&msg.root)?))
}

pub fn execute_deposit(
    deps: DepsMut,
    info: MessageInfo,
    msg: DepositMsg,
) -> Result<Response, ContractError> {
    assert_sent_exact_coin(&info.funds, Some(coin(10_000_000_000, JUNO)))?;

    let mut commitment_mt = COMMITMENTS.load(deps.storage)?;
    //confirm insert worked
    let success = commitment_mt.insert(&U256::from_str(&msg.commitment)?);
    if success.is_none() {
        return Err(ContractError::InsertFailed {});
    }
    COMMITMENTS.save(deps.storage, &commitment_mt)?;

    Ok(Response::new()
        .add_attribute("action", "deposit")
        .add_attribute("from", info.sender))
}

pub fn execute_withdraw(
    deps: DepsMut,
    env: Env,
    _info: MessageInfo,
    msg: WithdrawMsg,
) -> Result<Response, ContractError> {
    let recipient = deps.api.addr_validate(&msg.recipient)?;
    if !msg.relayer.is_empty() && msg.relayer != "0" {
        deps.api.addr_validate(&msg.relayer)?;
    }

    // Check contract funds
    let balance = deps.querier.query_balance(env.contract.address, JUNO)?;
    if balance.amount <= U128::from(9_960_000_000_u128) {
        return Err(ContractError::ContractBalanceEmpty {
            amount: balance.amount,
        });
    }

    let public_signals = PublicSignals::from_values(
        msg.root.clone(),
        msg.nullifier_hash.clone(),
        msg.recipient.clone(),
        msg.relayer.clone(),
        msg.fee,
    );

    let commitment_mt = COMMITMENTS.load(deps.storage)?;
    assert_ne!(
        commitment_mt.current_root_index, 0,
        "commitment merkle tree shouldn't be 0"
    );

    // 1. check nullifier_hash is not in nullifier hashes
    match NULLIFIER_HASHES.may_load(deps.storage, msg.nullifier_hash.clone())? {
        Some(_) => return Err(ContractError::DuplicatedCommitment {}),
        None => (),
    };

    // 2. confirm root is ok
    if !commitment_mt.is_known_root(&U256::from_str(&msg.root).unwrap()) {
        return Err(ContractError::UnknownRoot {});
    }

    // 3. Confirm the circuit proof
    let verifier = VERIFIER.load(deps.storage)?;
    let proof = msg.proof.to_proof();
    let inputs = public_signals.get();
    if !verifier.verify_proof(proof, &inputs) {
        return Err(ContractError::InvalidProof {});
    };

    // 4. Store nullifier hash to nullifier_hashes map
    NULLIFIER_HASHES
        .save(deps.storage, msg.nullifier_hash, &true)
        .unwrap();

    // 5. Send the funds (assume contract 10 JUNO, 1% fee held by contract + msg.fee to relayer)

    let mut msgs: Vec<BankMsg> = vec![];

    let amount_to_recipient = match U128::from(9_900_000_000_u128).checked_sub(msg.fee) {
        Ok(v) => v,
        Err(err) => {
            return Err(ContractError::FeesTooHigh {
                msg: err.to_string(),
            })
        }
    };

    msgs.push(BankMsg::Send {
        to_address: recipient.to_string(),
        amount: vec![Coin {
            denom: JUNO.to_string(),
            amount: amount_to_recipient,
        }],
    });
    if !msg.fee.is_zero() {
        msgs.push(BankMsg::Send {
            to_address: "juno1gpwekludv6vu8pkpnp2hwwf7f84a7mcvgm9t2cvp92hvpxk07kdq8z4xj2"
                .to_string(),
            amount: vec![Coin {
                denom: JUNO.to_string(),
                amount: msg.fee,
            }],
        });
    }
    let new_counter = COUNTER.load(deps.storage)? + 1;
    COUNTER.save(deps.storage, &new_counter)?;

    Ok(Response::new()
        .add_messages(msgs)
        .add_attribute("action", "withdraw"))
}

fn execute_admin_withdraw(
    deps: DepsMut,
    env: Env,
    _info: MessageInfo,
    _msg: AdminMsg,
) -> Result<Response, ContractError> {
    let counter_check = COUNTER.load(deps.storage)?;
    let withdrawal_amount = U128::from(counter_check * 100_000_000);
    //go through balances owned by contract, check greater than withdraw, and send to ADMIN
    let balance = deps.querier.query_balance(env.contract.address, JUNO)?;
    if withdrawal_amount > balance.amount {
        return Err(ContractError::ContractBalanceEmpty {
            amount: balance.amount,
        });
    }
    let bank_msg = BankMsg::Send {
        to_address: ADMIN.to_string(),
        amount: vec![Coin {
            denom: JUNO.to_string(),
            amount: withdrawal_amount,
        }],
    };
    COUNTER.save(deps.storage, &0)?;
    let resp = Response::new()
        .add_message(bank_msg)
        .add_attribute("action", "withdraw")
        .add_attribute("amount withdrawn", balance.to_string());
    Ok(resp)
}
