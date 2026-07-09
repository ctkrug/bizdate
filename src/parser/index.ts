import type { Calendar, ParseResult } from '../types.js';
import { nextTradingDay } from '../calendar/businessDay.js';

type Rule = (normalized: string, calendar: Calendar, now: Date) => ParseResult | null;

const TODAY_RULE: Rule = (normalized, _calendar, now) => {
  if (normalized !== 'today') return null;
  return { ok: true, date: now, input: normalized };
};

const NEXT_TRADING_DAY_RULE: Rule = (normalized, calendar, now) => {
  if (normalized !== 'next trading day') return null;
  return { ok: true, date: nextTradingDay(now, calendar), input: normalized };
};

const RULES: readonly Rule[] = [TODAY_RULE, NEXT_TRADING_DAY_RULE];

/**
 * Parses a natural-language date phrase against `calendar`.
 *
 * This is a scaffold: it recognizes a small fixed set of phrases so the
 * library is runnable end-to-end. The backlog tracks growing this into full
 * NL coverage (relative dates, weekday references, holiday-relative
 * phrases).
 */
export function parse(input: string, calendar: Calendar, now: Date = new Date()): ParseResult {
  const normalized = input.trim().toLowerCase();

  for (const rule of RULES) {
    const result = rule(normalized, calendar, now);
    if (result) return { ...result, input };
  }

  return {
    ok: false,
    input,
    reason: `no rule matched for "${input}" yet`,
  };
}
