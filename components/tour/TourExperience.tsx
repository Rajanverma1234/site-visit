"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { CalendarCheck, CircleHelp, Map as MapIcon, Maximize, Minimize, Moon, MousePointer2, Move, Sun, Volume2, VolumeX, X, ZoomIn, Hand, Footprints, Sparkles } from "lucide-react";
import { STYLE_LABELS, getTourRoom, tourRooms, type InteriorStyle, type RoomId } from "@/data/tour";
import { findUnit } from "@/data/inventory";
import { formatArea, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useIsTouch, useReducedMotion } from "@/hooks/useMediaQuery";
import Image from "next/image";
import { images } from "@/data/images";
import { LoadingChip } from "@/components/ui/LazyScene";
import Logo from "@/components/ui/Logo";
import Minimap from "./Minimap";
import { createAmbient, type Ambient } from "./ambientSound";

const TourCanvas = dynamic(() => import("@/components/three/Apartment"), {
  ssr: false,
  loading: () => <LoadingChip label="Unlocking residence" className="!bottom-auto !left-1/2 !top-1/2 -translate-x-1/2 -translate-y-1/2" />,
});

const HELP_KEY = "wcr-tour-help-seen";

export default function TourExperience() {
  const params = useSearchParams();
  const unit = params.get("unit") ? findUnit(params.get("unit")!) : undefined;
  const initialRoom = (tourRooms.find((r) => r.id === params.get("room"))?.id ?? "living") as RoomId;

  const [room, setRoom] = useState<RoomId>(initialRoom);
  const [night, setNight] = useState(params.get("mode") === "night");
  const [style, setStyle] = useState<InteriorStyle>("modern");
  const [sound, setSound] = useState(false);
  const [help, setHelp] = useState(false);
  const [moving, setMoving] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const touch = useIsTouch();
  const reducedMotion = useReducedMotion();
  const container = useRef<HTMLDivElement>(null);
  const ambient = useRef<Ambient | null>(null);

  // Camera glides must arrive on time even on slow GPUs: disable GSAP's lag smoothing
  // (which would otherwise stretch tweens when frames take long) while the tour is open.
  useEffect(() => {
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.lagSmoothing(500, 33);
  }, []);

  // First-visit help overlay
  useEffect(() => {
    try {
      if (!localStorage.getItem(HELP_KEY)) setHelp(true);
    } catch {
      setHelp(true);
    }
  }, []);
  const closeHelp = () => {
    setHelp(false);
    try {
      localStorage.setItem(HELP_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  // Keyboard shortcuts: 1–7 rooms, N night, H help, F fullscreen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.metaKey || e.ctrlKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= tourRooms.length) setRoom(tourRooms[n - 1].id);
      if (e.key.toLowerCase() === "n") setNight((v) => !v);
      if (e.key.toLowerCase() === "h" || e.key === "?") setHelp((v) => !v);
      if (e.key === "Escape") setHelp(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Fullscreen state
  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) container.current?.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  };

  // Ambient sound (created lazily on first user gesture — browsers require it)
  const toggleSound = () => {
    if (!ambient.current) ambient.current = createAmbient();
    if (!ambient.current) return;
    if (sound) ambient.current.stop();
    else ambient.current.start();
    setSound(!sound);
  };
  useEffect(() => () => ambient.current?.dispose(), []);

  const onMoving = useCallback((m: boolean) => setMoving(m), []);
  const current = getTourRoom(room);

  return (
    <div ref={container} className="fixed inset-0 overflow-hidden bg-charcoal" data-lenis-prevent>
      {/* Real render of the living room sits behind the (transparent) canvas until the 3D draws over it. */}
      <Image src={images.posters.virtualTour.src!} alt="" fill priority sizes="100vw" quality={65} className="object-cover" />
      <div className="absolute inset-0" data-cursor="Drag">
        <TourCanvas room={room} night={night} style={style} touch={touch} reducedMotion={reducedMotion} onRoomChange={setRoom} onMoving={onMoving} />
      </div>

      {/* Top-left: brand, exit, room title */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 p-4 md:p-6">
        <div className="pointer-events-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 rounded-full border border-white/15 bg-charcoal/60 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-ivory backdrop-blur-md hover:border-gold" data-cursor="Exit">
            <X size={13} aria-hidden /> Exit Tour
          </Link>
          <span className="hidden md:inline-block">
            <Logo compact />
          </span>
        </div>
        <div className="mt-[72px] md:mt-8" aria-live="polite">
          <p className="text-[10px] uppercase tracking-luxe text-gold">
            {unit ? `Residence ${unit.id}` : "4 BHK Residence"} · {moving ? "Walking…" : "You are in"}
          </p>
          <AnimatePresence mode="wait">
            <motion.h1 key={room} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5 }} className="mt-1 text-3xl text-ivory drop-shadow-lg md:text-5xl">
              {current.name}
            </motion.h1>
          </AnimatePresence>
          {unit && (
            <p className="mt-2 text-xs text-ivory/70 drop-shadow">
              Tower {unit.tower} · Floor {unit.floor} · {unit.configuration} · {formatArea(unit.carpetArea)} carpet · {unit.facing} · {unit.price ? formatINR(unit.price) : "Price on request"}
            </p>
          )}
        </div>
      </div>

      {/* Top-right: controls */}
      <div className="absolute right-0 top-0 z-10 flex flex-col items-end gap-2 p-4 md:p-6">
        <div className="flex gap-2">
          <IconBtn label={night ? "Switch to day" : "Switch to night"} onClick={() => setNight((v) => !v)} active={night}>
            {night ? <Moon size={16} /> : <Sun size={16} />}
          </IconBtn>
          <IconBtn label={sound ? "Mute ambient sound" : "Play ambient sound"} onClick={toggleSound} active={sound}>
            {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </IconBtn>
          <IconBtn label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"} onClick={toggleFullscreen}>
            {fullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </IconBtn>
          <IconBtn label="Show controls help" onClick={() => setHelp(true)}>
            <CircleHelp size={16} />
          </IconBtn>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-charcoal/60 p-1 backdrop-blur-md" role="radiogroup" aria-label="Interior style">
          {(Object.keys(STYLE_LABELS) as InteriorStyle[]).map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={style === s}
              onClick={() => setStyle(s)}
              className={cn("rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] transition-colors md:px-4", style === s ? "bg-gold text-charcoal" : "text-ivory/70 hover:text-ivory")}
            >
              {STYLE_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-charcoal/60 px-3 py-1.5 text-[10px] md:flex uppercase tracking-[0.18em] text-ivory/70 backdrop-blur-md">
          <Sparkles size={12} className="text-gold" aria-hidden /> {night ? "Evening" : "Afternoon"} light
        </div>
      </div>

      {/* Bottom-left: mini floor plan */}
      <div className="absolute bottom-24 left-4 z-10 w-[260px] md:bottom-6 md:left-6 md:w-[300px]">
        <button type="button" onClick={() => setPlanOpen((v) => !v)} className="mb-2 flex items-center gap-2 rounded-full border border-white/15 bg-charcoal/60 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-ivory backdrop-blur md:hidden" aria-expanded={planOpen}>
          <MapIcon size={13} aria-hidden /> Plan
        </button>
        <Minimap onSelect={setRoom} className={cn(planOpen ? "block" : "hidden", "md:block")} />
      </div>

      {/* Bottom-centre: room switcher */}
      <nav aria-label="Rooms" className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4 md:bottom-6 md:pl-[340px] md:pr-[230px] 2xl:px-4">
        <ol className="no-scrollbar pointer-events-auto flex max-w-full gap-1 overflow-x-auto rounded-full border border-white/10 bg-charcoal/70 p-1.5 backdrop-blur-xl">
          {tourRooms.map((r, i) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setRoom(r.id)}
                aria-current={room === r.id ? "location" : undefined}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-[11px] tracking-wide transition-all duration-500 md:px-4",
                  room === r.id ? "bg-gold text-charcoal" : "text-ivory/75 hover:bg-white/10 hover:text-ivory",
                )}
                data-cursor="Go"
              >
                <span className={cn("font-serif text-sm", room === r.id ? "text-charcoal/70" : "text-gold")}>{i + 1}</span>
                {r.short}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* Bottom-right: persistent CTA */}
      <div className="absolute bottom-20 right-4 z-10 hidden md:bottom-6 md:right-6 md:block">
        <Link href={`/contact?mode=site${unit ? `&unit=${unit.id}` : ""}`} className="btn-gold shadow-2xl" data-cursor="Book">
          <CalendarCheck size={14} aria-hidden /> Book Site Visit
        </Link>
      </div>
      <Link href={`/contact?mode=site${unit ? `&unit=${unit.id}` : ""}`} className="btn-gold absolute bottom-[72px] right-4 z-10 !px-4 !py-2 !text-[10px] md:hidden">
        <CalendarCheck size={12} aria-hidden /> Book Visit
      </Link>

      {/* Help overlay */}
      <AnimatePresence>
        {help && (
          <motion.div className="absolute inset-0 z-30 flex items-center justify-center bg-charcoal/75 p-6 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-labelledby="tour-help-title">
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-xl border border-gold/30 bg-charcoal/90 p-8 md:p-10">
              <p className="eyebrow">Welcome to The Sovereign</p>
              <h2 id="tour-help-title" className="mt-3 text-4xl md:text-5xl">
                How to explore
              </h2>
              <span className="gold-line my-6 block" />
              <ul className="grid gap-5 text-sm text-ivory/80 sm:grid-cols-2">
                {(touch
                  ? [
                      [Hand, "Drag", "Swipe to look around the room"],
                      [Footprints, "Gold circles", "Tap a circle on the floor to walk there"],
                      [MousePointer2, "Feature dots", "Tap a glowing dot for details"],
                      [MapIcon, "Rooms & plan", "Jump anywhere from the bar below"],
                    ]
                  : [
                      [MousePointer2, "Move your mouse", "Gently look around the room"],
                      [Move, "Click & drag", "Turn freely in any direction"],
                      [ZoomIn, "Scroll", "Zoom in for a closer look"],
                      [Footprints, "Gold circles", "Click a circle on the floor to walk there"],
                      [Sparkles, "Hover features", "Glowing dots reveal finishes & brands"],
                      [MapIcon, "Keys 1–7 / plan", "Jump between rooms instantly"],
                    ]
                ).map(([Icon, title, text]) => {
                  const I = Icon as typeof Hand;
                  return (
                    <li key={title as string} className="flex gap-3">
                      <I size={18} className="mt-0.5 shrink-0 text-gold" aria-hidden />
                      <span>
                        <span className="block text-ivory">{title as string}</span>
                        <span className="text-ivory/60">{text as string}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <button type="button" onClick={closeHelp} className="btn-gold mt-8 w-full" autoFocus data-cursor="Enter">
                Begin the tour
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IconBtn({ children, label, onClick, active }: { children: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-colors",
        active ? "border-gold bg-gold/20 text-gold" : "border-white/15 bg-charcoal/60 text-ivory hover:border-gold hover:text-gold",
      )}
    >
      {children}
    </button>
  );
}
