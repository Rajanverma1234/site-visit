import Logo from "./Logo";

/** Elegant loader shown while a 3D canvas chunk / scene loads: logo + thin gold progress line. */
export default function SceneLoader({ label = "Preparing your private viewing" }: { label?: string }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-charcoal" role="status" aria-live="polite">
      <Logo />
      <div className="relative h-px w-48 overflow-hidden bg-ivory/10">
        <div className="animate-shimmer absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-gold to-transparent" />
      </div>
      <p className="text-[10px] uppercase tracking-luxe text-stone">{label}</p>
    </div>
  );
}
