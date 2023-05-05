pub mod merkle_tree;
pub mod msg;
pub mod verifier;

pub mod poseidon;

// #[macro_use]
// extern crate lazy_static;

// const VK_JSON_STR: &str = include_str!("../../circuits/build/verification_key.json");

// use serde::{Deserialize, Serialize};
// use ark_groth16::{prepare_verifying_key, verify_proof, PreparedVerifyingKey, Proof, VerifyingKey};

// use ark_bn254::Bn254;
// use std::str::FromStr;

// lazy_static! {
// static ref VK_JSON: crate::verifier::VerifyingKeyJson = serde_json::from_str(VK_JSON_STR).unwrap();
// static ref VK_JSON: serde_json::Value = serde_json::from_str(VK_JSON_STR).unwrap();

// static ref VK: VerifyingKey<Bn254> = crate::verifier::load_json_verification_key(&VK_JSON);

// static ref PVK: PreparedVerifyingKey<Bn254> = prepare_verifying_key(&VK);
// }

#[macro_export]
macro_rules! bignum {
    ($c0: expr) => {{
        use cosmwasm_std::Uint256 as U256;
        use std::str::FromStr;
        U256::from_str($c0).unwrap()
    }};
}

#[cfg(test)]
mod tests {
    use cosmwasm_std::Uint256 as U256;

    #[test]
    fn test_bignum() {
        assert_eq!(U256::from(5_u16), bignum!("5"));
        assert_ne!(U256::from(6_u16), bignum!("5"));

        let n = "21888242871839275222246405745257275088548364400416034343698204186575808495617";

        let b = bignum!(
            "21888242871839275222246405745257275088548364400416034343698204186575808495617"
        );

        assert_eq!(n, b.to_string());
    }
}
