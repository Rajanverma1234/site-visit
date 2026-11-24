"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useId, useState, type ReactNode } from "react";
import { Download, FileText, LoaderCircle } from "lucide-react";
import { countries, getCountry } from "@/data/countries";
import { project } from "@/data/project";
import { brochureSchema, phoneError, submitLead } from "@/lib/lead";
import { cn } from "@/lib/utils";
import Modal from "./Modal";
import { DemoOnly } from "./DemoNote";

/** TODO(client): replace with the approved brochure PDF (same path, or update here). */
export const BROCHURE_PDF = "/brochure/the-sovereign-brochure.pdf";

type Input = z.input<typeof brochureSchema>;
const base = zodResolver(brochureSchema);
const resolver: Resolver<Input> = async (v, c, o) => {
  const r = await base(v, c, o);
  const pErr = v.phone && !r.errors.phone ? phoneError(v.country, v.phone) : null;
  return pErr ? { values: {}, errors: { ...r.errors, phone: { type: "pattern", message: pErr } } } : r;
};

/** Button that opens the lead-gated brochure request. Style it like any button via className. */
export function BrochureButton({ className, children }: { className?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)} data-cursor="Download">
        {children}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Download the brochure" className="max-w-xl">
        <BrochureForm />
      </Modal>
    </>
  );
}

function BrochureForm() {
  const uid = useId();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Input>({ resolver, mode: "onTouched", defaultValues: { country: "IN", website: "" } });
  const country = getCountry(watch("country") || "IN");

  if (done) {
    return (
      <div className="py-4 text-center" role="status">
        <FileText className="mx-auto text-gold-dark" size={40} strokeWidth={1.2} aria-hidden />
        <h3 className="mt-4 text-4xl">Your brochure is ready.</h3>
        <p className="mt-3 text-charcoal/75">Thank you. A relationship manager may follow up with pricing and availability.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={BROCHURE_PDF} target="_blank" rel="noopener" className="btn-gold">
            <Download size={14} aria-hidden /> Open PDF brochure
          </a>
          <a href="/brochure" className="btn-ghost-dark">
            View online
          </a>
        </div>
        <DemoOnly>
          <p className="mt-6 text-xs text-charcoal/70">Demo: placeholder brochure generated from the website data.</p>
        </DemoOnly>
      </div>
    );
  }

  const input = "input-luxe text-charcoal";
  const label = "block text-[11px] uppercase tracking-[0.2em] text-charcoal/70";
  const err = (k: keyof Input) =>
    errors[k] ? (
      <p id={`${uid}-${k}-err`} className="mt-1.5 text-xs text-[#a3372a]">
        {errors[k]?.message}
      </p>
    ) : null;

  return (
    <form
      noValidate
      aria-busy={isSubmitting}
      onSubmit={handleSubmit(async (v) => {
        setError(null);
        try {
          await submitLead({ type: "brochure", ...(v as z.output<typeof brochureSchema>) });
          setDone(true);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
        }
      })}
    >
      <p className="eyebrow !text-gold-dark">{project.shortName}</p>
      <h3 className="mt-2 text-4xl">Download the brochure</h3>
      <p className="mt-2 text-sm text-charcoal/75">Tell us where to reach you and the brochure opens instantly.</p>
      <div className="mt-8 grid gap-6">
        <div>
          <label htmlFor={`${uid}-name`} className={label}>Full name</label>
          <input id={`${uid}-name`} autoComplete="name" className={input} {...register("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? `${uid}-name-err` : undefined} />
          {err("name")}
        </div>
        <div>
          <label htmlFor={`${uid}-phone`} className={label}>Mobile number</label>
          <div className="flex items-end gap-3">
            <label htmlFor={`${uid}-country`} className="sr-only">Country code</label>
            <select id={`${uid}-country`} className={cn(input, "w-[7.5rem] shrink-0 appearance-none truncate")} {...register("country")}>
              <CountryOptions />
            </select>
            <input id={`${uid}-phone`} type="tel" inputMode="tel" autoComplete="tel-national" placeholder={country.example} className={input} {...register("phone")} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? `${uid}-phone-err` : undefined} />
          </div>
          {err("phone")}
        </div>
        <div>
          <label htmlFor={`${uid}-email`} className={label}>Email</label>
          <input id={`${uid}-email`} type="email" autoComplete="email" className={input} {...register("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? `${uid}-email-err` : undefined} />
          {err("email")}
        </div>
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Website <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
          </label>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-5 border border-[#a3372a]/40 bg-[#a3372a]/5 p-3 text-sm text-[#a3372a]">
          {error}
        </p>
      )}
      <button type="submit" className="btn-gold mt-8 w-full disabled:cursor-wait disabled:opacity-80" disabled={isSubmitting}>
        {isSubmitting ? <LoaderCircle size={16} className="animate-spin" aria-hidden /> : <Download size={14} aria-hidden />}
        {isSubmitting ? "Preparing your brochure…" : "Get the brochure"}
      </button>
      <DemoOnly>
        <p className="mt-4 text-center text-xs text-charcoal/70">Demo form — details are only logged unless an email provider is configured.</p>
      </DemoOnly>
    </form>
  );
}

/** Country-code <option>s with the priority NRI markets first. Shared by both lead forms. */
export function CountryOptions() {
  return (
    <>
      <optgroup label="Popular">
        {countries
          .filter((c) => c.priority)
          .map((c) => (
            <option key={c.iso} value={c.iso}>
              {c.dial} {c.name}
            </option>
          ))}
      </optgroup>
      <optgroup label="All countries">
        {countries
          .filter((c) => !c.priority)
          .map((c) => (
            <option key={c.iso} value={c.iso}>
              {c.dial} {c.name}
            </option>
          ))}
      </optgroup>
    </>
  );
}
