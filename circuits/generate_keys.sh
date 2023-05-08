#!/bin/bash

contracts=("deposit" "migrate" "withdraw")

for contract in "${contracts[@]}"
do
    snarkjs groth16 setup build/$contract/$contract.r1cs powersOfTau28_hez_final_13.ptau build/$contract/$contract.zkey
    snarkjs zkey export verificationkey build/$contract/$contract.zkey verification_keys/$contract.vk.json
done
