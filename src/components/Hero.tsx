import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { PlayCircle, Compass } from "lucide-react";
import { useRM } from "@/hooks/useReducedMotionSafe";
import { InteractiveWavesBackground } from "@/components/InteractiveWavesBackground";

export function Hero({ liveCount = 0 }: { liveCount?: number }) {
  const rm = useRM();
  const sectionRef = useRef<HTMLElement>(null);

  // GSAP timeline: orchestrates hero reveal + broadcasts a --wave-intensity
  // signal for the background & downstream stream-card scroll reveals.
  useEffect(() => {
    if (rm || typeof window === "undefined") return;
    let cancelled = false;
    (async () => {
      const { gsap } = await import("gsap");
      if (cancelled) return;
      const root = sectionRef.current;
      if (!root) return;
      const intensity = { v: 0.4 };
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(intensity, {
        v: 1,
        duration: 1.6,
        onUpdate: () => root.style.setProperty("--wave-intensity", String(intensity.v)),
      })
        .fromTo(
          root.querySelectorAll("[data-hero-stagger]"),
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.12, duration: 0.9 },
          "-=1.2",
        );

      // Scroll-triggered scene transition: dim the waves as user scrolls past.
      const onScroll = () => {
        const rect = root.getBoundingClientRect();
        const t = Math.max(0, Math.min(1, 1 - (rect.bottom / window.innerHeight)));
        root.style.setProperty("--wave-intensity", String(1 - t * 0.85));
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    })();
    return () => { cancelled = true; };
  }, [rm]);

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
  const headline = "Cinematic live sports.";

  return (
    <section ref={sectionRef} className="relative overflow-hidden ambient-bg grid-bg noise-overlay [--wave-intensity:1]">
      {!rm && (
        <div style={{ opacity: "var(--wave-intensity, 1)" }} className="absolute inset-0">
        <InteractiveWavesBackground
          lineColor="rgba(204,255,0,0.18)"
          waveSpeedX={0.018}
          waveSpeedY={0.008}
          waveAmpX={38}
          waveAmpY={18}
          xGap={14}
          yGap={42}
        />
        </div>
      )}
      {!rm && (
        <>
          <motion.div
            aria-hidden
            animate={{ scale: [1, 1.15, 1], rotate: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
            className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 glow-sphere bg-[color:var(--color-brand)]/40"
          />
          <motion.div
            aria-hidden
            animate={{ y: [-20, 20, -20], x: [-10, 20, -10] }}
            transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
            className="pointer-events-none absolute right-10 top-32 hidden h-56 w-56 glow-sphere bg-[color:var(--color-brand-2)]/40 md:block"
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
          <motion.p variants={item} className="font-mono-tag mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 backdrop-blur text-[color:var(--color-brand)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-brand)] shadow-[0_0_10px_var(--color-brand)] animate-pulse" />
            {liveCount > 0 ? `SYS · ${liveCount} live signals` : "SYS · standby"}
          </motion.p>
          <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-6xl md:text-7xl">
            <motion.span variants={item} className="block">Every match.</motion.span>
            <motion.span
              variants={item}
              className="block"
            >
              <span className="text-gradient italic font-light">{headline}</span>
            </motion.span>
          </h1>
          <motion.p variants={item} className="mt-6 max-w-xl text-lg text-muted-foreground">
            A cinematic front-row seat to the world's live sport. Ultra-fast, ad-light,
            engineered with obsidian glass and neon precision.
          </motion.p>
          <motion.div variants={item} className="mt-10 flex flex-wrap gap-3">
            <Link to="/browse" search={{ live: true }}>
              <motion.span
                whileHover={rm ? undefined : { y: -3, scale: 1.03 }}
                whileTap={rm ? undefined : { scale: 0.97 }}
                className="neon-btn inline-flex items-center gap-2 px-7 py-3.5"
              >
                <PlayCircle className="h-5 w-5" aria-hidden /> Watch Live
              </motion.span>
            </Link>
            <Link to="/browse">
              <motion.span
                whileHover={rm ? undefined : { y: -3 }}
                className="glass inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-medium text-foreground"
              >
                <Compass className="h-5 w-5" aria-hidden /> Explore all sports
              </motion.span>
            </Link>
          </motion.div>
          <motion.div
            variants={item}
            className="mt-10 flex items-center gap-3 font-mono-tag text-white/50"
          >
            <span className="h-px w-10 bg-white/20" />
            <motion.span
              animate={rm ? undefined : { opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              Made by Aditya · in motion
            </motion.span>
          </motion.div>
        </div>

        {/* Floating glass cards */}
        <div className="relative hidden h-[420px] [perspective:1200px] md:block">
          {!rm && (
            <>
              <motion.div
                initial={{ opacity: 0, x: 120, rotate: 8, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, rotate: 4, scale: 1, y: [-10, 10, -10] }}
                transition={{ duration: 1.4, y: { repeat: Infinity, duration: 6 } }}
                style={{ transform: "rotateX(6deg) rotateY(-8deg)" }}
                className="absolute right-10 top-4 h-56 w-72 rounded-[28px] glass p-5 shadow-[0_30px_80px_rgba(0,0,0,.55)]"
              >
                <div className="mb-3 flex items-center gap-2 text-xs">
                  <span className="live-dot inline-block h-2 w-2 rounded-full bg-[color:var(--color-brand)]" />
                  <span className="font-mono-tag text-[color:var(--color-brand)]">LIVE · CH01</span>
                  <span className="ml-auto font-mono-tag text-muted-foreground">FIFA · WC</span>
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
                style={{ transform: "rotateX(-4deg) rotateY(10deg)" }}
                className="absolute right-40 bottom-4 h-52 w-64 rounded-[24px] glass p-5"
              >
                <div className="mb-3 flex items-center gap-2 font-mono-tag text-[color:var(--color-brand)]">
                  ▲ Trending
                </div>
                <div className="text-base font-semibold">Warriors vs Mavericks</div>
                <div className="mt-1 text-sm text-muted-foreground">NBA Summer League</div>
                <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>4.2k watching</span>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="absolute -bottom-2 right-4 rounded-full bg-[color:var(--color-brand)] px-3 py-1.5 font-mono-tag text-black shadow-[0_0_28px_color-mix(in_oklab,var(--color-brand)_60%,transparent)]"
              >
                ● AI cursor
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </section>
  );
}