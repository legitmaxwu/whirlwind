import { Field, IField } from "@noble/curves/abstract/modular";
import { bn254 } from "@noble/curves/bn254";
import { PoseidonOpts, poseidon } from "@noble/curves/abstract/poseidon";
import { getMdsMatrix } from "./mdsMatrix";
import { getRoundConstants } from "./roundConstants";

const NUM_ROUNDS_P = [
  56, 57, 56, 60, 60, 63, 64, 63, 60, 66, 60, 65, 70, 60, 64, 68,
];

function toUint8Array(hexString: string) {
  if (hexString.startsWith("0x")) {
    hexString = hexString.slice(2);
  }
  return Uint8Array.from(Buffer.from(hexString, "hex"));
}

const convertToField = (field: IField<bigint>) => (input: string) => {
  return field.create(BigInt(input));
};

function getPoseidonOpts(numInputs: number): PoseidonOpts {
  const t = numInputs + 1;
  const nRoundsFull = 8;
  const nRoundsPartial = NUM_ROUNDS_P[t - 2];

  const rawRoundConstants = getRoundConstants(t);
  // RawRoundConstants is length t * (nRoundsFull + nRoundsPartial). Convert to a matrix of length nRoundsFull + nRoundsPartial, each of length t
  const roundConstants = [];
  for (let i = 0; i < nRoundsFull + nRoundsPartial; i++) {
    const firstValue = rawRoundConstants[i * t];
    const secondValue = rawRoundConstants[i * t + 1];
    const thirdValue = rawRoundConstants[i * t + 2];
    roundConstants.push([firstValue, secondValue, thirdValue]);
  }
  // console.log(rawRoundConstants.length);
  // console.log(roundConstants.length, "x", roundConstants[0].length);

  // console.log("t: " + t);
  // console.log("nRoundsFull: " + nRoundsFull);
  // console.log("nRoundsPartial: " + nRoundsPartial);
  // console.log(roundConstants);

  return {
    Fp: bn254.CURVE.Fp,
    t: t,
    roundsFull: nRoundsFull,
    roundsPartial: nRoundsPartial,
    // reversePartialPowIdx: true,
    // sboxPower and reversePartialPowIdx can be left as default, i.e., not provided
    mds: getMdsMatrix(t).map((i) => i.map(convertToField(bn254.CURVE.Fp))),
    roundConstants: roundConstants.map((i) =>
      i.map(convertToField(bn254.CURVE.Fp))
    ),
  };
}

export function poseidonHash(inputs: string[]) {
  const opts = getPoseidonOpts(inputs.length);
  const instance = poseidon(opts);
  const finalInput = [opts.Fp.ZERO, ...inputs.map(convertToField(opts.Fp))];

  const outputs = instance(finalInput);

  console.log(outputs);
  console.log(outputs[0].toString());
  return opts.Fp.create(outputs[0]).toString();
  // // Mix the outputs
  // let lc = BigInt(0);
  // for (let i = 0; i < opts.t; i++) {
  //   const matrixItem = opts.mds[i][0];
  //   lc = opts.Fp.add(opts.Fp.mul(matrixItem, outputs[i]), lc);
  // }
}
