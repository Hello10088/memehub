"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { api } from "~/trpc/react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function MemeUploadForm() {
  const router = useRouter();
  const utils = api.useUtils();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<"public" | "private" | "unlisted">("public");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const createMeme = api.meme.create.useMutation({
    onSuccess: (data) => {
      void utils.meme.list.invalidate();
      toast.success("Meme uploaded!");
      router.push(`/memes/${data.id}`);
    },
    onError: (e) => {
      setError(e.message);
      toast.error(e.message);
    },
  });

  const handleFile = useCallback((f: File | null) => {
    setError("");
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError("Unsupported file type. Allowed: jpg, png, webp, gif");
      return;
    }
    if (f.size > MAX_SIZE) {
      setError("File too large. Maximum size is 10MB");
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFile(e.dataTransfer.files[0] ?? null);
    },
    [handleFile],
  );

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.length >= 10) return;
    if (tags.includes(t)) return;
    if (t.length > 20) {
      setError("Each tag must be 20 characters or less");
      return;
    }
    setTags([...tags, t]);
    setTagInput("");
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select an image");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Upload failed");
      }
      const data = (await res.json()) as {
        url: string;
        mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
        size: number;
      };
      createMeme.mutate({
        title: title.trim(),
        description: description.trim() || undefined,
        imageUrl: data.url,
        mimeType: data.mimeType,
        size: data.size,
        visibility,
        tags,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      toast.error(msg);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* File drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 transition hover:border-primary/50"
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt="Preview"
              fill
              className="rounded-xl object-contain"
              unoptimized
            />
            <button
              type="button"
              onClick={() => { setFile(null); setPreview(null); }}
              className="absolute right-2 top-2 rounded-full bg-background/80 p-1 backdrop-blur hover:bg-background"
            >
              <X className="size-4" />
            </button>
          </>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-2 p-8 text-muted-foreground">
            <Upload className="size-10" />
            <span className="text-sm font-medium">Drop image here or click to browse</span>
            <span className="text-xs">jpg, png, webp, gif — max 10MB</span>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.gif"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </label>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="mb-1 block text-sm font-medium">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          placeholder="Give your meme a name..."
          className="w-full rounded-lg border bg-card px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
          rows={3}
          placeholder="Optional context..."
          className="w-full rounded-lg border bg-card px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Tags ({tags.length}/10)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            maxLength={20}
            placeholder="Add a tag..."
            className="flex-1 rounded-lg border bg-card px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={addTag}
            className="rounded-lg border px-4 py-2 text-sm transition hover:bg-muted"
          >
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs"
              >
                {t}
                <button type="button" onClick={() => removeTag(t)}>
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Visibility */}
      <div>
        <label className="mb-1 block text-sm font-medium">Visibility</label>
        <select
          value={visibility}
          onChange={(e) =>
            setVisibility(e.target.value as "public" | "private" | "unlisted")
          }
          className="w-full rounded-lg border bg-card px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="public">Public — visible to everyone</option>
          <option value="unlisted">Unlisted — hidden from search, accessible by link</option>
          <option value="private">Private — only you can see it</option>
        </select>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={uploading || createMeme.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        {(uploading || createMeme.isPending) && (
          <Loader2 className="size-4 animate-spin" />
        )}
        {uploading ? "Uploading..." : createMeme.isPending ? "Saving..." : "Upload Meme"}
      </button>
    </form>
  );
}
