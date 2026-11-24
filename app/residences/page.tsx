import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { residences } from "@/data/residences";
import { project } from "@/data/project";
import { formatArea } from "@/lib/format";
import { inventorySummary } from "@/data/inventory";
import ResidenceCard from "@/components/residences/ResidenceCard";
import EmiCalculator from "@/components/residences/EmiCalculator";
import { Reveal, RevealText } from "@/components/ui/Reveal";
import { PriceNote } from "@/components/ui/DemoNote";

export const metadata: Metadata = {
  title: "Residences",
  description: `Ultra-luxury ${residences.map((r) => `${r.type} (${formatArea(r.area)})`).join(", ")} residences at ${project.shortName}, ${project.location}.`,
};

export default function ResidencesPage() {
  const inv = inventorySummary();
  return (
    <>
      <section className="relative bg-charcoal pb-24 pt-40 md:pt-48">
        <div className="container-luxe">
          <Reveal>
            <p className="eyebrow">Residences</p>
          </Reveal>
          <RevealText as="h1" lines={["Three ways to live", "above it all."]} className="mt-5 text-5xl leading-[1] md:text-8xl" />
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-xl text-ivory/60">
              {inv.total} residences across two towers. Currently {inv.available} available, {inv.onHold} on hold. Every home is a corner home with a private lift lobby.
            </p>
          </Reveal>

          <Reveal className="mt-16 grid gap-6 md:grid-cols-3" stagger={0.15}>
            {residences.map((r, i) => (
              <div data-reveal key={r.slug}>
                <ResidenceCard residence={r} index={i} />
              </div>
            ))}
          </Reveal>
          <PriceNote className="mt-5 block text-xs text-ivory/65" />
        </div>
      </section>

      <section id="emi" className="bg-ivory py-28 text-charcoal md:py-36">
        <div className="container-luxe">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow !text-gold-dark">Plan your purchase</p>
              <h2 className="mt-5 text-5xl leading-[1] md:text-7xl">EMI calculator</h2>
            </div>
            <Link href="/contact" className="btn-ghost-dark self-start md:self-auto">
              Talk to our finance desk <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
          <EmiCalculator />
        </div>
      </section>
    </>
  );
}
