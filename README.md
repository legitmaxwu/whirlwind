<br/><br/>

<p align="center">
	<img src="/whirlwind-logo.png" width="400"/>
</p>
<p align="center">
  Tax-Compliant Private Trades on Osmosis
<br/>

## Getting Started

```
cargo build

cargo test
```

## Security

The contract fails if:

1. It does not preserve anonymity until withdrawal
2. You cannot track where the original depositor withdrew funds to (becoming a regulatory disaster)
3. User can steal pool's funds
4. Contract loses user's funds

Vectors of failure:

- SNARK verification. Each verifier has different risks associated
- Ownership hash tampering
- Pool whitelisting and updates
- Withdrawals (is it correct to source)

## Future Work

- Output denom should be inferred from the passed in routes
- Will Osmosis support CW-20s?
- Bigger root history size
- Handle any string for wallet address input
