# Importing research-agent input

`web/scripts/import-articles.mjs` takes four kinds of JSON input. **Everything stays a
draft.** The importer never checks out, commits, pushes, merges, deploys or runs IndexNow:
a person reviews, commits and merges, and the merge into `main` is what publishes.

| Input | Recognised by | What the importer does |
|---|---|---|
| Article package | `"schemaVersion": "1.0"` and no `type` | edits `web/data/guideRows.json` and `web/data/guideBodies.json` in the working tree, writes a tracked import record to `web/data/imports/<storyId>.json`, keeps private fields in `inbox/` |
| Private sidecar | `"type": "article_private"` | supplies `editorialNotes` / `x` for the article with the same `storyId` and `revision` in the same run |
| Casino change | `"type": "casino_change"` | writes a private review record to `inbox/changes/<casino>/<fingerprint>.json`; **no site data is edited** |
| Research lead | `"type": "research_lead"` | writes a private record to `inbox/leads/`; never enters guide data |

## Run it (from `web/`)

```
node scripts/import-articles.mjs <file.json | folder> [...] --dry-run     # validate, list the writes, write nothing
node scripts/import-articles.mjs <file.json | folder> [...]               # write (feature branch only for articles)
node scripts/import-articles.mjs story.json --adopt <storyId>             # take over an existing article that has no import record
npm run test:import                                                       # the importer's tests
```

- Every input is validated before anything is written. One invalid input means nothing is written.
- Article writes are refused on `main`, `master` or a detached HEAD. Casino changes and leads
  write private files only, so they also run on `main`.
- Private files are refused unless `inbox/` is git-ignored and untracked.
- Writes are all-or-nothing: if any file fails, every file is restored.
- Exit codes: `0` done, `1` rejected or refused (nothing written), `3` done, but an update was
  turned into a proposal because the article had been edited by hand (see below).
- Private text (editorial notes, X drafts) is never printed, including in errors.

Synthetic examples of all four inputs are in `web/scripts/fixtures/research-import/`. Use them with
`--dry-run` only; they describe no real events.

### Reviewing and publishing an article

1. On a feature branch, run the importer, then `npm run dev` and open `/guides/<slug>`.
2. Commit the changed guide files and the import record, then push the branch. Vercel builds a Preview.
   Previews are behind Vercel's login and send `X-Robots-Tag: noindex` (checked on a real preview,
   10 November 2026); `next.config.ts` adds the same header on preview builds as a backstop.
   **noindex keeps a page out of search results; it doesn't make it private.** Who can open a
   preview is a Vercel project setting.
3. Merge into `main` to publish (fetch and rebase first: a GitHub Action also commits to `main`).
   After the production deploy, run `npm run indexnow` for the new URL.

## Updates, duplicates and hand edits

- `storyId` maps to exactly one slug, fixed at first import. A later revision with a different
  slug keeps the original.
- Same `storyId` and `revision` with the same content: nothing happens (no file or date changes).
  Same revision with different content (public or private): rejected; send the next revision.
  A lower revision: rejected.
- A new story can't use a slug another story owns. An existing article with no import record
  needs `--adopt <storyId>`; adoption keeps its original publication date.
- The import record holds a hash of what the importer wrote. If the article in the working tree
  no longer matches it, a person has edited it: the importer leaves the guide files alone and
  writes the proposed revision to `inbox/proposals/<storyId>-r<revision>.json`, listing the
  changed fields, for a person to apply by hand.
- The import record (`web/data/imports/<storyId>.json`) is tracked and non-sensitive: slug,
  revision, content type, category, tags, dates, hashes, source URLs and their dates. It never
  holds editorial notes, X copy or the raw package, and it doesn't record publication.

## Dates

- `guideRows.json` `updated` is a full ISO date (`2026-11-10`). Display strings ("20 Oct",
  "20 Oct 2026") are derived in `web/lib/guide-dates.ts`; no year is assumed.
- `updated` = `dates.updated` if given, otherwise `verification.checkedAt` converted to a calendar
  date in **America/New_York** (so `2026-11-11T03:30:00Z` becomes `2026-11-10`).
- `published` = `dates.published` for a new story. Revisions and adoptions keep the original.
- The article's JSON-LD uses `published` and `updated`; the sitemap's `lastmod` uses `updated`.

## Article package (`schemaVersion` "1.0")

**Required:** `schemaVersion`, `storyId`, `revision`, `status`, `contentType`, `slug`, `headline`,
`excerpt`, `keyPoints`, `body`, `category`, `dates` (`published`, `events`), `sources`,
`verification` (`status`, `checkedAt`).
**Optional:** `tags`, `cover` (`mono`, `tint`), `readMins`, `next`, `noPartners`,
`dates.updated`, `dates.events[].date` (may be `null`), `sources[].publishedAt` (may be `null`),
`verification.method`, `editorialNotes`, `x` (`post`, `thread`).
Any other field is rejected, including `author`, `image` and `seo`.

