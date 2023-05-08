use ark_groth16::{prepare_verifying_key, verify_proof, Proof, VerifyingKey};
use serde::{Deserialize, Serialize};

use ark_bn254::{Bn254, Fq, Fq2, Fr, G1Affine, G1Projective, G2Affine, G2Projective};
use schemars::JsonSchema;
use std::str::FromStr;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Verifier {
    vk_json: String,
}

#[allow(clippy::new_without_default)]
impl Verifier {
    pub fn new() -> Self {

        Self {
            vk_json: "".to_string(),
        }
    }

    pub fn from_vk(vk_json: String) -> Self {
        Self { vk_json }
    }

    pub fn verify_proof(self, proof: Proof<Bn254>, inputs: &[Fr]) -> bool {
        let vk_json: VerifyingKeyJson = serde_json::from_str(&self.vk_json).unwrap();

        let vk = vk_json.to_verifying_key();
        let pvk = prepare_verifying_key(&vk);

        verify_proof(&pvk, &proof, inputs).unwrap()
    }
}

#[derive(Serialize, Deserialize, Clone, PartialEq, JsonSchema, Debug)]
pub struct VerifyingKeyJson {
    #[serde(rename = "IC")]
    pub ic: Vec<Vec<String>>,

    // #[serde(rename = "nPublic")]
    // pub inputs_count: u32,
    pub vk_alpha_1: Vec<String>,
    pub vk_beta_2: Vec<Vec<String>>,
    pub vk_gamma_2: Vec<Vec<String>>,
    pub vk_delta_2: Vec<Vec<String>>,
    pub vk_alphabeta_12: Vec<Vec<Vec<String>>>,
    // pub curve: String,
    // pub protocol: String,
}

impl VerifyingKeyJson {
    pub fn to_verifying_key(self) -> VerifyingKey<Bn254> {
        let alpha_g1 = G1Affine::from(G1Projective::new(
            str_to_fq(&self.vk_alpha_1[0]),
            str_to_fq(&self.vk_alpha_1[1]),
            str_to_fq(&self.vk_alpha_1[2]),
        ));
        let beta_g2 = G2Affine::from(G2Projective::new(
            // x
            Fq2::new(
                str_to_fq(&self.vk_beta_2[0][0]),
                str_to_fq(&self.vk_beta_2[0][1]),
            ),
            // y
            Fq2::new(
                str_to_fq(&self.vk_beta_2[1][0]),
                str_to_fq(&self.vk_beta_2[1][1]),
            ),
            // z,
            Fq2::new(
                str_to_fq(&self.vk_beta_2[2][0]),
                str_to_fq(&self.vk_beta_2[2][1]),
            ),
        ));

        let gamma_g2 = G2Affine::from(G2Projective::new(
            // x
            Fq2::new(
                str_to_fq(&self.vk_gamma_2[0][0]),
                str_to_fq(&self.vk_gamma_2[0][1]),
            ),
            // y
            Fq2::new(
                str_to_fq(&self.vk_gamma_2[1][0]),
                str_to_fq(&self.vk_gamma_2[1][1]),
            ),
            // z,
            Fq2::new(
                str_to_fq(&self.vk_gamma_2[2][0]),
                str_to_fq(&self.vk_gamma_2[2][1]),
            ),
        ));

        let delta_g2 = G2Affine::from(G2Projective::new(
            // x
            Fq2::new(
                str_to_fq(&self.vk_delta_2[0][0]),
                str_to_fq(&self.vk_delta_2[0][1]),
            ),
            // y
            Fq2::new(
                str_to_fq(&self.vk_delta_2[1][0]),
                str_to_fq(&self.vk_delta_2[1][1]),
            ),
            // z,
            Fq2::new(
                str_to_fq(&self.vk_delta_2[2][0]),
                str_to_fq(&self.vk_delta_2[2][1]),
            ),
        ));

        let gamma_abc_g1: Vec<G1Affine> = self
            .ic
            .iter()
            .map(|coords| {
                G1Affine::from(G1Projective::new(
                    str_to_fq(&coords[0]),
                    str_to_fq(&coords[1]),
                    str_to_fq(&coords[2]),
                ))
            })
            .collect();

        VerifyingKey::<Bn254> {
            alpha_g1,
            beta_g2,
            gamma_g2,
            delta_g2,
            gamma_abc_g1,
        }
    }
}

