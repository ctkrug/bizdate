import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { nyseCalendar } from '../src/calendar/nyseCalendar.js';
import { addBusinessDays, isTradingDay, nextTradingDay, previousTradingDay } from '../src/calendar/businessDay.js';

// noInvalidDate: see test/dateMath.property.test.ts for why this matters —
// an Invalid Date would otherwise hang nextTradingDay/previousTradingDay's
// while loop (out of scope here; pinned separately at the parse() boundary).
const arbitraryDate = fc.date({ min: new Date('2000-01-01'), max: new Date('2050-01-01'), noInvalidDate: true });
const arbitraryTradingDay = fc
  .date({ min: new Date('2024-01-01'), max: new Date('2026-12-31'), noInvalidDate: true })
  .filter((d) => isTradingDay(d, nyseCalendar));

describe('nextTradingDay / previousTradingDay (property-based)', () => {
  it('nextTradingDay always returns a later trading day', () => {
    fc.assert(
      fc.property(arbitraryDate, (date) => {
        const result = nextTradingDay(date, nyseCalendar);
        expect(result.getTime()).toBeGreaterThan(date.getTime());
        expect(isTradingDay(result, nyseCalendar)).toBe(true);
      }),
    );
  });

  it('previousTradingDay always returns an earlier trading day', () => {
    fc.assert(
      fc.property(arbitraryDate, (date) => {
        const result = previousTradingDay(date, nyseCalendar);
        expect(result.getTime()).toBeLessThan(date.getTime());
        expect(isTradingDay(result, nyseCalendar)).toBe(true);
      }),
    );
  });
});

describe('addBusinessDays (property-based)', () => {
  it('walking forward then the same count backward returns to a trading-day start', () => {
    fc.assert(
      fc.property(arbitraryTradingDay, fc.integer({ min: 0, max: 60 }), (date, count) => {
        const forward = addBusinessDays(date, count, nyseCalendar);
        const roundTripped = addBusinessDays(forward, -count, nyseCalendar);
        expect(roundTripped.toISOString().slice(0, 10)).toBe(date.toISOString().slice(0, 10));
      }),
    );
  });

  it('a positive count always lands on a trading day at or after the start', () => {
    fc.assert(
      fc.property(arbitraryTradingDay, fc.integer({ min: 1, max: 60 }), (date, count) => {
        const result = addBusinessDays(date, count, nyseCalendar);
        expect(result.getTime()).toBeGreaterThan(date.getTime());
        expect(isTradingDay(result, nyseCalendar)).toBe(true);
      }),
    );
  });
});
