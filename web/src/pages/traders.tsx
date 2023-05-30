import { type NextPage } from "next";
import Head from "next/head";
import { fmtComma } from "./proposals";
import { MembersView } from "../components/MembersView";

const TraderItem = ({
  name,
  usdcValue,
}: {
  name: string;
  usdcValue: number;
}) => {
  return (
    <div className="flex justify-between border-b border-b-highlight px-4 py-4">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-black" />
        <p className="font-medium">{name}</p>
      </div>
      <div className="font-medium">{`$${fmtComma(usdcValue, 2)}`}</div>
    </div>
  );
};

const TradersPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Whirlwind - Proposals</title>
        <meta name="description" content="Tax-compliant zk-private trades" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="px-8 py-4">
        {/* Header II */}
        <div className="flex justify-between">
          <div className="py-2 text-lg font-medium">
            BlackRock Osmosis Fund II
          </div>
          <MembersView />
        </div>
        <div className="max-w-xl">
          <h1 className="text-2xl font-medium">People</h1>
          <div className="my-4 flex flex-col rounded-lg border border-highlight">
            <TraderItem name={"Max Wu"} usdcValue={148453} />
            <TraderItem name={"Luke Saunders"} usdcValue={715324} />
            <TraderItem name={"Sunny Aggarwal"} usdcValue={943439} />
            <TraderItem name={"Dev"} usdcValue={439949} />
            <TraderItem name={"Bao Mai"} usdcValue={32430} />
          </div>
        </div>
      </div>
    </>
  );
};

export default TradersPage;
