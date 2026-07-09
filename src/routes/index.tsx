import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { streamsQuery, categoryMeta, streamStatus, type Stream } from "@/lib/streamfree";
import { Hero } from "@/components/Hero";
import { StreamRail } from "@/components/StreamRail";
import { CategoryTabs } from "@/components/CategoryTabs";
import { SkeletonRail } from "@/components/Skeletons";
import { ErrorState } from "@/components/ErrorState";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { data, isLoading, isError, refetch } = useQuery(streamsQuery());
  const streams = data?.streams ?? [];

  const now = Date.now() / 1000;
  const live = streams.filter((s) => streamStatus(s, now) === "live");
  const upcoming = streams
    .filter((s) => streamStatus(s, now) === "upcoming")
    .sort((a, b) => a.match_timestamp - b.match_timestamp);
  const finished = streams
    .filter((s) => streamStatus(s, now) === "finished")
    .sort((a, b) => b.match_timestamp - a.match_timestamp);
  const today = streams
    .filter((s) => {
      const d = new Date(s.match_timestamp * 1000);
      const n = new Date();
      return d.toDateString() === n.toDateString();
    })
    .sort((a, b) => a.match_timestamp - b.match_timestamp);
  const trending = [...streams].sort((a, b) => (b.viewers ?? 0) - (a.viewers ?? 0)).slice(0, 8);

  // Popular leagues
  const leagueMap = new Map<string, Stream[]>();
  for (const s of streams) {
    if (!s.league) continue;
    const arr = leagueMap.get(s.league) ?? [];
    arr.push(s);
    leagueMap.set(s.league, arr);
  }
  const popularLeagues = [...leagueMap.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 6);

  return (
    <div className="space-y-16 pb-16">
      <Hero liveCount={live.length} />

      <CategoryTabs />

      {isError && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ErrorState title="Server unavailable" message="Couldn't reach the stream service." onRetry={() => refetch()} />
        </div>
      )}

      {isLoading ? (
        <>
          <SkeletonRail title="Trending Live" />
          <SkeletonRail title="Today's Matches" />
        </>
      ) : (
        <>
          <StreamRail
            title="Trending Live"
            subtitle="What everyone is watching right now"
            streams={trending}
            emptyLabel="No trending streams yet."
          />
          <StreamRail
            title="Live Now"
            subtitle={`${live.length} match${live.length === 1 ? "" : "es"} streaming`}
            streams={live}
            emptyLabel="No live matches right now. Check upcoming below."
          />
          <StreamRail
            title="Today's Matches"
            subtitle="Everything happening today"
            streams={today}
            emptyLabel="Nothing scheduled for today."
          />

          <CategoriesGrid streams={streams} />

          <StreamRail
            title="Upcoming"
            subtitle="Next matches on deck"
            streams={upcoming.slice(0, 12)}
          />
          <StreamRail
            title="Recently Finished"
            subtitle="Just wrapped up"
            streams={finished.slice(0, 12)}
          />

          <section className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="mb-4 font-display text-2xl font-bold sm:text-3xl">Popular Leagues</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {popularLeagues.map(([league, arr]) => (
                <Link
                  key={league}
                  to="/browse"
                  search={{ q: league }}
                  className="group rounded-2xl border border-border bg-card/60 p-4 transition hover:border-primary/50 hover:bg-card"
                >
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{arr.length} matches</div>
                  <div className="mt-1 line-clamp-2 font-display font-semibold group-hover:text-gradient">{league}</div>
                </Link>
              ))}
              {popularLeagues.length === 0 && (
                <div className="col-span-full text-sm text-muted-foreground">No leagues to show.</div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function CategoriesGrid({ streams }: { streams: Stream[] }) {
  const counts = new Map<string, number>();
  for (const s of streams) counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
  const cats = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (!cats.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <h2 className="mb-4 font-display text-2xl font-bold sm:text-3xl">Categories</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cats.map(([c, n]) => {
          const m = categoryMeta(c);
          return (
            <Link
              key={c}
              to="/category/$category"
              params={{ category: c }}
              className={`group relative overflow-hidden rounded-2xl border border-border p-5 transition hover:border-primary/60`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${m.accent} opacity-15 transition-opacity group-hover:opacity-25`} />
              <div className="relative">
                <div className="text-3xl" aria-hidden>{m.emoji}</div>
                <div className="mt-2 font-display text-lg font-semibold">{m.label}</div>
                <div className="text-xs text-muted-foreground">{n} match{n === 1 ? "" : "es"}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
