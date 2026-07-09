import { describe, expect, it } from 'vitest';
import { ListCalendar, nyseCalendar } from '../src/calendar/nyseCalendar.js';

describe('findHoliday', () => {
  it('finds a holiday by case-insensitive substring match', () => {
    const near = new Date('2024-11-01T12:00:00');
    const result = nyseCalendar.findHoliday('thanksgiving', near);
    expect(result?.toISOString().slice(0, 10)).toBe('2024-11-28');
  });

  it('is case-insensitive', () => {
    const near = new Date('2024-11-01T12:00:00');
    const result = nyseCalendar.findHoliday('ChRiStMaS', near);
    expect(result?.toISOString().slice(0, 10)).toBe('2024-12-25');
  });

  it('picks the occurrence closest to `near` when multiple years match', () => {
    const near = new Date('2025-11-01T12:00:00');
    const result = nyseCalendar.findHoliday('christmas', near);
    expect(result?.toISOString().slice(0, 10)).toBe('2025-12-25');
  });

  it('returns undefined for an unrecognized holiday name', () => {
    const near = new Date('2024-11-01T12:00:00');
    expect(nyseCalendar.findHoliday('festivus', near)).toBeUndefined();
  });

  it('returns undefined for an empty or blank name', () => {
    const near = new Date('2024-11-01T12:00:00');
    expect(nyseCalendar.findHoliday('', near)).toBeUndefined();
    expect(nyseCalendar.findHoliday('   ', near)).toBeUndefined();
  });

  it('breaks an exact distance tie in favor of the earlier holiday', () => {
    // Midpoint between Christmas 2024 and Christmas 2025 (both noon UTC to
    // land the tie exactly): equidistant in both directions, so the choice
    // is a real policy decision, not an incidental default.
    const exactMidpoint = new Date('2025-06-25T12:00:00Z');
    const result = nyseCalendar.findHoliday('christmas', exactMidpoint);
    expect(result?.toISOString().slice(0, 10)).toBe('2024-12-25');
  });

  it('works identically through a custom non-NYSE ListCalendar', () => {
    const custom = new ListCalendar([{ date: '2024-10-31', name: 'Founders Day' }]);
    const near = new Date('2024-10-01T12:00:00');
    expect(custom.findHoliday('founders day', near)?.toISOString().slice(0, 10)).toBe('2024-10-31');
  });
});
