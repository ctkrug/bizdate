import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { toLocalIsoDate, upcomingHolidays } from '../site/src/ledger.js';

describe('toLocalIsoDate', () => {
  it('formats using local date components, not toISOString()', () => {
    // Constructing with the local Date(y, m, d, ...) constructor pins this to
    // local time regardless of which timezone the test runner itself is in.
    const localEvening = new Date(2026, 8, 6, 19, 0, 0); // Sun Sep 6, 2026, 7pm local
    expect(toLocalIsoDate(localEvening)).toBe('2026-09-06');
  });
});

describe('upcomingHolidays', () => {
  const holidays = [
    { date: '2026-09-07', name: 'Labor Day' },
    { date: '2026-11-26', name: 'Thanksgiving Day' },
    { date: '2026-12-25', name: 'Christmas Day' },
    { date: '2027-01-01', name: "New Year's Day" },
  ];

  it('includes a holiday that falls the very next local calendar day', () => {
    // This is the exact case the UTC-based bug got wrong: a moment late in
    // the UTC day whose local calendar date is still the day before Labor
    // Day must still list Labor Day as upcoming.
    const today = new Date(2026, 8, 6, 19, 0, 0); // Sep 6, 2026, 7pm local
    const result = upcomingHolidays(holidays, today, 3);
    expect(result.map((h) => h.name)).toEqual(['Labor Day', 'Thanksgiving Day', 'Christmas Day']);
  });

  it('excludes a holiday that falls on today\'s local calendar date', () => {
    const today = new Date(2026, 8, 7, 8, 0, 0); // Labor Day itself, 8am local
    const result = upcomingHolidays(holidays, today, 3);
    expect(result.map((h) => h.name)).toEqual(['Thanksgiving Day', 'Christmas Day', "New Year's Day"]);
  });

  it('respects the limit', () => {
    const today = new Date(2026, 0, 1, 0, 0, 0);
    const result = upcomingHolidays(holidays, today, 2);
    expect(result).toHaveLength(2);
  });
});

describe('upcomingHolidays under a non-UTC timezone', () => {
  // Force a real, far-from-UTC timezone so this test fails if the
  // implementation ever regresses to a UTC-based cutoff (toISOString()),
  // regardless of what timezone the CI runner itself defaults to.
  const originalTz = process.env.TZ;

  beforeAll(() => {
    process.env.TZ = 'Pacific/Honolulu';
  });

  afterAll(() => {
    process.env.TZ = originalTz;
  });

  it('still includes tomorrow\'s holiday even late in the UTC day', () => {
    // 2026-09-07T05:00:00Z is 2026-09-06 19:00 in Honolulu (UTC-10) — Labor
    // Day (Sep 7) is still "tomorrow" locally, even though its UTC calendar
    // date has already arrived.
    const today = new Date('2026-09-07T05:00:00Z');
    const holidays = [{ date: '2026-09-07', name: 'Labor Day' }];
    expect(upcomingHolidays(holidays, today, 3).map((h) => h.name)).toEqual(['Labor Day']);
  });
});
