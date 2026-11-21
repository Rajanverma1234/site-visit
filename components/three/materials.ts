"use client";

import { createContext, useContext, useMemo } from "react";
import * as THREE from "three";
import { seededRandom } from "@/lib/utils";

/**
 * Shared materials for the apartment + the three interior style palettes.
 * Colours are lerped toward the active palette every frame (see Apartment.tsx),
 * which gives the smooth "style switcher" transition.
 */

import type { InteriorStyle } from "@/data/tour";
export type { InteriorStyle };

type PaletteKey = "floor" | "woodFloor" | "wall" | "wood" | "fabric" | "accent" | "rug" | "darkStone";

export const PALETTES: Record<InteriorStyle, Record<PaletteKey, string>> = {
  modern: {
    floor: "#e9e4dc", // Statuario white
    woodFloor: "#a07a58",
    wall: "#e7e1d7",
    wood: "#5a3d2b", // walnut
    fabric: "#d8d0c2", // bouclé
    accent: "#2e3a46", // deep navy
    rug: "#bdb3a3",
    darkStone: "#1c1c1e", // Nero Marquina
  },
  classic: {
    floor: "#efe3cf", // Crema Marfil
    woodFloor: "#6b4428",
    wall: "#e5d8bf",
    wood: "#3d2416", // mahogany
    fabric: "#7c5a3c", // camel leather
    accent: "#1f3d30", // emerald
    rug: "#8e3b32", // persian red
    darkStone: "#2b211b",
  },
  minimal: {
    floor: "#e4e3df", // pale grey stone
    woodFloor: "#cfb28a",
    wall: "#f5f4f1",
    wood: "#c7a57b", // light oak
    fabric: "#c4bfb6", // linen
    accent: "#8a8580",
    rug: "#dedad2",
    darkStone: "#b9b5ad",
  },
};

/* ---------- Procedural textures (no image files needed) ---------- */

