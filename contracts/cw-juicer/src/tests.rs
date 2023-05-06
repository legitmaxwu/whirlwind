use crate::contract::{execute, instantiate};
use crate::msg::{DepositMsg, ExecuteMsg, InstantiateMsg, WithdrawMsg};
use crate::state::COMMITMENTS;
use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
use cosmwasm_std::{coin, Uint128 as U128, Uint256 as U256};

use std::str::FromStr;

use lib::msg::Deposit;

const ALICE: &str = "Alice";

#[test]
fn test_deposit() {
    let mut deps = mock_dependencies();
    let info = mock_info(
        "juno10ve2n3n97sxzpykfu2g5hys04fmyl8lwxq6e0hemdn0xhestzcaq5lzua0",
        &[coin(10, "TKN")],
    );

    // instantiate an empty contract
    let instantiate_msg = InstantiateMsg {};
    let res = instantiate(deps.as_mut(), mock_env(), info, instantiate_msg).unwrap();
    assert_eq!(0, res.messages.len());

    // let deposit = generate_deposit();
    let deposit = Deposit::new(
        "276277773929387392791096474084808108569850403587654342680891529007770412737".to_string(),
    );

    let deposit_msg = DepositMsg {
        commitment: deposit.get_commitment(),
    };

    let msg = ExecuteMsg::Deposit(deposit_msg);

    let info = mock_info(ALICE, &[coin(10_000_000_000, "ujuno")]);
    let res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();
    assert_eq!(0, res.messages.len());

    // TODO
    // let commitment = COMMITMENTS
    //     .load(&deps.storage, deposit.get_commitment())
    //     .unwrap();
    // assert_eq!(Uint128::new(10), commitment);
}

#[test]
fn test_withdraw_1() {
    let mut deps = mock_dependencies();

    // instantiate an empty contract
    let instantiate_msg = InstantiateMsg {};
    let info = mock_info(
        "juno10ve2n3n97sxzpykfu2g5hys04fmyl8lwxq6e0hemdn0xhestzcaq5lzua0",
        &[],
    );

    let res = instantiate(deps.as_mut(), mock_env(), info, instantiate_msg).unwrap();
    assert_eq!(0, res.messages.len());

    let mut tree = COMMITMENTS.load(&deps.storage).unwrap();

    let deposit = Deposit {
        nullifier: "54154714943715201094961901040590459639892306160131965986154511512546000403"
            .to_string(),
    };


    let deposit_msg = DepositMsg {
        commitment: deposit.clone().get_commitment(),
    };

    let msg = ExecuteMsg::Deposit(deposit_msg);

    let info = mock_info(ALICE, &[coin(1_000_000, "ujuno")]);
    let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

    let leaf_index = tree
        .insert(&U256::from_str(&deposit.clone().get_commitment()).unwrap())
        .unwrap();

    // Print merkle tree info;

    COMMITMENTS.save(&mut deps.storage, &tree).unwrap();

    //withdraw will fail with balance check. Comment out balance check to pass.
    let msg = ExecuteMsg::Withdraw(WithdrawMsg {
        proof: lib::msg::CircomProof::from(
            r#"
            {"pi_a":["13899269723484849480002065473374493568327469679987898626585656783152635224196","4644776364206331144208370772102729462540382294894335687634266360911567618285","1"],"pi_b":[["11550199660326834097658136558533988234178757731057308044978347076813572730094","2682881763463105242359875271001109719339722524261167828167916342514182934974"],["95039516498389015079170513998234052571784823209713661742933740886373624805","3428917488231875962754312177544595651247105738928930070869265869601586471119"],["1","0"]],"pi_c":["18932896497737520548726210332000803585517357164811625711564892288268655803594","3898942506810745753991535926637360084087400921771473613166702262820083122159","1"],"protocol":"groth16","curve":"bn128"}
            "#.to_string(),
        ),
        root: "7867364560627547019086598689541673085228895175200585554350937642876639323043".to_string(),
        nullifier_hash: deposit.clone().get_nullifier_hash((leaf_index) as u128),
        recipient: "juno14spgzl9ps5tyev32ny74fa6m0s9q9828v0vrga".to_string(),
        relayer: "juno1am5sw4geda8xfvmn4pkzruhv8ah0l3jx5hgchh".to_string(),
        fee: U128::from(0_u128),
    });

    println!("nullifier: {}", deposit.clone().nullifier);
    println!("nullifierHash: {}", deposit.get_nullifier_hash((leaf_index) as u128));
    // println!("root: {}", tree.get_last_root());

    println!("recipient: {}", "juno14spgzl9ps5tyev32ny74fa6m0s9q9828v0vrga".to_string());
    println!("relayer: {}", "juno1am5sw4geda8xfvmn4pkzruhv8ah0l3jx5hgchh".to_string());
    println!("fee: {}", U128::from(0_u128));

    let info = mock_info(ALICE, &[]);

    let res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();
    assert_eq!(1, res.messages.len());
}

// #[test]
// fn test_withdraw_20() {
//     let mut deps = mock_dependencies();

//     let deposit = Deposit::from_note("juno-juicer-86ca9e972ed3784d9407f431e045be9b3c3c913327b0d3a669edce2ef1399f13578e9a6ae07cd5bc749d41c33b03e876906fb36803508bec87c86ce5b142".to_string());
//     COMMITMENTS
//         .save(&mut deps.storage, deposit.clone().get_commitment(), &true)
//         .unwrap();

//     for _ in 0..20 {
//         let d = Deposit::new();
//         COMMITMENTS
//             .save(&mut deps.storage, d.get_commitment(), &true)
//             .unwrap();
//     }

//     // instantiate an empty contract
//     let instantiate_msg = InstantiateMsg {
//         amount: 10,
//         denom: "TKN".to_string(),
//     };
//     let info = mock_info(ALICE, &[]);

//     let res = instantiate(deps.as_mut(), mock_env(), info, instantiate_msg).unwrap();
//     assert_eq!(0, res.messages.len());

//     let msg = ExecuteMsg::Withdraw(WithdrawMsg {
//         note: "juno-juicer-86ca9e972ed3784d9407f431e045be9b3c3c913327b0d3a669edce2ef1399f13578e9a6ae07cd5bc749d41c33b03e876906fb36803508bec87c86ce5b142".to_string()
//     });
//     let info = mock_info(ALICE, &[]);

//     let res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();
//     assert_eq!(1, res.messages.len());

//     assert!(false);
// }
