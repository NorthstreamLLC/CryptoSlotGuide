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

## On-chain deposit volume — third-party citations, not our own data

`onChainVolume.json` holds a fourth, distinct kind of sourcing — not
field-tested, community-reported, or editorial (see `criteria.json`'s
`sourcing` field for those three). This is a named third-party platform's
own attribution of on-chain wallet activity to an operator (Tanzanite's
public wallet-cluster tracker, FairGambling's per-casino analytics),
never something we measured or verified ourselves — see
`lib/onchain-volume.ts` and `components/entity/OnChainActivity.tsx` for
how it's kept visually and epistemically separate from "what we measured."

Populated with:

```
npm run import:onchain -- path/to/volume.csv
```

See `scripts/import-onchain-volume.mjs`'s header comment for the full
contract and `data/onchain-volume-template.csv` for the CSV shape. The
template's 41 rows are real, not placeholders: 37 operators' 30-day
deposit volume pulled live from Tanzanite's public
`api/public/casino-analytics/deposit-volume` endpoint, plus Roobet and
Stake's deposit-volume and hot-wallet figures transcribed from
FairGambling's own review pages — both checked 7–10 Sep 2026, both cited
with the exact source URL and date on the review page itself. The
remaining 10 operators (BitStarz, Bitcasino.io, Vave, FortuneJack, mBit,
7Bit, Betplay, Degen, Betstrike, Dustbit) simply aren't tracked by
Tanzanite yet — no figure is shown for them rather than a fabricated one.
Like every other import script here, re-running it upserts (keyed on
`operator_slug` + `source` + `metric`) rather than duplicating, since a
platform's own numbers move daily and this needs to be re-run periodically
to stay current, not treated as a one-time snapshot.

## Casino spec sheet — editorial only, FairGambling stays out of it

`casinoSpecSheets.json` backs the grouped fact table on casino review
pages (`lib/spec-sheet.ts`, `components/entity/CasinoSpecSheet.tsx`).
Two earlier versions of this cited FairGambling for most of it
(financial transparency, compliance, house-game RTPs) — reverted 10 Sep
2026. FairGambling is a direct competitor; citing them for facts
CryptoSlotGuide can determine itself (licence, coin support, house
rules — the review-content work this site already does, arguably
better) isn't a sourcing shortcut worth taking just because it's
convenient. The **on-chain** panel (`onChainVolume.json`,
`lib/onchain-volume.ts`) is the one deliberate exception: deposit
volume and hot-wallet balance genuinely require wallet-clustering
infrastructure this site doesn't have, so FairGambling (and Tanzanite)
stay cited there — see that section above.

So `casinoSpecSheets.json` currently holds only what's actually been
independently checked, which is a real but thin set: roobet's coins
(`"site-data"`, from `coinsBy.json`), its real licence number
(OGL/2024/687/0427) and company registration, confirmed straight off
`roobet.com/kyc-aml-policy`; its no-withdrawal-fee policy, confirmed
via `help.roobet.com`'s own support article; and its geo-blocking,
confirmed by literally triggering it (`roobet.com/fair` returned a
region-restricted response to this session's own request). Stake.com is
behind a Cloudflare bot-check this session couldn't get past, so its
sheet is coins only for now. Every fact besides `"site-data"` still
carries a `sourceUrl`/`asOf` — the citation habit isn't gone, it's just
never FairGambling's own page. Min deposit/withdrawal, withdrawal speed
and limits, proof of reserves, and house-game RTPs were all in earlier
versions via FairGambling and have been removed rather than
re-sourced — they need either a funded account (min/max limits are
per-coin, shown only in the logged-in cashier) or more of this same
kind of direct research; showing nothing is the honest state until
that happens, same discipline as everywhere else in this file.

Populated with:

```
npm run import:spec -- path/to/facts.csv
```

See `scripts/import-spec-sheet.mjs`'s header comment for the full
contract and `data/spec-sheet-template.csv` for the CSV shape — its
rows are the real roobet entry, not placeholders. The script refuses a
row claiming `sourcing=editorial` with a `source_url` on
fairgambling.com (or any known competitor review site), since that
combination is almost certainly a copy-paste mistake rather than an
actual independent check. Only roobet and stake are populated so far;
every other casino simply renders no spec sheet until real per-operator
research is done for it.

## Logos — the 34 "brand marks" were never real, so they're gone

The root `README.md`'s Assets section already disclosed this honestly:
`assets/logos/*.png (34) — placeholder brand marks generated for this
prototype... Replace every one with the operator's real logo.` That
caveat didn't survive the port — this app's `logoFor()` (two duplicated
copies, plus a third inside `lib/entity-view.ts`) pointed straight at
those 34 files as if they were real, and an earlier status check this
session counted file *existence* in that folder and reported "17/47
casinos have logos," which was never true. Checked properly on 10 Sep
2026: every one of the 34 was the same auto-generated flat monogram
("ST", "KR", "LG"...) in the same font. The only genuine logo on the
whole site is `public/assets/roobet-logo.png`.

Fixed by removing the illusion rather than patching around it:
`public/assets/logos/` is deleted outright (re-adding a file there does
nothing — nothing references that path anymore). `lib/logo.ts` is now
the single `logoFor(slug)` (real path for roobet, `null` for everyone
else — deliberately nullable so TypeScript flags any new call site that
forgets to handle the missing case) plus `tintFor(slug)`, a deterministic
per-slug color for entities with no brand tint of their own (casinos,
wallets, exchanges — providers/slots/live-casinos already carry a real
`tint` field and should pass that instead). `components/ui/BrandMark.tsx`
is the one place that decides image-vs-monogram; every page that shows
an operator/provider/wallet/exchange mark now goes through it instead of
rendering `<img>` directly. When real logo files exist, drop them at
`public/assets/logos/<slug>.png` and update `lib/logo.ts`'s `logoFor` to
return that path for the matching slugs — `BrandMark` picks it up with
no other changes needed anywhere.

## Bonus page — same fabrication pattern, fixed the same way

`BonusesPage.tsx`'s cashout-cap and expiry columns used to show
`"expires 30 days"` and `low ? "Uncapped" : "5× bonus"` on literally
every one of the 47 rows — a uniform, made-up figure, not real
per-operator data. Fixed 11 Sep 2026 by adding real, optional
`bonusExpiry`/`cashoutCap` fields to `Operator` (`lib/types.ts`) —
populated through `scripts/import-operator-audit.mjs` (now also takes
`bonus_expiry`/`cashout_cap` CSV columns) same as licence/kyc/coins —
and showing "—" / "not yet confirmed" per row instead of a guess when
absent, same discipline as everywhere else in this file. Only roobet
has both fields for real so far, pulled from its own hand-authored
"Bonus terms, in full" section (`components/casinos/RoobetReviewPage.tsx`
— itself ported from the real prototype, not new research): expiry "7
days after credit", cap "No cap on cashback winnings".

Also fixed in passing: `ops.json`'s `bonus` field is meant to describe
each operator's **standard published welcome bonus or leaderboard/
rakeback program** — never a streamer deal or promo code, which aren't
standing public terms and can't be verified the same way. Stake's entry
literally read "10% rakeback via code" until this pass (corrected to
"1x rakeback + weekly reload"); `import-operator-audit.mjs` now rejects
any `bonus` value containing "code" or "streamer" for the same reason
it rejects a `fairgambling.com` `source_url` elsewhere — it's a
copy-paste of something that isn't the real, standing offer. Stake
was **not** added to `editoriallyAuditedOperators.json` over this —
fixing one string isn't the same as a real desk audit of its licence,
coins, wager and confirmations, none of which were independently
re-checked this session (stake.com is still behind a Cloudflare
bot-check as of this writing).

## BC.Game's licence field was wrong — caught by growing coverage

Not a fabrication this time — a real, pre-existing data error, caught
14 Sep 2026 while extending spec-sheet coverage past roobet/stake.
`ops.json` had BC.Game's `licence` as `"Curaçao"`. Checked directly
against `bc.game/licenses` (a real dedicated compliance page, not a
marketing claim): BC.Game is actually licensed in **Anjouan, Union of
Comoros** (licence ALSI-202410011-FI1), operated by Twocent Technology
Limited (Belize, Reg No 000041939) — Curaçao was never right. Corrected
via `scripts/import-operator-audit.mjs` same as any other real audit
row. `kyc`/`bonus`/`wager`/`conf`/coins were left untouched and **not**
independently re-checked this pass (BC.Game's site is a heavy
client-rendered SPA whose help/fee pages didn't return real content to
a simple fetch — `bc.game/about-us` and `bc.game/help/fee` both silently
served the homepage instead), so BC.Game was **not** added to
`editoriallyAuditedOperators.json` either, same restraint as Stake
above — a licence correction plus a licence+company spec-sheet entry
is real, but it's not a full audit. This is the whole point of doing
real per-operator research incrementally instead of writing 47 rows at
once: it surfaces exactly this kind of thing.

## Top-12 sourcing pass — stated payout times, fees, licences, bonus terms

Done 14 Sep 2026. The prototype's payout times (`ops.json` `payout`/
`payoutLabel`, e.g. "5m 06s") have no source, and neither did most
licence/bonus fields. For the 12 highest-scored casinos, each operator's
own help centre, terms and licence pages were read directly and every
fact recorded in `casinoSpecSheets.json` with its URL and date (groups:
Payouts & fees, Coins & deposit limits, Bonus terms, Compliance). No
third-party review site is cited anywhere; operators' wording is kept
("instant", "5 minutes to 1 hour") rather than converted into a precise
figure.

What changed on the site because of it:
- **Stated withdrawal time replaces the unsourced figure** on review
  pages where one exists (`lib/entity-view.ts`); where none exists the
  old figure shows as "Unsourced listing". The exact payout figure no
  longer leads any H1 unless the operator is field-tested.
- **Criterion badges are per operator** (`lib/criterion-sourcing.ts`):
  "Editorially assessed" only when the backing fact is on file for that
  casino, otherwise "Not yet checked". Payout speed is now sourced from
  the operator's stated time (was "community-reported", with no community
  citations ever collected); Support and Game & RTP quality need a funded
  account, so they read "Not yet checked" everywhere today.
