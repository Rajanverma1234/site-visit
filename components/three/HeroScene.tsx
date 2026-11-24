"use client";

import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Suspense, useState, type MutableRefObject } from "react";
import Towers from "./Towers";
import SceneReady from "./SceneReady";
import { GoldenHourEnvironment, GradientSky } from "./Environment";
import { FrameloopController, HeroCameraRig } from "./CameraRig";
import { useMouse } from "@/hooks/useMouse";
import { useIsTouch, useLowPower, useReducedMotion } from "@/hooks/useMediaQuery";

/** Full-screen hero canvas. Lazy-loaded (ssr:false) from the Hero section. */
export default function HeroScene({ progress, active, onReady }: { progress: MutableRefObject<number>; active: boolean; onReady?: () => void }) {
  const mouse = useMouse();
  const touch = useIsTouch();
  const reducedMotion = useReducedMotion();
  const lowPower = useLowPower();
  const [measured, setQuality] = useState<"high" | "low">("high");
  // Phones / low-power devices: lower pixel ratio, no reflections, no post-processing.
  const quality = lowPower ? "low" : measured;

  return (
    <Canvas
      dpr={lowPower ? [1, 1.25] : [1, 1.5]}
      camera={{ fov: 32, near: 0.5, far: 500, position: [0, 6, 34] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      aria-label="Interactive 3D view of The Sovereign towers at golden hour"
      role="img"
    >
      <FrameloopController active={active} />
      <PerformanceMonitor onDecline={() => setQuality("low")} onIncline={() => setQuality("high")} flipflops={3} onFallback={() => setQuality("low")} />
      <AdaptiveDpr pixelated />

      <fog attach="fog" args={["#3b2a26", 30, 120]} />
      <GradientSky top="#151a33" middle="#6e4a5a" bottom="#f2a35f" />
      <ambientLight intensity={0.25} />
      <hemisphereLight args={["#ffd6a5", "#1a1a22", 0.5]} />
      <directionalLight position={[22, 9, 18]} intensity={2.4} color="#ffb36b" />

      <Suspense fallback={null}>
        <GoldenHourEnvironment />
        <Towers quality={quality} reducedMotion={reducedMotion} />
        <SceneReady onReady={onReady} />
      </Suspense>

      <HeroCameraRig mouse={mouse} progress={progress} touch={touch} reducedMotion={reducedMotion} />

      {quality === "high" && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur luminanceThreshold={0.85} intensity={0.75} radius={0.6} />
          <Vignette offset={0.25} darkness={0.75} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
