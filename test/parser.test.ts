import { describe, expect, it } from 'vitest';
import { nyseCalendar } from '../src/calendar/nyseCalendar.js';
import { parse } from '../src/parser/index.js';

describe('parse', () => {
  it('resolves "today" to the given now', () => {
    const now = new Date('2024-06-10T09:00:00');
    const result = parse('today', nyseCalendar, now);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.date).toBe(now);
    }
  });

  it('resolves "next trading day" skipping a weekend', () => {
    const friday = new Date('2024-06-07T09:00:00');
    const result = parse('next trading day', nyseCalendar, friday);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.date.toISOString().slice(0, 10)).toBe('2024-06-10');
    }
  });

  it('is case- and whitespace-insensitive', () => {
    const now = new Date('2024-06-10T09:00:00');
    const result = parse('  TODAY  ', nyseCalendar, now);
    expect(result.ok).toBe(true);
  });

  it('returns ok:false with a reason for unrecognized phrases', () => {
    const result = parse('purple monkey dishwasher', nyseCalendar);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('no rule matched');
    }
  });
});
