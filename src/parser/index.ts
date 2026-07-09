import type { Calendar, ParseResult } from '../types.js';
import { addBusinessDays, nextTradingDay, previousTradingDay } from '../calendar/businessDay.js';
import { addCalendarDays, nextWeekday, previousWeekday, weekdayIndex } from './dateMath.js';
import { normalizeHolidayName } from './holidayAliases.js';

type Rule = (normalized: string, calendar: Calendar, now: Date) => ParseResult | null;

/** Resolves a user-typed holiday name against `calendar`, or an `ok:false` result if unrecognized. */
function resolveHoliday(
  rawName: string,
  calendar: Calendar,
  now: Date,
  input: string,
): Date | { ok: false; input: string; reason: string } {
  const holidayDate = calendar.findHoliday(normalizeHolidayName(rawName), now);
  if (!holidayDate) {
    return { ok: false, input, reason: `unrecognized holiday "${rawName.trim()}"` };
  }
  return holidayDate;
}

const TODAY_RULE: Rule = (normalized, _calendar, now) => {
  if (normalized !== 'today') return null;
  return { ok: true, date: now, input: normalized };
};

const NEXT_TRADING_DAY_RULE: Rule = (normalized, calendar, now) => {
  if (normalized !== 'next trading day') return null;
  return { ok: true, date: nextTradingDay(now, calendar), input: normalized };
};

const TRADING_DAY_RELATIVE_TO_HOLIDAY_RULE: Rule = (normalized, calendar, now) => {
  const match = /^the trading day (before|after) (.+)$/.exec(normalized);
  if (!match) return null;
  const [, direction, holidayName] = match as unknown as [string, string, string];

  const resolved = resolveHoliday(holidayName, calendar, now, normalized);
  if (!(resolved instanceof Date)) return resolved;

  const date = direction === 'before' ? previousTradingDay(resolved, calendar) : nextTradingDay(resolved, calendar);
  return { ok: true, date, input: normalized };
};

/**
 * addBusinessDays walks one trading day at a time (see docs/ARCHITECTURE.md),
 * so an unbounded count is a synchronous-hang vector: 10 million measured at
 * 18+ seconds in manual testing. No legitimate phrase needs more than this.
 */
const MAX_BUSINESS_DAY_COUNT = 5000;

const BUSINESS_DAYS_RELATIVE_TO_HOLIDAY_RULE: Rule = (normalized, calendar, now) => {
  const match = /^(\d+) business days? (before|after) (.+)$/.exec(normalized);
  if (!match) return null;
  const [, countText, direction, holidayName] = match as unknown as [string, string, string, string];

  const magnitude = Number.parseInt(countText, 10);
  if (magnitude > MAX_BUSINESS_DAY_COUNT) {
    return {
      ok: false,
      input: normalized,
      reason: `business day count too large (max ${MAX_BUSINESS_DAY_COUNT})`,
    };
  }

  const resolved = resolveHoliday(holidayName, calendar, now, normalized);
  if (!(resolved instanceof Date)) return resolved;

  const count = magnitude * (direction === 'before' ? -1 : 1);
  return { ok: true, date: addBusinessDays(resolved, count, calendar), input: normalized };
};

const IN_N_DAYS_RULE: Rule = (normalized, _calendar, now) => {
  const match = /^in (\d+) (days?|weeks?)$/.exec(normalized);
  if (!match) return null;
  const [, countText, unitText] = match as unknown as [string, string, string];

  const count = Number.parseInt(countText, 10);
  const days = unitText.startsWith('week') ? count * 7 : count;
  return { ok: true, date: addCalendarDays(now, days), input: normalized };
};

const WEEKDAY_REFERENCE_RULE: Rule = (normalized, _calendar, now) => {
  const match = /^(next|last) (sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/.exec(normalized);
  if (!match) return null;
  const [, direction, dayName] = match as unknown as [string, string, string];

  const targetDay = weekdayIndex(dayName);
  if (targetDay === undefined) return null;

  const date = direction === 'next' ? nextWeekday(now, targetDay) : previousWeekday(now, targetDay);
  return { ok: true, date, input: normalized };
};

const RULES: readonly Rule[] = [
  TODAY_RULE,
  NEXT_TRADING_DAY_RULE,
  TRADING_DAY_RELATIVE_TO_HOLIDAY_RULE,
  BUSINESS_DAYS_RELATIVE_TO_HOLIDAY_RULE,
  IN_N_DAYS_RULE,
  WEEKDAY_REFERENCE_RULE,
];

/**
 * Parses a natural-language date phrase against `calendar`.
 *
 * This is a scaffold: it recognizes a small fixed set of phrases so the
 * library is runnable end-to-end. The backlog tracks growing this into full
 * NL coverage (relative dates, weekday references, holiday-relative
 * phrases).
 */
export function parse(input: string, calendar: Calendar, now: Date = new Date()): ParseResult {
  if (Number.isNaN(now.getTime())) {
    return { ok: false, input, reason: 'invalid reference date' };
  }

  const normalized = input.trim().toLowerCase();

  for (const rule of RULES) {
    const result = rule(normalized, calendar, now);
    if (!result) continue;

    if (result.ok && Number.isNaN(result.date.getTime())) {
      return { ok: false, input, reason: `"${input}" resolves outside the representable date range` };
    }
    return { ...result, input };
  }

  return {
    ok: false,
    input,
    reason: `no rule matched for "${input}" yet`,
  };
}
