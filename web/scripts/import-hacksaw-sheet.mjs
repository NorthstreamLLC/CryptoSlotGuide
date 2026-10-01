/**
 * Reads Hacksaw Gaming's own Client Game Data Sheet into
 * data/slot-rtp-overrides.json and data/hacksaw-jurisdictions.json.
 *
 * Hacksaw publishes no RTP on its public game pages — checked, rendered, in
 * a real browser, on two titles: the string "RTP" does not appear. This
 * sheet is the studio's own client document and carries what the website
 * does not.
 *
 * THE CONFIGURATIONS ARE IN THE GAME NAMES. The sheet has one row per build
 * — "Rad Maxx 96%", "Rad Maxx 94%", "Rad Maxx 92%" — so 804 rows are 215
 * titles, 202 of which ship at more than one return. The suffix gives the
 * band and the Default RTP column the exact figure, and the exact figure is
 * what gets recorded.
 *
 * The spread here is unlike anything else in the catalogue. Pragmatic and
 * Push run about two percentage points between their best and worst builds;
 * Hacksaw commonly runs 96 / 94 / 92 / 88, which is eight. On an 88% build
 * the house edge is three times what it is on the 96%.
 *
 * Highest is the headline, as everywhere else on the site.
 *
 * The sheet also states, per title, whether the game is approved in each of
 * ~30 jurisdictions — including CA-Ontario and CA-Alberta, which no other
 * source we hold covers at game level. Written to its own file.
 *
 *   node scripts/import-hacksaw-sheet.mjs "<path to .xlsx>" --dry-run
 *   node scripts/import-hacksaw-sheet.mjs "<path to .xlsx>"
 */
import fs from "node:fs";
import { titleMatcher } from "./lib/match-title.mjs";
import path from "node:path";
import zlib from "node:zlib";

const argv = process.argv.slice(2);
const DRY = argv.includes("--dry-run");
const FILE = argv.find((a) => a.toLowerCase().endsWith(".xlsx"));
if (!FILE) {
  console.error("  give the path to the .xlsx");
  process.exit(1);
}

const RTP_OUT = path.join("data", "slot-rtp-overrides.json");
const JUR_OUT = path.join("data", "hacksaw-jurisdictions.json");

/* ---- minimal xlsx reader: a workbook is a zip of XML ---- */

