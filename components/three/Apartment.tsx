"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor, Stars } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import Rooms from "./Rooms";
import { FloorHotspot, InfoContext } from "./Hotspot";
import { TourCameraRig } from "./CameraRig";
import { GradientSky, InteriorEnvironment } from "./Environment";
import { MaterialsContext, PALETTES, useCreateMaterials, type InteriorStyle, type TourMaterials } from "./materials";
import { EYE_HEIGHT, tourRooms, type RoomId } from "@/data/tour";
import { useMouse } from "@/hooks/useMouse";
import { useLowPower } from "@/hooks/useMediaQuery";
import { seededRandom } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Exterior: DLF golf course, trees, distant skyline                    */
/* ------------------------------------------------------------------ */

const GROUND_Y = -45; // we're ~30 floors up

function Exterior({ nightRef }: { nightRef: React.MutableRefObject<{ t: number }> }) {
  const trees = useRef<THREE.InstancedMesh>(null);
  const trunks = useRef<THREE.InstancedMesh>(null);
  const blocks = useRef<THREE.InstancedMesh>(null);
  const lights = useRef<THREE.InstancedMesh>(null);
  const TREE_N = 420;
  const BLOCK_N = 110;
  const LIGHT_N = 700;

  const mats = useMemo(
    () => ({
      grass: new THREE.MeshStandardMaterial({ color: "#5f8a45", roughness: 1 }),
      fairway: new THREE.MeshStandardMaterial({ color: "#7cad57", roughness: 0.95 }),
      sand: new THREE.MeshStandardMaterial({ color: "#e4d6ad", roughness: 1 }),
      water: new THREE.MeshStandardMaterial({ color: "#4d7f92", roughness: 0.08, metalness: 0.6 }),
      tree: new THREE.MeshStandardMaterial({ color: "#2f4d2a", roughness: 1, flatShading: true }),
      trunk: new THREE.MeshStandardMaterial({ color: "#3b2d22", roughness: 1 }),
      city: new THREE.MeshStandardMaterial({ color: "#a7afb8", roughness: 0.6, metalness: 0.2 }),
      cityLight: new THREE.MeshBasicMaterial({ color: "#ffcf8a", toneMapped: false, transparent: true, opacity: 0 }),
      moon: new THREE.MeshBasicMaterial({ color: "#f4f1ff", toneMapped: false, transparent: true, opacity: 0 }),
    }),
    [],
  );
  const day = useMemo(() => ({ grass: new THREE.Color("#5f8a45"), fairway: new THREE.Color("#7cad57"), tree: new THREE.Color("#2f4d2a"), city: new THREE.Color("#a7afb8"), water: new THREE.Color("#4d7f92") }), []);
  const night = useMemo(() => ({ grass: new THREE.Color("#0c1610"), fairway: new THREE.Color("#122016"), tree: new THREE.Color("#07100a"), city: new THREE.Color("#141822"), water: new THREE.Color("#0b1622") }), []);

  const fairways = useMemo(
    () => [
      { x: -20, z: -90, w: 26, d: 120, r: 0.3 },
      { x: 45, z: -170, w: 30, d: 150, r: -0.4 },
      { x: -70, z: -230, w: 28, d: 130, r: 0.6 },
      { x: 20, z: -320, w: 32, d: 140, r: 0.1 },
    ],
    [],
  );

  useLayoutEffect(() => {
    const r = seededRandom(21);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    // Trees: scattered, avoiding the fairway centres
    let i = 0;
    while (i < TREE_N) {
      const x = (r() - 0.5) * 520;
      const z = -30 - r() * 420;
      const onFairway = fairways.some((f) => {
        const dx = x - f.x;
        const dz = z - f.z;
        const c = Math.cos(f.r);
        const s = Math.sin(f.r);
        const lx = dx * c - dz * s;
        const lz = dx * s + dz * c;
        return (lx / (f.w * 0.55)) ** 2 + (lz / (f.d * 0.5)) ** 2 < 1;
      });
      if (onFairway) continue;
      const sc = 2.2 + r() * 2.6;
      m.compose(new THREE.Vector3(x, GROUND_Y + sc * 1.6, z), q, new THREE.Vector3(sc, sc * 1.25, sc));
      trees.current!.setMatrixAt(i, m);
      m.compose(new THREE.Vector3(x, GROUND_Y + sc * 0.5, z), q, new THREE.Vector3(sc * 0.18, sc, sc * 0.18));
      trunks.current!.setMatrixAt(i, m);
      i++;
    }
    trees.current!.instanceMatrix.needsUpdate = true;
    trunks.current!.instanceMatrix.needsUpdate = true;

    // Distant skyline + window lights
    let li = 0;
    for (let b = 0; b < BLOCK_N; b++) {
      const a = -Math.PI * 0.95 + r() * Math.PI * 0.9; // mostly in front (north)
      const dist = 700 + r() * 350;
      const x = Math.cos(a) * dist;
      const z = Math.sin(a) * dist;
      const w = 14 + r() * 24;
      const h = 20 + r() * 55; // stays near the horizon so the greens stay the hero
      m.compose(new THREE.Vector3(x, GROUND_Y + h / 2, z), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a), new THREE.Vector3(w, h, w));
      blocks.current!.setMatrixAt(b, m);
      const nLights = Math.floor(4 + r() * 6);
      for (let k = 0; k < nLights && li < LIGHT_N; k++) {
        const lx = x + (r() - 0.5) * w * 0.9;
        const lz = z + (r() - 0.5) * w * 0.9;
        const ly = GROUND_Y + r() * h;
        // place on the face nearest the viewer
        const toViewer = new THREE.Vector3(-x, 0, -z).normalize().multiplyScalar(w * 0.52);
        m.compose(new THREE.Vector3(lx + toViewer.x, ly, lz + toViewer.z), new THREE.Quaternion(), new THREE.Vector3(1.6, 1.1, 1.6));
        lights.current!.setMatrixAt(li++, m);
      }
    }
    for (; li < LIGHT_N; li++) {
      m.makeScale(0, 0, 0);
      lights.current!.setMatrixAt(li, m);
    }
    blocks.current!.instanceMatrix.needsUpdate = true;
    lights.current!.instanceMatrix.needsUpdate = true;
  }, [fairways]);

  useFrame(() => {
    const t = nightRef.current.t;
    mats.grass.color.lerpColors(day.grass, night.grass, t);
    mats.fairway.color.lerpColors(day.fairway, night.fairway, t);
    mats.tree.color.lerpColors(day.tree, night.tree, t);
    mats.city.color.lerpColors(day.city, night.city, t);
    mats.water.color.lerpColors(day.water, night.water, t);
    mats.cityLight.opacity = t;
    mats.moon.opacity = t;
  });

  return (
    <group raycast={() => null}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GROUND_Y, -300]} material={mats.grass} raycast={() => null}>
        <planeGeometry args={[2000, 1400]} />
      </mesh>
      {fairways.map((f, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, f.r]} position={[f.x, GROUND_Y + 0.05, f.z]} scale={[f.w / 2, f.d / 2, 1]} material={mats.fairway} raycast={() => null}>
          <circleGeometry args={[1, 40]} />
        </mesh>
      ))}
      {[
        [-12, -60, 5],
        [52, -110, 6],
        [-60, -180, 7],
        [30, -260, 5],
      ].map(([x, z, s], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, GROUND_Y + 0.1, z]} scale={[s, s * 0.6, 1]} material={mats.sand} raycast={() => null}>
          <circleGeometry args={[1, 24]} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-35, GROUND_Y + 0.08, -140]} scale={[22, 12, 1]} material={mats.water} raycast={() => null}>
        <circleGeometry args={[1, 40]} />
      </mesh>
      <instancedMesh ref={trees} args={[undefined, undefined, TREE_N]} material={mats.tree} raycast={() => null}>
        <icosahedronGeometry args={[1, 0]} />
      </instancedMesh>
      <instancedMesh ref={trunks} args={[undefined, undefined, TREE_N]} material={mats.trunk} raycast={() => null}>
        <cylinderGeometry args={[1, 1, 1, 5]} />
      </instancedMesh>
      <instancedMesh ref={blocks} args={[undefined, undefined, BLOCK_N]} material={mats.city} raycast={() => null}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <instancedMesh ref={lights} args={[undefined, undefined, LIGHT_N]} material={mats.cityLight} raycast={() => null}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <mesh position={[-260, 160, -620]} material={mats.moon} raycast={() => null}>
        <sphereGeometry args={[12, 24, 16]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Lighting + atmosphere driven by the day/night value                  */
/* ------------------------------------------------------------------ */

const LAMP_POSITIONS: [number, number, number][] = [
  [-1.2, 2.4, -4.5], // living chandelier
  [7, 1.9, -5], // dining
  [7, 2.2, 1.0], // kitchen
  [-11, 2.4, -4.5], // master
  [-10, 2.4, 1.6], // wardrobe
  [13.5, 2.4, -4], // bedroom 2
];

function Atmosphere({ nightRef, materials }: { nightRef: React.MutableRefObject<{ t: number }>; materials: TourMaterials }) {
  const { scene, gl } = useThree();
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const lamps = useRef<(THREE.PointLight | null)[]>([]);
  const sky = useRef<Record<string, THREE.IUniform> | null>(null);
  const stars = useRef<THREE.Points>(null);
  const fog = useMemo(() => new THREE.Fog("#cfdbe4", 120, 1050), []);

  const C = useMemo(
    () => ({
      skyTopDay: new THREE.Color("#5f93c9"),
      skyMidDay: new THREE.Color("#a9c8e3"),
      skyBotDay: new THREE.Color("#e6ecef"),
      skyTopNight: new THREE.Color("#03060f"),
      skyMidNight: new THREE.Color("#0d1630"),
      skyBotNight: new THREE.Color("#2a2442"),
      fogDay: new THREE.Color("#cfdbe4"),
      fogNight: new THREE.Color("#141a2c"),
      sunDay: new THREE.Color("#fff1dc"),
      sunNight: new THREE.Color("#8fa6ff"),
      lampBase: new THREE.Color("#ffd9a0"),
      coveBase: new THREE.Color("#ffcf8f"),
    }),
    [],
  );

  useEffect(() => {
    scene.fog = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, fog]);

  useFrame(() => {
    const t = nightRef.current.t;
    if (sun.current) {
      sun.current.intensity = THREE.MathUtils.lerp(1.5, 0.1, t);
      sun.current.color.lerpColors(C.sunDay, C.sunNight, t);
    }
    if (hemi.current) hemi.current.intensity = THREE.MathUtils.lerp(0.55, 0.06, t);
    if (amb.current) amb.current.intensity = THREE.MathUtils.lerp(0.2, 0.05, t);
    lamps.current.forEach((l) => l && (l.intensity = THREE.MathUtils.lerp(1.2, 12, t)));
    if (sky.current) {
      (sky.current.uTop.value as THREE.Color).lerpColors(C.skyTopDay, C.skyTopNight, t);
      (sky.current.uMiddle.value as THREE.Color).lerpColors(C.skyMidDay, C.skyMidNight, t);
      (sky.current.uBottom.value as THREE.Color).lerpColors(C.skyBotDay, C.skyBotNight, t);
    }
    fog.color.lerpColors(C.fogDay, C.fogNight, t);
    // Emissive fixtures glow brighter (and bloom) at night
    materials.lamp.color.copy(C.lampBase).multiplyScalar(THREE.MathUtils.lerp(1, 3.2, t));
    materials.cove.color.copy(C.coveBase).multiplyScalar(THREE.MathUtils.lerp(0.9, 2.6, t));
    materials.glass.opacity = THREE.MathUtils.lerp(0.1, 0.22, t);
    scene.environmentIntensity = THREE.MathUtils.lerp(0.6, 0.22, t);
    gl.toneMappingExposure = THREE.MathUtils.lerp(0.9, 1.0, t);
    if (stars.current) stars.current.visible = t > 0.4;
  });

  return (
    <>
      <GradientSky uniformsRef={sky} top="#5f93c9" middle="#a9c8e3" bottom="#e6ecef" radius={900} />
      <Stars ref={stars} radius={600} depth={80} count={2500} factor={6} saturation={0} fade speed={0.3} />
      <ambientLight ref={amb} intensity={0.35} />
      <hemisphereLight ref={hemi} args={["#dfeaff", "#8a7a66", 0.85]} />
      <directionalLight ref={sun} position={[18, 26, -40]} intensity={2.6} color="#fff1dc" />
      {LAMP_POSITIONS.map((p, i) => (
        <pointLight
          key={i}
          ref={(el) => {
            lamps.current[i] = el;
          }}
          position={p}
          intensity={2.5}
          distance={9}
          decay={2}
          color="#ffcf94"
        />
      ))}
    </>
  );
}

/** Lerps the palette-driven materials toward the chosen interior style. */
function StyleTransition({ style, materials }: { style: InteriorStyle; materials: TourMaterials }) {
  const targets = useMemo(() => {
    const p = PALETTES[style];
    return Object.fromEntries(Object.entries(p).map(([k, v]) => [k, new THREE.Color(v)])) as Record<keyof typeof p, THREE.Color>;
  }, [style]);
  useFrame((_, delta) => {
    const k = 1 - Math.exp(-delta * 3.2);
    (Object.keys(targets) as (keyof typeof targets)[]).forEach((key) => {
      materials.styled[key].color.lerp(targets[key], k);
    });
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* Canvas                                                              */
/* ------------------------------------------------------------------ */

export interface TourCanvasProps {
  room: RoomId;
  night: boolean;
  style: InteriorStyle;
  touch: boolean;
  reducedMotion: boolean;
  onRoomChange: (room: RoomId) => void;
  onMoving: (moving: boolean) => void;
}

function Scene({ room, night, style, touch, reducedMotion, onRoomChange, onMoving, moving }: TourCanvasProps & { moving: boolean }) {
  const materials = useCreateMaterials(style);
  const mouse = useMouse();
  const nightRef = useRef({ t: night ? 1 : 0 });
  const [activeInfo, setActiveInfo] = useState<string | null>(null);

  useEffect(() => {
    const tw = gsap.to(nightRef.current, { t: night ? 1 : 0, duration: reducedMotion ? 0 : 2.4, ease: "sine.inOut" });
    return () => {
      tw.kill();
    };
  }, [night, reducedMotion]);

  useEffect(() => {
    if (moving) setActiveInfo(null);
  }, [moving]);

  const infoCtx = useMemo(() => ({ active: activeInfo, setActive: setActiveInfo, hidden: moving }), [activeInfo, moving]);

  return (
    <MaterialsContext.Provider value={materials}>
      <InfoContext.Provider value={infoCtx}>
        <InteriorEnvironment />
        <Atmosphere nightRef={nightRef} materials={materials} />
        <StyleTransition style={style} materials={materials} />
        <Exterior nightRef={nightRef} />
        <Rooms />
        {!moving &&
          tourRooms
            .filter((r) => r.id !== room)
            .map((r) => <FloorHotspot key={r.id} position={[r.spot[0], r.id === "balcony" ? 0.0 : 0, r.spot[1]]} label={r.short} onSelect={() => onRoomChange(r.id)} />)}
        <TourCameraRig room={room} mouse={mouse} touch={touch} reducedMotion={reducedMotion} onMoving={onMoving} />
      </InfoContext.Provider>
    </MaterialsContext.Provider>
  );
}

export default function TourCanvas(props: TourCanvasProps) {
  const lowPower = useLowPower();
  const [measured, setQuality] = useState<"high" | "low">("high");
  const quality = lowPower ? "low" : measured;
  const [moving, setMoving] = useState(false);
  const { onMoving } = props;
  const handleMoving = useMemo(
    () => (m: boolean) => {
      setMoving(m);
      onMoving(m);
    },
    [onMoving],
  );

  return (
    <Canvas
      dpr={lowPower ? [1, 1.25] : [1, 1.5]}
      camera={{ fov: 62, near: 0.05, far: 2000, position: [0, EYE_HEIGHT, 0] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ touchAction: "none" }}
      aria-label="Interactive 3D walkthrough of a 4 BHK residence at The Sovereign"
      role="img"
    >
      <PerformanceMonitor onDecline={() => setQuality("low")} onIncline={() => setQuality("high")} flipflops={3} onFallback={() => setQuality("low")} />
      <AdaptiveDpr pixelated />
      <Suspense fallback={null}>
        <Scene {...props} onMoving={handleMoving} moving={moving} />
      </Suspense>
      {quality === "high" && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur luminanceThreshold={1} intensity={0.7} radius={0.55} />
          <Vignette offset={0.3} darkness={0.55} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
