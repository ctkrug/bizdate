import { describe, expect, it } from 'vitest';
import { nyseCalendar } from '../src/calendar/nyseCalendar.js';
import { parse } from '../src/parser/index.js';

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
});
