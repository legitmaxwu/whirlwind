import { nanoid } from "nanoid";
import { type CryptoBalance } from "../types";
import listingsJson from "./listings.json";

const INSTITUTION_MEMBERS = [
  {
    id: nanoid(),
    name: "John Doe",
    profileImageSrc: "https://avatars.githubusercontent.com/u/124",
  },
  {
    id: nanoid(),
    name: "Jim Johnson",
    profileImageSrc: "https://avatars.githubusercontent.com/u/1249",
  },
  {
    id: nanoid(),
    name: "Jane Doe",
    profileImageSrc: "https://avatars.githubusercontent.com/u/780126",
  },
] as const;

const INSTITUTION_CONTROLLER_ACCOUNTS = [
  {
    id: nanoid(),
    accountTitle: "MEV strategies",
    balance: 140234,
    assignedTo: "Bao Mai",
  },
  {
    id: nanoid(),
    accountTitle: "Longevity Fund II Multisig 1",
    balance: 1424890,
    assignedTo: "Longevity Fund II",
  },
  {
    id: nanoid(),
    accountTitle: "Longevity Fund II Multisig 2",
    balance: 2437809,
    assignedTo: "Longevity Fund II",
  },
  {
    id: nanoid(),
    accountTitle: "Longevity Fund II Multisig 3",
    balance: 483900,
    assignedTo: "Longevity Fund II",
  },
];

export const Constants = {
  InstitutionName: "BlackRock Osmosis Fund II",
  TotalAssets: 32_307_834.95,
  WhirlwindAssets: 5_123_000,
  TradeVolume: 78_000_000,
  InstitutionMembers: INSTITUTION_MEMBERS,
  ControllerAccounts: INSTITUTION_CONTROLLER_ACCOUNTS,
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
