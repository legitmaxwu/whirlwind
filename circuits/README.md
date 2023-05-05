# Circuits

## This is circom circuits use for juno juicer

:warning: This circuits is unaudited

## Build

First, you must have the Circom 2 compiler installed. See [installation
instructions](https://docs.circom.io/getting-started/installation/) for details.

The build step compiles the circuit, does untrusted setup, generates verifier contract, and compiles all the contracts. It could take a while at the setup step.

```sh
circom withdraw.circom --r1cs --wasm  --sym --json --inspect -o build
```

Then you need to prepare and execute a phase 2 ceremony, more informations [here](https://github.com/iden3/snarkjs)
