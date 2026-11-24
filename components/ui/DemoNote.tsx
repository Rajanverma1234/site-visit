import type { ReactNode } from "react";
import { IS_DEMO } from "@/lib/site";

/** Renders its children only while NEXT_PUBLIC_IS_DEMO is on (the default). */
export function DemoOnly({ children }: { children: ReactNode }) {
  return IS_DEMO ? <>{children}</> : null;
}

/** Footnote for every "Starting from ₹X*" price. */
export function PriceNote({ className }: { className?: string }) {
  return (
    <span className={className}>
      {IS_DEMO ? "*Illustrative demo pricing. Excludes GST, stamp duty & other charges." : "*Excludes GST, stamp duty & other charges. Prices subject to change."}
    </span>
  );
}
