"use client";

/**
 * Procedurally modelled 4 BHK interior: shell (floor, walls, glass façade, ceiling)
 * and furniture for every room. All dimensions are in metres at real-world scale.
 *
 * Coordinates follow data/tour.ts: +X east, -Z north (golf-course side).
 */

import { useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { useMaterials } from "./materials";
import { InfoHover } from "./Hotspot";
import { CEILING_HEIGHT as CEIL, infoPoints } from "@/data/tour";

type V3 = [number, number, number];

/* ----------------------------- primitives ----------------------------- */

function B({ s, p, m, r }: { s: V3; p: V3; m: THREE.Material; r?: V3 }) {
  return (
    <mesh position={p} rotation={r} material={m}>
      <boxGeometry args={s} />
    </mesh>
  );
}

function Cyl({ r, rb, h, p, m, seg = 24 }: { r: number; rb?: number; h: number; p: V3; m: THREE.Material; seg?: number }) {
  return (
    <mesh position={p} material={m}>
      <cylinderGeometry args={[r, rb ?? r, h, seg]} />
    </mesh>
  );
}

function Sphere({ r, p, m }: { r: number; p: V3; m: THREE.Material }) {
  return (
    <mesh position={p} material={m}>
      <sphereGeometry args={[r, 16, 12]} />
    </mesh>
  );
}

/** Cheap soft contact shadow under furniture. */
function Blob({ p, w, d }: { p: [number, number]; w: number; d: number }) {
  const m = useMaterials();
  return (
    <mesh position={[p[0], 0.026, p[1]]} rotation={[-Math.PI / 2, 0, 0]} material={m.blob} raycast={() => null}>
      <planeGeometry args={[w, d]} />
    </mesh>
  );
}

/** Wall from a→b (x,z) with door openings given as [start, end] distances along the wall. */
function Wall({ a, b, openings = [], t = 0.15, doorH = 2.45 }: { a: [number, number]; b: [number, number]; openings?: [number, number][]; t?: number; doorH?: number }) {
  const m = useMaterials();
  const pieces = useMemo(() => {
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const len = Math.hypot(dx, dz);
    const ux = dx / len;
    const uz = dz / len;
    const rotY = -Math.atan2(dz, dx);
    const out: { p: V3; s: V3; r: V3 }[] = [];
    const add = (s0: number, s1: number, y0: number, y1: number) => {
      if (s1 - s0 <= 0.001) return;
      const c = (s0 + s1) / 2;
      out.push({ p: [a[0] + ux * c, (y0 + y1) / 2, a[1] + uz * c], s: [s1 - s0, y1 - y0, t], r: [0, rotY, 0] });
    };
    let cursor = 0;
    [...openings].sort((x, y) => x[0] - y[0]).forEach(([s0, s1]) => {
      add(cursor, s0, 0, CEIL);
      add(s0, s1, doorH, CEIL); // lintel
      cursor = s1;
    });
    add(cursor, len, 0, CEIL);
    return out;
  }, [a, b, openings, t, doorH]);

  return (
    <>
      {pieces.map((pc, i) => (
        <B key={i} s={pc.s} p={pc.p} r={pc.r} m={m.wall} />
      ))}
    </>
  );
}

function Plant({ p, s = 1 }: { p: V3; s?: number }) {
  const m = useMaterials();
  return (
    <group position={p} scale={s}>
      <Cyl r={0.22} rb={0.17} h={0.45} p={[0, 0.225, 0]} m={m.pot} />
      <mesh position={[0, 0.78, 0]} material={m.leaf}>
        <icosahedronGeometry args={[0.36, 1]} />
      </mesh>
      <mesh position={[0.14, 1.02, 0.08]} material={m.leaf}>
        <icosahedronGeometry args={[0.26, 1]} />
      </mesh>
      <mesh position={[-0.12, 1.12, -0.1]} material={m.leaf}>
        <icosahedronGeometry args={[0.2, 1]} />
      </mesh>
    </group>
  );
}

/** Armchair facing local +X. */
function Armchair({ p, ry, mat }: { p: V3; ry: number; mat?: THREE.Material }) {
  const m = useMaterials();
  const f = mat ?? m.fabric;
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <B s={[0.78, 0.4, 0.82]} p={[0, 0.22, 0]} m={f} />
      <B s={[0.18, 0.48, 0.82]} p={[-0.3, 0.64, 0]} m={f} />
      <B s={[0.7, 0.2, 0.12]} p={[0.02, 0.52, 0.41]} m={f} />
      <B s={[0.7, 0.2, 0.12]} p={[0.02, 0.52, -0.41]} m={f} />
      <B s={[0.7, 0.04, 0.74]} p={[0, 0.02, 0]} m={m.brass} />
    </group>
  );
}

