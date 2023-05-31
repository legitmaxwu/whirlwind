import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { cn } from "~/lib/utils";
import { WhirlwindAvatar } from "~/pages/home";

const NAV_PAGES = [
  {
    href: "/home",
    label: "Home",
  },
  {
    href: "/deposits",
    label: "Deposits",
  },
  {
    href: "/accounts",
    label: "Accounts",
  },
];

function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const router = useRouter();
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {NAV_PAGES.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn({
            "text-sm font-medium transition-opacity hover:opacity-100": true,
            "opacity-40": router.pathname !== href,
          })}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between px-4 py-3 shadow-sm">
        <div className="flex flex-1 items-center">
          <Image
            src="/whirlwind-logo-black.png"
            alt="Whirlwind Logo"
            width={120}
            height={1}
            // className="flex-1"
          />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <MainNav />
        </div>
        <div className="flex flex-1 items-center justify-end gap-2 text-sm">
          <p>Bill Ackman</p>
          <WhirlwindAvatar name={"Bill Ackman"}/>
        </div>
      </div>
      <div className="bg-bg-1">
        <div className="mx-auto max-w-6xl">{children}</div>
      </div>
    </div>
  );
}
