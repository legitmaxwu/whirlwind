pragma circom 2.0.0;

include "../circomlib/circuits/poseidon.circom";

template Deposit() {
  // Private
  signal input secret;

  // Public
  signal input walletAddress;
  signal input credential;

  component credentialHasher = Poseidon(2);
  credentialHasher.inputs[0] <== walletAddress;
  credentialHasher.inputs[1] <== secret;

  // log("walletAddress", walletAddress);
  // log("secret", secret);
  // log("credentialHasher.out", credentialHasher.out);
  // log("credential", credential);

  credential === credentialHasher.out;
}

component main {
    public [walletAddress, credential]
} = Deposit();