pub fn str_to_fq(s: &str) -> Fq {
    Fq::from_str(s).unwrap()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::msg::{CircomProof, PublicSignals};

    #[test]
    fn test_verifier() {

        let v: Verifier = Verifier::from_vk(r#"{
            "protocol": "groth16",
            "curve": "bn128",
            "nPublic": 2,
            "vk_alpha_1": [
             "20491192805390485299153009773594534940189261866228447918068658471970481763042",
             "9383485363053290200918347156157836566562967994039712273449902621266178545958",
             "1"
            ],
            "vk_beta_2": [
             [
              "6375614351688725206403948262868962793625744043794305715222011528459656738731",
              "4252822878758300859123897981450591353533073413197771768651442665752259397132"
             ],
             [
              "10505242626370262277552901082094356697409835680220590971873171140371331206856",
              "21847035105528745403288232691147584728191162732299865338377159692350059136679"
             ],
             [
              "1",
              "0"
             ]
            ],
            "vk_gamma_2": [
             [
              "10857046999023057135944570762232829481370756359578518086990519993285655852781",
              "11559732032986387107991004021392285783925812861821192530917403151452391805634"
             ],
             [
              "8495653923123431417604973247489272438418190587263600148770280649306958101930",
              "4082367875863433681332203403145435568316851327593401208105741076214120093531"
             ],
             [
              "1",
              "0"
             ]
            ],
            "vk_delta_2": [
             [
              "10857046999023057135944570762232829481370756359578518086990519993285655852781",
              "11559732032986387107991004021392285783925812861821192530917403151452391805634"
             ],
             [
              "8495653923123431417604973247489272438418190587263600148770280649306958101930",
              "4082367875863433681332203403145435568316851327593401208105741076214120093531"
             ],
             [
              "1",
              "0"
             ]
            ],
            "vk_alphabeta_12": [
             [
              [
               "2029413683389138792403550203267699914886160938906632433982220835551125967885",
               "21072700047562757817161031222997517981543347628379360635925549008442030252106"
              ],
              [
               "5940354580057074848093997050200682056184807770593307860589430076672439820312",
               "12156638873931618554171829126792193045421052652279363021382169897324752428276"
              ],
              [
               "7898200236362823042373859371574133993780991612861777490112507062703164551277",
               "7074218545237549455313236346927434013100842096812539264420499035217050630853"
              ]
             ],
             [
              [
               "7077479683546002997211712695946002074877511277312570035766170199895071832130",
               "10093483419865920389913245021038182291233451549023025229112148274109565435465"
              ],
              [
               "4595479056700221319381530156280926371456704509942304414423590385166031118820",
               "19831328484489333784475432780421641293929726139240675179672856274388269393268"
              ],
              [
               "11934129596455521040620786944827826205713621633706285934057045369193958244500",
               "8037395052364110730298837004334506829870972346962140206007064471173334027475"
              ]
             ]
            ],
            "IC": [
             [
              "18063672049530750858029462763326906032839990382122586121488003785381547683675",
              "759609395653719992266251714863437073282774200097442679432081675620145396703",
              "1"
             ],
             [
              "20521766568357207416086813883296574432447456817495332350690931304634989234256",
              "884475057409272585121087416286688027516162190905496611825612051902017581895",
              "1"
             ],
             [
              "4708974210337050848907406067935772376483646117790992143188804094263795451636",
              "1641349259651647782104224499950665741519430186966263769111437651584415528307",
              "1"
             ]
            ]
           }
        "#.to_string());

        let proof = CircomProof::from(r#"{
            "pi_a": [
              "19051854307920317904879077542198307586873302738907730626712683511875369534379",
              "7526972877723952318838057114682458392583355109667074627519913556121434801741",
              "1"
            ],
            "pi_b": [
              [
                "7713303041286554795405471441081486166824672806560637660845281568279489749838",
                "19107866636676591509729227901326692072156041217829998937398887169205765443059"
              ],
              [
                "5393766924274999875467344277382601067886208352046450008024913526116911668877",
                "19157991937111202103608755287157993120221664100991863114045575977817839047985"
              ],
              [
                "1",
                "0"
              ]
            ],
            "pi_c": [
              "15961344810639486177464044177317247290093379916616760335374135791579706230261",
              "21284641939028737967642489932465507698628017397882092494175127135703653076787",
              "1"
            ],
            "protocol": "groth16",
            "curve": "bn128"
          }"#.to_string())
            .to_proof();
        let public_signals = PublicSignals::from_json(r#"[
            "1337",
            "2880600617345714039494384748645461738150340256226005947162982605579534386469"
          ]"#.to_string());

        let res = v.verify_proof(proof, &public_signals.get());

        println!("res: {}", res);
        assert!(res);
    }
}
