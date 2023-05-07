use std::str::FromStr;

#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult, Uint256, Uint128, CosmosMsg, WasmMsg, to_binary};
use cw2::set_contract_version;
use cw20::Cw20ExecuteMsg;

use crate::error::ContractError;
use crate::msg::{DenomUnvalidated, ExecuteMsg, InstantiateMsg, QueryMsg};
use crate::state::{Denom, COMMITMENTS, DEPOSIT_AMOUNT, DEPOSIT_DENOM, VERIFIER};
use lib::merkle_tree::MerkleTreeWithHistory;
use lib::verifier::Verifier;

// version info for migration info
const CONTRACT_NAME: &str = "crates.io:whirlwind";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

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

    let verifier = Verifier::new();
    VERIFIER.save(deps.storage, &verifier)?;

    let tree = MerkleTreeWithHistory::new(20);
    COMMITMENTS.save(deps.storage, &tree)?;

    Ok(Response::default())
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    _deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    _msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    unimplemented!()
}

pub fn execute_deposit(
    deps: DepsMut,
    info: MessageInfo,
    env: Env,
    commitment: String 
) -> Result<Response, ContractError> {
    // confirm deposit amount and denom
    let deposit_amount = DEPOSIT_AMOUNT.load(deps.storage)?;
    let deposit_denom = DEPOSIT_DENOM.load(deps.storage)?;
    let mut msgs: Vec<CosmosMsg> = vec![];
    match deposit_denom {
        Denom::Native(denom) => {
            if info.funds.len() != 1 {
                return Err(ContractError::InvalidDeposit {  });
            }
            if info.funds[0].amount != deposit_amount {
                return Err(ContractError::InvalidDeposit {  });
            }
            if info.funds[0].denom != denom {
                return Err(ContractError::InvalidDeposit {  });
            }
        },
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

    let mut commitment_mt = COMMITMENTS.load(deps.storage)?;
    // confirm insert worked
    let success = commitment_mt.insert(&Uint256::from_str(&commitment)?); 
    if success.is_none() {
        return Err(ContractError::InvalidCommitment {  });
    }

    COMMITMENTS.save(deps.storage, &commitment_mt)?;

    Ok(Response::new()
        .add_messages(msgs)
        .add_attribute("action", "deposit")
        .add_attribute("from", info.sender))
}

pub fn execute_swap_deposit(
    deps: DepsMut, 
    info: MessageInfo
) -> Result<Response, ContractError> {
    unimplemented!()
}

pub fn execute_swap(
    deps: DepsMut, 
    info: MessageInfo
) -> Result<Response, ContractError> {
    unimplemented!()
}

pub fn execute_withdraw(
    deps: DepsMut, 
    info: MessageInfo
) -> Result<Response, ContractError> {
    unimplemented!()
}

pub fn get_osmosis_swap_msg(
    input_amount: Uint128,
    input_denom: Denom,
    min_output: Uint128,
    output_denom: Denom
) -> Result<Response, ContractError> {
    unimplemented!()
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(_deps: Deps, _env: Env, _msg: QueryMsg) -> StdResult<Binary> {
    unimplemented!()
}

#[cfg(test)]
mod tests {}
