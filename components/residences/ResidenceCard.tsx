"use client";

import Link from "next/link";
import { ArrowUpRight, BedDouble, Car, Maximize2 } from "lucide-react";
import type { Residence } from "@/data/residences";
import { formatArea, formatINR } from "@/lib/format";
import SlotImage, { IllustrativeTag } from "@/components/ui/SlotImage";
import TiltCard, { TiltGlare, TiltLayer } from "@/components/ui/TiltCard";

export default function ResidenceCard({ residence, index }: { residence: Residence; index: number }) {
  return (
    <TiltCard className="h-full" max={8}>
      <Link href={`/residences/${residence.slug}`} data-cursor="View" className="relative flex h-full min-h-[560px] flex-col overflow-hidden rounded-sm border border-white/10 bg-charcoal-800">
        <div className="relative h-72 overflow-hidden">
          <TiltLayer>
            <SlotImage slot={residence.image} cover sizes="(max-width: 768px) 100vw, 33vw" priority={index === 0} tag={false} imgClassName="transition-transform duration-[1.6s] ease-luxe group-hover:scale-105" />
          </TiltLayer>
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-800 to-transparent" />
          <span className="absolute left-6 top-6 font-serif text-sm text-gold">0{index + 1}</span>
          {residence.image.placeholder && <IllustrativeTag position="top-right" />}
        </div>
        <TiltGlare />
        <div className="flex flex-1 flex-col p-8 [transform:translateZ(30px)]">
          <h2 className="text-5xl">{residence.type}</h2>
          <p className="mt-3 text-sm text-ivory/60">{residence.tagline}</p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ivory/70">
            <li className="flex items-center gap-2">
              <Maximize2 size={13} className="text-gold" aria-hidden /> {formatArea(residence.area)}
            </li>
            <li className="flex items-center gap-2">
              <BedDouble size={13} className="text-gold" aria-hidden /> {residence.bedrooms} bedrooms
            </li>
            <li className="flex items-center gap-2">
              <Car size={13} className="text-gold" aria-hidden /> {residence.parking} parking
            </li>
          </ul>
          <div className="mt-auto flex items-end justify-between pt-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/70">{residence.priceFrom ? "Starting from" : "Price"}</p>
              <p className="mt-1 font-serif text-3xl text-gold">{residence.priceFrom ? `${formatINR(residence.priceFrom)}*` : "On request"}</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/50 text-gold transition-colors group-hover:bg-gold group-hover:text-charcoal">
              <ArrowUpRight size={18} aria-hidden />
            </span>
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}
