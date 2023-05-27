import Image from "next/image";
import Link from "next/link";

import { cn } from "~/lib/utils";

function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/portfolio"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Portfolio
      </Link>
      <Link
        href="/swap"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Swap
      </Link>
      <Link
        href="/proposals"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Proposals
      </Link>
      <Link
        href="/people"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        People
      </Link>
    </nav>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between px-4 py-3">
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
      {children}
    </div>
  );
}
