"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { LogIn, LogOut, Menu, Upload, User, X } from "lucide-react";
import { Button } from "~/components/ui/button";

export function HeaderAuth() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  if (!session?.user) {
    return (
      <Button asChild variant="ghost" size="sm">
        <Link href="/signin">
          <LogIn className="size-4" />
          Sign in
        </Link>
      </Button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full p-1 transition hover:bg-muted"
      >
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name ?? "Avatar"}
            width={32}
            height={32}
            className="size-8 rounded-full"
            unoptimized
          />
        ) : (
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {(session.user.name ?? "U").charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden text-sm font-medium md:inline">
          {session.user.name}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border bg-card p-1 shadow-lg">
            <Link
              href="/me"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded px-3 py-2 text-sm transition hover:bg-muted"
            >
              <User className="size-4" />
              My Profile
            </Link>
            <Link
              href="/upload"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded px-3 py-2 text-sm transition hover:bg-muted"
            >
              <Upload className="size-4" />
              Upload Meme
            </Link>
            <hr className="my-1" />
            <Link
              href="/api/auth/signout"
              className="flex items-center gap-2 rounded px-3 py-2 text-sm text-destructive transition hover:bg-muted"
            >
              <LogOut className="size-4" />
              Sign out
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="rounded p-2 transition hover:bg-muted md:hidden"
        aria-label="Toggle menu"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <nav className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border bg-card p-1 shadow-lg md:hidden">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="block rounded px-3 py-2 text-sm transition hover:bg-muted"
            >
              Home
            </Link>
            <Link
              href="/upload"
              onClick={() => setOpen(false)}
              className="block rounded px-3 py-2 text-sm transition hover:bg-muted"
            >
              Upload
            </Link>
          </nav>
        </>
      )}
    </>
  );
}
