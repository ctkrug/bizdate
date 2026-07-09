import type { Calendar, Holiday } from '../types.js';
import { NYSE_HOLIDAYS } from './nyse.js';

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** A Calendar backed by a fixed list of {@link Holiday} entries plus weekends. */
export class ListCalendar implements Calendar {
  private readonly holidays: readonly Holiday[];
  private readonly holidayDates: ReadonlySet<string>;

  constructor(holidays: readonly Holiday[]) {
    this.holidays = holidays;
    this.holidayDates = new Set(holidays.map((h) => h.date));
  }

  isHoliday(date: Date): boolean {
    return this.holidayDates.has(toISODate(date));
  }

  isTradingDay(date: Date): boolean {
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6;
    return !isWeekend && !this.isHoliday(date);
  }

  findHoliday(name: string, near: Date): Date | undefined {
    const needle = name.trim().toLowerCase();
    if (!needle) return undefined;

    const matches = this.holidays.filter((h) => h.name.toLowerCase().includes(needle));
    if (matches.length === 0) return undefined;

    const nearTime = near.getTime();
    let closest: Holiday | undefined;
    let closestDistance = Infinity;
    for (const holiday of matches) {
      const distance = Math.abs(new Date(`${holiday.date}T00:00:00`).getTime() - nearTime);
      if (distance < closestDistance) {
        closest = holiday;
        closestDistance = distance;
      }
    }
    return closest ? new Date(`${closest.date}T00:00:00`) : undefined;
  }
}

/** The default NYSE market calendar (2024-2026). */
export const nyseCalendar: Calendar = new ListCalendar(NYSE_HOLIDAYS);
