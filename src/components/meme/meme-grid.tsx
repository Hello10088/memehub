import { MemeCard } from "./meme-card";
import type { RouterOutputs } from "~/trpc/react";

type MemeListItem = RouterOutputs["meme"]["list"]["items"][number];

export function MemeGrid({
  memes,
  emptyMessage = "No memes yet. Upload your first one!",
}: {
  memes: MemeListItem[];
  emptyMessage?: string;
}) {
  if (memes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {memes.map((meme) => (
        <MemeCard key={meme.id} meme={meme} />
      ))}
    </div>
  );
}
