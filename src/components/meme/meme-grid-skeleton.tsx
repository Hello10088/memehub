export function MemeGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border bg-muted"
        >
          <div className="aspect-square rounded-t-xl bg-muted-foreground/10" />
          <div className="space-y-2 p-3">
            <div className="h-4 w-3/4 rounded bg-muted-foreground/10" />
            <div className="h-3 w-1/2 rounded bg-muted-foreground/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
