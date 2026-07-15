import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Film, ExternalLink, Trash2, PlayCircle, X, Search } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CinematicLoader } from "@/components/CinematicLoader";
import { useRM } from "@/hooks/useReducedMotionSafe";

type MovieItem = {
  id: string;
  title: string;
  image?: string;
  description?: string;
  source: string;
  embedUrl?: string;
  addedAt: number;
};

export const Route = createFileRoute("/movies")({
  head: () => ({
    meta: [
      { title: "Shows & Movies — StreamHub" },
      { name: "description", content: "Your cinematic library of shows and movies, curated from public sources." },
      { property: "og:title", content: "Shows & Movies — StreamHub" },
      { property: "og:description", content: "Add, preview and open your favorite shows and movies." },
    ],
  }),
  component: MoviesPage,
});

function MoviesPage() {
  const rm = useRM();
  const [items, setItems, hydrated] = useLocalStorage<MovieItem[]>("streamhub:movies", []);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [player, setPlayer] = useState<MovieItem | null>(null);

  const fetchPreview = async () => {
    setErr(null);
    if (!url.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/netmirror/preview?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();
      if (!res.ok) { setErr(data.error === "forbidden_host" ? "Only netmirror.global links are allowed." : (data.error ?? "Fetch failed")); return; }
      const item: MovieItem = {
        id: crypto.randomUUID(),
        title: data.title,
        image: data.image,
        description: data.description,
        source: data.source,
        embedUrl: data.video,
        addedAt: Date.now(),
      };
      setItems((prev) => [item, ...prev]);
      setUrl("");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const filtered = items.filter((i) => !q || i.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <div className="font-mono-tag text-[color:var(--color-brand)]">LIBRARY · SHOWS & MOVIES</div>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Your cinematic library.</h1>
        <p className="max-w-2xl text-muted-foreground">
          Paste a link from <span className="text-foreground">netmirror.global</span> to auto-fetch title,
          poster and description. Your library lives in your browser.
        </p>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
        <label htmlFor="nm-url" className="mb-2 block font-mono-tag text-xs text-white/60">
          NETMIRROR URL
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="nm-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://netmirror.global/…"
            className="w-full rounded-full border border-border bg-secondary/40 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-brand)]"
          />
          <button
            onClick={fetchPreview}
            disabled={busy}
            className="neon-btn inline-flex items-center justify-center gap-2 px-6 py-3 disabled:opacity-60"
          >
            {busy ? "Fetching…" : (<><Plus className="h-4 w-4" /> Fetch & Add</>)}
          </button>
        </div>
        {err && <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</div>}
      </section>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search your library"
            className="w-full rounded-full border border-border bg-secondary/40 py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="font-mono-tag text-xs text-white/50">{filtered.length} item{filtered.length === 1 ? "" : "s"}</div>
      </div>

      {!hydrated ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
          <Film className="mx-auto h-10 w-10 text-white/40" />
          <h2 className="mt-4 font-display text-xl font-semibold">Nothing here yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Paste a netmirror.global link above to add your first title.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence>
            {filtered.map((m, i) => (
              <motion.article
                key={m.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: rm ? 0 : 0.4, delay: rm ? 0 : Math.min(i * 0.04, 0.4) }}
                whileHover={rm ? undefined : { y: -6 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl"
              >
                <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-black/50 to-black/20">
                  {m.image ? (
                    <img src={m.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/30"><Film className="h-10 w-10" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                  <button
                    onClick={() => setPlayer(m)}
                    className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100"
                    aria-label={`Play ${m.title}`}
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--color-brand)] text-black shadow-[0_0_40px_color-mix(in_oklab,var(--color-brand)_60%,transparent)]">
                      <PlayCircle className="h-7 w-7" />
                    </span>
                  </button>
                  <button
                    onClick={() => remove(m.id)}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white/80 opacity-0 backdrop-blur transition hover:bg-destructive hover:text-white group-hover:opacity-100"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-2 font-display text-sm font-semibold">{m.title}</h3>
                  <a href={m.source} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[color:var(--color-brand)]">
                    <ExternalLink className="h-3 w-3" /> Source
                  </a>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {player && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
            onClick={() => setPlayer(null)}
            role="dialog" aria-modal="true" aria-label={player.title}
          >
            <motion.div
              initial={{ scale: 0.92, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
            >
              <button
                onClick={() => setPlayer(null)}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="aspect-video w-full bg-black">
                {player.embedUrl ? (
                  <IframeWithLoader src={player.embedUrl} title={player.title} />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                    <CinematicLoader label="No embed available" />
                    <a href={player.source} target="_blank" rel="noopener noreferrer" className="neon-btn inline-flex items-center gap-2 px-5 py-2.5">
                      <ExternalLink className="h-4 w-4" /> Open on source
                    </a>
                  </div>
                )}
              </div>
              <div className="border-t border-white/10 p-4">
                <h2 className="font-display text-lg font-semibold">{player.title}</h2>
                {player.description && <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{player.description}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IframeWithLoader({ src, title }: { src: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative h-full w-full">
      {!loaded && (
        <div className="absolute inset-0 z-10">
          <CinematicLoader label="Buffering stream" />
        </div>
      )}
      <iframe
        src={src}
        title={title}
        onLoad={() => setLoaded(true)}
        allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        referrerPolicy="no-referrer"
        className="h-full w-full border-0"
      />
    </div>
  );
}
