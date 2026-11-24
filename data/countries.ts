/**
 * Country codes for the international phone field.
 * `pattern` validates the NATIONAL number (no country code, no leading trunk 0).
 * Priority markets for NRI buyers are listed first.
 */
export interface Country {
  iso: string;
  name: string;
  dial: string;
  pattern: RegExp;
  example: string;
  priority?: boolean;
}

export const countries: Country[] = [
  { iso: "IN", name: "India", dial: "+91", pattern: /^[6-9]\d{9}$/, example: "98765 43210", priority: true },
  { iso: "AE", name: "United Arab Emirates", dial: "+971", pattern: /^5\d{8}$/, example: "50 123 4567", priority: true },
  { iso: "GB", name: "United Kingdom", dial: "+44", pattern: /^7\d{9}$/, example: "7400 123456", priority: true },
  { iso: "US", name: "United States", dial: "+1", pattern: /^[2-9]\d{2}[2-9]\d{6}$/, example: "201 555 0123", priority: true },
  { iso: "SG", name: "Singapore", dial: "+65", pattern: /^[89]\d{7}$/, example: "8123 4567", priority: true },
  { iso: "CA", name: "Canada", dial: "+1", pattern: /^[2-9]\d{2}[2-9]\d{6}$/, example: "416 555 0123", priority: true },
  { iso: "AU", name: "Australia", dial: "+61", pattern: /^4\d{8}$/, example: "412 345 678", priority: true },
  { iso: "BH", name: "Bahrain", dial: "+973", pattern: /^[36]\d{7}$/, example: "3600 1234" },
  { iso: "FR", name: "France", dial: "+33", pattern: /^[67]\d{8}$/, example: "6 12 34 56 78" },
  { iso: "DE", name: "Germany", dial: "+49", pattern: /^1[5-7]\d{8,9}$/, example: "1512 3456789" },
  { iso: "HK", name: "Hong Kong", dial: "+852", pattern: /^[5-9]\d{7}$/, example: "5123 4567" },
  { iso: "JP", name: "Japan", dial: "+81", pattern: /^[789]0\d{8}$/, example: "90 1234 5678" },
  { iso: "KW", name: "Kuwait", dial: "+965", pattern: /^[569]\d{7}$/, example: "5001 2345" },
  { iso: "MY", name: "Malaysia", dial: "+60", pattern: /^1\d{8,9}$/, example: "12 345 6789" },
  { iso: "NL", name: "Netherlands", dial: "+31", pattern: /^6\d{8}$/, example: "6 12345678" },
  { iso: "NZ", name: "New Zealand", dial: "+64", pattern: /^2\d{7,9}$/, example: "21 123 4567" },
  { iso: "OM", name: "Oman", dial: "+968", pattern: /^[79]\d{7}$/, example: "9212 3456" },
  { iso: "QA", name: "Qatar", dial: "+974", pattern: /^[3-7]\d{7}$/, example: "3312 3456" },
  { iso: "SA", name: "Saudi Arabia", dial: "+966", pattern: /^5\d{8}$/, example: "51 234 5678" },
  { iso: "ZA", name: "South Africa", dial: "+27", pattern: /^[6-8]\d{8}$/, example: "71 123 4567" },
  { iso: "CH", name: "Switzerland", dial: "+41", pattern: /^7[5-9]\d{7}$/, example: "78 123 45 67" },
];

export const getCountry = (iso: string) => countries.find((c) => c.iso === iso) ?? countries[0];

/** Strips spaces/dashes/brackets, a repeated country code and a leading trunk "0". */
export function normaliseNational(raw: string, c: Country): string {
  let d = raw.replace(/[^\d+]/g, "");
  const dialDigits = c.dial.replace("+", "");
  if (d.startsWith("+")) d = d.slice(1);
  if (d.startsWith("00" + dialDigits)) d = d.slice(2 + dialDigits.length);
  else if (d.startsWith(dialDigits) && d.length > dialDigits.length + 6) d = d.slice(dialDigits.length);
  if (d.startsWith("0")) d = d.slice(1);
  return d;
}
