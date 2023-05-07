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
        let vk_json = include_str!("../../../circuits_juicer/build/verification_key.json");

        Self {
            vk_json: vk_json.to_string(),
        }
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
        let v = Verifier::new();

        let proof = CircomProof::from(r#"{"pi_a":["6552461980235014125512485858574907252011786385287906273628562834862223432928","11860269414224780188951814911792416959087517485707388287639623625338071932162","1"],"pi_b":[["9681761101763472006554831866824970971123704940950423917193355053768804987946","5927707442728914367014416326038522894294769459332802500499248118399686183810"],["8311882933934792033033929758431827548593018661457980967793576235624041094075","9580190490647948836337327257463300132379241952918693313899161298407425234595"],["1","0"]],"pi_c":["14983953388384713833269817801465516661871057866090801236649846900102814228715","17793356028202487683602645872301205836685643881182882218786806260625920223574","1"],"protocol":"groth16","curve":"bn128"}"#.to_string())
            .to_proof();
        let public_signals = PublicSignals::from_json(r#"["12102025269368723514786154929741041693298912567371778248333614260822400991070","11026638163601698230824004152583421065610480743788604283266155961805787602581","0","0","0"]"#.to_string());

        let res = v.verify_proof(proof, &public_signals.get());

        println!("res: {}", res);
        assert!(res);
    }
}
