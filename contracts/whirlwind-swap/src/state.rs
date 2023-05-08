use cw_storage_plus::{Item, Map};
use cosmwasm_std::{Uint128, Addr, Uint256};
use lib::merkle_tree::MerkleTreeWithHistory;
use lib::verifier::Verifier;
use cosmwasm_schema::{cw_serde};

#[cw_serde]
pub enum Denom {
    Native(String),
    Cw20(Addr)
}

#[cw_serde]
pub struct AmountDenom {
    pub amount: Uint128, 
    pub denom: Denom
}

pub const DEPOSIT_AMOUNT: Item<Uint128> = Item::new("deposit_amount");
pub const DEPOSIT_DENOM: Item<Denom> = Item::new("deposit_denom");

// Verifiers
pub const DEPOSIT_VERIFIER: Item<Verifier> = Item::new("verifier");
pub const MIGRATE_VERIFIER: Item<Verifier> = Item::new("migrate_verifier");
pub const WITHDRAW_VERIFIER: Item<Verifier> = Item::new("withdraw_verifier");

// Deposit
pub const COMMITMENTS: Item<MerkleTreeWithHistory> = Item::new("commitments");
pub const NULLIFIERS: Map<String, bool> = Map::new("nullifier_hashes");

// Pools need allowance list to prevent minting a new coin in Frontier
// and exiting liquidity anonymously
pub const POOL_ADMIN: Item<Addr> = Item::new("admin");
pub const ALLOWED_POOLS: Item<Vec<String>> = Item::new("allowed_pools"); 

// Locked balances and previous nullifiers
pub const MAP_ADDR_TO_PREVIOUS_NULLIFIER: Map<Addr, Uint256> = Map::new("map_addr_to_previous_nullifier");
pub const MAP_ADDR_TO_LOCKED_BALANCES: Map<Addr, Vec<AmountDenom>> = Map::new("map_addr_to_locked_balance");

#[cw_serde]
pub struct SwapContext {
    pub swapper_addr: Addr,
    pub output_balance_before_swap: Uint128,
    pub output_denom: Denom,
}

// Reply context
pub const SWAP_CTX: Item<SwapContext> = Item::new("swap_ctx");