| Field | Rule | Becomes |
|---|---|---|
| `status` | exactly `"draft"` | |
| `contentType` | `news`, `analysis` or `opinion` | the label above the headline |
| `category` | News, Law, Crypto, Bonuses, Slots or Betting | `category` |
| `storyId` | `[a-z0-9-]`, 3–81 characters, starting with a letter or digit | record key |
| `slug` | lowercase words and hyphens, up to 90 characters | `/guides/<slug>` |
| `headline` / `excerpt` | 10–120 / 40–400 characters | `title` / `standfirst` |
| `keyPoints` / `body` | 1–6 / 2+ strings | `key` / `body` |
| `sources[]` | `label`, `url`, `verifiedAt` (timestamp), `primary: true`, optional `publishedAt` | `{label, url}` under the article |
| `next[]` | `href` must be a real site page (static pages, `/casinos/<slug>`, `/casinos/<slug>/facts`, `/guides/<slug>`, `/news/<yyyy-mm>`, legacy posts and categories), optional `#fragment`; no external, `//` or query URLs | "where next" links |
| `verification.status` | `"verified"`; anything else goes as a `research_lead` | |
| `tags` | up to 12 lowercase-hyphenated strings; metadata only, no UI | import record |

**Text rules** (`headline`, `excerpt`, `keyPoints`, `body`): one plain paragraph per string;
a body string starting `## ` is a subheading; `**bold**` is the only formatting. Rejected: HTML,
Markdown links, images, lists and code, URLs, line breaks and anything in curly braces (the
site's placeholders). Characterising words ("scam", "rigged", "illegal", "unlicensed") outside
quotation marks raise a reviewer warning, not a rejection, so attributed quotations still pass.

## Source rules

Every article source, and a casino change's `source_url`, must belong to a known owner in
`web/data/source-registry.json`:

- **casino:** its own domains are taken from the hosts already cited in `casinoSpecSheets.json`,
  minus the registry's discovery, excluded and shared hosts and every non-casino owner's domains.
- **regulator, court, government, studio:** listed in the registry.
- Matching is exact host or a subdomain of it: `goated.com` and `help.goated.com` match `goated.com`;
  `goated.com.attacker.test` and `evilgoated.com` don't.
- **Shared hosts** (help-centre platforms such as intercom.help, CDNs) match only through a reviewed
  `sharedPaths` entry for that host and first path segment, e.g. `intercom.help/playlink` → Bluff.
- **Discovery hosts** (X, Reddit, Telegram, forums, review sites, slotessentials.com) are never
  evidence. `primary: false` sources are rejected: discovery belongs in `editorialNotes`.
- An unknown owner is a **review-required failure**. `primary: true` is the agent's claim; the
  registry decides.
- A casino change needs that casino's own page, or for `licence`, `security` and `corporate`, a
  regulator, court or government document.

**Adding a mapping:** check who runs the site (footer, terms, the regulator's register), then add
the domain to the owner's `domains`, or a `{ "host", "prefix" }` to its `sharedPaths`, in
`web/data/source-registry.json`, in a commit of its own so the review is visible. To stop trusting
a host a casino once cited, add it to `excludedHosts`.

## Private sidecar

Either embed `editorialNotes` and `x` in the package, or send them in a sidecar:

```json
{ "type": "article_private", "storyId": "<same as the package>", "revision": 1,
  "editorialNotes": "...", "x": { "post": "...", "thread": ["1/ ...", "2/ ..."] } }
```

If both carry a field and the values differ, the import is rejected. Private fields, the
verification details, events, full source metadata and tags are stored in
`inbox/articles/<storyId>/r<revision>.json`.

## Casino change report

```json
{ "type": "casino_change", "casino": "<one of the 46 slugs in web/data/ops.json>",
  "topic": "welcome_offer | withdrawals | kyc | licence | security | promo_code | coins | corporate",
  "summary": "...", "before": "optional, earlier verified wording",
  "after_quote": "exact wording, under 300 characters", "source_url": "https://...",
  "source_published": "yyyy-mm-dd or null", "event_date": "yyyy-mm-dd or null",
  "verified_at": "ISO timestamp", "confidence": "high | medium" }
```

All fields are required except `before`; `source_published` and `event_date` may be `null`.
The review record shows the report, the source's owner, a `MEDIUM CONFIDENCE` flag when
`confidence` is medium, the stored facts and `ops.json` fields the change would touch (with
today's values), and the files that mention the casino. Its fingerprint covers every field except
`verified_at`: a re-check of the same report updates `lastSeen` and `seenCount`; a materially
different report gets its own record. A missing `before` stays `null`.

## Research lead

```json
{ "type": "research_lead", "verification": { "status": "unverified" },
  "editorialNotes": "...", "storyId": "optional", "discovered": ["optional URLs"] }
```
