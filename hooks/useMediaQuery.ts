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

/**
 * True on phones/tablets and low-power machines (≤4 CPU cores, ≤4 GB RAM, or Data Saver on).
 * 3D scenes use it to lower pixel ratio and skip post-processing.
 */
export function useLowPower(): boolean {
  const touch = useIsTouch();
  const [weak, setWeak] = useState(false);
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    setWeak((nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4 || Boolean(nav.connection?.saveData));
  }, []);
  return touch || weak;
}
