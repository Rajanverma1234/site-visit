"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { project } from "@/data/project";
import { headlineStats } from "@/data/inventory";
import { images } from "@/data/images";
import SlotImage from "@/components/ui/SlotImage";
import { Reveal, RevealText } from "@/components/ui/Reveal";
import { IS_DEMO } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger);

/** Intro + animated counters (42 Floors | 2 Towers | 164 Residences | 3 Acres). */
export default function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const counters = el.querySelectorAll<HTMLElement>("[data-count]");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      counters.forEach((c) => {
        const end = Number(c.dataset.count);
        if (reduce) {
          c.textContent = String(end);
          return;
        }
        const obj = { v: 0 };
        gsap.to(obj, {
          v: end,
          duration: 2.2,
          ease: "power2.out",
          scrollTrigger: { trigger: c, start: "top 90%", once: true },
          onUpdate: () => (c.textContent = String(Math.round(obj.v))),
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="sovereign" className="relative bg-ivory py-28 text-charcoal md:py-40">
      <div className="container-luxe">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Reveal>
              <p className="eyebrow !text-gold-dark">The Sovereign</p>
              <span className="gold-line mt-5 block" />
            </Reveal>
            <figure className="mt-10 max-w-md">
              <SlotImage slot={images.view} sizes="(max-width: 768px) 100vw, 40vw" />
              <figcaption className="mt-3 text-xs text-charcoal/70">The view from a high-floor residence across the DLF Golf Course.</figcaption>
            </figure>
          </div>
          <div className="md:col-span-7">
            <RevealText lines={["Two towers of glass and light,", "rising above the greens."]} className="text-4xl leading-[1.05] md:text-6xl" />
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-xl text-base leading-relaxed text-charcoal/70 md:text-lg">{project.intro}</p>
              <p className="mt-4 text-sm text-stone">
                Possession {project.possession} · RERA {project.rera}{IS_DEMO && <em> (demo)</em>}
              </p>
            </Reveal>
          </div>
        </div>

        <div ref={ref} className="mt-24 grid grid-cols-2 border-t border-charcoal/10 md:grid-cols-4">
          {headlineStats().map((s, i) => (
            <div key={s.label} className={`py-10 md:py-14 ${i > 0 ? "md:border-l" : ""} ${i % 2 === 1 ? "border-l" : ""} border-charcoal/10 px-4 md:px-8`}>
              <p className="font-serif text-6xl font-light text-charcoal md:text-8xl">
                <span data-count={s.value}>{s.value}</span>
                
              </p>
              <p className="mt-3 text-[11px] uppercase tracking-luxe text-gold-dark">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
