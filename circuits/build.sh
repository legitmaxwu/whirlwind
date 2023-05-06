mkdir -p contract_build/deposit
mkdir -p contract_build/swap
mkdir -p contract_build/withdraw
mkdir -p contract_build/swap_nft
mkdir -p contract_build/withdraw_nft

circom contract_deposit.circom --r1cs --wasm  --sym --json --inspect -o contract_build/deposit
circom contract_swap.circom --r1cs --wasm  --sym --json --inspect -o contract_build/swap
circom contract_withdraw.circom --r1cs --wasm  --sym --json --inspect -o contract_build/withdraw
circom contract_swap_nft.circom --r1cs --wasm  --sym --json --inspect -o contract_build/swap_nft
circom contract_withdraw_nft.circom --r1cs --wasm  --sym --json --inspect -o contract_build/withdraw_nft