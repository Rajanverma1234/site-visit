/**
 * Helpers over the configuration facts in project.ts + plan geometry in floorplans.ts.
 * (Edit facts in project.ts — not here.)
 */
import { configurations, GST_RATE, type Configuration, type ResidenceSlug, type UnitType } from "./project";
import { floorPlans, type FloorPlanGeometry, type PlanRoom } from "./floorplans";
import { images, type ImageSlot } from "./images";

export type { ResidenceSlug, UnitType, PlanRoom };
export { GST_RATE };

export interface Residence extends Configuration {
  plan: FloorPlanGeometry;
  /** Real floor-plan image if supplied (images.floorPlans[slug].src), otherwise the SVG is used. */
  planImage: ImageSlot;
}

export const residences: Residence[] = configurations.map((c) => ({ ...c, plan: floorPlans[c.slug], planImage: images.floorPlans[c.slug] }));

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
