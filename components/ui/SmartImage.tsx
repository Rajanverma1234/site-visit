"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * next/image with a graceful fallback: a warm gradient sits behind the image at all times,
 * so while it loads — or if Unsplash is unreachable — the layout still looks intentional.
 */
export default function SmartImage({ className, wrapperClassName, alt, ...props }: ImageProps & { wrapperClassName?: string }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-gradient-to-br from-charcoal-600 via-[#2b251c] to-[#4a3d26]", wrapperClassName)}>
      {/* Decorative fallback pattern */}
      <div aria-hidden className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_30%_20%,rgba(200,169,106,.35),transparent_55%),radial-gradient(circle_at_80%_90%,rgba(245,241,234,.12),transparent_50%)]" />
      {failed ? (
        <span role="img" aria-label={alt} className="absolute inset-0 flex items-end p-4 text-[10px] uppercase tracking-luxe text-gold/60">
          {alt}
        </span>
      ) : (
        <Image
          alt={alt}
          {...props}
          className={cn("object-cover transition-opacity duration-700", loaded ? "opacity-100" : "opacity-0", className)}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
