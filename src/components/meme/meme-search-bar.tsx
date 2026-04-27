"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search, X, Loader2 } from "lucide-react";

export function MemeSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      startTransition(() => {
        router.push(`/?${params.toString()}`);
      });
    },
    [value, router, searchParams],
  );

  const clear = useCallback(() => {
    setValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  }, [router, searchParams]);

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
      <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
      {isPending && (
        <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search memes by mood, keyword, or tag..."
        className="w-full rounded-xl border bg-card py-3 pl-10 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      {value && !isPending && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </form>
  );
}
