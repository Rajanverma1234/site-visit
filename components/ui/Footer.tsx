import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { company, navLinks, project } from "@/data/project";
import Logo from "./Logo";
import { socialIconMap } from "./SocialIcons";
import { DemoOnly } from "./DemoNote";
import { BrochureButton } from "./BrochureRequest";

export default function Footer() {
  return (
    <footer className="no-print relative border-t border-white/5 bg-charcoal pb-10 pt-20">
      <div className="container-luxe">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-6 max-w-sm font-serif text-2xl italic text-ivory/80">{company.tagline}</p>
            <div className="mt-8 flex gap-3">
              {company.socials.map((s) => {
                const Icon = socialIconMap[s.label as keyof typeof socialIconMap];
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${company.name} on ${s.label} (opens in a new tab)`}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/15 text-ivory/70 transition-colors hover:border-gold hover:text-gold"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-3">
            <h2 className="eyebrow mb-5 !font-sans">Explore</h2>
            <ul className="space-y-3 text-sm text-ivory/70">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-gold">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <BrochureButton className="text-left hover:text-gold">Download Brochure</BrochureButton>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h2 className="eyebrow mb-5 !font-sans">Sales Gallery</h2>
            <ul className="space-y-4 text-sm text-ivory/70">
              <li className="flex gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gold" aria-hidden />
                {company.address}
              </li>
              <li className="flex gap-3">
                <Phone size={16} className="mt-0.5 shrink-0 text-gold" aria-hidden />
                <a href={`tel:${company.phoneE164}`} className="hover:text-gold">
                  {company.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 text-gold" aria-hidden />
                <a href={`mailto:${company.email}`} className="hover:text-gold">
                  {company.email}
                </a>
              </li>
            </ul>
            <p className="mt-6 text-xs text-stone">
              RERA: {project.rera} <DemoOnly><span className="text-ivory/60"> ({project.reraNote})</span></DemoOnly>
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/5 pt-8 text-xs text-stone md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {company.name}. All rights reserved.</p>
          <DemoOnly><p className="max-w-xl md:text-right">{company.disclaimer}</p></DemoOnly>
        </div>
      </div>
    </footer>
  );
}
