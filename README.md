# Handoff: CryptoSlotGuide — crypto gambling review index

## Overview
CryptoSlotGuide is a multi-vertical review and comparison site for the crypto gambling market: casinos, slots, game studios, sportsbooks (with sports and esports markets), house games, wallets, exchanges, coins, bonuses and guides. Its editorial position is measurement over marketing — every score traces to a figure someone recorded on a funded account, and the two signature features (RTP Watch and the Compare builder) exist to publish work competitors do not do.

The design is a single-page application with client-side routing across 15 page types. There is no backend in the prototype; all data is held in plain arrays in the logic class and the entire UI derives from it.

## About the design files
`CryptoSlotGuide.dc.html` in this bundle is a **design reference created in HTML** — a working prototype showing intended layout, copy, data model and behaviour. It is not production code to lift directly.

The task is to **recreate this design in the target codebase's environment** (React, Next.js, Vue, etc.) using that project's established patterns, routing and component library. If no codebase exists yet, Next.js with the App Router is the natural fit: the site is content-heavy, SEO-driven, and every page maps cleanly to a route with static or incrementally-regenerated data.

The prototype uses a small custom template runtime (`<sc-for>`, `<sc-if>`, `{{ }}` holes, a `renderVals()` method feeding the template). **Do not port that runtime.** Read it as: template = JSX, `renderVals()` = the component's derived state and props, `sc-for` = `.map()`, `sc-if` = conditional render.

## Fidelity
**High fidelity.** Colors, typography, spacing, copy and interaction states are final. Recreate pixel-accurately using the target project's primitives. Every value needed is listed under Design tokens below; anything not listed can be read directly off the prototype.

## Routing map
Client-side state `page` drives which view renders. Suggested real routes:

| Prototype state | Suggested route | View |
|---|---|---|
| `home` | `/` | Homepage — hero (animated colour wash + drifting logo wall), vertical strip, results ticker, featured reviews, casino index, slots, providers, coins, hubs, wallets/exchanges, methodology teaser |
| `btc` + `filter` | `/crypto-casinos`, `/crypto-casinos/no-kyc`, `/fastest-payouts`, `/lowest-wagering`, `/casino-sportsbooks`, `/esports-casinos` | Crypto casinos index. **Six views off one dataset**, each with its own breadcrumb, H1, standfirst, kicker and top-pick card, driven by `btcViews[filter]` + `filterFns[filter]`. Roobet holds the spotlight only where it qualifies for the filter — on No-KYC it drops out and the leader of that filtered list takes a top-pick card instead. |
| `live` | `/live-casino` | Live casino — operator cards then a table grid with type filters (Blackjack / Roulette / Baccarat / Game show / Card / Dice) |
| `livegame` | `/live-casino/[slug]` | Live table page — published return, min/max seat stake, studio, 3-step how-to-play, returns-by-bet panel, where-to-play table with per-operator limits and latency, sibling tables |
| `slotcat` | `/slots/bonus-buy`, `/slots/megaways`, `/slots/jackpot`, `/slots/cluster-pays`, `/slots/high-volatility` | Slot mechanic categories from `slotTags` + `slotCatDefs` |
| `predict` | `/prediction-markets` | Prediction markets — two lists split by settlement asset (crypto-settled vs regulated fiat), columns are settlement, cost to trade, identity requirement, payout, score |
| `fiat` | `/fiat-casinos` | Fiat casinos — deliberately a **separate list**, never merged into the crypto ranking |
| `review` | `/casinos/roobet` | Bespoke flagship casino review (hand-built) |
| `entity` | `/casinos/[slug]`, `/slots/[slug]`, `/providers/[slug]`, `/wallets/[slug]`, `/exchanges/[slug]`, `/betting/[slug]` | Generic review page, six entity types |
| `vertical` | `/slots`, `/providers`, `/sportsbooks`, `/wallets`, `/exchanges`, `/guides` | Shared vertical index (ranked table, optional tabs, optional award cards) |
| `coins` | `/coins` | Coin table + per-coin operator list |
| `watch` | `/rtp-watch` | **RTP Watch** matrix |
| `compare` | `/compare` | **Compare builder** |
| `bonuses` | `/bonuses` | Bonus tracker with real turnover cost |
| `house` | `/house-games` | House game index |
| `housegame` | `/house-games/[slug]` | How-to-play page |
| `guide` | `/guides/[slug]` | Guide article |
| `method` | `/how-we-rate` | Methodology |
| `search` | `/search?q=` | Search results |

