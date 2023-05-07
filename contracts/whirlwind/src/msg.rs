use cosmwasm_schema::{cw_serde, QueryResponses};

#[cw_serde]
pub struct DenomUnvalidated {
    Native(String)
    Cw20(String)
}

#[cw_serde]
pub struct InstantiateMsg {
    amount: Uint128, 
    denom: DenomUnvalidated
}

#[cw_serde]
pub enum ExecuteMsg {
    Deposit {}
    SwapDeposit {}
    Swap {
        input_amount: Uint128,
        output_denom: DenomUnvalidated
    }  
    Withdraw {}
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {}
