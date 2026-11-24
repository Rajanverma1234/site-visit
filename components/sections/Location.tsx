"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Building2, Clock, GraduationCap, HeartPulse, MapPin, Plane, ShoppingBag, TrainFront, Trees } from "lucide-react";
import { places, type Place } from "@/data/locations";
import { project } from "@/data/project";
import { cn } from "@/lib/utils";
import { Reveal, RevealText } from "@/components/ui/Reveal";
import LazyScene from "@/components/ui/LazyScene";

const LocationMap = dynamic(() => import("./LocationMap"), { ssr: false, loading: () => null });

/** Lightweight stylised placeholder shown until Leaflet + tiles load. */
function MapPoster() {
  return (
    <div className="absolute inset-0 bg-[#121316]">
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 600" aria-hidden>
        <defs>
          <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="rgba(245,241,234,0.05)" />
          </pattern>
        </defs>
        <rect width="800" height="600" fill="url(#mapgrid)" />
        <path d="M-20 420 C 180 380, 300 300, 420 300 S 640 220, 840 160" fill="none" stroke="rgba(245,241,234,0.14)" strokeWidth="6" />
        <path d="M380 -20 C 400 160, 420 260, 420 300 S 460 520, 480 640" fill="none" stroke="rgba(245,241,234,0.1)" strokeWidth="4" />
        <path d="M120 -20 L 260 640" stroke="rgba(245,241,234,0.06)" strokeWidth="3" />
        <circle cx="420" cy="300" r="34" fill="rgba(200,169,106,0.18)" />
        <circle cx="420" cy="300" r="9" fill="#C8A96A" stroke="#F5F1EA" strokeWidth="2" />
      </svg>
    </div>
  );
}

const icons: Record<Place["category"], typeof MapPin> = {
  Transit: TrainFront,
  Business: Building2,
  Leisure: Trees,
  Airport: Plane,
  Healthcare: HeartPulse,
  Education: GraduationCap,
  Shopping: ShoppingBag,
};

export default function Location() {
  const [active, setActive] = useState<Place | null>(null);

  return (
    <section id="location" className="relative bg-charcoal py-28 md:py-36">
      <div className="container-luxe">
        <div className="mb-14">
          <Reveal>
            <p className="eyebrow">Location</p>
          </Reveal>
          <RevealText lines={["At the centre", "of everything that matters."]} className="mt-5 text-5xl leading-[1] md:text-7xl" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <ul className="space-y-1" onMouseLeave={() => setActive(null)}>
            <li className="mb-4 flex items-center gap-3 border-b border-white/10 pb-4 text-sm">
              <MapPin size={16} className="text-gold" aria-hidden />
              <span className="text-ivory/80">{project.location}</span>
            </li>
            {places.map((p) => {
              const Icon = icons[p.category];
              const isActive = active?.id === p.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(p)}
                    onFocus={() => setActive(p)}
                    onClick={() => setActive(p)}
                    data-cursor="Locate"
                    className={cn(
                      "group flex w-full items-center gap-4 border-l-2 px-4 py-4 text-left transition-all duration-500",
                      isActive ? "border-gold bg-white/[0.04]" : "border-transparent hover:bg-white/[0.02]",
                    )}
                  >
                    <Icon size={18} className={cn("shrink-0 transition-colors", isActive ? "text-gold" : "text-stone")} aria-hidden />
                    <span className="flex-1">
                      <span className="block text-[15px] text-ivory">{p.name}</span>
                      <span className="mt-1 flex items-center gap-2 text-xs text-stone">
                        <Clock size={11} aria-hidden /> {p.driveTime} drive
                      </span>
                    </span>
                    <span className={cn("font-serif text-2xl transition-colors", isActive ? "text-gold" : "text-ivory/70")}>{p.distance}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="relative h-[480px] overflow-hidden rounded-sm border border-white/10 lg:h-auto lg:min-h-[600px]" data-lenis-prevent>
            <LazyScene posterAlt="Map of Golf Course Road, Gurugram" posterNode={<MapPoster />} label="Loading map">
              {({ onReady }) => <LocationMap active={active} onReady={onReady} />}
            </LazyScene>
            {active && (
              <div className="glass-panel pointer-events-none absolute bottom-5 left-5 z-[500] p-5">
                <p className="text-[10px] uppercase tracking-luxe text-gold">{active.category}</p>
                <p className="mt-1 font-serif text-2xl">{active.name}</p>
                <p className="mt-1 text-sm text-ivory/70">
                  {active.distance} · approx. {active.driveTime} by car
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
