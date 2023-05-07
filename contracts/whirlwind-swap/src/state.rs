use cw_storage_plus::{Item, Map};
use cosmwasm_std::{Uint128, Addr};
use lib::merkle_tree::MerkleTreeWithHistory;
use lib::verifier::Verifier;
use cosmwasm_schema::{cw_serde};

#[cw_serde]
pub enum Denom {
    Native(String),
    Cw20(Addr)
}

#[cw_serde]
pub struct DenomOwnership {
    pub amount: Uint128, 
    pub denom: Denom
}

pub const DEPOSIT_AMOUNT: Item<Uint128> = Item::new("deposit_amount");
pub const DEPOSIT_DENOM: Item<Denom> = Item::new("deposit_denom");

pub const VERIFIER: Item<Verifier> = Item::new("verifier");

pub const SWAP_DEPOSIT_VERIFIER: Item<Verifier> = Item::new("swap_deposit_verifier");
pub const SWAP_VERIFIER: Item<Verifier> = Item::new("swap_verifier");

// Deposit
pub const COMMITMENTS: Item<MerkleTreeWithHistory> = Item::new("commitments");
pub const NULLIFIER_HASHES: Map<String, bool> = Map::new("nullifier_hashes");

// Ownership hashes
pub const OWNERSHIP_HASHES: Map<String, (DenomOwnership, u32)> = Map::new("ownership_hashes");

#[cw_serde]
pub struct SwapContext {
    pub deposit_credential_hash: String,
    pub output_denom: Denom,
    pub counter: u32
}

// Reply context
pub const SWAP_CTX: Item<SwapContext> = Item::new("swap_ctx");
