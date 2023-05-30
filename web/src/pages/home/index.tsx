import { type NextPage } from "next";
import Head from "next/head";
import { Constants, type DataPoint } from "../../lib/constants";
import { Card, CardTitle } from "../../components/ui/card";
import { formatNumber } from "../../lib/utils";
import { BalancesTable } from "../../components/BalancesTable";
import { useAtom } from "jotai";
import { useMemo } from "react";
import { enrichBalancesArray, totalUSDValue } from "../../lib/prices";
import {
  controllerAccountsAtom,
  totalBalancesAtom,
} from "../../jotai/balances";
import { MembersView } from "../../components/MembersView";
import dynamic from "next/dynamic";

const DynamicStackedLineChart = dynamic(
  () => import("../../components/StackedLineChart"),
  {
    ssr: false,
  }
);

function DisplayDollarAmount({
  title,
  amountString,
}: {
  title: string;
  amountString: string;
}) {
  return (
    <div className="">
      <div className="whitespace-nowrap text-sm font-normal text-text-1">
        {title}
      </div>
      <div className="text-3xl font-medium">{amountString}</div>
    </div>
  );
}

const ActivityItem = ({ name, text }: { name: string; text: string }) => {
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="h-6 w-6 shrink-0 rounded-full bg-black pr-2" />
      <p>
        <span className="font-medium">{`${name} `}</span>
        <span className="text-text-1">{text}</span>
      </p>
    </div>
  );
};

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
    <div>
      <Head>
        <title>Whirlwind - Portfolio</title>
        <meta name="description" content="Tax-compliant zk-private trades" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="-mx-4 my-8 flex justify-between rounded-xl border border-highlight bg-white px-4 py-2">
        <div className="py-2 text-lg font-medium">
          {Constants.InstitutionName}
        </div>
        <MembersView />
      </div>
      <div>
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-8 rounded-lg border border-highlight bg-white px-8 py-6">
            <div className="flex gap-12">
              <DisplayDollarAmount
                title="Total Assets"
                amountString={Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(Constants.TotalAssets)}
              />
              <DisplayDollarAmount
                title="Whirlwind Deposited Assets"
                amountString={`$${formatNumber(totalAssetsValue)}`}
              />
              <DisplayDollarAmount
                title="Whirlwind Migrated Assets"
                amountString={`$${formatNumber(Constants.TradeVolume)}`}
              />
            </div>
            <DynamicStackedLineChart
              data={mergedHistory.map((item) => ({
                date: item.date,
                balanceTop: item.balance,
                balanceMiddle: 20000,
                balanceBottom: 10000,
              }))}
            />
          </div>

          {/* Activity Section */}
          <div className="max-w-xs shrink-0 rounded-lg border border-highlight bg-white px-6 py-6 text-sm">
            <h1 className="text-lg font-medium">Activity</h1>
            <ActivityItem
              name="Max Wu"
              text="swapped 250K USDC for 189.48K OSMO"
            />
            <ActivityItem
              name="Longevity Fund II"
              text="approved 140K USDC for 10K ATOM"
            />
            <ActivityItem
              name="Bao Mai"
              text="swapped 12.8K OSMO for 19.4K DAI"
            />
            <ActivityItem
              name="Luke Saunders"
              text="swapped 250K USDC for 14,300 NTRN"
            />
            <ActivityItem
              name="Sunny Aggarwal"
              text="swapped 150K USDC for 160K OSMO"
            />
          </div>
        </div>

        <div className="h-4" />

        <div className="rounded-lg border border-highlight bg-white px-8 py-6">
          <div className="text-xl font-medium">
            Whirlwind Controller Accounts
          </div>
          <div className="h-4"></div>
          <div className="flex flex-wrap gap-4">
            {controllerAccounts.map((account) => {
              const enrichedAccountBalances = enrichBalancesArray(
                account.balances
              );
              return (
                <Card key={account.id} className="flex-1 px-6 py-4">
                  <div>
                    <CardTitle className="text-sm font-normal text-text-1">
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
                    <div className="h-6 w-6 rounded-full border bg-black"></div>
                    <div className="text-xs font-normal text-text-1">
                      Assigned to
                      <br />
                      <span className="text-sm font-medium text-black">
                        {account.assignedTo}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
        <div className="h-4" />
        <div className="rounded-lg border border-highlight bg-white px-8 py-6">
          <div className="text-xl font-medium">Holdings</div>
          <div className="h-2"></div>
          <BalancesTable balanceRows={enrichedBalances} />

          <div className="h-4" />
        </div>
        <div className="h-16" />
      </div>
    </div>
  );
};

export default PortfolioPage;
