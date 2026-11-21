"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { amenities } from "@/data/amenities";
import { places } from "@/data/locations";
import { company, project, stats } from "@/data/project";
import { residences } from "@/data/residences";
import { formatArea, formatINR } from "@/lib/format";
import Logo from "@/components/ui/Logo";

/**
 * Print-friendly brochure generated from /data on the fly.
 * "Download" = the browser's print dialog → Save as PDF.
 */
export default function Brochure() {
  const params = useSearchParams();
  const autoPrint = params.get("print") === "1";

  useEffect(() => {
    if (!autoPrint) return;
    const t = setTimeout(() => window.print(), 900);
    return () => clearTimeout(t);
  }, [autoPrint]);

  return (
    <div className="min-h-screen bg-[#e9e5de] py-10 text-charcoal print:bg-white print:py-0">
      <div className="no-print mx-auto mb-8 flex max-w-[210mm] items-center justify-between px-4">
        <Link href="/contact" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-charcoal/70 hover:text-gold-dark">
          <ArrowLeft size={14} aria-hidden /> Back
        </Link>
        <button type="button" onClick={() => window.print()} className="btn-gold">
          <Printer size={14} aria-hidden /> Save as PDF / Print
        </button>
      </div>

      {/* Page 1 — cover */}
      <article className="print-page mx-auto flex aspect-[210/297] max-w-[210mm] flex-col justify-between bg-charcoal p-[14mm] text-ivory shadow-2xl print:shadow-none" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
        <Logo />
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">{project.location}</p>
          <h1 className="mt-4 font-serif text-[64px] font-light leading-[0.9]">
            THE
            <br />
            SOVEREIGN
          </h1>
          <div className="mt-6 h-px w-20 bg-gold" />
          <p className="mt-6 max-w-[120mm] font-serif text-xl italic text-ivory/80">{project.headline}</p>
          <p className="mt-6 max-w-[140mm] text-sm leading-relaxed text-ivory/70">{project.intro}</p>
        </div>
        <div className="grid grid-cols-4 border-t border-white/15 pt-6">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-serif text-4xl">{s.value}</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-gold">{s.label}</p>
            </div>
          ))}
        </div>
      </article>

      {/* Page 2 — residences & amenities */}
      <article className="print-page mx-auto mt-10 flex aspect-[210/297] max-w-[210mm] flex-col bg-ivory p-[14mm] shadow-2xl print:mt-0 print:shadow-none" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold-dark">Residences</p>
        <h2 className="mt-3 font-serif text-4xl">Three ways to live above it all.</h2>
        <table className="mt-8 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-charcoal/30 text-[9px] uppercase tracking-[0.2em] text-stone">
              <th className="py-2 font-normal">Type</th>
              <th className="py-2 font-normal">Super area</th>
              <th className="py-2 font-normal">Bedrooms</th>
              <th className="py-2 font-normal">Parking</th>
              <th className="py-2 text-right font-normal">Starting price</th>
            </tr>
          </thead>
          <tbody>
            {residences.map((r) => (
              <tr key={r.slug} className="border-b border-charcoal/10">
                <td className="py-3 font-serif text-xl">{r.type}</td>
                <td className="py-3">{formatArea(r.area)}</td>
                <td className="py-3">{r.bedrooms}</td>
                <td className="py-3">{r.parking}</td>
                <td className="py-3 text-right font-serif text-lg text-gold-dark">{r.priceFrom ? formatINR(r.priceFrom) : "On request"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-12 text-[10px] uppercase tracking-[0.4em] text-gold-dark">Amenities</p>
        <ul className="mt-4 grid grid-cols-3 gap-x-6 gap-y-4 text-sm">
          {amenities.map((a) => (
            <li key={a.title}>
              <p className="font-serif text-lg leading-tight">{a.title}</p>
              <p className="text-[11px] text-stone">{a.kicker}</p>
            </li>
          ))}
        </ul>

        <p className="mt-12 text-[10px] uppercase tracking-[0.4em] text-gold-dark">Connectivity</p>
        <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          {places.map((p) => (
            <li key={p.id} className="flex justify-between border-b border-charcoal/10 py-1.5">
              <span>{p.name}</span>
              <span className="font-serif text-gold-dark">{p.distance}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-end justify-between border-t border-charcoal/15 pt-6 text-xs">
          <div>
            <p className="font-serif text-lg">{company.name}</p>
            <p className="text-stone">
              {company.phone} · {company.email}
            </p>
            <p className="text-stone">
              Possession {project.possession} · RERA {project.rera} (demo)
            </p>
          </div>
          <p className="max-w-[70mm] text-right text-[10px] text-stone">{company.disclaimer}</p>
        </div>
      </article>
    </div>
  );
}
