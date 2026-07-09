import { describe, expect, it } from 'vitest';
import { NYSE_HOLIDAYS } from '../src/calendar/nyse.js';

describe('NYSE_HOLIDAYS data', () => {
  it('has every holiday falling on a weekday, not a weekend', () => {
    for (const holiday of NYSE_HOLIDAYS) {
      const day = new Date(`${holiday.date}T00:00:00`).getDay();
      expect(day, `${holiday.date} (${holiday.name}) should be a weekday`).toBeGreaterThanOrEqual(1);
      expect(day, `${holiday.date} (${holiday.name}) should be a weekday`).toBeLessThanOrEqual(5);
    }
  });

  it('is sorted ascending by date', () => {
    const dates = NYSE_HOLIDAYS.map((h) => h.date);
    const sorted = [...dates].sort();
    expect(dates).toEqual(sorted);
  });

  it('has no duplicate dates', () => {
    const dates = NYSE_HOLIDAYS.map((h) => h.date);
    expect(new Set(dates).size).toBe(dates.length);
  });
});
