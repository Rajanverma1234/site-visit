/**
 * POST /api/lead — receives viewing requests and brochure requests.
 *
 *  - validates with the same zod schemas as the forms (lib/lead.ts)
 *  - honeypot field `website`: bots that fill it get a fake success
 *  - basic rate limit: 5 requests / 10 minutes per IP (in-memory, per server instance)
 *  - email via Resend (https://resend.com) when RESEND_API_KEY is set;
 *    otherwise the lead is logged on the server and success is still returned,
 *    so the demo keeps working without any keys.
 *
 * Env: RESEND_API_KEY, LEAD_TO_EMAIL (comma-separated), LEAD_FROM_EMAIL — see .env.example.
 */
import { NextResponse } from "next/server";
import { brochureSchema, phoneError, toE164, viewingSchema } from "@/lib/lead";
import { company, project } from "@/data/project";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // keep memory bounded
  return recent.length > MAX_PER_WINDOW;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many requests. Please wait a few minutes and try again." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: pretend success so bots don't retry.
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true, delivered: false });
  }

  const type = body.type === "brochure" ? "brochure" : "viewing";
  const parsed = type === "brochure" ? brochureSchema.safeParse(body) : viewingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 422 });
  }
  const lead = parsed.data as Record<string, string | undefined> & { name: string; country: string; phone: string; email: string };
  const pErr = phoneError(lead.country, lead.phone);
  if (pErr) return NextResponse.json({ ok: false, error: pErr }, { status: 422 });

  const record: Record<string, string | undefined> = { type, ...lead, phoneE164: toE164(lead.country, lead.phone), receivedAt: new Date().toISOString() };
  delete record.website;

  const subject =
    type === "brochure"
      ? `Brochure request — ${record.name}`
      : `${record.mode} request — ${record.interest} — ${record.name} (${record.date} ${record.time} IST)`;
  const lines = Object.entries(record)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${esc(k)}</td><td style="padding:4px 0"><b>${esc(String(v))}</b></td></tr>`)
    .join("");

  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_TO_EMAIL;
  if (!key || !to) {
    // Demo / unconfigured: log and succeed so the form still works.
    console.log("[lead] (email not configured — set RESEND_API_KEY & LEAD_TO_EMAIL)", JSON.stringify(record));
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.LEAD_FROM_EMAIL || `${project.shortName} <onboarding@resend.dev>`,
        to: to.split(",").map((s) => s.trim()).filter(Boolean),
        reply_to: lead.email,
        subject: `[${company.name}] ${subject}`,
        html: `<h2 style="font-family:Georgia,serif">${esc(subject)}</h2><table style="font-family:Arial,sans-serif;font-size:14px">${lines}</table>`,
      }),
    });
    if (!res.ok) {
      console.error("[lead] Resend error", res.status, await res.text());
      return NextResponse.json({ ok: false, error: "We couldn't send your request right now. Please try WhatsApp or call us." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, delivered: true });
  } catch (e) {
    console.error("[lead] send failed", e);
    return NextResponse.json({ ok: false, error: "We couldn't send your request right now. Please try WhatsApp or call us." }, { status: 502 });
  }
}