Navigation: a **sectioned mega menu** with four top-level tabs — **Gambling**, **Sports betting**, **Prediction markets**, **Cryptocurrency**. Each opens a panel with a left rail of sections (emoji tile + label) and, per section, two columns of links plus a "See all N reviews" footer. Hovering a rail item swaps the columns; clicking it opens that section's index. `menu` holds the open tab, `rail` the highlighted section; the panel closes on `mouseleave` of the header.

Rail contents: Gambling → Crypto casinos, Live casino, Slots & RTP, Game providers, House games, Bonuses, Guides. Sports betting → Sportsbooks, Sports betting, Esports. Prediction markets → Crypto-settled, Regulated fiat, Markets vs books. Cryptocurrency → Wallets, Exchanges, Coins.

The header carries no standalone "Compare" link — it did not fit on one line at narrower widths and is reachable from the Gambling rail and the footer. If you add it back, the nav needs ~50px of headroom.

## Data model
All data lives as class fields. Port each to a typed model plus a data source (CMS, database or committed JSON — see the RTP section for the recommended split).

- **`ops`** (47) — casinos: `name, mono, score, payout, payoutLabel, licence, kyc, bonus, wager, conf, absorbsFee, ln, sports, esports, roobet`. There is deliberately **no numeric coin field** — coin counts derive from `coinsBy`.
- **`slots`** (16) — `name, mono, provider, rtp, vol, maxWin, bestAt, tint`
- **`slotTags`** / **`slotCatDefs`** — slot name → mechanic tags, and the five category definitions with their editorial framing
- **`liveCasinos`** (6) — `name, score, tables, studios, stakes, latency, note, tint`
- **`liveGames`** (12) — `name, type, studio, rtp, stake, max, edge, best, tint, how[], side[][], why`
- **`predMarkets`** — `{crypto: [5], fiat: [5]}`: `name, score, settle, fee, kyc, payout, vol, note, tint`
- **`fiatCasinos`** (6) — `name, score, licence, rails, payout, wager, games, note, tint`
- **`tickerFacts`** (8) — the scrolling results line under the hero
- **`providers`** (6) — `name, mono, tint, score, note, titles, rtp, casinos`
- **`walletRows`** (5) / **`exchangeRows`** (5) — `name, mono, hed, note, m1, m2, m3, score`
- **`houseGames`** (8) — `name, mono, tint, edge, rtp, fair, speed, note, steps[], tips[]`
- **`coinDefs`** (8) + **`coinFacts`** — ticker, tint, name, credit time, confirms, fee, note, distribution array (drives the bar spark)
- **`coinsBy`** — operator name → array of supported tickers. Drives the coin filter, coin chips, coin counts and the coins page.
- **`sbData`** — operator name → `{margin, markets, settle}`
- **`sportsMarkets`** (6) / **`esportsTitles`** (6) — market pages
- **`guideRows`** (8) + **`guideBodies`** — article metadata and body copy
- **`rtpWatch`** (10) + **`watchOps`** (6) — the RTP Watch matrix; see below
- **`editorial`** — `'type:name'` → one hand-written paragraph, rendered as the "Our take" block
- **`methodSteps`**, **`criteria`** — methodology page

### Derived, never stored
Reviews assemble from the data above in `entityView(type, name)`: headline, standfirst, verdict, six scored criteria, six measured stats, a spec table with fairness flags, a data table, pros and cons, and FAQs. **Keep this generative approach.** It means a data edit updates every surface at once, and it is why the site can carry 40+ reviews without 40 hand-written pages. The only hand-written prose per entity is the `editorial` paragraph.

Score bars use `crit(base, offsets[], names[])` — clamps `base + offset` to 5.5–9.9 and returns `{name, val, pct, color}`. Fairness flags use `flag('ok' | 'watch' | 'bad')` returning label + background + color.

## RTP Watch — the data pipeline that matters most
This is the site's differentiator and the part most likely to be mis-implemented, so treat it as a first-class data model rather than page content.

**What it publishes:** a matrix of slot title × operator, where each cell is the RTP that operator's own game client reports. Studios license multiple configurations of the same title; operators choose which they run; nothing in a lobby discloses it. So the same slot pays 96.51% at one casino and 94.50% at the next.

