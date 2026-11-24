"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { forwardRef, useEffect, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Clock, LoaderCircle } from "lucide-react";
import { company, project } from "@/data/project";
import { countries, getCountry, normaliseNational } from "@/data/countries";
import { IST_ZONE, dayShiftText, detectTimeZone, isIndianZone, istSlotToZone, zoneAbbrev, zoneCity } from "@/lib/timezone";
import { cn } from "@/lib/utils";
import { whatsappLink } from "./WhatsAppButton";
import { WhatsappIcon } from "./SocialIcons";
import { DemoOnly } from "./DemoNote";
import Magnetic from "./Magnetic";

/** Viewing slots, always defined in India Standard Time. TODO(client): confirm sales-gallery hours. */
const IST_SLOTS = ["10:00", "11:00", "12:00", "13:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

const localToday = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export const leadSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your full name").max(80, "That name is too long"),
    country: z.string().min(2),
    phone: z.string().trim().min(1, "Enter your mobile number"),
    email: z.string().trim().min(1, "Enter your email address").email("Enter a valid email address"),
    interest: z.enum(["4 BHK", "5 BHK", "Penthouse"], { errorMap: () => ({ message: "Choose a residence type" }) }),
    mode: z.enum(["Video Call Tour", "Site Visit"], { errorMap: () => ({ message: "Choose how you'd like to visit" }) }),
    date: z
      .string()
      .min(1, "Pick a preferred date")
      .refine((v) => v >= localToday(), "Date can't be in the past"),
    time: z.string().min(1, "Pick a preferred time"),
    timeZone: z.string().optional(),
  });

type LeadInput = z.input<typeof leadSchema>;

/**
 * zod skips object-level refinements until every other field is valid, which would hide
 * the phone error until the end. So the country-specific phone check runs here instead.
 */
const baseResolver = zodResolver(leadSchema);
const leadResolver: Resolver<LeadInput> = async (values, context, options) => {
  const result = await baseResolver(values, context, options);
  const c = getCountry(values.country);
  if (values.phone && !result.errors.phone && !c.pattern.test(normaliseNational(values.phone, c))) {
    return {
      values: {},
      errors: { ...result.errors, phone: { type: "pattern", message: `Enter a valid ${c.name} mobile number, e.g. ${c.example}` } },
    };
  }
  return result;
};
type Lead = z.output<typeof leadSchema> & { phoneE164: string };

/** "+44" + "7400123456" → "+447400123456" */
const toE164 = (country: string, phone: string) => {
  const c = getCountry(country);
  return `${c.dial}${normaliseNational(phone, c)}`;
};

export const LEADS_STORAGE_KEY = "wcr-demo-leads";

/**
 * Lead capture form (react-hook-form + zod).
 * Demo: leads are stored in localStorage only. TODO(client): replace `onSubmit` with a CRM / API call.
 */
