/**
 * EVERY image on the site has a named slot here. To use a real photo:
 *   1. put the file in /public/images/ (e.g. /public/images/amenities/sky-lounge.jpg)
 *   2. change that slot's `src` and set `placeholder: false`
 *   3. run `npm run images:meta` (refreshes real width/height + blur placeholder)
 * The layout reserves `aspectRatio` for each slot, so any photo fits without breaking the page.
 * See /public/images/README.md for the client brief (sizes, ratios, file names).
 */
import meta from "./image-meta.json";

export interface ImageSlot {
  /** Path under /public. `null` = nothing supplied yet (a styled fallback is shown). */
  src: string | null;
  alt: string;
  /** Intrinsic pixel size (auto-filled from image-meta.json when available). */
  width: number;
  height: number;
  /** Ratio the layout reserves, CSS `aspect-ratio` format, e.g. "4/5". */
  aspectRatio: string;
  /** true = stock / render stand-in → shows the "Illustrative image" tag. */
  placeholder: boolean;
  blurDataURL?: string;
  /** Brief for the client: what to send. */
  spec: { minResolution: string; suggestedFile: string; usage: string };
}

type Meta = Record<string, { width: number; height: number; blurDataURL: string }>;
const M = meta as Meta;
const P = "/images/placeholder";

function slot(s: Omit<ImageSlot, "width" | "height" | "blurDataURL"> & { width?: number; height?: number }): ImageSlot {
  const m = s.src ? M[s.src] : undefined;
  const [rw, rh] = s.aspectRatio.split("/").map(Number);
  return { ...s, width: m?.width ?? s.width ?? rw * 100, height: m?.height ?? s.height ?? rh * 100, blurDataURL: m?.blurDataURL };
}

