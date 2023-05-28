// This type is used to define the shape of our data.

import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { type CryptoBalance } from "../types";
import { type Asset } from "@chain-registry/types";
import { useMemo } from "react";
import { CRYPTO_BALANCES } from "../lib/constants";
import { assets } from "chain-registry";
import Image from "next/image";

type BalanceRow = CryptoBalance & {
  asset: Asset | undefined;
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
    header: "Amount",
    accessorKey: "quantity",
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

const balanceRows: BalanceRow[] = CRYPTO_BALANCES.map((balance) => ({
  ...balance,
  asset: findAssetWithDenom(balance.denom),
}));

export function BalancesTable() {
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={balanceRows} />
    </div>
  );
}