/** Dining chair facing local +Z. */
function DiningChair({ p, ry }: { p: V3; ry: number }) {
  const m = useMaterials();
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <B s={[0.48, 0.08, 0.48]} p={[0, 0.47, 0]} m={m.fabric} />
      <B s={[0.48, 0.58, 0.06]} p={[0, 0.8, -0.22]} m={m.fabric} />
      {[
        [-0.2, -0.2],
        [0.2, -0.2],
        [-0.2, 0.2],
        [0.2, 0.2],
      ].map(([x, z], i) => (
        <B key={i} s={[0.035, 0.44, 0.035]} p={[x, 0.22, z]} m={m.brass} />
      ))}
    </group>
  );
}

function TableLamp({ p }: { p: V3 }) {
  const m = useMaterials();
  return (
    <group position={p}>
      <Cyl r={0.08} h={0.04} p={[0, 0.02, 0]} m={m.brass} />
      <Cyl r={0.012} h={0.3} p={[0, 0.18, 0]} m={m.brass} />
      <Cyl r={0.12} rb={0.16} h={0.22} p={[0, 0.4, 0]} m={m.lamp} />
    </group>
  );
}

/** Invisible hit area (lets an info hover cover a region without visible geometry). */
function HitArea({ p, s }: { p: V3; s: [number, number] }) {
  return (
    <mesh position={p} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={s} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

/* ------------------------------- shell -------------------------------- */

export function Shell() {
  const m = useMaterials();
  const mullions = useMemo(() => {
    const xs: number[] = [];
    for (let i = 0; i <= 20; i++) {
      const x = -14 + i * 1.5;
      if (x > 0 && x < 2) continue; // sliding door opening
      xs.push(x);
    }
    xs.push(0, 2);
    return xs;
  }, []);

  return (
    // Walls/floor stop pointer events so you can't hover furniture through walls.
    <group onPointerOver={(e) => e.stopPropagation()} onPointerMove={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
      {/* Marble floor (30 x 12 m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1, 0, -2]} material={m.floor}>
        <planeGeometry args={[30, 12]} />
      </mesh>
      {/* Ceiling incl. balcony overhang */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[1, CEIL, -3.5]} material={m.ceiling}>
        <planeGeometry args={[30, 15]} />
      </mesh>

      {/* Exterior walls */}
      <Wall a={[-14, 4]} b={[16, 4]} />
      <Wall a={[-14, -8]} b={[-14, 4]} />
      <Wall a={[16, -8]} b={[16, 4]} />
      {/* Interior partitions with door openings */}
      <Wall a={[-6, -8]} b={[-6, 4]} openings={[[4.6, 6.0]]} />
      <Wall a={[-14, -1]} b={[-6, -1]} openings={[[3, 4.5]]} />
      <Wall a={[10, -8]} b={[10, 4]} openings={[[5.8, 7.2]]} />
      <Wall a={[10, 0]} b={[16, 0]} />

      {/* Glass façade at z = -8 with a sliding-door opening (x 0..2) */}
      <InfoHover info={infoPoints.windows}>
        <B s={[14, CEIL, 0.02]} p={[-7, CEIL / 2, -8]} m={m.glass} />
        <B s={[14, CEIL, 0.02]} p={[9, CEIL / 2, -8]} m={m.glass} />
      </InfoHover>
      {mullions.map((x) => (
        <B key={x} s={[0.05, CEIL, 0.09]} p={[x, CEIL / 2, -8]} m={m.blackMetal} />
      ))}
      <B s={[30, 0.12, 0.12]} p={[1, CEIL - 0.06, -8]} m={m.blackMetal} />
      <B s={[30, 0.04, 0.1]} p={[1, 0.02, -8]} m={m.blackMetal} />

      {/* Slab edges above and below the balcony */}
      <B s={[30.2, 0.4, 0.12]} p={[1, -0.25, -11]} m={m.wall} />
      <B s={[30.2, 0.4, 0.12]} p={[1, CEIL + 0.2, -11]} m={m.wall} />
    </group>
  );
}

/* ------------------------------- rooms -------------------------------- */

function Living() {
  const m = useMaterials();
  return (
    <group>
      <B s={[4.4, 0.012, 3.4]} p={[-1.6, 0.006, -4.6]} m={m.rug} />
      <Blob p={[0.3, -4.7]} w={2.6} d={4.4} />

      {/* L-shaped sofa facing the media wall (west) */}
      <InfoHover info={infoPoints.sofa}>
        <B s={[1.0, 0.42, 3.0]} p={[0.55, 0.21, -4.5]} m={m.fabric} />
        <B s={[0.26, 0.5, 3.0]} p={[0.97, 0.67, -4.5]} m={m.fabric} />
        <B s={[1.0, 0.58, 0.22]} p={[0.55, 0.29, -2.9]} m={m.fabric} />
        <B s={[2.0, 0.42, 0.95]} p={[0, 0.21, -6.45]} m={m.fabric} />
        <B s={[2.0, 0.5, 0.24]} p={[0, 0.67, -6.83]} m={m.fabric} />
        <B s={[0.85, 0.12, 1.45]} p={[0.5, 0.48, -3.78]} m={m.fabric} />
        <B s={[0.85, 0.12, 1.45]} p={[0.5, 0.48, -5.22]} m={m.fabric} />
        <B s={[0.14, 0.4, 0.45]} p={[0.78, 0.7, -3.4]} r={[0, 0, -0.15]} m={m.accent} />
        <B s={[0.14, 0.4, 0.45]} p={[0.78, 0.7, -5.0]} r={[0, 0, -0.15]} m={m.accent} />
        <B s={[0.45, 0.4, 0.14]} p={[-0.6, 0.7, -6.62]} r={[0.15, 0, 0]} m={m.accent} />
      </InfoHover>

      {/* Coffee tables */}
      <Cyl r={0.62} h={0.05} p={[-1.2, 0.4, -4.5]} m={m.darkStone} seg={48} />
      <Cyl r={0.32} rb={0.38} h={0.38} p={[-1.2, 0.19, -4.5]} m={m.brass} />
      <Cyl r={0.34} h={0.04} p={[-0.7, 0.3, -5.7]} m={m.marble} seg={40} />
      <Cyl r={0.05} h={0.28} p={[-0.7, 0.14, -5.7]} m={m.brass} />
      <B s={[0.32, 0.06, 0.24]} p={[-1.35, 0.455, -4.35]} m={m.accent} />
      <Cyl r={0.12} rb={0.06} h={0.08} p={[-0.95, 0.465, -4.7]} m={m.brass} />

      <Armchair p={[-3.3, 0, -2.4]} ry={0.76} mat={m.accent} />

      {/* Media wall (west) */}
      <B s={[0.06, CEIL, 4.6]} p={[-5.89, CEIL / 2, -5.7]} m={m.wood} />
      <B s={[0.02, CEIL, 0.03]} p={[-5.85, CEIL / 2, -7.3]} m={m.brass} />
      <B s={[0.02, CEIL, 0.03]} p={[-5.85, CEIL / 2, -4.1]} m={m.brass} />
      <B s={[0.05, 1.0, 1.75]} p={[-5.83, 1.55, -5.7]} m={m.screen} />
      <B s={[0.5, 0.42, 2.8]} p={[-5.6, 0.33, -5.7]} m={m.darkStone} />
      <Blob p={[-5.55, -5.7]} w={0.9} d={3.2} />

      {/* Chandelier */}
      <InfoHover info={infoPoints.chandelier}>
        <Cyl r={0.012} h={0.62} p={[-1.2, CEIL - 0.31, -4.5]} m={m.brass} />
        <mesh position={[-1.2, 2.62, -4.5]} rotation={[Math.PI / 2, 0, 0]} material={m.brass}>
          <torusGeometry args={[0.7, 0.018, 8, 64]} />
        </mesh>
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <Sphere key={i} r={0.075} p={[-1.2 + Math.cos(a) * 0.7, 2.53, -4.5 + Math.sin(a) * 0.7]} m={m.lamp} />;
        })}
      </InfoHover>

      {/* Floor lamp */}
      <Cyl r={0.14} h={0.03} p={[1.15, 0.015, -2.55]} m={m.brass} />
      <Cyl r={0.014} h={1.5} p={[1.15, 0.75, -2.55]} m={m.brass} />
      <Cyl r={0.2} rb={0.25} h={0.32} p={[1.15, 1.6, -2.55]} m={m.lamp} />

      <Plant p={[-5.3, 0, -7.4]} s={1.3} />
      <Plant p={[3.5, 0, -7.4]} s={1.1} />

      {/* Foyer console + art */}
      <B s={[1.6, 0.06, 0.4]} p={[-1, 0.86, 3.68]} m={m.darkStone} />
      <B s={[0.04, 0.83, 0.36]} p={[-1.75, 0.415, 3.68]} m={m.brass} />
      <B s={[0.04, 0.83, 0.36]} p={[-0.25, 0.415, 3.68]} m={m.brass} />
      <B s={[1.5, 1.1, 0.04]} p={[-1, 1.95, 3.9]} m={m.brass} />
      <B s={[1.4, 1.0, 0.02]} p={[-1, 1.95, 3.875]} m={m.accent} />
      <Cyl r={0.09} rb={0.12} h={0.4} p={[-0.5, 1.09, 3.68]} m={m.pot} />

      {/* Smart home panel on the wall by the foyer */}
      <InfoHover info={infoPoints.smartPanel}>
        <B s={[0.02, 0.24, 0.16]} p={[-5.915, 1.5, 2.4]} m={m.screen} />
        <B s={[0.004, 0.18, 0.12]} p={[-5.903, 1.5, 2.4]} m={m.cove} />
      </InfoHover>

      {/* Italian marble info zone (open floor area) */}
      <InfoHover info={infoPoints.marble}>
        <HitArea p={[-4.6, 0.01, -1.2]} s={[1.6, 3.2]} />
      </InfoHover>

      {/* Ceiling cove lighting */}
      <B s={[10, 0.03, 0.06]} p={[-1, CEIL - 0.08, 3.86]} m={m.cove} />
      <B s={[0.06, 0.03, 11.8]} p={[-5.86, CEIL - 0.08, -2]} m={m.cove} />
    </group>
  );
}

