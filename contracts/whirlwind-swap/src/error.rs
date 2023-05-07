use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Unauthorized")]
    Unauthorized {},
    // Add any other custom errors you like here.
    // Look at https://docs.rs/thiserror/1.0.21/thiserror/ for details.

    #[error("Invalid commitment")]
    InvalidCommitment {},

    #[error("Invalid deposit")]
    InvalidDeposit {},

    #[error("Duplicate commitment")]
    DuplicateCommitment {},

    #[error("Unknown root")]
    UnknownRoot {},

    #[error("Invalid proof")]
    InvalidProof {},

    #[error("Invalid deposit credential")]
    InvalidDepositCredential {},
}
