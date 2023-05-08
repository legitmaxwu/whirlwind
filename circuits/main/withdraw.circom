pragma circom 2.0.0;

include "../circomlib/circuits/poseidon.circom";

template WithdrawNFT() {
  // Private
  signal input previousSecret;

  // Public
  signal input walletAddress;
  signal input previousNullifier;

  signal depositCredential;
  component depositCredentialHasher = Poseidon(3);
  depositCredentialHasher.inputs[0] <== walletAddress;
  depositCredentialHasher.inputs[1] <== previousSecret;
  depositCredentialHasher.inputs[2] <== 1;
  previousNullifier === depositCredentialHasher.out;
}

component main {
    public [walletAddress, previousNullifier]
} = WithdrawNFT();