function Dining() {
  const m = useMaterials();
  const chairs: { p: V3; ry: number }[] = [
    ...[6.1, 7.0, 7.9].map((x) => ({ p: [x, 0, -5.85] as V3, ry: 0 })),
    ...[6.1, 7.0, 7.9].map((x) => ({ p: [x, 0, -4.15] as V3, ry: Math.PI })),
    { p: [5.25, 0, -5], ry: Math.PI / 2 },
    { p: [8.75, 0, -5], ry: -Math.PI / 2 },
  ];
  return (
    <group>
      <Blob p={[7, -5]} w={4} d={2.6} />
      <InfoHover info={infoPoints.dining}>
        <B s={[2.8, 0.06, 1.15]} p={[7, 0.75, -5]} m={m.darkStone} />
        <B s={[0.12, 0.72, 0.7]} p={[6.0, 0.36, -5]} m={m.brass} />
        <B s={[0.12, 0.72, 0.7]} p={[8.0, 0.36, -5]} m={m.brass} />
      </InfoHover>
      {chairs.map((c, i) => (
        <DiningChair key={i} p={c.p} ry={c.ry} />
      ))}
      {/* Linear pendant */}
      <B s={[2.2, 0.03, 0.05]} p={[7, 2.2, -5]} m={m.brass} />
      <Cyl r={0.005} h={1.1} p={[5.95, 2.75, -5]} m={m.brass} />
      <Cyl r={0.005} h={1.1} p={[8.05, 2.75, -5]} m={m.brass} />
      {[6.1, 6.55, 7, 7.45, 7.9].map((x) => (
        <Sphere key={x} r={0.09} p={[x, 2.1, -5]} m={m.lamp} />
      ))}
      {/* Sideboard + art */}
      <B s={[0.45, 0.8, 2.4]} p={[9.67, 0.45, -5]} m={m.wood} />
      <Blob p={[9.6, -5]} w={0.8} d={2.8} />
      <Cyl r={0.1} rb={0.07} h={0.45} p={[9.65, 1.08, -5.6]} m={m.pot} />
      <B s={[0.03, 1.1, 1.6]} p={[9.9, 1.95, -5]} m={m.brass} />
      <B s={[0.02, 1.0, 1.5]} p={[9.88, 1.95, -5]} m={m.rug} />
      <Plant p={[9.4, 0, -7.4]} />
    </group>
  );
}

