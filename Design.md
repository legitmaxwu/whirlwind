# Whirlwind Swap Usage

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
