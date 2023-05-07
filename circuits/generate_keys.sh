#!/bin/bash

contracts=("deposit" "swap" "withdraw" "swap_nft" "withdraw_nft")

for contract in "${contracts[@]}"
do
    snarkjs groth16 setup build/$contract/$contract.r1cs powersOfTau28_hez_final_13.ptau build/$contract/$contract.zkey
    snarkjs zkey export verificationkey build/$contract/$contract.zkey build/$contract/$contract.vk.json
done
