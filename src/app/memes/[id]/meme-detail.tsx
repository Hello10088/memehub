"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Download,
  Heart,
  Copy,
  Check,
  Trash2,
  Calendar,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { api, type RouterOutputs } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

type MemeDetail = NonNullable<RouterOutputs["meme"]["byId"]>;

export function MemeDetail({ meme }: { meme: MemeDetail }) {
  const router = useRouter();
  const utils = api.useUtils();
  const [copied, setCopied] = useState(false);

  const toggleFavorite = api.favorite.toggle.useMutation({
    onSuccess: () => {
      void utils.meme.byId.invalidate({ id: meme.id });
      void utils.meme.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMeme = api.meme.delete.useMutation({
    onSuccess: () => {
      void utils.meme.list.invalidate();
      toast.success("Meme deleted");
      router.push("/");
      router.refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleCopy = () => {
    void navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = meme.imageUrl;
    link.download = `${meme.title}.${meme.mimeType.split("/")[1] ?? "jpg"}`;
    link.target = "_blank";
    link.click();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* Image */}
      <div className="flex items-start justify-center rounded-xl bg-muted p-4">
        <div className="relative max-h-[70vh] w-full">
          <Image
            src={meme.imageUrl}
            alt={meme.title}
            width={meme.width ?? 800}
            height={meme.height ?? 800}
            className="h-auto max-h-[70vh] w-full rounded-lg object-contain"
            unoptimized
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{meme.title}</h1>
          {meme.description && (
            <p className="mt-2 text-muted-foreground">{meme.description}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {meme.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="rounded-full bg-secondary px-3 py-1 text-sm transition hover:bg-secondary/80"
            >
              {tag.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="size-4" />
            {meme.uploader?.name ?? "Unknown"}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="size-4" />
            {meme.createdAt.toLocaleDateString()}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toggleFavorite.mutate({ memeId: meme.id })
            }
            disabled={toggleFavorite.isPending}
          >
            <Heart
              className={cn(
                "size-4",
                meme.isFavorited && "fill-red-500 text-red-500",
              )}
            />
            {meme.isFavorited ? "Saved" : "Favorite"} ({meme.favoriteCount})
          </Button>

          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="size-4" />
            Download
          </Button>

          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <Check className="size-4 text-green-500" />
            ) : (
              <Copy className="size-4" />
            )}
            {copied ? "Copied" : "Copy Link"}
          </Button>

          {meme.visibility !== "public" && (
            <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs">
              {meme.visibility === "private" ? "Private" : "Unlisted"}
            </span>
          )}
        </div>

        {/* Delete (owner only) */}
        <div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("Delete this meme? This cannot be undone.")) {
                deleteMeme.mutate({ id: meme.id });
              }
            }}
            disabled={deleteMeme.isPending}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
