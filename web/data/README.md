# Data

These JSON files match the shapes in [`lib/types.ts`](../lib/types.ts).

**Ported verbatim from the prototype** (`CryptoSlotGuide.dc.html`), not seed
placeholders: `ops.json` (all 47 casinos), `slots.json` (all 16 slots),
`slotTags.json`, `slotCatDefs.json`, `coinsBy.json` (all 47 operators),
`coinDefs.json`, `tickerFacts.json`, `liveCasinos.json`, `sbData.json`,
`sportsMarkets.json`, `fiatCasinos.json`, `predMarkets.json`.

**Still a small seed subset**, not yet ported from the prototype:
`liveGames.json`, `providers.json`, `walletRows.json`, `exchangeRows.json`,
`houseGames.json`, `guideRows.json`, `guideBodies.json`, `esportsTitles.json`,
`watchOps.json`, `criteria.json`, `methodSteps.json`. Port these the same
way — read the matching array straight out of the `.dc.html` source, don't
re-derive it.

**Fabricated, not real (flag before publish):**
- `rtpWatch.json` — the real RTP Watch readings come from the CSV/sheet
  import pipeline described in the root `README.md`'s RTP Watch section.
  Do not publish these fabricated readings.
- `editorial.json` — only 2 entries exist; the "Our take" paragraphs are
  a hand-written voice per entity and need the real copy, not placeholders.

Per the root `README.md`'s "Known gaps to close before publish": payout
times and scores on the 29 casinos added from the client's list were
placeholders in the prototype too — treat every `payout`/`score` value in
`ops.json` as illustrative until confirmed with real timed withdrawals.
