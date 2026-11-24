"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll reveals are skipped (content simply shows) for reduced-motion users and on
 * phones / touch devices, where creating dozens of ScrollTriggers at startup costs
 * noticeable main-thread time for an effect that is barely visible.
 */
function skipReveal() {
  return window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse), (max-width: 767px)").matches;
}

/**
 * Fades + lifts its children into view on scroll.
 * Direct children marked with `data-reveal` are staggered; otherwise the wrapper animates as one block.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  delay = 0,
  stagger = 0.12,
  y = 40,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  delay?: number;
  stagger?: number;
  y?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (skipReveal()) return;
    const items = el.querySelectorAll<HTMLElement>("[data-reveal]");
    const targets = items.length ? Array.from(items) : [el];
    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          delay,
          stagger,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [delay, stagger, y]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/**
 * Headline reveal: each line slides up from behind a mask, staggered.
 * Pass lines as an array to control line breaks precisely.
 */
export function RevealText({
  lines,
  className,
  as: Tag = "h2",
  delay = 0,
}: {
  lines: string[];
  className?: string;
  as?: ElementType;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (skipReveal()) return;
    const spans = el.querySelectorAll<HTMLElement>("[data-line]");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        spans,
        { yPercent: 110 },
        { yPercent: 0, duration: 1.2, ease: "power4.out", stagger: 0.1, delay, scrollTrigger: { trigger: el, start: "top 88%", once: true } },
      );
    }, el);
    return () => ctx.revert();
  }, [delay]);

  return (
    <Tag ref={ref} className={className} aria-label={lines.join(" ")}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]" aria-hidden>
          <span data-line className="block will-change-transform">
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
