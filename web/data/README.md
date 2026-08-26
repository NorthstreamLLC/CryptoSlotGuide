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
`rtpWatch.json` (all 60 readings — the source's 10 `rtpWatch` titles ×
6 `watchOps` operators, each `best - cuts[i]` reshaped from the
prototype's per-title `cuts[]` array into the real per-cell production
schema per `lib/types.ts`'s `RtpReading`; `checkedAt`/`seen` dates match
the source exactly, `checkedBy`/`source` are reasonable invented metadata
the prototype has no equivalent field for).

Per the root `README.md`'s "Known gaps to close before publish": payout
times and scores on the 29 casinos added from the client's list were
placeholders in the prototype too — treat every `payout`/`score` value in
`ops.json` as illustrative until confirmed with real timed withdrawals.
When the real CSV/sheet import pipeline for RTP Watch ships (see root
`README.md`), it replaces `rtpWatch.json` outright rather than merging
with it — this file is a faithful snapshot of the prototype's numbers,
not a live feed.
