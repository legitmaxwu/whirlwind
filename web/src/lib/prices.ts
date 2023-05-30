import { assets } from "chain-registry";
import { CRYPTO_LISTINGS, type CryptoListing } from "./constants";
import { type CryptoBalance } from "../types";
import { type Asset } from "@chain-registry/types";

function findAssetWithDenom(denom: string) {
  const list = assets.find((assetList) =>
    assetList.assets.some((asset) =>
      asset.denom_units.some((unit) => unit.denom === denom)
    )
  );
  const asset = list?.assets.find((asset) =>
    asset.denom_units.some((unit) => unit.denom === denom)
  );
  return asset;
}

function findListingWithSymbol(symbol: string) {
  return CRYPTO_LISTINGS.find((listing) => listing.symbol === symbol);
}

type EnrichedBalance = CryptoBalance & {
  priceUSD: number;
  valueUSD: number;
  asset: Asset | undefined;
  listing: CryptoListing | undefined;
};
export function enrichBalancesArray(
  balances: CryptoBalance[]
): EnrichedBalance[] {
  const enrichedBalances = balances.map((balance) => {
    const { denom } = balance;

    const asset = findAssetWithDenom(denom);
    const listing = findListingWithSymbol(asset?.symbol ?? "");
    const priceUSD = listing?.quote.USD.price ?? 0;

    return {
      ...balance,
      priceUSD,
      valueUSD: priceUSD * balance.quantity,
      asset,
      listing,
    };
  });

  return enrichedBalances;
}

export function totalUSDValue(balances: EnrichedBalance[]) {
  console.log(balances);
  return balances.reduce((acc, balance) => acc + balance.valueUSD, 0);
}
