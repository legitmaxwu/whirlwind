#!/bin/bash

contracts=("deposit" "swap" "withdraw" "swap_nft" "withdraw_nft")

for contract in "${contracts[@]}"
do
  mkdir -p "build/$contract"
  circom "main/$contract.circom" --r1cs --wasm --sym --json --inspect -o "build/$contract"
done
