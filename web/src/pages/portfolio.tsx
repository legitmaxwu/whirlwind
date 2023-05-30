import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { Constants, type DataPoint } from "../lib/constants";
import Image from "next/image";
import { Card, CardTitle } from "../components/ui/card";
import numeral from "numeral";
import { formatNumber } from "../lib/utils";
import { BalancesTable } from "../components/BalancesTable";
import { useAtom } from "jotai";
import { useMemo } from "react";
import { enrichBalancesArray, totalUSDValue } from "../lib/prices";
import { controllerAccountsAtom, totalBalancesAtom } from "../jotai/balances";
import { MembersView } from "../components/MembersView";
import dynamic from "next/dynamic";

const DynamicLineChart = dynamic(() => import("../components/LineChart"), {
  ssr: false,
});

function DisplayDollarAmount({
  title,
  amountString,
}: {
  title: string;
  amountString: string;
}) {
  return (
    <div className="">
      <div className="whitespace-nowrap text-sm font-medium">{title}</div>
      <div className="text-3xl font-medium">{amountString}</div>
    </div>
  );
}
const PortfolioPage: NextPage = () => {
  const [totalBalances] = useAtom(totalBalancesAtom);
  const enrichedBalances = useMemo(
    () => enrichBalancesArray(totalBalances),
    [totalBalances]
  );
  const totalAssetsValue = totalUSDValue(enrichedBalances);
  const [controllerAccounts] = useAtom(controllerAccountsAtom);

  const mergedHistory = useMemo(() => {
    const histories = controllerAccounts.map((account) => account.history);
    const firstHistory = histories[0];
    if (!firstHistory) {
      return [];
    }
    const newHistoryObj: DataPoint[] = [];
    for (let i = 0; i < firstHistory.length; i++) {
      const firstHistoryItem = firstHistory[i];
      if (!firstHistoryItem) {
        continue;
      } else {
        const allBalances = histories.map(
          (history) => history[i]?.balance ?? 0
        );
        const totalBalance = allBalances.reduce((a, b) => a + b, 0);
        newHistoryObj.push({
          date: firstHistoryItem.date,
          balance: totalBalance,
        });
      }
    }
    return newHistoryObj;
  }, [controllerAccounts]);

  return (
    <>
      <Head>
        <title>Whirlwind - Portfolio</title>
        <meta name="description" content="Tax-compliant zk-private trades" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="h-8"></div>
      <div>
        <div className="flex items-center justify-between">
          <div className="text-2xl">{Constants.InstitutionName}</div>
          <MembersView />
        </div>
      </div>
      <div className="h-8"></div>
      <div>
        <div className="flex gap-8">
          <div className="flex flex-1 flex-col gap-8">
            <div className="flex gap-12">
              <DisplayDollarAmount
                title="Total Assets"
                amountString={Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(Constants.TotalAssets)}
              />
              <DisplayDollarAmount
                title="Whirlwind Assets"
                amountString={`$${formatNumber(totalAssetsValue)}`}
              />
              <DisplayDollarAmount
                title="Trade Volume"
                amountString={`$${formatNumber(Constants.TradeVolume)}`}
              />
            </div>
            <DynamicLineChart data={mergedHistory} />
          </div>
          <div className="flex-1 border">ACTIVITY</div>
        </div>

        <div className="h-8"></div>
        <div>
          <div className="text-xl font-medium">
            Whirlwind Controller Accounts
          </div>
          <div className="h-4"></div>
          <div className="flex gap-4">
            {controllerAccounts.map((account) => {
              const enrichedAccountBalances = enrichBalancesArray(
                account.balances
              );
              return (
                <Card key={account.id} className="p-4">
                  <div>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {account.accountTitle}
                    </CardTitle>
                    <div className="text-2xl font-medium">
                      {`$${formatNumber(
                        totalUSDValue(enrichedAccountBalances)
                      )}`}
                    </div>
                  </div>
                  <div className="h-2"></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-6 rounded-full bg-gray-300"></div>
                    <div className="text-xs font-medium text-muted-foreground">
                      Assigned to
                      <br />
                      <span className="text-sm text-black">
                        {account.assignedTo}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
        <div className="h-8"></div>
        <div className="text-xl font-medium">Holdings</div>
        <div className="h-2"></div>
        <BalancesTable balanceRows={enrichedBalances} />
      </div>
      <div className="h-24"></div>
    </>
  );
};

export default PortfolioPage;
