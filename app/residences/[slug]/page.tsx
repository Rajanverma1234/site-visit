import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Box, Check } from "lucide-react";
import { GST_RATE, getResidence, priceBreakup, residences } from "@/data/residences";
import { formatArea, formatINR, formatINRFull } from "@/lib/format";
import FloorPlan from "@/components/residences/FloorPlan";
import EmiCalculator from "@/components/residences/EmiCalculator";
import SlotImage from "@/components/ui/SlotImage";
import Magnetic from "@/components/ui/Magnetic";
import { Reveal } from "@/components/ui/Reveal";
import { CRORE } from "@/lib/format";
import { IS_DEMO } from "@/lib/site";

export function generateStaticParams() {
  return residences.map((r) => ({ slug: r.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const r = getResidence(params.slug);
  if (!r) return {};
  return {
    title: `${r.type} Residences`,
    description: `${r.title}: ${formatArea(r.area)}, ${r.bedrooms} bedrooms. ${r.priceFrom ? `From ${formatINR(r.priceFrom)}.` : "Price on request."}`,
  };
}

export default function ResidenceDetailPage({ params }: { params: { slug: string } }) {
  const r = getResidence(params.slug);
  if (!r) notFound();
  const totals = priceBreakup(r);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[80vh] items-end overflow-hidden bg-charcoal pb-16 pt-40">
        <SlotImage slot={r.image} cover priority sizes="100vw" tagPosition="top-right" className="!absolute" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-charcoal/20" />
        <div className="container-luxe relative">
          <Link href="/residences" className="mb-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-ivory/70 hover:text-gold">
            <ArrowLeft size={14} aria-hidden /> All residences
          </Link>
          <p className="eyebrow">The Sovereign</p>
          <h1 className="mt-4 text-6xl leading-[0.95] md:text-9xl">{r.type}</h1>
          <p className="mt-4 max-w-xl font-serif text-2xl italic text-ivory/80">{r.tagline}</p>
          <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4 text-sm">
            <Stat label="Super area" value={formatArea(r.area)} />
            <Stat label="Bedrooms" value={String(r.bedrooms)} />
            <Stat label="Bathrooms" value={String(r.bathrooms)} />
            <Stat label="Parking" value={String(r.parking)} />
            <Stat label={r.priceFrom ? "From" : "Price"} value={r.priceFrom ? formatINR(r.priceFrom) : "On request"} gold />
          </div>
          <div className="mt-10">
            <Magnetic>
              <Link href="/virtual-tour" className="btn-gold" data-cursor="Enter">
                <Box size={15} aria-hidden /> Tour this Residence in 3D
              </Link>
            </Magnetic>
          </div>
        </div>
      </section>

      {/* Floor plan + highlights */}
      <section className="bg-ivory py-24 text-charcoal md:py-32">
        <div className="container-luxe grid gap-16 lg:grid-cols-[1.6fr_1fr]">
          <Reveal>
            <p className="eyebrow mb-6 !text-gold-dark">Interactive floor plan</p>
            <FloorPlan residence={r} />
          </Reveal>
          <Reveal>
            <p className="eyebrow !text-gold-dark">Highlights</p>
            <ul className="mt-6 space-y-4">
              {r.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 border-b border-charcoal/10 pb-4 font-serif text-2xl">
                  <Check size={18} className="mt-1.5 shrink-0 text-gold-dark" aria-hidden /> {h}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Specifications */}
      <section className="bg-charcoal py-24 md:py-32">
        <div className="container-luxe">
          <p className="eyebrow">Specifications</p>
          <h2 className="mt-5 text-5xl md:text-6xl">Crafted in detail.</h2>
          <Reveal className="mt-14 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
            {r.specs.map((s) => (
              <div data-reveal key={s.group} className="bg-charcoal p-8">
                <h3 className="font-serif text-2xl text-gold">{s.group}</h3>
                <ul className="mt-5 space-y-3 text-sm text-ivory/70">
                  {s.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Price breakup */}
      <section className="bg-ivory py-24 text-charcoal md:py-32">
        <div className="container-luxe grid gap-16 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow !text-gold-dark">Price breakup</p>
            <h2 className="mt-5 text-5xl md:text-6xl">Transparent pricing.</h2>
            <p className="mt-6 max-w-sm text-charcoal/70">{IS_DEMO ? "Demo values for illustration. " : ""}Final pricing depends on floor, view and payment plan.</p>
          </div>
          {totals && r.priceLines ? (
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Price breakup for {r.type}</caption>
              <thead>
                <tr className="border-b border-charcoal/20 text-[10px] uppercase tracking-[0.2em] text-stone">
                  <th scope="col" className="py-3 font-normal">Component</th>
                  <th scope="col" className="py-3 text-right font-normal">Amount</th>
                </tr>
              </thead>
              <tbody>
                {r.priceLines.map((l) => (
                  <tr key={l.label} className="border-b border-charcoal/10">
                    <td className="py-4">
                      {l.label}
                      {l.note && <span className="ml-2 text-xs text-stone">({l.note})</span>}
                    </td>
                    <td className="py-4 text-right tabular-nums">{formatINRFull(l.amount)}</td>
                  </tr>
                ))}
                <tr className="border-b border-charcoal/10">
                  <td className="py-4 text-stone">Subtotal</td>
                  <td className="py-4 text-right tabular-nums text-stone">{formatINRFull(totals.subtotal)}</td>
                </tr>
                <tr className="border-b border-charcoal/10">
                  <td className="py-4">GST @ {GST_RATE * 100}%</td>
                  <td className="py-4 text-right tabular-nums">{formatINRFull(totals.gst)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" className="pt-6 font-serif text-2xl font-normal">All-inclusive</th>
                  <td className="pt-6 text-right font-serif text-3xl text-gold-dark">{formatINR(totals.total)}</td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <div className="border border-charcoal/15 p-10">
              <p className="font-serif text-3xl">Pricing on request</p>
              <p className="mt-3 text-charcoal/60">Only two penthouses exist. Pricing is shared privately with qualified buyers after a personal consultation.</p>
              <Link href="/contact" className="btn-gold mt-8">
                Request a private consultation
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* EMI */}
      <section className="bg-ivory-200 py-24 text-charcoal md:py-32">
        <div className="container-luxe">
          <p className="eyebrow !text-gold-dark">EMI calculator</p>
          <h2 className="mb-14 mt-5 text-5xl md:text-6xl">Plan your {r.type}.</h2>
          <EmiCalculator defaultLoan={totals ? Math.round((totals.total * 0.8) / 1e6) * 1e6 : 20 * CRORE} />
        </div>
      </section>
    </>
  );
}

function Stat({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/65">{label}</p>
      <p className={`mt-1 font-serif text-2xl ${gold ? "text-gold" : "text-ivory"}`}>{value}</p>
    </div>
  );
}
