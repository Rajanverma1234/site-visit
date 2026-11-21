import { CRORE, LAKH } from "@/lib/format";
import { seededRandom } from "@/lib/utils";
import type { UnitType } from "./residences";

/**
 * Mock inventory for the Interactive Floor Selector.
 *
 * Stack per tower (42 floors):
 *  - Floor 1        : Grand lobby & concierge (non-residential)
 *  - Floors 2–4     : 3 × 4 BHK per floor
 *  - Floors 5–39,41 : 1 × 4 BHK + 1 × 5 BHK per floor
 *  - Floor 40       : Sky Lounge (amenity floor)
 *  - Floor 42       : The Penthouse (1 per tower)
 * => 81 + 1 = 82 residences per tower, 164 in total.
 *
 * Replace `buildInventory()` with real data (e.g. from a CRM export) for a live project.
 */

export type UnitStatus = "Available" | "Booked" | "On Hold";
export type TowerId = "A" | "B";

export interface Unit {
  id: string; // e.g. "A-2301"
  tower: TowerId;
  floor: number;
  type: UnitType;
  area: number;
  price: number | null; // null => on request
  view: "Golf view" | "City view";
  status: UnitStatus;
}

export interface FloorInfo {
  floor: number;
  kind: "residential" | "lobby" | "amenity" | "penthouse";
  label?: string;
  units: Unit[];
}

export const TOTAL_FLOORS = 42;
export const AMENITY_FLOORS: Record<number, string> = {
  1: "Grand Lobby & Concierge",
  40: "Sky Lounge · Residents only",
};

export const statusColors: Record<UnitStatus, string> = {
  Available: "#5FAE7E",
  Booked: "#77736F",
  "On Hold": "#D9A441",
};

const AREA: Record<UnitType, number> = { "4 BHK": 4800, "5 BHK": 6200, Penthouse: 11500 };
const BASE: Record<UnitType, number> = { "4 BHK": 12.5 * CRORE, "5 BHK": 17 * CRORE, Penthouse: 0 };
/** Floor-rise premium per floor & golf-view premium (demo). */
const FLOOR_RISE = 4 * LAKH;
const GOLF_PREMIUM = 35 * LAKH;

function buildTower(tower: TowerId): FloorInfo[] {
  const rand = seededRandom(tower === "A" ? 2026 : 4242);
  const floors: FloorInfo[] = [];

  for (let f = 1; f <= TOTAL_FLOORS; f++) {
    if (AMENITY_FLOORS[f]) {
      floors.push({ floor: f, kind: f === 1 ? "lobby" : "amenity", label: AMENITY_FLOORS[f], units: [] });
      continue;
    }

    const layout: { type: UnitType; view: Unit["view"] }[] =
      f === 42
        ? [{ type: "Penthouse", view: "Golf view" }]
        : f <= 4
          ? [
              { type: "4 BHK", view: "Golf view" },
              { type: "4 BHK", view: "City view" },
              { type: "4 BHK", view: "Golf view" },
            ]
          : [
              { type: "4 BHK", view: "City view" },
              { type: "5 BHK", view: "Golf view" },
            ];

    const units: Unit[] = layout.map((l, i) => {
      // Higher floors & golf views sell faster — make "Booked" more likely there.
      const r = rand();
      const demand = 0.25 + (f / TOTAL_FLOORS) * 0.35 + (l.view === "Golf view" ? 0.1 : 0);
      const status: UnitStatus = f === 42 ? (tower === "A" ? "On Hold" : "Available") : r < demand ? "Booked" : r < demand + 0.12 ? "On Hold" : "Available";
      const price =
        l.type === "Penthouse" ? null : BASE[l.type] + (f - 2) * FLOOR_RISE + (l.view === "Golf view" ? GOLF_PREMIUM : 0);
      return {
        id: `${tower}-${f}${String(i + 1).padStart(2, "0")}`,
        tower,
        floor: f,
        type: l.type,
        area: AREA[l.type],
        price,
        view: l.view,
        status,
      };
    });

    floors.push({ floor: f, kind: f === 42 ? "penthouse" : "residential", units });
  }
  return floors;
}

export const inventory: Record<TowerId, FloorInfo[]> = {
  A: buildTower("A"),
  B: buildTower("B"),
};

export function findUnit(id: string): Unit | undefined {
  const tower = id.charAt(0) as TowerId;
  return inventory[tower]?.flatMap((f) => f.units).find((u) => u.id === id);
}

export function inventorySummary() {
  const all = [...inventory.A, ...inventory.B].flatMap((f) => f.units);
  return {
    total: all.length,
    available: all.filter((u) => u.status === "Available").length,
    booked: all.filter((u) => u.status === "Booked").length,
    onHold: all.filter((u) => u.status === "On Hold").length,
  };
}
