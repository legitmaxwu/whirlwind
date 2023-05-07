use std::{str::FromStr, fs::File, process::Output, any::Any, collections::HashMap};
use serde::{Serialize, Deserialize};
use serde_json;
use std::io::Write;

use ark_bn254::Bn254;
use ark_circom::{CircomConfig, CircomBuilder};
use ark_groth16::Groth16;
use ark_std::rand::thread_rng;
use ark_crypto_primitives::snark::SNARK;
use lib::{poseidon::{Poseidon}, merkle_tree::MerkleTreeWithHistory};

type GrothBn = Groth16<Bn254>;

use cosmwasm_std::Uint256;

// pub fn calculate_merkle_path(
//     root: Uint256,
//     leaf: Uint256,
//     path: Vec<Uint256>
// ) -> 

fn U256(value: &str) -> Uint256 {
    Uint256::from_str(value).unwrap()
}


// Define multiple structs to hold the data you want to output
#[derive(Serialize, Deserialize)]
struct Deposit {
    walletAddress: String,
    secret: String,
    depositCredential: String,
}

#[derive(Serialize, Deserialize)]
struct Swap {
//       // Private
//   signal input walletAddress;
//   signal input secret;

//   // Public
//   signal input depositTreeRoot;
//   signal input pathElements[levels];
//   signal input pathIndices[levels];
//   signal input depositNullifier;
//   signal input nftCredential;
    walletAddress: String,
    secret: String,
    depositTreeRoot: String,
    pathElements: Vec<String>,
    pathIndices: Vec<String>,
    depositNullifier: String,
    nftCredential: String,
}

// Define a generic function to insert output data of any type into a HashMap
fn insert_output_data<T: 'static + Serialize >(output_map: &mut HashMap<String, serde_json::Value>, key: String, data: T) {
    let boxed_data: Box<T> = Box::new(data);
    let type_name = std::any::type_name::<T>();

    output_map.insert(key, serde_json::json!({
        "type": type_name.split("::").last().unwrap_or(type_name),
        "data": boxed_data,
    }));
}


pub fn poseidon_hash(inputs: Vec<Uint256>) -> Uint256 {
    let poseidon = Poseidon::new();

    // Convert each Uint256 to a [u8; 32]
    let mut input_vecs: Vec<[u8; 32]> = Vec::new();
    for inp in inputs {
        input_vecs.push(inp.to_le_bytes());
    }

    let res = poseidon.hash_as_u256(input_vecs).unwrap();
    return res;
}

fn main() {
    // Initialize a HashMap to hold the output data
    let mut output_map: HashMap<String, serde_json::Value> = HashMap::new();


    let wallet_address = U256("0");
    let secret = U256("0");
    let deposit_credential = poseidon_hash(vec![wallet_address, secret]);


    // Deposit
    insert_output_data(&mut output_map, "deposit1".to_string(), Deposit {
        walletAddress: wallet_address.to_string(),
        secret: secret.to_string(),
        depositCredential: deposit_credential.to_string()
    });

    // Swap

    let mut tree = MerkleTreeWithHistory::new(20);
    let (index, path_indices, path_elements) = tree.insert_and_return_path(&deposit_credential).unwrap();
    let root = tree.get_last_root();
    let depositNullifier = poseidon_hash(vec![deposit_credential, U256("1")]);
    let nftCredential = poseidon_hash(vec![deposit_credential, U256("2")]);
    insert_output_data(&mut output_map, "deposit2".to_string(), Swap {
        walletAddress: wallet_address.to_string(),
        secret: secret.to_string(),
        depositTreeRoot: root.to_string(),
        pathElements: path_elements.iter().map(|x| x.to_string()).collect(),
        pathIndices: path_indices.iter().map(|x| x.to_string()).collect(),
        depositNullifier: depositNullifier.to_string(),
        nftCredential: nftCredential.to_string(),
    });







    // Open a file for writing
    let mut file = File::create("outputs/proofInputs.json").unwrap();

    // Convert the output_data to a JSON string
    let output_json = serde_json::to_string(&output_map).unwrap();

    // Write the JSON string to the file
    file.write_all(output_json.as_bytes()).unwrap();


}
