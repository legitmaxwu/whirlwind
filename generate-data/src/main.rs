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
    // Private
    secret: String,
    // Public
    walletAddress: String,
    credential: String,
}

#[derive(Serialize, Deserialize)]
struct Migrate {
    // Private
    walletAddress: String,
    secret: String,
    previousSecret: String,
    pathElements: Vec<String>,
    pathIndices: Vec<String>,
    // Public
    depositTreeRoot: String,
    nullifier: String,
    previousNullifier: String,
}

#[derive(Serialize, Deserialize)]
struct Withdraw {
    // Private
    walletAddress: String,
    previousSecret: String,
    // Public
    previousNullifier: String,
}

#[derive(Serialize, Deserialize)]
struct Swap {
    // Private
    secret: String,
    walletAddress: String,
    n: String,

    // Public
    nftCredential: String,
    newNftCredential: String,
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


    let wallet_address = U256("1337");
    let secret = U256("8000");
    let previousSecret = U256("8001");
    let credential = poseidon_hash(vec![wallet_address, secret]);
    let nullifier = poseidon_hash(vec![wallet_address, secret, U256("1")]);
    let previousCredential = poseidon_hash(vec![wallet_address, previousSecret]);
    let previousNullifier = poseidon_hash(vec![wallet_address, previousSecret, U256("1")]);
    let mut tree = MerkleTreeWithHistory::new(20);
    let (index, path_indices, path_elements) = tree.insert_and_return_path(&credential).unwrap();
    let root = tree.get_last_root();


    // Deposit
    insert_output_data(&mut output_map, "deposit1".to_string(), Deposit {
        walletAddress: wallet_address.to_string(),
        secret: secret.to_string(),
        credential: credential.to_string()
    });

    // Migrate


    insert_output_data(&mut output_map, "migrate1".to_string(), Migrate {
        walletAddress: wallet_address.to_string(),
        secret: secret.to_string(),
        previousSecret: previousSecret.to_string(),
        pathElements: path_elements.iter().map(|x| x.to_string()).collect(),
        pathIndices: path_indices.iter().map(|x| x.to_string()).collect(),
        depositTreeRoot: root.to_string(),
        nullifier: nullifier.to_string(),
        previousNullifier: previousNullifier.to_string(),
    });

    // Swap
    let n = U256("2");
    let nPlusOne = U256("3");
    let nftCredential = poseidon_hash(vec![credential, n]);
    let newNftCredential = poseidon_hash(vec![credential, nPlusOne]);
    insert_output_data(&mut output_map, "swap1".to_string(), Swap {
        secret: secret.to_string(),
        walletAddress: wallet_address.to_string(),
        n: n.to_string(),
        nftCredential: nftCredential.to_string(),
        newNftCredential: newNftCredential.to_string(),
    });

    // Withdraw
    let n = U256("3");
    let nftCredential = poseidon_hash(vec![credential, n]);
    insert_output_data(&mut output_map, "withdraw1".to_string(), Withdraw {
        walletAddress: wallet_address.to_string(),
        previousSecret: previousSecret.to_string(),
        previousNullifier: previousNullifier.to_string(),
    });


    // Open a file for writing
    let mut file = File::create("outputs/proofInputs.json").unwrap();

    // Convert the output_data to a JSON string
    let output_json = serde_json::to_string_pretty(&output_map).unwrap();

    // Write the JSON string to the file
    file.write_all(output_json.as_bytes()).unwrap();


}
