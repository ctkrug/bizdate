import { describe, expect, it } from 'vitest';
import { nyseCalendar } from '../src/calendar/nyseCalendar.js';
import { addBusinessDays } from '../src/calendar/businessDay.js';
import { parse } from '../src/parser/index.js';

describe('parse — Object.prototype-shaped holiday names', () => {
  it('never throws for a holiday name that collides with Object.prototype', () => {
    const now = new Date('2024-12-01T09:00:00');
    expect(() => parse('the trading day before __proto__', nyseCalendar, now)).not.toThrow();
    expect(() => parse('the trading day before constructor', nyseCalendar, now)).not.toThrow();

    const result = parse('the trading day before __proto__', nyseCalendar, now);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('unrecognized holiday');
    }
  });
});

describe('parse — adversarial reference date', () => {
  it('rejects an invalid `now` instead of hanging on weekday math', () => {
    const result = parse('next monday', nyseCalendar, new Date(Number.NaN));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('invalid reference date');
    }
  });
});

describe('parse — day counts beyond the representable date range', () => {
  it('reports a reason instead of returning an invalid Date for an enormous day count', () => {
    const now = new Date('2024-01-01T00:00:00');
    const result = parse('in 100000000 days', nyseCalendar, now);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('outside the representable date range');
    }
  });

  it('still resolves an ordinary day count correctly', () => {
    const now = new Date('2024-01-01T00:00:00');
    const result = parse('in 5 days', nyseCalendar, now);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.date.toISOString().slice(0, 10)).toBe('2024-01-06');
    }
  });
});

describe('parse — runaway business-day counts', () => {
  it('rejects a business-day count large enough to freeze the day-by-day walk', () => {
    // addBusinessDays walks one trading day at a time by design (see
    // docs/ARCHITECTURE.md); an uncapped count of, say, 10 million takes
    // upward of 15 seconds of synchronous computation — a trivial DoS
    // against the live playground's main thread. 5001 is just past the cap.
    const now = new Date('2024-01-01T00:00:00');
    const result = parse('5001 business days after Thanksgiving', nyseCalendar, now);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('business day count too large');
    }
  });

  it('still resolves a realistic business-day count correctly', () => {
    const now = new Date('2024-11-01T09:00:00');
    const result = parse('3 business days after Thanksgiving', nyseCalendar, now);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.date.toISOString().slice(0, 10)).toBe('2024-12-03');
    }
  });

  it('still resolves a count exactly at the cap, not just under it', () => {
    // Pins the cap as an inclusive boundary (`>`, not `>=`) so the limit
    // check can't silently creep down to reject legitimate large-but-sane
    // counts too.
    const now = new Date('2024-11-01T09:00:00');
    const thanksgiving2024 = new Date('2024-11-28T00:00:00');
    const result = parse('5000 business days after Thanksgiving', nyseCalendar, now);
    expect(result.ok).toBe(true);
    if (result.ok) {
      const expected = addBusinessDays(thanksgiving2024, 5000, nyseCalendar);
      expect(result.date.toISOString().slice(0, 10)).toBe(expected.toISOString().slice(0, 10));
    }
  });
});
