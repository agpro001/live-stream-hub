export function SkeletonCard() {
  return (
    <div className="w-[280px] shrink-0 sm:w-[320px]">
      <div className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card/60">
        <div className="aspect-video bg-secondary/60" />
        <div className="space-y-2 p-4">
          <div className="h-3 w-1/3 rounded bg-secondary/60" />
          <div className="h-4 w-4/5 rounded bg-secondary/60" />
          <div className="h-3 w-1/2 rounded bg-secondary/60" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonRail({ title }: { title: string }) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6" aria-busy="true" aria-live="polite">
      <h2 className="mb-4 font-display text-2xl font-bold">{title}</h2>
      <div className="-mx-4 flex gap-4 overflow-x-hidden px-4 sm:-mx-6 sm:px-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </section>
  );
}

export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card/60">
          <div className="aspect-video bg-secondary/60" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-1/3 rounded bg-secondary/60" />
            <div className="h-4 w-4/5 rounded bg-secondary/60" />
          </div>
        </div>
      ))}
    </div>
  );
}