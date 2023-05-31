<br/><br/>

<p align="center">
	<img src="/images/whirlwind-logo.png" width="400"/>
</p>
<p align="center">
  Tax-Compliant Private Trades on Osmosis. <a href="/papers/whirlwind.pdf">Paper</a>
<br/>
<br/>
<br/>
  
## Project Structure

- `web`: Web demo
- `contracts`: CosmWasm contracts
- `circuits`: Circom circuits, script for building proving/verification keys
- `generate-data`: Generate data for SNARK proofs
- `generate-proofs`: Generate SNARK proofs

## Overview

Whirlwind allows for temporarily private trades on Osmosis until withdrawal.
  
## Videos

- [Explainer](https://www.youtube.com/watch?v=VEml3-SGLaY)
- [Demo](https://www.youtube.com/watch?v=ykclf-4oNKY)

### Using Whirlwind
1. User deposits funds from main wallet into Whirlwind via an anonymity pool.
2. They can now swap privately using a burner wallet. (Link between wallets is hidden from public)
3. Once the user is done swapping, they may withdraw funds back to the main wallet. (At this stage the link between wallets is revealed)

<p align="center">
	<img src="/images/diagram.png" width="100%"/>
</p>

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

## Acknowledgements

- [webb.tools](https://webb.tools/)
- [gitopia.com/Juicer/juicy-10000](https://gitopia.com/Juicer/juicy-10000)