export const images = {
  hero: {
    day: slot({ src: `${P}/hero-day.jpg`, alt: "The Sovereign's two glass towers on Golf Course Road at golden hour (3D render)", aspectRatio: "16/10", placeholder: true, spec: { minResolution: "2560×1600", suggestedFile: "hero/hero-day.jpg", usage: "Homepage hero poster, desktop" } }),
    mobile: slot({ src: `${P}/hero-mobile.jpg`, alt: "The Sovereign towers at golden hour, portrait view (3D render)", aspectRatio: "9/19.5", placeholder: true, spec: { minResolution: "1080×2340", suggestedFile: "hero/hero-mobile.jpg", usage: "Homepage hero poster, phones" } }),
    night: slot({ src: null, alt: "The Sovereign towers lit up at night", aspectRatio: "16/10", placeholder: true, spec: { minResolution: "2560×1600", suggestedFile: "hero/hero-night.jpg", usage: "Reserved: night hero / campaign image" } }),
  },
  experience: {
    walkthrough: slot({ src: `${P}/experience-walkthrough.jpg`, alt: "Sunlit luxury living room with a sofa and floor-to-ceiling windows", aspectRatio: "4/5", placeholder: true, spec: { minResolution: "1200×1500", suggestedFile: "experience/walkthrough.jpg", usage: "'Virtual Walkthrough' card" } }),
    floorSelector: slot({ src: `${P}/experience-floor-selector.jpg`, alt: "Looking up at a glass high-rise façade against the sky", aspectRatio: "4/5", placeholder: true, spec: { minResolution: "1200×1500", suggestedFile: "experience/floor-selector.jpg", usage: "'Interactive Floor Selector' card" } }),
    dayNight: slot({ src: `${P}/experience-day-night.jpg`, alt: "City skyline glowing at dusk", aspectRatio: "4/5", placeholder: true, spec: { minResolution: "1200×1500", suggestedFile: "experience/day-night.jpg", usage: "'Day & Night View' card" } }),
  },
  amenities: {
    skyLounge: slot({ src: `${P}/amenity-sky-lounge.jpg`, alt: "Dimly lit lounge bar with warm pendant lights", aspectRatio: "4/5", placeholder: true, spec: { minResolution: "1200×1500", suggestedFile: "amenities/sky-lounge.jpg", usage: "Amenity card: Sky Lounge" } }),
    infinityPool: slot({ src: `${P}/amenity-infinity-pool.jpg`, alt: "Resort infinity pool lined with loungers and palms", aspectRatio: "4/5", placeholder: true, spec: { minResolution: "1200×1500", suggestedFile: "amenities/infinity-pool.jpg", usage: "Amenity card: Infinity Pool" } }),
    theatre: slot({ src: `${P}/amenity-private-theatre.jpg`, alt: "Rows of red cinema seats in a private theatre", aspectRatio: "4/5", placeholder: true, spec: { minResolution: "1200×1500", suggestedFile: "amenities/private-theatre.jpg", usage: "Amenity card: Private Theatre" } }),
    cigarLounge: slot({ src: `${P}/amenity-cigar-lounge.jpg`, alt: "Club room with leather armchairs and a whisky bar", aspectRatio: "4/5", placeholder: true, spec: { minResolution: "1200×1500", suggestedFile: "amenities/cigar-lounge.jpg", usage: "Amenity card: Cigar Lounge" } }),
    spa: slot({ src: `${P}/amenity-spa.jpg`, alt: "Calm spa treatment room with towels and candles", aspectRatio: "4/5", placeholder: true, spec: { minResolution: "1200×1500", suggestedFile: "amenities/spa.jpg", usage: "Amenity card: The Spa" } }),
    golfSimulator: slot({ src: `${P}/amenity-golf-simulator.jpg`, alt: "Golfer mid-swing on a green fairway", aspectRatio: "4/5", placeholder: true, spec: { minResolution: "1200×1500", suggestedFile: "amenities/golf-simulator.jpg", usage: "Amenity card: Golf Simulator" } }),
    concierge: slot({ src: `${P}/amenity-concierge.jpg`, alt: "Elegant hotel-style lobby with a concierge desk", aspectRatio: "4/5", placeholder: true, spec: { minResolution: "1200×1500", suggestedFile: "amenities/concierge.jpg", usage: "Amenity card: 24×7 Concierge" } }),
    evCharging: slot({ src: `${P}/amenity-ev-charging.jpg`, alt: "Electric car plugged into a charging point", aspectRatio: "4/5", placeholder: true, spec: { minResolution: "1200×1500", suggestedFile: "amenities/ev-charging.jpg", usage: "Amenity card: EV Charging" } }),
    security: slot({ src: `${P}/amenity-security.jpg`, alt: "Security camera mounted on a modern building wall", aspectRatio: "4/5", placeholder: true, spec: { minResolution: "1200×1500", suggestedFile: "amenities/security.jpg", usage: "Amenity card: 3-Tier Security" } }),
  },
  interiors: {
    "4-bhk": slot({ src: `${P}/interior-4bhk.jpg`, alt: "4 BHK living room with marble floors and warm lighting (illustrative)", aspectRatio: "3/2", placeholder: true, spec: { minResolution: "2400×1600", suggestedFile: "interiors/4bhk-living.jpg", usage: "4 BHK card & detail-page hero" } }),
    "5-bhk": slot({ src: `${P}/interior-5bhk.jpg`, alt: "5 BHK open-plan living and dining area (illustrative)", aspectRatio: "3/2", placeholder: true, spec: { minResolution: "2400×1600", suggestedFile: "interiors/5bhk-living.jpg", usage: "5 BHK card & detail-page hero" } }),
    penthouse: slot({ src: `${P}/interior-penthouse.jpg`, alt: "Penthouse with a private pool and city views (illustrative)", aspectRatio: "3/2", placeholder: true, spec: { minResolution: "2400×1600", suggestedFile: "interiors/penthouse.jpg", usage: "Penthouse card & detail-page hero" } }),
  },
  /** Floor-plan images. `src: null` → the interactive placeholder SVG plan is shown instead. */
  floorPlans: {
    "4-bhk": slot({ src: null, alt: "4 BHK floor plan", aspectRatio: "4/3", placeholder: true, spec: { minResolution: "2400×1800 (or SVG/PDF)", suggestedFile: "floor-plans/4bhk.png", usage: "Floor-plan modal & 4 BHK page" } }),
    "5-bhk": slot({ src: null, alt: "5 BHK floor plan", aspectRatio: "4/3", placeholder: true, spec: { minResolution: "2400×1800 (or SVG/PDF)", suggestedFile: "floor-plans/5bhk.png", usage: "Floor-plan modal & 5 BHK page" } }),
    penthouse: slot({ src: null, alt: "Penthouse floor plan", aspectRatio: "4/3", placeholder: true, spec: { minResolution: "2400×1800 (or SVG/PDF)", suggestedFile: "floor-plans/penthouse.png", usage: "Floor-plan modal & Penthouse page" } }),
  },
  view: slot({ src: `${P}/view-from-residence.jpg`, alt: "View from a high-floor balcony over the DLF Golf Course towards the Gurugram skyline (3D render)", aspectRatio: "16/10", placeholder: true, spec: { minResolution: "2560×1600", suggestedFile: "view/view-from-residence.jpg", usage: "Homepage intro — actual view from a high floor (drone shot)" } }),
  developerLogo: slot({ src: "/images/brand/logo.svg", alt: "White Collar Realty", aspectRatio: "260/64", width: 260, height: 64, placeholder: true, spec: { minResolution: "Vector (SVG) preferred", suggestedFile: "brand/logo.svg", usage: "Brand mark (header/footer use the inline version)" } }),
  pastProjects: {
    aravalli: slot({ src: `${P}/past-project-aravalli.jpg`, alt: "Modern residential towers with landscaped gardens (stock photo)", aspectRatio: "4/3", placeholder: true, spec: { minResolution: "1600×1200", suggestedFile: "past-projects/project-1.jpg", usage: "About section, past project 1" } }),
    cyberCrest: slot({ src: `${P}/past-project-cyber-crest.jpg`, alt: "Glass office tower seen from street level (stock photo)", aspectRatio: "4/3", placeholder: true, spec: { minResolution: "1600×1200", suggestedFile: "past-projects/project-2.jpg", usage: "About section, past project 2" } }),
    meridian: slot({ src: `${P}/past-project-meridian.jpg`, alt: "Contemporary villa with a pool at dusk (stock photo)", aspectRatio: "4/3", placeholder: true, spec: { minResolution: "1600×1200", suggestedFile: "past-projects/project-3.jpg", usage: "About section, past project 3" } }),
  },
  posters: {
    floorSelector: slot({ src: `${P}/poster-floor-selector.jpg`, alt: "3D model of Tower A showing availability on each floor", aspectRatio: "16/9", placeholder: true, spec: { minResolution: "Auto-generated render", suggestedFile: "(keep)", usage: "Shown until the 3D floor selector loads" } }),
    virtualTour: slot({ src: `${P}/poster-virtual-tour.jpg`, alt: "Living room of the 4 BHK virtual tour (3D render)", aspectRatio: "16/10", placeholder: true, spec: { minResolution: "Auto-generated render", suggestedFile: "(keep)", usage: "Shown until the virtual tour loads" } }),
  },
  og: slot({ src: `${P}/og.jpg`, alt: "The Sovereign — two glass towers on Golf Course Road, Gurugram, at golden hour", aspectRatio: "1200/630", placeholder: true, spec: { minResolution: "1200×630 exactly", suggestedFile: "og/og.jpg", usage: "Link preview (WhatsApp, LinkedIn, X…)" } }),
} as const;

/** Flat list of every slot with its dotted key — used to generate the client image brief. */
export function allSlots(): { key: string; slot: ImageSlot }[] {
  const out: { key: string; slot: ImageSlot }[] = [];
  const walk = (o: Record<string, unknown>, prefix: string) => {
    for (const [k, v] of Object.entries(o)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === "object" && "aspectRatio" in v) out.push({ key, slot: v as ImageSlot });
      else if (v && typeof v === "object") walk(v as Record<string, unknown>, key);
    }
  };
  walk(images as unknown as Record<string, unknown>, "");
  return out;
}
