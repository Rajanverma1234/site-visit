import { MapPin } from "lucide-react";
import { about } from "@/data/about";
import Counter from "@/components/ui/Counter";
import SmartImage from "@/components/ui/SmartImage";
import { DemoOnly } from "@/components/ui/DemoNote";
import { Reveal, RevealText } from "@/components/ui/Reveal";

/** "About White Collar Realty": story, stat counters and past projects (fictional demo content). */
export default function About() {
  return (
    <section id="about" className="bg-ivory py-24 text-charcoal md:py-32">
      <div className="container-luxe">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <Reveal>
              <p className="eyebrow !text-gold-dark">{about.title}</p>
            </Reveal>
            <RevealText lines={["Fewer buildings.", "Better ones."]} className="mt-5 text-5xl leading-[1] md:text-7xl" />
            <DemoOnly>
              <p className="mt-6 inline-block border border-charcoal/25 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-charcoal/75">Fictional developer · demo content</p>
            </DemoOnly>
          </div>
          <Reveal>
            {about.story.map((p) => (
              <p key={p.slice(0, 20)} className="mb-5 max-w-2xl text-lg leading-relaxed text-charcoal/80">
                {p}
              </p>
            ))}
          </Reveal>
        </div>

        <div className="mt-16 grid grid-cols-2 border-y border-charcoal/15 md:grid-cols-4">
          {about.stats.map((s, i) => (
            <div key={s.label} className={`px-4 py-10 md:px-8 ${i % 2 === 1 ? "border-l" : ""} ${i > 0 ? "md:border-l" : ""} border-charcoal/15`}>
              <Counter value={s.value} decimals={"decimals" in s ? s.decimals : 0} suffix={s.suffix} className="font-serif text-5xl font-light md:text-7xl" />
              <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-gold-dark">{s.label}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-20 font-serif text-3xl">Selected past projects</h3>
        <Reveal className="mt-8 grid gap-6 md:grid-cols-3" stagger={0.12}>
          {about.projects.map((p) => (
            <article data-reveal key={p.name} className="group">
              <div className="relative aspect-[4/3] overflow-hidden">
                <SmartImage
                  src={p.image}
                  alt={`${p.name}, ${p.location} (illustrative photo)`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  wrapperClassName="absolute inset-0"
                  className="transition-transform duration-[1.6s] ease-luxe group-hover:scale-105"
                />
              </div>
              <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-gold-dark">{p.year}</p>
              <h4 className="mt-1 font-serif text-2xl">{p.name}</h4>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-charcoal/75">
                <MapPin size={13} aria-hidden /> {p.location} · {p.detail}
              </p>
            </article>
          ))}
        </Reveal>
        <DemoOnly>
          <p className="mt-6 text-xs text-charcoal/70">Company history, figures and projects are fictional and for demonstration only. Photos are illustrative stock images.</p>
        </DemoOnly>
      </div>
    </section>
  );
}
