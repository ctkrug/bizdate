/** A single market holiday, closed for trading. */
export interface Holiday {
  /** ISO date string, YYYY-MM-DD. */
  date: string;
  /** Human-readable holiday name, e.g. "Thanksgiving Day". */
  name: string;
}

/** A trading/business calendar: knows which dates the market is open. */
export interface Calendar {
  /** True if `date` is a recognized holiday on this calendar. */
  isHoliday(date: Date): boolean;
  /** True if `date` is a trading day: not a weekend, not a holiday. */
  isTradingDay(date: Date): boolean;
}

/** The result of parsing a natural-language date phrase. */
export type ParseResult =
  | { ok: true; date: Date; input: string }
  | { ok: false; input: string; reason: string };
