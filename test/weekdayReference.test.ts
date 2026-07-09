import { describe, expect, it } from 'vitest';
import { nyseCalendar } from '../src/calendar/nyseCalendar.js';
import { parse } from '../src/parser/index.js';

describe('weekday reference phrases', () => {
  it('resolves "next Friday" from a known Wednesday', () => {
    const wednesday = new Date('2024-06-12T09:00:00');
    const result = parse('next Friday', nyseCalendar, wednesday);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.date.toISOString().slice(0, 10)).toBe('2024-06-14');
    }
  });

  it('resolves "last Monday" to the most recent past Monday', () => {
    const wednesday = new Date('2024-06-12T09:00:00');
    const result = parse('last Monday', nyseCalendar, wednesday);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.date.toISOString().slice(0, 10)).toBe('2024-06-10');
    }
  });

  it('never resolves "last Monday" to today, even if today is a Monday', () => {
    const monday = new Date('2024-06-10T09:00:00');
    const result = parse('last Monday', nyseCalendar, monday);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.date.toISOString().slice(0, 10)).toBe('2024-06-03');
    }
  });

  it('never resolves "next Friday" to today, even if today is a Friday', () => {
    const friday = new Date('2024-06-14T09:00:00');
    const result = parse('next Friday', nyseCalendar, friday);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.date.toISOString().slice(0, 10)).toBe('2024-06-21');
    }
  });

  it('is case-insensitive', () => {
    const wednesday = new Date('2024-06-12T09:00:00');
    const result = parse('NEXT friday', nyseCalendar, wednesday);
    expect(result.ok).toBe(true);
  });
});
