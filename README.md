# bizdate

A tiny natural-language date parser that actually understands trading and business
calendars. Type "next trading day" or "3 business days after Thanksgiving" and get back
the correct actual date — weekends *and* market holidays skipped, no configuration
required.

## Why

Generic NL date libraries (chrono, date-fns natural-language plugins, etc.) parse
"next Monday" just fine, but none of them know that the NYSE is closed on Good Friday,
or that "the trading day before Christmas" isn't just "December 24th" when the 24th
falls on a weekend. Finance and ops tooling ends up bolting a separate market-calendar
library onto a separate NL parser and gluing the two together by hand.

bizdate composes both halves into one small library: a natural-language date parser
whose business-day math is market-holiday-aware from the start.

## What it does

- Parses everyday phrases: `"next trading day"`, `"3 business days after Thanksgiving"`,
  `"the trading day before Christmas"`, `"in 2 weeks"`, `"last Friday"`.
- Resolves them against a real market holiday calendar (NYSE to start), not just a
  weekend-skipping heuristic.
- Ships as a zero-dependency-at-runtime TypeScript library, plus a live playground so
  you can try phrases in the browser before wiring it into anything.

## Status

Feature-complete and ready to use — see [`docs/VISION.md`](docs/VISION.md) for the design
rationale and [`docs/BACKLOG.md`](docs/BACKLOG.md) for the full shipped scope.

## Features

- Natural-language parsing for relative dates, weekday references, and holiday-relative
  phrases ("the trading day before Christmas", "3 business days after Thanksgiving").
- Market-holiday-aware business-day arithmetic: `nextTradingDay`, `addBusinessDays`,
  `isTradingDay`, with the NYSE calendar built in.
- A dependency-injectable `Calendar` interface so other markets/calendars can be added
  without changing the parser.
- A static, self-contained playground (`site/`) demonstrating the parser live.

## Stack

TypeScript, compiled with `tsc`, tested with [Vitest](https://vitest.dev/). The
playground is a small [Vite](https://vitejs.dev/) app that imports the library
directly and builds to a static, relocatable bundle.

## Quickstart

```ts
import { parse, nyseCalendar } from 'bizdate';

parse('the trading day before Christmas', nyseCalendar, new Date('2024-12-01'));
// -> { ok: true, date: <Date for 2024-12-24>, input: '...' }

parse('3 business days after Thanksgiving', nyseCalendar, new Date('2024-11-01'));
// -> { ok: true, date: <Date for 2024-12-03>, input: '...' }
```

## Development

```bash
npm install
npm test        # run the test suite
npm run build    # type-check and compile the library
npm run lint      # lint the source
```

The playground lives in `site/` and is a separate npm workspace:

```bash
npm run build -w site
```

## Holiday data range

The built-in `nyseCalendar` has holiday data for 2024–2026 (see `src/calendar/nyse.ts`).
Weekends are always recognized, but a date outside that range is treated as a trading
day even if it would be a real NYSE holiday — there's no silent "guess" at holidays for
years without data. Extend `NYSE_HOLIDAYS` (or build a `ListCalendar` with your own list)
to cover further years.

## Using a custom calendar

`parse()` and the business-day helpers all take a `Calendar` argument — the NYSE
calendar is just the default instance, not a hardcoded assumption. To use a different
exchange or a company's internal holiday list, build a `ListCalendar` from your own
holiday data and pass it in place of `nyseCalendar`:

```ts
import { ListCalendar, parse } from 'bizdate';

const myCalendar = new ListCalendar([
  { date: '2024-10-31', name: 'Founders Day' },
]);

parse('the trading day before Founders Day', myCalendar);
// -> { ok: true, date: <Date for 2024-10-30>, input: '...' }
```

Every phrase the parser understands resolves the same way against any `Calendar` —
there's no NYSE-specific code path to work around.

## License

MIT — see [`LICENSE`](LICENSE).
