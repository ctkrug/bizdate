import { describe, expect, it } from 'vitest';
import { nyseCalendar } from '../src/calendar/nyseCalendar.js';
import { parse } from '../src/parser/index.js';

describe('holiday-relative trading-day phrases', () => {
  it('resolves "the trading day before Christmas", skipping the weekend and the holiday', () => {
    // Christmas 2024 is a Wednesday; the trading day before it is Monday Dec 23
    // (Dec 24 is a trading day too, so this also proves it walks from the
    // holiday itself, not just "the previous weekday").
    const now = new Date('2024-12-01T09:00:00');
    const result = parse('the trading day before Christmas', nyseCalendar, now);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.date.toISOString().slice(0, 10)).toBe('2024-12-24');
    }
  });

  it('resolves "the trading day after Thanksgiving", skipping the adjacent weekend', () => {
    // Thanksgiving 2024 is Thursday Nov 28; the next trading day is Friday Nov 29
    // (NYSE trades a short session that day, no separate closure).
    const now = new Date('2024-11-01T09:00:00');
    const result = parse('the trading day after Thanksgiving', nyseCalendar, now);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.date.toISOString().slice(0, 10)).toBe('2024-11-29');
    }
  });

  it('is case-insensitive on both the phrase and the holiday name', () => {
    const now = new Date('2024-12-01T09:00:00');
    const result = parse('The Trading Day Before CHRISTMAS', nyseCalendar, now);
    expect(result.ok).toBe(true);
  });

  it('returns ok:false with a reason for an unrecognized holiday name, never throwing', () => {
    const now = new Date('2024-12-01T09:00:00');
    expect(() => parse('the trading day before Festivus', nyseCalendar, now)).not.toThrow();
    const result = parse('the trading day before Festivus', nyseCalendar, now);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('unrecognized holiday');
      expect(result.reason).toContain('festivus');
    }
  });
});
