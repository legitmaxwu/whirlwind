pragma circom 2.0.0;

include "../circomlib/circuits/poseidon.circom";

template Deposit() {
  // Private
  signal input secret;

  // Public
  signal input walletAddress;
  signal input depositCredential;

  component depositCredentialHasher = Poseidon(2);
  depositCredentialHasher.inputs[0] <== walletAddress;
  depositCredentialHasher.inputs[1] <== secret;

  log("walletAddress", walletAddress);
  log("secret", secret);
  log("depositCredentialHasher.out", depositCredentialHasher.out);
  log("depositCredential", depositCredential);
  
  depositCredential === depositCredentialHasher.out;
}

component main {
    public [walletAddress, depositCredential]
} = Deposit();