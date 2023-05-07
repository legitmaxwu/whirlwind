pragma circom 2.0.0;

include "../circomlib/circuits/poseidon.circom";

template WithdrawNFT() {
  // Private
  signal input secret;
  signal input n;

  // Public
  signal input walletAddress;
  signal input nftCredential;

  signal depositCredential;
  component depositCredentialHasher = Poseidon(2);
  depositCredentialHasher.inputs[0] <== walletAddress;
  depositCredentialHasher.inputs[1] <== secret;
  depositCredential <== depositCredentialHasher.out;

  component nftCredentialHasher = Poseidon(2);
  nftCredentialHasher.inputs[0] <== depositCredential;
  nftCredentialHasher.inputs[1] <== n;
  nftCredential === nftCredentialHasher.out;
}

component main {
    public [walletAddress, nftCredential]
} = WithdrawNFT();