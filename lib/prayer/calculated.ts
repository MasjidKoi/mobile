/**
 * On-device **calculated** prayer times — the fallback the home screen shows for
 * guests, fresh installs, denied location, or when the user is away from their
 * home masjid (Travel Mode). Wraps the `adhan` library and shapes the output as
 * a {@link PrayerTimeResponse} (azan filled, iqamah always null) so it flows
 * through the existing prayer clock / table / `PrayerTable` with no special-
 * casing. Bangladesh is a single timezone, so device-local wall-clock matches
 * the location's wall clock.
 */
import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from "adhan";

import type { Coords } from "@/lib/location/types";
import type { PrayerTimeResponse } from "@/lib/prayer/types";

/** Sentinel masjid id marking a times object as calculated (not masjid-served). */
export const CALCULATED_MASJID_ID = "";

export interface CalculatedTimesOptions {
  /** User's madhab (affects the Asr boundary). Defaults to Hanafi (regional default). */
  madhab?: string;
  /** Calculation method key (mirrors app-config `default_calc_method`). Defaults to Karachi. */
  method?: string;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function hhmm(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Local `YYYY-MM-DD` for a date (matches the backend's masjid-local date key). */
export function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** adhan only distinguishes Hanafi (later Asr) from everyone else (earlier Asr). */
function toAdhanMadhab(madhab?: string) {
  return madhab === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
}

function toParams(method?: string) {
  switch ((method ?? "").toUpperCase()) {
    case "MWL":
    case "MUSLIM_WORLD_LEAGUE":
      return CalculationMethod.MuslimWorldLeague();
    case "EGYPTIAN":
      return CalculationMethod.Egyptian();
    case "UMM_AL_QURA":
      return CalculationMethod.UmmAlQura();
    case "DUBAI":
      return CalculationMethod.Dubai();
    case "KARACHI":
    default:
      return CalculationMethod.Karachi();
  }
}

/**
 * Compute one day's prayer times for a coordinate. The result mirrors a backend
 * {@link PrayerTimeResponse} so callers reuse the same hooks/components as
 * masjid-served times.
 */
export function computeCalculatedTimes(
  coords: Coords,
  date: Date,
  opts?: CalculatedTimesOptions,
): PrayerTimeResponse {
  const params = toParams(opts?.method);
  params.madhab = toAdhanMadhab(opts?.madhab);
  const times = new PrayerTimes(new Coordinates(coords.lat, coords.lng), date, params);

  const method = (opts?.method ?? "KARACHI").toUpperCase();
  const madhab = opts?.madhab ?? "hanafi";
  const dateKey = toLocalDateStr(date);
  return {
    prayer_time_id: `calc-${dateKey}`,
    masjid_id: CALCULATED_MASJID_ID,
    date: dateKey,
    fajr_azan: hhmm(times.fajr),
    dhuhr_azan: hhmm(times.dhuhr),
    asr_azan: hhmm(times.asr),
    maghrib_azan: hhmm(times.maghrib),
    isha_azan: hhmm(times.isha),
    fajr_iqamah: null,
    dhuhr_iqamah: null,
    asr_iqamah: null,
    maghrib_iqamah: null,
    isha_iqamah: null,
    is_manual: false,
    calculation_method: method,
    madhab,
    updated_at: date.toISOString(),
  };
}

/** `days` consecutive days starting at `start` (default today) — feeds the reminder scheduler. */
export function computeCalculatedRange(
  coords: Coords,
  days: number,
  opts?: CalculatedTimesOptions,
  start?: Date,
): PrayerTimeResponse[] {
  const base = start ?? new Date();
  const out: PrayerTimeResponse[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    out.push(computeCalculatedTimes(coords, d, opts));
  }
  return out;
}
