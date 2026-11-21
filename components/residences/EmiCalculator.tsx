"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { calculateEmi } from "@/lib/emi";
import { CRORE, LAKH, formatINR, formatINRFull } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * EMI calculator with sliders and an animated SVG donut (principal vs interest).
 * Uses the standard reducing-balance formula from lib/emi.ts.
 */
export default function EmiCalculator({ defaultLoan = 10 * CRORE, tone = "light" }: { defaultLoan?: number; tone?: "light" | "dark" }) {
  const [loan, setLoan] = useState(defaultLoan);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const { emi, totalInterest, totalPayable } = useMemo(() => calculateEmi(loan, rate, years), [loan, rate, years]);

  const principalShare = loan / totalPayable;
  const R = 70;
  const C = 2 * Math.PI * R;
  const light = tone === "light";

  return (
    <div className={cn("grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center", light ? "text-charcoal" : "text-ivory")}>
      <div className="space-y-10">
        <Slider label="Loan amount" value={loan} min={1 * CRORE} max={25 * CRORE} step={10 * LAKH} display={formatINR(loan)} onChange={setLoan} light={light} />
        <Slider label="Interest rate (p.a.)" value={rate} min={6.5} max={12} step={0.05} display={`${rate.toFixed(2)}%`} onChange={setRate} light={light} />
        <Slider label="Tenure" value={years} min={5} max={30} step={1} display={`${years} years`} onChange={setYears} light={light} />
      </div>

      <div className="flex flex-col items-center gap-8 sm:flex-row lg:flex-col xl:flex-row">
        <div className="relative h-48 w-48 shrink-0">
          <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90" role="img" aria-label={`Principal ${Math.round(principalShare * 100)} percent, interest ${Math.round((1 - principalShare) * 100)} percent`}>
            <circle cx="90" cy="90" r={R} fill="none" stroke={light ? "#E2DACB" : "#2A2A30"} strokeWidth="16" />
            <motion.circle
              cx="90"
              cy="90"
              r={R}
              fill="none"
              stroke="#C8A96A"
              strokeWidth="16"
              strokeDasharray={C}
              initial={false}
              animate={{ strokeDashoffset: C * (1 - principalShare) }}
              transition={{ type: "spring", stiffness: 60, damping: 16 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase tracking-[0.2em] text-stone">Monthly EMI</span>
            <span className="mt-1 font-serif text-2xl">{formatINR(emi)}</span>
          </div>
        </div>
        <dl className="w-full space-y-4 text-sm">
          <Row label="Monthly EMI" value={formatINRFull(emi)} strong />
          <Row label="Principal" value={formatINR(loan)} dot="#C8A96A" />
          <Row label="Total interest" value={formatINR(totalInterest)} dot={light ? "#E2DACB" : "#2A2A30"} />
          <Row label="Total payable" value={formatINR(totalPayable)} />
          <p className="pt-2 text-[11px] text-stone">Indicative only. Actual EMI depends on your lender&apos;s terms.</p>
        </dl>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
  light,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
  light: boolean;
}) {
  const id = label.replace(/\W+/g, "-").toLowerCase();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <label htmlFor={id} className={cn("text-[11px] uppercase tracking-[0.2em]", light ? "text-charcoal/60" : "text-ivory/60")}>
          {label}
        </label>
        <span className="font-serif text-2xl">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-luxe"
        style={{ ["--fill" as string]: `${fill}%` }}
        aria-valuetext={display}
      />
    </div>
  );
}

function Row({ label, value, strong, dot }: { label: string; value: string; strong?: boolean; dot?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-stone/20 pb-3">
      <dt className="flex items-center gap-2 text-stone">
        {dot && <span className="h-2 w-2 rounded-full" style={{ background: dot }} />}
        {label}
      </dt>
      <dd className={cn(strong && "font-serif text-xl text-gold-dark")}>{value}</dd>
    </div>
  );
}
