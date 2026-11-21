"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { forwardRef, useEffect, useState, type InputHTMLAttributes } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { company, project } from "@/data/project";
import { cn } from "@/lib/utils";
import { whatsappLink } from "./WhatsAppButton";
import { WhatsappIcon } from "./SocialIcons";
import Magnetic from "./Magnetic";

const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, ""))
    .refine((v) => /^[6-9]\d{9}$/.test(v), "Enter a valid 10-digit Indian mobile number"),
  email: z.string().trim().email("Enter a valid email address"),
  interest: z.enum(["4 BHK", "5 BHK", "Penthouse"], { errorMap: () => ({ message: "Choose a residence type" }) }),
  mode: z.enum(["Video Call Tour", "Site Visit"], { errorMap: () => ({ message: "Choose how you'd like to visit" }) }),
  date: z
    .string()
    .min(1, "Pick a preferred date")
    .refine((v) => v >= todayISO(), "Date can't be in the past"),
  time: z.string().min(1, "Pick a preferred time"),
});

type LeadInput = z.input<typeof leadSchema>;
type Lead = z.output<typeof leadSchema>;

export const LEADS_STORAGE_KEY = "wcr-demo-leads";

/**
 * Lead capture form (react-hook-form + zod). Demo only: leads are stored in localStorage.
 * Swap `saveLead` for a real CRM/API call when going live.
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
  const [submitted, setSubmitted] = useState<Lead | null>(null);
  // Computed after mount so server (UTC) and client (local time) markup always match.
  const [minDate, setMinDate] = useState<string | undefined>(undefined);
  useEffect(() => setMinDate(todayISO()), []);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput, unknown, Lead>({
    resolver: zodResolver(leadSchema),
    defaultValues: { mode: defaultMode ?? "Video Call Tour", interest: defaultInterest, time: "11:00" },
  });

  const onSubmit = async (data: Lead) => {
    await new Promise((r) => setTimeout(r, 900)); // simulate network
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
  const label = cn("block text-[10px] uppercase tracking-[0.22em]", light ? "text-charcoal/60" : "text-ivory/50");
  const err = "mt-1.5 text-xs text-[#e07a6a]";
  const input = cn("input-luxe", light ? "text-charcoal" : "text-ivory [color-scheme:dark]");

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div key="ok" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-10 text-center" role="status">
            <SuccessMark />
            <h3 className="mt-8 text-4xl md:text-5xl">Thank you, {submitted.name.split(" ")[0]}.</h3>
            <p className={cn("mx-auto mt-4 max-w-md", light ? "text-charcoal/70" : "text-ivory/70")}>
              Your {submitted.mode.toLowerCase()} for a {submitted.interest} is requested for{" "}
              {new Date(submitted.date + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long" })} at {submitted.time}. A relationship manager will
              confirm shortly.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                className="btn-gold !bg-[#25D366] !text-white hover:!bg-[#1ebe5a]"
                target="_blank"
                rel="noopener noreferrer"
                href={whatsappLink(
                  `Hello ${company.name}! I'm ${submitted.name}. I've requested a ${submitted.mode} of a ${submitted.interest} at ${project.shortName} on ${submitted.date} at ${submitted.time}. My number is ${submitted.phone}.`,
                )}
              >
                <WhatsappIcon width={16} height={16} /> Continue on WhatsApp
              </a>
              <button
                type="button"
                className={light ? "btn-ghost-dark" : "btn-ghost"}
                onClick={() => {
                  reset();
                  setSubmitted(null);
                }}
              >
                Book another
              </button>
            </div>
            <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-stone">Demo: your details were saved only in this browser.</p>
          </motion.div>
        ) : (
          <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-x-8 gap-y-7 md:grid-cols-2">
            <div>
              <label htmlFor="name" className={label}>Full name</label>
              <input id="name" autoComplete="name" className={input} placeholder="Your name" {...register("name")} aria-invalid={!!errors.name} />
              {errors.name && <p className={err}>{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="phone" className={label}>Mobile (India)</label>
              <input id="phone" type="tel" inputMode="numeric" autoComplete="tel-national" className={input} placeholder="98XXXXXXXX" {...register("phone")} aria-invalid={!!errors.phone} />
              {errors.phone && <p className={err}>{errors.phone.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="email" className={label}>Email</label>
              <input id="email" type="email" autoComplete="email" className={input} placeholder="you@example.com" {...register("email")} aria-invalid={!!errors.email} />
              {errors.email && <p className={err}>{errors.email.message}</p>}
            </div>

            <fieldset>
              <legend className={label}>Interested in</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["4 BHK", "5 BHK", "Penthouse"] as const).map((v) => (
                  <ChipRadio key={v} value={v} light={light} {...register("interest")} />
                ))}
              </div>
              {errors.interest && <p className={err}>{errors.interest.message}</p>}
            </fieldset>
            <fieldset>
              <legend className={label}>Preferred mode</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["Video Call Tour", "Site Visit"] as const).map((v) => (
                  <ChipRadio key={v} value={v} light={light} {...register("mode")} />
                ))}
              </div>
              {errors.mode && <p className={err}>{errors.mode.message}</p>}
            </fieldset>

            <div>
              <label htmlFor="date" className={label}>Preferred date</label>
              <input id="date" type="date" min={minDate} className={input} {...register("date")} aria-invalid={!!errors.date} />
              {errors.date && <p className={err}>{errors.date.message}</p>}
            </div>
            <div>
              <label htmlFor="time" className={label}>Preferred time</label>
              <select id="time" className={cn(input, "appearance-none")} {...register("time")}>
                {["10:00", "11:00", "12:00", "13:00", "15:00", "16:00", "17:00", "18:00", "19:00"].map((t) => (
                  <option key={t} value={t} className="bg-charcoal text-ivory">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col items-start gap-4 pt-2 md:col-span-2 md:flex-row md:items-center md:justify-between">
              <p className={cn("max-w-sm text-xs", light ? "text-charcoal/50" : "text-ivory/40")}>By submitting you agree to be contacted about {project.shortName}. Demo form — nothing is sent anywhere.</p>
              <Magnetic>
                <button type="submit" className="btn-gold" disabled={isSubmitting} data-cursor="Send">
                  {isSubmitting ? <LoaderCircle size={16} className="animate-spin" aria-hidden /> : null}
                  {isSubmitting ? "Reserving" : "Request Private Viewing"}
                  {!isSubmitting && <ArrowRight size={14} aria-hidden />}
                </button>
              </Magnetic>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Radio styled as a pill chip. */
const ChipRadio = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { light: boolean; value: string }>(function ChipRadio(
  { light, value, ...rest },
  ref,
) {
  return (
    <label className="cursor-pointer">
      <input ref={ref} type="radio" value={value} className="peer sr-only" {...rest} />
      <span
        className={cn(
          "inline-block rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.15em] transition-colors peer-checked:border-gold peer-checked:bg-gold peer-checked:text-charcoal peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold",
          light ? "border-charcoal/20 text-charcoal/70" : "border-ivory/20 text-ivory/70",
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
      <motion.circle cx="48" cy="48" r="44" fill="none" stroke="#C8A96A" strokeWidth="1" initial={{ scale: 1, opacity: 0.6 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ duration: 1.6, delay: 1.2, repeat: 2 }} style={{ transformOrigin: "48px 48px" }} />
    </svg>
  );
}
