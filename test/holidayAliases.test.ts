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
});
