pragma circom 2.0.0;

include "../circomlib/circuits/poseidon.circom";
include "../circomlib/circuits/comparators.circom";
include "../circomlib/circuits/gates.circom";
include "../lib/merkleTree.circom";

template Swap(merkleTreeHeight) {
  // Private
  signal input walletAddress;
  signal input secret;
  signal input previousSecret;
  signal input pathElements[merkleTreeHeight];
  signal input pathIndices[merkleTreeHeight];

  // Public
  signal input depositTreeRoot;
  signal input nullifier;
  signal input previousNullifier;

  // Verify membership of deposit credential in the deposit tree
  signal depositCredential;
  component depositCredentialHasher = Poseidon(2);
  depositCredentialHasher.inputs[0] <== walletAddress;
  depositCredentialHasher.inputs[1] <== secret;
  depositCredential <== depositCredentialHasher.out;

  component tree = MerkleTreeChecker(merkleTreeHeight);
  tree.leaf <== depositCredential;
  tree.root <== depositTreeRoot;
  for (var i = 0; i < merkleTreeHeight; i++) {
      tree.pathElements[i] <== pathElements[i];
      tree.pathIndices[i] <== pathIndices[i];
  }

  // Verify nullifier calculation
  component nullifierHasher = Poseidon(3);
  nullifierHasher.inputs[0] <== walletAddress;
  nullifierHasher.inputs[1] <== secret;
  nullifierHasher.inputs[2] <== 1;
  nullifier === nullifierHasher.out;

  // Verify previous nullifier calculation
  signal calculatedPreviousNullifier;
  component previousNullifierHasher = Poseidon(3);
  previousNullifierHasher.inputs[0] <== walletAddress;
  previousNullifierHasher.inputs[1] <== previousSecret;
  previousNullifierHasher.inputs[2] <== 1;
  calculatedPreviousNullifier <== previousNullifierHasher.out;

  // Check that the previous nullifier is either the calculated one or 0.
  component eq1 = IsEqual();
  eq1.in[0] <== previousNullifier;
  eq1.in[1] <== 0;

  component eq2 = IsEqual();
  eq2.in[1] <== previousNullifier;
  eq2.in[0] <== calculatedPreviousNullifier;

  component orGate = OR();
  orGate.a <== eq1.out;
  orGate.b <== eq2.out;
  orGate.out === 1;
}

component main {
    public [depositTreeRoot, nullifier, previousNullifier]
} = Swap(20);