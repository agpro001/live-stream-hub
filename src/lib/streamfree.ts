import { z } from "zod";

export const teamSchema = z.object({
  name: z.string(),
  logo: z.string().url().optional().nullable(),
});

export const streamSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  league: z.string().optional().nullable(),
  stream_key: z.string(),
  match_timestamp: z.number(),
  viewers: z.number().optional().nullable(),
  is_external: z.boolean().optional().nullable(),
  thumbnail_url: z.string().optional().nullable(),
  embed_url: z.string(),
  team1: teamSchema.optional().nullable(),
  team2: teamSchema.optional().nullable(),
});
export type Stream = z.infer<typeof streamSchema>;

export const streamsResponseSchema = z.object({
  count: z.number().optional(),
  streams: z.array(streamSchema),
});

export const categoriesResponseSchema = z.object({
  categories: z.array(z.string()),
});

export const CATEGORY_META: Record<
  string,
  { label: string; emoji: string; accent: string }
> = {
  soccer: { label: "Soccer", emoji: "⚽", accent: "from-emerald-400 to-cyan-400" },
  basketball: { label: "Basketball", emoji: "🏀", accent: "from-orange-400 to-red-500" },
  football: { label: "Football", emoji: "🏈", accent: "from-amber-400 to-orange-500" },
  baseball: { label: "Baseball", emoji: "⚾", accent: "from-sky-400 to-blue-500" },
  hockey: { label: "Hockey", emoji: "🏒", accent: "from-cyan-400 to-indigo-500" },
  tennis: { label: "Tennis", emoji: "🎾", accent: "from-lime-400 to-emerald-500" },
  cricket: { label: "Cricket", emoji: "🏏", accent: "from-teal-400 to-cyan-500" },
  combat: { label: "Combat", emoji: "🥊", accent: "from-rose-500 to-red-600" },
  racing: { label: "Racing", emoji: "🏁", accent: "from-fuchsia-400 to-purple-500" },
};

export function categoryMeta(cat: string) {
  return (
    CATEGORY_META[cat.toLowerCase()] ?? {
      label: cat.replace(/\b\w/g, (c) => c.toUpperCase()),
      emoji: "🎯",
      accent: "from-cyan-400 to-violet-500",
    }
  );
}

export function streamStatus(s: Stream, now = Date.now() / 1000) {
  const start = s.match_timestamp;
  const liveWindow = 3 * 60 * 60; // consider live for 3h after kickoff
  if (now < start) return "upcoming" as const;
  if (now - start < liveWindow) return "live" as const;
  return "finished" as const;
}

export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return (await res.json()) as T;
}

export const streamsQuery = () => ({
  queryKey: ["streams"] as const,
  queryFn: async () => {
    const data = await fetchJson<unknown>("/api/streams");
    return streamsResponseSchema.parse(data);
  },
  staleTime: 60_000,
  refetchInterval: 90_000,
});

export const categoriesQuery = () => ({
  queryKey: ["categories"] as const,
  queryFn: async () => {
    const data = await fetchJson<unknown>("/api/categories");
    return categoriesResponseSchema.parse(data);
  },
  staleTime: 30 * 60_000,
});

export const streamQuery = (key: string) => ({
  queryKey: ["stream", key] as const,
  queryFn: async () => {
    const res = await fetch(`/api/streams/${encodeURIComponent(key)}`);
    if (res.status === 404) return { found: false as const };
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const data = await res.json();
    return { found: true as const, stream: streamSchema.parse(data) };
  },
  staleTime: 30_000,
});