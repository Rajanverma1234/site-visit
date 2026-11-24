"use client";

import Image from "next/image";
import { useState } from "react";
import type { ImageSlot } from "@/data/images";
import { cn } from "@/lib/utils";

/**
 * Renders an image slot from data/images.ts:
 *  - reserves the slot's aspect ratio (or fills its parent with `cover`), so any real photo fits
 *  - next/image with blur placeholder, AVIF/WebP and lazy loading (unless `priority`)
 *  - "Illustrative image" tag while `placeholder: true`
 *  - a styled fallback if the file is missing (`src: null`) or fails to load
 */
export default function SlotImage({
  slot,
  sizes,
  priority = false,
  cover = false,
  className,
  imgClassName,
  tag = true,
  tagPosition = "bottom-right",
}: {
  slot: ImageSlot;
  /** Required for responsive images, e.g. "(max-width: 768px) 100vw, 33vw". */
  sizes: string;
  priority?: boolean;
  /** Fill the (positioned) parent instead of reserving the slot's aspect ratio. */
  cover?: boolean;
  className?: string;
  imgClassName?: string;
  tag?: boolean;
  tagPosition?: "bottom-right" | "top-right" | "top-left";
}) {
  const [failed, setFailed] = useState(false);
  const showImage = slot.src && !failed;

  return (
    <div
      className={cn("relative overflow-hidden bg-gradient-to-br from-charcoal-600 via-[#2b251c] to-[#4a3d26]", cover && "absolute inset-0", className)}
      style={cover ? undefined : { aspectRatio: slot.aspectRatio }}
    >
      {showImage ? (
        <Image
          src={slot.src!}
          alt={slot.alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={72}
          placeholder={slot.blurDataURL ? "blur" : "empty"}
          blurDataURL={slot.blurDataURL}
          className={cn("object-cover", imgClassName)}
          onError={() => setFailed(true)}
        />
      ) : (
        <span role="img" aria-label={slot.alt} className="absolute inset-0 flex items-end p-4 text-[10px] uppercase tracking-luxe text-gold/70">
          <span aria-hidden className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_30%_20%,rgba(200,169,106,.35),transparent_55%)]" />
          <span className="relative">{slot.alt}</span>
        </span>
      )}
      {slot.placeholder && tag && <IllustrativeTag position={tagPosition} />}
    </div>
  );
}

export function IllustrativeTag({ position = "bottom-right" }: { position?: "bottom-right" | "top-right" | "top-left" }) {
  const pos = position === "top-right" ? "right-3 top-3" : position === "top-left" ? "left-3 top-3" : "bottom-3 right-3";
  return (
    <span className={cn("pointer-events-none absolute z-[2] rounded-full bg-charcoal/75 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.18em] text-ivory/90 backdrop-blur-sm", pos)}>
      Illustrative image
    </span>
  );
}
