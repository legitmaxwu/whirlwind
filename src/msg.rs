use cosmwasm_schema::{QueryResponses, cw_serde};
use lib::msg::CircomProof;
use cosmwasm_std::Uint128 as U128;

#[cw_serde]
pub struct InstantiateMsg {}

#[cw_serde]
pub struct DepositMsg {
    pub commitment: String,
}

#[cw_serde]
pub struct WithdrawMsg {
    pub proof: CircomProof,

    pub root: String,
    pub nullifier_hash: String,
    pub recipient: String,
    pub relayer: String,
    pub fee: U128,
}

#[cw_serde]
pub struct AdminMsg {}

#[cw_serde]
pub enum ExecuteMsg {
    Deposit(DepositMsg),
    Withdraw(WithdrawMsg),
    AdminWithdraw(AdminMsg),
}

#[cw_serde]
#[derive(QueryResponses)]

// #[cw_serde]

pub enum QueryMsg {
    #[returns(bool)]
    IsKnownRoot(IsKnownRootMsg),
}

#[cw_serde]
pub struct IsKnownRootMsg {
    pub root: String,
}
