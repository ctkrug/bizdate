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
