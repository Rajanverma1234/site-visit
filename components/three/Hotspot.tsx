"use client";

import { Billboard, Html } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import type { InfoPoint } from "@/data/tour";

/* ------------------------------------------------------------------ */
/* Floor hotspot: glowing ring on the floor — click to glide there.     */
/* ------------------------------------------------------------------ */

export function FloorHotspot({ position, label, onSelect }: { position: [number, number, number]; label: string; onSelect: () => void }) {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring.current) {
      const s = 1 + Math.sin(t * 2.4) * 0.08 + (hover ? 0.25 : 0);
      ring.current.scale.lerp(new THREE.Vector3(s, s, s), 0.2);
    }
  });

  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 6) return; // was a drag, not a click
    onSelect();
  };

  return (
    <group ref={group} position={position}>
      {/* Generous invisible hit area */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, 0]}
        onClick={click}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.dataset.tourCursor = "Go";
        }}
        onPointerOut={() => {
          setHover(false);
          delete document.body.dataset.tourCursor;
        }}
      >
        <circleGeometry args={[0.6, 24]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]} raycast={() => null}>
        <ringGeometry args={[0.3, 0.38, 48]} />
        <meshBasicMaterial color={hover ? "#ffe2a8" : "#e8c988"} transparent opacity={hover ? 1 : 0.85} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.022, 0]} raycast={() => null}>
        <circleGeometry args={[0.3, 32]} />
        <meshBasicMaterial color="#c8a96a" transparent opacity={hover ? 0.35 : 0.15} toneMapped={false} />
      </mesh>
      {hover && (
        <Html position={[0, 0.5, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div className="whitespace-nowrap rounded-full bg-charcoal/85 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-gold backdrop-blur">
            Go to {label}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Info hover: wrap furniture to show an elegant floating label.        */
/* ------------------------------------------------------------------ */

interface InfoCtx {
  active: string | null;
  setActive: (id: string | null) => void;
  hidden: boolean;
}
export const InfoContext = createContext<InfoCtx>({ active: null, setActive: () => {}, hidden: false });

export function InfoHover({ info, children }: { info: InfoPoint; children: ReactNode }) {
  const { active, setActive, hidden } = useContext(InfoContext);
  const isActive = active === info.id && !hidden;

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        setActive(info.id);
      }}
      onPointerOut={() => {
        if (active === info.id) setActive(null);
      }}
      onClick={(e) => {
        // Tap support for touch devices
        e.stopPropagation();
        if (e.delta > 6) return;
        setActive(isActive ? null : info.id);
      }}
    >
      {children}
      <InfoMarker position={info.position} active={isActive} />
      {isActive && (
        <Html position={info.position} zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
          <div className="w-60 -translate-x-1/2 -translate-y-[calc(100%+18px)] animate-[fadeUp_.35s_ease-out] border border-gold/40 bg-charcoal/85 p-4 text-left shadow-2xl backdrop-blur-md">
            <p className="text-[9px] uppercase tracking-[0.3em] text-gold">Feature</p>
            <p className="mt-1 font-serif text-xl leading-tight text-ivory">{info.title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-ivory/70">{info.detail}</p>
            <span className="absolute -bottom-[18px] left-1/2 h-[18px] w-px bg-gold/60" />
          </div>
        </Html>
      )}
    </group>
  );
}

/** Small pulsing marker so visitors know a feature is hoverable. */
function InfoMarker({ position, active }: { position: [number, number, number]; active: boolean }) {
  const outer = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!outer.current) return;
    const t = (state.clock.elapsedTime * 0.8) % 1;
    outer.current.scale.setScalar(1 + t * 1.6);
    (outer.current.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.7;
  });
  return (
    <Billboard position={position}>
      <mesh raycast={() => null}>
        <circleGeometry args={[0.045, 20]} />
        <meshBasicMaterial color={active ? "#ffffff" : "#e8c988"} toneMapped={false} transparent />
      </mesh>
      <mesh ref={outer} raycast={() => null}>
        <ringGeometry args={[0.06, 0.075, 28]} />
        <meshBasicMaterial color="#e8c988" transparent toneMapped={false} />
      </mesh>
    </Billboard>
  );
}
