"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { testimonials } from "@/data/project";
import { Reveal } from "@/components/ui/Reveal";
import { DemoOnly } from "@/components/ui/DemoNote";
import { useReducedMotion } from "@/hooks/useMediaQuery";

/** Auto-advancing testimonial carousel (pauses on hover / focus). */
export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = testimonials.length;
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (paused || reducedMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % n), 6500);
    return () => clearInterval(id);
  }, [paused, n, reducedMotion]);

  const t = testimonials[index];

  return (
    <section className="relative bg-ivory py-28 text-charcoal md:py-40" aria-roledescription="carousel" aria-label="Client testimonials">
      <div className="container-luxe">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="eyebrow !text-gold-dark">In their words</p>
          <Quote className="mx-auto mt-10 text-gold" size={36} strokeWidth={1} aria-hidden />
          <div className="relative mt-8 min-h-[280px] md:min-h-[240px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
            <AnimatePresence mode="wait">
              <motion.figure key={index} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} aria-live="polite">
                <blockquote className="font-serif text-2xl font-light leading-snug md:text-4xl">“{t.quote}”</blockquote>
                <figcaption className="mt-8">
                  <span className="block text-sm font-medium tracking-wide">{t.name}</span>
                  <span className="mt-1 block text-xs uppercase tracking-[0.2em] text-charcoal/70">{t.role}</span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
          <div className="mt-10 flex items-center justify-center gap-6">
            <button type="button" aria-label="Previous testimonial" onClick={() => setIndex((i) => (i - 1 + n) % n)} className="rounded-full border border-charcoal/20 p-3 hover:border-gold-dark hover:text-gold-dark">
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button key={i} type="button" aria-label={`Show testimonial ${i + 1}`} aria-current={i === index} onClick={() => setIndex(i)} className="py-2">
                  <span className={`block h-px transition-all duration-500 ${i === index ? "w-10 bg-gold-dark" : "w-5 bg-charcoal/25"}`} />
                </button>
              ))}
            </div>
            <button type="button" aria-label="Next testimonial" onClick={() => setIndex((i) => (i + 1) % n)} className="rounded-full border border-charcoal/20 p-3 hover:border-gold-dark hover:text-gold-dark">
              <ChevronRight size={16} />
            </button>
          </div>
          <DemoOnly>
            <p className="mt-8 text-[11px] uppercase tracking-[0.2em] text-charcoal/70">Testimonials are fictional and for demonstration only.</p>
          </DemoOnly>
        </Reveal>
      </div>
    </section>
  );
}
