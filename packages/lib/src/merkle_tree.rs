#![allow(non_snake_case)]

use crate::bignum;
use crate::poseidon::Poseidon;
use cosmwasm_std::Uint256 as U256;

use serde::{Deserialize, Serialize};

const ROOT_HISTORY_SIZE: u32 = 100;

#[derive(Default, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct MerkleTreeWithHistory {
    pub levels: u32,
    pub filled_subtrees: Vec<U256>,
    pub zeros: Vec<U256>,
    pub current_root_index: u32,
    pub next_index: u32,
    pub roots: Vec<U256>,

    pub ZERO_VALUE: U256,
}

impl MerkleTreeWithHistory {
    pub fn new(levels: u32) -> Self {
        let mut this: Self = Default::default();
        assert!(levels > 0, "_treeLevels should be greater than zero");
        assert!(levels < 32, "_treeLevels should be less than 32");

        let ZERO_VALUE = bignum!(
            "21663839004416932945382355908790599225266501822907911457504978515578255421292"
        );

        this.levels = levels;
        this.roots = vec![U256::zero(); ROOT_HISTORY_SIZE as usize];

        this.ZERO_VALUE = ZERO_VALUE;

        let mut current_zero = ZERO_VALUE;
        this.zeros.push(current_zero);
        this.filled_subtrees.push(current_zero);

        for _ in 1..levels {
            current_zero = this.hash_left_right(&current_zero, &current_zero);
            this.zeros.push(current_zero);
            this.filled_subtrees.push(current_zero);
        }

        this.roots[0] = this.hash_left_right(&current_zero, &current_zero);
        this
    }

    pub fn hash_left_right(&self, left: &U256, right: &U256) -> U256 {
        let poseidon = Poseidon::new();
        // let mut left_bytes: [u8; 32] = [0; 32];
        // let mut right_bytes: [u8; 32] = [0; 32];

        let left_bytes = left.to_le_bytes();
        let right_bytes = right.to_le_bytes();

        let inputs = vec![left_bytes, right_bytes];

        poseidon.hash_as_u256(inputs).unwrap()
    }

    pub fn insert(&mut self, leaf: &U256) -> Option<u32> {
        let mut idx = self.next_index;
        if idx == 2_u32.saturating_pow(self.levels) {
            //"Merkle tree is full. No more leafs can be added");
            return None;
        }

        self.next_index += 1;
        let mut current_level_hash: U256 = *leaf;
        let mut left: &U256;
        let mut right: &U256;

        for i in 0..(self.levels) {
            if idx % 2 == 0 {
                println!("level: {}. left", idx);

                left = &current_level_hash;
                right = &self.zeros[i as usize];

                println!("current_level_hash: {}", right);


                self.filled_subtrees[i as usize] = current_level_hash;
            } else {
                println!("level: {}. right", idx);

                left = &self.filled_subtrees[i as usize];
                right = &current_level_hash;

                println!("current_level_hash: {}", left);

            }

            current_level_hash = self.hash_left_right(left, right);


            idx /= 2;
        }
        println!("root: {}", current_level_hash);

        println!("\n\n\n\n");




        self.current_root_index = (self.current_root_index + 1) % ROOT_HISTORY_SIZE;
        self.roots[self.current_root_index as usize] = current_level_hash;

        Some(self.next_index - 1)
    }

    pub fn is_known_root(&self, root: &U256) -> bool {
        if root == &U256::zero() {
            return false;
        }
        let mut i = self.current_root_index;

        for _ in 0..ROOT_HISTORY_SIZE {
            if *root == self.roots[i as usize] {
                return true;
            }
            if i == 0 {
                i = ROOT_HISTORY_SIZE;
            }

            i -= 1;

            if i == self.current_root_index {
                break;
            }
        }

        false
    }

    pub fn get_last_root(&self) -> U256 {
        self.roots[self.current_root_index as usize]
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use cosmwasm_std::Uint256 as U256;

    #[test]
    fn test_merkletree_new() {
        let mt = MerkleTreeWithHistory::new(16);
        assert_eq!(mt.filled_subtrees[0], mt.ZERO_VALUE);
        assert_eq!(mt.zeros[0], mt.ZERO_VALUE);
    }

    #[test]
    fn test_merkletree_root() {
        let mt = MerkleTreeWithHistory::new(20);
        assert_eq!(mt.filled_subtrees[0], mt.ZERO_VALUE);
        assert_eq!(mt.zeros[0], mt.ZERO_VALUE);

        assert_eq!(
            mt.get_last_root(),
            bignum!(
                "19476726467694243150694636071195943429153087843379888650723427850220480216251"
            )
        )
    }

    #[test]
    fn test_merkletree_insert_single_01() {
        let mut mt = MerkleTreeWithHistory::new(20);
        mt.insert(&U256::from(42_u32));
        let expected = bignum!(
            "13801027358871474054350913888493740197706640469969388660938924863508695867545"
        );
        let root = mt.get_last_root();
        assert_eq!(root, expected);
    }

    }
