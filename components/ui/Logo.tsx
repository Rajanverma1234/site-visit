import { cn } from "@/lib/utils";

/** Gold wordmark with a minimalist crest. */
export default function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-3 text-gold", className)}>
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect x="1" y="1" width="30" height="30" stroke="currentColor" strokeWidth="1" />
        <path d="M8 24V11l4 6 4-9 4 9 4-6v13" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M8 26.5h16" stroke="currentColor" strokeWidth="1" />
      </svg>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-serif text-[15px] font-medium tracking-[0.28em]">WHITE COLLAR</span>{" "}
          <span className="mt-1 text-[8.5px] tracking-[0.62em] text-gold/80">REALTY</span>
        </span>
      )}
    </span>
  );
}