- **Corrections found:** Shuffle is Curaçao-licensed (was Anjouan);
  Rainbet is Anjouan (was Curaçao) and its welcome offer is 40× (was 1×);
  Gamdom cites an Anjouan licence number (was Curaçao — its own article
  also mentions Curaçao, noted on the fact); Cloudbet's welcome package is
  up to $2,500 with no rollover (was "100% up to $4,500", 30×). KYC
  levels corrected for Winna, Shuffle (required before first withdrawal),
  Rainbet and Gamdom (none unless requested). Coin lists updated from
  operators' own pages for 8 casinos.
- **Roobet's bonus terms were wrong.** The review page's hand-typed rows
  (7-day cashback expiry, $5 max bet, 1× on RooWards, "several US
  states") were either contradicted by or absent from Roobet's own terms.
  They're replaced by the cited rows; the whole US is restricted, and the
  unsourced "2 BTC KYC threshold" is gone from the head-to-head and FAQ.
- **Couldn't reach:** Rollbit (Cloudflare on every page), stake.com's
  terms/licence (Cloudflare — help.stake.com was readable), BC.Game's help
  pages (region block), Gamdom/Duelbits terms pages (geo-wall; their help
  centres were readable). Those facts are absent, not guessed.

`editoriallyAuditedOperators.json` was deliberately not extended — the
per-criterion badges now reflect exactly which facts exist instead.

## Full-index sourcing pass — 42 of 46 casinos

Extended 15 Sep 2026 to every casino on the index, same rules as the
top-12 pass above (operator's own pages only, wording kept, NOT FOUND
left blank). 42 of 46 now carry a cited spec sheet. Withdrawal times shown
anywhere on the site come from `lib/payout.ts`: timed figure if
field-tested, else the operator's stated time (`payoutStated`,
`payoutStatedMaxMins` = its worst case), else "Not stated". The
prototype `payout`/`payoutLabel` values are no longer displayed or
ranked on.

