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

type ControllerAccount = {
  id: string;
  accountTitle: string;
  balances: CryptoBalance[];
  assignedTo: string;
};

const INSTITUTION_CONTROLLER_ACCOUNTS: ControllerAccount[] = [
  {
    id: nanoid(),
    accountTitle: "MEV strategies",
    balances: [
      { denom: "osmo", quantity: 1337 },
      { denom: "atom", quantity: 420 },
      { denom: "axl", quantity: 500 },
    ],
    assignedTo: "Bao Mai",
  },
  {
    id: nanoid(),
    accountTitle: "Longevity Fund II Multisig 1",
    balances: [
      { denom: "osmo", quantity: 1337 },
      { denom: "atom", quantity: 420 },
      { denom: "axl", quantity: 500 },
    ],
    assignedTo: "Longevity Fund II",
  },
  {
    id: nanoid(),
    accountTitle: "Longevity Fund II Multisig 2",
    balances: [
      { denom: "osmo", quantity: 1337 },
      { denom: "atom", quantity: 420 },
      { denom: "axl", quantity: 500 },
    ],
    assignedTo: "Longevity Fund II",
  },
  {
    id: nanoid(),
    accountTitle: "Longevity Fund II Multisig 3",
    balances: [
      { denom: "osmo", quantity: 1337 },
      { denom: "atom", quantity: 420 },
      { denom: "axl", quantity: 500 },
    ],
    assignedTo: "Longevity Fund II",
  },
];

export const Constants = {
  InstitutionName: "BlackRock Osmosis Fund II",
  TotalAssets: 32_307_834.95,
  TradeVolume: 78_000_000,
  InstitutionMembers: INSTITUTION_MEMBERS,
  ControllerAccounts: INSTITUTION_CONTROLLER_ACCOUNTS,
};

export const CRYPTO_LISTINGS = listingsJson.data;

export type CryptoListing = (typeof CRYPTO_LISTINGS)[number];
