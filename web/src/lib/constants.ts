import { nanoid } from "nanoid";
import { type CryptoBalance } from "../types";
import listingsJson from "./listings.json";
import { enrichBalancesArray, totalUSDValue } from "./prices";

export const CRYPTO_LISTINGS = listingsJson.data;

export type CryptoListing = (typeof CRYPTO_LISTINGS)[number];

export type DataPoint = {
  date: Date;
  balance: number;
};

/**
 * Generates data points that interpolate between an initial and final value over a time range.
 *
 * @param initialValue - The initial value of the data points.
 * @param finalValue - The final value of the data points.
 * @param startTime - The starting time of the time range.
 * @param endTime - The ending time of the time range.
 * @param interval - The interval between data points, in milliseconds.
 * @return The generated data points.
 */
function calculateHistory(
  initialValue: number,
  finalValue: number,
  startTime: Date,
  endTime: Date,
  interval: number
): DataPoint[] {
  const totalSteps = Math.floor(
    (endTime.getTime() - startTime.getTime()) / interval
  );
  const stepValue = (finalValue - initialValue) / totalSteps;

  const drift = 1; // mean
  const volatility = 25; // standard deviation

  const result: DataPoint[] = [
    { date: new Date(endTime), balance: finalValue },
  ];

  for (let i = 1; i <= totalSteps; i++) {
    const time = new Date(endTime.getTime() - i * interval);
    const random = Math.random();
    const changePercent = drift + volatility * (random - 0.5); // applying noise to the change percent

    const balance = Math.abs(
      (result[0]?.balance ?? 0) - stepValue * changePercent
    );
    result.unshift({ date: time, balance: balance });
  }

  return result;
}

const ONE_MONTH_AGO = new Date(new Date().setMonth(new Date().getMonth() - 1));
const YESTERDAY = new Date(new Date().setDate(new Date().getDate() - 1));
const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

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
  history: DataPoint[];
  walletAddress: string;
};

function getBalancesAndHistory(balances: CryptoBalance[], growth3M: number) {
  const enrichedBalances = enrichBalancesArray(balances);
  const totalValue = totalUSDValue(enrichedBalances);
  const prevValue = totalValue / growth3M;
  const history = calculateHistory(
    prevValue,
    totalValue,
    ONE_MONTH_AGO,
    YESTERDAY,
    ONE_DAY_IN_MS
  );
  return {
    balances: balances,
    history,
  };
}

const INSTITUTION_CONTROLLER_ACCOUNTS: ControllerAccount[] = [
  {
    id: nanoid(),
    accountTitle: "MEV strategies",
    ...getBalancesAndHistory(
      [
        { denom: "osmo", quantity: 1337 },
        { denom: "atom", quantity: 420 },
        { denom: "axl", quantity: 500 },
        { denom: "cro", quantity: 7125 },
        { denom: "scrt", quantity: 700 },
        { denom: "akt", quantity: 50120 },
      ],
      3.5
    ),
    assignedTo: "Bao Mai",
    walletAddress: "osmo1xv9tklw7d82sezh9haa573wufgy59vmwe6xxe5",
  },
  {
    id: nanoid(),
    accountTitle: "Longevity Fund II Multisig 1",
    ...getBalancesAndHistory(
      [
        { denom: "osmo", quantity: 124 },
        { denom: "atom", quantity: 1251 },
        { denom: "axl", quantity: 50110 },
      ],
      1.7
    ),
    assignedTo: "Longevity Fund II",
    walletAddress: "osmo1asfbabflw7d82sezh9haa573wufgy59vmwe6xxe5",
  },
  {
    id: nanoid(),
    accountTitle: "Longevity Fund II Multisig 2",
    ...getBalancesAndHistory(
      [
        { denom: "osmo", quantity: 1 },
        { denom: "atom", quantity: 125 },
      ],
      1.2
    ),
    assignedTo: "Longevity Fund II",
    walletAddress: "osmo1f009f09r1282sezh9haa573wufgy59vmwe6xxe5",
  },
  {
    id: nanoid(),
    accountTitle: "Longevity Fund II Multisig 3",
    ...getBalancesAndHistory(
      [
        { denom: "osmo", quantity: 137 },
        { denom: "axl", quantity: 51200 },
      ],
      1.1
    ),
    assignedTo: "Longevity Fund II",
    walletAddress: "osmo1fasopaflw7pmvezh9haa573wufgy59vmwe6xxe5",
  },
];

export const Constants = {
  InstitutionName: "BlackRock Osmosis Fund II",
  TotalAssets: 32_307_834.95,
  TradeVolume: 78_000_000,
  InstitutionMembers: INSTITUTION_MEMBERS,
  ControllerAccounts: INSTITUTION_CONTROLLER_ACCOUNTS,
};
