import { describe, expect, it } from 'vitest';
import { nyseCalendar } from '../src/calendar/nyseCalendar.js';
import { nextTradingDay } from '../src/calendar/businessDay.js';

describe('year-boundary behavior', () => {
  it('rolls nextTradingDay from Dec 31 into January, skipping the New Year holiday', () => {
    const dec31 = new Date('2024-12-31T12:00:00'); // Tuesday
    const result = nextTradingDay(dec31, nyseCalendar);
    // Jan 1, 2025 is a Wednesday but a holiday; the next trading day is
    // Thursday Jan 2, 2025.
    expect(result.toISOString().slice(0, 10)).toBe('2025-01-02');
  });

  it('documents behavior beyond the hardcoded holiday range: weekends are still skipped, but unlisted-year holidays are not', () => {
    // NYSE_HOLIDAYS only covers 2024-2026 (see src/calendar/nyse.ts). Beyond
    // that range, isTradingDay still catches weekends but has no holiday
    // data, so New Year's Day 2027 (a Friday, not a weekend) resolves as a
    // trading day even though it would be a holiday in reality. This is the
    // library's documented, tested fallback rather than a silent surprise:
    // extend NYSE_HOLIDAYS to restore holiday accuracy for later years.
    const dec31 = new Date('2026-12-31T12:00:00'); // Thursday
    const result = nextTradingDay(dec31, nyseCalendar);
    expect(result.toISOString().slice(0, 10)).toBe('2027-01-01');
  });
});
