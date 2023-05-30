import { type NextPage } from "next";
import Head from "next/head";
import { MembersView } from "../../components/MembersView";
import { TraderItem } from "../../components/TraderItem";

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