function marbleTexture(): THREE.CanvasTexture {
  const size = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, size, size);
  const r = seededRandom(3);
  // soft cloudy base
  for (let i = 0; i < 40; i++) {
    const x = r() * size;
    const y = r() * size;
    const rad = 80 + r() * 260;
    const grd = g.createRadialGradient(x, y, 0, x, y, rad);
    grd.addColorStop(0, "rgba(200,196,190,0.10)");
    grd.addColorStop(1, "rgba(200,196,190,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
  }
  // veins
  for (let v = 0; v < 18; v++) {
    g.beginPath();
    let x = r() * size;
    let y = -20;
    g.moveTo(x, y);
    const drift = (r() - 0.5) * 2;
    while (y < size + 20) {
      x += (r() - 0.5) * 30 + drift * 6;
      y += 12 + r() * 18;
      g.lineTo(x, y);
    }
    g.strokeStyle = `rgba(120,115,110,${0.08 + r() * 0.22})`;
    g.lineWidth = 0.6 + r() * 2.4;
    g.stroke();
  }
  // tile grout (2 x 2 tiles per texture repeat)
  g.strokeStyle = "rgba(150,145,138,0.35)";
  g.lineWidth = 2;
  g.strokeRect(0, 0, size, size);
  g.beginPath();
  g.moveTo(size / 2, 0);
  g.lineTo(size / 2, size);
  g.moveTo(0, size / 2);
  g.lineTo(size, size / 2);
  g.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function woodTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 512;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, w, h);
  const r = seededRandom(5);
  // planks
  const planks = 6;
  for (let p = 0; p < planks; p++) {
    const y0 = (p / planks) * h;
    const shade = 0.85 + r() * 0.15;
    g.fillStyle = `rgba(${255 * shade},${255 * shade},${255 * shade},1)`;
    g.fillRect(0, y0, w, h / planks);
    for (let i = 0; i < 26; i++) {
      g.beginPath();
      const yy = y0 + r() * (h / planks);
      g.moveTo(0, yy);
      for (let x = 0; x <= w; x += 16) g.lineTo(x, yy + Math.sin(x * 0.02 + i) * 2 + (r() - 0.5) * 1.5);
      g.strokeStyle = `rgba(90,70,50,${0.05 + r() * 0.12})`;
      g.lineWidth = 0.5 + r() * 1.5;
      g.stroke();
    }
    g.fillStyle = "rgba(60,45,30,0.35)";
    g.fillRect(0, y0, w, 1.5);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Radial soft shadow texture used for cheap "contact shadow" blobs under furniture. */
export function blobTexture(): THREE.CanvasTexture {
  const s = 128;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, "rgba(0,0,0,0.55)");
  grd.addColorStop(0.6, "rgba(0,0,0,0.2)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}

/* ---------- Material set ---------- */

export interface TourMaterials {
  floor: THREE.MeshPhysicalMaterial;
  woodFloor: THREE.MeshStandardMaterial;
  wall: THREE.MeshStandardMaterial;
  ceiling: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
  fabric: THREE.MeshStandardMaterial;
  linen: THREE.MeshStandardMaterial;
  accent: THREE.MeshStandardMaterial;
  rug: THREE.MeshStandardMaterial;
  darkStone: THREE.MeshPhysicalMaterial;
  marble: THREE.MeshPhysicalMaterial;
  brass: THREE.MeshStandardMaterial;
  blackMetal: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  smokedGlass: THREE.MeshPhysicalMaterial;
  mirror: THREE.MeshStandardMaterial;
  screen: THREE.MeshStandardMaterial;
  lamp: THREE.MeshBasicMaterial;
  cove: THREE.MeshBasicMaterial;
  leaf: THREE.MeshStandardMaterial;
  pot: THREE.MeshStandardMaterial;
  deck: THREE.MeshStandardMaterial;
  blob: THREE.MeshBasicMaterial;
  /** Palette-driven materials, keyed by palette slot (for the style lerp). */
  styled: Record<PaletteKey, THREE.MeshStandardMaterial>;
}

export function createTourMaterials(style: InteriorStyle): TourMaterials {
  const p = PALETTES[style];
  const marbleTex = marbleTexture();
  const floorTex = marbleTex.clone();
  floorTex.repeat.set(12.5, 5); // 2.4 m texture => 1.2 m tiles over 30 x 12 m
  floorTex.needsUpdate = true;
  const counterTex = marbleTex.clone();
  counterTex.repeat.set(1, 1);
  counterTex.needsUpdate = true;
  const wood = woodTexture();
  const woodFloorTex = wood.clone();
  woodFloorTex.repeat.set(4, 4);
  woodFloorTex.needsUpdate = true;

  const floor = new THREE.MeshPhysicalMaterial({ color: p.floor, map: floorTex, roughness: 0.18, clearcoat: 0.5, clearcoatRoughness: 0.1, envMapIntensity: 0.9 });
  const woodFloor = new THREE.MeshStandardMaterial({ color: p.woodFloor, map: woodFloorTex, roughness: 0.45, envMapIntensity: 0.8 });
  const wall = new THREE.MeshStandardMaterial({ color: p.wall, roughness: 0.92 });
  const woodM = new THREE.MeshStandardMaterial({ color: p.wood, map: wood, roughness: 0.5, envMapIntensity: 0.9 });
  const fabric = new THREE.MeshStandardMaterial({ color: p.fabric, roughness: 1 });
  const accent = new THREE.MeshStandardMaterial({ color: p.accent, roughness: 0.85 });
  const rug = new THREE.MeshStandardMaterial({ color: p.rug, roughness: 1 });
  const darkStone = new THREE.MeshPhysicalMaterial({ color: p.darkStone, map: counterTex, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 });

  return {
    floor,
    woodFloor,
    wall,
    ceiling: new THREE.MeshStandardMaterial({ color: "#f3f1ed", roughness: 1 }),
    wood: woodM,
    fabric,
    linen: new THREE.MeshStandardMaterial({ color: "#f3efe8", roughness: 1 }),
    accent,
    rug,
    darkStone,
    marble: new THREE.MeshPhysicalMaterial({ color: "#f5f3ef", map: counterTex, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05 }),
    brass: new THREE.MeshStandardMaterial({ color: "#c8a96a", metalness: 1, roughness: 0.25, envMapIntensity: 1.4 }),
    blackMetal: new THREE.MeshStandardMaterial({ color: "#151515", metalness: 0.8, roughness: 0.35 }),
    glass: new THREE.MeshPhysicalMaterial({ color: "#d9eef2", transparent: true, opacity: 0.12, roughness: 0, metalness: 0.1, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide }),
    smokedGlass: new THREE.MeshPhysicalMaterial({ color: "#2a2622", transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.2, depthWrite: false }),
    mirror: new THREE.MeshStandardMaterial({ color: "#d9dde0", metalness: 1, roughness: 0.02, envMapIntensity: 1.5 }),
    screen: new THREE.MeshStandardMaterial({ color: "#0a0a0c", metalness: 0.4, roughness: 0.15 }),
    lamp: new THREE.MeshBasicMaterial({ color: "#ffd9a0", toneMapped: false }),
    cove: new THREE.MeshBasicMaterial({ color: "#ffcf8f", toneMapped: false }),
    leaf: new THREE.MeshStandardMaterial({ color: "#3f5a33", roughness: 0.9, flatShading: true }),
    pot: new THREE.MeshStandardMaterial({ color: "#d8d2c6", roughness: 0.8 }),
    deck: new THREE.MeshStandardMaterial({ color: "#8a6a4c", map: woodFloorTex, roughness: 0.7 }),
    blob: new THREE.MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false, toneMapped: false }),
    styled: { floor, woodFloor, wall, wood: woodM, fabric, accent, rug, darkStone },
  };
}

export const MaterialsContext = createContext<TourMaterials | null>(null);
export const useMaterials = () => {
  const m = useContext(MaterialsContext);
  if (!m) throw new Error("useMaterials must be used inside <MaterialsContext.Provider>");
  return m;
};

/** Helper hook so callers can create materials once. */
export function useCreateMaterials(initial: InteriorStyle) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => createTourMaterials(initial), []);
}
