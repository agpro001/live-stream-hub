import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { PlayCircle, Compass } from "lucide-react";
import { useRM } from "@/hooks/useReducedMotionSafe";

export function Hero({ liveCount = 0 }: { liveCount?: number }) {
  const rm = useRM();
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: rm ? 0 : 0.1, delayChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: rm ? 0 : 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: rm ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section className="relative overflow-hidden ambient-bg">
      {!rm && (
        <>
          <motion.div
            aria-hidden
            animate={{ scale: [1, 1.15, 1], rotate: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
            className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[160px] bg-[color:var(--color-brand)]/25"
          />
          <motion.div
            aria-hidden
            animate={{ y: [-20, 20, -20], x: [-10, 20, -10] }}
            transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
            className="pointer-events-none absolute right-10 top-32 hidden h-56 w-56 rounded-full bg-[color:var(--color-brand-2)]/25 blur-[90px] md:block"
          />
        </>
      )}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 pt-20 pb-28 sm:px-6 md:grid-cols-[1.2fr_1fr] md:pt-28"
      >
        <div>
          <motion.p variants={item} className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[6px] text-[color:var(--color-brand)]">
            <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-destructive" />
            {liveCount > 0 ? `${liveCount} matches streaming now` : "Next generation streaming"}
          </motion.p>
          <motion.h1 variants={item} className="font-display text-5xl font-bold leading-[1.05] sm:text-6xl md:text-7xl">
            Every match.
            <br />
            <span className="text-gradient">Cinematic live sports.</span>
          </motion.h1>
          <motion.p variants={item} className="mt-6 max-w-xl text-lg text-muted-foreground">
            Premium live matches from around the world — soccer, basketball, cricket,
            racing and more. Ultra-fast loading, gorgeous motion, zero clutter.
          </motion.p>
          <motion.div variants={item} className="mt-10 flex flex-wrap gap-3">
            <Link to="/browse" search={{ live: true }}>
              <motion.span
                whileHover={rm ? undefined : { y: -3, scale: 1.03 }}
                whileTap={rm ? undefined : { scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-brand)]/40 bg-white/10 px-7 py-3.5 font-medium text-foreground shadow-[0_0_40px_color-mix(in_oklab,var(--color-brand)_25%,transparent)] backdrop-blur-xl"
              >
                <PlayCircle className="h-5 w-5" aria-hidden /> Watch Live
              </motion.span>
            </Link>
            <Link to="/browse">
              <motion.span
                whileHover={rm ? undefined : { y: -3 }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-7 py-3.5 font-medium text-foreground"
              >
                <Compass className="h-5 w-5" aria-hidden /> Explore all sports
              </motion.span>
            </Link>
          </motion.div>
        </div>

        {/* Floating glass cards */}
        <div className="relative hidden h-[420px] md:block">
          {!rm && (
            <>
              <motion.div
                initial={{ opacity: 0, x: 120, rotate: 8, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, rotate: 4, scale: 1, y: [-10, 10, -10] }}
                transition={{ duration: 1.4, y: { repeat: Infinity, duration: 6 } }}
                className="absolute right-10 top-4 h-56 w-72 rounded-[28px] glass p-5 shadow-[0_30px_80px_rgba(0,0,0,.35)]"
              >
                <div className="mb-3 flex items-center gap-2 text-xs">
                  <span className="live-dot inline-block h-2 w-2 rounded-full bg-destructive" />
                  <span className="font-semibold uppercase tracking-widest text-destructive">Live</span>
                  <span className="ml-auto text-muted-foreground">FIFA · WC</span>
                </div>
                <div className="text-lg font-semibold">Morocco vs France</div>
                <div className="mt-1 text-sm text-muted-foreground">Semi-final · 2nd half</div>
                <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[color:var(--color-brand)] to-[color:var(--color-brand-2)]" />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 200, rotate: -12, scale: 0.85 }}
                animate={{ opacity: 1, x: 0, rotate: -6, scale: 1, y: [12, -12, 12] }}
                transition={{ duration: 1.6, delay: 0.2, y: { repeat: Infinity, duration: 7 } }}
                className="absolute right-40 bottom-4 h-52 w-64 rounded-[24px] glass p-5"
              >
                <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-[color:var(--color-brand)]">
                  Trending
                </div>
                <div className="text-base font-semibold">Warriors vs Mavericks</div>
                <div className="mt-1 text-sm text-muted-foreground">NBA Summer League</div>
                <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>4.2k watching</span>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </section>
  );
}