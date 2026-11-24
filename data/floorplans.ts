/**
 * PLACEHOLDER floor-plan geometry, drawn as an interactive SVG (hover a room → its size).
 * Rooms are rectangles in FEET on the plan grid: x, y, w, h.
 * When real plans arrive, either update these rectangles, or set
 * `images.floorPlans[slug].src` in images.ts — an image plan then replaces the SVG.
 * TODO(client): replace with architect-approved plans.
 */
import type { ResidenceSlug } from "./project";

export interface PlanRoom {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind?: "living" | "bed" | "wet" | "outdoor" | "service";
}

export interface FloorPlanGeometry {
  width: number;
  height: number;
  rooms: PlanRoom[];
}

export const floorPlans: Record<ResidenceSlug, FloorPlanGeometry> = {
  "4-bhk": {
    width: 80,
    height: 60,
    rooms: [
      { id: "balcony", name: "Balcony", x: 0, y: 0, w: 46, h: 8, kind: "outdoor" },
      { id: "living", name: "Living Room", x: 0, y: 8, w: 28, h: 22, kind: "living" },
      { id: "dining", name: "Dining", x: 28, y: 8, w: 18, h: 16, kind: "living" },
      { id: "kitchen", name: "Kitchen", x: 46, y: 0, w: 16, h: 16, kind: "service" },
      { id: "master", name: "Master Bedroom", x: 62, y: 0, w: 18, h: 20, kind: "bed" },
      { id: "wardrobe", name: "Walk-in Wardrobe", x: 62, y: 20, w: 18, h: 10, kind: "service" },
      { id: "foyer", name: "Foyer", x: 28, y: 24, w: 18, h: 12, kind: "living" },
      { id: "utility", name: "Utility & Staff", x: 46, y: 16, w: 16, h: 12, kind: "service" },
      { id: "bed2", name: "Bedroom 2", x: 0, y: 30, w: 18, h: 16, kind: "bed" },
      { id: "bed3", name: "Bedroom 3", x: 0, y: 46, w: 18, h: 14, kind: "bed" },
      { id: "family", name: "Family Lounge", x: 18, y: 36, w: 28, h: 24, kind: "living" },
      { id: "lobby", name: "Private Lift Lobby", x: 46, y: 28, w: 16, h: 14, kind: "service" },
      { id: "bed4", name: "Bedroom 4", x: 62, y: 30, w: 18, h: 16, kind: "bed" },
      { id: "bath", name: "Master Bath", x: 62, y: 46, w: 18, h: 14, kind: "wet" },
      { id: "powder", name: "Powder Room", x: 46, y: 42, w: 16, h: 18, kind: "wet" },
    ],
    },
  "5-bhk": {
    width: 96,
    height: 64,
    rooms: [
      { id: "balcony", name: "Balcony", x: 0, y: 0, w: 60, h: 9, kind: "outdoor" },
      { id: "living", name: "Double-height Living", x: 0, y: 9, w: 32, h: 24, kind: "living" },
      { id: "dining", name: "Dining", x: 32, y: 9, w: 20, h: 18, kind: "living" },
      { id: "kitchen", name: "Kitchen & Pantry", x: 52, y: 9, w: 18, h: 18, kind: "service" },
      { id: "master", name: "Master Suite 1", x: 70, y: 0, w: 26, h: 20, kind: "bed" },
      { id: "wardrobe", name: "Walk-in Wardrobe", x: 70, y: 20, w: 26, h: 10, kind: "service" },
      { id: "study", name: "Private Study", x: 32, y: 27, w: 20, h: 13, kind: "living" },
      { id: "foyer", name: "Foyer", x: 52, y: 27, w: 18, h: 13, kind: "living" },
      { id: "master2", name: "Master Suite 2", x: 0, y: 33, w: 20, h: 18, kind: "bed" },
      { id: "bed3", name: "Bedroom 3", x: 0, y: 51, w: 20, h: 13, kind: "bed" },
      { id: "den", name: "Family Den", x: 20, y: 40, w: 32, h: 24, kind: "living" },
      { id: "lobby", name: "Private Lift Lobby", x: 52, y: 40, w: 18, h: 12, kind: "service" },
      { id: "staff", name: "Staff Quarters", x: 52, y: 52, w: 18, h: 12, kind: "service" },
      { id: "bed4", name: "Bedroom 4", x: 70, y: 30, w: 26, h: 17, kind: "bed" },
      { id: "bed5", name: "Bedroom 5", x: 70, y: 47, w: 26, h: 17, kind: "bed" },
    ],
    },
  penthouse: {
    width: 120,
    height: 96,
    rooms: [
      { id: "pool", name: "Private Infinity Pool", x: 0, y: 0, w: 60, h: 16, kind: "outdoor" },
      { id: "terrace", name: "Sky Terrace", x: 60, y: 0, w: 60, h: 16, kind: "outdoor" },
      { id: "living", name: "Grand Salon", x: 0, y: 16, w: 44, h: 30, kind: "living" },
      { id: "dining", name: "Formal Dining", x: 44, y: 16, w: 28, h: 22, kind: "living" },
      { id: "kitchen", name: "Show Kitchen", x: 72, y: 16, w: 22, h: 22, kind: "service" },
      { id: "chef", name: "Chef's Kitchen", x: 94, y: 16, w: 26, h: 22, kind: "service" },
      { id: "master", name: "Sovereign Suite", x: 0, y: 46, w: 34, h: 28, kind: "bed" },
      { id: "wardrobe", name: "Dressing Gallery", x: 0, y: 74, w: 34, h: 22, kind: "service" },
      { id: "library", name: "Library", x: 34, y: 46, w: 26, h: 20, kind: "living" },
      { id: "foyer", name: "Gallery Foyer", x: 44, y: 38, w: 28, h: 8, kind: "living" },
      { id: "spa", name: "Home Spa", x: 34, y: 66, w: 26, h: 30, kind: "wet" },
      { id: "lobby", name: "Private Lift Lobby", x: 60, y: 46, w: 20, h: 18, kind: "service" },
      { id: "bed2", name: "Suite 2", x: 80, y: 38, w: 40, h: 20, kind: "bed" },
      { id: "bed3", name: "Suite 3", x: 80, y: 58, w: 40, h: 19, kind: "bed" },
      { id: "bed4", name: "Suite 4", x: 80, y: 77, w: 40, h: 19, kind: "bed" },
      { id: "butler", name: "Butler's Suite", x: 60, y: 64, w: 20, h: 32, kind: "service" },
    ],
    },
};