**There is no API and there never will be.** No studio publishes per-operator configurations, and no operator advertises a reduced one. Game clients are canvas-rendered, so the paytable cannot be scraped. Every figure is read by a human inside a funded account. Build for that reality.

**Required schema** (one row per cell, not per title):

```
rtp_reading
  id
  slot_slug         -> slots.slug
  operator_slug     -> operators.slug
  rtp               decimal(5,2)   e.g. 94.50
  published_rtp     decimal(5,2)   the studio's full-build figure
  checked_at        date
  checked_by        string         initials or user id
  source            enum('in_client_paytable','operator_support','reader_report')
  screenshot_url    string nullable
  notes             string nullable
```

Derive everything else: `cut = published_rtp - rtp`, clean/total counts per title, and a **staleness flag when `checked_at` is older than 30 days** (the prototype shows a "seen" date per row; in production surface stale cells explicitly, and prefer hiding a stale cell to showing an unverified one).

**Ingest, in priority order:**
1. **CSV or sheet import** — the pragmatic default. Testers work in a spreadsheet, one row per reading; the site imports it at build time. No CMS to teach, no auth to build.
2. **Reader reports** — a "report an RTP" form writing rows with `source='reader_report'`, held unpublished until a tester reproduces them. This is the cheap sensor between full passes.
3. **Lobby diffing** — most operators expose a lobby JSON listing game IDs. Poll weekly, diff, and use it to generate the *worklist* (title added, swapped or removed) rather than to read RTP. This is the only genuinely automatable part.

**Operational shape the design assumes:** batch by operator, not by title — the login is the expensive step, so one tester checks ~20 titles inside one casino in about twenty minutes. Only titles from studios that license multiple configurations need per-operator checks; single-configuration studios (Hacksaw, Nolimit City, Push) need one annual check. That reduces the real matrix to roughly 20 titles × 8 operators.

**Do not** model RTP as a single field on the slot record. The whole product claim is that one slot has many RTPs, and a per-title field silently discards it.

## Editability requirement
The client will publish and maintain content and needs to change it without a developer. Two things must stay editable outside code:

1. **All entity data** — the arrays above. CMS collections or committed JSON both work; the requirement is that changing a spread, an RTP range or a payout time updates every derived surface (headline, verdict, stats, pros/cons, tables) with no other edits.
2. **The `editorial` paragraph per entity** — a single rich-text field keyed by entity. Present, it renders as the "Our take" block; absent, the review still stands on its data. This is the one place a human voice enters an otherwise generated page.

## Layout system
- Page shell: `min-height:100vh`, background `#07090B`, text `#E8EDF0`
- Content width: `max-width:1400px`, `padding:0 40px` (articles and search narrow to `820–1180px`)
- Sticky header: `height:68px`, `background:rgba(9,12,15,.92)`, `backdrop-filter:blur(14px)`, bottom border `1px solid rgba(255,255,255,.07)`, `z-index:40`
- Below it, a permanent advertiser-disclosure strip
- Tables: CSS grid rows inside a bordered, rounded container, `overflow-x:auto` with an explicit `min-width` so columns never crush; header row `background:#101519`
- Card grids: `display:grid` + `gap:12px`; 4-up for slot/game cards, 5-up for award cards, 3-up for operator cards
- All spacing is flex/grid `gap`, never margins between siblings

## Design tokens

**Color**
| Token | Value | Use |
|---|---|---|
| Page background | `#07090B` | Body |
| Section background | `#090C0F` | Hero bands |
| Surface | `#0C1013` | Cards, table bodies |
| Surface raised | `#0F1417` | Hover, nested rows |
| Surface header | `#101519` | Table header rows |
| Surface hero card | `#12181C` | Score cards |
| Menu surface | `#0D1215` | Dropdowns |
| Accent | `#00C2CC` | Primary, links, CTAs |
| Accent bright | `#5FE3E8` | Hover, winning values, positive flags |
| Accent gold | `#FFCC00` | Top-pick emphasis only |
| Warning | `#DA9877` | Cut builds, negative flags |
| Caution | `#D6B65C` | "Watch" flags |
| Text primary | `#fff` / `#E8EDF0` | Headings / body |
| Text secondary | `#B7C4CB` | Table values |
| Text muted | `#93A3AC`, `#8DA0AA` | Standfirsts, notes |
| Text dim | `#7B8A93`, `#5C6A72`, `#4E5A62` | Meta, labels, timestamps |
| Border | `rgba(255,255,255,.07)` | Default |
| Border strong | `rgba(255,255,255,.14)` / `.16` | Buttons |
| Row divider | `rgba(255,255,255,.05)` | Table rows |
| Row hover | `rgba(255,255,255,.028)` | Table rows |
| Accent wash | `rgba(0,194,204,.10)` / `.12` | Selected chips, winning cells |

