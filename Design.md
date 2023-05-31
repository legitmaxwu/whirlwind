# Whirlwind Swap Usage

# Demo
Organization is a hedge fund manage multiple traders
and multi-sigs. Traders get privacy through controller 
accounts.

The fund is a DAO or multi-sig that will first deposit to the 
Whirlwind pool. Then migrates the deposit anonymously to controller 
accounts controlled by traders or multi-sigs, depending on the institution's
preferences.

The controller accounts can make swaps through only Osmosis, and withdrawals
can only go back to the original DAO Treasury. Even if the zk-secret
is compromised post-migration, all the attacker can do is make withdrawals. 

## Overview

- Assume Alice, Bob, and Carol manage Fund F.
- Assume Joe is a trade in Fund F.

## Deposit

- Alice, Bob, and Carol agree to deposit 1,000 USDC from their multisig wallet into Whirlwind.
- They use MPC to calculate the credential and generate a deposit proof. Each holds onto their share of the secret s.
  - First use MPC to calculate the credential (C = f(secret, withdraw_address))
  - Use MPC to generate the deposit proof (Proof = f(secret, withdraw_address, C))

## Migrate

- Alice, Bob, and Carol can each hand Joe their shares.
- Joe has everything he needs to create the migration proof
