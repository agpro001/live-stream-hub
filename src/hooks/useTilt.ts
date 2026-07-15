import { useRef } from "react";
import { useMotionValue, useSpring, useTransform } from "framer-motion";
import { useIsMobile } from "./useIsMobile";

/** 3D tilt driven by pointer position over the element. */
export function useTilt(max = 10) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 22, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 180, damping: 22, mass: 0.4 });
  const eff = isMobile ? 0 : max;
  const rotateY = useTransform(sx, [-0.5, 0.5], [-eff, eff]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [eff, -eff]);
  const glareX = useTransform(sx, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(sy, [-0.5, 0.5], ["0%", "100%"]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isMobile) return; // skip work on touch devices
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { x.set(0); y.set(0); };
  return { ref, onMove, onLeave, rotateX, rotateY, glareX, glareY };
}