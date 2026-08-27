# Data

These JSON files match the shapes in [`lib/types.ts`](../lib/types.ts).

**Ported verbatim from the prototype** (`CryptoSlotGuide.dc.html`), not seed
placeholders: `ops.json` (all 47 casinos), `slots.json` (all 16 slots),
`slotTags.json`, `slotCatDefs.json`, `coinsBy.json` (all 47 operators),
`coinDefs.json`, `tickerFacts.json`, `liveCasinos.json`, `sbData.json`,
`sportsMarkets.json`, `fiatCasinos.json`, `predMarkets.json`,
`liveGames.json`, `providers.json`, `walletRows.json`, `exchangeRows.json`,
`houseGames.json`, `guideRows.json`, `guideBodies.json`, `esportsTitles.json`,
`watchOps.json`, `criteria.json`, `methodSteps.json`, `editorial.json` (all
6 hand-written "Our take" entries from the source's `editorial` object —
this is intentionally a short, hand-curated list, not a placeholder subset),
`rtpWatch.json` used to hold 60 readings faithfully reshaped from the
prototype's per-title `cuts[]` arrays — that snapshot was **wiped to `[]`
on 26–27 Aug 2026** once the real ingest pipeline shipped (see below).
Carrying the prototype's invented numbers forward as if they were real
readings was exactly the kind of overclaim the review-methodology work
that day was trying to close, not open a new instance of.

## RTP Watch — real pipeline, not seed data

`rtpWatch.json` and `fieldTestedOperators.json` hold **only real data**
now, both starting empty. Populate them with:

```
npm run import:rtp -- path/to/readings.csv
```

See `scripts/import-rtp-readings.mjs`'s header comment for the full
contract and `data/rtp-readings-template.csv` for the CSV shape (columns
match root `README.md`'s `rtp_reading` schema exactly). The script
validates every row against real `slots.json`/`ops.json` slugs, rejects
the whole batch on any bad row rather than partially writing, upserts by
`(slot_slug, operator_slug)` so re-imports update rather than duplicate,
and auto-extends `watchOps.json` and `fieldTestedOperators.json` when a
CSV introduces a new operator — reading a paytable inside an account
needs the same funded account the rest of that operator's "field-tested"
claims do (see `lib/field-tested.ts`).

Readings older than 30 days are treated as unchecked everywhere they're
used (`lib/derived.ts`'s `isStaleReading`), per root `README.md`'s "prefer
hiding a stale cell to showing an unverified one."

Per the root `README.md`'s "Known gaps to close before publish": payout
times and scores on the 29 casinos added from the client's list were
placeholders in the prototype too — treat every `payout`/`score` value in
`ops.json` as illustrative until confirmed with real timed withdrawals.
