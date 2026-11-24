"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Download, Mail, MapPin, Phone, Video } from "lucide-react";
import { company, project } from "@/data/project";
import { findUnit } from "@/data/inventory";
import LeadForm from "@/components/ui/LeadForm";
import { BrochureButton } from "@/components/ui/BrochureRequest";
import Magnetic from "@/components/ui/Magnetic";
import { Reveal, RevealText } from "@/components/ui/Reveal";
import { whatsappLink } from "@/components/ui/WhatsAppButton";
import { WhatsappIcon } from "@/components/ui/SocialIcons";

export default function ContactContent() {
  const params = useSearchParams();
  const mode = params.get("mode") === "site" ? "Site Visit" : "Video Call Tour";
  const unit = params.get("unit") ? findUnit(params.get("unit")!) : undefined;

  return (
    <section className="relative min-h-screen overflow-hidden bg-charcoal pb-28 pt-40 md:pt-48">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-gold/10 blur-[140px]" />
      <div className="container-luxe relative grid gap-16 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <Reveal>
            <p className="eyebrow">Contact</p>
          </Reveal>
          <RevealText as="h1" lines={["Book your", "private viewing."]} className="mt-5 text-5xl leading-[1] md:text-7xl" />
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-md text-ivory/60">
              A relationship manager will walk you through {project.shortName} live over video, or host you at our sales gallery with a chauffeured pick-up.
            </p>
            {unit && (
              <p className="mt-6 inline-block border border-gold/40 px-4 py-2 text-sm text-gold">
                Enquiring about residence {unit.id} · {unit.configuration} · Floor {unit.floor}
              </p>
            )}

            <ul className="mt-12 space-y-5 text-sm">
              <li className="flex items-center gap-4">
                <Phone size={16} className="text-gold" aria-hidden />
                <a href={`tel:${company.phoneE164}`} className="hover:text-gold">
                  {company.phone}
                </a>
              </li>
              <li className="flex items-center gap-4">
                <Mail size={16} className="text-gold" aria-hidden />
                <a href={`mailto:${company.email}`} className="hover:text-gold">
                  {company.email}
                </a>
              </li>
              <li className="flex items-start gap-4">
                <MapPin size={16} className="mt-0.5 text-gold" aria-hidden />
                <span className="text-ivory/70">{company.address}</span>
              </li>
              <li className="flex items-center gap-4">
                <Video size={16} className="text-gold" aria-hidden />
                <span className="text-ivory/70">Video tours available 10 am – 8 pm IST, all days</span>
              </li>
            </ul>

            <div className="mt-12 flex flex-wrap gap-4">
              <Magnetic>
                <BrochureButton className="btn-ghost">
                  <Download size={14} aria-hidden /> Download Brochure
                </BrochureButton>
              </Magnetic>
              <Magnetic>
                <a href={whatsappLink(`Hello ${company.name}, I'd like to book a ${mode.toLowerCase()} of ${project.shortName}${unit ? ` (residence ${unit.id})` : ""}.`)} target="_blank" rel="noopener noreferrer" className="btn-ghost" data-cursor="Chat">
                  <WhatsappIcon width={15} height={15} /> WhatsApp us
                </a>
              </Magnetic>
            </div>
          </Reveal>
        </div>

        <Reveal className="border border-white/10 bg-charcoal-800/60 p-8 backdrop-blur md:p-12">
          <LeadForm defaultMode={mode} defaultInterest={unit?.configuration} unit={unit?.id} />
        </Reveal>
      </div>
    </section>
  );
}
