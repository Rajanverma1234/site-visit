/**
 * Indian currency helpers.
 * All money values in /data are stored in plain rupees (number) so maths stays simple.
 */

export const CRORE = 1_00_00_000;
export const LAKH = 1_00_000;

/** ₹12.5 Cr / ₹45 Lakh / ₹8,500 — compact Indian formatting. */
export function formatINR(value: number, opts: { decimals?: number } = {}): string {
  const { decimals = 2 } = opts;
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= CRORE) return `${sign}₹${trim((abs / CRORE).toFixed(decimals))} Cr`;
  if (abs >= LAKH) return `${sign}₹${trim((abs / LAKH).toFixed(decimals))} Lakh`;
  return `${sign}₹${formatIndianNumber(Math.round(abs))}`;
}

/** Full rupee figure with Indian digit grouping, e.g. ₹1,25,00,000 */
export function formatINRFull(value: number): string {
  return `₹${formatIndianNumber(Math.round(value))}`;
}

/** 12500000 -> "1,25,00,000" */
export function formatIndianNumber(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}

/** 4800 -> "4,800 sq ft" */
export function formatArea(sqft: number): string {
  return `${formatIndianNumber(sqft)} sq ft`;
}

/** Drops trailing zeros: "12.50" -> "12.5", "17.00" -> "17" */
function trim(s: string): string {
  return s.includes(".") ? s.replace(/\.?0+$/, "") : s;
}
