"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, X } from "lucide-react";
import { inventory, statusColors, type FloorInfo, type TowerId, type Unit } from "@/data/units";
import type { UnitType } from "@/data/residences";
import { formatArea, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/useInView";
import { useIsTouch } from "@/hooks/useMediaQuery";
import { Reveal, RevealText } from "@/components/ui/Reveal";
import SceneLoader from "@/components/ui/SceneLoader";

const FloorSelector3D = dynamic(() => import("@/components/three/FloorSelector"), {
  ssr: false,
  loading: () => <SceneLoader label="Building the tower" />,
});

const TYPE_FILTERS: UnitType[] = ["4 BHK", "5 BHK", "Penthouse"];

function unitMatches(u: Unit, types: UnitType[], availableOnly: boolean) {
  return (types.length === 0 || types.includes(u.type)) && (!availableOnly || u.status === "Available");
}

export default function FloorSelectorSection() {
  const [tower, setTower] = useState<TowerId>("A");
  const [types, setTypes] = useState<UnitType[]>([]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [inViewRef, inView] = useInView<HTMLDivElement>("200px");
  const touch = useIsTouch();

  const floors = inventory[tower];
  const isMatch = useCallback(
    (f: FloorInfo) => f.units.some((u) => unitMatches(u, types, availableOnly)),
    [types, availableOnly],
  );

  const onHover = useCallback((floor: number | null, cx?: number, cy?: number) => {
    setHovered(floor);
    if (floor !== null && cx !== undefined && cy !== undefined && wrap.current) {
      const r = wrap.current.getBoundingClientRect();
      setTip({ x: cx - r.left, y: cy - r.top });
    } else if (floor === null) setTip(null);
  }, []);

  const hoveredInfo = hovered !== null ? floors[hovered - 1] : null;
  const selectedInfo = selected !== null ? floors[selected - 1] : null;

  const matchingCount = useMemo(
    () => floors.flatMap((f) => f.units).filter((u) => unitMatches(u, types, availableOnly)).length,
    [floors, types, availableOnly],
  );

  const toggleType = (t: UnitType) => setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  return (
    <section id="floor-selector" className="relative overflow-hidden bg-charcoal-800 py-28 md:py-36">
      <div className="container-luxe">
        <div className="mb-12 grid gap-8 md:grid-cols-2 md:items-end">
          <div>
            <Reveal>
              <p className="eyebrow">Interactive Floor Selector</p>
            </Reveal>
            <RevealText lines={["Choose your floor.", "Choose your view."]} className="mt-5 text-5xl leading-[1] md:text-7xl" />
          </div>
          <Reveal>
            <p className="max-w-md text-ivory/60 md:ml-auto">
              Hover over the tower to see live availability on every floor. Click a floor to view its residences, prices and views.
            </p>
          </Reveal>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="mr-4 flex rounded-full border border-white/10 p-1" role="group" aria-label="Select tower">
            {(["A", "B"] as TowerId[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTower(t);
                  setSelected(null);
                }}
                aria-pressed={tower === t}
                className={cn("rounded-full px-5 py-2 text-[11px] uppercase tracking-[0.2em] transition-colors", tower === t ? "bg-gold text-charcoal" : "text-ivory/70 hover:text-ivory")}
              >
                Tower {t}
              </button>
            ))}
          </div>
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleType(t)}
              aria-pressed={types.includes(t)}
              className={cn(
                "rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors",
                types.includes(t) ? "border-gold bg-gold/15 text-gold" : "border-white/15 text-ivory/70 hover:border-gold/60",
              )}
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAvailableOnly((v) => !v)}
            aria-pressed={availableOnly}
            className={cn(
              "rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors",
              availableOnly ? "border-[#5FAE7E] bg-[#5FAE7E]/15 text-[#8fd3a8]" : "border-white/15 text-ivory/70 hover:border-[#5FAE7E]/60",
            )}
          >
            Available only
          </button>
          <span className="ml-auto text-xs text-stone" aria-live="polite">
            {matchingCount} matching residences in Tower {tower}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
          {/* 3D tower */}
          <div
            ref={(el) => {
              (wrap as React.MutableRefObject<HTMLDivElement | null>).current = el;
              (inViewRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
            }}
            className="relative h-[560px] overflow-hidden rounded-sm border border-white/10 bg-gradient-to-b from-[#1b1d24] to-charcoal md:h-[680px]"
            data-cursor={hovered ? "Select" : "Drag"}
          >
            <FloorSelector3D
              floors={floors}
              hovered={hovered}
              selected={selected}
              isMatch={isMatch}
              onHover={onHover}
              onSelect={setSelected}
              active={inView}
              touch={touch}
            />

            {/* Legend */}
            <div className="pointer-events-none absolute left-5 top-5 space-y-2 text-[11px] text-ivory/70">
              {Object.entries(statusColors).map(([s, c]) => (
                <div key={s} className="flex items-center gap-2">
                  <span className="h-2 w-4" style={{ background: c }} />
                  {s}
                </div>
              ))}
            </div>
            <p className="pointer-events-none absolute bottom-4 left-5 text-[10px] uppercase tracking-luxe text-ivory/40">
              {touch ? "Tap a floor · drag to rotate" : "Hover a floor · drag to rotate"}
            </p>

            {/* Floating tooltip */}
            <AnimatePresence>
              {hoveredInfo && tip && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="glass-panel pointer-events-none absolute z-10 w-56 p-4"
                  style={{ left: Math.min(tip.x + 18, (wrap.current?.clientWidth ?? 600) - 240), top: Math.max(tip.y - 30, 10) }}
                >
                  <FloorTooltip info={hoveredInfo} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accessible floor index (keyboard & touch friendly) */}
          <nav aria-label={`Floors of Tower ${tower}`} className="no-scrollbar flex gap-1 overflow-x-auto lg:max-h-[680px] lg:w-20 lg:flex-col lg:overflow-y-auto" data-lenis-prevent>
            {[...floors].reverse().map((f) => {
              const res = f.kind === "residential" || f.kind === "penthouse";
              const match = res && isMatch(f);
              return (
                <button
                  key={f.floor}
                  type="button"
                  disabled={!res}
                  onMouseEnter={() => setHovered(f.floor)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(f.floor)}
                  onBlur={() => setHovered(null)}
                  onClick={() => setSelected(f.floor)}
                  aria-label={res ? `Floor ${f.floor}, ${f.units.filter((u) => u.status === "Available").length} available` : `Floor ${f.floor}: ${f.label}`}
                  className={cn(
                    "shrink-0 rounded-sm px-3 py-1.5 text-left text-[11px] tabular-nums transition-colors",
                    selected === f.floor || hovered === f.floor ? "bg-gold text-charcoal" : match ? "text-ivory/80 hover:bg-white/5" : "text-ivory/25",
                    !res && "cursor-not-allowed italic",
                  )}
                >
                  {f.floor === 42 ? "PH" : f.floor === 40 ? "SKY" : f.floor === 1 ? "L" : String(f.floor).padStart(2, "0")}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Side panel */}
      <AnimatePresence>
        {selectedInfo && (
          <>
            <motion.div className="fixed inset-0 z-[55] bg-charcoal/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={`Floor ${selectedInfo.floor} residences`}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 right-0 z-[56] flex w-full max-w-md flex-col overflow-y-auto border-l border-white/10 bg-charcoal p-8"
              data-lenis-prevent
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="eyebrow">Tower {tower}</p>
                  <h3 className="mt-2 text-5xl">{selectedInfo.kind === "penthouse" ? "The Penthouse" : `Floor ${selectedInfo.floor}`}</h3>
                  <p className="mt-2 text-sm text-stone">
                    {selectedInfo.units.length} residence{selectedInfo.units.length > 1 ? "s" : ""} · Private lift lobby for each
                  </p>
                </div>
                <button type="button" onClick={() => setSelected(null)} className="rounded-full border border-white/15 p-2 hover:border-gold" aria-label="Close panel" autoFocus>
                  <X size={18} />
                </button>
              </div>
              <span className="gold-line my-8 block" />
              <ul className="space-y-4">
                {selectedInfo.units.map((u) => {
                  const match = unitMatches(u, types, availableOnly);
                  return (
                    <li key={u.id} className={cn("border border-white/10 p-5 transition-opacity", !match && "opacity-45")}>
                      <div className="flex items-center justify-between">
                        <p className="font-serif text-2xl">{u.type}</p>
                        <StatusBadge status={u.status} />
                      </div>
                      <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
                        <dt className="text-stone">Unit</dt>
                        <dd className="text-right">{u.id}</dd>
                        <dt className="text-stone">Size</dt>
                        <dd className="text-right">{formatArea(u.area)}</dd>
                        <dt className="text-stone">Price</dt>
                        <dd className="text-right text-gold">{u.price ? formatINR(u.price) : "On request"}</dd>
                        <dt className="text-stone">View</dt>
                        <dd className="text-right">{u.view}</dd>
                      </dl>
                      <Link
                        href={`/virtual-tour?unit=${u.id}`}
                        className={cn("mt-5 w-full !text-[10.5px]", u.status === "Booked" ? "btn-ghost" : "btn-gold")}
                        data-cursor="Enter"
                      >
                        <Eye size={14} aria-hidden /> Take Virtual Tour of this Residence
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link href="/contact" className="mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gold">
                Speak to a relationship manager <ArrowRight size={14} aria-hidden />
              </Link>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

function FloorTooltip({ info }: { info: FloorInfo }) {
  if (info.kind === "lobby" || info.kind === "amenity") {
    return (
      <>
        <p className="font-serif text-2xl">Floor {info.floor}</p>
        <p className="mt-1 text-sm text-gold">{info.label}</p>
      </>
    );
  }
  const avail = info.units.filter((u) => u.status === "Available").length;
  return (
    <>
      <div className="flex items-baseline justify-between">
        <p className="font-serif text-2xl">{info.kind === "penthouse" ? "Penthouse" : `Floor ${info.floor}`}</p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-stone">{info.units.length} units</p>
      </div>
      <ul className="mt-3 space-y-1.5 text-xs">
        {info.units.map((u) => (
          <li key={u.id} className="flex items-center justify-between gap-2">
            <span className="text-ivory/80">
              {u.type} · {u.view.split(" ")[0]}
            </span>
            <span style={{ color: statusColors[u.status] }}>{u.status}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-white/10 pt-2 text-[11px] text-gold">{avail > 0 ? `${avail} available — click to view` : "Fully booked — join waitlist"}</p>
    </>
  );
}

function StatusBadge({ status }: { status: Unit["status"] }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.15em]" style={{ borderColor: statusColors[status], color: statusColors[status] }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColors[status] }} />
      {status}
    </span>
  );
}
