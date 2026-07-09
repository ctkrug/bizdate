import { describe, expect, it } from 'vitest';
import { addCalendarDays, nextWeekday, previousWeekday, weekdayIndex } from '../src/parser/dateMath.js';

describe('addCalendarDays', () => {
  it('adds days including weekends', () => {
    const friday = new Date('2024-06-07T12:00:00');
    const result = addCalendarDays(friday, 5);
    expect(result.toISOString().slice(0, 10)).toBe('2024-06-12');
  });

  it('subtracts days when negative', () => {
    const date = new Date('2024-06-12T12:00:00');
    const result = addCalendarDays(date, -5);
    expect(result.toISOString().slice(0, 10)).toBe('2024-06-07');
  });

  it('is a no-op for zero days', () => {
    const date = new Date('2024-06-12T12:00:00');
    expect(addCalendarDays(date, 0).toISOString()).toBe(date.toISOString());
  });
});

describe('weekdayIndex', () => {
  it('resolves recognized weekday names case- and whitespace-insensitively', () => {
    expect(weekdayIndex('Friday')).toBe(5);
    expect(weekdayIndex('  monday ')).toBe(1);
    expect(weekdayIndex('SUNDAY')).toBe(0);
  });

  it('returns undefined for unrecognized names', () => {
    expect(weekdayIndex('funday')).toBeUndefined();
    expect(weekdayIndex('')).toBeUndefined();
  });
});

describe('nextWeekday', () => {
  it('resolves the upcoming Friday from a Wednesday', () => {
    const wednesday = new Date('2024-06-12T12:00:00'); // Wednesday
    const result = nextWeekday(wednesday, 5);
    expect(result.toISOString().slice(0, 10)).toBe('2024-06-14');
  });

  it('never returns the same day when `from` is already that weekday', () => {
    const friday = new Date('2024-06-14T12:00:00'); // Friday
    const result = nextWeekday(friday, 5);
    expect(result.toISOString().slice(0, 10)).toBe('2024-06-21');
  });
});

describe('previousWeekday', () => {
  it('resolves the most recent past Monday', () => {
    const wednesday = new Date('2024-06-12T12:00:00'); // Wednesday
    const result = previousWeekday(wednesday, 1);
    expect(result.toISOString().slice(0, 10)).toBe('2024-06-10');
  });

  it('never returns today even if today is that weekday', () => {
    const monday = new Date('2024-06-10T12:00:00'); // Monday
    const result = previousWeekday(monday, 1);
    expect(result.toISOString().slice(0, 10)).toBe('2024-06-03');
  });
});
