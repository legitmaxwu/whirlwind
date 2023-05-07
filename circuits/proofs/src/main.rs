use ark_bn254::Bn254;
use ark_circom::{CircomConfig, CircomBuilder};
use ark_groth16::Groth16;
use ark_std::rand::thread_rng;
use ark_crypto_primitives::snark::SNARK;
use lib::poseidon::{ Poseidon};

type GrothBn = Groth16<Bn254>;



fn main() {
    let poseidon = Poseidon::new();
    let mut left_bytes: [u8; 32] = [0; 32];
    let mut right_bytes: [u8; 32] = [0; 32];


    let inputs = vec![left_bytes, right_bytes];

    let result = poseidon.hash_as_u256(inputs).unwrap();

    println!("result: {:?}", result);


    // let cfg = CircomConfig::<Bn254>::new(
    //     "../build/deposit/deposit_js/deposit.wasm",
    //     "../build/deposit/deposit.r1cs",
    // ).unwrap();
    // let mut builder = CircomBuilder::new(cfg);
    // builder.push_input("a", 3);
    // builder.push_input("b", 11);

    // // create an empty instance for setting it up
    // let circom = builder.setup();

    // let mut rng = thread_rng();
    // let params = GrothBn::generate_random_parameters_with_reduction(circom, &mut rng).unwrap();

    // let circom = builder.build().unwrap();

    // let inputs = circom.get_public_inputs().unwrap();

    // println!("inputs: {:?}", inputs);

    // let proof = GrothBn::prove(&params, circom, &mut rng).unwrap();

    // println!("proof: {:?}", proof);
}
