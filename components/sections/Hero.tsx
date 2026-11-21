"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { project } from "@/data/project";
import { useInView } from "@/hooks/useInView";
import Magnetic from "@/components/ui/Magnetic";
import SceneLoader from "@/components/ui/SceneLoader";

gsap.registerPlugin(ScrollTrigger);

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
  loading: () => <SceneLoader label="Rendering The Sovereign" />,
});

/**
 * The "wow" moment: sticky full-screen 3D towers. The section is taller than the viewport,
 * so scrolling through it dollies the camera toward the towers before the next section.
 */
export default function Hero() {
  const progress = useRef(0);
  const [sectionRef, inView] = useInView<HTMLElement>("0px");
  const overlay = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => (progress.current = self.progress),
      });
      gsap.to(overlay.current, {
        autoAlpha: 0,
        y: -80,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "45% top", scrub: true },
      });
      // Intro animation
      gsap.from("[data-hero-in]", { autoAlpha: 0, y: 40, duration: 1.4, ease: "power3.out", stagger: 0.15, delay: 0.3 });
    }, el);
    return () => ctx.revert();
  }, [sectionRef]);

  return (
    <section ref={sectionRef} className="relative h-[190vh] bg-charcoal" aria-label="The Sovereign — hero">
      <div className="sticky top-0 h-screen w-full overflow-hidden" data-cursor="Look">
        <div className="absolute inset-0">
          <HeroScene progress={progress} active={inView} />
        </div>

        {/* Readability gradients */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-charcoal/70 via-transparent to-charcoal" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-charcoal/60 to-transparent" />

        <div ref={overlay} className="pointer-events-none relative z-10 flex h-full items-end pb-28 md:items-center md:pb-0">
          <div className="container-luxe">
            <p data-hero-in className="eyebrow mb-6">
              {project.location}
            </p>
            <h1 data-hero-in className="font-serif text-[15vw] font-light leading-[0.88] tracking-[0.02em] text-ivory md:text-[9.5vw] lg:text-[8.5rem]">
              THE
              <br />
              SOVEREIGN
            </h1>
            <div data-hero-in className="mt-6 flex items-center gap-5">
              <span className="gold-line" />
              <p className="font-serif text-xl italic text-ivory/85 md:text-2xl">{project.headline}</p>
            </div>
            <div data-hero-in className="pointer-events-auto mt-10 flex flex-wrap gap-4">
              <Magnetic>
                <Link href="/virtual-tour" className="btn-gold" data-cursor="Enter">
                  Start Virtual Tour <ArrowRight size={14} aria-hidden />
                </Link>
              </Magnetic>
              <Magnetic>
                <Link href="/residences" className="btn-ghost" data-cursor="Explore">
                  Explore Residences
                </Link>
              </Magnetic>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
          <span className="text-[9px] uppercase tracking-luxe text-ivory/60">Scroll to approach</span>
          <span className="relative h-12 w-px overflow-hidden bg-ivory/15">
            <span className="animate-scrollcue absolute inset-0 bg-gold" />
          </span>
        </div>

        <p className="pointer-events-none absolute bottom-10 right-28 z-10 hidden text-[10px] uppercase tracking-luxe text-ivory/50 md:block">
          Move your mouse to walk around
        </p>
      </div>
    </section>
  );
}
