// This type is used to define the shape of our data.

import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { cn } from "../lib/utils";
import { nanoid } from "nanoid";
import { type Proposal, ProposalStatus } from "../types";

function RenderProposalStatus({ status }: { status: ProposalStatus }) {
  const dotStyles = cn({
    "rounded-full h-2 w-2": true,
    "bg-yellow-500": status === ProposalStatus.Pending,
    "bg-green-500": status === ProposalStatus.Executed,
    "bg-red-500": status === ProposalStatus.Rejected,
  });

  return (
    <div className="flex items-center gap-2">
      <div className={dotStyles} />
      <div>{status}</div>
    </div>
  );
}

type ProposalRow = Proposal;

export const columns: ColumnDef<ProposalRow>[] = [
  {
    header: "Status",
    cell({ row }) {
      return <RenderProposalStatus status={row.original.status} />;
    },
  },
  {
    header: "Title",
    accessorKey: "title",
  },
  {
    header: "Date",
    cell({ row }) {
      return <div>{row.original.createdAt.toLocaleString()}</div>;
    },
  },
];

const proposalRows: ProposalRow[] = [
  {
    id: nanoid(),
    title: "Migrate 125K to Max Wu’s Burner Wallet",
    status: ProposalStatus.Pending,
    createdAt: new Date("Mar 2023"),
  },
  {
    id: nanoid(),
    title: "Deposit 10M USDC to Whirlwind Pool",
    status: ProposalStatus.Executed,
    createdAt: new Date("Mar 2023"),
  },
  {
    id: nanoid(),
    title: "Deposit 10M USDC to Whirlwind Pool",
    status: ProposalStatus.Rejected,
    createdAt: new Date("Feb 2023"),
  },
];

export function ProposalsTable() {
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={proposalRows} />
    </div>
  );
}
