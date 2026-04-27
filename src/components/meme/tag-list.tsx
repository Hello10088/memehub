import Link from "next/link";
import { api } from "~/trpc/server";

export async function TagList() {
  const tags = await api.tag.list({ limit: 15 });

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/tags/${tag.slug}`}
          className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground transition hover:bg-secondary/80"
        >
          {tag.name}
          <span className="text-xs text-muted-foreground">{tag.count}</span>
        </Link>
      ))}
    </div>
  );
}
