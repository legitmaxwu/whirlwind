import { useAtom } from "jotai";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { cn, formatNumber } from "~/lib/utils";
import { controllerAccountsAtom } from "../../jotai/balances";
import { enrichBalancesArray, totalUSDValue } from "../../lib/prices";
import { Card, CardTitle } from "../ui/card";

export function SwapLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [controllerAccounts] = useAtom(controllerAccountsAtom);

  const accountId = router.query.accountId as string;

  return (
    <div className="flex w-full">
      <div className="flex flex-col gap-4 py-8">
        {controllerAccounts.map((account) => {
          const selected = account.id === accountId;
          const enrichedAccountBalances = enrichBalancesArray(account.balances);
          return (
            <Link key={account.id} href={`/accounts/${account.id}`}>
              <button
                className={cn({
                  "w-48 text-right": true,
                  "text-primary": selected,
                  "text-gray-400": !selected,
                })}
              >
                <div className="truncate text-lg font-medium">
                  {account.accountTitle}
                </div>
                <div className="text-md">
                  {`$${formatNumber(totalUSDValue(enrichedAccountBalances))}`}
                </div>
              </button>
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
