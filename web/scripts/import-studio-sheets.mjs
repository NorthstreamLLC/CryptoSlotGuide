/**
 * Imports studio-supplied game sheets: Pragmatic Play's demo-link export and
 * Play'n GO's released-games sheet.
 *
 * Both carry things the third-party catalogue feed does not, and both are the
 * studio's own document, which is the standard the rest of the site holds to.
 *
 * WHAT EACH ONE FIXES
 *
 * Release dates. The feed stamps batches, not releases — 2,589 slots share
 * 2025-01-01 and every Pragmatic title we hold says 2026-04-02 — so the
 * database's "Newest" sort was ordering by import. These sheets carry real
 * calendars: 553 distinct dates across 622 Pragmatic titles, with at most
 * four titles sharing a day.
 *
 * RTP configurations. Play'n GO publishes its bands as columns — 84, 87, 91,
 * 94, 96 — so a title can run twelve percentage points apart depending on
 * which build the casino licensed. Pragmatic's export carries one figure per
 * title, so it corrects rather than widens.
 *
 * Jurisdictions. Play'n GO states per-title approval for Ontario, Quebec and
 * Alberta, and for Michigan, New Jersey, Pennsylvania, West Virginia and
 * Connecticut. Nothing else we hold reaches game level for those.
 *
 * Highest RTP is the headline, as everywhere else on this site.
 *
 *   node scripts/import-studio-sheets.mjs --dry-run
 *   node scripts/import-studio-sheets.mjs --pragmatic "<path.csv>" --playngo "<path.csv>"
 */
import fs from "node:fs";
import { titleMatcher } from "./lib/match-title.mjs";
import path from "node:path";

const argv = process.argv.slice(2);
const DRY = argv.includes("--dry-run");
const argOf = (f) => (argv.includes(f) ? argv[argv.indexOf(f) + 1] : null);

const RTP_OUT = path.join("data", "slot-rtp-overrides.json");
const META_OUT = path.join("data", "studio-sheet-meta.json");

/* ---- csv ---- */

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (c !== "\r") cell += c;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const head = rows.shift().map((h) => h.replace(/^﻿/, "").trim());
  return rows.filter((r) => r.some((v) => v.trim())).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? "").trim()])));
}

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** "13th July 2023" and "10/1/2026" both appear. Returns ISO or null. */
const MONTHS = "january february march april may june july august september october november december".split(" ");
function isoDate(raw) {
  if (!raw) return null;
  const long = raw.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})$/);
  if (long) {
    const m = MONTHS.indexOf(long[2].toLowerCase());
    if (m < 0) return null;
    return `${long[3]}-${String(m + 1).padStart(2, "0")}-${long[1].padStart(2, "0")}`;
  }
  const us = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) return `${us[3]}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`;
  return null;
}

const pct = (raw) => {
  if (raw == null || raw === "") return null;
  const n = Number(String(raw).replace("%", "").trim());
  if (!Number.isFinite(n) || n === 0) return null;
  const v = n <= 1.5 ? n * 100 : n;
  return v >= 50 && v <= 100 ? Math.round(v * 100) / 100 : null;
};

/* ---- load what we already have ---- */

const catalogue = JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games;
const bySlug = new Map(catalogue.filter((g) => g.slug).map((g) => [g.slug, g]));
// Name-key matching within the studio — see scripts/lib/match-title.mjs for
// why slug equality lost 147 of these titles to apostrophes and en-dashes.
const matcher = titleMatcher(catalogue);
const resolve = (name, studio) => matcher.match(name, studio) ?? bySlug.get(slugify(name)) ?? null;
const existingRtp = fs.existsSync(RTP_OUT) ? JSON.parse(fs.readFileSync(RTP_OUT, "utf8")) : { note: "", overrides: {} };
const overrides = { ...existingRtp.overrides };
const existingMeta = fs.existsSync(META_OUT) ? JSON.parse(fs.readFileSync(META_OUT, "utf8")) : { games: {} };
const meta = { ...existingMeta.games };

const report = { matched: 0, unmatched: 0, dates: 0, multi: 0, cleared: 0, conflicts: [] };

