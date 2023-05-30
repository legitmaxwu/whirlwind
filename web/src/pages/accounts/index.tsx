import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { BalancesTable } from "../../components/BalancesTable";
import { useAtom } from "jotai";
import { controllerAccountsAtom } from "../../jotai/balances";
import { type CustomPage } from "../../types/Page";
import { SwapLayout } from "../../components/layouts/SwapLayout";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { handleError } from "../../lib/handleError";

const SwapPage: CustomPage = () => {
  const [controllerAccounts] = useAtom(controllerAccountsAtom);
  const router = useRouter();
  useEffect(() => {
    const acctId = controllerAccounts[0]?.id;
    if (acctId) {
      router.replace(`/accounts/${acctId}`).catch(handleError);
    }
  }, [controllerAccounts, router]);
  return (
    <>
      <Head>
        <title>Whirlwind - Swap</title>
        <meta name="description" content="Tax-compliant zk-private trades" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <div></div>
      </div>
    </>
  );
};

SwapPage.getLayout = (page) => {
  return <SwapLayout>{page}</SwapLayout>;
};

export default SwapPage;
