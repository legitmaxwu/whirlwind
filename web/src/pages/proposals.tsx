import { type NextPage } from "next";
import Head from "next/head";
import { ProposalsTable } from "../components/ProposalsTable";

const ProposalsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Whirlwind - Proposals</title>
        <meta name="description" content="Tax-compliant zk-private trades" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <ProposalsTable />
      </div>
    </>
  );
};

export default ProposalsPage;
