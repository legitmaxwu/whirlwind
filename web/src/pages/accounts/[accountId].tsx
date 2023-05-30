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
import { enrichBalancesArray, totalUSDValue } from "../../lib/prices";
import { formatDelta, formatNumber } from "../../lib/utils";
import dynamic from "next/dynamic";

const DynamicLineChart = dynamic(() => import("../../components/LineChart"), {
  ssr: false,
});

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
  const totalValue = totalUSDValue(enrichedBalances);
  if (!account) {
    return <div>Account not found</div>;
  }

  const initialValue = account.history[0]?.balance ?? 0;
  const finalValue = totalValue;
  const percentChange = ((finalValue - initialValue) / initialValue) * 100;
  return (
    <>
      <Head>
        <title>Whirlwind - Swap</title>
        <meta name="description" content="Tax-compliant zk-private trades" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex">
        <div className="p-8">
          <div className="text-lg">{account?.accountTitle}</div>
          <div className="mt-2 text-3xl font-medium">
            {Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(totalValue)}
          </div>
          <div className="h-8"></div>
          <DynamicLineChart data={account.history} />
          <div className="h-8"></div>
          <div className="flex gap-6 rounded-md border border-gray-200 bg-gray-100 p-4">
            <div className="flex-1 truncate text-ellipsis">
              <div className="font-medium">Account Address</div>
              <div>{account.walletAddress}</div>
            </div>
            <div className="flex-1 truncate">
              <div className="font-medium">Trading Volume</div>
              <div>${formatNumber(totalValue * 3)}</div>
            </div>
            <div className="flex-1 truncate">
              <div className="font-medium">Total Returns</div>
              <div>{formatDelta(percentChange)}%</div>
            </div>
          </div>
          <div className="h-8"></div>
          <BalancesTable balanceRows={enrichedBalances} />
        </div>
        <div className="h-full w-px bg-gray-300"></div>
        <div className="w-64 flex-1 shrink-0 border">Swap UI</div>
      </div>
    </>
  );
};

SwapAccountPage.getLayout = (page) => {
  return <SwapLayout>{page}</SwapLayout>;
};

export default SwapAccountPage;
