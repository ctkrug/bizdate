import { describe, expect, it } from 'vitest';
import { ListCalendar, NYSE_HOLIDAYS, addBusinessDays, isTradingDay, nextTradingDay, nyseCalendar, parse, previousTradingDay } from '../src/index.js';

// Every other test file imports submodules directly, so a broken re-export
// in this barrel — the actual entrypoint published to npm — would go
// undetected by the rest of the suite. This test exercises the public
// surface exactly as a consumer of the package would.
describe('public API (src/index.ts barrel)', () => {
  it('re-exports the calendar helpers and they behave correctly together', () => {
    expect(NYSE_HOLIDAYS.length).toBeGreaterThan(0);
    expect(nyseCalendar).toBeDefined();

    const friday = new Date('2024-06-07T09:00:00');
    expect(isTradingDay(friday, nyseCalendar)).toBe(true);
    expect(nextTradingDay(friday, nyseCalendar).toISOString().slice(0, 10)).toBe('2024-06-10');
    expect(previousTradingDay(friday, nyseCalendar).toISOString().slice(0, 10)).toBe('2024-06-06');
    expect(addBusinessDays(friday, 2, nyseCalendar).toISOString().slice(0, 10)).toBe('2024-06-11');
  });

  it('re-exports ListCalendar for building a custom calendar', () => {
    const custom = new ListCalendar([{ date: '2024-10-31', name: 'Founders Day' }]);
    expect(custom.isTradingDay(new Date('2024-10-31T09:00:00'))).toBe(false);
  });

  it('re-exports parse and resolves a phrase end-to-end', () => {
    const now = new Date('2024-12-01T09:00:00');
    const result = parse('the trading day before Christmas', nyseCalendar, now);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.date.toISOString().slice(0, 10)).toBe('2024-12-24');
    }
  });
});