function unzip(buf) {
  const files = {};
  let end = buf.length - 22;
  while (end >= 0 && buf.readUInt32LE(end) !== 0x06054b50) end--;
  const count = buf.readUInt16LE(end + 10);
  let p = buf.readUInt32LE(end + 16);
  for (let i = 0; i < count; i++) {
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const name = buf.toString("utf8", p + 46, p + 46 + nameLen);
    const local = buf.readUInt32LE(p + 42);
    const method = buf.readUInt16LE(p + 10);
    const size = buf.readUInt32LE(p + 20);
    const lnLen = buf.readUInt16LE(local + 26);
    const lxLen = buf.readUInt16LE(local + 28);
    const start = local + 30 + lnLen + lxLen;
    const raw = buf.subarray(start, start + size);
    files[name] = method === 0 ? raw : zlib.inflateRawSync(raw);
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

const zip = unzip(fs.readFileSync(FILE));
const read = (n) => zip[n]?.toString("utf8") ?? "";

const shared = [...read("xl/sharedStrings.xml").matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
  [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join("")
);

const rels = Object.fromEntries([...read("xl/_rels/workbook.xml.rels").matchAll(/Id="(rId\d+)"[^>]*Target="([^"]+)"/g)].map((m) => [m[1], m[2]]));
const sheetRel = [...read("xl/workbook.xml").matchAll(/<sheet name="([^"]+)"[^>]*r:id="(rId\d+)"/g)].find((m) => m[1] === "Slots");
if (!sheetRel) {
  console.error("  no Slots sheet in this workbook");
  process.exit(1);
}
const sheetXml = read("xl/" + rels[sheetRel[2]].replace(/^\//, ""));

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"');

function cellsOf(rowXml) {
  const out = {};
  for (const [, attrs, body] of rowXml.matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
    const ref = (attrs.match(/r="([A-Z]+)\d+"/) || [])[1];
    const type = (attrs.match(/t="(\w+)"/) || [])[1];
    const v = body.match(/<v>([\s\S]*?)<\/v>/);
    let val = v ? v[1] : [...body.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => m[1]).join("");
    if (type === "s" && v) val = shared[Number(val)];
    if (ref) out[ref] = decode(val ?? "").trim();
  }
  return out;
}

const rows = [...sheetXml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].map((m) => cellsOf(m[1]));
const header = rows[0] ?? {};
const data = rows.slice(1).filter((r) => r.B);

/** Jurisdiction columns are everything from the UK column rightwards. */
const JUR_COLS = Object.entries(header)
  .filter(([, label]) => /^(UK \(UKGC\)|Malta|Curacao|Sweden|Denmark|Latvia|Spain|Netherlands|Germany|Romania|Greece|Italy|Georgia|Croatia|Lithuania|Bulgaria|Portugal|Colombia|Buenos|BA-SRP|Slovakia|Slovenia|South Africa|CA-|Peru|Switzerland|Czech|Brazil|Philippines)/i.test(label))
  .map(([col, label]) => ({ col, label: label.replace(/\s+/g, " ").trim() }));

/** "96.10%" and 0.9632 both appear in Default RTP. Normalise to a percent. */
function pct(raw) {
  if (!raw) return null;
  const n = Number(String(raw).replace("%", "").trim());
  if (!Number.isFinite(n)) return null;
  const v = n <= 1.5 ? n * 100 : n;
  return v >= 50 && v <= 100 ? Math.round(v * 100) / 100 : null;
}

const SUFFIX = /\s+(\d{2}(?:\.\d+)?)\s*%?\s*$/;
const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");


/**
 * Hacksaw rates volatility on its own 1-to-5 scale, column "Volatility (x/5)".
 * The sheet holds "3/5", "4/5", "5/5", "2/5", bare "3"/"4" on a few rows, and
 * "45051" on 38 rows — an Excel date serial (2023-05-05) that a cell typed as
 * "5/5" became when the column was formatted as a date. Returned as "n/5" so the
 * page shows the studio's own rating rather than the feed's low/medium/high,
 * which calls 270 of these titles "medium".
 */
function volatilityOf(raw) {
  if (raw == null || raw === "") return null;
  const v = String(raw).trim();
  const m = v.match(/^([1-5])\s*\/\s*5$/);
  if (m) return `${m[1]}/5`;
  if (/^[1-5]$/.test(v)) return `${v}/5`;
  if (v === "45051") return "5/5";
  return null;
}

/* ---- group the build rows back into titles ---- */

const titles = new Map();
for (const r of data) {
  const name = r.B.trim();
  // Two rows carry a trailing studio tag ("3 Arcane Cauldrons - HG") or a bare
  // dash ("Croco Clover -"); neither is part of the title.
  const untagged = name.replace(/ - HG$| -$/, "").trim();
  const base = SUFFIX.test(untagged) ? untagged.replace(SUFFIX, "").trim() : untagged;
  const rtp = pct(r.M);
  if (!titles.has(base)) titles.set(base, { base, rtps: [], jur: null, volatility: volatilityOf(r.U) });
  const t = titles.get(base);
  if (rtp !== null) t.rtps.push(rtp);
  // Jurisdictions are the same across a title's builds; keep the first row's.
  if (!t.jur) t.jur = Object.fromEntries(JUR_COLS.map(({ col, label }) => [label, r[col] ?? ""]).filter(([, v]) => v));
}

/* ---- match to our catalogue by slug ---- */

const catalogue = JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games;
const bySlug = new Map(catalogue.filter((g) => g.slug).map((g) => [g.slug, g]));
// Name-key matching within the studio: the sheet writes "Hold &amp; Win" and
// the catalogue closes spaces ("2Wild2Die"), and neither is a different game.
const matcher = titleMatcher(catalogue);

const existing = fs.existsSync(RTP_OUT) ? JSON.parse(fs.readFileSync(RTP_OUT, "utf8")) : { note: "", overrides: {} };
const overrides = { ...existing.overrides };
const jurisdictions = {};
// Volatility goes into the same per-title meta the other studio sheets feed,
// so lib/slot-db.ts volatilityOf() picks it up by slug + studio. Merged, not
// replaced: Pragmatic's and Play'n GO's rows live in the same file.
const META_OUT = path.join("data", "studio-sheet-meta.json");
const existingMeta = fs.existsSync(META_OUT) ? JSON.parse(fs.readFileSync(META_OUT, "utf8")) : { note: "", games: {} };
const sheetMeta = { ...existingMeta.games };
let withVolatility = 0;

let matched = 0;
let unmatched = 0;
const unmatchedNames = [];
let multi = 0;
const conflicts = [];

for (const t of titles.values()) {
  const game = matcher.match(t.base, "Hacksaw Gaming") ?? bySlug.get(slugify(t.base));
  if (!game) {
    unmatched++;
    unmatchedNames.push(t.base);
    continue;
  }
  const slug = game.slug;
  matched++;
  const versions = [...new Set(t.rtps)].sort((a, b) => b - a);
  if (versions.length > 1) multi++;
  if (versions.length && typeof game.rtp === "number" && !versions.includes(game.rtp)) {
    conflicts.push({ name: t.base, feed: game.rtp, sheet: versions });
  }
  if (versions.length) {
    overrides[slug] = {
      // Every figure is the studio's own; nothing here comes from the catalogue feed.
      versionsFrom: "studio",
      versions,
      studio: "Hacksaw Gaming",
      sourceUrl: "https://www.hacksawgaming.com/",
      read: new Date().toISOString().slice(0, 10),
      reason:
        `Hacksaw Gaming's own Client Game Data Sheet (International, ${path.basename(FILE).match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? "undated"}), which lists one row per build. ` +
        (versions.length > 1 ? `This title ships at ${versions.length} returns.` : "This title ships at one return.") +
        " Hacksaw publishes no RTP on its public game pages.",
    };
  }
  if (t.jur) jurisdictions[slug] = { name: t.base, approvals: t.jur };
  if (t.volatility) {
    sheetMeta[slug] = {
      ...(sheetMeta[slug] ?? {}),
      name: t.base,
      studio: "Hacksaw Gaming",
      sheet: path.basename(FILE),
      volatility: t.volatility,
    };
    withVolatility++;
  }
}

console.log(`  ${data.length} rows → ${titles.size} titles`);
console.log(`  matched to our catalogue: ${matched} (${multi} with more than one return) · unmatched: ${unmatched}`);
if (unmatchedNames.length) console.log(`  unmatched: ${unmatchedNames.sort().join(" · ")}`);
if (conflicts.length) {
  console.log(`\n  feed figure not among the sheet's returns (${conflicts.length}):`);
  for (const c of conflicts.slice(0, 10)) console.log(`     ${c.name.slice(0, 28).padEnd(28)} feed ${c.feed}  vs sheet ${c.sheet.join(" / ")}`);
}

if (DRY) {
  console.log("\n  --dry-run: nothing written");
} else {
  fs.writeFileSync(RTP_OUT, JSON.stringify({ ...existing, overrides }, null, 2) + "\n");
  fs.writeFileSync(
    JUR_OUT,
    JSON.stringify(
      {
        note:
          "Per-title regulatory approvals from Hacksaw Gaming's own Client Game Data Sheet. Covers jurisdictions no other source we hold reaches at game level, including CA-Ontario and CA-Alberta. 'Yes' means the sheet records the game as approved there on the date read.",
        studio: "Hacksaw Gaming",
        read: new Date().toISOString().slice(0, 10),
        sheet: path.basename(FILE),
        games: jurisdictions,
      },
      null,
      2
    ) + "\n"
  );
  fs.writeFileSync(META_OUT, JSON.stringify({ ...existingMeta, games: sheetMeta }, null, 2) + "\n");
  console.log(`\n  wrote ${RTP_OUT} (${Object.keys(overrides).length} overrides), ${JUR_OUT} (${Object.keys(jurisdictions).length} games) and ${META_OUT} (${withVolatility} Hacksaw volatility ratings)`);
}
