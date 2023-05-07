use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::{Uint128};

#[cw_serde]
pub enum DenomUnvalidated {
    Native(String),
    Cw20(String)
}

#[cw_serde]
pub struct InstantiateMsg {
    pub amount: Uint128, 
    pub denom: DenomUnvalidated,

    pub vk_deposit: String,
    pub vk_swap_deposit: String,
    pub vk_swap: String,
    pub vk_withdraw: String
}

#[cw_serde]
pub enum ExecuteMsg {
    Deposit {
        proof: String,
        deposit_credential: String,
        withdraw_addr: String    
    },
    SwapDeposit {},
    Swap {
        input_amount: Uint128,
        output_denom: DenomUnvalidated
    },
    Withdraw {}
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {}
