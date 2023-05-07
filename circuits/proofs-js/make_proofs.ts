import * as snarkjs from "snarkjs";
import { poseidonHash } from "./poseidon";

const makeProof = async (_proofInput: any, _wasm: string, _zkey: string) => {
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    _proofInput,
    _wasm,
    _zkey
  );
  return { proof, publicSignals };
};

function convertStringToBigInt(inputString: string) {
  const buffer = Buffer.from(inputString);
  return BigInt("0x" + buffer.toString("hex")).toString();
}

async function main() {
  const wasmFile = "../build/deposit/deposit_js/deposit.wasm"; // Path to the wasm file
  const provingKeyFile = "../build/deposit/deposit.zkey"; // Path to the existing proving key
  const verificationKeyFile = "../build/deposit/deposit.vk.json"; // Path to the existing verification key

  const WALLET_ADDRESS = convertStringToBigInt("FUCK ME");
  const SECRET = convertStringToBigInt("FUCK YOU");

  console.log("Making inputs");
  // Calculate witness

  const SHITTER = "0";
  const input = {
    walletAddress: SHITTER,
    secret: SHITTER,
    depositCredential: poseidonHash([SHITTER, SHITTER]),
  };

  console.log(input);

  const result = await makeProof(input, wasmFile, provingKeyFile);
  console.log(result);
}

main().catch((err) => {
  console.log(err);
});
