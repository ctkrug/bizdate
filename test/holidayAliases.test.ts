import { describe, expect, it } from 'vitest';
import { normalizeHolidayName } from '../src/parser/holidayAliases.js';

describe('normalizeHolidayName', () => {
  it('passes through names that already match a canonical holiday', () => {
    expect(normalizeHolidayName('Christmas')).toBe('christmas');
    expect(normalizeHolidayName('  Thanksgiving  ')).toBe('thanksgiving');
  });

  it('maps known shorthand to a matching substring', () => {
    expect(normalizeHolidayName('xmas')).toBe('christmas');
    expect(normalizeHolidayName('MLK Day')).toBe('martin luther king');
    expect(normalizeHolidayName('presidents day')).toBe("washington's birthday");
  });

  it('is case-insensitive for alias lookup', () => {
    expect(normalizeHolidayName('XMAS')).toBe('christmas');
  });

  it('treats Object.prototype property names as plain strings, not a prototype-chain lookup', () => {
    // A plain-object alias table returns Object.prototype itself for keys like
    // "__proto__"/"constructor" via bracket access, which then crashes any
    // caller that expects a string back (see e.g. ListCalendar#findHoliday).
    expect(normalizeHolidayName('__proto__')).toBe('__proto__');
    expect(normalizeHolidayName('constructor')).toBe('constructor');
    expect(normalizeHolidayName('hasOwnProperty')).toBe('hasownproperty');
  });
});
