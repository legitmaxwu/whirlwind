import { NextPage } from "next";
import Head from "next/head";
import { MembersView } from "./portfolio";

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
      </div>
    </>
  );
};

export default TradersPage;
