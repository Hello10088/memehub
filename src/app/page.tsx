import Link from "next/link";
import { Suspense } from "react";
import { auth } from "~/server/auth";
import { HydrateClient, api } from "~/trpc/server";
import { MemeGrid } from "~/components/meme/meme-grid";
import { MemeGridSkeleton } from "~/components/meme/meme-grid-skeleton";
import { MemeSearchBar } from "~/components/meme/meme-search-bar";
import { TagList } from "~/components/meme/tag-list";

type SearchParams = Promise<{ q?: string; tag?: string; sort?: string }>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const params = await searchParams;
  const query = params.q;
  const tag = params.tag;
  const sort = params.sort === "popular" ? "popular" : "latest";

  const result = await api.meme.list({ query, tag, sort, limit: 20 });

  return (
    <HydrateClient>
      <main className="min-h-screen">
        <section className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Today&apos;s mood?
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Find the perfect meme reaction. Search, collect, share.
            </p>

            {session?.user && (
              <Link
                href="/upload"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90"
              >
                Upload Meme
              </Link>
            )}

            {!session?.user && result.items.length === 0 && (
              <Link
                href="/signin"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90"
              >
                Get Started — It&apos;s Free
              </Link>
            )}

            <div className="mx-auto mt-6 flex justify-center">
              <Suspense>
                <MemeSearchBar />
              </Suspense>
            </div>

            <div className="mx-auto mt-6 max-w-2xl">
              <p className="mb-3 text-sm text-muted-foreground">
                Popular tags
              </p>
              <Suspense fallback={<div className="h-8" />}>
                <TagList />
              </Suspense>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {query
                ? `Results for "${query}"`
                : tag
                  ? `Tag: ${tag}`
                  : "Latest Memes"}
            </h2>
            <div className="flex gap-2 text-sm">
              <a
                href={`/?${new URLSearchParams({ ...(query && { q: query }), ...(tag && { tag }), sort: "latest" }).toString()}`}
                className={
                  sort === "latest"
                    ? "font-semibold underline"
                    : "text-muted-foreground"
                }
              >
                Latest
              </a>
              <a
                href={`/?${new URLSearchParams({ ...(query && { q: query }), ...(tag && { tag }), sort: "popular" }).toString()}`}
                className={
                  sort === "popular"
                    ? "font-semibold underline"
                    : "text-muted-foreground"
                }
              >
                Popular
              </a>
            </div>
          </div>

          <Suspense fallback={<MemeGridSkeleton />}>
            <MemeGrid
              memes={result.items}
              emptyMessage={
                query
                  ? `No memes found for "${query}". Try another keyword.`
                  : "No memes yet. Upload your first one!"
              }
            />
          </Suspense>
        </section>
      </main>
    </HydrateClient>
  );
}
