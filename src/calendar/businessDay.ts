import type { Calendar } from '../types.js';

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** True if `date` is a trading day on `calendar` (not a weekend or holiday). */
export function isTradingDay(date: Date, calendar: Calendar): boolean {
  return calendar.isTradingDay(date);
}

/**
 * The next trading day strictly after `date` on `calendar`.
 *
 * Skips weekends and holidays, so "next trading day" from a Friday before a
 * Monday holiday correctly lands on Tuesday.
 */
export function nextTradingDay(date: Date, calendar: Calendar): Date {
  let candidate = addDays(date, 1);
  while (!calendar.isTradingDay(candidate)) {
    candidate = addDays(candidate, 1);
  }
  return candidate;
}

/** The trading day strictly before `date` on `calendar`. */
export function previousTradingDay(date: Date, calendar: Calendar): Date {
  let candidate = addDays(date, -1);
  while (!calendar.isTradingDay(candidate)) {
    candidate = addDays(candidate, -1);
  }
  return candidate;
}

/**
 * Adds `count` trading days to `date` on `calendar`.
 *
 * A positive count walks forward, a negative count walks backward; `date`
 * itself is never counted, matching how "3 business days after X" is
 * normally meant.
 */
export function addBusinessDays(date: Date, count: number, calendar: Calendar): Date {
  let result = date;
  const step = count >= 0 ? 1 : -1;
  let remaining = Math.abs(count);
  while (remaining > 0) {
    result = step > 0 ? nextTradingDay(result, calendar) : previousTradingDay(result, calendar);
    remaining -= 1;
  }
  return result;
}
