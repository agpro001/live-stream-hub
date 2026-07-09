import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { streamsQuery, streamStatus, categoryMeta } from "@/lib/streamfree";
import { StreamCard } from "@/components/StreamCard";
import { CategoryTabs } from "@/components/CategoryTabs";
import { SkeletonGrid } from "@/components/Skeletons";
import { EmptyState, ErrorState } from "@/components/ErrorState";

const searchSchema = z.object({
  q: z.string().optional(),
  live: z.boolean().optional(),
  today: z.boolean().optional(),
  cat: z.string().optional(),
});

export const Route = createFileRoute("/browse")({
  component: BrowsePage,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Browse Live Sports — StreamHub" },
      { name: "description", content: "Browse every live and upcoming match across every sport, filter by category and search instantly." },
      { property: "og:title", content: "Browse Live Sports — StreamHub" },
      { property: "og:description", content: "Every live match, in one place." },
      { property: "og:url", content: "/browse" },
    ],
    links: [{ rel: "canonical", href: "/browse" }],
  }),
});

function BrowsePage() {
  const search = Route.useSearch();
  const nav = Route.useNavigate();
  const [localQ, setLocalQ] = useState(search.q ?? "");
  const { data, isLoading, isError, refetch } = useQuery(streamsQuery());
  const streams = data?.streams ?? [];
  const now = Date.now() / 1000;

  const filters = {
    q: (search.q ?? localQ ?? "").toLowerCase().trim(),
    live: Boolean(search.live),
    today: Boolean(search.today),
    cat: search.cat?.toLowerCase(),
  };

  const filtered = useMemo(() => {
    return streams
      .filter((s) => {
        if (filters.cat && s.category.toLowerCase() !== filters.cat) return false;
        if (filters.live && streamStatus(s, now) !== "live") return false;
        if (filters.today) {
          const d = new Date(s.match_timestamp * 1000).toDateString();
          const n = new Date().toDateString();
          if (d !== n) return false;
        }
        if (filters.q) {
          const hay = `${s.name} ${s.league ?? ""} ${s.category}`.toLowerCase();
          if (!hay.includes(filters.q)) return false;
        }
        return true;
      })
      .sort((a, b) => a.match_timestamp - b.match_timestamp);
  }, [streams, filters.q, filters.live, filters.today, filters.cat, now]);

  const toggle = (key: "live" | "today") => {
    nav({ search: (prev: z.infer<typeof searchSchema>) => ({ ...prev, [key]: prev[key] ? undefined : true }) });
  };

  return (
    <div className="space-y-6 pb-16 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Browse Live Sports</h1>
        <p className="mt-1 text-muted-foreground">Filter by sport, search across teams and leagues.</p>
      </div>

      <CategoryTabs />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <input
            aria-label="Search"
            value={localQ}
            onChange={(e) => {
              setLocalQ(e.target.value);
              nav({ search: (prev: z.infer<typeof searchSchema>) => ({ ...prev, q: e.target.value || undefined }) });
            }}
            placeholder="Search team, league or sport…"
            className="min-w-[260px] flex-1 rounded-full border border-border bg-secondary/40 px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Chip active={filters.live} onClick={() => toggle("live")}>Live now</Chip>
          <Chip active={filters.today} onClick={() => toggle("today")}>Today</Chip>
          {filters.cat && (
            <Link to="/browse" search={{ ...search, cat: undefined }}>
              <Chip active>{categoryMeta(filters.cat).emoji} {categoryMeta(filters.cat).label} ×</Chip>
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {isError ? (
          <ErrorState title="Server unavailable" onRetry={() => refetch()} />
        ) : isLoading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <EmptyState title="No matches found" message="Try clearing filters or checking back soon." />
        ) : (
          <>
            <div className="mb-3 text-sm text-muted-foreground" aria-live="polite">
              {filtered.length} match{filtered.length === 1 ? "" : "es"}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((s, i) => (
                <StreamCard key={s.stream_key} stream={s} priority={i < 8} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition " +
        (active
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-border bg-secondary/40 hover:bg-secondary")
      }
    >
      {children}
    </button>
  );
}