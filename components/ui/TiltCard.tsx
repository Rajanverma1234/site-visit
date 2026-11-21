"use client";

import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { createContext, useContext, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 3D tilt-on-hover card. Exposes CSS variables --px / --py (-1..1) so children
 * can move in the opposite direction for a parallax "depth" effect.
 */
export default function TiltCard({ children, className, max = 10 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spx = useSpring(px, { stiffness: 160, damping: 18 });
  const spy = useSpring(py, { stiffness: 160, damping: 18 });
  const rotateY = useTransform(spx, [-1, 1], [-max, max]);
  const rotateX = useTransform(spy, [-1, 1], [max, -max]);
  const imgX = useTransform(spx, [-1, 1], [18, -18]);
  const imgY = useTransform(spy, [-1, 1], [18, -18]);
  const glareX = useTransform(spx, [-1, 1], ["0%", "100%"]);

  return (
    <div style={{ perspective: 1200 }} className={cn("h-full", className)}>
      <motion.div
        ref={ref}
        className="group relative h-full [transform-style:preserve-3d]"
        style={{ rotateX, rotateY }}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse" || !ref.current) return;
          const r = ref.current.getBoundingClientRect();
          px.set(((e.clientX - r.left) / r.width) * 2 - 1);
          py.set(((e.clientY - r.top) / r.height) * 2 - 1);
        }}
        onPointerLeave={() => {
          px.set(0);
          py.set(0);
        }}
      >
        <TiltContext imgX={imgX} imgY={imgY} glareX={glareX}>
          {children}
        </TiltContext>
      </motion.div>
    </div>
  );
}

const Ctx = createContext<{ imgX: MotionValue<number>; imgY: MotionValue<number>; glareX: MotionValue<string> } | null>(null);
function TiltContext({ children, ...v }: { children: ReactNode; imgX: MotionValue<number>; imgY: MotionValue<number>; glareX: MotionValue<string> }) {
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}

/** Wrap the card image in this — it drifts opposite to the cursor for depth. */
export function TiltLayer({ children, className }: { children: ReactNode; className?: string }) {
  const v = useContext(Ctx);
  return (
    <motion.div className={cn("absolute -inset-6", className)} style={v ? { x: v.imgX, y: v.imgY } : undefined}>
      {children}
    </motion.div>
  );
}

/** Soft moving glare on top of the card. */
export function TiltGlare() {
  const v = useContext(Ctx);
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      style={{
        background: "radial-gradient(circle at var(--gx) 0%, rgba(255,255,255,.18), transparent 55%)",
        ["--gx" as string]: v?.glareX,
      }}
    />
  );
}
