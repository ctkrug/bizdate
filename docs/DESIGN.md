# bizdate — design direction

## 1. Aesthetic direction

**Blueprint/technical.** bizdate is a precision instrument for calendar math, so the
playground looks like a drafting-table blueprint: fine graph-paper grid lines, crisp
cyan-on-navy linework, and a resolved date that gets "plotted" onto the page like a pen
stroke, not just printed. It's precise and a little industrial — the opposite of a soft
consumer app, which fits a tool aimed at finance/ops developers.

This is deliberately chosen against a generic dark-cards-plus-accent look: the grid,
the plotter-line reveal, and the cyan/amber blueprint palette are all specific to this
direction and wouldn't transfer to a different product unchanged.

## 2. Tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0B2545` | Page background (blueprint navy) |
| `--surface-1` | `#123057` | Card / panel surface |
| `--surface-2` | `#1A3E6F` | Raised surface (input, hovered row) |
| `--text` | `#E8EEF7` | Primary text |
| `--text-muted` | `#8FA6C9` | Secondary text, labels, grid annotations |
| `--accent` | `#5FD8EE` | Primary accent — linework, focus, the plotted date |
| `--accent-support` | `#F2A93B` | Support accent — holiday markers, warnings |
| `--success` | `#4ADE80` | Trading day / resolved-ok state |
| `--danger` | `#F76E6E` | Non-trading day / parse failure state |
| Display font | **Space Grotesk** (Google Fonts), fallback `system-ui, sans-serif` | Wordmark, headings |
| UI/data font | **JetBrains Mono** (Google Fonts), fallback `ui-monospace, monospace` | Input, resolved date, holiday ledger |
| Spacing unit | 8px scale (8/16/24/32/48/64) | All margins/padding |
| Corner radius | 4px | Sharp, drafted — not soft/rounded |
| Shadow/glow | 1px `--accent` outline + faint outer glow (`0 0 12px rgba(95,216,238,0.25)`) on focus/active | Reinforces the "lit linework" feel instead of soft drop shadows |
| Motion | UI transitions 150ms ease-out; the date-plot reveal is a 400ms `stroke-dashoffset` draw-on | Deliberate and mechanical, not bouncy |

## 3. Layout intent

**Hero:** the phrase input and the resolved-date "stamp" are the whole page — no feature
grid, no marketing filler above the fold.

- **Desktop (1440×900):** centered column, max-width ~640px, sitting on a full-viewport
  graph-paper grid background (faint `--surface-2` lines on `--bg`, ~32px cells). Input +
  resolve button take the upper third; the plotted date result fills the middle at large
  display-font scale; a compact holiday ledger (next 3 upcoming NYSE closures) runs along
  the bottom as a technical annotation strip. The grid background and the ledger strip
  keep the page from reading as a tiny widget in empty space even though the interactive
  surface itself is a single input.
- **Phone (390×844):** same stack, single column, ledger strip becomes a horizontally
  scrollable row of three chips. Grid cell size drops to ~20px so it stays a texture, not
  visual noise.

## 4. Signature detail

The resolved date doesn't just appear — it's **plotted**: an SVG underline draws itself
left-to-right under the date text (`stroke-dashoffset` animating to 0 over ~400ms) like a
pen finishing a line on a technical drawing, then a small crosshair mark ticks onto the
date as if a draftsman just confirmed the point. This is the one flourish; everything
else stays restrained so it reads as intentional rather than busy.

## 5. Games/toys juice plan

Not applicable — bizdate's playground is a utility (phrase in, date out), not a game.
The "plotted" reveal in §4 is the equivalent feedback moment: input → visible response
in under 400ms, always.