function record(slug, name, { versions, released, jurisdictions, volatility, demoUrl, gid, maxMultiplier, defaultBand, versionsFrom }, studio, sourceUrl, sheet) {
  const game = bySlug.get(slug);
  if (!game) {
    report.unmatched++;
    return;
  }
  report.matched++;

  if (!versions?.length) {
    /**
     * The sheet covers this title but publishes no usable return — the bingo
     * titles carry "0" in every band. If a previous run of this script wrote
     * an override for it, that figure is stale and has to go, or a number the
     * studio no longer publishes survives every re-import.
     *
     * Only this studio's own sheet-written overrides are cleared; anything
     * read from an operator's client or a studio game page stays.
     */
    if (overrides[slug]?.studio === studio && overrides[slug]?.reason?.includes(sheet)) {
      delete overrides[slug];
      report.cleared++;
    }
  }

  if (versions?.length) {
    if (versions.length > 1) report.multi++;
    if (typeof game.rtp === "number" && !versions.includes(game.rtp)) {
      report.conflicts.push({ name, feed: game.rtp, sheet: versions });
    }
    overrides[slug] = {
      versions,
      /**
       * Whether the studio published this whole set of returns, or whether
       * the catalogue feed supplied some of it.
       *
       * It decides what a page may claim. Play'n GO lists every band itself,
       * so its sets are "studio". Pragmatic publishes one figure per title
       * and the second build below it comes from the feed — calling that
       * "every build the studio publishes" would be an overclaim, so it is
       * "mixed" and counted separately.
       */
      versionsFrom: versionsFrom ?? (versions.length > 1 ? "mixed" : "studio"),
      studio,
      sourceUrl,
      read: new Date().toISOString().slice(0, 10),
      reason: `${studio}'s own published game data (${sheet}). ${versions.length > 1 ? `This title ships at ${versions.length} returns.` : "One published return."}`,
    };
  }
  if (released) report.dates++;
  meta[slug] = {
    ...(meta[slug] ?? {}),
    name,
    studio,
    sheet,
    ...(released ? { released } : {}),
    ...(volatility ? { volatility } : {}),
    ...(demoUrl ? { demoUrl } : {}),
    ...(gid ? { gid } : {}),
    ...(defaultBand ? { defaultBand } : {}),
    ...(maxMultiplier ? { maxMultiplier } : {}),
    ...(jurisdictions ? { jurisdictions } : {}),
  };
}

/* ---- Pragmatic Play: demo links export ---- */

