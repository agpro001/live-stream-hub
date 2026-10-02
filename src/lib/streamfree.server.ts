const API_BASE = "https://streamfree.top/api/v1";

type CacheEntry = { expires: number; data: unknown };
const cache = new Map<string, CacheEntry>();
const MAX_CACHE_ENTRIES = 200;
const QUALITY_RANK = new Map([
  [2160, 7],
  [1440, 6],
  [1080, 5],
  [720, 4],
  [540, 3],
  [480, 2],
  [360, 1],
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUsableUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function qualityRank(url: string): number {
  const match = url.match(/(\d{3,4})p\b/i);
  if (!match) return 0;
  return QUALITY_RANK.get(Number(match[1])) ?? 0;
}

function pickEmbedUrl(stream: Record<string, unknown>): string {
  if (isUsableUrl(stream.embed_url)) return stream.embed_url;
  if (!Array.isArray(stream.sources)) return "";

  const candidates = stream.sources.filter(isUsableUrl);
  if (candidates.length === 0) return "";

  candidates.sort((a, b) => qualityRank(b) - qualityRank(a));
  return candidates[0] ?? "";
}

function normaliseStream(value: unknown): unknown {
  if (!isRecord(value)) return value;
  return {
    ...value,
    embed_url: pickEmbedUrl(value),
  };
}

function normalisePayload(value: unknown): unknown {
  if (!isRecord(value)) return value;

  if (Array.isArray(value.streams)) {
    return {
      ...value,
      streams: value.streams.map((stream) => normaliseStream(stream)),
    };
  }

  if ("stream_key" in value) {
    return normaliseStream(value);
  }

  return value;
}

function getCache(path: string, now: number): CacheEntry | undefined {
  const hit = cache.get(path);
  if (!hit) return undefined;
  cache.delete(path);
  cache.set(path, hit);
  if (hit.expires <= now) return hit;
  return hit;
}

function setCache(path: string, entry: CacheEntry): void {
  if (cache.has(path)) cache.delete(path);
  cache.set(path, entry);

  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (!oldestKey) break;
    cache.delete(oldestKey);
  }
}

async function fetchWithRetry(
  url: string,
  timeoutMs = 8000,
  retries = 1,
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(t);
      if (res.status >= 500 && attempt < retries) continue;
      return res;
    } catch (err) {
      clearTimeout(t);
      lastErr = err;
    }
  }
  throw lastErr ?? new Error("Upstream fetch failed");
}

export async function fetchCached(
  path: string,
  ttlSeconds: number,
): Promise<{ status: number; data: unknown }> {
  const now = Date.now();
  const hit = getCache(path, now);
  if (hit && hit.expires > now) {
    return { status: 200, data: hit.data };
  }

  let res: Response;
  try {
    res = await fetchWithRetry(`${API_BASE}${path}`);
  } catch {
    if (hit) return { status: 200, data: hit.data };
    return { status: 502, data: { error: "upstream_error" } };
  }

  if (res.status === 404) return { status: 404, data: { error: "not_found" } };
  if (!res.ok) {
    if (hit) return { status: 200, data: hit.data }; // stale-while-error
    return { status: 502, data: { error: "upstream_error" } };
  }

  try {
    const rawData = await res.json();
    const data = path.startsWith("/streams")
      ? normalisePayload(rawData)
      : rawData;
    setCache(path, { expires: now + ttlSeconds * 1000, data });
    return { status: 200, data };
  } catch {
    if (hit) return { status: 200, data: hit.data };
    return { status: 502, data: { error: "upstream_error" } };
  }
}