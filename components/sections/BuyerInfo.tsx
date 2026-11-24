"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { faqs, paymentPlan, specifications } from "@/data/project";
import { residences } from "@/data/residences";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Reveal, RevealText } from "@/components/ui/Reveal";
import { DemoOnly } from "@/components/ui/DemoNote";
import JsonLd from "@/components/ui/JsonLd";

/* ------------------------------------------------------------------ */
/* Payment plan                                                        */
/* ------------------------------------------------------------------ */

/** Construction-linked payment plan with a progress rail and example amounts for the entry 4 BHK. */
export function PaymentPlan() {
  const example = residences[0];
  const base = example.priceFrom ?? 0;
  let cumulative = 0;

  return (
    <section id="payment-plan" className="bg-charcoal py-24 md:py-32">
      <div className="container-luxe grid gap-14 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <Reveal>
            <p className="eyebrow">Payment plan</p>
          </Reveal>
          <RevealText lines={["Pay as", "it rises."]} className="mt-5 text-5xl leading-[1] md:text-7xl" />
          <Reveal>
            <p className="mt-6 max-w-sm text-ivory/75">A construction-linked plan: you pay in stages as each milestone is completed and certified by the project architect.</p>
            <p className="mt-4 text-xs text-ivory/65">
              Example amounts for a {example.type} at a base price of {formatINR(base)}. <DemoOnly>Illustrative plan for this concept demo — not an offer.</DemoOnly>
            </p>
          </Reveal>
        </div>

        <Reveal stagger={0.06}>
          <ol className="relative border-l border-gold/30 pl-8">
            {paymentPlan.map((s) => {
              cumulative += s.percent;
              return (
                <li data-reveal key={s.stage} className="relative pb-6 last:pb-0">
                  <span aria-hidden className="absolute -left-[37px] top-1.5 h-2.5 w-2.5 rounded-full border border-gold bg-charcoal" />
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <p className="text-ivory">
                      {s.stage}
                      {s.note && <span className="ml-2 text-xs text-ivory/65">({s.note})</span>}
                    </p>
                    <p className="font-serif text-xl text-gold tabular-nums">
                      {s.percent}% <span className="ml-2 text-sm text-ivory/70">≈ {formatINR((base * s.percent) / 100)}</span>
                    </p>
                  </div>
                  <div className="mt-2 h-px w-full bg-ivory/10" aria-hidden>
                    <div className="h-full bg-gold/60" style={{ width: `${cumulative}%` }} />
                  </div>
                </li>
              );
            })}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Specifications                                                      */
/* ------------------------------------------------------------------ */

export function Specifications() {
  return (
    <section id="specifications" className="bg-ivory-200 py-24 text-charcoal md:py-32">
      <div className="container-luxe">
        <Reveal>
          <p className="eyebrow !text-gold-dark">Specifications</p>
        </Reveal>
        <RevealText lines={["Crafted in detail."]} className="mt-5 text-5xl leading-[1] md:text-6xl" />
        <Reveal className="mt-12 grid gap-px overflow-hidden border border-charcoal/15 bg-charcoal/15 sm:grid-cols-2 lg:grid-cols-4" stagger={0.06}>
          {specifications.map((g) => (
            <div data-reveal key={g.title} className="bg-ivory-200 p-7">
              <h3 className="font-serif text-2xl text-charcoal">{g.title}</h3>
              <ul className="mt-4 space-y-2 text-sm text-charcoal/75">
                {g.items.map((i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-gold-dark" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
        <DemoOnly>
          <p className="mt-5 text-xs text-charcoal/70">Brands and specifications are illustrative for this concept demo.</p>
        </DemoOnly>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ accordion                                                       */
/* ------------------------------------------------------------------ */

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();
  return (
    <section id="faq" className="bg-charcoal py-24 md:py-32">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <div className="container-luxe grid gap-12 lg:grid-cols-[1fr_1.7fr]">
        <div>
          <Reveal>
            <p className="eyebrow">FAQ</p>
          </Reveal>
          <RevealText lines={["Questions,", "answered."]} className="mt-5 text-5xl leading-[1] md:text-7xl" />
          <Reveal>
            <p className="mt-6 max-w-sm text-ivory/75">From RERA to remittances — what buyers in India and overseas ask us most.</p>
          </Reveal>
        </div>
        <div className="divide-y divide-white/10 border-y border-white/10">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <h3>
                  <button
                    type="button"
                    id={`${uid}-q${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${uid}-a${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left font-serif text-xl text-ivory transition-colors hover:text-gold md:text-2xl"
                  >
                    {f.q}
                    <Plus size={18} aria-hidden className={cn("shrink-0 text-gold transition-transform duration-500", isOpen && "rotate-45")} />
                  </button>
                </h3>
                <div
                  id={`${uid}-a${i}`}
                  role="region"
                  aria-labelledby={`${uid}-q${i}`}
                  className={cn("grid transition-[grid-template-rows] duration-500 ease-luxe", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
                >
                  <div className="overflow-hidden">
                    <p className={cn("max-w-2xl pb-6 text-[15px] leading-relaxed text-ivory/75", !isOpen && "invisible")}>{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
