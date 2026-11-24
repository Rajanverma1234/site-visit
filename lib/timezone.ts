/**
 * Time-zone helpers for the lead form. Visits are scheduled in India Standard Time (IST, UTC+5:30);
 * overseas visitors booking a video call also see each slot converted to their own time zone.
 */

export const IST_ZONE = "Asia/Kolkata";
const IST_OFFSET_MIN = 330;

export function detectTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || IST_ZONE;
  } catch {
    return IST_ZONE;
  }
}

export const isIndianZone = (tz: string) => tz === IST_ZONE || tz === "Asia/Calcutta";

/** Today's date in IST as YYYY-MM-DD. */
export function istToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: IST_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

/** Short zone name, e.g. "GMT+4", "BST", "EST". */
export function zoneAbbrev(tz: string, at = new Date()): string {
  try {
    const part = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" }).formatToParts(at).find((p) => p.type === "timeZoneName");
    return part?.value ?? tz;
  } catch {
    return tz;
  }
}

/** Friendly city from an IANA zone: "America/New_York" → "New York". */
export const zoneCity = (tz: string) => (tz.split("/").pop() ?? tz).replace(/_/g, " ");

/**
 * Converts an IST slot ("10:00") on an IST date to the visitor's zone.
 * Returns the local "HH:MM" and the day shift relative to the IST date (-1, 0, +1).
 */
export function istSlotToZone(slot: string, istDate: string | undefined, tz: string) {
  const [h, m] = slot.split(":").map(Number);
  const base = istDate || istToday();
  const [Y, M, D] = base.split("-").map(Number);
  const utc = Date.UTC(Y, M - 1, D, h, m) - IST_OFFSET_MIN * 60_000;
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(utc);
  const localDay = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(utc);
  const dayShift = Math.round((Date.parse(localDay) - Date.parse(base)) / 86_400_000);
  return { time, dayShift, at: new Date(utc) };
}

export const dayShiftText = (d: number) => (d === 1 ? ", next day" : d === -1 ? ", previous day" : "");
