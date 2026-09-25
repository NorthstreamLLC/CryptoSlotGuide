#!/usr/bin/env node
/**
 * Game-availability CSV import — which games each casino actually carries.
 *
 * This is the dataset the site has never had, and it is the one that unlocks
 * the honest version of several claims. Right now a provider page cannot say
 * "Roobet lists Pragmatic Play" because nothing on file knows whether that is
 * true. With this imported, that line comes from data instead of from
 * confidence.
 *
 * Usage:
 *   npm run import:games -- path/to/games.csv
 *   npm run import:games -- path/to/games.csv --dry-run
 *   npm run import:games -- path/to/games.csv --as-of 2026-09-24
 *
 * CSV columns — header row required, any order, extra columns ignored. The
 * header matching is deliberately loose (case, spaces, underscores and hyphens
 * all ignored) because this file is coming out of somebody else's export and
 * asking for an exact header is how an import turns into an afternoon.
 *
 *   casino    (required)  slug or display name — "roobet", "Roobet", "BC.Game"
 *   game      (required)  the game title as the casino lists it
 *   provider  (optional)  studio name; strongly recommended, it is what makes
 *                         provider pages work
 *   rtp       (optional)  the RTP the CASINO shows, if it shows one. Casinos
 *                         often run a lower RTP version than the studio's
 *                         headline, so this is stored separately from the
 *                         studio figure in slots.json and never merged into it.
 *
 * What it does:
 *  1. Resolves every casino against data/ops.json and every provider against
 *     data/providers.json. Unmatched names are REPORTED, not silently dropped —
 *     a typo that quietly loses 400 rows is the failure mode here.
 *  2. Writes data/casinoGames.json, one entry per casino.
 *  3. Diffs against the previous import and prints what appeared and what
 *     vanished, which is the new-game tracking. The diff is written to
 *     data/casinoGames.changes.json so a scheduled run can report it.
 *
 * It does NOT invent a source. Availability is a claim about a casino's lobby,
 * so each entry records where the list came from and when.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(web, "data");
const OUT = path.join(DATA, "casinoGames.json");
const CHANGES = path.join(DATA, "casinoGames.changes.json");

const argv = process.argv.slice(2);
const file = argv.find((a) => !a.startsWith("--"));
const DRY = argv.includes("--dry-run");
const asOfArg = argv[argv.indexOf("--as-of") + 1];
const AS_OF = argv.includes("--as-of") && asOfArg ? asOfArg : new Date().toISOString().slice(0, 10);
const sourceArg = argv[argv.indexOf("--source") + 1];
const SOURCE = argv.includes("--source") && sourceArg ? sourceArg : "operator lobby export";

if (!file) {
  console.error("usage: npm run import:games -- path/to/games.csv [--dry-run] [--as-of YYYY-MM-DD] [--source \"…\"]");
  process.exit(1);
}

const read = (p) => JSON.parse(fs.readFileSync(path.join(DATA, p), "utf8"));
const OPS = read("ops.json");
const PROVIDERS = read("providers.json");

/** Loose key so "Casino Name", "casino_name" and "casino-name" all match. */
const key = (s) => String(s ?? "").toLowerCase().replace(/[\s_\-.]/g, "");

