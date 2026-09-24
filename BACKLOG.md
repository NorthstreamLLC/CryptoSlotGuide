# Backlog

Open work on cryptoslotguide.com, newest decisions at the top of each section.
The site went live on Vercel on 2026-09-23; see `web/AGENTS.md` for how the app
is built and `data/README.md` for the sourcing rules every fact follows.

## Blocking / in progress

Nothing blocking.

## Recently closed

- **Newsletter sign-up** (2026-09-24). Three faults in a row. `SENDGRID_LIST_ID`
  held a value SendGrid did not recognise. The honeypot field was named
  "company", which browsers and password managers autofill, so genuine
  sign-ups were discarded as bots. And the consent date was sent as
  `2026-09-24` where a SendGrid date field wants full ISO 8601 — given the
  short form it answers 202, queues the job, then discards the whole contact
  with no error visible to the caller and a job status stuck on `pending`.

  What made this take hours: the diagnostic probe reused one fixed address,
  and removing a contact from a list does not delete it from the account, so
  the probe kept finding its own leftover contact and reporting success. The
  test that settled it was an A/B with unique addresses, one upsert with
  custom fields and one without — without landed in 12s, with never did.
  Verified end to end afterwards with a real address.

## Requested, not built

- **Motion graphic / animated logo strip** across casinos, exchanges, providers
  and wallets. Asked for 2026-09-23. Nothing like it exists in the app or in
  the original `CryptoSlotGuide.dc.html` prototype — the only moving strip is
  `components/home/CryptoTicker.tsx`, which shows coin prices, not brand marks.
  All 113 brand logos are already on disk (`public/assets/logos`), so the
  assets are there; this is a new component plus a decision on where it sits.
- **Provider breakdown.** Studio profiles carrying licence backlinks, a link to
  the licence map, and each studio's top 3 games. `data/provider-licences.json`
  already holds 28 studios with regulators and licence URLs, and
  `/providers/licences` renders the map. Missing: the games-per-studio data,
  which the user is supplying.
- **Slot information.** User is sending more; shape TBD.
- **Coin icons on the home page.** The "Casinos by coin" tiles render the
  ticker as text in a coloured circle. Two options, undecided: use the existing
  `CoinIcon` glyphs (₿, Ξ, ₮ …) which already exist and are used on the casino
  cards, or wire up real brand marks. Marks for 7 of 8 coins were fetched into
  `public/assets/coins` but are not referenced anywhere yet — several came from
  `safari-pinned-tab.svg`, which is a monochrome black mask by definition and
  would be invisible on the dark ground. XRP publishes no usable square icon.

## Launch follow-ups

- **Analytics.** Nothing measures traffic, so the launch is currently invisible.
  Vercel Analytics is a toggle; GA4 is more work.
- **Search Console.** Submit `https://cryptoslotguide.com/sitemap.xml` (512
  URLs) and watch Coverage for a fortnight while the 16 redirects settle.
- **Decommission the AWS box** (`44.228.156.254`) once traffic and Search
  Console look healthy. It is the rollback path until then — see the
  `cryptoslotguide-hosting` memory.
- **DMARC.** Currently `p=none`, which enforces nothing and only reports. After
  a couple of weeks of clean reports, consider `p=quarantine`.
- **Performance.** Never measured. No Lighthouse run, no LCP figure. Pages are
  65–400KB over the wire, which looks fine, but that is not the same as tested.
- **Cookie consent banner**, **per-page social/OG images**, **a styled 404**,
  and **affiliate click tracking** — all still unbuilt.

## Data gaps

These need a logged-in session to read, so they are excluded rather than
guessed at:

- VIP ladders: Roobet, Rollbit, Betplay, Duelbits, BitStarz; thresholds for
  BC.Game, Dicey, MetaWin, Whale.io, Flush.
- Sweepstakes rules behind logins: Stake.us amounts, Pulsz, WOW Vegas, Crown
  Coins, Funrize, NoLimitCoins, Sixty6, Lonestar.
- Restricted-country lists: Vave, Cybet, Bluff, Degen, Solcasino, CoinCasino.

## Maintenance

- **Monthly re-verification** of offers, races and limits. `scripts/build-changelog.mjs`
  already turns the fact history into the "Recent updates" block on each report.
- **Tidy unused animations.** `csg-up`, `csg-down` and `csg-live` are defined in
  `app/globals.css` but referenced by no component.

## Known and accepted

- **Small territories are not drawn on the world map.** It is built from
  Natural Earth 110m, which omits `AW` Aruba, `BQ` the BES islands, `CW`
  Curaçao, `GI` Gibraltar, `MF` Saint Martin, `MT` Malta and `SX` Sint
  Maarten. They are stored correctly and appear in each casino's restricted
  list on its report; they just never get coloured. Rebuilding at 50m would
  pick them up — the Europe map already uses 50m, so the pipeline exists —
  but this is a deliberate call to leave it (2026-09-24), not an oversight.
