"use client";

import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { seededRandom } from "@/lib/utils";

/**
 * THE SOVEREIGN — two procedurally built glass towers at golden hour.
 * Repeated geometry (slabs, fins, windows, city blocks, trees) is instanced to keep draw calls low.
 */

export const FLOORS = 42;
export const FLOOR_H = 0.42;
export const TOWER_W = 4.6;
export const TOWER_H = FLOORS * FLOOR_H;
const COLS = 5; // window columns per façade

export const TOWERS: { position: [number, number, number]; rotation: number }[] = [
  { position: [-3.5, 0, 0.6], rotation: 0.2 },
  { position: [3.7, 0, -2.4], rotation: -0.14 },
];

const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpS = new THREE.Vector3(1, 1, 1);
const UP = new THREE.Vector3(0, 1, 0);

function towerMatrix(i: number) {
  const t = TOWERS[i];
  return new THREE.Matrix4().compose(new THREE.Vector3(...t.position), tmpQ.clone().setFromAxisAngle(UP, t.rotation), tmpS);
}

/** Glass cores + crown + sky-lounge band. */
function TowerCores() {
  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#1a2433",
        metalness: 0.75,
        roughness: 0.06,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.6,
        reflectivity: 1,
      }),
    [],
  );
  const lounge = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c8a96a", emissive: "#e8b86a", emissiveIntensity: 2.2, toneMapped: false }), []);
  const crown = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c8a96a", metalness: 1, roughness: 0.25 }), []);

  return (
    <>
      {TOWERS.map((t, i) => (
        <group key={i} position={t.position} rotation={[0, t.rotation, 0]}>
          <mesh material={glass} position={[0, TOWER_H / 2, 0]} castShadow>
            <boxGeometry args={[TOWER_W, TOWER_H, TOWER_W]} />
          </mesh>
          {/* Sky lounge glow band (40th floor) */}
          <mesh material={lounge} position={[0, 40 * FLOOR_H - FLOOR_H / 2, 0]}>
            <boxGeometry args={[TOWER_W + 0.1, FLOOR_H * 0.55, TOWER_W + 0.1]} />
          </mesh>
          {/* Crown: brass frame + lantern */}
          <mesh material={glass} position={[0, TOWER_H + 0.7, 0]}>
            <boxGeometry args={[TOWER_W * 0.8, 1.4, TOWER_W * 0.8]} />
          </mesh>
          <mesh material={crown} position={[0, TOWER_H + 1.45, 0]}>
            <boxGeometry args={[TOWER_W + 0.25, 0.12, TOWER_W + 0.25]} />
          </mesh>
          <mesh material={crown} position={[0, TOWER_H + 2.4, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 2, 6]} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** Floor slab edges + vertical brass fins, both instanced across the two towers. */
function SlabsAndFins() {
  const slabs = useRef<THREE.InstancedMesh>(null);
  const fins = useRef<THREE.InstancedMesh>(null);
  const slabCount = FLOORS * TOWERS.length;
  const finCount = (COLS + 1) * 4 * TOWERS.length;

  useLayoutEffect(() => {
    let s = 0;
    let f = 0;
    for (let t = 0; t < TOWERS.length; t++) {
      const tm = towerMatrix(t);
      for (let fl = 1; fl <= FLOORS; fl++) {
        tmpM.makeTranslation(0, fl * FLOOR_H, 0);
        slabs.current!.setMatrixAt(s++, tm.clone().multiply(tmpM));
      }
      for (let face = 0; face < 4; face++) {
        for (let c = 0; c <= COLS; c++) {
          const u = -TOWER_W / 2 + (c / COLS) * TOWER_W;
          const local = new THREE.Matrix4().makeRotationY((face * Math.PI) / 2).multiply(new THREE.Matrix4().makeTranslation(u, TOWER_H / 2, TOWER_W / 2 + 0.06));
          fins.current!.setMatrixAt(f++, tm.clone().multiply(local));
        }
      }
    }
    slabs.current!.instanceMatrix.needsUpdate = true;
    fins.current!.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <>
      <instancedMesh ref={slabs} args={[undefined, undefined, slabCount]}>
        <boxGeometry args={[TOWER_W + 0.14, 0.05, TOWER_W + 0.14]} />
        <meshStandardMaterial color="#a39d94" roughness={0.55} metalness={0.2} />
      </instancedMesh>
      <instancedMesh ref={fins} args={[undefined, undefined, finCount]}>
        <boxGeometry args={[0.045, TOWER_H, 0.12]} />
        <meshStandardMaterial color="#b8955a" metalness={1} roughness={0.32} />
      </instancedMesh>
    </>
  );
}

/**
 * Instanced window panes. Each frame a few random windows switch on (or off),
 * so it feels like residents are coming home as dusk falls.
 */
function Windows({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = FLOORS * COLS * 4 * TOWERS.length;
  const lit = useRef<Uint8Array>(new Uint8Array(count));
  const litCount = useRef(0);
  const acc = useRef(0);
  const rand = useMemo(() => seededRandom(7), []);
  const OFF = useMemo(() => new THREE.Color("#0c1219"), []);
  const palette = useMemo(() => ["#ffcf8a", "#ffd9a0", "#ffe7c2", "#ffc070", "#f4f1ff"].map((c) => new THREE.Color(c).multiplyScalar(2.2)), []);

  useLayoutEffect(() => {
    const mesh = ref.current!;
    let i = 0;
    for (let t = 0; t < TOWERS.length; t++) {
      const tm = towerMatrix(t);
      for (let face = 0; face < 4; face++) {
        for (let fl = 0; fl < FLOORS; fl++) {
          for (let c = 0; c < COLS; c++) {
            const u = -TOWER_W / 2 + ((c + 0.5) / COLS) * TOWER_W;
            const y = fl * FLOOR_H + FLOOR_H * 0.55;
            const local = new THREE.Matrix4().makeRotationY((face * Math.PI) / 2).multiply(new THREE.Matrix4().makeTranslation(u, y, TOWER_W / 2 + 0.012));
            mesh.setMatrixAt(i, tm.clone().multiply(local));
            const on = rand() < 0.16 && fl !== 39; // floor 40 (index 39) is the sky lounge band
            lit.current[i] = on ? 1 : 0;
            if (on) litCount.current++;
            mesh.setColorAt(i, on ? palette[Math.floor(rand() * palette.length)] : OFF);
            i++;
          }
        }
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [OFF, palette, rand]);

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    acc.current += delta;
    const interval = reducedMotion ? 0.6 : 0.06;
    if (acc.current < interval) return;
    acc.current = 0;
    const target = 0.42;
    const flips = reducedMotion ? 1 : 3;
    for (let k = 0; k < flips; k++) {
      const idx = Math.floor(Math.random() * count);
      const isOn = lit.current[idx] === 1;
      const turnOn = !isOn && (litCount.current / count < target || Math.random() < 0.3);
      if (turnOn) {
        lit.current[idx] = 1;
        litCount.current++;
        mesh.setColorAt(idx, palette[Math.floor(Math.random() * palette.length)]);
      } else if (isOn && Math.random() < 0.35) {
        lit.current[idx] = 0;
        litCount.current--;
        mesh.setColorAt(idx, OFF);
      }
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <planeGeometry args={[(TOWER_W / COLS) * 0.78, FLOOR_H * 0.62]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

/** Podium, landscaped greens and instanced trees. */
function Podium() {
  const trees = useRef<THREE.InstancedMesh>(null);
  const treeCount = 46;

  useLayoutEffect(() => {
    const r = seededRandom(11);
    const m = new THREE.Matrix4();
    for (let i = 0; i < treeCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (9 + r() * 6) + (r() - 0.5) * 2;
      const z = -6 + r() * 14;
      const s = 0.55 + r() * 0.5;
      m.compose(new THREE.Vector3(x, 0.4 + s * 0.6, z), new THREE.Quaternion(), new THREE.Vector3(s, s * 1.3, s));
      trees.current!.setMatrixAt(i, m);
    }
    trees.current!.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group>
      <mesh position={[0, 0.6, -0.8]} castShadow receiveShadow>
        <boxGeometry args={[17, 1.2, 9.5]} />
        <meshStandardMaterial color="#26241f" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Lobby glow */}
      <mesh position={[0, 0.55, 3.97]}>
        <planeGeometry args={[12, 0.7]} />
        <meshBasicMaterial color={new THREE.Color("#ffd29a").multiplyScalar(1.6)} toneMapped={false} />
      </mesh>
      {/* Greens */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[9.5, 17, 48]} />
        <meshStandardMaterial color="#1f2b1c" roughness={1} />
      </mesh>
      <instancedMesh ref={trees} args={[undefined, undefined, treeCount]}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial color="#2b3a24" roughness={0.9} flatShading />
      </instancedMesh>
    </group>
  );
}

/** Generic surrounding city blocks — silhouettes fading into the fog. */
function CityBlocks() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = 70;
  useLayoutEffect(() => {
    const r = seededRandom(99);
    const m = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      const a = r() * Math.PI * 2;
      const dist = 26 + r() * 50;
      const x = Math.cos(a) * dist;
      const z = Math.sin(a) * dist - 10;
      if (z > 15) {
        m.makeScale(0, 0, 0); // keep the foreground (camera side) clear
        ref.current!.setMatrixAt(i, m);
        continue;
      }
      const w = 2.5 + r() * 4;
      const h = 3 + r() * (dist > 50 ? 14 : 9);
      m.compose(new THREE.Vector3(x, h / 2, z), new THREE.Quaternion().setFromAxisAngle(UP, r() * Math.PI), new THREE.Vector3(w, h, w * (0.7 + r() * 0.6)));
      ref.current!.setMatrixAt(i, m);
    }
    ref.current!.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#1b1c22" roughness={0.65} metalness={0.4} />
    </instancedMesh>
  );
}

function ReflectiveGround({ quality }: { quality: "high" | "low" }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[400, 400]} />
      {quality === "high" ? (
        <MeshReflectorMaterial
          blur={[300, 80]}
          resolution={512}
          mixBlur={1}
          mixStrength={2.2}
          roughness={0.9}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0d0d10"
          metalness={0.6}
          mirror={0.6}
        />
      ) : (
        <meshStandardMaterial color="#0f0f12" roughness={0.35} metalness={0.7} />
      )}
    </mesh>
  );
}

export default function Towers({ quality = "high", reducedMotion = false }: { quality?: "high" | "low"; reducedMotion?: boolean }) {
  return (
    <group>
      <TowerCores />
      <SlabsAndFins />
      <Windows reducedMotion={reducedMotion} />
      <Podium />
      <CityBlocks />
      <ReflectiveGround quality={quality} />
    </group>
  );
}