const pragFile = argOf("--pragmatic");
if (pragFile && fs.existsSync(pragFile)) {
  // The export is Windows-1252, not UTF-8: read as UTF-8, every typographic
  // apostrophe and en-dash in a title became U+FFFD and the title matched
  // nothing. 54 of Pragmatic's 85 unmatched titles were exactly this.
  const rows = parseCsv(new TextDecoder("windows-1252").decode(fs.readFileSync(pragFile)));
  for (const r of rows) {
    const name = r["Name"];
    if (!name) continue;
    // The export is generated with a referrer parameter pointing at the
    // owner's other site. Stripped: the demo loads identically without it
    // (checked, same 200 and the same bytes), and a link that names another
    // property does not belong on this one.
    let demoUrl = (r["URL"] || "").replace(/&?websiteUrl=[^&]*/g, "").replace(/\?&/, "?");
    if (!/^https:\/\/[^/]*pragmaticplay\.net\//.test(demoUrl)) demoUrl = "";
    /**
     * The sheet carries ONE figure per title — the default build — while the
     * catalogue feed often holds a reduced build as well. Taking the sheet
     * alone would have replaced a two-build spread with a single number on
     * 433 titles and undone the thing these pages exist for.
     *
     * So: where the two agree on the default, the feed's lower build is kept
     * alongside it. Where they disagree — 19 titles — the sheet wins outright
     * and the feed's figures are dropped, because a feed whose headline is
     * wrong has not earned trust in its second number either.
     */
    const rtp = pct(r["RTP"]);
    const known = resolve(name, "Pragmatic Play");
    const feed = known?.rtpVariants?.length ? known.rtpVariants : known?.rtp != null ? [known.rtp] : [];
    let versions = [];
    if (rtp !== null) {
      versions = feed.includes(rtp) ? [...new Set([rtp, ...feed])].sort((a, b) => b - a) : [rtp];
    } else if (feed.length) versions = [...feed].sort((a, b) => b - a);
    // Studio-only when the set is the sheet's figure alone; mixed the moment
    // the feed's lower build is kept alongside it.
    const versionsFrom = rtp !== null && versions.length === 1 ? "studio" : "mixed";
    record(
      known?.slug ?? slugify(name),
      name,
      { versions, versionsFrom, released: isoDate(r["Release Date"]), demoUrl: demoUrl || undefined },
      "Pragmatic Play",
      "https://www.pragmaticplay.com/en/slots/",
      path.basename(pragFile)
    );
  }
  console.log(`  Pragmatic Play: ${rows.length} rows`);
}

/* ---- Play'n GO: released games sheet ---- */

const pgFile = argOf("--playngo");
if (pgFile && fs.existsSync(pgFile)) {
  const rows = parseCsv(fs.readFileSync(pgFile, "utf8"));
  const cfgCols = Object.keys(rows[0] ?? {}).filter((k) => /^\d{2}% config$/.test(k));
  // Jurisdiction columns are the plain Yes/No region names at the end. "GNC"
  // also appears; it is not "Yes", so it is stored verbatim rather than read
  // as approval we cannot evidence.
  const jurCols = Object.keys(rows[0] ?? {}).filter((k) =>
    /^(Alberta|BA City|BA Province|Brazil|Bulgaria|Colombia|Connecticut|Croatia|Czech|Denmark|Finland|Georgia|Germany|Greece|Italy|Latvia|Lithuania|Michigan|Netherlands|New Jersey|Norway|Ontario|Pennsylvania|Peru|Philippines|Portugal|Quebec|Slovakia|Slovenia|South Africa|Spain|Sweden Romania|Switzerland|UAE|UK|West Virginia)$/.test(k)
  );
  for (const r of rows) {
    const name = r["Game name"];
    if (!name) continue;
    /**
     * "Default rtp% config" is a BAND LABEL, not a return. It reads "96" on
     * 474 of the 491 rows, and on all 491 it is NOT one of the figures in the
     * NN% config columns — Play'n GO's own site keeps the two apart as
     * `defaultRtpConfiguration` ("96") and `defaultRtp` ("96.51").
     *
     * Feeding it through pct() minted a 96.00% build on every Play'n GO
     * title: a return the studio does not ship, sitting under the real
     * 96.51%. Only the NN% config columns are returns. The label is kept
     * separately, as the band the studio ships by default.
     */
    const versions = [...new Set(cfgCols.map((c) => pct(r[c])).filter((v) => v !== null))].sort((a, b) => b - a);
    const defaultBand = /^\d{2}$/.test(r["Default rtp% config"]?.trim() ?? "") ? r["Default rtp% config"].trim() : undefined;
    const jurisdictions = Object.fromEntries(jurCols.map((c) => [c, r[c]]).filter(([, v]) => v));
    record(
      resolve(name, "Play'n GO")?.slug ?? slugify(name),
      name,
      {
        versions,
        // Every figure here is a column of Play'n GO's own game data.
        versionsFrom: "studio",
        released: isoDate(r["Release date"]),
        jurisdictions,
        volatility: r["Volatility rating"] || undefined,
        gid: r["GID"] || undefined,
        defaultBand,
        maxMultiplier: r["Max multiplier"] || undefined,
      },
      "Play'n GO",
      // The ALL GAMES index on Play'n GO's own site, which is where this data
      // is published: their game pages carry the same fields this sheet has
      // columns for (rtp84/87/91/94/96, the jurisdiction flags, max
      // multiplier). Checked against 23 of those pages — 46 RTP figures, all
      // identical to the sheet. Per-game URLs are NOT recorded: the page slug
      // is the game's name, not the GID, and it does not resolve for every
      // title, so a stored per-game link would 404 on some.
      "https://www.playngo.com/games",
      path.basename(pgFile)
    );
  }
  console.log(`  Play'n GO: ${rows.length} rows (${cfgCols.length} RTP config columns, ${jurCols.length} jurisdictions)`);
}

console.log(`\n  matched ${report.matched} · unmatched ${report.unmatched} · with >1 return ${report.multi} · real release dates ${report.dates} · stale overrides cleared ${report.cleared}`);
if (report.conflicts.length) {
  console.log(`\n  feed figure not among the sheet's returns (${report.conflicts.length} of ${report.matched}):`);
  for (const c of report.conflicts.slice(0, 10)) console.log(`     ${c.name.slice(0, 30).padEnd(30)} feed ${c.feed}  vs sheet ${c.sheet.join(" / ")}`);
}

if (DRY) console.log("\n  --dry-run: nothing written");
else {
  fs.writeFileSync(RTP_OUT, JSON.stringify({ ...existingRtp, overrides }, null, 2) + "\n");
  fs.writeFileSync(
    META_OUT,
    JSON.stringify(
      {
        note:
          "Release dates, volatility, demo links and per-jurisdiction approvals from studios' own game sheets. The release dates matter most: the catalogue feed stamps import batches rather than releases, so these replace a field that was wrong for most of the catalogue. Jurisdiction values are stored verbatim — Play'n GO uses 'GNC' as well as Yes/No, and only 'Yes' should be read as approved.",
        read: new Date().toISOString().slice(0, 10),
        games: meta,
      },
      null,
      2
    ) + "\n"
  );
  console.log(`\n  wrote ${RTP_OUT} (${Object.keys(overrides).length} overrides) and ${META_OUT} (${Object.keys(meta).length} games)`);
}
