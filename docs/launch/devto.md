---
title: "Almanac: a date parser that knows when the market is closed"
published: false
tags: typescript, opensource, finance, webdev
---

Every finance or ops tool eventually has to answer a question a human typed: "what's the
next trading day?" or "what date is three business days after Thanksgiving?" The naive
version is easy and wrong. "Business day" is not "not Saturday or Sunday." The NYSE is
closed on Good Friday, on Juneteenth, and on the weekday it observes a holiday that fell on
a weekend. If your date math does not know that, it is off by a day exactly when money is
moving.

The usual fix is to bolt a natural-language date parser (chrono, a date-fns plugin) onto a
separate market-calendar package and write glue to make the two agree. That glue is the
part that goes subtly wrong. So I built [Almanac](https://apps.charliekrug.com/bizdate/): a
small TypeScript library where the language parsing and the holiday-aware business-day math
are one system, not two.

## Decision 1: a day-walk, not a formula

The tempting way to add N business days is a closed-form calculation: divide by 5, multiply
by 7, add the remainder, then correct for holidays. It is fast and it is a bug farm. Holiday
sets are not uniform. They change by exchange, by year, and by jurisdiction, so every
closed-form shortcut needs a correction table that drifts out of sync with the calendar it
is supposed to match.

Almanac walks the calendar one day at a time, asking `calendar.isTradingDay(date)` at each
step. Slower in theory, correct in practice, and trivially auditable. `addBusinessDays`
literally calls `nextTradingDay` in a loop.

That choice created one real bug, which is the interesting part. A day-walk driven by
user input is a denial-of-service vector: "10000000 business days after Christmas" is a
synchronous loop that froze the playground tab for eighteen seconds in testing. The fix is
a guard that rejects any count above a sane cap *before* the walk starts, so the parser
returns `{ ok: false, reason }` instead of hanging. Correctness and a hostile-input check
turned out to be the same feature.

## Decision 2: the calendar is a seam, not a constant

`parse()`, `nextTradingDay`, and friends all take a `Calendar` argument. The NYSE calendar
is the default instance you reach for, not an assumption baked into the algorithms.

The detail I like: `findHoliday` lives on the `Calendar` interface, not on the parser. So
when someone resolves "the trading day before Founders Day" against a company's internal
holiday list, there is no NYSE-specific code path to route around. The same `parse()` call
resolves the same phrase against any calendar. A custom `ListCalendar` built from three
made-up dates passes the exact same tests as the built-in one.

## A couple of bugs worth mentioning

Two more issues that hardening surfaced:

- Holiday aliases ("xmas", "mlk day") started life as a plain object. User input is the
  lookup key, and `aliases["__proto__"]` returns an object instead of `undefined`, which
  crashed a downstream string call. Switching to a `Map` closed it. Untrusted input as an
  object key is a classic footgun.
- The playground's "upcoming holidays" strip computed "today" with `toISOString()`, which
  is UTC. Compared against local calendar holiday dates, that shifts the cutoff by a day for
  anyone far enough from UTC, silently dropping or adding a holiday at the boundary. It now
  builds the date from local components.

## What I would do differently

The parser is a fixed rule table, not a real grammar. It recognizes a documented set of
phrase shapes and returns `ok: false` for anything else, which is honest but limited. The
next version grows that into broader natural-language coverage without giving up the "never
guess" contract. I would rather return "I did not understand that" than a confidently wrong
date.

Try it: [live playground](https://apps.charliekrug.com/bizdate/) ·
[source](https://github.com/ctkrug/bizdate)
</content>
