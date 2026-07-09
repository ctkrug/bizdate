# bizdate — vision

## The problem

Anyone building finance or ops tooling eventually needs to answer questions like "what's
the next trading day?" or "what date is three business days after Thanksgiving?" in
response to something a human typed, not a date picker. Generic NL date libraries
(chrono-node, date-fns's language plugins, etc.) parse the *language* well but treat
"business day" as "not Saturday or Sunday" — they have no concept of a market holiday.
Real trading-day math needs to know the NYSE is closed on Good Friday, that Juneteenth
became a market holiday in 2022, and that a holiday landing on a Saturday gets observed
the preceding Friday.

Today, teams solve this by bolting a separate market-calendar package onto a separate NL
date parser and writing glue code to make the two agree with each other. That glue code
is exactly the part that's easy to get subtly wrong (which layer resolves "next trading
day" — the parser's naive weekend-skip, or the calendar's holiday-aware skip?).

## Who it's for

Developers building anything that takes a human-readable date phrase and needs to
resolve it against a real market calendar: settlement-date calculators, trading ops
dashboards, back-office scheduling tools, finance internal tools. Anyone who has typed
`date-fns` and `chrono-node` into the same `package.json` and then written their own glue
is the target user.

## The core idea

One small library where the NL parser and the business-day math are the *same* system,
not two systems glued together. `parse()` never resolves a phrase like "next trading
day" with a naive weekend check — it always resolves it through a `Calendar`, so holiday
awareness isn't an opt-in feature, it's the only way the library works.

The `Calendar` interface is intentionally the seam: bizdate ships an NYSE calendar out of
the box, but nothing about the parser or the business-day math is NYSE-specific. A
consumer can supply their own `Calendar` (a different exchange, a company's internal
holiday list) and every phrase resolves against it identically.

## Key design decisions

- **Calendar is dependency-injected, not hardcoded.** `parse()`, `nextTradingDay()`, and
  friends all take a `Calendar` argument. The NYSE calendar is the default *instance*
  users reach for, not a built-in assumption baked into the algorithms.
- **Parsing never throws.** `parse()` returns a `ParseResult` — `{ ok: true, date }` or
  `{ ok: false, reason }` — so a playground, a form validator, or a batch job can all
  handle "didn't understand that" as data, not a caught exception.
- **Business-day math is a day-walk, not a closed-form calculation.** Holiday sets aren't
  uniform (they change by exchange, by year, by jurisdiction), so `addBusinessDays` steps
  day-by-day through the calendar rather than trying to compute an offset formula. Slower
  in theory, correct in practice, and trivially auditable.
- **Zero runtime dependencies.** The library itself ships with no dependencies beyond the
  TypeScript standard lib — smaller surface area for a consumer to audit, and no NL-parser
  or date-math dependency to fall out of sync with.
- **Static, relocatable playground.** The demo site is a plain static bundle with
  relative asset paths, so it can be dropped at any subpath (`apps.charliekrug.com/bizdate`)
  with no server-side configuration.

## What "v1 done" looks like

- The parser understands the full phrase set from the backlog: relative day counts
  ("in 3 days"), weekday references ("next Friday", "last Monday"), and — the signature
  capability — holiday-relative trading-day phrases ("the trading day before Christmas",
  "3 business days after Thanksgiving").
- `nextTradingDay`, `previousTradingDay`, `addBusinessDays`, and `isTradingDay` are fully
  tested against real NYSE calendar boundaries (holiday-adjacent weekends, holidays that
  fall on a weekday, year boundaries).
- The playground lets a visitor type any of the supported phrases and see the resolved
  date immediately, with the "trading day before Christmas" wow moment reachable with zero
  configuration on page load.
- CI is green: typecheck, lint, tests, and both the library and site build cleanly on
  every push.
