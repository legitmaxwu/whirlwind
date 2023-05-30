import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { BalancesTable } from "../../components/BalancesTable";
import { useAtom } from "jotai";
import { controllerAccountsAtom } from "../../jotai/balances";
import { type CustomPage } from "../../types/Page";
import { SwapLayout } from "../../components/layouts/SwapLayout";
import { useRouter } from "next/router";
import { focusAtom } from "jotai-optics";
import { useMemo } from "react";
import { enrichBalancesArray } from "../../lib/prices";
import { LineChart } from "../../components/LineChart";

const SwapAccountPage: CustomPage = () => {
  const router = useRouter();
  const accountId = router.query.accountId as string;

  const accountAtom = useMemo(
    () =>
      focusAtom(controllerAccountsAtom, (optic) =>
        optic.find((account) => account.id === accountId)
      ),
    [accountId]
  );
  const [account] = useAtom(accountAtom);

  const enrichedBalances = useMemo(
    () => (account ? enrichBalancesArray(account.balances) : []),
    [account]
  );
  //   const [account, setAccount] = useAtom(selectControllerAccountAtom(accountId));
  if (!account) {
    return <div>Account not found</div>;
  }
  return (
    <>
      <Head>
        <title>Whirlwind - Swap</title>
        <meta name="description" content="Tax-compliant zk-private trades" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="p-8">
        <div>{account?.accountTitle}</div>
        <div className="h-8"></div>
        <LineChart data={account.history} />
        <div className="h-8"></div>
        <BalancesTable balanceRows={enrichedBalances} />
      </div>
    </>
  );
};

SwapAccountPage.getLayout = (page) => {
  return <SwapLayout>{page}</SwapLayout>;
};

export default SwapAccountPage;
