/**
 * Typed access to inventory.json (every unit) + the building's floor stack from project.ts.
 * The floor selector, "X matching residences", unit counts and the virtual-tour unit banner
 * all read from here. To update availability, edit inventory.json only.
 */
import raw from "./inventory.json";
import { building, type UnitType } from "./project";
import { ordinal } from "@/lib/format";

export type UnitStatus = "available" | "booked" | "on_hold";
export type TowerId = (typeof building.towers)[number];

export interface Unit {
  id: string; // "A-2301"
  tower: TowerId;
  floor: number;
  unitNumber: string;
  configuration: UnitType;
  /** RERA carpet area, sq ft */
  carpetArea: number;
  facing: "Golf view" | "City view";
  /** Rupees; null = on request */
  price: number | null;
  status: UnitStatus;
}

export interface FloorInfo {
  floor: number;
  kind: "residential" | "lobby" | "amenity" | "penthouse";
  label?: string;
  units: Unit[];
}

export const TOTAL_FLOORS = building.floors;
export const allUnits = (raw as { units: Unit[] }).units;

export const statusLabels: Record<UnitStatus, string> = { available: "Available", booked: "Booked", on_hold: "On Hold" };
export const statusColors: Record<UnitStatus, string> = { available: "#5FAE7E", booked: "#77736F", on_hold: "#D9A441" };

function buildTower(tower: TowerId): FloorInfo[] {
  const floors: FloorInfo[] = [];
  for (let f = 1; f <= building.floors; f++) {
    const units = allUnits.filter((u) => u.tower === tower && u.floor === f);
    const label = building.amenityFloorLabels[f];
    const kind: FloorInfo["kind"] = f === building.lobbyFloor ? "lobby" : label ? "amenity" : f === building.penthouseFloor ? "penthouse" : "residential";
    floors.push({ floor: f, kind, label, units });
  }
  return floors;
}

export const inventory = Object.fromEntries(building.towers.map((t) => [t, buildTower(t)])) as Record<TowerId, FloorInfo[]>;

export function findUnit(id: string): Unit | undefined {
  return allUnits.find((u) => u.id === id);
}

export function inventorySummary() {
  return {
    total: allUnits.length,
    available: allUnits.filter((u) => u.status === "available").length,
    booked: allUnits.filter((u) => u.status === "booked").length,
    onHold: allUnits.filter((u) => u.status === "on_hold").length,
  };
}

/** Unit count, availability and floor range for one configuration (homepage summary). */
export function configSummary(type: UnitType) {
  const units = allUnits.filter((u) => u.configuration === type);
  const floors = units.map((u) => u.floor);
  return {
    units: units.length,
    available: units.filter((u) => u.status === "available").length,
    minFloor: Math.min(...floors),
    maxFloor: Math.max(...floors),
  };
}

/** Headline stats — every number derived from the building config + inventory. */
export function headlineStats() {
  return [
    { value: building.floors, label: "Floors" },
    { value: building.towers.length, label: "Towers" },
    { value: allUnits.length, label: "Residences" },
    { value: building.greensAcres, label: "Acres of Greens" },
  ];
}

/** Consistent floor labelling for the list, tooltip and panel: "42 PH", "40 SKY", "01 L". */
export function floorLabel(floor: number) {
  if (floor === building.penthouseFloor) return { num: String(floor), tag: "PH", name: `Floor ${floor} · The Penthouse` };
  if (floor === building.skyLoungeFloor) return { num: String(floor), tag: "SKY", name: `Floor ${floor} · Sky Lounge (${ordinal(floor)} floor)` };
  if (floor === building.lobbyFloor) return { num: String(floor).padStart(2, "0"), tag: "L", name: `Floor ${floor} · Grand Lobby` };
  return { num: String(floor).padStart(2, "0"), tag: "", name: `Floor ${floor}` };
}
