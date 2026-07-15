"use client";
import { useEffect } from "react";
import Lenis from "lenis";

/** Global Lenis smooth scroll. Honors prefers-reduced-motion and disables on touch. */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return; // native scroll on mobile & reduced-motion for perf
    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      // Broadcast scroll intensity for scene transitions (waves, hero parallax)
      const y = window.scrollY;
      document.documentElement.style.setProperty("--scroll-y", `${y}px`);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);
  return null;
}
