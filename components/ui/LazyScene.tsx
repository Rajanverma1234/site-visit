"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * One consistent loading pattern for every heavy embed (3D canvases, the map):
 *
 *  1. A lightweight static poster is rendered immediately (server-rendered, so it can be the LCP image).
 *  2. The heavy component is mounted only when the box approaches the viewport
 *     — or, with `mount="idle"`, once the browser is idle / the visitor first interacts.
 *  3. When the scene reports its first frame (`onReady`) the poster cross-fades away.
 *
 * `active` tells the scene whether it is on-screen right now, so it can pause rendering.
 */
export interface LazySceneRender {
  active: boolean;
  onReady: () => void;
}

export default function LazyScene({
  poster,
  posterMobile,
  posterAlt,
  posterNode,
  label = "Loading 3D view",
  mount = "visible",
  priority = false,
  className,
  children,
}: {
  poster?: string;
  posterMobile?: string;
  posterAlt: string;
  /** Custom placeholder instead of an image (e.g. the stylised map). */
  posterNode?: ReactNode;
  label?: string;
  mount?: "visible" | "idle";
  priority?: boolean;
  className?: string;
  children: (r: LazySceneRender) => ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [active, setActive] = useState(false);
  const [idle, setIdle] = useState(mount === "visible");
  const [ready, setReady] = useState(false);

  // Mount when near the viewport; track on-screen state for pausing.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setActive(e.isIntersecting);
        if (e.isIntersecting) setNear(true);
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // `idle` mode: wait for the first interaction or an idle moment after load.
  useEffect(() => {
    if (mount !== "idle") return;
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      setIdle(true);
    };
    const events = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;
    events.forEach((ev) => window.addEventListener(ev, go, { once: true, passive: true }));
    type IdleWindow = Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const w = window as IdleWindow;
    const start = () => {
      const t = window.setTimeout(() => (w.requestIdleCallback ? w.requestIdleCallback(go, { timeout: 2000 }) : go()), 1200);
      return t;
    };
    let timer = 0;
    // Phones / touch: wait for the first interaction only — parsing three.js on a mid-range
    // phone would block the main thread for seconds. The poster is a real render, so nothing looks missing.
    const constrained = window.matchMedia("(pointer: coarse), (max-width: 767px)").matches;
    if (constrained) {
      /* interaction listeners above are enough */
    } else if (document.readyState === "complete") timer = start();
    else window.addEventListener("load", () => (timer = window.setTimeout(() => start(), 0)), { once: true });
    return () => {
      done = true;
      window.clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, go));
    };
  }, [mount]);

  const shouldMount = near && idle;

  return (
    <div ref={box} className={cn("relative h-full w-full overflow-hidden", className)}>
      {shouldMount && <div className="absolute inset-0">{children({ active, onReady: () => setReady(true) })}</div>}

      {/* Poster layer */}
      <div aria-hidden={ready} className={cn("pointer-events-none absolute inset-0 transition-opacity duration-700", ready ? "opacity-0" : "opacity-100")}>
        {posterNode ?? (poster ? <Poster src={poster} mobileSrc={posterMobile} alt={posterAlt} priority={priority} /> : null)}
        {shouldMount && !ready && <LoadingChip label={label} />}
      </div>
    </div>
  );
}

/** Art-directed poster: a separate portrait crop for phones, optimised by next/image (AVIF/WebP). */
function Poster({ src, mobileSrc, alt, priority }: { src: string; mobileSrc?: string; alt: string; priority: boolean }) {
  const common = { alt, fill: true, sizes: "100vw", priority, quality: 70 } as const;
  const { props: desktop } = getImageProps({ ...common, src });
  if (!mobileSrc) {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...desktop} className="object-cover" />;
  }
  const { props: mobile } = getImageProps({ ...common, src: mobileSrc });
  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={mobile.srcSet} sizes="100vw" />
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img {...desktop} className="object-cover" />
    </picture>
  );
}

/** The one loading indicator used site-wide: a small pill with a gold shimmer line. */
export function LoadingChip({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn("absolute bottom-5 left-5 flex items-center gap-3 rounded-full bg-charcoal/75 px-4 py-2 backdrop-blur", className)} role="status">
      <span className="relative h-px w-10 overflow-hidden bg-ivory/20">
        <span className="animate-shimmer absolute inset-y-0 left-0 w-1/2 bg-gold" />
      </span>
      <span className="text-[10px] uppercase tracking-[0.22em] text-ivory/85">{label}</span>
    </div>
  );
}
