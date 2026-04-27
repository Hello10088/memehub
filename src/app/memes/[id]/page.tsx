import Link from "next/link";
import { notFound } from "next/navigation";
import { HydrateClient, api } from "~/trpc/server";
import { MemeDetail } from "./meme-detail";

type Params = Promise<{ id: string }>;

export default async function MemeDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const meme = await api.meme.byId({ id });

  if (!meme) notFound();

  return (
    <HydrateClient>
      <main className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="mb-4 inline-block text-sm text-muted-foreground transition hover:text-foreground"
        >
          &larr; Back
        </Link>
        <MemeDetail meme={meme} />
      </main>
    </HydrateClient>
  );
}
