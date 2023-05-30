import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { Constants } from "../lib/constants";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Card, CardTitle } from "../components/ui/card";
import numeral from "numeral";
import { formatNumber } from "../lib/utils";
import { BalancesTable } from "../components/BalancesTable";

export function MembersView() {
  const firstThreeMembers = Constants.InstitutionMembers.slice(0, 3);
  // three overlapping avatars
  return (
    <div className="grid grid-cols-3">
      {firstThreeMembers.map((member, index) => (
        <Avatar
          className="flex flex-col items-center justify-center"
          key={member.id}
          style={{ marginLeft: `-${index * 0.9}rem` }}
        >
          <AvatarImage
            src={member.profileImageSrc}
            alt={member.name}
            className="h-8 w-8 rounded-full border border-black"
            style={{
              position: "relative",
              zIndex: firstThreeMembers.length - index,
            }}
          />
          <AvatarFallback>
            {member.name.split(" ").map((name) => name[0]?.toUpperCase())}
          </AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}

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
                amountString={`$${formatNumber(Constants.WhirlwindAssets)}`}
              />
              <DisplayDollarAmount
                title="Trade Volume"
                amountString={`$${formatNumber(Constants.TradeVolume)}`}
              />
            </div>
            <div className="h-96 border">GRAPH</div>
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
            {Constants.ControllerAccounts.map((account) => (
              <Card key={account.id} className="p-4">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {account.accountTitle}
                  </CardTitle>
                  <div className="text-2xl font-medium">
                    ${formatNumber(account.balance)}
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
            ))}
          </div>
        </div>
        <div className="h-8"></div>
        <div className="text-xl font-medium">Holdings</div>
        <div className="h-2"></div>
        <BalancesTable />
      </div>
      <div className="h-24"></div>
    </>
  );
};

export default PortfolioPage;
