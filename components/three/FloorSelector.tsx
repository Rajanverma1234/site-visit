"use client";

import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { AdaptiveDpr, ContactShadows, OrbitControls } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { FloorInfo } from "@/data/units";
import { statusColors } from "@/data/units";
import { FrameloopController } from "./CameraRig";
import { GoldenHourEnvironment } from "./Environment";
import SceneReady from "./SceneReady";

const FH = 0.42; // floor height
const W = 4.4; // tower width
const D = 3.4; // tower depth

export interface FloorSelectorProps {
  floors: FloorInfo[];
  hovered: number | null;
  selected: number | null;
  isMatch: (f: FloorInfo) => boolean;
  onHover: (floor: number | null, clientX?: number, clientY?: number) => void;
  onSelect: (floor: number) => void;
  active: boolean;
  touch: boolean;
  reducedMotion?: boolean;
  onReady?: () => void;
}

const GOLD = new THREE.Color("#C8A96A");
const BASE = new THREE.Color("#55627a");
const DIM = new THREE.Color("#17191d");
const AMENITY = new THREE.Color("#6b5b3e");

/** One floor slab. Colour reacts to hover / selection / filter state. */
function Slab({
  info,
  state,
  onHover,
  onSelect,
}: {
  info: FloorInfo;
  state: "hover" | "selected" | "match" | "dim" | "amenity";
  onHover: FloorSelectorProps["onHover"];
  onSelect: FloorSelectorProps["onSelect"];
}) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const y = (info.floor - 0.5) * FH;
  const color = state === "hover" || state === "selected" ? GOLD : state === "amenity" ? AMENITY : state === "dim" ? DIM : BASE;
  const emissive = state === "hover" ? 0.9 : state === "selected" ? 0.55 : state === "amenity" ? 0.25 : 0;
  const interactive = info.kind === "residential" || info.kind === "penthouse";

  const handleMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(info.floor, e.nativeEvent.clientX, e.nativeEvent.clientY);
  };

  return (
    <mesh
      position={[0, y, 0]}
      onPointerMove={handleMove}
      onPointerOut={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        if (interactive) onSelect(info.floor);
      }}
    >
      <boxGeometry args={[W, FH * 0.9, D]} />
      <meshStandardMaterial
        ref={mat}
        color={color}
        emissive={color}
        emissiveIntensity={emissive}
        metalness={0.55}
        roughness={0.25}
        transparent={state === "dim"}
        opacity={state === "dim" ? 0.45 : 1}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

/** Small instanced status markers on the front façade — one per unit. */
function UnitMarkers({ floors }: { floors: FloorInfo[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const units = useMemo(() => floors.flatMap((f) => f.units.map((u, i) => ({ u, i, n: f.units.length }))), [floors]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    units.forEach(({ u, i, n }, k) => {
      const span = W * 0.7;
      const x = n === 1 ? 0 : -span / 2 + (i / (n - 1)) * span;
      m.makeTranslation(x, (u.floor - 0.5) * FH, D / 2 + 0.03);
      ref.current!.setMatrixAt(k, m);
      ref.current!.setColorAt(k, c.set(statusColors[u.status]).multiplyScalar(1.4));
    });
    ref.current!.instanceMatrix.needsUpdate = true;
    if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
  }, [units]);

  return (
    <instancedMesh key={units.length} ref={ref} args={[undefined, undefined, units.length]} raycast={() => null}>
      <boxGeometry args={[0.5, FH * 0.32, 0.02]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

function Tower({ floors, hovered, selected, isMatch, onHover, onSelect }: Omit<FloorSelectorProps, "active" | "touch" | "reducedMotion" | "onReady">) {
  return (
    <group position={[0, 0, 0]}>
      {floors.map((f) => {
        const isRes = f.kind === "residential" || f.kind === "penthouse";
        const state = !isRes ? "amenity" : hovered === f.floor ? "hover" : selected === f.floor ? "selected" : isMatch(f) ? "match" : "dim";
        return <Slab key={f.floor} info={f} state={state} onHover={onHover} onSelect={onSelect} />;
      })}
      <UnitMarkers floors={floors} />
      {/* Brass corner columns */}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <mesh key={i} position={[(sx * W) / 2, (42 * FH) / 2, (sz * D) / 2]} raycast={() => null}>
          <boxGeometry args={[0.08, 42 * FH + 0.2, 0.08]} />
          <meshStandardMaterial color="#b8955a" metalness={1} roughness={0.3} />
        </mesh>
      ))}
      {/* Crown */}
      <mesh position={[0, 42 * FH + 0.5, 0]} raycast={() => null}>
        <boxGeometry args={[W * 0.75, 1, D * 0.75]} />
        <meshStandardMaterial color="#1c2430" metalness={0.8} roughness={0.1} />
      </mesh>
      {/* Plinth */}
      <mesh position={[0, -0.2, 0]} raycast={() => null}>
        <boxGeometry args={[W + 2, 0.4, D + 2]} />
        <meshStandardMaterial color="#1e1d1b" roughness={0.6} />
      </mesh>
    </group>
  );
}

export default function FloorSelector3D(props: FloorSelectorProps) {
  const { active, touch, reducedMotion, onReady, ...towerProps } = props;
  return (
    <Canvas dpr={[1, 1.5]} camera={{ fov: 30, position: [21, 14, 33] }} gl={{ antialias: true }} onPointerMissed={() => props.onHover(null)}>
      <FrameloopController active={active} />
      <AdaptiveDpr pixelated />
      <ambientLight intensity={0.7} />
      <directionalLight position={[14, 20, 18]} intensity={2.2} color="#ffe2b8" />
      <directionalLight position={[-16, 8, -10]} intensity={0.6} color="#9fb3d9" />
      <GoldenHourEnvironment />
      <Tower {...towerProps} />
      <SceneReady onReady={onReady} />
      <TouchScrollFix touch={touch} />
      <ContactShadows position={[0, -0.39, 0]} opacity={0.6} scale={20} blur={2.6} far={6} frames={1} />
      <OrbitControls
        target={[0, 8.4, 0]}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.9}
        autoRotate={props.hovered === null && !touch && !reducedMotion}
        autoRotateSpeed={0.4}
        enableDamping
        rotateSpeed={0.5}
      />
    </Canvas>
  );
}

/**
 * OrbitControls sets `touch-action: none`, which would trap phone users on a canvas that fills
 * most of the screen. Restore `pan-y` so vertical swipes scroll the page and horizontal drags rotate.
 */
function TouchScrollFix({ touch }: { touch: boolean }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    if (!touch) return;
    const id = window.setTimeout(() => (gl.domElement.style.touchAction = "pan-y"), 0);
    return () => window.clearTimeout(id);
  }, [gl, touch]);
  return null;
}
