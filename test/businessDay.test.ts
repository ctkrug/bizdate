import { describe, expect, it } from 'vitest';
import { nyseCalendar } from '../src/calendar/nyseCalendar.js';
import { addBusinessDays, isTradingDay, nextTradingDay, previousTradingDay } from '../src/calendar/businessDay.js';

describe('isTradingDay', () => {
  it('treats weekdays without holidays as trading days', () => {
    expect(isTradingDay(new Date('2024-06-10T12:00:00'), nyseCalendar)).toBe(true); // Monday
  });

  it('treats weekends as non-trading days', () => {
    expect(isTradingDay(new Date('2024-06-08T12:00:00'), nyseCalendar)).toBe(false); // Saturday
    expect(isTradingDay(new Date('2024-06-09T12:00:00'), nyseCalendar)).toBe(false); // Sunday
  });

  it('treats NYSE holidays as non-trading days', () => {
    expect(isTradingDay(new Date('2024-12-25T12:00:00'), nyseCalendar)).toBe(false); // Christmas
  });

  it('recognizes 2027 holidays, including an observed-date shift', () => {
    expect(isTradingDay(new Date('2027-01-18T12:00:00'), nyseCalendar)).toBe(false); // MLK Day
    // Christmas 2027 falls on a Saturday, observed the preceding Friday.
    expect(isTradingDay(new Date('2027-12-24T12:00:00'), nyseCalendar)).toBe(false);
    expect(isTradingDay(new Date('2027-12-25T12:00:00'), nyseCalendar)).toBe(false); // the actual Saturday
  });
});

describe('nextTradingDay', () => {
  it('skips a weekend', () => {
    const friday = new Date('2024-06-07T12:00:00');
    const monday = nextTradingDay(friday, nyseCalendar);
    expect(monday.toISOString().slice(0, 10)).toBe('2024-06-10');
  });

  it('skips a holiday that falls on a weekday', () => {
    // Dec 24, 2024 is a Tuesday; Dec 25 is a Wednesday holiday.
    const dec24 = new Date('2024-12-24T12:00:00');
    const dec26 = nextTradingDay(dec24, nyseCalendar);
    expect(dec26.toISOString().slice(0, 10)).toBe('2024-12-26');
  });
});

describe('previousTradingDay', () => {
  it('skips backward over a weekend', () => {
    const monday = new Date('2024-06-10T12:00:00');
    const friday = previousTradingDay(monday, nyseCalendar);
    expect(friday.toISOString().slice(0, 10)).toBe('2024-06-07');
  });
});

describe('addBusinessDays', () => {
  it('adds trading days forward, skipping weekends', () => {
    const monday = new Date('2024-06-10T12:00:00');
    const result = addBusinessDays(monday, 5, nyseCalendar);
    // Mon->Tue->Wed->Thu->Fri->(skip Sat/Sun)->Mon
    expect(result.toISOString().slice(0, 10)).toBe('2024-06-17');
  });

  it('subtracts trading days backward when count is negative', () => {
    const monday = new Date('2024-06-17T12:00:00');
    const result = addBusinessDays(monday, -5, nyseCalendar);
    expect(result.toISOString().slice(0, 10)).toBe('2024-06-10');
  });
});
