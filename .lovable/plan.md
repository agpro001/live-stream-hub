# StreamHub — Plan

A production-quality live sports streaming site built on this project's TanStack Start + React 19 + Vite stack (Next.js isn't supported here, but every capability from your brief maps 1:1). Uses the official StreamFree API. No hardcoded streams.

## Architecture (TanStack Start equivalents to your Next.js spec)


| Your spec                       | This stack                                                          |
| ------------------------------- | ------------------------------------------------------------------- |
| `app/api/streams/route.ts`      | `src/routes/api/streams.ts` (server route)                          |
| `app/api/categories/route.ts`   | `src/routes/api/categories.ts`                                      |
| `/live/[category]/[stream_key]` | `src/routes/live.$category.$streamKey.tsx`                          |
| Server Components + ISR         | Server routes + TanStack Query with `staleTime` (SWR-style caching) |
| Dynamic metadata                | Route `head()` with loader data                                     |
| `sitemap.xml`, `robots.txt`     | `src/routes/sitemap[.]xml.ts` + `public/robots.txt`                 |


## API layer (`src/services/streamfree.ts` + server routes)

- `GET /api/streams` → proxies `https://streamfree.top/api/v1/streams`, 3-minute in-memory cache, retry once on 5xx/timeout, 8s timeout, always returns JSON (never throws to client).
- `GET /api/categories` → proxies `/api/v1/categories`, 30-min cache.
- `GET /api/streams/:key` → proxies `/api/v1/streams/{stream_key}`, returns `{ found: false }` on 404 (no crash).
- Zod schemas validate every response shape; unknown fields pass through.
- Shared helpers: `getStreams()`, `getCategories()`, `getStream(key)`, `formatKickoff(ts, tz)`, `fetchWithRetry()`.

## Pages

**Home (`/`)** — Cinematic hero (adapted from your Hero.tsx: staggered reveal, floating glass cards, ambient glow, "StreamHub / Where every match comes alive" copy), then rails:

- Trending Live (top N by viewer proxy / featured flag)
- Live Now
- Today's Matches (grouped by kickoff time)
- Categories grid (from API, never hardcoded)
- Upcoming (next 24h)
- Recently Finished (last 6h)
- Popular Leagues (derived by league frequency)

**Browse (`/browse`)** — Full filterable grid with sport filter chips (Soccer, Basketball, Football, Baseball, Cricket, Combat, Racing, Hockey, Tennis + any others the API returns dynamically), Today/Live toggles, search box (instant client-side filter over match name / league / category), sort by kickoff.

**Category (`/category/$category`)** — Same grid scoped to one sport with breadcrumbs.

**Live player (`/live/$category/$streamKey`)** —

