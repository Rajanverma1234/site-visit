"use client";

import { useEffect, useState } from "react";

/** SSR-safe media query hook (returns `false` until mounted, avoiding hydration mismatches). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);
  return matches;
}

export const useIsTouch = () => useMediaQuery("(hover: none), (pointer: coarse)");
export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