/**
 * A minimal RFC-4180 reader. Written out rather than pulled in because the
 * other import-*.mjs scripts have no dependencies and a games export is exactly
 * the kind of file that arrives with quoted commas in a title.
 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { cell += '"'; i++; }
        else quoted = false;
      } else cell += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

const raw = parseCsv(fs.readFileSync(file, "utf8"));
if (raw.length < 2) {
  console.error("csv has no data rows");
  process.exit(1);
}

const header = raw[0].map(key);
const col = (...names) => {
  for (const n of names) {
    const i = header.indexOf(key(n));
    if (i !== -1) return i;
  }
  return -1;
};

// Generous alias lists on purpose. The first test CSV used "Casino Name" and
// the import refused it outright — an export's header is whatever the exporting
// tool felt like, and a hard failure on a header is a pointless round trip.
const iCasino = col("casino", "casinoname", "casinoslug", "operator", "operatorname", "operatorslug", "site", "sitename", "brand", "brandname");
const iGame = col("game", "gamename", "gametitle", "title", "name", "slot", "slotname");
const iProvider = col("provider", "providername", "studio", "studioname", "vendor", "supplier", "gameprovider", "developer");
const iRtp = col("rtp", "rtppercent", "rtp%", "returntoplayer", "payout");

if (iCasino === -1 || iGame === -1) {
  console.error(`csv needs a casino column and a game column. Found headers: ${raw[0].join(", ")}`);
  process.exit(1);
}

// Resolve by slug first, then by display name, then by a loose key.
const opBy = new Map();
for (const o of OPS) {
  opBy.set(key(o.slug), o);
  opBy.set(key(o.name), o);
}
const provBy = new Map();
for (const p of PROVIDERS) {
  provBy.set(key(p.slug), p);
  provBy.set(key(p.name), p);
}

const byCasino = new Map();
const unknownCasinos = new Map();
const unknownProviders = new Map();
let rows = 0;
let dupes = 0;

for (const r of raw.slice(1)) {
  const casinoRaw = (r[iCasino] ?? "").trim();
  const gameRaw = (r[iGame] ?? "").trim();
  if (!casinoRaw || !gameRaw) continue;
  rows++;

  const op = opBy.get(key(casinoRaw));
  if (!op) {
    unknownCasinos.set(casinoRaw, (unknownCasinos.get(casinoRaw) ?? 0) + 1);
    continue;
  }

  const provRaw = iProvider === -1 ? "" : (r[iProvider] ?? "").trim();
  const prov = provRaw ? provBy.get(key(provRaw)) : null;
  if (provRaw && !prov) unknownProviders.set(provRaw, (unknownProviders.get(provRaw) ?? 0) + 1);

  const rtpRaw = iRtp === -1 ? "" : (r[iRtp] ?? "").trim();
  const rtp = rtpRaw ? Number(String(rtpRaw).replace("%", "")) : null;

  const entry = byCasino.get(op.slug) ?? { slug: op.slug, games: new Map() };
  const gk = key(gameRaw);
  if (entry.games.has(gk)) dupes++;
  entry.games.set(gk, {
    name: gameRaw,
    // The studio's canonical name where we know it, the CSV's spelling where we
    // don't — so an unrecognised studio still shows rather than disappearing.
    provider: prov?.name ?? provRaw ?? null,
    providerSlug: prov?.slug ?? null,
    rtp: Number.isFinite(rtp) ? rtp : null,
  });
  byCasino.set(op.slug, entry);
}

const out = [...byCasino.values()]
  .map((e) => ({
    slug: e.slug,
    count: e.games.size,
    asOf: AS_OF,
    source: SOURCE,
    games: [...e.games.values()].sort((a, b) => a.name.localeCompare(b.name)),
  }))
  .sort((a, b) => a.slug.localeCompare(b.slug));

// ---- diff against the last import: this is the new-game tracking ----
const prev = fs.existsSync(OUT) ? read("casinoGames.json") : [];
const prevBy = new Map(prev.map((e) => [e.slug, new Set(e.games.map((g) => key(g.name)))]));
const changes = [];
for (const e of out) {
  const before = prevBy.get(e.slug);
  if (!before) {
    changes.push({ slug: e.slug, firstImport: true, added: e.games.length, removed: 0, addedGames: [], removedGames: [] });
    continue;
  }
  const now = new Set(e.games.map((g) => key(g.name)));
  const added = e.games.filter((g) => !before.has(key(g.name))).map((g) => g.name);
  const removed = [...before].filter((k) => !now.has(k));
  if (added.length || removed.length) {
    changes.push({ slug: e.slug, firstImport: false, added: added.length, removed: removed.length, addedGames: added.slice(0, 50), removedGames: removed.slice(0, 50) });
  }
}

// ---- report ----
console.log(`${rows} data rows → ${out.length} casinos, ${out.reduce((n, e) => n + e.count, 0)} game entries${dupes ? `, ${dupes} duplicate rows collapsed` : ""}`);
console.log(`asOf ${AS_OF} · source "${SOURCE}"\n`);

for (const e of out.slice(0, 12)) {
  const studios = new Set(e.games.map((g) => g.providerSlug ?? g.provider).filter(Boolean));
  console.log(`  ${e.slug.padEnd(16)} ${String(e.count).padStart(5)} games · ${studios.size} studios`);
}
if (out.length > 12) console.log(`  … ${out.length - 12} more casinos`);

if (unknownCasinos.size) {
  console.log(`\nUNMATCHED CASINOS (${unknownCasinos.size}) — these rows were skipped; add the operator or fix the name`);
  for (const [n, c] of [...unknownCasinos.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)) console.log(`  ${String(c).padStart(6)}  ${n}`);
}
if (unknownProviders.size) {
  console.log(`\nUNMATCHED PROVIDERS (${unknownProviders.size}) — kept as free text, but they will not link to a provider page`);
  for (const [n, c] of [...unknownProviders.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)) console.log(`  ${String(c).padStart(6)}  ${n}`);
}

if (changes.length) {
  console.log(`\nCHANGES SINCE LAST IMPORT`);
  for (const c of changes.slice(0, 20)) {
    if (c.firstImport) console.log(`  ${c.slug.padEnd(16)} first import, ${c.added} games`);
    else console.log(`  ${c.slug.padEnd(16)} +${c.added} / −${c.removed}${c.addedGames.length ? `   new: ${c.addedGames.slice(0, 5).join(", ")}${c.addedGames.length > 5 ? " …" : ""}` : ""}`);
  }
}

if (DRY) {
  console.log(`\n--dry-run: nothing written`);
  process.exit(0);
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
fs.writeFileSync(CHANGES, JSON.stringify({ importedAt: AS_OF, changes }, null, 2) + "\n");
console.log(`\nwrote data/casinoGames.json (${out.length} casinos) and data/casinoGames.changes.json`);
