import { useAtom } from "jotai";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { cn, formatNumber } from "~/lib/utils";
import { controllerAccountsAtom } from "../../jotai/balances";
import { enrichBalancesArray, totalUSDValue } from "../../lib/prices";
import { Card, CardTitle } from "../ui/card";
import { fmtComma } from "~/pages/deposits";

export function SwapLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [controllerAccounts] = useAtom(controllerAccountsAtom);

  const accountId = router.query.accountId as string;

  return (
    <div className="flex">
      <div className="flex flex-col gap-4 py-8">
        {controllerAccounts.map((account) => {
          const selected = account.id === accountId;
          const enrichedAccountBalances = enrichBalancesArray(account.balances);
          return (
            <Link key={account.id} href={`/accounts/${account.id}`}>
              <button
                className={cn({
                  "w-32 text-left": true,
                  "text-black opacity-100 transition-opaciy": selected,
                  "opacity-30": !selected,
                })}
              >
                <div className="text-base font-medium truncate">
                  {account.accountTitle}
                </div>
                <div className="text-base text-text-1">
                  {`$${fmtComma(totalUSDValue(enrichedAccountBalances))}`}
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
