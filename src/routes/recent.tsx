import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRecent } from "@/hooks/useLocalStorage";
import { streamsQuery } from "@/lib/streamfree";
import { StreamCard } from "@/components/StreamCard";
import { EmptyState } from "@/components/ErrorState";
import { SkeletonGrid } from "@/components/Skeletons";

export const Route = createFileRoute("/recent")({
  component: RecentPage,
  head: () => ({
    meta: [
      { title: "Recently Watched — StreamHub" },
      { name: "description", content: "Pick up where you left off — recently viewed matches." },
      { property: "og:url", content: "/recent" },
    ],
    links: [{ rel: "canonical", href: "/recent" }],
  }),
});

function RecentPage() {
  const { ids, hydrated } = useRecent();
  const { data, isLoading } = useQuery(streamsQuery());
  const map = new Map((data?.streams ?? []).map((s) => [s.stream_key, s] as const));
  const streams = ids.map((k) => map.get(k)).filter(Boolean) as NonNullable<ReturnType<typeof map.get>>[];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Recently Watched</h1>
      <p className="mt-1 text-muted-foreground">Your last 24 streams, kept locally.</p>
      <div className="mt-6">
        {!hydrated || isLoading ? (
          <SkeletonGrid />
        ) : streams.length === 0 ? (
          <EmptyState title="No history yet" message="Watch a match and it will show up here." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {streams.map((s) => <StreamCard key={s.stream_key} stream={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}