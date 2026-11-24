/**
 * Lead schemas shared by the browser forms and the /api/lead route,
 * so client-side and server-side validation can never disagree.
 */
import { z } from "zod";
import { getCountry, normaliseNational } from "@/data/countries";

export const INTERESTS = ["4 BHK", "5 BHK", "Penthouse"] as const;
export const MODES = ["Video Call Tour", "Site Visit"] as const;

/** ISO date `days` ago (UTC). The server allows "yesterday" so visitors in any time zone can pick their today. */
const isoDaysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

const contactFields = {
  name: z.string().trim().min(2, "Please enter your full name").max(80, "That name is too long"),
  country: z.string().min(2).max(2),
  phone: z.string().trim().min(1, "Enter your mobile number").max(24),
  email: z.string().trim().min(1, "Enter your email address").email("Enter a valid email address").max(120),
  /** Honeypot: hidden from people, bots fill it in. Must stay empty. */
  website: z.string().max(0).optional().or(z.literal("")),
};

export const viewingSchema = z.object({
  ...contactFields,
  interest: z.enum(INTERESTS, { errorMap: () => ({ message: "Choose a residence type" }) }),
  mode: z.enum(MODES, { errorMap: () => ({ message: "Choose how you'd like to visit" }) }),
  date: z
    .string()
    .min(1, "Pick a preferred date")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a preferred date")
    .refine((v) => v >= isoDaysAgo(1), "Date can't be in the past"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Pick a preferred time"),
  timeZone: z.string().max(64).optional(),
  unit: z.string().max(12).optional(),
});

export const brochureSchema = z.object(contactFields);

export type ViewingLead = z.infer<typeof viewingSchema>;
export type BrochureLead = z.infer<typeof brochureSchema>;

/** Country-specific mobile validation. Returns an error message, or null when valid. */
export function phoneError(country: string, phone: string): string | null {
  const c = getCountry(country);
  return c.pattern.test(normaliseNational(phone, c)) ? null : `Enter a valid ${c.name} mobile number, e.g. ${c.example}`;
}

/** "+44" + "07400 123456" → "+447400123456" */
export function toE164(country: string, phone: string): string {
  const c = getCountry(country);
  return `${c.dial}${normaliseNational(phone, c)}`;
}

/** Body accepted by POST /api/lead. */
export type LeadRequest = ({ type: "viewing" } & ViewingLead) | ({ type: "brochure" } & BrochureLead);

/** Client helper: POSTs a lead and throws a readable error on failure. */
export async function submitLead(body: LeadRequest): Promise<{ ok: true; delivered: boolean }> {
  const res = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; delivered?: boolean; error?: string };
  if (!res.ok || !data.ok) throw new Error(data.error || "We couldn't send your request. Please try again.");
  return { ok: true, delivered: Boolean(data.delivered) };
}
