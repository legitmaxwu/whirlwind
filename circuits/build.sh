#!/bin/bash

contracts=("deposit" "migrate" "swap" "withdraw")

for contract in "${contracts[@]}"
do
  mkdir -p "build/$contract"
  circom "main/$contract.circom" --r1cs --wasm --sym --json --inspect -o "build/$contract"
done
