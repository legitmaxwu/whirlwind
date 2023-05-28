import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { cn } from "~/lib/utils";

const NAV_PAGES = [
  {
    href: "/portfolio",
    label: "Portfolio",
  },
  {
    href: "/swap",
    label: "Swap",
  },
  {
    href: "/proposals",
    label: "Proposals",
  },
  {
    href: "/traders",
    label: "Traders",
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
            "text-sm font-medium transition-colors hover:text-primary": true,
            "text-muted-foreground": router.pathname !== href,
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
            width={150}
            height={1}
            // className="flex-1"
          />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <MainNav />
        </div>
        <div className="flex flex-1 items-center justify-end gap-4 text-sm text-primary">
          Bao Mai
          <div className="h-7 w-7 rounded-full bg-gray-400"></div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl">{children}</div>
    </div>
  );
}
