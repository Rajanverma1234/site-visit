"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, LayoutGrid } from "lucide-react";
import { residences, type Residence } from "@/data/residences";
import { configSummary } from "@/data/inventory";
import { formatArea, formatINR } from "@/lib/format";
import FloorPlan from "@/components/residences/FloorPlan";
import Modal from "@/components/ui/Modal";
import { PriceNote } from "@/components/ui/DemoNote";
import { Reveal, RevealText } from "@/components/ui/Reveal";

/** Homepage overview: carpet area, unit count, floor range and starting price per configuration. */
export default function ResidencesSummary() {
  const [plan, setPlan] = useState<Residence | null>(null);

  return (
    <section id="residences" className="bg-ivory py-24 text-charcoal md:py-32">
      <div className="container-luxe">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal>
              <p className="eyebrow !text-gold-dark">Residences at a glance</p>
            </Reveal>
            <RevealText lines={["Three configurations.", "One standard."]} className="mt-5 text-5xl leading-[1] md:text-7xl" />
          </div>
          <Link href="/residences" className="btn-ghost-dark self-start md:self-auto">
            Compare all residences <ArrowUpRight size={14} aria-hidden />
          </Link>
        </div>

        <Reveal className="grid gap-px overflow-hidden border border-charcoal/15 bg-charcoal/15 md:grid-cols-3" stagger={0.1}>
          {residences.map((r) => {
            const s = configSummary(r.type);
            return (
              <article data-reveal key={r.slug} className="flex flex-col bg-ivory p-8">
                <h3 className="text-4xl">{r.type}</h3>
                <p className="mt-2 text-sm text-charcoal/70">{r.tagline}</p>
                <dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5 text-sm">
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.16em] text-charcoal/65">Carpet area</dt>
                    <dd className="mt-1 font-serif text-2xl">{formatArea(r.carpetArea)}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.16em] text-charcoal/65">Super area</dt>
                    <dd className="mt-1 font-serif text-2xl">{formatArea(r.area)}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.16em] text-charcoal/65">Residences</dt>
                    <dd className="mt-1 font-serif text-2xl">
                      {s.units} <span className="text-sm text-charcoal/65">· {s.available} available</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.16em] text-charcoal/65">Floors</dt>
                    <dd className="mt-1 font-serif text-2xl">{s.minFloor === s.maxFloor ? `${s.minFloor}th` : `${s.minFloor}–${s.maxFloor}`}</dd>
                  </div>
                </dl>
                <p className="mt-8 border-t border-charcoal/15 pt-5 text-sm">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-charcoal/65">Starting from </span>
                  <span className="font-serif text-3xl text-gold-dark">{r.priceFrom ? `${formatINR(r.priceFrom)}*` : "On request"}</span>
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" onClick={() => setPlan(r)} className="btn-gold !px-5 !py-3 !text-[10.5px]" data-cursor="View">
                    <LayoutGrid size={14} aria-hidden /> View floor plan
                  </button>
                  <Link href={`/residences/${r.slug}`} className="btn-ghost-dark !px-5 !py-3 !text-[10.5px]" aria-label={`${r.type} details`}>
                    Details
                  </Link>
                </div>
              </article>
            );
          })}
        </Reveal>
        <PriceNote className="mt-5 block text-xs text-charcoal/70" />
      </div>

      <Modal open={!!plan} onClose={() => setPlan(null)} title={plan ? `${plan.type} floor plan` : "Floor plan"}>
        {plan && (
          <>
            <p className="eyebrow !text-gold-dark">Floor plan · indicative</p>
            <h3 className="mb-6 mt-2 text-4xl">{plan.type}</h3>
            <FloorPlan residence={plan} />
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/residences/${plan.slug}`} className="btn-gold">
                Full specifications & pricing
              </Link>
              <Link href="/virtual-tour" className="btn-ghost-dark">
                Tour in 3D
              </Link>
            </div>
          </>
        )}
      </Modal>
    </section>
  );
}