Per-brand and per-coin tints are stored on the records (`tint`) — mid-tone values chosen to read on dark. Coin tints follow convention: BTC `#F7931A`, ETH `#8FA5C9`, USDT `#5FBFA0`, SOL `#7BE0B8`, LTC `#B4B8BB`, DOGE `#D6B65C`, XRP `#9FB6E0`, TRX `#C4795A`.

**Typography** — Archivo (variable, weights 400–800, width axis 62–125) for everything except numerics; JetBrains Mono (400/500/700) for all data, labels, timestamps and metadata. The mono/sans split is the site's strongest visual signature: **every measured number is monospaced.**

| Role | Size / weight / tracking |
|---|---|
| Page H1 | 44–60px / 800 / `-.035em` / `font-stretch:114–118%` |
| Section H2 | 26–32px / 800 / `-.028em` / `font-stretch:112%` |
| Card title | 15–17px / 700 / `-.02em` |
| Body | 15–17px / 400 / `line-height:1.6–1.75` |
| Standfirst | 16.5–19px / 400 / `line-height:1.65` |
| Table value | 12.5–15px / JetBrains Mono 500 |
| Column header | 10.5px / mono / `letter-spacing:.07em` / uppercase |
| Kicker | 10.5–11px / mono / `letter-spacing:.09em` / uppercase / accent |
| Big score | 60px / mono 700 / `-.045em` |

Use `text-wrap:pretty` on paragraphs and `text-wrap:balance` on headings throughout.

**Radius** — 4–5px chips and flags, 6–9px buttons and small tiles, 12–14px cards and tables, 16px hero cards, 100px pills.

**Shadow** — table/card `0 12px 40px rgba(0,0,0,.35)`; hero card `0 20px 60px rgba(0,0,0,.5)`; dropdown `0 22px 60px rgba(0,0,0,.65)`; accent CTA `0 8px 26px rgba(0,194,204,.24)`.

**Motion** — hero and live surfaces add: `csg-drift` / `csg-drift2` (18–30s ease-in-out infinite, slow translate+scale on four blurred colour auras), `csg-sweep` (11s linear, animated multi-hue gradient across the hero headline), `csg-slide` (46s linear, the results ticker), `csg-up` / `csg-down` (34–48s linear, the three drifting logo-wall columns), and `csg-live` (2s ease-out, pulsing ring on the live-casino badge). Elsewhere, only two keyframes: `csg-pulse` (2–2.4s ease-in-out infinite, opacity .55→1) on live indicators, and `csg-rise` (.16–.5s ease, 8px translateY + fade) on dropdowns and hero cards. Hover transitions are the browser default. Keep it this restrained.

## Interactions
- **Sorting** — casino and slot tables sort by column, arrow glyph (`↓`/`↑`) on the active key, direction toggles on repeat click. The top pick is pinned above sorted results with a toggle to release it.
- **Filtering** — pill rows with live counts: casino index (all 47 / no-KYC 21 / fastest 15 / lowest wagering 31 / sportsbook 35 / esports 18 — each a full page view, not just a table filter), coins (all + 8 tickers), bonuses (all / cashback / rakeback / deposit match), RTP Watch (all / cut somewhere), live tables (all + 6 types), slot mechanics (5 categories), prediction markets (crypto-settled / regulated fiat).
- **Row cap** — the casino index renders 20 rows with a "Show all N casinos" button; `btcAll` in state releases it. Filters reset it.
- **Tabs** — the sportsbooks vertical carries three (Sportsbooks / Sports / Esports); each swaps both rows and the three metric column headings.
- **Compare builder** — operator chips toggle selection, capped at 4 and floored at 2 (below that, an empty state). Winner-per-row is computed by direction: lower is better on payout, wagering and confirmations; higher on score and coin count; licence and headline offer are deliberately unmarked because neither reduces to one axis. Ties show as ties.
- **Search** — live filter across seven datasets, grouped by type, with suggestion chips. No debounce needed at this data size; add one if the real index is fetched.
- **FAQ accordions** — one open at a time, `+`/`−` glyph.
- **Image slots** — the prototype uses a drag-and-drop `<image-slot>` web component so the client can drop screenshots without a developer. In production these are ordinary images from the CMS; the review layout expects one 1.6:1 primary and two smaller stacked shots, each with a monospaced caption.

