pragma circom 2.0.0;

include "../circomlib/circuits/poseidon.circom";
include "../lib/merkleTree.circom";

template Swap(levels) {
  // Private
  signal input walletAddress;
  signal input secret;

  // Public
  signal input depositTreeRoot;
  signal input pathElements[levels];
  signal input pathIndices[levels];
  signal input depositNullifier;
  signal input nftCredential;

  signal depositCredential;
  component depositCredentialHasher = Poseidon(2);
  depositCredentialHasher.inputs[0] <== walletAddress;
  depositCredentialHasher.inputs[1] <== secret;
  depositCredential <== depositCredentialHasher.out;

  component depositNullifierHasher = Poseidon(2);
  depositNullifierHasher.inputs[0] <== depositCredential;
  depositNullifierHasher.inputs[1] <== 1;
  depositNullifier === depositNullifierHasher.out;

  component nftCredentialHasher = Poseidon(2);
  nftCredentialHasher.inputs[0] <== depositCredential;
  nftCredentialHasher.inputs[1] <== 2;
  nftCredential === nftCredentialHasher.out;

  component tree = MerkleTreeChecker(levels);
  tree.leaf <== depositCredential;
  tree.root <== depositTreeRoot;
  for (var i = 0; i < levels; i++) {
      tree.pathElements[i] <== pathElements[i];
      tree.pathIndices[i] <== pathIndices[i];
  }
}

component main {
    public [depositTreeRoot, depositNullifier, nftCredential]
} = Swap(20);