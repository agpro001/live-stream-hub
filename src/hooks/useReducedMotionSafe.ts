import { useReducedMotion } from "framer-motion";

/** Convenience: returns true if user prefers reduced motion. */
export function useRM() {
  return useReducedMotion() ?? false;
}