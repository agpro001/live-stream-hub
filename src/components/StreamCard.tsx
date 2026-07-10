import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Play, Eye, Clock } from "lucide-react";
import { categoryMeta, streamStatus, type Stream } from "@/lib/streamfree";
import { formatKickoff, relativeTime } from "@/lib/format";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useRM } from "@/hooks/useReducedMotionSafe";
import { useTilt } from "@/hooks/useTilt";

export function StreamCard({ stream, priority = false }: { stream: Stream; priority?: boolean }) {
  const meta = categoryMeta(stream.category);
  const status = streamStatus(stream);
  const rm = useRM();
  const tilt = useTilt(8);

  return (
    <motion.article
      ref={tilt.ref}
      onPointerMove={rm ? undefined : tilt.onMove}
      onPointerLeave={rm ? undefined : tilt.onLeave}
      style={rm ? undefined : { rotateX: tilt.rotateX, rotateY: tilt.rotateY, transformPerspective: 900 }}
      whileHover={rm ? undefined : { y: -4 }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-colors hover:border-[color:var(--color-brand)]/40 hover:shadow-[0_0_40px_-10px_color-mix(in_oklab,var(--color-brand)_40%,transparent)]"
    >
      {!rm && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(320px circle at var(--gx,50%) var(--gy,30%), color-mix(in oklab, var(--color-brand) 22%, transparent), transparent 60%)`,
          }}
        />
      )}
      <Link
        to="/live/$category/$streamKey"
        params={{ category: stream.category, streamKey: stream.stream_key }}
        className="block"
        onPointerMove={(e) => {
          const el = e.currentTarget as HTMLElement;
          const r = el.getBoundingClientRect();
          el.style.setProperty("--gx", `${e.clientX - r.left}px`);
          el.style.setProperty("--gy", `${e.clientY - r.top}px`);
        }}
      >
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-black/60 to-black/20">
          {stream.thumbnail_url ? (
            <img
              src={stream.thumbnail_url}
              alt=""
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          ) : null}
          <div className={`absolute inset-0 bg-gradient-to-br ${meta.accent} opacity-30 mix-blend-overlay`} />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-black shadow-xl">
              <Play className="h-6 w-6 translate-x-0.5 fill-current" aria-hidden />
            </div>
          </div>
          <div className="absolute left-3 top-3 flex items-center gap-2">
            {status === "live" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-destructive-foreground">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                Live
              </span>
            )}
            {status === "upcoming" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                <Clock className="h-3 w-3" aria-hidden /> {relativeTime(stream.match_timestamp)}
              </span>
            )}
            {status === "finished" && (
              <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur">
                Ended
              </span>
            )}
          </div>
          <div className="absolute right-3 top-3">
            <FavoriteButton streamKey={stream.stream_key} />
          </div>
          {typeof stream.viewers === "number" && stream.viewers > 0 && (
            <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
              <Eye className="h-3 w-3" aria-hidden /> {stream.viewers.toLocaleString()}
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span aria-hidden>{meta.emoji}</span>
            <span className="font-medium">{meta.label}</span>
            {stream.league && (
              <>
                <span aria-hidden>·</span>
                <span className="truncate">{stream.league}</span>
              </>
            )}
          </div>
          <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug">
            {stream.name}
          </h3>
          <div className="mt-2 text-xs text-muted-foreground">
            {formatKickoff(stream.match_timestamp)}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}