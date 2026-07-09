# Almanac

**▶ Live demo — [apps.charliekrug.com/bizdate](https://apps.charliekrug.com/bizdate/)**

[![CI](https://github.com/ctkrug/bizdate/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/bizdate/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Plain-English dates that know every market holiday. Type `"next trading day"` or
`"3 business days after Thanksgiving"` and get back the correct date, with weekends
*and* NYSE market holidays skipped. No configuration, no runtime dependencies.

## Why

Generic natural-language date libraries (chrono, date-fns language plugins, and the
like) parse `"next Monday"` just fine, but none of them know the NYSE is closed on Good
Friday, or that `"the trading day before Christmas"` is not simply December 24th when the
24th lands on a weekend. Finance and ops tooling ends up bolting a separate market-calendar
package onto a separate NL parser and gluing the two together by hand. That glue is exactly
the part that is easy to get subtly wrong.

Almanac composes both halves into one small library: a natural-language date parser whose
business-day math is market-holiday-aware from the start.

## What it does

- Parses everyday phrases: `"next trading day"`, `"3 business days after Thanksgiving"`,
  `"the trading day before Christmas"`, `"in 2 weeks"`, `"last Friday"`.
- Resolves them against a real market holiday calendar (NYSE to start), not just a
  weekend-skipping heuristic.
- Ships as a zero-runtime-dependency TypeScript library, plus a live playground so you can
  try phrases in the browser before wiring it into anything.

## Quickstart

```ts
import { parse, nyseCalendar } from 'bizdate';

parse('the trading day before Christmas', nyseCalendar, new Date('2024-12-01'));
// -> { ok: true, date: <Date for 2024-12-24>, input: '...' }

parse('3 business days after Thanksgiving', nyseCalendar, new Date('2024-11-01'));
// -> { ok: true, date: <Date for 2024-12-03>, input: '...' }
```

`parse()` never throws. It returns `{ ok: true, date }` when it understands the phrase, or
`{ ok: false, reason }` when it does not, so a form, a batch job, or a playground can all
treat "didn't understand that" as data.

## Supported phrases

| Phrase shape | Example |
|---|---|
| Next trading day | `next trading day` |
| Trading day relative to a holiday | `the trading day before Christmas` |
| Business days relative to a holiday | `3 business days after Thanksgiving` |
| Calendar-day / week offset | `in 10 days`, `in 2 weeks` |
| Weekday reference | `next Friday`, `last Monday` |
| Today | `today` |

Anything outside this set comes back as `{ ok: false, reason }`, never a wrong guess.

## Features

- Market-holiday-aware business-day arithmetic: `nextTradingDay`, `previousTradingDay`,
  `addBusinessDays`, `isTradingDay`, with the NYSE calendar built in.
- A dependency-injectable `Calendar` interface so other markets or calendars can be added
  without changing the parser.
- A static, self-contained playground (`site/`) demonstrating the parser live.

## Using a custom calendar

`parse()` and the business-day helpers all take a `Calendar` argument. The NYSE calendar is
just the default instance, not a hardcoded assumption. To use a different exchange or a
company's internal holiday list, build a `ListCalendar` from your own holiday data and pass
it in place of `nyseCalendar`:

```ts
import { ListCalendar, parse } from 'bizdate';

const myCalendar = new ListCalendar([
  { date: '2024-10-31', name: 'Founders Day' },
]);

parse('the trading day before Founders Day', myCalendar);
// -> { ok: true, date: <Date for 2024-10-30>, input: '...' }
```

Every phrase the parser understands resolves the same way against any `Calendar`. There is
no NYSE-specific code path to work around.

## Holiday data range

The built-in `nyseCalendar` has holiday data for 2024 through 2027 (see
`src/calendar/nyse.ts`). Weekends are always recognized, but a date outside that range is
treated as a trading day even if it would be a real NYSE holiday. There is no silent guess
at holidays for years without data. Extend `NYSE_HOLIDAYS`, or build a `ListCalendar` with
your own list, to cover further years.

## Stack

TypeScript, compiled with `tsc`, tested with [Vitest](https://vitest.dev/) (81 tests, 100%
line coverage on the core logic). The playground is a small [Vite](https://vitejs.dev/) app
that imports the library directly and builds to a static, relocatable bundle.

## Development

```bash
npm install
npm test          # run the test suite
npm run build     # type-check and compile the library
npm run lint      # lint the source
```

The playground lives in `site/` and is a separate npm workspace:

```bash
npm run dev -w site      # live playground against the local source
npm run build -w site    # static playground bundle -> site/dist/
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for a full map of the codebase and
[`docs/VISION.md`](docs/VISION.md) for the design rationale.

## License

MIT license. See [`LICENSE`](LICENSE).

---

More of Charlie's projects → [apps.charliekrug.com](https://apps.charliekrug.com)
</content>
</invoke>
