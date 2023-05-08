# Getting Started

```
cargo build

cargo test
```

# Security

The contract fails if:

1. It does not preserve anonymity until withdrawal
2. You cannot track where the original depositor withdrew funds to (becoming a regulatory disaster)
3. User can steal pool's funds
4. Contract loses user's funds

Vectors of failure:
* SNARK verification. Each verifier has different risks associated
* Ownership hash tampering  
* Pool whitelisting and updates
* Withdrawals (is it correct to source)

# Future Optimizations

- Pool allowance list should be a Map
- Output denom should be inferred from the passed in routes
- Will Osmosis support CW-20s?