function Kitchen() {
  const m = useMaterials();
  return (
    <group>
      {/* Back counter run */}
      <B s={[5.6, 0.88, 0.65]} p={[7, 0.44, 3.6]} m={m.wood} />
      <B s={[5.6, 0.04, 0.68]} p={[7, 0.9, 3.59]} m={m.marble} />
      <B s={[5.6, 0.8, 0.02]} p={[7, 1.32, 3.915]} m={m.marble} />
      <B s={[3.6, 0.85, 0.38]} p={[6.2, 2.25, 3.73]} m={m.wood} />
      <B s={[3.6, 0.02, 0.04]} p={[6.2, 1.81, 3.58]} m={m.cove} />
      <B s={[0.7, 0.02, 0.45]} p={[6, 0.925, 3.55]} m={m.blackMetal} />
      <Cyl r={0.015} h={0.35} p={[6, 1.1, 3.82]} m={m.brass} />
      <B s={[0.03, 0.03, 0.25]} p={[6, 1.27, 3.7]} m={m.brass} />
      <B s={[0.75, 0.01, 0.5]} p={[7.8, 0.925, 3.55]} m={m.screen} />

      {/* Built-in appliance tower (Bosch) */}
      <InfoHover info={infoPoints.appliances}>
        <B s={[0.65, 2.6, 2.2]} p={[9.6, 1.3, 1.4]} m={m.wood} />
        <B s={[0.02, 0.6, 0.62]} p={[9.265, 0.95, 0.85]} m={m.screen} />
        <B s={[0.02, 0.45, 0.62]} p={[9.265, 1.6, 0.85]} m={m.screen} />
        <B s={[0.005, 0.025, 0.2]} p={[9.252, 1.3, 0.85]} m={m.cove} />
        <B s={[0.03, 1.2, 0.03]} p={[9.25, 1.25, 1.55]} m={m.brass} />
      </InfoHover>

      {/* Waterfall island */}
      <Blob p={[7, 0.5]} w={3.6} d={1.8} />
      <InfoHover info={infoPoints.island}>
        <B s={[2.8, 0.9, 1.0]} p={[7, 0.45, 0.6]} m={m.marble} />
        <B s={[2.9, 0.05, 1.1]} p={[7, 0.925, 0.6]} m={m.marble} />
      </InfoHover>
      {[6.2, 7, 7.8].map((x) => (
        <group key={x}>
          <Cyl r={0.2} h={0.07} p={[x, 0.76, -0.2]} m={m.accent} />
          <Cyl r={0.025} h={0.72} p={[x, 0.37, -0.2]} m={m.brass} />
          <Cyl r={0.19} h={0.02} p={[x, 0.01, -0.2]} m={m.brass} />
          {/* pendant above island */}
          <Cyl r={0.005} h={0.9} p={[x - 0.1, 2.85, 0.6]} m={m.blackMetal} />
          <Cyl r={0.11} h={0.3} p={[x - 0.1, 2.25, 0.6]} m={m.lamp} />
        </group>
      ))}
    </group>
  );
}

