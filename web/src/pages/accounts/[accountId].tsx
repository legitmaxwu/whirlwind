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
import { useMemo, useState } from "react";
import { enrichBalancesArray, totalUSDValue } from "../../lib/prices";
import { formatDelta, formatNumber } from "../../lib/utils";
import dynamic from "next/dynamic";
import { TOKEN_LOGOS } from "~/lib/constants";
import { clsx } from "clsx";
import { fmtAvailable, fmtComma, fromMicroDenom } from "~/lib/fmt";
import { ArrowDownIcon, ChevronDownIcon } from "lucide-react";

const DynamicLineChart = dynamic(() => import("../../components/LineChart"), {
  ssr: false,
});

type SwapFieldProps = {
  symbol: string;
  available?: number;
  selected: boolean;
  onChange: (value: string) => void;

  onTokenClick?: () => void;
  value?: string;
  isOutput?: boolean;
};

const SwapField = ({
  symbol,
  available,
  selected,
  onChange,
  onTokenClick,
  value,
  isOutput,
}: SwapFieldProps) => {
  return (
    <div className="border-border-secondary flex w-full flex-row items-center justify-between rounded-lg border p-2 font-medium text-black">
      <div
        className={clsx(
          "flex flex-grow basis-0 cursor-pointer flex-row items-center gap-2 rounded-lg py-1 pl-2 pr-4",
          selected && "bg-highlight"
        )}
        onClick={onTokenClick}
      >
        <img className="h-10 w-10 object-cover" src={TOKEN_LOGOS[symbol]} />
        <div className="shrink-0">
          <p className="font-medium">{symbol}</p>
          <p
            className={clsx(
              "text-sm text-[#888]",
              available == undefined && "loading"
            )}
          >
            {available != undefined ? (
              `${fmtAvailable(available)} available`
            ) : (
              <span className="invisible">Invisible</span>
            )}
          </p>
        </div>
      </div>
      <div
        className={clsx(
          "flex-grow basis-0 overflow-hidden px-2",
          value == undefined && isOutput && "loading"
        )}
      >
        {/* Field text here  */}
        <input
          className="float-right bg-transparent text-right outline-none"
          placeholder="0"
          type="number"
          onChange={(ev) => onChange(ev.target.value)}
          value={value}
        />
      </div>
    </div>
  );
};

const SwapInfoDropdown = ({
  tokenRatioSimple,
  inputAmount,
  outputAmount,
  minOutput,
  slippage,
  token0,
  token1,
  priceImpact,
}: {
  tokenRatioSimple?: string;
  outputAmount?: number;
  minOutput?: number;
  priceImpact?: number;

  inputAmount: number;
  slippage: number;
  token0: string;
  token1: string;
}) => {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="border-border-secondary my-2 flex flex-col rounded-lg border bg-slate-50 p-2 px-4 text-sm font-medium text-[#888]">
      <div
        className="flex cursor-pointer items-center justify-between"
        onClick={() => setInfoOpen(!infoOpen)}
      >
        <p className={clsx(!tokenRatioSimple && "loading")}>
          {tokenRatioSimple
            ? `1 ${token0} ~ ${fromMicroDenom(tokenRatioSimple)} ${token1}`
            : `Invisible`}
        </p>
        <ChevronDownIcon height={14} />
      </div>

      <div
        className={clsx(
          "100ms w-full overflow-hidden text-sm transition-[height] ease-in-out",
          infoOpen ? "h-48" : "h-0"
        )}
      >
        <div className="py-2 font-normal">
          <div className="pb-2">
            <span>
              {`You are swapping ${fmtComma(
                inputAmount
              )} ${token0} for a minimum of `}
            </span>
            <span className={clsx(minOutput == undefined && "loading")}>
              {minOutput != undefined ? `${fmtComma(minOutput)}` : "Invisible"}
            </span>
            <span>
              {` ${token1} (${slippage * 100}% slippage). 
        Once signed, the order cannot be canceled, but will expire within 10 seconds.`}
            </span>
          </div>
          <div className="flex flex-row justify-between py-1">
            <p>Estimated output</p>
            <p>
              <span className={clsx(outputAmount == undefined && "loading")}>
                {outputAmount ?? "Invisible"}
              </span>
              {` ${token1}`}
            </p>
          </div>
          <div className="flex flex-row justify-between">
            <p>Minimum output</p>
            <p>
              <span className={clsx(minOutput == undefined && "loading")}>
                {minOutput ?? "Invisible"}
              </span>
              {` ${token1}`}
            </p>
          </div>
          <div className="flex flex-row justify-between py-1">
            <p>Price impact</p>
            <p className={clsx(priceImpact == undefined && "loading")}>
              {priceImpact != undefined
                ? `${fmtComma(priceImpact * 100)}%`
                : "Invisible"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

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

  const token0 = "USDC";
  const token1 = "OSMO";
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
        {/* Swap section */}
        <div className="w-full flex-1 shrink-0 px-4 py-4">
          <h1 className="py-2 text-lg font-medium">Swap</h1>
          {/* Inputs */}
          <div className="flex flex-col items-center gap-2">
            <SwapField
              symbol={"USDC"}
              selected={false}
              available={12432.8}
              onChange={() => {}}
            />
            <div className="z-10 -my-5 rounded-full border border-highlight bg-highlight p-2">
              <ArrowDownIcon height={18} />
            </div>
            <SwapField
              symbol={"OSMO"}
              selected={false}
              available={480323.8}
              onChange={() => {}}
            />
            <div className="flex w-full justify-between px-4">
              <p>Estimated value</p>
              <p>$0.00</p>
            </div>
            <div className="flex w-full justify-between px-4">
              <p>Estimated cost</p>
              <p>$0.00</p>
            </div>
            <div>
            <SwapInfoDropdown
              inputAmount={324}
              outputAmount={459.49}
              minOutput={420.34}
              slippage={0.01}
              token0={token0}
              token1={token1}
              tokenRatioSimple="3"
            />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

SwapAccountPage.getLayout = (page) => {
  return <SwapLayout>{page}</SwapLayout>;
};

export default SwapAccountPage;
