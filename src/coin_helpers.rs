use crate::error::ContractError;
use cosmwasm_std::Coin;

pub fn assert_sent_exact_coin(sent: &[Coin], required: Option<Coin>) -> Result<(), ContractError> {
    if let Some(required_coin) = required {
        let required_amount = required_coin.amount.u128();
        if required_amount > 0 {
            let mut received_amounts = vec![];
            let sent_sufficient_funds = sent.iter().any(|coin| {
                received_amounts.push(coin.amount.u128().to_string() + " " + &coin.denom);
                coin.denom == required_coin.denom && coin.amount.u128() == required_amount
            });

            if sent_sufficient_funds {
                return Ok(());
            } else {
                return Err(ContractError::InvalidAmount {
                    needed: required_amount.to_string(),
                    received: convert_vector_of_string_slices_to_string(received_amounts),
                });
            }
        }
    }
    Ok(())
}

fn convert_vector_of_string_slices_to_string(vector: Vec<String>) -> String {
    let mut string = String::new();
    for s in vector {
        string.push_str(&s);
        string.push_str(", ");
    }
    string
}
