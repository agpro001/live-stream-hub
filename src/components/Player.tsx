import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Maximize2, PictureInPicture2, Share2, Copy, Heart, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Stream } from "@/lib/streamfree";
import { categoryMeta } from "@/lib/streamfree";
import { formatKickoff } from "@/lib/format";
import { useFavorites } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { CinematicLoader } from "@/components/CinematicLoader";
import { StreamChat } from "@/components/StreamChat";

export function Player({ stream }: { stream: Stream }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { has, toggle, hydrated } = useFavorites();
  const meta = categoryMeta(stream.category);
  const fav = hydrated && has(stream.stream_key);

  const fullscreen = () => {
    const el = iframeRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen?.().catch(() => {});
    }
  };

  const pip = () => {
    // Cross-origin iframe won't expose its <video>, but we try; noop otherwise.
    try {
      const anyDoc = document as unknown as { pictureInPictureElement?: Element };
      if (anyDoc.pictureInPictureElement) {
        void (document as unknown as { exitPictureInPicture(): Promise<void> }).exitPictureInPicture();
      }
    } catch { /* ignore */ }
  };

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: stream.name, text: `Watch ${stream.name} live on StreamHub`, url });
        return;
      } catch { /* fallthrough */ }
    }
    await copyLink();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "f" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        fullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/browse"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-sm hover:bg-secondary"
          aria-label="Back to browse"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex flex-1 items-center gap-2 text-xs text-muted-foreground">
          <span aria-hidden>{meta.emoji}</span>
          <span className="font-medium">{meta.label}</span>
          {stream.league && (
            <>
              <span aria-hidden>·</span>
              <span>{stream.league}</span>
            </>
          )}
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-black shadow-2xl">
        <div className="aspect-video w-full">
          {!loaded && (
            <div className="absolute inset-0 z-10">
              <CinematicLoader label="Buffering signal" />
            </div>
          )}
          {/* Provider requires an un-sandboxed embed per StreamFree docs. */}
          <iframe
            ref={iframeRef}
            src={stream.embed_url}
            title={stream.name}
            onLoad={() => setLoaded(true)}
            allow="fullscreen; picture-in-picture; autoplay; encrypted-media"
            allowFullScreen
            referrerPolicy="no-referrer"
            className="h-full w-full border-0"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={fullscreen} className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3.5 py-2 text-sm hover:bg-secondary" aria-label="Fullscreen (F)">
          <Maximize2 className="h-4 w-4" /> Fullscreen
        </button>
        <button onClick={pip} className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3.5 py-2 text-sm hover:bg-secondary" aria-label="Picture in picture">
          <PictureInPicture2 className="h-4 w-4" /> PiP
        </button>
        <button onClick={share} className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3.5 py-2 text-sm hover:bg-secondary" aria-label="Share">
          <Share2 className="h-4 w-4" /> Share
        </button>
        <button onClick={copyLink} className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3.5 py-2 text-sm hover:bg-secondary" aria-label="Copy link">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy link"}
        </button>
        <button
          onClick={() => toggle(stream.stream_key)}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition",
            fav
              ? "border-destructive/50 bg-destructive/15 text-destructive"
              : "border-border bg-secondary/40 hover:bg-secondary",
          )}
          aria-pressed={fav}
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={cn("h-4 w-4", fav && "fill-current")} />
          {fav ? "Favorited" : "Favorite"}
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{stream.name}</h1>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
          {stream.league && <span>League · <span className="text-foreground">{stream.league}</span></span>}
          <span>Category · <span className="text-foreground">{meta.label}</span></span>
          <span>Kickoff · <span className="text-foreground">{formatKickoff(stream.match_timestamp)}</span></span>
          {typeof stream.viewers === "number" && stream.viewers > 0 && (
            <span>Viewers · <span className="text-foreground">{stream.viewers.toLocaleString()}</span></span>
          )}
        </div>
        {(stream.team1 || stream.team2) && (
          <div className="mt-5 grid grid-cols-2 gap-4">
            {[stream.team1, stream.team2].map((t, i) =>
              t ? (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3">
                  {t.logo && <img src={t.logo} alt="" className="h-10 w-10 rounded" loading="lazy" />}
                  <div className="font-medium">{t.name}</div>
                </div>
              ) : null,
            )}
          </div>
        )}
      </div>

      <StreamChat streamKey={stream.stream_key} />
    </div>
  );
}