## Every published figure is derived — keep it that way
This is the single most important rule to carry into production, and the one that cost the most to enforce. **No count, median, superlative or comparison on this site is a literal.** All of them compute from the arrays:

- Counts: `C.casinos`, `C.slots`, `C.live`, `C.total` etc., feeding the hero badge, "See all N reviews", the vertical strip, mega-menu labels and every vertical page's stat block.
- Medians and ranks: `indexMedianPayout()`, `payoutRank(name)`, `payoutClaim(name)` ("third fastest of 47 operators"), `medianRtp()`, `splitBuilds()`, `medianReadMins()`, `bestSpread()`, `topScore(list)`.
- Flags counted, not asserted: `feeAbsorbers()`, `lightningOps()`, `singleRtpStudios()`, `selfCustodyWallets()`, `largestCatalogue()`.
- Prose: strings carry `{casinos}`, `{fee}`, `{ln}`, `{coins}` tokens resolved by `fill()` on read, so guide bodies and FAQ answers cannot drift from the data.
- Criticisms: `casinoCons(o)` walks an operator's own record in priority order (wagering above 1×, confirmations above 1, payout above the index median, live-table position, fee absorption, missing coins, Lightning, KYC posture, sportsbook gaps) and takes the first four that genuinely apply. `liveCon(name)` returns `null` rather than inventing a fault for the category leader.

A hardcoded "18 operators" or "fastest payouts" survives one dataset change and then lies. Port the helpers, not the sentences.

## Canonical routing caveat
Roobet has a hand-written review (`page:'review'`) as well as an auto-assembled entity page. `eJump('casino', name)` checks the `roobet` flag and routes to the hand-written one, so every surface resolves to a single canonical URL. In production, make this a property of the operator record (`hasCustomReview`) rather than a name check.

## Accessibility notes to carry over
Tables use `role="table" / row / columnheader / cell`. Sortable headers are real `<button>`s. Contrast was audited against the dark surfaces — the muted greys (`#5C6A72` and below) are used only for non-essential metadata; do not promote them to body text.

## Assets
- `assets/roobet-logo.png` — supplied by the client
- `assets/logos/*.png` (34) — placeholder brand marks generated for this prototype: transparent PNG, monogram in the brand's assigned tint. **Replace every one with the operator's real logo.** Where a supplied logo has a solid background it needs knocking out to transparency, and near-black wordmarks need inverting to read on the dark shell.
- Fonts: Archivo and JetBrains Mono, both Google Fonts.
- No icon set — the few glyphs in use (`→`, `◆`, `⌕`, `▼`, `+`, `−`) are text characters.

## Files
- `CryptoSlotGuide.dc.html` — the entire design: all 20 page types, the full data model, and every interaction.
- `support.js` — the prototype's template runtime. **Reference only; do not port.**
- `image-slot.js` — the drag-and-drop image placeholder component. Prototype-only.
- `assets/` — logo placeholders and the client's Roobet logo.
- `../github.md` — repo association, last-sync record and a screen → source map.

## Known gaps to close before publish
- Payout times and scores on the 29 casinos added from the client's list are **placeholders**. They need real timed withdrawals before publish.
- `assets/logos/*` are monogram placeholders, not real brand marks.
- The site has never been tested below ~700px; the header, tables and card grids reflow correctly at 909px but a genuine mobile pass has not been done.
- No dates or bylines on auto-assembled reviews beyond the shared "tested" line — worth adding per-entity `lastTestedAt`.

## Build order suggestion
1. Data models + the six-criteria scoring and flag helpers.
2. Shell (header, dropdowns, disclosure strip, footer) and the shared table primitive.
3. Vertical index page — one component, six data sources.
4. Generic review page — one component, six entity types, plus the editorial override.
5. RTP Watch with the reading schema and CSV import. Do this early; it is the differentiator and it shapes the slot models.
6. Compare builder, coins, bonuses, house games, guides, methodology, search.
