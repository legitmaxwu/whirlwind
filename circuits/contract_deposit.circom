pragma circom 2.0.0;

include "./circomlib/circuits/poseidon.circom";

template Deposit() {
  // Private
  signal input secret;

  // Public
  signal input walletAddress;
  signal input depositCredential;

  component depositCredentialHasher = Poseidon(2);
  depositCredentialHasher.inputs[0] <== walletAddress;
  depositCredentialHasher.inputs[1] <== secret;
  depositCredential === depositCredentialHasher.out;
}

component main {
    public [walletAddress, depositCredential]
} = Deposit();