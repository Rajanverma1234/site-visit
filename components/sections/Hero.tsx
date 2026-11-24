"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { project } from "@/data/project";
import { startingPrice } from "@/data/residences";
import { formatINR } from "@/lib/format";
import { useIsTouch } from "@/hooks/useMediaQuery";
import Magnetic from "@/components/ui/Magnetic";
import LazyScene from "@/components/ui/LazyScene";
import { PriceNote } from "@/components/ui/DemoNote";

gsap.registerPlugin(ScrollTrigger);

// No loading UI here: LazyScene's poster is the placeholder.
const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false, loading: () => null });

/**
 * The "wow" moment: sticky full-screen 3D towers. The section is taller than the viewport,
 * so scrolling through it dollies the camera toward the towers before the next section.
 * The 3D loads after the page is idle; until then a real render of the scene is shown.
 */
export default function Hero() {
  const progress = useRef(0);
  const section = useRef<HTMLElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const touch = useIsTouch();

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
      // The <h1> is deliberately not animated: it is the LCP element and must paint immediately.
      gsap.from("[data-hero-in]", { autoAlpha: 0, y: 40, duration: 1.4, ease: "power3.out", stagger: 0.15, delay: 0.3 });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} className="relative h-[190vh] bg-charcoal motion-reduce:h-screen" aria-label="The Sovereign — hero">
      <div className="sticky top-0 h-screen w-full overflow-hidden" data-cursor="Look">
        <div className="absolute inset-0">
          <LazyScene
            mount="idle"
            priority
            poster="/posters/hero-desktop.jpg"
            posterMobile="/posters/hero-mobile.jpg"
            posterAlt="The Sovereign's two glass towers at golden hour"
            label="Loading 3D towers"
          >
            {({ active, onReady }) => <HeroScene progress={progress} active={active} onReady={onReady} />}
          </LazyScene>
        </div>

        {/* Readability gradients */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-charcoal/70 via-transparent to-charcoal" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-charcoal/60 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-charcoal/35 md:hidden" />

        <div ref={overlay} className="pointer-events-none relative z-10 flex h-full items-end pb-36 md:items-center md:pb-0">
          <div className="container-luxe">
            <p data-hero-in className="eyebrow mb-6">
              {project.location}
            </p>
            <h1 className="font-serif text-[15vw] font-light leading-[0.88] tracking-[0.02em] text-ivory md:text-[9.5vw] lg:text-[8.5rem]">
              THE
              <br />
              SOVEREIGN
            </h1>
            <div data-hero-in className="mt-6 flex items-center gap-5">
              <span className="gold-line" />
              <p className="font-serif text-xl italic text-ivory/85 md:text-2xl">{project.headline}</p>
            </div>
            <p data-hero-in className="mt-5 text-sm text-ivory/80">
              4 &amp; 5 BHK Residences and Penthouses · Starting from{" "}
              <span className="font-serif text-xl text-gold">{formatINR(startingPrice())}*</span>
              <PriceNote className="mt-1 block text-[11px] text-ivory/60" />
            </p>
            <div data-hero-in className="pointer-events-auto mt-8 flex flex-wrap gap-4">
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
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex">
          <span className="text-[10px] uppercase tracking-luxe text-ivory/70">Scroll to approach</span>
          <span className="relative h-12 w-px overflow-hidden bg-ivory/15">
            <span className="animate-scrollcue absolute inset-0 bg-gold" />
          </span>
        </div>

        {/* Device-appropriate interaction hint */}
        <p className="pointer-events-none absolute bottom-[92px] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-luxe text-ivory/75 md:bottom-10 md:left-auto md:right-28 md:translate-x-0">
          {touch ? "Drag sideways to look around" : "Move your mouse to walk around"}
        </p>
      </div>
    </section>
  );
}
