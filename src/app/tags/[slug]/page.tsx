import { Suspense } from "react";
import { HydrateClient, api } from "~/trpc/server";
import { MemeGrid } from "~/components/meme/meme-grid";

type Params = Promise<{ slug: string }>;

export default async function TagPage({ params }: { params: Params }) {
  const { slug } = await params;
  const tagName = slug.replace(/-/g, " ");
  const result = await api.meme.list({ tag: slug, limit: 30, sort: "latest" });

  return (
    <HydrateClient>
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-2 text-3xl font-extrabold capitalize">
          {tagName}
        </h1>
        <p className="mb-8 text-muted-foreground">
          {result.items.length} meme{result.items.length !== 1 ? "s" : ""}
        </p>
        <Suspense>
          <MemeGrid
            memes={result.items}
            emptyMessage={`No memes tagged with "${tagName}" yet.`}
          />
        </Suspense>
      </main>
    </HydrateClient>
  );
}
