import { useAtom } from "jotai";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { cn, formatNumber } from "~/lib/utils";
import { controllerAccountsAtom } from "../../jotai/balances";
import { enrichBalancesArray, totalUSDValue } from "../../lib/prices";
import { Card, CardTitle } from "../ui/card";

export function SwapLayout({ children }: { children: React.ReactNode }) {
  const [controllerAccounts] = useAtom(controllerAccountsAtom);

  return (
    <div className="flex w-full">
      <div className="flex flex-col gap-2 py-8">
        {controllerAccounts.map((account) => {
          const enrichedAccountBalances = enrichBalancesArray(account.balances);
          return (
            <Link key={account.id} href={`/swap/${account.id}`}>
              <Card role="button" className="p-4 text-right">
                <CardTitle className="text-lg font-medium">
                  {account.accountTitle}
                </CardTitle>
                <div className="text-md font-medium text-muted-foreground">
                  {`$${formatNumber(totalUSDValue(enrichedAccountBalances))}`}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
