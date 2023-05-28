// This type is used to define the shape of our data.

import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { type CryptoBalance } from "../types";
import { type Asset } from "@chain-registry/types";
import {
  CRYPTO_BALANCES,
  CRYPTO_LISTINGS,
  type CryptoListing,
} from "../lib/constants";
import { assets } from "chain-registry";
import Image from "next/image";
import { formatNumber } from "../lib/utils";

type BalanceRow = CryptoBalance & {
  asset: Asset | undefined;
  listing: CryptoListing | undefined;
};

export const columns: ColumnDef<BalanceRow>[] = [
  {
    header: "Token",
    cell({ row }) {
      return (
        <div className="flex items-center gap-2">
          <Image
            src={row.original.asset?.logo_URIs?.svg ?? ""}
            alt={row.original.asset?.symbol ?? ""}
            width={20}
            height={20}
          />
          <div>{row.original.asset?.symbol ?? ""}</div>
        </div>
      );
    },
  },
  {
    header: "Price",
    accessorKey: "listing.quote.USD.price",
    cell({ row }) {
      return (
        <div className="flex items-center gap-2">
          <div>
            {Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(row.original.listing?.quote.USD.price ?? 0)}
          </div>
          <div className="text-green-600">
            {formatNumber(
              row.original.listing?.quote.USD.percent_change_24h ?? 0
            ) ?? 0}
            % (24h)
          </div>
        </div>
      );
    },
  },
  {
    header: "Quantity",
    cell({ row }) {
      return (
        <div>
          {Intl.NumberFormat("en-US", {}).format(row.original.quantity ?? 0)}
        </div>
      );
    },
  },
  {
    header: "Value",
    cell({ row }) {
      const quantity = row.original.quantity ?? 0;
      const price = row.original.listing?.quote.USD.price ?? 0;
      return <div>${formatNumber(price * quantity)}</div>;
    },
  },
];

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

const balanceRows: BalanceRow[] = CRYPTO_BALANCES.map((balance) => {
  const asset = findAssetWithDenom(balance.denom);
  const listing = findListingWithSymbol(asset?.symbol ?? "");

  return {
    ...balance,
    asset,
    listing,
  };
});

export function BalancesTable() {
  return <DataTable columns={columns} data={balanceRows} />;
}
