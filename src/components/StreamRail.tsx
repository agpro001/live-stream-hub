import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StreamCard } from "@/components/StreamCard";
import type { Stream } from "@/lib/streamfree";

export function StreamRail({
  title,
  subtitle,
  streams,
  emptyLabel = "Nothing here yet.",
}: {
  title: string;
  subtitle?: string;
  streams: Stream[];
  emptyLabel?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.9), behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {streams.length > 0 && (
          <div className="hidden gap-1 md:flex">
            <button
              onClick={() => scroll(-1)}
              aria-label="Scroll left"
              className="rounded-full border border-border bg-secondary/40 p-2 hover:bg-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              aria-label="Scroll right"
              className="rounded-full border border-border bg-secondary/40 p-2 hover:bg-secondary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {streams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          {emptyLabel}
        </div>
      ) : (
        <div
          ref={scroller}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {streams.map((s, i) => (
            <div
              key={s.stream_key}
              className="w-[280px] shrink-0 snap-start sm:w-[320px]"
            >
              <StreamCard stream={s} priority={i < 3} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}