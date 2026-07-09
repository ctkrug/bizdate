/** Adds `days` calendar days to `date` (no weekend/holiday awareness). */
export function addCalendarDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

/** The numeric `Date#getDay()` index for a weekday name, or `undefined` if unrecognized. */
export function weekdayIndex(name: string): number | undefined {
  const index = WEEKDAYS.indexOf(name.trim().toLowerCase() as (typeof WEEKDAYS)[number]);
  return index === -1 ? undefined : index;
}

/**
 * The next occurrence of `targetDay` strictly after `from`.
 *
 * Never returns `from` itself, even when `from` already falls on
 * `targetDay` — "next Friday" said on a Friday means the following one.
 */
export function nextWeekday(from: Date, targetDay: number): Date {
  let candidate = addCalendarDays(from, 1);
  while (candidate.getDay() !== targetDay) {
    candidate = addCalendarDays(candidate, 1);
  }
  return candidate;
}

/**
 * The most recent occurrence of `targetDay` strictly before `from`.
 *
 * Never returns `from` itself, even when `from` already falls on
 * `targetDay` — "last Monday" said on a Monday means the previous one.
 */
export function previousWeekday(from: Date, targetDay: number): Date {
  let candidate = addCalendarDays(from, -1);
  while (candidate.getDay() !== targetDay) {
    candidate = addCalendarDays(candidate, -1);
  }
  return candidate;
}
