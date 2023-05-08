pragma circom 2.0.0;

include "../circomlib/circuits/poseidon.circom";

template SwapNFT() {
  // Private
  signal input secret;
  signal input walletAddress;
  signal input n;

  // Public
  signal input nftCredential;
  signal input newNftCredential;

  signal depositCredential;
  component depositCredentialHasher = Poseidon(2);
  depositCredentialHasher.inputs[0] <== walletAddress;
  depositCredentialHasher.inputs[1] <== secret;
  depositCredential <== depositCredentialHasher.out;

  component nftCredentialHasher = Poseidon(2);
  nftCredentialHasher.inputs[0] <== depositCredential;
  nftCredentialHasher.inputs[1] <== n;
  nftCredential === nftCredentialHasher.out;

  component newNftCredentialHasher = Poseidon(2);
  newNftCredentialHasher.inputs[0] <== depositCredential;
  newNftCredentialHasher.inputs[1] <== n + 1;
  newNftCredential === newNftCredentialHasher.out;
}

component main {
    public [nftCredential, newNftCredential]
} = SwapNFT();