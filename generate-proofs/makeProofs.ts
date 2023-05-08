import * as snarkjs from "snarkjs";
import proofInputs from "../generate-data/outputs/proofInputs.json" assert { type: "json" };
import * as fs from "fs";

const makeProof = async (_proofInput: any, _wasm: string, _zkey: string) => {
  const result = await snarkjs.groth16.fullProve(_proofInput, _wasm, _zkey);
  return result;
};

function getFileNames(type: string) {
  const lower = type.toLowerCase();
  return {
    wasmFile: `../circuits/build/${lower}/${lower}_js/${lower}.wasm`,
    provingKeyFile: `../circuits/build/${lower}/${lower}.zkey`,
    verificationKeyFile: `../circuits/verification_keys/${lower}.vk.json`,
  };
}

async function main() {
  // Calculate witness

  const promises = Object.entries(proofInputs).map(([key, value]) => {
    const { wasmFile, provingKeyFile } = getFileNames(value.type);

    return makeProof(value.data, wasmFile, provingKeyFile);
  });

  const proofs = await Promise.all(promises);

  // save each file in key.json
  proofs.forEach((proof, i) => {
    //save proof
    const key = Object.keys(proofInputs)[i];
    const proofFile = `outputs/${key}.json`;
    const proofJson = JSON.stringify(proof, null, 2);
    fs.writeFileSync(proofFile, proofJson);
  });
}

await main().catch((err) => {
  console.error(err);
});
