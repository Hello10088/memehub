"use client";

import Image from "next/image";
import Link from "next/link";
import { Download, Heart } from "lucide-react";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";

type MemeCardData = {
  id: string;
  title: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  tags: { id: string; name: string; slug: string }[];
  favoriteCount: number;
  isFavorited: boolean;
  uploader: { id: string; name: string | null; image: string | null } | null;
  createdAt: Date;
};

export function MemeCard({ meme }: { meme: MemeCardData }) {
  const utils = api.useUtils();

  const toggleFavorite = api.favorite.toggle.useMutation({
    onSuccess: () => {
      void utils.meme.list.invalidate();
    },
  });

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite.mutate({ memeId: meme.id });
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = meme.imageUrl;
    link.download = `${meme.title}.${meme.imageUrl.split(".").pop()?.split("?")[0] ?? "jpg"}`;
    link.target = "_blank";
    link.click();
  };

  return (
    <Link href={`/memes/${meme.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border bg-card transition hover:shadow-md">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={meme.thumbnailUrl ?? meme.imageUrl}
            alt={meme.title}
            fill
            className="object-cover transition group-hover:scale-105"
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
          <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
            <button
              onClick={handleDownload}
              className="rounded-full bg-background/80 p-2 backdrop-blur transition hover:bg-background"
              aria-label="Download"
            >
              <Download className="size-4" />
            </button>
          </div>
        </div>

        <div className="p-3">
          <h3 className="truncate font-semibold text-sm">{meme.title}</h3>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {meme.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="inline-block rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                >
                  {tag.name}
                </span>
              ))}
              {meme.tags.length > 3 && (
                <span className="inline-block rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  +{meme.tags.length - 3}
                </span>
              )}
            </div>

            <button
              onClick={handleFavorite}
              disabled={toggleFavorite.isPending}
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-1 text-xs transition",
                meme.isFavorited
                  ? "text-red-500 hover:bg-red-50"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Heart
                className={cn("size-3.5", meme.isFavorited && "fill-current")}
              />
              {meme.favoriteCount}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
