import Link from "next/link";
import { Cat } from "lucide-react";
import { HeaderAuth, MobileMenu } from "./header-auth";

export async function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Cat className="size-6" />
          <span>MemeBox</span>
        </Link>

        <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
          <Link href="/" className="transition hover:text-foreground/80">
            Home
          </Link>
          <Link href="/upload" className="transition hover:text-foreground/80">
            Upload
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <HeaderAuth />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
