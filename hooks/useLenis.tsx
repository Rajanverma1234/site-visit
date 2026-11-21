"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<Lenis | null>(null);

/** Access the shared Lenis instance (null when smooth scroll is disabled). */
export const useLenis = () => useContext(LenisContext);

/**
 * Smooth scroll provider. Wires Lenis into GSAP's ticker so ScrollTrigger stays in sync.
 * Disabled for users who prefer reduced motion, on touch devices (native scroll feels better),
 * and on the full-screen virtual tour.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = usePathname();
  const disabled = pathname?.startsWith("/virtual-tour") || pathname?.startsWith("/brochure");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (reduce || touch || disabled) return;

    const instance = new Lenis({ duration: 1.15, smoothWheel: true });
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, [disabled]);

  // Scroll to top / hash on route change.
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        const t = setTimeout(() => (lenis ? lenis.scrollTo(el as HTMLElement, { offset: -40 }) : el.scrollIntoView()), 120);
        return () => clearTimeout(t);
      }
    }
    lenis?.scrollTo(0, { immediate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
