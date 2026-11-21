"use client";

import { useEffect, useRef } from "react";

/**
 * Tracks the global mouse position in a ref (no re-renders).
 * `nx`/`ny` are normalised to -1..1 (centre = 0), perfect for parallax in useFrame.
 */
export interface MouseState {
  x: number;
  y: number;
  nx: number;
  ny: number;
}

export function useMouse() {
  const mouse = useRef<MouseState>({ x: 0, y: 0, nx: 0, ny: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const m = mouse.current;
      m.x = e.clientX;
      m.y = e.clientY;
      m.nx = (e.clientX / window.innerWidth) * 2 - 1;
      m.ny = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return mouse;
}
