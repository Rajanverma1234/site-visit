"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Gold dot + lagging ring cursor.
 * - The ring grows over interactive elements.
 * - Any element with `data-cursor="Label"` shows that label inside the ring.
 * - Disabled automatically on touch devices.
 */
export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...pos };
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      setHidden(false);
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
    };
    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest) return;
      const labelled = target.closest<HTMLElement>("[data-cursor]");
      const interactive = target.closest("a, button, [role='button'], input, select, textarea, label");
      setLabel(labelled?.dataset.cursor || null);
      setHovering(Boolean(labelled || interactive));
    };
    const onLeave = () => setHidden(true);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  if (!enabled) return null;

  const size = label ? 84 : hovering ? 56 : 34;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999]" style={{ opacity: hidden ? 0 : 1, transition: "opacity .3s" }}>
      <div ref={dot} className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-gold" style={{ opacity: label ? 0 : 1 }} />
      <div
        ref={ring}
        className="fixed left-0 top-0 flex items-center justify-center rounded-full border border-gold/70 text-[10px] font-medium uppercase tracking-[0.2em] text-charcoal"
        style={{
          width: size,
          height: size,
          background: label ? "rgba(200,169,106,0.92)" : hovering ? "rgba(200,169,106,0.08)" : "transparent",
          transition: "width .35s cubic-bezier(.22,1,.36,1), height .35s cubic-bezier(.22,1,.36,1), background .35s",
          mixBlendMode: label ? "normal" : "difference",
        }}
      >
        {label}
      </div>
    </div>
  );
}
