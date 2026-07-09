# bizdate — backlog

Epics are ordered so the wow moment ships first. Every story has concrete, verifiable
acceptance criteria — no "works well" vibes checks.

## Epic 1 — Core NL parsing & trading-day resolution (the wow moment)

- [x] **1.1 Parse holiday-relative trading-day phrases** *(wow moment)*
  - Parsing `"the trading day before Christmas"` for a given year returns the correct
    NYSE trading day, skipping both a weekend and the Dec 25 holiday itself.
  - Parsing `"the trading day after Thanksgiving"` resolves to the actual next trading
    day, correctly skipping any adjacent weekend.
  - An unrecognized holiday name returns `{ ok: false, reason }`, never a thrown
    exception.

- [x] **1.2 Parse relative day-count phrases**
  - `"3 business days after Thanksgiving"` resolves by chaining `addBusinessDays` off the
    resolved holiday date.
  - `"in 5 days"` resolves to now + 5 *calendar* days (distinct from a business-day
    offset), and a test asserts the two give different answers when a weekend/holiday
    intervenes.

- [x] **1.3 Parse weekday references**
  - `"next Friday"` from a known Wednesday resolves to the correct upcoming Friday.
  - `"last Monday"` resolves to the most recent past Monday and never returns today's
    date even if today is a Monday.

- [ ] **1.4 Design polish: apply docs/DESIGN.md to the playground**
  - The grid background, Space Grotesk/JetBrains Mono fonts, and cyan-on-navy palette
    from `docs/DESIGN.md` are applied to `site/`.
  - The "plotted" resolved-date reveal (stroke-dashoffset draw-on) fires on every
    successful resolve, per `docs/DESIGN.md` §4.

## Epic 2 — Calendar correctness & extensibility

- [ ] **2.1 Validate NYSE holiday data**
  - A test asserts every date in `NYSE_HOLIDAYS` falls on a weekday.
  - A test asserts the holiday list is sorted ascending and has no duplicate dates.

- [x] **2.2 Prove the Calendar interface is truly pluggable**
  - A `ListCalendar` built from a custom (non-NYSE) holiday list resolves the same
    phrases correctly through the same `parse()` function, with no NYSE-specific code
    path.
  - README documents how to construct and pass a custom `Calendar`.

- [x] **2.3 Year-boundary coverage**
  - `nextTradingDay` from Dec 31 correctly rolls into January of the following year.
  - Requesting a trading day beyond the hardcoded holiday range has documented,
    tested behavior (not a silent wrong answer).

## Epic 3 — Playground experience

- [ ] **3.1 Live-as-you-type resolution**
  - Typing in the phrase input updates the result within 300ms of the user pausing,
    with no need to press Resolve.
  - Rapid keystrokes are debounced, not queued (no overlapping/out-of-order updates).

- [ ] **3.2 Upcoming-holidays ledger strip**
  - The ledger shows the next 3 NYSE holidays after today, sourced from
    `NYSE_HOLIDAYS`.
  - The ledger is correct across a year boundary (e.g. viewed on Dec 30, it shows into
    the following January).

- [ ] **3.3 Error and empty states**
  - An empty phrase input shows a designed empty state, never a blank result area.
  - An unrecognized phrase shows the `ok:false` reason as styled text (`--danger`
    token), never raw JSON.

- [ ] **3.4 Responsive layout at 390 / 768 / 1440**
  - No horizontal scroll or element overlap at any of the three widths.
  - The holiday ledger becomes a horizontally scrollable chip row below 768px, per
    `docs/DESIGN.md` §3.

- [ ] **3.5 Design polish: interaction states & accessibility pass**
  - Every control (input, button) has themed hover, focus-visible, active, and
    disabled states — no naked native widgets.
  - Full keyboard tab order reaches every interactive element with visible focus at
    each stop.

## Epic 4 — Packaging & docs

- [x] **4.1 Publish-ready package metadata**
  - `npm run build` produces `dist/index.js` and `.d.ts` files importable from a fresh
    Node ESM script.
  - `npm pack --dry-run` shows only `dist/` (plus manifest files) in the tarball —
    no `src/` or `test/` leakage.

- [x] **4.2 README quickstart with real examples**
  - README includes a copy-pastable snippet importing bizdate and resolving at least
    two phrases from Epic 1.
  - The snippet's phrases match phrases actually covered by a test in `test/`, so the
    README can't silently drift from what the library supports.
