# Maintaining Casino ChangeWatch

ChangeWatch is a manually reviewed content file, not an automatic monitoring service. Editing it does not publish the website. Do not create scheduled checks or bump dates without reviewing sources.

## Where to edit

- `web/lib/casino-changewatch.ts`: typed baseline/change records, official sources, dates and full term descriptions.
- `web/app/casino-changewatch/page.tsx`: short card summaries in `summaries`, keyed by record ID. A record without a summary falls back to its full `current` description. Keep both descriptions consistent.
- `web/scripts/test-casino-changewatch.mjs`: record validation. It currently asserts the reviewed baseline-only state and expected counts (12 observations, 6 verified operators, 1 pending); update those expectations when reviewed records are added. Do not remove evidence checks to make a change pass.

`pendingOperators` in the same data file holds BC.Game separately, with an explicitly labeled official-blog link and no verified numeric terms or checked-terms date. Never add a pending operator to `watchEntries` or the verified count merely because a blog article is accessible. Operator scope notes live in `operatorScopes` in the page.

The page groups records by `operatorSlug`; multiple categories at one operator automatically share a card and review link. Preserve the approved styles in `watch.module.css`.

Verified review routes in the current repository:

| Operator | operatorSlug | Review |
| --- | --- | --- |
| Rainbet | rainbet | /casinos/rainbet |
| Roobet | roobet | /casinos/roobet |
| Stake.com | stake | /casinos/stake |
| Gamdom | gamdom | /casinos/gamdom |
| Shuffle | shuffle | /casinos/shuffle |
| Rollbit | rollbit | /casinos/rollbit |
| BC.Game | bc-game | /casinos/bc-game |

These slugs exist in `web/data/ops.json`; the actual route is `web/app/casinos/[slug]/page.tsx`. Use `bc-game`, not `bcgame`. Stake.com coverage does not cover Stake.us. Being included is not a ranking or a performance claim.

## Add an initial baseline

1. Read the operator's official terms/help page. Record its exact URL, applicable jurisdiction/account scope, relevant section and a concise accurate paraphrase. Do not infer a universal promotion multiplier or cap from one offer.
2. Add a unique, stable ID and the existing review slug. Choose `verification`, `withdrawals` or `offers`. Use `kind: "baseline"`, `observedAt` and `source.checkedDate` as the actual review date in YYYY-MM-DD format, `previousValue: null`, `changedAt: null`, and `effectiveDate: null` unless the source explicitly establishes when the policy became effective.
3. Put the complete explanation and material caveats in `current`; put the official URL and checked date in `source`. `source.excerpt` is for a short exact supporting quote, not paraphrased prose. The initial parent-researched baselines have empty excerpts; do not invent quotes to fill them.
4. Add a short card summary keyed by the ID if the full description is too long. Keep caveats that materially change the headline meaning visible; full details stay in the disclosure.

A source's publication/update date is not automatically a policy effective date. If a page says it was updated today, that alone is not evidence that terms changed today. If a source cannot be checked or the relevant terms are unclear, leave the record pending rather than publish a guessed baseline.

## Recheck or record a real change

A new checked date requires actually reopening and reviewing the official source. Preserve the prior observation and its evidence before editing a record. Git history retains committed observations, but a mutable URL by itself is not stable proof of what a source used to say.

For a factual change, add a new uniquely identified `kind: "change"` record instead of rewriting the historical baseline into a change. Preserve the previous baseline unchanged. Set precise `previous` and `current` descriptions and attach separate `previousSource` and `source` evidence, including official URLs, actual checked dates and short exact excerpts supporting each state. Retain a local dated capture or an appropriate archived copy of both sources. Use `effectiveDate` only if supported; otherwise null. The observation date tells us when we noticed the difference, not when it took effect.

If two comparable observations establish no difference, describe that narrowly for those terms and dates; do not imply all terms were monitored or remained unchanged. Do not change `observedAt` on a historical baseline. The present validator expects baseline observation/check dates to match, so an append-only recheck should use a new observation record rather than changing only its timestamp.

## Validate, preview, then publish separately

From `web`:

```powershell
node scripts/test-bonus-decoder.mjs
node scripts/test-casino-changewatch.mjs
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js app/casino-changewatch/page.tsx lib/casino-changewatch.ts
$env:NEXT_PUBLIC_SITE_URL='https://cryptoslotguide.com'
npm run build -- --webpack
```

The existing prebuild hook regenerates the unrelated legacy `web/data/changelog.json`; review that diff and keep it out of a feature/content change unless intentionally authorized. Run `git diff --check` and inspect all changed files. For a local preview, start the integrated checkout's build on `127.0.0.1:3325`; restart only that preview's verified process if it is already running. Confirm both feature routes and their assets load. Review desktop/mobile layout, source links, grouping, unknown dates and baseline/change labels. Previewing or committing locally is not permission to push, deploy or publish.

## Optional small improvement (not implemented)

The current evidence type has URL, checked date and excerpt, but no immutable capture reference. Before publishing the first true historical change, minimally add optional `capturePath` and `sha256` to `Evidence`, and `previousEntryId` to change records. Require these for newly recorded changes once adopted; preserve legacy baselines honestly. A capture can be a short dated text extract with its source URL, or a local page/PDF capture, stored alongside an evidence manifest. Its hash detects later edits; it does not independently prove authenticity. This needs no paid API, CMS, scraper, accounts or scheduling.

If multiple observations accumulate, render the latest record per operator/category with older observations under a history disclosure, while retaining every original record. Keep this a small follow-up when needed, not part of the current operator expansion.

## Current coverage (21 October 2026 research)

Six operators have sourced baseline observations: Gamdom, Stake.com, Shuffle, Rainbet, Roobet and Rollbit. There are 12 observations and no documented policy changes. BC.Game is the seventh displayed operator, with governing terms verification pending and an explicitly separate official-blog guidance link. Rainbet records are scoped to English terms/help; Roobet and Rollbit records are scoped to public help guidance, not complete governing-agreement verification. All effective dates remain unknown.