- Server loader fetches stream metadata; 404 → "This match has ended." panel with related-matches suggestions.
- Full-width 16:9 iframe using `embed_url` exactly as the provider documents, with `allow="fullscreen; picture-in-picture; autoplay"` and `allowFullScreen`.
- **Redirect/popup mitigation**: iframe `sandbox="allow-same-origin allow-scripts allow-forms allow-presentation"` (omits `allow-top-navigation` and `allow-popups`) so ad scripts inside can't redirect the top window or spawn popup tabs. Note: we honor the provider's player, so we can't strip in-frame overlays — only stop them from escaping the frame.
- Sticky action bar: Back, Fullscreen, PiP, Share (Web Share API + clipboard fallback), Copy link, Favorite toggle.
- Below player: match info (teams, league, category, kickoff in user's local time), related live matches rail.

**Favorites (`/favorites`)** and **Recent (`/recent`)** — localStorage-backed lists with the same StreamCard component.

## Components (`src/components/`)

- `Hero` (Framer Motion, adapted from your snippet with StreamHub copy)
- `StreamCard` (thumbnail, name, league, category badge, local time, LIVE pulse badge, hover lift + glow, Watch CTA)
- `StreamRail` (horizontal scroll rail with arrow controls, snap points)
- `CategoryTabs` (dynamic from API)
- `FilterBar` (chips + search input, debounced)
- `Player` + `PlayerActions`
- `Skeleton*` (rail, card, hero) — animated shimmer
- `EmptyState`, `ErrorState` (with Retry), `MatchEnded`
- `Header` (sticky, glass, logo, nav, search, theme toggle) + `Footer`
- `Breadcrumbs`, `ThemeToggle`, `FavoriteButton`, `ShareMenu`

## Styling & motion

- Dark-first design system in `src/styles.css` using oklch tokens. Palette: deep space `#050816`-ish background, cyan `#22d3ee` primary, violet `#a855f7` accent, glass surfaces via `bg-white/5 backdrop-blur-2xl border border-white/10`. Gradients and glow shadows registered as tokens (`--gradient-primary`, `--shadow-glow`).
- Fonts: Space Grotesk (display) + Inter (body) via `@fontsource`.
- Framer Motion: staggered reveals, floating blobs, page transitions, hover micro-interactions, `AnimatePresence` for modals/skeletons. All motion wrapped in `useReducedMotion()` so prefers-reduced-motion disables non-essential animation.
- Light mode included via `next-themes`-style class toggle on `<html>`.
- A floating live sports dashboard
- Animated match cards
- Glassmorphism + neomorphism UI
- Spatial UI depth
- 3D hover effects
- Framer Motion + GSAP animations
- Live stream cards that animate into view
- API-driven content using the documented StreamFree endpoints
- Responsive layout
- Premium loading animations
- Cinematic staggered text reveal
- Smooth spring-like easing
- Floating glassmorphism cards
- Animated gradient glow backgrounds
- Slow ambient floating motion
- Frosted glass buttons
- Soft depth shadows
- Premium hero entrance
- Responsive layout
- GPU-accelerated transforms
- Layered visual depth
- Mouse-reactive 3D tilt (rotateX/rotateY)
- GSAP timeline sequencing
- React Three Fiber depth effects
- Cursor-following light reflections
- Dynamic noise and bloom
- Smooth Lenis scrolling
- Scroll-triggered scene transitions
- Multi-layer parallax
- Animated grid and particle background
- Spatial UI depth with perspective transforms
- Motion graphics for texts

## State & data

- TanStack Query throughout (already wired). `queryOptions` per endpoint, `staleTime: 60s` for live list, `5m` for categories, `30s` for single stream.
- Loaders use `context.queryClient.ensureQueryData(...)`; components use `useSuspenseQuery`.
- Favorites/Recent in localStorage via a small `useLocalStorage` hook, hydrated after mount to avoid SSR mismatch.

## SEO & metadata

- Per-route `head()` with unique title/description/og for `/`, `/browse`, each category, each live page.
- Live page derives `og:title` from match name and `og:image` from thumbnail when present.
- `robots.txt` allows all, points to sitemap. `sitemap[.]xml.ts` server route lists static routes + top live matches at build/request time.
- JSON-LD `SportsEvent` on live pages, `WebSite` on root.

## Accessibility (full pass)

- Semantic landmarks, single `<main>` per route, skip-link.
- All icon-only buttons get `aria-label`.
- Focus-visible rings on every interactive element, keyboard shortcuts: `/` focus search, `f` fullscreen player, `esc` back.
- `prefers-reduced-motion` disables blob/parallax/stagger.
- Color contrast via semantic tokens; live badge conveys state with text + icon, not color alone.
- ARIA-live region for "Loading…" / "No live matches" announcements.

## Error handling

- Route `errorComponent` + `notFoundComponent` on every route with a loader; root gets both plus `defaultErrorComponent`.
- API wrapper returns typed `{ ok, data, error }` — UI shows Retry button on failure.
- Player 404 → "This match has ended." with related suggestions, never a crash.

## Folder layout

```
src/
  routes/
    __root.tsx, index.tsx, browse.tsx, favorites.tsx, recent.tsx
    category.$category.tsx
    live.$category.$streamKey.tsx
    sitemap[.]xml.ts
    api/streams.ts, api/streams.$key.ts, api/categories.ts
  components/  (Hero, StreamCard, StreamRail, Player, Header, Footer, …)
  services/    (streamfree.ts, cache.ts)
  hooks/       (useLocalStorage, useDebounced, useKeyboardShortcut, useHydrated)
  lib/         (format.ts, cn.ts, zod-schemas.ts)
  styles.css
public/  (robots.txt, favicon)
```

## Out of scope for v1 (call out if you want them)

- Server-side rate limiting (this stack has no standard primitive; can add ad-hoc if you confirm).
- Real infinite scroll pagination — the API returns all live streams at once, so v1 uses client-side virtualization only if list exceeds ~200 items.
- Any attempt to strip/replace the provider's player, block in-frame overlays, or bypass their embed — we honor the documented integration and only prevent top-window redirects via iframe sandbox.

## Deliverable

A working, responsive, dark-first StreamHub with cinematic hero, dynamic categories, live grid, working player pages, favorites/recent, share/copy, theme toggle, full a11y, SEO, and graceful errors — pulling exclusively from the documented StreamFree endpoints. Everything must be working properly correctly and Really.