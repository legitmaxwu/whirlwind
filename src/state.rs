use cw_storage_plus::{Item, Map};
use lib::merkle_tree::MerkleTreeWithHistory;
use lib::verifier::Verifier;

pub const COUNTER: Item<u64> = Item::new("counter");
pub const VERIFIER: Item<Verifier> = Item::new("verifier");
pub const COMMITMENTS: Item<MerkleTreeWithHistory> = Item::new("commitments");
pub const NULLIFIER_HASHES: Map<String, bool> = Map::new("nullifier_hashes");
