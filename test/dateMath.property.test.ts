import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { addCalendarDays, nextWeekday, previousWeekday } from '../src/parser/dateMath.js';

// noInvalidDate: fc.date() otherwise also generates `new Date(NaN)`, which
// would hang nextWeekday/previousWeekday forever (their while loops never
// see a matching getDay()) — the same hazard test/adversarialInput.test.ts
// pins at the parse() boundary. These properties are about well-defined
// behavior on valid dates, so invalid ones are out of scope here.
const arbitraryDate = fc.date({ min: new Date('2000-01-01'), max: new Date('2050-01-01'), noInvalidDate: true });
const arbitraryWeekday = fc.integer({ min: 0, max: 6 });

describe('addCalendarDays (property-based)', () => {
  it('adding then subtracting the same offset returns to the original day', () => {
    fc.assert(
      fc.property(arbitraryDate, fc.integer({ min: -3650, max: 3650 }), (date, days) => {
        const roundTripped = addCalendarDays(addCalendarDays(date, days), -days);
        expect(roundTripped.toISOString().slice(0, 10)).toBe(date.toISOString().slice(0, 10));
      }),
    );
  });

  it('never mutates the input date', () => {
    fc.assert(
      fc.property(arbitraryDate, fc.integer({ min: -1000, max: 1000 }), (date, days) => {
        const before = date.getTime();
        addCalendarDays(date, days);
        expect(date.getTime()).toBe(before);
      }),
    );
  });
});

describe('nextWeekday / previousWeekday (property-based)', () => {
  it('nextWeekday always lands on the requested weekday, strictly after `from`, within 7 days', () => {
    fc.assert(
      fc.property(arbitraryDate, arbitraryWeekday, (from, targetDay) => {
        const result = nextWeekday(from, targetDay);
        expect(result.getDay()).toBe(targetDay);
        expect(result.getTime()).toBeGreaterThan(from.getTime());
        const diffDays = (result.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
        expect(diffDays).toBeLessThanOrEqual(7);
      }),
    );
  });

  it('previousWeekday always lands on the requested weekday, strictly before `from`, within 7 days', () => {
    fc.assert(
      fc.property(arbitraryDate, arbitraryWeekday, (from, targetDay) => {
        const result = previousWeekday(from, targetDay);
        expect(result.getDay()).toBe(targetDay);
        expect(result.getTime()).toBeLessThan(from.getTime());
        const diffDays = (from.getTime() - result.getTime()) / (1000 * 60 * 60 * 24);
        expect(diffDays).toBeLessThanOrEqual(7);
      }),
    );
  });
});
