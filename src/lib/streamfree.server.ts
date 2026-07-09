const API_BASE = "https://streamfree.top/api/v1";

type CacheEntry = { expires: number; data: unknown };
const cache = new Map<string, CacheEntry>();

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
  const hit = cache.get(path);
  if (hit && hit.expires > now) {
    return { status: 200, data: hit.data };
  }
  const res = await fetchWithRetry(`${API_BASE}${path}`);
  if (res.status === 404) return { status: 404, data: { error: "not_found" } };
  if (!res.ok) {
    if (hit) return { status: 200, data: hit.data }; // stale-while-error
    return { status: 502, data: { error: "upstream_error" } };
  }
  const data = await res.json();
  cache.set(path, { expires: now + ttlSeconds * 1000, data });
  return { status: 200, data };
}