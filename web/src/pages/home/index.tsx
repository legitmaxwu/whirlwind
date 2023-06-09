import { type NextPage } from "next";
import Head from "next/head";
import {
  Constants,
  OTHER_ASSETS_HISTORY,
  type DataPoint,
} from "../../lib/constants";
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
import { fmtComma } from "../deposits";
import { fmtName } from "~/lib/fmt";

const DynamicStackedLineChart = dynamic(
  () => import("../../components/StackedLineChart"),
  {
    ssr: false,
  }
);

export const WhirlwindAvatar = ({ name }: { name: string }) => {
  return (
    <div className="bg-bg-secondary flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm">
      {fmtName(name)}
    </div>
  );
};

function DisplayDollarAmount({
  title,
  amountString,
  color,
}: {
  title: string;
  amountString: string;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <div className="whitespace-nowrap text-sm font-normal text-text-1">
          {title}
        </div>
      </div>
      <div className="text-3xl font-medium">{amountString}</div>
    </div>
  );
}

const ActivityItem = ({ name, text }: { name: string; text: string }) => {
  return (
    <div className="flex items-center gap-2 py-2">
      <WhirlwindAvatar name={name} />
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

  const CURR_DEPOSITED_ASSETS = 4900000;
  const lineChartsData = useMemo(() => {
    return mergedHistory.map((item, idx) => {
      const pastHalfway = idx > mergedHistory.length / 2;
      const otherAssets = OTHER_ASSETS_HISTORY[idx]?.balance ?? 0;
      return {
        date: item.date,
        balanceTop:
          item.balance +
          (pastHalfway ? CURR_DEPOSITED_ASSETS : 1900000) +
          otherAssets,
        balanceMiddle:
          item.balance + (pastHalfway ? CURR_DEPOSITED_ASSETS : 1900000),
        balanceBottom: item.balance,
      };
    });
  }, [mergedHistory]);

  const totalValue = lineChartsData[lineChartsData.length - 1]?.balanceTop ?? 0;

  return (
    <div>
      <Head>
        <title>Whirlwind - Portfolio</title>
        <meta name="description" content="Tax-compliant zk-private trades" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="pt-4">
        <div className="flex items-center justify-between rounded-xl bg-white px-8 py-2">
          <div className="text-2xl font-medium">
            {Constants.InstitutionName}
          </div>
          <MembersView />
        </div>
      </div>
      <div>
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-8 rounded-lg bg-white px-8 pb-6 pt-2">
            <div className="flex items-end gap-12">
              <div>
                <div className="whitespace-nowrap text-sm font-normal text-text-1">
                  Total Assets
                </div>
                <div className="text-4xl font-medium">
                  {`$${fmtComma(totalValue)}`}
                </div>
              </div>
              <DisplayDollarAmount
                title="Whirlwind Deposited Assets"
                color="#9b72cf"
                amountString={`$${formatNumber(CURR_DEPOSITED_ASSETS)}`}
              />
              <DisplayDollarAmount
                title="Migrated Assets (Private)"
                color="#532b88"
                amountString={`$${formatNumber(totalAssetsValue)}`}
              />
            </div>
            <DynamicStackedLineChart data={lineChartsData} />
          </div>

          {/* Activity Section */}
          <div className="max-w-xs shrink-0 rounded-lg  bg-white px-6 py-6 text-sm">
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

        <div className="rounded-lg bg-white px-8 py-6">
          <div className="text-xl font-medium">
            Anonymous Controller Accounts
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
                    <WhirlwindAvatar name={account.assignedTo} />
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
        <div className="rounded-lg bg-white px-8 py-6">
          <div className="text-xl font-medium">Holdings</div>
          <div className="h-4"></div>
          <BalancesTable balanceRows={enrichedBalances} />

          <div className="h-4" />
        </div>
        <div className="h-16" />
      </div>
    </div>
  );
};

export default PortfolioPage;
