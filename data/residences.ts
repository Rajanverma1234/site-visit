import { CRORE, LAKH } from "@/lib/format";

export type ResidenceSlug = "4-bhk" | "5-bhk" | "penthouse";
export type UnitType = "4 BHK" | "5 BHK" | "Penthouse";

/** A room on the SVG floor plan. x/y/w/h are in FEET on the plan grid. */
export interface PlanRoom {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind?: "living" | "bed" | "wet" | "outdoor" | "service";
}

export interface PriceLine {
  label: string;
  amount: number;
  note?: string;
}

export interface Residence {
  slug: ResidenceSlug;
  type: UnitType;
  title: string;
  tagline: string;
  area: number; // sq ft (super area)
  /** RERA carpet area in sq ft. */
  carpetArea: number;
  /** Starting price in rupees. null = on request. */
  priceFrom: number | null;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  image: string;
  highlights: string[];
  specs: { group: string; items: string[] }[];
  /** Price breakup (demo). GST is computed from these lines. */
  priceLines: PriceLine[] | null;
  plan: { width: number; height: number; rooms: PlanRoom[] };
}

/** GST for under-construction residential property (demo assumption). */
export const GST_RATE = 0.05;

export const residences: Residence[] = [
  {
    slug: "4-bhk",
    type: "4 BHK",
    title: "The Sovereign 4 BHK",
    tagline: "Four bedrooms. Two views. One unforgettable address.",
    area: 4800,
    carpetArea: 3350, // TODO(client): RERA carpet area
    priceFrom: 12.5 * CRORE,
    bedrooms: 4,
    bathrooms: 5,
    parking: 3,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=75",
    highlights: ["Private elevator lobby", "11 ft ceiling height", "46 ft wraparound balcony", "Staff room with separate entry"],
    specs: [
      { group: "Flooring", items: ["Imported Italian Statuario marble in living & dining", "Engineered oak wood in bedrooms", "Anti-skid porcelain on balconies"] },
      { group: "Kitchen", items: ["Modular kitchen with quartz island", "Bosch built-in appliances", "Separate wet & dry kitchen"] },
      { group: "Bathrooms", items: ["Kohler & Grohe sanitaryware", "Rain shower and freestanding tub in master", "Heated towel rails"] },
      { group: "Smart Home", items: ["App-controlled lighting & curtains", "VRV air-conditioning", "Video door phone & biometric lock"] },
    ],
    priceLines: [
      { label: "Base Price", amount: 12.5 * CRORE, note: "₹26,042 / sq ft" },
      { label: "Preferential Location Charge (PLC)", amount: 35 * LAKH, note: "Golf-facing" },
      { label: "Covered Parking (3)", amount: 24 * LAKH },
      { label: "Club Membership", amount: 15 * LAKH },
    ],
    plan: {
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
  },
  {
    slug: "5-bhk",
    type: "5 BHK",
    title: "The Sovereign 5 BHK",
    tagline: "Generational living, elevated above the greens.",
    area: 6200,
    carpetArea: 4350,
    priceFrom: 17 * CRORE,
    bedrooms: 5,
    bathrooms: 6,
    parking: 4,
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1920&q=75",
    highlights: ["Dual master suites", "Private study", "Double-height living", "Home theatre-ready den"],
    specs: [
      { group: "Flooring", items: ["Book-matched Statuario marble in living, dining & foyer", "Herringbone oak in bedrooms & study", "Stone-finish deck on balconies"] },
      { group: "Kitchen", items: ["Italian modular kitchen with marble island", "Bosch & Miele built-in appliances", "Wine fridge and walk-in pantry"] },
      { group: "Bathrooms", items: ["Villeroy & Boch sanitaryware", "Steam shower in both master baths", "Smart mirrors with demisters"] },
      { group: "Smart Home", items: ["Full home automation with scene control", "VRV air-conditioning with air purification", "Multi-room audio pre-wiring"] },
    ],
    priceLines: [
      { label: "Base Price", amount: 17 * CRORE, note: "₹27,419 / sq ft" },
      { label: "Preferential Location Charge (PLC)", amount: 50 * LAKH, note: "Golf-facing, high floor" },
      { label: "Covered Parking (4)", amount: 32 * LAKH },
      { label: "Club Membership", amount: 20 * LAKH },
    ],
    plan: {
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
  },
  {
    slug: "penthouse",
    type: "Penthouse",
    title: "The Sovereign Penthouse",
    tagline: "Only two exist. The sky is your neighbour.",
    area: 11500,
    carpetArea: 8100,
    priceFrom: null,
    bedrooms: 6,
    bathrooms: 8,
    parking: 6,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=75",
    highlights: ["Private rooftop pool", "Full-floor residence", "360° panoramic views", "Dedicated butler's suite"],
    specs: [
      { group: "Flooring", items: ["Rare Calacatta Oro marble throughout", "Hand-finished walnut in suites", "Teak deck around private pool"] },
      { group: "Kitchen", items: ["Show kitchen + chef's kitchen", "Gaggenau appliance suite", "Temperature-controlled wine cellar"] },
      { group: "Wellness", items: ["Private heated infinity pool", "Home spa with sauna & steam", "Private gym studio"] },
      { group: "Smart Home", items: ["Crestron automation", "Private elevator with biometric access", "Dedicated security command"] },
    ],
    priceLines: null,
    plan: {
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
  },
];

export function getResidence(slug: string): Residence | undefined {
  return residences.find((r) => r.slug === slug);
}

export function getResidenceByType(type: UnitType): Residence {
  return residences.find((r) => r.type === type)!;
}

/** Totals for the price breakup table. */
export function priceBreakup(res: Residence) {
  if (!res.priceLines) return null;
  const subtotal = res.priceLines.reduce((s, l) => s + l.amount, 0);
  const gst = subtotal * GST_RATE;
  return { subtotal, gst, total: subtotal + gst };
}

/** Lowest published starting price across all configurations (for "Starting from ₹X Cr*"). */
export function startingPrice(): number {
  return Math.min(...residences.map((r) => r.priceFrom ?? Infinity));
}
