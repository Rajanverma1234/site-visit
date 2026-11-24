"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { experienceFeatures } from "@/data/project";
import { Reveal, RevealText } from "@/components/ui/Reveal";
import SlotImage, { IllustrativeTag } from "@/components/ui/SlotImage";
import TiltCard, { TiltGlare, TiltLayer } from "@/components/ui/TiltCard";

/** "Walk Through Before You Visit" — three tilt cards with counter-moving images. */
export default function ExperienceCards() {
  return (
    <section className="relative bg-charcoal py-28 md:py-40">
      <div className="container-luxe">
        <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Reveal>
              <p className="eyebrow">The Remote Viewing Suite</p>
            </Reveal>
            <RevealText lines={["Walk through", "before you visit."]} className="mt-5 text-5xl leading-[1] md:text-7xl" />
          </div>
          <Reveal>
            <p className="max-w-sm text-ivory/60">
              Whether you are in Mumbai, Dubai or London, explore every corner of The Sovereign as if you were standing in it.
            </p>
          </Reveal>
        </div>

        <Reveal className="grid gap-6 md:grid-cols-3" stagger={0.15}>
          {experienceFeatures.map((f, i) => (
            <div data-reveal key={f.title} className="h-[460px] md:h-[540px]">
              <TiltCard className="h-full">
                <Link href={f.href} data-cursor={f.cta} className="relative block h-full overflow-hidden rounded-sm border border-white/10">
                  <TiltLayer>
                    <SlotImage slot={f.image} cover sizes="(max-width: 768px) 100vw, 33vw" tag={false} imgClassName="transition-transform duration-[1.6s] ease-luxe group-hover:scale-105" />
                  </TiltLayer>
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/30 to-transparent" />
                  <TiltGlare />
                  {f.image.placeholder && <IllustrativeTag position="top-right" />}
                  <div className="absolute inset-x-0 bottom-0 p-8 [transform:translateZ(40px)]">
                    <p className="font-serif text-sm text-gold">0{i + 1}</p>
                    <h3 className="mt-2 text-3xl md:text-4xl">{f.title}</h3>
                    <p className="mt-3 max-w-xs text-sm text-ivory/70">{f.description}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-gold">
                      {f.cta === "Enter" ? "Enter the tour" : "Explore"} <ArrowUpRight size={14} aria-hidden />
                    </span>
                  </div>
                </Link>
              </TiltCard>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
