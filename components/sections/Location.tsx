"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Building2, Clock, GraduationCap, HeartPulse, MapPin, Plane, ShoppingBag, TrainFront, Trees } from "lucide-react";
import { places, type Place } from "@/data/locations";
import { project } from "@/data/project";
import { cn } from "@/lib/utils";
import { Reveal, RevealText } from "@/components/ui/Reveal";
import SceneLoader from "@/components/ui/SceneLoader";

const LocationMap = dynamic(() => import("./LocationMap"), { ssr: false, loading: () => <SceneLoader label="Loading map" /> });

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
            <LocationMap active={active} />
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
