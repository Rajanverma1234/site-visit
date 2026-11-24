"use client";

import { useEffect, useRef, useState } from "react";
import { PLAN_BOUNDS, roomAt, tourRooms, type RoomId } from "@/data/tour";
import { tourLive } from "@/lib/tourLive";
import { cn } from "@/lib/utils";

const [MINX, MINZ, MAXX, MAXZ] = PLAN_BOUNDS;
const W = MAXX - MINX;
const H = MAXZ - MINZ;

/**
 * Mini 2D floor plan. The gold dot + view cone track the camera in real time (read
 * from `tourLive` in a rAF loop). Clicking a room glides the camera there.
 */
export default function Minimap({ onSelect, className }: { onSelect: (room: RoomId) => void; className?: string }) {
  const dot = useRef<SVGGElement>(null);
  const [here, setHere] = useState<RoomId | null>(null);
  const hereRef = useRef<RoomId | null>(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const x = tourLive.x - MINX;
      const z = tourLive.z - MINZ;
      // yaw 0 looks toward -Z (up on the plan); SVG rotation is clockwise-positive
      const deg = (-tourLive.yaw * 180) / Math.PI;
      dot.current?.setAttribute("transform", `translate(${x} ${z}) rotate(${deg})`);
      const r = roomAt(tourLive.x, tourLive.z);
      if (r !== hereRef.current) {
        hereRef.current = r;
        setHere(r);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Draw smaller rooms last so they sit on top of the big living rect.
  const order: RoomId[] = ["living", "dining", "kitchen", "balcony", "master", "wardrobe", "bedroom2"];

  return (
    <div className={cn("glass-panel p-3", className)}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[9px] uppercase tracking-[0.3em] text-gold">Floor plan</p>
        <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/65">N ↑</p>
      </div>
      <svg viewBox={`-0.3 -0.3 ${W + 0.6} ${H + 0.6}`} className="h-auto w-full" role="group" aria-label="Mini floor plan — click a room to move there">
        {order.map((id) => {
          const r = tourRooms.find((t) => t.id === id)!;
          const [x0, z0, x1, z1] = r.rect;
          const active = here === id;
          return (
            <g
              key={id}
              role="button"
              tabIndex={0}
              aria-label={`Go to ${r.name}`}
              onClick={() => onSelect(id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(id);
                }
              }}
              className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-gold"
            >
              <rect
                x={x0 - MINX}
                y={z0 - MINZ}
                width={x1 - x0}
                height={z1 - z0}
                fill={active ? "rgba(200,169,106,0.22)" : id === "balcony" ? "rgba(120,160,110,0.12)" : "rgba(245,241,234,0.05)"}
                stroke={active ? "#C8A96A" : "rgba(245,241,234,0.35)"}
                strokeWidth={0.12}
                className="transition-[fill] duration-500 hover:fill-[rgba(200,169,106,0.15)]"
              />
              <text x={(x0 + x1) / 2 - MINX} y={(z0 + z1) / 2 - MINZ + 0.35} textAnchor="middle" fontSize={id === "balcony" ? 0.9 : 0.95} fill={active ? "#C8A96A" : "rgba(245,241,234,0.7)"} className="pointer-events-none select-none">
                {r.short}
              </text>
            </g>
          );
        })}
        <g ref={dot} className="pointer-events-none">
          <path d="M0 0 L-1.6 -3.2 A3.6 3.6 0 0 1 1.6 -3.2 Z" fill="rgba(200,169,106,0.35)" />
          <circle r={0.45} fill="#C8A96A" stroke="#0E0E10" strokeWidth={0.12} />
        </g>
      </svg>
    </div>
  );
}
