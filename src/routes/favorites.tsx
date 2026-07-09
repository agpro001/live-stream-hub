import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useFavorites } from "@/hooks/useLocalStorage";
import { streamsQuery } from "@/lib/streamfree";
import { StreamCard } from "@/components/StreamCard";
import { EmptyState } from "@/components/ErrorState";
import { SkeletonGrid } from "@/components/Skeletons";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
  head: () => ({
    meta: [
      { title: "Favorites — StreamHub" },
      { name: "description", content: "Your favorite live matches, saved for quick access." },
      { property: "og:url", content: "/favorites" },
    ],
    links: [{ rel: "canonical", href: "/favorites" }],
  }),
});

function FavoritesPage() {
  const { ids, hydrated } = useFavorites();
  const { data, isLoading } = useQuery(streamsQuery());
  const streams = (data?.streams ?? []).filter((s) => ids.includes(s.stream_key));

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Your Favorites</h1>
      <p className="mt-1 text-muted-foreground">Saved live matches, kept locally in your browser.</p>
      <div className="mt-6">
        {!hydrated || isLoading ? (
          <SkeletonGrid />
        ) : streams.length === 0 ? (
          <EmptyState title="No favorites yet" message="Tap the heart on any match to save it here." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {streams.map((s) => <StreamCard key={s.stream_key} stream={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}