function MasterBedroom() {
  const m = useMaterials();
  return (
    <group>
      <B s={[8, 0.01, 7]} p={[-10, 0.005, -4.5]} m={m.woodFloor} />
      <B s={[3.0, 0.012, 3.6]} p={[-11.9, 0.016, -4.5]} m={m.rug} />
      {/* Upholstered headboard wall + cove light */}
      <B s={[0.08, 2.2, 4.2]} p={[-13.88, 1.1, -4.5]} m={m.fabric} />
      <B s={[0.06, 0.03, 4.2]} p={[-13.82, 2.22, -4.5]} m={m.cove} />

      <Blob p={[-12.7, -4.5]} w={2.8} d={2.6} />
      <InfoHover info={infoPoints.bed}>
        <B s={[2.2, 0.32, 2.0]} p={[-12.7, 0.2, -4.5]} m={m.wood} />
        <B s={[2.1, 0.26, 1.94]} p={[-12.72, 0.49, -4.5]} m={m.linen} />
        <B s={[1.3, 0.06, 2.0]} p={[-12.2, 0.64, -4.5]} m={m.linen} />
        <B s={[0.55, 0.07, 2.02]} p={[-11.9, 0.66, -4.5]} m={m.accent} />
        <B s={[0.35, 0.18, 0.7]} p={[-13.5, 0.72, -5.0]} m={m.linen} />
        <B s={[0.35, 0.18, 0.7]} p={[-13.5, 0.72, -4.0]} m={m.linen} />
        <B s={[0.2, 0.26, 0.5]} p={[-13.28, 0.76, -4.5]} m={m.accent} />
      </InfoHover>
      {[-6.05, -2.95].map((z) => (
        <group key={z}>
          <B s={[0.5, 0.5, 0.55]} p={[-13.55, 0.3, z]} m={m.wood} />
          <TableLamp p={[-13.55, 0.55, z]} />
        </group>
      ))}
      <B s={[0.45, 0.42, 1.6]} p={[-11.25, 0.21, -4.5]} m={m.accent} />
      <Armchair p={[-7.4, 0, -6.6]} ry={2.6} />
      <B s={[0.5, 0.75, 1.8]} p={[-6.35, 0.42, -6.2]} m={m.wood} />
      <B s={[0.03, 0.9, 1.3]} p={[-6.1, 1.8, -6.2]} m={m.brass} />
      <B s={[0.02, 0.82, 1.22]} p={[-6.12, 1.8, -6.2]} m={m.rug} />
      <Plant p={[-13.3, 0, -7.4]} />
    </group>
  );
}

