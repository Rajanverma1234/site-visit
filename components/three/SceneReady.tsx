"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

/**
 * Place inside a <Suspense> in a Canvas: calls `onReady` once the scene has actually
 * rendered a couple of frames, so the static poster can cross-fade away without a flash.
 */
export default function SceneReady({ onReady }: { onReady?: () => void }) {
  const frames = useRef(0);
  const fired = useRef(false);
  useFrame(() => {
    if (fired.current) return;
    frames.current += 1;
    if (frames.current >= 3) {
      fired.current = true;
      onReady?.();
    }
  });
  return null;
}
