use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::{Coin, Uint128};
use lib::msg::CircomProof;

use crate::state::Denom;

#[cw_serde]
pub enum DenomUnvalidated {
    Native(String),
    Cw20(String),
}

#[cw_serde]
pub struct InstantiateMsg {
    pub amount: Uint128,
    pub denom: DenomUnvalidated,

    pub pool_admin: Option<String>,
    pub allowed_pools: Vec<String>,

    pub vk_deposit: String,
    pub vk_swap_deposit: String,
    pub vk_swap: String,
    pub vk_withdraw: String,
}

#[cw_serde]
pub enum ExecuteMsg {
    Deposit {
        proof: CircomProof,
        deposit_credential: String,
        withdraw_addr: String,
    },
    MigrateDeposit {
        proof: CircomProof,
        root: String,
        nullifier_hash: String,
        deposit_credential_hash: String,
    },
    Swap {
        proof: CircomProof,
        deposit_credential_hash: String,
        new_deposit_credential_hash: String,
        routes: Vec<OsmosisRoute>,
        min_output: Uint128,
        output_denom: DenomUnvalidated,
    },
    Withdraw {
        proof: CircomProof,
        withdraw_addr: String,
        deposit_credential_hash: String,
    },
    UpdateAllowedPools {
        pools: Vec<String>,
    },
}

#[cw_serde]
pub struct OwnershipResponse {
    pub amount: Uint128,
    pub denom: Denom,
    pub counter: u32,
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    // Get ownership and counter
    #[returns(OwnershipResponse)]
    GetOwnership { deposit_credential_hash: String },
}

// MARK: Osmosis Messages

#[cw_serde]
pub struct OsmosisRoute {
    pub pool_id: String,
    pub token_out_denom: String,
}

#[cw_serde]
pub struct OsmosisSwapValue {
    pub routes: Vec<OsmosisRoute>,
    pub sender: String,
    pub token_in: Coin,
    pub token_out_min_amount: Uint128,
}

#[cw_serde]
pub struct OsmosisSwap {
    #[serde(rename = "type")]
    pub _type: String,
    pub value: OsmosisSwapValue,
}
