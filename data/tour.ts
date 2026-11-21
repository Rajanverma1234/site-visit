/**
 * Layout of the procedurally built 4 BHK used on /virtual-tour.
 * Units are METRES. +X = east, -Z = north (the golf-course side, where the balcony is).
 *
 * To adapt the tour for a real apartment, change the room rectangles, camera spots
 * and info points here, then adjust the furniture in components/three/Rooms.tsx.
 */

/** Interior style options for the style switcher (palettes live in components/three/materials.ts). */
export type InteriorStyle = "modern" | "classic" | "minimal";
export const STYLE_LABELS: Record<InteriorStyle, string> = {
  modern: "Modern",
  classic: "Classic",
  minimal: "Minimal",
};

export type RoomId = "living" | "dining" | "kitchen" | "master" | "wardrobe" | "bedroom2" | "balcony";

export interface TourRoom {
  id: RoomId;
  name: string;
  short: string;
  /** Floor rectangle [minX, minZ, maxX, maxZ] used by the mini-map. */
  rect: [number, number, number, number];
  /** Camera spot (eye height applied in code). */
  spot: [number, number];
  /** Initial look direction in radians. 0 = north (towards the balcony), +PI/2 = west. */
  yaw: number;
  /** Waypoints from inside this room out to the open living area (used to route camera glides through doors). */
  exits: [number, number][];
}

export const EYE_HEIGHT = 1.6;
export const CEILING_HEIGHT = 3.3;
export const HUB: [number, number] = [0, -2];

/** Overall plan bounds [minX, minZ, maxX, maxZ] incl. balcony. */
export const PLAN_BOUNDS: [number, number, number, number] = [-14, -11, 16, 4];

export const tourRooms: TourRoom[] = [
  { id: "living", name: "Grand Living Room", short: "Living", rect: [-6, -8, 4, 4], spot: [0.2, 1.4], yaw: 0.45, exits: [] },
  { id: "dining", name: "Dining", short: "Dining", rect: [4, -8, 10, -2], spot: [4.6, -2.6], yaw: -0.75, exits: [] },
  { id: "kitchen", name: "Modular Kitchen", short: "Kitchen", rect: [4, -2, 10, 4], spot: [4.8, -1.4], yaw: -2.35, exits: [] },
  {
    id: "master",
    name: "Master Bedroom",
    short: "Master",
    rect: [-14, -8, -6, -1],
    spot: [-7.4, -3.2],
    yaw: 1.25,
    exits: [[-7, -2.7], [-5.2, -2.7]],
  },
  {
    id: "wardrobe",
    name: "Walk-in Wardrobe",
    short: "Wardrobe",
    rect: [-14, -1, -6, 4],
    spot: [-7.4, 0.2],
    yaw: 2.15,
    exits: [[-10.25, 0], [-10.25, -1.9], [-7, -2.7], [-5.2, -2.7]],
  },
  {
    id: "bedroom2",
    name: "Second Bedroom",
    short: "Bedroom 2",
    rect: [10, -8, 16, 0],
    spot: [11.3, -1.9],
    yaw: -1.2,
    exits: [[10.6, -1.5], [9.2, -1.5]],
  },
  {
    id: "balcony",
    name: "Balcony · Golf View",
    short: "Balcony",
    rect: [-14, -11, 16, -8],
    spot: [1, -9.7],
    yaw: 0,
    exits: [[1, -7.4]],
  },
];

export const getTourRoom = (id: RoomId) => tourRooms.find((r) => r.id === id)!;

/** Which room contains a point — used to highlight the mini-map. */
export function roomAt(x: number, z: number): RoomId | null {
  // Check smaller rooms first so they win over the large living rect.
  const order: RoomId[] = ["balcony", "master", "wardrobe", "bedroom2", "dining", "kitchen", "living"];
  for (const id of order) {
    const [x0, z0, x1, z1] = getTourRoom(id).rect;
    if (x >= x0 && x <= x1 && z >= z0 && z <= z1) return id;
  }
  return null;
}

export interface InfoPoint {
  id: string;
  title: string;
  detail: string;
  position: [number, number, number];
}

/** Hover labels for features (furniture meshes are wrapped with these in Rooms.tsx). */
export const infoPoints: Record<string, InfoPoint> = {
  marble: { id: "marble", title: "Italian Statuario Marble", detail: "Imported, book-matched slabs with a soft mirror polish.", position: [-4.5, 0.12, -1.2] },
  chandelier: { id: "chandelier", title: "Brass Chandelier", detail: "Hand-blown glass globes on a satin brass armature.", position: [-0.8, 2.6, -4] },
  sofa: { id: "sofa", title: "Bespoke Lounge Suite", detail: "Bouclé upholstery, solid walnut base, made to measure.", position: [0.8, 1.2, -4.5] },
  smartPanel: { id: "smartPanel", title: "Smart Home Panel", detail: "Lights, curtains, climate & security — one touch or voice.", position: [-5.85, 1.75, 2.4] },
  windows: { id: "windows", title: "11 ft Floor-to-ceiling Glazing", detail: "Double-glazed low-E glass for light without the heat.", position: [-3, 2.4, -7.8] },
  dining: { id: "dining", title: "8-Seater Dining", detail: "Nero Marquina marble top with brass inlay.", position: [7, 1.3, -5] },
  island: { id: "island", title: "Waterfall Kitchen Island", detail: "Quartz island with breakfast seating for four.", position: [7, 1.4, 0.6] },
  appliances: { id: "appliances", title: "Bosch Built-in Appliances", detail: "Oven, steam oven, coffee machine & integrated fridge.", position: [9.1, 1.9, 1] },
  bed: { id: "bed", title: "Custom King Bed", detail: "Upholstered wall-to-wall headboard with cove lighting.", position: [-12.2, 1.4, -4.5] },
  wardrobe: { id: "wardrobe", title: "Walk-in Wardrobe", detail: "Smoked-glass shutters, leather drawers, motion-sensor lights.", position: [-12.6, 2.2, 1.5] },
  view: { id: "view", title: "DLF Golf Course View", detail: "Unobstructed, protected green views from every room.", position: [3.4, 1.3, -10.85] },
  bed2: { id: "bed2", title: "Second Bedroom Suite", detail: "Queen bed, study nook and en-suite bath.", position: [14.4, 1.3, -4] },
};