function Wardrobe() {
  const m = useMaterials();
  return (
    <group>
      <B s={[8, 0.01, 5]} p={[-10, 0.005, 1.5]} m={m.woodFloor} />
      <InfoHover info={infoPoints.wardrobe}>
        {/* West run */}
        <B s={[0.62, 2.7, 4.6]} p={[-13.62, 1.35, 1.5]} m={m.wood} />
        {[-0.3, 0.85, 2.0, 3.15].map((z) => (
          <B key={z} s={[0.02, 2.4, 0.03]} p={[-13.32, 1.35, z]} m={m.cove} />
        ))}
        <B s={[0.02, 2.5, 4.4]} p={[-13.29, 1.35, 1.5]} m={m.smokedGlass} />
        {/* South run */}
        <B s={[6.2, 2.7, 0.62]} p={[-9.9, 1.35, 3.62]} m={m.wood} />
        {[0.9, 1.6, 2.3].map((y) => (
          <B key={y} s={[6.0, 0.02, 0.03]} p={[-9.9, y, 3.33]} m={m.cove} />
        ))}
        <B s={[6.0, 2.5, 0.02]} p={[-9.9, 1.35, 3.3]} m={m.smokedGlass} />
      </InfoHover>
      {/* Jewellery island */}
      <Blob p={[-10, 1.4]} w={2.4} d={1.4} />
      <B s={[1.8, 0.88, 0.85]} p={[-10, 0.44, 1.4]} m={m.wood} />
      <B s={[1.85, 0.02, 0.9]} p={[-10, 0.89, 1.4]} m={m.smokedGlass} />
      <B s={[0.3, 0.08, 0.2]} p={[-10.2, 0.94, 1.4]} m={m.accent} />
      {/* Mirror */}
      <B s={[0.025, 2.3, 1.5]} p={[-6.095, 1.25, 1.6]} m={m.brass} />
      <B s={[0.02, 2.2, 1.4]} p={[-6.11, 1.25, 1.6]} m={m.mirror} />
      <Cyl r={0.3} h={0.42} p={[-8.6, 0.21, 2.4]} m={m.fabric} />
    </group>
  );
}

