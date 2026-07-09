import type { Calendar, ParseResult } from '../types.js';
import { nextTradingDay } from '../calendar/businessDay.js';

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

  if (normalized === 'today') {
    return { ok: true, date: now, input };
  }

  if (normalized === 'next trading day') {
    return { ok: true, date: nextTradingDay(now, calendar), input };
  }

  return {
    ok: false,
    input,
    reason: `no rule matched for "${input}" yet`,
  };
}
