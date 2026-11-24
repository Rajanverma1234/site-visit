"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, X } from "lucide-react";
import { floorLabel, inventory, statusColors, type FloorInfo, type TowerId, type Unit } from "@/data/units";
import type { UnitType } from "@/data/residences";
import { formatArea, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useIsTouch, useMediaQuery, useReducedMotion } from "@/hooks/useMediaQuery";
import { Reveal, RevealText } from "@/components/ui/Reveal";
import LazyScene from "@/components/ui/LazyScene";

const FloorSelector3D = dynamic(() => import("@/components/three/FloorSelector"), { ssr: false, loading: () => null });

const TYPE_FILTERS: UnitType[] = ["4 BHK", "5 BHK", "Penthouse"];

function unitMatches(u: Unit, types: UnitType[], availableOnly: boolean) {
  return (types.length === 0 || types.includes(u.type)) && (!availableOnly || u.status === "Available");
}

const isResidential = (f: FloorInfo) => f.kind === "residential" || f.kind === "penthouse";

export default function FloorSelectorSection() {
  const [tower, setTower] = useState<TowerId>("A");
  const [types, setTypes] = useState<UnitType[]>([]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const touch = useIsTouch();
  const reducedMotion = useReducedMotion();
  const sheet = useMediaQuery("(max-width: 1023px)");

  const floors = inventory[tower];
  const isMatch = useCallback((f: FloorInfo) => f.units.some((u) => unitMatches(u, types, availableOnly)), [types, availableOnly]);

  // Desktop: hover shows a floating tooltip. Touch: no hover — a tap selects instead.
  const onHover = useCallback(
    (floor: number | null, cx?: number, cy?: number) => {
      if (touch) return;
      setHovered(floor);
      if (floor !== null && cx !== undefined && cy !== undefined && wrap.current) {
        const r = wrap.current.getBoundingClientRect();
        setTip({ x: cx - r.left, y: cy - r.top });
      } else if (floor === null) setTip(null);
    },
    [touch],
  );

  const open = useCallback((floor: number) => {
    lastTrigger.current = document.activeElement as HTMLElement;
    setSelected(floor);
  }, []);
  const close = useCallback(() => {
    setSelected(null);
    lastTrigger.current?.focus?.();
  }, []);

  // Escape closes the panel / sheet
  useEffect(() => {
    if (selected === null) return;
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, close]);

  const hoveredInfo = hovered !== null ? floors[hovered - 1] : null;
  const selectedInfo = selected !== null ? floors[selected - 1] : null;

  const matchingCount = useMemo(() => floors.flatMap((f) => f.units).filter((u) => unitMatches(u, types, availableOnly)).length, [floors, types, availableOnly]);

  const toggleType = (t: UnitType) => setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  /** Roving focus for the floor list: ↑/↓ move between residential floors, Home/End jump, Enter opens. */
  const onListKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(e.key)) return;
    const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("button:not([disabled])") ?? []);
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (i === -1) return;
    e.preventDefault();
    let next = i;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = Math.max(0, i - 1);
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = Math.min(buttons.length - 1, i + 1);
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = buttons.length - 1;
    buttons[next].focus();
  };

  // The first residential floor in the list (top = 42) is the single tab stop.
  const firstFocusable = [...floors].reverse().find(isResidential)?.floor;
  const focusFloor = hovered !== null && isResidential(floors[hovered - 1]) ? hovered : firstFocusable;

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
            <p className="max-w-md text-ivory/70 md:ml-auto">
              {touch
                ? "Tap a floor on the tower — or in the floor list — to see its residences, prices and views. Drag to rotate the tower."
                : "Hover over the tower to see live availability on every floor. Click a floor to view its residences, prices and views."}
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
                className={cn("rounded-full px-5 py-2 text-[11px] uppercase tracking-[0.2em] transition-colors", tower === t ? "bg-gold text-charcoal" : "text-ivory/75 hover:text-ivory")}
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
              className={cn("rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors", types.includes(t) ? "border-gold bg-gold/15 text-gold" : "border-white/15 text-ivory/75 hover:border-gold/60")}
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAvailableOnly((v) => !v)}
            aria-pressed={availableOnly}
            className={cn("rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors", availableOnly ? "border-[#5FAE7E] bg-[#5FAE7E]/15 text-[#8fd3a8]" : "border-white/15 text-ivory/75 hover:border-[#5FAE7E]/60")}
          >
            Available only
          </button>
          <span className="w-full text-xs text-ivory/70 sm:ml-auto sm:w-auto" aria-live="polite">
            {matchingCount} matching residences in Tower {tower}
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:gap-6">
          {/* 3D tower */}
          <div ref={wrap} className="relative h-[460px] overflow-hidden rounded-sm border border-white/10 bg-gradient-to-b from-[#1b1d24] to-charcoal sm:h-[560px] md:h-[680px]" data-cursor={hovered ? "Select" : "Drag"}>
            <LazyScene poster="/posters/floors.jpg" posterAlt="3D model of Tower A with floor-by-floor availability" label="Loading tower">
              {({ active, onReady }) => (
                <FloorSelector3D
                  floors={floors}
                  hovered={hovered}
                  selected={selected}
                  isMatch={isMatch}
                  onHover={onHover}
                  onSelect={open}
                  active={active}
                  touch={touch}
                  reducedMotion={reducedMotion}
                  onReady={onReady}
                />
              )}
            </LazyScene>

            {/* Legend */}
            <div className="pointer-events-none absolute left-4 top-4 space-y-2 rounded-sm bg-charcoal/60 p-3 text-[11px] text-ivory/85 backdrop-blur-sm">
              {Object.entries(statusColors).map(([s, c]) => (
                <div key={s} className="flex items-center gap-2">
                  <span className="h-2 w-4" style={{ background: c }} />
                  {s}
                </div>
              ))}
            </div>
            <p className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-charcoal/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-ivory/80 backdrop-blur-sm">
              {touch ? "Tap a floor · drag to rotate" : "Hover a floor · drag to rotate"}
            </p>

            {/* Floating tooltip (pointer devices only) */}
            <AnimatePresence>
              {!touch && hoveredInfo && tip && (
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

          {/* Floor list — keyboard & touch friendly alternative to the 3D tower */}
          <div
            ref={listRef}
            role="toolbar"
            aria-orientation="vertical"
            aria-label={`Floors of Tower ${tower}. Use arrow keys to move, Enter to open.`}
            onKeyDown={onListKey}
            className="no-scrollbar flex gap-1 overflow-x-auto pb-1 lg:max-h-[680px] lg:w-24 lg:flex-col lg:overflow-y-auto lg:pb-0"
            data-lenis-prevent
          >
            {[...floors].reverse().map((f) => {
              const res = isResidential(f);
              const match = res && isMatch(f);
              const lbl = floorLabel(f.floor);
              const avail = f.units.filter((u) => u.status === "Available").length;
              return (
                <button
                  key={f.floor}
                  type="button"
                  disabled={!res}
                  tabIndex={f.floor === focusFloor ? 0 : -1}
                  onMouseEnter={() => !touch && setHovered(f.floor)}
                  onMouseLeave={() => !touch && setHovered(null)}
                  onFocus={() => setHovered(f.floor)}
                  onBlur={() => setHovered(null)}
                  onClick={() => open(f.floor)}
                  aria-label={res ? `${lbl.name}: ${f.units.length} residences, ${avail} available` : `${lbl.name} (amenity floor)`}
                  className={cn(
                    "flex shrink-0 items-baseline justify-between gap-2 rounded-sm px-3 py-2 text-left text-[12px] tabular-nums transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold lg:py-1.5",
                    selected === f.floor || hovered === f.floor ? "bg-gold text-charcoal" : match ? "text-ivory hover:bg-white/10" : "text-ivory/55",
                    !res && "cursor-not-allowed",
                  )}
                >
                  <span>{lbl.num}</span>
                  {lbl.tag && <span className={cn("text-[9px] tracking-[0.15em]", selected === f.floor || hovered === f.floor ? "text-charcoal" : "text-gold")}>{lbl.tag}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Residences panel: side drawer on desktop, bottom sheet on tablet / mobile */}
      {/* Separate AnimatePresence blocks: a Fragment child would stop exit animations from completing. */}
      <AnimatePresence>
        {selectedInfo && <motion.div key="backdrop" className="fixed inset-0 z-[55] bg-charcoal/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedInfo && (
            <motion.aside
              key="panel"
              role="dialog"
              aria-modal="true"
              aria-label={`${floorLabel(selectedInfo.floor).name}, Tower ${tower} residences`}
              initial={sheet ? { y: "100%" } : { x: "100%" }}
              animate={sheet ? { y: 0 } : { x: 0 }}
              exit={sheet ? { y: "100%" } : { x: "100%" }}
              transition={{ type: "tween", duration: reducedMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "fixed z-[56] flex flex-col overflow-y-auto border-white/10 bg-charcoal",
                sheet ? "inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl border-t px-6 pb-8 pt-3" : "inset-y-0 right-0 w-full max-w-md border-l p-8",
              )}
              data-lenis-prevent
            >
              {sheet && <SheetHandle onDismiss={close} />}
              <div className="flex items-start justify-between">
                <div>
                  <p className="eyebrow">Tower {tower}</p>
                  <h3 className="mt-2 text-4xl md:text-5xl">{selectedInfo.kind === "penthouse" ? "The Penthouse" : `Floor ${selectedInfo.floor}`}</h3>
                  <p className="mt-2 text-sm text-ivory/70">
                    {selectedInfo.units.length} residence{selectedInfo.units.length > 1 ? "s" : ""} · Private lift lobby for each
                  </p>
                </div>
                <button type="button" onClick={close} className="rounded-full border border-white/15 p-2 hover:border-gold" aria-label="Close" autoFocus>
                  <X size={18} />
                </button>
              </div>
              <span className="gold-line my-6 block" />
              <ul className="space-y-4">
                {selectedInfo.units.map((u) => {
                  const match = unitMatches(u, types, availableOnly);
                  return (
                    <li key={u.id} className={cn("border border-white/10 p-5 transition-opacity", !match && "opacity-60")}>
                      <div className="flex items-center justify-between">
                        <p className="font-serif text-2xl">{u.type}</p>
                        <StatusBadge status={u.status} />
                      </div>
                      <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
                        <dt className="text-ivory/65">Unit</dt>
                        <dd className="text-right">{u.id}</dd>
                        <dt className="text-ivory/65">Size</dt>
                        <dd className="text-right">{formatArea(u.area)}</dd>
                        <dt className="text-ivory/65">Price</dt>
                        <dd className="text-right text-gold">{u.price ? `${formatINR(u.price)}*` : "On request"}</dd>
                        <dt className="text-ivory/65">View</dt>
                        <dd className="text-right">{u.view}</dd>
                      </dl>
                      <Link href={`/virtual-tour?unit=${u.id}`} className={cn("mt-5 w-full !whitespace-normal !text-[10.5px]", u.status === "Booked" ? "btn-ghost" : "btn-gold")} data-cursor="Enter">
                        <Eye size={14} aria-hidden /> Take Virtual Tour of this Residence
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-[11px] text-ivory/60">*Illustrative pricing, excluding GST & other charges.</p>
              <Link href="/contact" className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gold">
                Speak to a relationship manager <ArrowRight size={14} aria-hidden />
              </Link>
            </motion.aside>
        )}
      </AnimatePresence>
    </section>
  );
}

function FloorTooltip({ info }: { info: FloorInfo }) {
  const lbl = floorLabel(info.floor);
  if (!isResidential(info)) {
    return (
      <>
        <p className="font-serif text-2xl">{lbl.name.split(" · ")[0]}</p>
        <p className="mt-1 text-sm text-gold">{info.label}</p>
      </>
    );
  }
  const avail = info.units.filter((u) => u.status === "Available").length;
  return (
    <>
      <div className="flex items-baseline justify-between">
        <p className="font-serif text-2xl">{info.kind === "penthouse" ? "Penthouse · 42" : lbl.name}</p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/70">{info.units.length} units</p>
      </div>
      <ul className="mt-3 space-y-1.5 text-xs">
        {info.units.map((u) => (
          <li key={u.id} className="flex items-center justify-between gap-2">
            <span className="text-ivory/85">
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
  // Booked grey is lightened for text contrast on the dark panel.
  const color = status === "Booked" ? "#A8A39D" : statusColors[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.15em]" style={{ borderColor: color, color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {status}
    </span>
  );
}

/**
 * Swipe-down-to-dismiss handle for the bottom sheet. Kept separate from framer's `drag`
 * (which would fight the sheet's enter/exit animation and its inner scrolling).
 */
function SheetHandle({ onDismiss }: { onDismiss: () => void }) {
  const start = useRef<number | null>(null);
  return (
    <div
      aria-hidden
      className="-mx-6 -mt-3 mb-3 flex h-8 shrink-0 cursor-grab touch-none items-center justify-center"
      onPointerDown={(e) => {
        start.current = e.clientY;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      }}
      onPointerUp={(e) => {
        if (start.current !== null && e.clientY - start.current > 60) onDismiss();
        start.current = null;
      }}
      onPointerCancel={() => (start.current = null)}
    >
      <span className="block h-1 w-12 rounded-full bg-ivory/30" />
    </div>
  );
}
