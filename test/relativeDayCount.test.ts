import { describe, expect, it } from 'vitest';
import { nyseCalendar } from '../src/calendar/nyseCalendar.js';
import { addBusinessDays } from '../src/calendar/businessDay.js';
import { parse } from '../src/parser/index.js';

describe('relative day-count phrases', () => {
  it('resolves "3 business days after Thanksgiving" by chaining off the holiday', () => {
    // Thanksgiving 2024 is Thursday Nov 28. +1 trading day -> Fri Nov 29,
    // +2 -> Mon Dec 2 (skipping the weekend), +3 -> Tue Dec 3.
    const now = new Date('2024-11-01T09:00:00');
    const result = parse('3 business days after Thanksgiving', nyseCalendar, now);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.date.toISOString().slice(0, 10)).toBe('2024-12-03');
    }
  });

  it('resolves "2 business days before Thanksgiving"', () => {
    // Thanksgiving 2024 is Thursday Nov 28. -1 -> Wed Nov 27, -2 -> Tue Nov 26.
    const now = new Date('2024-11-01T09:00:00');
    const result = parse('2 business days before Thanksgiving', nyseCalendar, now);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.date.toISOString().slice(0, 10)).toBe('2024-11-26');
    }
  });

  it('resolves "in 5 days" to now + 5 calendar days', () => {
    const now = new Date('2024-06-07T09:00:00'); // Friday
    const result = parse('in 5 days', nyseCalendar, now);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.date.toISOString().slice(0, 10)).toBe('2024-06-12');
    }
  });

  it('resolves "in 2 weeks" as 14 calendar days', () => {
    const now = new Date('2024-06-07T09:00:00');
    const result = parse('in 2 weeks', nyseCalendar, now);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.date.toISOString().slice(0, 10)).toBe('2024-06-21');
    }
  });

  it('returns ok:false with a reason for an unrecognized holiday in a business-day phrase', () => {
    const now = new Date('2024-11-01T09:00:00');
    const result = parse('3 business days after Festivus', nyseCalendar, now);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('unrecognized holiday');
      expect(result.reason).toContain('festivus');
    }
  });

  it('gives a different answer than a business-day offset when a weekend intervenes', () => {
    const friday = new Date('2024-06-07T09:00:00');
    const calendarDaysResult = parse('in 2 days', nyseCalendar, friday);
    const businessDaysResult = addBusinessDays(friday, 2, nyseCalendar);

    expect(calendarDaysResult.ok).toBe(true);
    if (calendarDaysResult.ok) {
      // "in 2 days" from Friday lands on Sunday (a non-trading day) because
      // it counts calendar days, not trading days.
      expect(calendarDaysResult.date.toISOString().slice(0, 10)).toBe('2024-06-09');
      // The business-day offset skips the same weekend and lands on Tuesday.
      expect(businessDaysResult.toISOString().slice(0, 10)).toBe('2024-06-11');
      expect(calendarDaysResult.date.getTime()).not.toBe(businessDaysResult.getTime());
    }
  });
});