- **Removed:** Betstrike — its site now shows only a shut-down notice.
- **No data (blocked everywhere tried):** Rollbit, Betplay, CoinCasino,
  1win. Their pages show "Not stated" / "Not yet checked".
- **Partial (geo-walls):** Degen and DegenCity licence pages, Razed's main
  site, Toshibet's main site, Whale.io's FAQ, Duel's cashier.
- **Corrections found in this pass:** FortuneJack is Anjouan-licensed
  (was Curaçao); wagering corrected for mBit (40×), 7Bit (35×), BetFury
  (40×), Rainbet, Cloudbet, Goated (35×), Flush (30×), Bluff (40×),
  Sportsbet.io (40× casino), 500 Casino (40×); several KYC levels and
  sportsbook/esports flags; coin lists for most operators.
- **Conflicts on operators' own sites** are recorded on the fact itself
  (e.g. Acebet's FAQ says 5–15 minutes, its terms two banking days), and
  sorting uses the worst case.

## Casino bonuses section + the sign-up CTA was never actually a link

Added 14 Sep 2026. The goal, per the site owner: since CryptoSlotGuide
doesn't promote other casinos elsewhere, each casino's own review page
is where a reader sees everything that operator is currently running
and can click through to sign up — that's the whole point of listing
bonuses at all. Building that surfaced a real, pre-existing bug: the
sidebar CTA on every generic casino page (`EntityReviewPage.tsx`,
used by every casino except Roobet) was a plain `<span>`, not a link —
completely unclickable — while the disclosure text right underneath it
unconditionally read "Affiliate link. 18+. T&Cs apply.", regardless of
whether one existed. Roobet's bespoke page
(`components/casinos/RoobetReviewPage.tsx`) had already gotten this
right with a real `<a href="https://roobet.com" rel="nofollow sponsored
noopener">`; the generic template just never got the same treatment.

Fixed by adding `Operator.signupUrl` (`lib/types.ts`) — the operator's
real public homepage, same "real, not fabricated" bar as any other URL
already cited in this file, but explicitly **not** an affiliate-tracking
link yet; the field's own comment says to swap it for one once the site
owner supplies it rather than inventing a tracking parameter. Populated
so far only for roobet, stake and bc-game — the three operators actually
audited this session. `EntityReviewPage.tsx` now renders a real `<a>`
when `signupUrl` is set, and a plain, honestly-worded fallback ("Sign-up
link not yet added for this operator") when it isn't, instead of
claiming "Affiliate link" either way.

New `CasinoBonuses` section (`components/entity/CasinoBonuses.tsx`,
backed by `data/casinoBonuses.json` and `lib/casino-bonuses.ts`,
rendered on both `EntityReviewPage.tsx` and `RoobetReviewPage.tsx`,
same "render nothing until real data exists" rule as the spec sheet)
lists every currently-live promotion an operator is running, each with
its own headline figure, dated `asOf`, source citation, and a per-card
sign-up link. Populated so far only for **bc-game**, with all 7 real,
concurrent promotions found in the operator's own in-account Promotions
view as of 14 Sep 2026 (Monthly Deposit Bonus, Weekly Raffle, Harpelnas
Golden Raffle, 100x Multiplier Challenge, Free Spins Giveaway, Daily
Contest, BC Engine) — not just the first two added when this section
was mocked up. Two more cards visible in that same Promotions grid
("Certified Security", "Provably Fair") were deliberately left out:
they're trust badges, not bonuses. Cited via the operator's own
screenshots rather than a fresh automated fetch, same as the bonus-text
correction above — `bc.game/promotions` and
`bc.game/promotions/weekly-raffle` still don't return real content to a
simple request. Several of these (the Multiplier Challenge and Free
Spins entries especially) carry near-term end dates and will read as
stale within days; that's disclosed on each card (`endsLabel`) rather
than hidden, consistent with "each one is dated, not a standing offer."
Roobet and Stake have no entries in `casinoBonuses.json` yet — Roobet's
existing hand-written "Bonus terms, in full" section already covers its
one standing offer, and Stake's other promotions haven't been checked
this way yet.
