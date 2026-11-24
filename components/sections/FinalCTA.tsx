import { company } from "@/data/project";
import { Reveal, RevealText } from "@/components/ui/Reveal";
import LeadForm from "@/components/ui/LeadForm";

/** "Your Private Viewing Awaits" + lead form. */
export default function FinalCTA() {
  return (
    <section id="contact" className="relative overflow-hidden bg-charcoal py-28 md:py-40">
      <div aria-hidden className="pointer-events-none absolute -right-40 top-0 h-[600px] w-[600px] rounded-full bg-gold/10 blur-[140px]" />
      <div className="container-luxe relative grid gap-16 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <Reveal>
            <p className="eyebrow">By appointment</p>
          </Reveal>
          <RevealText lines={["Your private", "viewing awaits."]} className="mt-5 text-5xl leading-[1] md:text-7xl" />
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-md text-ivory/60">
              Choose a guided video-call walkthrough from anywhere in the world, or a chauffeured site visit to our sales gallery on Golf Course Road.
            </p>
            <a href={`tel:${company.phoneE164}`} className="mt-10 block font-serif text-2xl text-gold hover:text-gold-light">{company.phone}</a>
            <p className="mt-1 text-sm text-ivory/60">{company.email}</p>
          </Reveal>
        </div>
        <Reveal>
          <LeadForm />
        </Reveal>
      </div>
    </section>
  );
}
