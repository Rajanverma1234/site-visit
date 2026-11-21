"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { amenities } from "@/data/amenities";
import SmartImage from "@/components/ui/SmartImage";

gsap.registerPlugin(ScrollTrigger);

/**
 * Pinned horizontal scroll of amenity cards (desktop).
 * On touch / small screens / reduced motion it falls back to a native swipeable row.
 */
export default function Amenities() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = section.current;
    const tr = track.current;
    if (!el || !tr) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (hover: hover) and (prefers-reduced-motion: no-preference)", () => {
      const distance = () => tr.scrollWidth - window.innerWidth;
      gsap.to(tr, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.8,
          pin: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="amenities" ref={section} className="relative overflow-hidden bg-ivory text-charcoal">
      <div className="flex min-h-screen flex-col justify-center py-24">
        <div className="container-luxe mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow !text-gold-dark">Amenities</p>
            <h2 className="mt-5 text-5xl leading-[1] md:text-7xl">
              A private club,
              <br />
              <em className="text-gold-dark">forty floors up.</em>
            </h2>
          </div>
          <p className="max-w-sm text-charcoal/60">Nine curated experiences, reserved exclusively for 164 families. Scroll to stroll through them.</p>
        </div>

        <div className="no-scrollbar overflow-x-auto lg:overflow-visible">
          <div ref={track} className="flex w-max gap-6 px-5 sm:px-8 lg:px-12">
            {amenities.map((a, i) => (
              <article
                key={a.title}
                data-cursor="View"
                className="group relative h-[62vh] max-h-[620px] min-h-[420px] w-[78vw] shrink-0 overflow-hidden rounded-sm sm:w-[46vw] lg:w-[30vw]"
              >
                <SmartImage
                  src={a.image}
                  alt={a.title}
                  fill
                  sizes="(max-width: 640px) 80vw, (max-width: 1024px) 46vw, 30vw"
                  wrapperClassName="absolute inset-0"
                  className="scale-100 transition-transform duration-[2.4s] ease-luxe group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 text-ivory">
                  <p className="font-serif text-sm text-gold">{String(i + 1).padStart(2, "0")} — {a.kicker}</p>
                  <h3 className="mt-2 text-4xl">{a.title}</h3>
                  <div className="grid grid-rows-[0fr] transition-all duration-700 ease-luxe group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr] [@media(hover:none)]:grid-rows-[1fr]">
                    <p className="translate-y-4 overflow-hidden text-sm text-ivory/75 opacity-0 transition-all duration-700 ease-luxe group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
                      <span className="block pt-3">{a.description}</span>
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
