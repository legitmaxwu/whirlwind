use cw_storage_plus::{Item, Map, Addr};
use lib::merkle_tree::MerkleTreeWithHistory;
use lib::verifier::Verifier;
use cw_serde::cw_serde;

#[cw_serde]
pub enum Denom {
    Native(String)
    Cw20(Addr)
}

#[cw_serde]
pub struct DenomOwnership {
    amount: Uint128, 
    denom: Denom
}

pub const DEPOSIT_AMOUNT: Item<Uint128> = Item::new("deposit_amount");
pub const DEPOSIT_DENOM: Item<Denom> = Item::new("deposit_denom");
pub const VERIFIER: Item<Verifier> = Item::new("verifier");

// Deposit
pub const COMMITMENTS: Item<MerkleTreeWithHistory> = Item::new("commitments");
pub const NULLIFIER_HASHES: Map<String, bool> = Map::new("nullifier_hashes");

// Ownership hashes
pub const OWNERSHIP_HASHES: Map<String, DenomOwnership> = Map::new("ownership_hashes");
