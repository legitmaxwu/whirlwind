// This type is used to define the shape of our data.

import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { type CryptoBalance } from "../types";
import { type Asset } from "@chain-registry/types";
import { CRYPTO_LISTINGS, type CryptoListing } from "../lib/constants";
import Image from "next/image";
import { cn, formatDelta, formatNumber } from "../lib/utils";
import { useAtom } from "jotai";
import { totalBalancesAtom } from "../jotai/balances";
import { enrichBalancesArray } from "../lib/prices";
import { useMemo } from "react";

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
      const percentChange24h =
        row.original.listing?.quote.USD.percent_change_24h ?? 0;
      const up = percentChange24h > 0;
      return (
        <div className="flex items-center gap-2">
          <div>
            {Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(row.original.listing?.quote.USD.price ?? 0)}
          </div>
          <div
            className={cn({
              "text-green-500": up,
              "text-red-500": !up,
            })}
          >
            {formatDelta(percentChange24h)}% (24h)
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

interface BalancesTableProps {
  balanceRows: BalanceRow[];
}
export function BalancesTable(props: BalancesTableProps) {
  const { balanceRows } = props;

  return <DataTable columns={columns} data={balanceRows} />;
}
