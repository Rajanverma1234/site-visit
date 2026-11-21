"use client";

import { useState } from "react";
import type { Residence } from "@/data/residences";
import { cn } from "@/lib/utils";

const fill: Record<string, string> = {
  living: "rgba(200,169,106,0.10)",
  bed: "rgba(138,133,128,0.10)",
  wet: "rgba(120,150,170,0.12)",
  outdoor: "rgba(110,150,100,0.14)",
  service: "rgba(14,14,16,0.04)",
};

const ftIn = (ft: number) => `${ft}'0"`;

/**
 * Interactive SVG floor plan. Hovering (or focusing) a room highlights it
 * and shows its dimensions in feet. Room data lives in data/residences.ts.
 */
export default function FloorPlan({ residence }: { residence: Residence }) {
  const [active, setActive] = useState<string | null>(null);
  const { width, height, rooms } = residence.plan;
  const activeRoom = rooms.find((r) => r.id === active);

  return (
    <div className="relative">
      <div className="mb-4 flex min-h-[56px] items-end justify-between gap-4">
        <div aria-live="polite">
          {activeRoom ? (
            <>
              <p className="font-serif text-3xl text-charcoal">{activeRoom.name}</p>
              <p className="text-sm text-gold-dark">
                {ftIn(activeRoom.w)} × {ftIn(activeRoom.h)} · {activeRoom.w * activeRoom.h} sq ft
              </p>
            </>
          ) : (
            <p className="text-sm text-stone">Hover over a room to see its dimensions.</p>
          )}
        </div>
        <p className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-stone">Not to scale · Indicative</p>
      </div>
      <svg viewBox={`-2 -2 ${width + 4} ${height + 4}`} className="h-auto w-full" role="group" aria-label={`${residence.title} floor plan`}>
        <rect x={-1} y={-1} width={width + 2} height={height + 2} fill="none" stroke="#0E0E10" strokeWidth={0.8} />
        {rooms.map((r) => {
          const on = active === r.id;
          return (
            <g
              key={r.id}
              tabIndex={0}
              role="button"
              aria-label={`${r.name}, ${r.w} by ${r.h} feet`}
              onMouseEnter={() => setActive(r.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(r.id)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(r.id)}
              className="cursor-pointer outline-none"
              data-cursor="Room"
            >
              <rect
                x={r.x}
                y={r.y}
                width={r.w}
                height={r.h}
                fill={on ? "rgba(200,169,106,0.45)" : fill[r.kind ?? "service"]}
                stroke={on ? "#A88A4E" : "#0E0E10"}
                strokeWidth={on ? 0.6 : 0.3}
                className="transition-all duration-300"
              />
              <text
                x={r.x + r.w / 2}
                y={r.y + r.h / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className={cn("pointer-events-none select-none font-sans uppercase transition-colors")}
                fontSize={Math.min(2.2, r.w / 8)}
                letterSpacing={0.15}
                fill={on ? "#0E0E10" : "rgba(14,14,16,0.6)"}
              >
                {r.name}
              </text>
              {on && (
                <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 3} textAnchor="middle" dominantBaseline="middle" fontSize={1.8} fill="#6b5528" className="pointer-events-none font-sans">
                  {r.w}′ × {r.h}′
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
