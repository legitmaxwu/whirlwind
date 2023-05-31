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
import { ChevronDown, ChevronDownIcon } from "lucide-react";

type BalanceRow = CryptoBalance & {
  asset: Asset | undefined;
  listing: CryptoListing | undefined;
};

export const columns: ColumnDef<BalanceRow>[] = [
  {
    header: () => <div className="w-16">Token</div>,
    accessorKey: "asset.symbol",
    cell({ row }) {
      return (
        <div className="flex w-16 items-center gap-1.5">
          <Image
            src={row.original.asset?.logo_URIs?.svg ?? ""}
            alt={row.original.asset?.symbol ?? ""}
            width={24}
            height={24}
          />
          <div className="font-medium">{row.original.asset?.symbol ?? ""}</div>
        </div>
      );
    },
  },
  {
    header: () => <div className="w-16 text-right">Price</div>,
    accessorKey: "listing.quote.USD.price",
    cell({ row }) {
      return (
        <div className="w-16 text-right font-medium">
          {Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(row.original.listing?.quote.USD.price ?? 0)}
        </div>
      );
    },
  },
  {
    header: () => <div className="w-16 text-right">24h</div>,
    accessorKey: "quantity",
    cell({ row }) {
      const percentChange24h =
        row.original.listing?.quote.USD.percent_change_24h ?? 0;
      const up = percentChange24h > 0;
      return (
        <div className="flex w-16 items-center justify-end text-sm font-medium">
          <ChevronDownIcon
            strokeWidth={2}
            className={cn({
              "h-4 w-4 shrink-0": true,
              "rotate-180 text-green-600": up,
              "text-red-500": !up,
            })}
          ></ChevronDownIcon>
          <div
            className={cn({
              "text-green-600": up,
              "text-red-500": !up,
            })}
          >
            {formatDelta(percentChange24h).slice(1)}%
          </div>
        </div>
      );
    },
  },
  {
    header: () => <div className="w-10"></div>,
    accessorKey: "listing.quote.USD.percent_change_24h",
    cell({ row }) {
      return <div className="sm:w-20"></div>;
    },
  },
  {
    header: () => <div className="ml-auto">Amount</div>,
    accessorKey: "quantity",
    cell({ row }) {
      return (
        <div className="ml-auto">
          {Intl.NumberFormat("en-US", {}).format(row.original.quantity ?? 0)}
        </div>
      );
    },
  },
  {
    header: "Value (USD)",
    cell({ row }) {
      const quantity = row.original.quantity ?? 0;
      const price = row.original.listing?.quote.USD.price ?? 0;
      return (
        <div className="font-medium">${formatNumber(price * quantity)}</div>
      );
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
