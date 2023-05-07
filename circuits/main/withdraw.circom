pragma circom 2.0.0;

include "../circomlib/circuits/poseidon.circom";
include "../lib/merkleTree.circom";

template Withdraw(levels) {
  // Private
  signal input walletAddress;
  signal input secret;

  // Public
  signal input depositTreeRoot;
  signal input pathElements[levels];
  signal input pathIndices[levels];

  signal depositCredential;
  component depositCredentialHasher = Poseidon(2);
  depositCredentialHasher.inputs[0] <== walletAddress;
  depositCredentialHasher.inputs[1] <== secret;
  depositCredential <== depositCredentialHasher.out;

  component tree = MerkleTreeChecker(levels);
  tree.leaf <== depositCredential;
  tree.root <== depositTreeRoot;
  for (var i = 0; i < levels; i++) {
      tree.pathElements[i] <== pathElements[i];
      tree.pathIndices[i] <== pathIndices[i];
  }
}

component main {
    public [depositTreeRoot, pathElements, pathIndices]
} = Withdraw(20);