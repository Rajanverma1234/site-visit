/**
 * Standard reducing-balance EMI formula:
 *   EMI = P × r × (1 + r)^n / ((1 + r)^n − 1)
 * where P = principal, r = monthly interest rate, n = number of monthly instalments.
 */
export interface EmiResult {
  emi: number;
  totalInterest: number;
  totalPayable: number;
}

export function calculateEmi(principal: number, annualRatePct: number, tenureYears: number): EmiResult {
  const n = Math.max(1, Math.round(tenureYears * 12));
  const r = annualRatePct / 12 / 100;
  const emi = r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayable = emi * n;
  return { emi, totalInterest: totalPayable - principal, totalPayable };
}
