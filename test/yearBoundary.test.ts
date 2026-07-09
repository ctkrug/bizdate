import { describe, expect, it } from 'vitest';
import { nyseCalendar } from '../src/calendar/nyseCalendar.js';
import { isTradingDay, nextTradingDay } from '../src/calendar/businessDay.js';

describe('year-boundary behavior', () => {
  it('rolls nextTradingDay from Dec 31 into January, skipping the New Year holiday', () => {
    const dec31 = new Date('2024-12-31T12:00:00'); // Tuesday
    const result = nextTradingDay(dec31, nyseCalendar);
    // Jan 1, 2025 is a Wednesday but a holiday; the next trading day is
    // Thursday Jan 2, 2025.
    expect(result.toISOString().slice(0, 10)).toBe('2025-01-02');
  });

  it('documents behavior beyond the hardcoded holiday range: weekends are still skipped, but unlisted-year holidays are not', () => {
    // NYSE_HOLIDAYS only covers 2024-2027 (see src/calendar/nyse.ts). Beyond
    // that range, isTradingDay still catches weekends but has no holiday
    // data, so Martin Luther King, Jr. Day 2028 (a Monday, not a weekend)
    // resolves as a trading day even though it would be a holiday in
    // reality. This is the library's documented, tested fallback rather
    // than a silent surprise: extend NYSE_HOLIDAYS to restore holiday
    // accuracy for later years.
    const mlkDay2028 = new Date('2028-01-17T12:00:00'); // Monday
    expect(isTradingDay(mlkDay2028, nyseCalendar)).toBe(true);
  });
});
