"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const fmt = (v: number, decimals: number) => new Intl.NumberFormat("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);

/**
 * Number that counts up once when scrolled into view (Indian digit grouping).
 * Server-renders the final value, so it's correct without JS and for reduced-motion users.
 */
export default function Counter({ value, decimals = 0, suffix = "", className }: { value: number; decimals?: number; suffix?: string; className?: string }) {
  const el = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = el.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const obj = { v: 0 };
    node.textContent = fmt(0, decimals);
    const tween = gsap.to(obj, {
      v: value,
      duration: 2,
      ease: "power2.out",
      scrollTrigger: { trigger: node, start: "top 92%", once: true },
      onUpdate: () => (node.textContent = fmt(obj.v, decimals)),
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      node.textContent = fmt(value, decimals);
    };
  }, [value, decimals]);

  return (
    <span className={className}>
      <span ref={el}>{fmt(value, decimals)}</span>
      {suffix}
    </span>
  );
}