function SecondBedroom() {
  const m = useMaterials();
  return (
    <group>
      <B s={[6, 0.01, 8]} p={[13, 0.005, -4]} m={m.woodFloor} />
      <B s={[2.4, 0.012, 2.8]} p={[13.6, 0.016, -4.2]} m={m.rug} />
      <B s={[0.08, 1.6, 2.6]} p={[15.88, 0.95, -4.2]} m={m.fabric} />
      <Blob p={[14.8, -4.2]} w={2.6} d={2.4} />
      <InfoHover info={infoPoints.bed2}>
        <B s={[2.1, 0.3, 1.8]} p={[14.8, 0.19, -4.2]} m={m.wood} />
        <B s={[2.0, 0.25, 1.75]} p={[14.82, 0.46, -4.2]} m={m.linen} />
        <B s={[0.5, 0.06, 1.82]} p={[14.0, 0.61, -4.2]} m={m.accent} />
        <B s={[0.3, 0.16, 0.6]} p={[15.6, 0.66, -4.65]} m={m.linen} />
        <B s={[0.3, 0.16, 0.6]} p={[15.6, 0.66, -3.75]} m={m.linen} />
      </InfoHover>
      {[-5.5, -2.9].map((z) => (
        <group key={z}>
          <B s={[0.45, 0.45, 0.45]} p={[15.6, 0.25, z]} m={m.wood} />
          <TableLamp p={[15.6, 0.475, z]} />
        </group>
      ))}
      {/* Study desk by the window */}
      <B s={[1.4, 0.04, 0.6]} p={[11.2, 0.75, -7.45]} m={m.wood} />
      <B s={[0.04, 0.73, 0.55]} p={[10.55, 0.365, -7.45]} m={m.blackMetal} />
      <B s={[0.04, 0.73, 0.55]} p={[11.85, 0.365, -7.45]} m={m.blackMetal} />
      <DiningChair p={[11.2, 0, -6.85]} ry={Math.PI} />
      <TableLamp p={[11.75, 0.77, -7.55]} />
      {/* Wardrobe */}
      <B s={[3.8, 2.6, 0.6]} p={[13.9, 1.3, -0.32]} m={m.wood} />
      <B s={[0.02, 1.0, 0.02]} p={[13.9, 1.3, -0.63]} m={m.brass} />
    </group>
  );
}

function Balcony() {
  const m = useMaterials();
  return (
    <group>
      <B s={[30, 0.1, 3]} p={[1, -0.05, -9.5]} m={m.deck} />
      <InfoHover info={infoPoints.view}>
        <B s={[30, 1.1, 0.02]} p={[1, 0.6, -10.95]} m={m.glass} />
      </InfoHover>
      <B s={[30, 0.05, 0.06]} p={[1, 1.17, -10.95]} m={m.brass} />
      <B s={[0.02, 1.1, 3]} p={[-13.97, 0.6, -9.5]} m={m.glass} />
      <B s={[0.02, 1.1, 3]} p={[15.97, 0.6, -9.5]} m={m.glass} />

      {/* Sun loungers */}
      {[-3.2, -1.8].map((x) => (
        <group key={x}>
          <B s={[0.7, 0.3, 1.8]} p={[x, 0.15, -9.6]} m={m.wood} />
          <B s={[0.66, 0.08, 1.2]} p={[x, 0.34, -9.95]} m={m.linen} />
          <B s={[0.66, 0.08, 0.7]} p={[x, 0.58, -9.0]} r={[-0.9, 0, 0]} m={m.linen} />
        </group>
      ))}
      <Cyl r={0.25} h={0.45} p={[-2.5, 0.225, -10.3]} m={m.darkStone} />

      {/* Outdoor lounge set */}
      <Armchair p={[6.4, 0, -9.4]} ry={Math.PI / 2} />
      <Armchair p={[8.2, 0, -9.4]} ry={Math.PI / 2} />
      <Cyl r={0.3} h={0.4} p={[7.3, 0.2, -9.9]} m={m.brass} />

      <Plant p={[-13.3, 0, -10.3]} s={1.4} />
      <Plant p={[15.3, 0, -10.3]} s={1.4} />
      <Plant p={[3.2, 0, -10.4]} s={1.1} />
    </group>
  );
}

/** Everything inside the residence. */
export default function Rooms({ children }: { children?: ReactNode }) {
  return (
    <group>
      <Shell />
      <Living />
      <Dining />
      <Kitchen />
      <MasterBedroom />
      <Wardrobe />
      <SecondBedroom />
      <Balcony />
      {children}
    </group>
  );
}