export default function LeadForm({
  tone = "dark",
  defaultMode,
  defaultInterest,
}: {
  tone?: "dark" | "light";
  defaultMode?: Lead["mode"];
  defaultInterest?: Lead["interest"];
}) {
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;
  const [submitted, setSubmitted] = useState<Lead | null>(null);
  // Browser-only values are set after mount so server and client markup match.
  const [minDate, setMinDate] = useState<string | undefined>(undefined);
  const [tz, setTz] = useState<string>(IST_ZONE);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: leadResolver,
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: { country: "IN", mode: defaultMode ?? "Video Call Tour", interest: defaultInterest, time: "11:00" },
  });

  useEffect(() => {
    setMinDate(localToday());
    const zone = detectTimeZone();
    setTz(zone);
    setValue("timeZone", zone);
  }, [setValue]);

  const mode = watch("mode");
  const date = watch("date");
  const country = getCountry(watch("country") || "IN");
  const showConversion = mode === "Video Call Tour" && !isIndianZone(tz);

  const slotLabel = (slot: string) => {
    if (!showConversion) return `${slot} IST`;
    const local = istSlotToZone(slot, date || undefined, tz);
    return `${slot} IST (${local.time} your time${dayShiftText(local.dayShift)})`;
  };

  const onSubmit = async (values: LeadInput) => {
    const data: Lead = { ...values, phoneE164: toE164(values.country, values.phone) };
    await new Promise((r) => setTimeout(r, 1100)); // simulate a network request
    try {
      const existing = JSON.parse(localStorage.getItem(LEADS_STORAGE_KEY) || "[]");
      existing.push({ ...data, createdAt: new Date().toISOString() });
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(existing));
    } catch {
      /* storage unavailable (private mode) — still show success */
    }
    setSubmitted(data);
  };

  const light = tone === "light";
  const labelCls = cn("block text-[11px] uppercase tracking-[0.2em]", light ? "text-charcoal/70" : "text-ivory/70");
  const inputCls = cn("input-luxe", light ? "text-charcoal" : "text-ivory [color-scheme:dark]");
  const describedBy = (k: string, extra?: string) => [errors[k as keyof typeof errors] ? id(`${k}-err`) : null, extra].filter(Boolean).join(" ") || undefined;

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div key="ok" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-10 text-center" role="status" aria-live="polite">
            <SuccessMark />
            <h3 className="mt-8 text-4xl md:text-5xl">Thank you, {submitted.name.split(" ")[0]}.</h3>
            <p className={cn("mx-auto mt-4 max-w-md", light ? "text-charcoal/75" : "text-ivory/75")}>
              Your {submitted.mode.toLowerCase()} for a {submitted.interest} is requested for{" "}
              {new Date(submitted.date + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long" })} at {submitted.time} IST
              {submitted.mode === "Video Call Tour" && submitted.timeZone && !isIndianZone(submitted.timeZone)
                ? ` (${istSlotToZone(submitted.time, submitted.date, submitted.timeZone).time} in ${zoneCity(submitted.timeZone)})`
                : ""}
              . A relationship manager will call {submitted.phoneE164} to confirm.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                className="btn-gold !bg-[#25D366] !text-charcoal hover:!bg-[#1ebe5a]"
                target="_blank"
                rel="noopener noreferrer"
                href={whatsappLink(
                  `Hello ${company.name}! I'm ${submitted.name}. I've requested a ${submitted.mode} of a ${submitted.interest} at ${project.shortName} on ${submitted.date} at ${submitted.time} IST. My number is ${submitted.phoneE164}.`,
                )}
              >
                <WhatsappIcon width={16} height={16} /> Continue on WhatsApp
              </a>
              <button
                type="button"
                className={light ? "btn-ghost-dark" : "btn-ghost"}
                onClick={() => {
                  reset({ country: submitted.country, mode: submitted.mode, time: "11:00", timeZone: tz });
                  setSubmitted(null);
                }}
              >
                Book another
              </button>
            </div>
            <DemoOnly>
              <p className={cn("mt-6 text-[11px] uppercase tracking-[0.18em]", light ? "text-charcoal/65" : "text-ivory/65")}>Demo: your details were saved only in this browser.</p>
            </DemoOnly>
          </motion.div>
        ) : (
          <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={isSubmitting} className="grid gap-x-8 gap-y-7 md:grid-cols-2">
            <Field label="Full name" htmlFor={id("name")} labelCls={labelCls} error={errors.name?.message} errId={id("name-err")}>
              <input id={id("name")} autoComplete="name" className={inputCls} placeholder="Your name" {...register("name")} aria-invalid={!!errors.name} aria-describedby={describedBy("name")} />
            </Field>

            <Field label="Mobile number" htmlFor={id("phone")} labelCls={labelCls} error={errors.phone?.message} errId={id("phone-err")}>
              <div className="flex items-end gap-3">
                <label htmlFor={id("country")} className="sr-only">
                  Country code
                </label>
                <select id={id("country")} autoComplete="tel-country-code" className={cn(inputCls, "w-[7.5rem] shrink-0 appearance-none truncate pr-1")} {...register("country")}>
                  <optgroup label="Popular">
                    {countries
                      .filter((c) => c.priority)
                      .map((c) => (
                        <option key={c.iso} value={c.iso} className="bg-charcoal text-ivory">
                          {c.dial} {c.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="All countries">
                    {countries
                      .filter((c) => !c.priority)
                      .map((c) => (
                        <option key={c.iso} value={c.iso} className="bg-charcoal text-ivory">
                          {c.dial} {c.name}
                        </option>
                      ))}
                  </optgroup>
                </select>
                <input
                  id={id("phone")}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  className={inputCls}
                  placeholder={country.example}
                  {...register("phone")}
                  aria-invalid={!!errors.phone}
                  aria-describedby={describedBy("phone")}
                />
              </div>
            </Field>

            <Field label="Email" htmlFor={id("email")} labelCls={labelCls} error={errors.email?.message} errId={id("email-err")} className="md:col-span-2">
              <input id={id("email")} type="email" autoComplete="email" className={inputCls} placeholder="you@example.com" {...register("email")} aria-invalid={!!errors.email} aria-describedby={describedBy("email")} />
            </Field>

            <fieldset aria-describedby={describedBy("interest")}>
              <legend className={labelCls}>Interested in</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["4 BHK", "5 BHK", "Penthouse"] as const).map((v) => (
                  <ChipRadio key={v} value={v} light={light} {...register("interest")} />
                ))}
              </div>
              <ErrorText id={id("interest-err")} msg={errors.interest?.message} />
            </fieldset>
            <fieldset>
              <legend className={labelCls}>Preferred mode</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["Video Call Tour", "Site Visit"] as const).map((v) => (
                  <ChipRadio key={v} value={v} light={light} {...register("mode")} />
                ))}
              </div>
              <ErrorText id={id("mode-err")} msg={errors.mode?.message} />
            </fieldset>

            <Field label="Preferred date" htmlFor={id("date")} labelCls={labelCls} error={errors.date?.message} errId={id("date-err")}>
              <input id={id("date")} type="date" min={minDate} className={inputCls} {...register("date")} aria-invalid={!!errors.date} aria-describedby={describedBy("date")} />
            </Field>
            <Field label={showConversion ? "Preferred time (IST · your time)" : "Preferred time (IST)"} htmlFor={id("time")} labelCls={labelCls} error={errors.time?.message} errId={id("time-err")}>
              <select id={id("time")} className={cn(inputCls, "appearance-none")} {...register("time")} aria-describedby={describedBy("time", id("tz-note"))}>
                {IST_SLOTS.map((t) => (
                  <option key={t} value={t} className="bg-charcoal text-ivory">
                    {slotLabel(t)}
                  </option>
                ))}
              </select>
              <p id={id("tz-note")} className={cn("mt-2 flex items-start gap-1.5 text-[12px] leading-snug", light ? "text-charcoal/70" : "text-ivory/70")}>
                <Clock size={12} className="mt-0.5 shrink-0 text-gold" aria-hidden />
                {mode === "Site Visit"
                  ? "Site visits take place in Gurugram, so times are India Standard Time (IST, UTC+5:30)."
                  : showConversion
                    ? `Times are India Standard Time (IST). Your time zone: ${zoneCity(tz)} (${zoneAbbrev(tz)}).`
                    : "Times are India Standard Time (IST, UTC+5:30)."}
              </p>
            </Field>
            <input type="hidden" {...register("timeZone")} />

            <div className="flex flex-col items-start gap-4 pt-2 md:col-span-2 md:flex-row md:items-center md:justify-between">
              <p className={cn("max-w-sm text-xs", light ? "text-charcoal/65" : "text-ivory/65")}>
                By submitting you agree to be contacted about {project.shortName}.
                <DemoOnly> Demo form — nothing is sent anywhere.</DemoOnly>
              </p>
              <Magnetic>
                <button type="submit" className="btn-gold disabled:cursor-wait disabled:opacity-80" disabled={isSubmitting} data-cursor="Send">
                  {isSubmitting ? <LoaderCircle size={16} className="animate-spin" aria-hidden /> : null}
                  {isSubmitting ? "Reserving your slot…" : "Request Private Viewing"}
                  {!isSubmitting && <ArrowRight size={14} aria-hidden />}
                </button>
              </Magnetic>
            </div>
            {Object.keys(errors).length > 1 && (
              <p role="alert" className="text-xs text-[#f08f80] md:col-span-2">
                Please fix the highlighted fields above.
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, htmlFor, labelCls, error, errId, className, children }: { label: string; htmlFor: string; labelCls: string; error?: string; errId: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={labelCls}>
        {label}
      </label>
      {children}
      <ErrorText id={errId} msg={error} />
    </div>
  );
}

function ErrorText({ id, msg }: { id: string; msg?: string }) {
  return (
    <p id={id} aria-live="polite" className={cn("text-xs text-[#f08f80]", msg ? "mt-1.5" : "sr-only")}>
      {msg ?? ""}
    </p>
  );
}

/** Radio styled as a pill chip. */
const ChipRadio = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { light: boolean; value: string }>(function ChipRadio({ light, value, ...rest }, ref) {
  return (
    <label className="cursor-pointer">
      <input ref={ref} type="radio" value={value} className="peer sr-only" {...rest} />
      <span
        className={cn(
          "inline-block rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.15em] transition-colors peer-checked:border-gold peer-checked:bg-gold peer-checked:text-charcoal peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold",
          light ? "border-charcoal/25 text-charcoal/80" : "border-ivory/25 text-ivory/80",
        )}
      >
        {value}
      </span>
    </label>
  );
});

/** Gold animated check mark. */
function SuccessMark() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="mx-auto" aria-hidden>
      <circle cx="48" cy="48" r="44" fill="none" stroke="#C8A96A" strokeWidth="1.5" pathLength={1} className="draw-stroke" style={{ animationDuration: "1s" }} />
      <path d="M30 49 l12 12 l24 -26" fill="none" stroke="#C8A96A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" pathLength={1} className="draw-stroke" style={{ animationDuration: ".6s", animationDelay: ".8s" }} />
    </svg>
  );
}
