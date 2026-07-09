# bizdate — architecture

A concise map of the codebase for anyone (human or model) picking this up cold.

## Layout

```
src/
  types.ts              # Calendar, Holiday, ParseResult — the shared vocabulary
  index.ts              # public library entrypoint (barrel export)
  calendar/
    nyse.ts             # NYSE_HOLIDAYS: raw holiday data, 2024-2026
    nyseCalendar.ts      # ListCalendar (Calendar impl) + the default nyseCalendar instance
    businessDay.ts       # isTradingDay/nextTradingDay/previousTradingDay/addBusinessDays
    index.ts             # calendar barrel export
  parser/
    index.ts             # parse(): tries each Rule in order, first match wins
    dateMath.ts           # addCalendarDays, weekdayIndex, nextWeekday, previousWeekday
    holidayAliases.ts     # shorthand -> canonical-substring normalization ("xmas" -> "christmas")
site/                   # Vite playground workspace, imports ../src directly (no build dep)
  index.html            # markup: hero header, phrase form, result "stamp", holiday ledger
  src/main.ts            # wires the form/input to parse(), debounced live resolution, ledger render
  src/style.css           # docs/DESIGN.md tokens + blueprint grid + all component styling
test/                    # one file per concern, mirrors src/ + cross-cutting behavior
docs/
  VISION.md              # why this exists, design decisions
  BACKLOG.md              # epics/stories with acceptance criteria (source of truth for "done")
  DESIGN.md                # visual direction: blueprint/technical, tokens, layout intent
```

## Data flow

`parse(input, calendar, now)` normalizes the phrase (trim + lowercase) and runs it through
an ordered list of `Rule` functions (`src/parser/index.ts`). Each rule is
`(normalized, calendar, now) => ParseResult | null` — `null` means "not my phrase, try the
next rule." The first non-null result wins; if nothing matches, `parse` returns a generic
`{ ok: false, reason: 'no rule matched...' }`.

Rules that reference a holiday by name (e.g. "the trading day before Christmas") go through
`resolveHoliday()`, which normalizes shorthand via `holidayAliases.ts` and calls
`Calendar#findHoliday(name, near)`. `findHoliday` lives on the `Calendar` interface (not the
parser) precisely so a fully custom, non-NYSE calendar resolves holiday-relative phrases with
no NYSE-specific code path — see `test/customCalendar.test.ts`.

Trading-day math (`nextTradingDay`, `previousTradingDay`, `addBusinessDays`) is a day-by-day
walk against `Calendar#isTradingDay`, deliberately not a closed-form calculation, so it stays
correct for any holiday set without special-casing. Plain calendar-day math ("in N days",
weekday references) lives in `parser/dateMath.ts` since it never needs a `Calendar` at all.

`parse()` guards two edges around that day-by-day walk: a NaN `now` is rejected up front
(otherwise the weekday-reference loops never terminate), and a business-day count above
`MAX_BUSINESS_DAY_COUNT` (5000) is rejected before the walk starts, since an unbounded count
is a synchronous-hang vector on the single-threaded playground. A resolved date that's still
outside JS's representable range (an extreme "in N days") is caught after the fact and turned
into `ok:false` rather than returned as an invalid `Date` under `ok:true`.

## The playground

`site/` is a separate npm workspace that imports `../src/index.ts` directly (see
`site/src/main.ts`) — it is not built against the published package, so library changes are
live during `npm run dev -w site`. `main.ts` debounces the phrase input (300ms), renders the
resolved date into the "stamp" (`#result-date` + an SVG underline that draws itself via
`stroke-dashoffset`, per `docs/DESIGN.md` §4), and renders the next 3 upcoming NYSE holidays
from `NYSE_HOLIDAYS` into the ledger strip.

`vite.config.ts` uses a relative base path so `npm run build -w site` produces a static
bundle relocatable to any subpath (e.g. `apps.charliekrug.com/bizdate/`).

## How to run things

```bash
npm install
npm test                # vitest, the whole library test suite
npm run test:coverage     # vitest run --coverage, scoped to src/** by vitest.config.ts
npm run typecheck        # tsc --noEmit
npm run lint             # eslint src test
npm run build             # tsc -p tsconfig.json -> dist/
npm run dev -w site        # live playground against the local src/
npm run build -w site       # static playground bundle -> site/dist/
```

## Known limits (by design, not bugs)

- `NYSE_HOLIDAYS` only has data for 2024-2026. Weekends are always recognized; holidays
  outside that range are not, and `test/yearBoundary.test.ts` pins down and documents this
  fallback rather than letting it be a silent surprise. Extend the array to cover more years.
- The parser is a fixed rule table, not a general NL grammar — supported phrase shapes are
  enumerated in `docs/BACKLOG.md` and exercised in `test/`.
