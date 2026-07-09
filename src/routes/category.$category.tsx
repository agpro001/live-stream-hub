import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { streamsQuery, categoryMeta } from "@/lib/streamfree";
import { StreamCard } from "@/components/StreamCard";
import { CategoryTabs } from "@/components/CategoryTabs";
import { SkeletonGrid } from "@/components/Skeletons";
import { EmptyState, ErrorState } from "@/components/ErrorState";

export const Route = createFileRoute("/category/$category")({
  component: CategoryPage,
  head: ({ params }) => {
    const m = categoryMeta(params.category);
    return {
      meta: [
        { title: `${m.label} — Live Matches | StreamHub` },
        { name: "description", content: `Watch live ${m.label.toLowerCase()} matches from around the world on StreamHub.` },
        { property: "og:title", content: `${m.label} — Live on StreamHub` },
        { property: "og:description", content: `Live ${m.label} streams, cinematic UI.` },
        { property: "og:url", content: `/category/${params.category}` },
      ],
      links: [{ rel: "canonical", href: `/category/${params.category}` }],
    };
  },
});

function CategoryPage() {
  const { category } = Route.useParams();
  const { data, isLoading, isError, refetch } = useQuery(streamsQuery());
  const m = categoryMeta(category);
  const streams = (data?.streams ?? [])
    .filter((s) => s.category.toLowerCase() === category.toLowerCase())
    .sort((a, b) => a.match_timestamp - b.match_timestamp);

  return (
    <div className="space-y-6 pb-16 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav className="mb-3 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2" aria-hidden>/</span>
          <Link to="/browse" className="hover:text-foreground">Browse</Link>
          <span className="mx-2" aria-hidden>/</span>
          <span className="text-foreground">{m.label}</span>
        </nav>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          <span aria-hidden className="mr-2">{m.emoji}</span> {m.label}
        </h1>
        <p className="mt-1 text-muted-foreground">All live and upcoming {m.label.toLowerCase()} matches.</p>
      </div>
      <CategoryTabs />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {isError ? (
          <ErrorState title="Server unavailable" onRetry={() => refetch()} />
        ) : isLoading ? (
          <SkeletonGrid />
        ) : streams.length === 0 ? (
          <EmptyState title="No matches in this sport right now" message="Try another category or come back later." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {streams.map((s, i) => <StreamCard key={s.stream_key} stream={s} priority={i < 8} />)}
          </div>
        )}
      </div>
    </div>
  );
}