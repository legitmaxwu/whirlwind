import { nanoid } from "nanoid";
import { type CryptoBalance } from "../types";
import listingsJson from "./listings.json";
export const Constants = {
  InstitutionName: "BlackRock Osmosis Fund II",
};

export const CRYPTO_BALANCES: CryptoBalance[] = [
  {
    id: nanoid(),
    denom: "osmo",
    quantity: 1_000_000_000,
  },
  {
    id: nanoid(),
    denom: "atom",
    quantity: 2_000_000_000,
  },
];

export const CRYPTO_LISTINGS = listingsJson.data;

export type CryptoListing = (typeof CRYPTO_LISTINGS)[number];
