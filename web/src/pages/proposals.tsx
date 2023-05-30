import { type NextPage } from "next";
import Head from "next/head";
import { ProposalsTable } from "../components/ProposalsTable";
import { MembersView } from "./portfolio";

export const fmtComma = (s: number, maximumFractionDigits?: number) =>
  s.toLocaleString("en", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maximumFractionDigits ?? 2,
  });

const ControllerItem = ({
  accountName,
  ownerName,
  walletAddr,
  usdcValue,
}: {
  accountName: string;
  ownerName: string;
  walletAddr: string;
  usdcValue: number;
}) => {
  return (
    <div className="flex cursor-pointer justify-between border-b border-b-highlight px-8 py-6 transition-all hover:border-b-black hover:bg-slate-50">
      <div>
        <p>{accountName}</p>
        <div className="text-2xl font-medium">{`$${fmtComma(usdcValue)}`}</div>
      </div>
      <div className="w-48 px-4">
        <div className="flex flex-row items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-black" />
          <p className="font-medium">{ownerName}</p>
        </div>
        <p>{walletAddr}</p>
      </div>
    </div>
  );
};

const ProposalsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Whirlwind - Proposals</title>
        <meta name="description" content="Tax-compliant zk-private trades" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="items-left flex flex-col justify-center px-8 py-4">
        {/* Header II */}
        <div className="flex justify-between">
          <div className="py-2 text-lg font-medium">BlackRock Osmosis Fund II</div>
          <MembersView />
        </div>
        <h1 className="text-2xl font-medium">
          Deposit and Migration Proposals
        </h1>
        <ProposalsTable />
        <div className="py-4">
          <h1 className="text-2xl font-medium">
            Whirlwind Controller Accounts
          </h1>
          <div className="my-4 rounded-lg border border-highlight bg-[#f5f6f8]">
            <ControllerItem
              accountName="MEV Strategies"
              usdcValue={140234}
              ownerName="Bao Mai"
              walletAddr="osmo1clpq...mvnj"
            />
            <ControllerItem
              accountName="Longevity Fund II Multisig 2"
              usdcValue={2437809}
              ownerName="Longevity Fund II"
              walletAddr="osmo1xjv0...xuv9"
            />
            <ControllerItem
              accountName="Longevity Fund II Multisig 1"
              usdcValue={1424890}
              ownerName="Longevity Fund II"
              walletAddr="osmo1xmiv...m8xg"
            />
            <ControllerItem
              accountName="MEV Strategies II"
              usdcValue={482043}
              ownerName="Luke Saunders"
              walletAddr="osmo1m8cs...xi83"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProposalsPage;
