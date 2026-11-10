# Importing research-agent articles

Articles from the research agent arrive as JSON packages and become **drafts**: a
git branch per story with a Vercel Preview. Nothing is published until a person
merges the branch into `main`.

## Run it

From `web/`, with a clean working tree:

```
node scripts/import-articles.mjs inbox-folder/            # every package in a folder
node scripts/import-articles.mjs story.json --dry-run     # check only
node scripts/import-articles.mjs story.json --no-git      # write into this checkout to preview locally (npm run dev)
node scripts/import-articles.mjs story.json --no-push     # make the draft branch but don't push it
```

For each valid package the script:

1. checks it against the rules below and refuses it if anything fails;
2. cuts `drafts/<storyId>` from `origin/main` (or from the story's existing draft branch);
3. writes the row into `web/data/guideRows.json` (new stories at the top), the body into
   `web/data/guideBodies.json`, and a record into `web/data/imports/<storyId>.json`;
4. runs the borrowed-copy check, commits and pushes the branch;
5. saves `editorialNotes`, X drafts, tags and verification details to
   `inbox/<storyId>/r<revision>.private.json` at the repo root, which is git-ignored.

Then review the branch's Vercel Preview at `/guides/<slug>` and merge into `main` to
publish (fetch and rebase first: a GitHub Action also commits to `main`). After the
production deploy, run `npm run indexnow` for the new URL.

## Updates and edits

- The `storyId` identifies a story. A package with a known `storyId` and a higher
  `revision` updates that story; an equal or lower revision is refused.
- The slug is fixed at first import. A different slug in a later revision is ignored.
- The record keeps a hash of what the importer last wrote. If the article on `main`
  (published) or on its draft branch (not yet published) no longer matches, a person
  has edited it: the update goes to `drafts/<storyId>-r<revision>` instead, so the
  edit is never overwritten. Compare the two branches and merge what you want.
- A new story can't reuse the slug of an existing article.

## Package (schemaVersion "1.0")

| Field | Required | Becomes |
|---|---|---|
| `schemaVersion` | yes, `"1.0"` | |
| `storyId` | yes, `[a-z0-9-]`, 3–81 characters | the record's key |
| `revision` | yes, whole number from 1 | |
| `status` | yes, `draft` or `ready_for_review` | never `published` |
| `contentType` | yes, `news`, `analysis` or `opinion` | the label above the headline (analysis and opinion only) |
| `slug` | yes, lowercase words and hyphens, up to 90 characters | `/guides/<slug>` |
| `headline` | yes, 10–120 characters | `title` (also the page title) |
| `excerpt` | yes, 40–400 characters | `standfirst` (also the meta description) |
| `keyPoints` | yes, 1–6 points | `key` |
| `body` | yes, 2 or more paragraphs | `body` |
| `category` | yes: News, Law, Crypto, Bonuses, Slots, Betting, Accounts, Wallets or Method | `category` |
| `dates.published` | yes, `yyyy-mm-dd` | `published`; also `updated` unless `verification.checkedAt` is later |
| `sources[]` | yes, 1 or more, at least one with `"primary": true` | `{label, url}` listed under the article |
| `verification.status` | yes, must be `verified` | |
| `cover.mono` / `cover.tint` | no | the generated cover (defaults by category) |
| `readMins` | no | worked out from the word count if absent |
| `next[]` | no, `{href, label, hint}` with site paths starting `/` | the "where next" links |
| `noPartners` | no | hides casino offers on the page |
| `tags`, `dates.events`, `editorialNotes`, `x` | no | private file in `inbox/` only |
| `image`, `author`, `seo` | no | ignored, with a warning |

**Text rules** for `headline`, `excerpt`, `keyPoints` and `body`: plain text. A body
string starting `## ` is a subheading; `**bold**` is the only formatting. No HTML, no
links (put them in `sources` or `next`), no lists, and no `{word}` in curly braces
(the site fills those in as placeholders). Sources must be the casino's or regulator's
own pages; Reddit, X, Telegram, forums, review sites and slotessentials.com are refused
as primary sources.
