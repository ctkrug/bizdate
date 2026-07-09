/**
 * Common shorthand names for holidays, mapped to a substring that will match
 * the canonical holiday name on any {@link Calendar} (e.g. "mlk day" ->
 * "martin luther king", which is contained in "Martin Luther King, Jr. Day").
 *
 * This is phrase normalization, not calendar data: it never reads a
 * calendar's holiday list, so it applies identically no matter which
 * Calendar is passed to `parse()`.
 *
 * A `Map`, not a plain object: user input is used as the lookup key, and a
 * plain object's bracket access treats keys like "__proto__" or
 * "constructor" as a prototype-chain accessor rather than a missing entry,
 * returning an object instead of `undefined`.
 */
const HOLIDAY_ALIASES: ReadonlyMap<string, string> = new Map([
  ['xmas', 'christmas'],
  ['mlk day', 'martin luther king'],
  ['mlk', 'martin luther king'],
  ['presidents day', "washington's birthday"],
  ["president's day", "washington's birthday"],
  ['july 4th', 'independence day'],
  ['4th of july', 'independence day'],
]);

/** Normalizes a user-typed holiday name into a term suitable for `Calendar#findHoliday`. */
export function normalizeHolidayName(name: string): string {
  const trimmed = name.trim().toLowerCase();
  return HOLIDAY_ALIASES.get(trimmed) ?? trimmed;
}
