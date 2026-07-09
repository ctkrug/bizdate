import type { Holiday } from '../../src/index.js';

/**
 * Formats `date` as a local-time YYYY-MM-DD string.
 *
 * Deliberately not `date.toISOString().slice(0, 10)`, which is UTC: comparing
 * a UTC date string against NYSE_HOLIDAYS entries (which are local calendar
 * dates) shifts the cutoff by a day for anyone far enough from UTC (e.g.
 * Hawaii), silently dropping or adding a holiday at the boundary.
 */
export function toLocalIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** The next `limit` holidays strictly after `today`'s local calendar date. */
export function upcomingHolidays(holidays: readonly Holiday[], today: Date, limit: number): readonly Holiday[] {
  const todayIso = toLocalIsoDate(today);
  return holidays.filter((h) => h.date > todayIso).slice(0, limit);
}
