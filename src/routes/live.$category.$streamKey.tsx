import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { streamQuery, streamsQuery, categoryMeta } from "@/lib/streamfree";
import { Player } from "@/components/Player";
import { StreamRail } from "@/components/StreamRail";
import { ErrorState } from "@/components/ErrorState";
import { useRecent } from "@/hooks/useLocalStorage";
import { slugToTitle } from "@/lib/format";

export const Route = createFileRoute("/live/$category/$streamKey")({
  component: LivePage,
  head: ({ params }) => {
    const title = slugToTitle(params.streamKey);
    const m = categoryMeta(params.category);
    return {
      meta: [
        { title: `${title} — Live ${m.label} | StreamHub` },
        { name: "description", content: `Watch ${title} live on StreamHub. Fullscreen, PiP and share supported.` },
        { property: "og:title", content: `${title} — Live on StreamHub` },
        { property: "og:description", content: `Live ${m.label} match on StreamHub.` },
        { property: "og:type", content: "video.other" },
        { property: "og:url", content: `/live/${params.category}/${params.streamKey}` },
      ],
      links: [{ rel: "canonical", href: `/live/${params.category}/${params.streamKey}` }],
    };
  },
});

function LivePage() {
  const { category, streamKey } = Route.useParams();
  const q = useQuery(streamQuery(streamKey));
  const list = useQuery(streamsQuery());
  const { push } = useRecent();

  useEffect(() => {
    if (q.data?.found) push(streamKey);
     
  }, [q.data?.found, streamKey]);

  const related = (list.data?.streams ?? [])
    .filter((s) => s.stream_key !== streamKey && s.category.toLowerCase() === category.toLowerCase())
    .slice(0, 12);

  return (
    <div className="pb-16 pt-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {q.isError ? (
          <ErrorState title="Server unavailable" onRetry={() => q.refetch()} />
        ) : q.isLoading ? (
          <div className="space-y-4">
            <div className="h-8 w-1/3 animate-pulse rounded bg-secondary/60" />
            <div className="aspect-video w-full animate-pulse rounded-2xl bg-secondary/60" />
          </div>
        ) : q.data && !q.data.found ? (
          <MatchEnded category={category} streamKey={streamKey} />
        ) : q.data?.found ? (
          <Player stream={q.data.stream} />
        ) : null}
      </div>

      <div className="mt-12">
        <StreamRail
          title="Related Matches"
          subtitle={`More ${categoryMeta(category).label.toLowerCase()} to watch`}
          streams={related}
          emptyLabel="No related matches right now."
        />
      </div>
    </div>
  );
}

function MatchEnded({ category, streamKey }: { category: string; streamKey: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card/60 p-10 text-center">
      <div className="mb-3 text-4xl" aria-hidden>🏁</div>
      <h1 className="font-display text-2xl font-bold">This match has ended.</h1>
      <p className="mt-1 text-muted-foreground">The stream <code className="text-foreground">{streamKey}</code> is no longer available.</p>
      <div className="mt-6 flex justify-center gap-2">
        <Link to="/category/$category" params={{ category }} className="rounded-full border border-border bg-secondary/40 px-4 py-2 text-sm hover:bg-secondary">
          More {categoryMeta(category).label}
        </Link>
        <Link to="/browse" className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
          Browse all live
        </Link>
      </div>
    </div>
  );
}