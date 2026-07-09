import { describe, expect, it } from 'vitest';
import { ListCalendar } from '../src/calendar/nyseCalendar.js';
import { parse } from '../src/parser/index.js';

describe('a custom, non-NYSE Calendar', () => {
  // A fictional exchange that only observes Founders Day, not the NYSE list.
  const foundersCalendar = new ListCalendar([{ date: '2024-10-31', name: 'Founders Day' }]);

  it('resolves "next trading day" through the same parse() function, no NYSE-specific path', () => {
    // Oct 31, 2024 is a Thursday and a holiday on this calendar (but not NYSE's);
    // the next trading day should be Friday Nov 1.
    const now = new Date('2024-10-31T09:00:00');
    const result = parse('next trading day', foundersCalendar, now);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.date.toISOString().slice(0, 10)).toBe('2024-11-01');
    }
  });

  it('resolves a holiday-relative phrase against the custom holiday name', () => {
    const now = new Date('2024-10-01T09:00:00');
    const result = parse('the trading day before Founders Day', foundersCalendar, now);
    expect(result.ok).toBe(true);
    if (result.ok) {
      // Oct 31, 2024 is a Thursday; the trading day before it is Wednesday Oct 30.
      expect(result.date.toISOString().slice(0, 10)).toBe('2024-10-30');
    }
  });

  it('does not recognize NYSE-only holidays that are absent from the custom calendar', () => {
    const now = new Date('2024-11-01T09:00:00');
    const result = parse('the trading day after Thanksgiving', foundersCalendar, now);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('unrecognized holiday');
    }
  });
});
