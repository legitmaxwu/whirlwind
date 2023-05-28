import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { BalancesTable } from "../components/BalancesTable";

const SwapPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Whirlwind - Swap</title>
        <meta name="description" content="Tax-compliant zk-private trades" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <BalancesTable />
      </div>
    </>
  );
};

export default SwapPage;
