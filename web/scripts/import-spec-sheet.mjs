#!/usr/bin/env node
/**
 * Spec-sheet CSV import — same shape as the other import-*.mjs scripts,
 * for data/casinoSpecSheets.json (see lib/spec-sheet.ts, lib/types.ts's
 * SpecFact/SpecGroup/CasinoSpecSheet). One row per fact; the script
 * groups rows into the nested per-operator/per-group JSON shape,
 * preserving each group's first-seen order.
 *
 * Usage:
 *   npm run import:spec -- path/to/facts.csv
 *   npm run import:spec -- path/to/facts.csv --dry-run
 *
 * CSV columns (header row required, any order, extra columns ignored):
 *   operator_slug, group_title, label, value, chips (optional),
 *   flag_label (optional), flag_tone (optional: verified|warning),
 *   sourcing, source_url (required unless sourcing=site-data),
 *   as_of (required unless sourcing=site-data)
 *
 *   sourcing    — site-data | editorial. "site-data" means drawn from
 *                 data already established elsewhere on the site (e.g.
 *                 coinsBy.json) — no citation shown, no source_url/as_of
 *                 needed. "editorial" means WE checked the operator's
 *                 OWN page ourselves — source_url must be that
 *                 operator's own domain. There is deliberately no
 *                 third-party-citation option here (unlike
 *                 OnChainVolumeSource) — see data/README.md's "Casino
 *                 spec sheet" section for why FairGambling specifically
 *                 was removed from this file.
 *   chips       — semicolon-separated list, e.g. "BTC;ETH;USDT" — renders
 *                 as a chip row instead of plain text; leave value blank
 *                 when using chips.
 *   flag_tone   — "verified" renders green, "warning" renders amber;
 *                 leave both flag columns blank for a plain fact row.
 *
 * See data/spec-sheet-template.csv for a starting point.
 *
 * What this does:
 *  1. Validates every row: known operator_slug, sourcing enum, a
 *     source_url that's a real http(s) URL and doesn't resolve to a
 *     known third-party review platform (FairGambling, AskGamblers,
 *     Casino.Guru, thePOGG, LCB, Trustpilot) — that combination is
 *     almost certainly a copy-paste mistake, since editorial means the
 *     operator's own page. Fails the whole import on any bad row.
 *  2. Replaces each operator's full facts.json entry with the CSV's
 *     rows for that operator (a fresh full picture per re-import, not a
 *     per-fact merge — a spec sheet is small enough to re-supply whole).
 *     An operator not present in the CSV is left untouched.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");

const SOURCING_ENUM = ["site-data", "editorial"];
// Domains that can never back an "editorial" fact — editorial means the
// operator's OWN page, and these are third-party review platforms
// (FairGambling included, deliberately — see data/README.md's "Casino
// spec sheet" section for why this data stopped citing a competitor).
const THIRD_PARTY_REVIEW_DOMAINS = [
  "fairgambling.com",
  "askgamblers.com",
  "casino.guru",
  "thepogg.com",
  "lcb.org",
  "trustpilot.com",
];
const FLAG_TONES = {
  verified: { color: "#7BE0B8", background: "rgba(123,224,184,.12)" },
  warning: { color: "#DA9877", background: "rgba(196,101,58,.12)" },
  info: { color: "#5FE3E8", background: "rgba(0,194,204,.12)" },
};

function safeHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function readJson(name) {
  return JSON.parse(readFileSync(path.join(DATA_DIR, name), "utf8"));
}

function writeJson(name, data) {
  writeFileSync(path.join(DATA_DIR, name), JSON.stringify(data, null, 2) + "\n");
}

/** Minimal RFC-4180-ish CSV parser: quoted fields, escaped "" inside quotes, no multiline fields. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  const pushField = () => { row.push(field); field = ""; };
  const pushRow = () => { pushField(); rows.push(row); row = []; };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      pushField();
    } else if (c === "\n") {
      if (field !== "" || row.length > 0) pushRow();
    } else if (c === "\r") {
      // skip, \n handles the row break
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) pushRow();
  return rows.filter((r) => r.length > 1 || r[0] !== "");
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const csvPath = args.find((a) => !a.startsWith("--"));

  if (!csvPath) {
    console.error("Usage: npm run import:spec -- path/to/facts.csv [--dry-run]");
    process.exit(1);
  }
  const resolvedPath = path.resolve(process.cwd(), csvPath);
  if (!existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const ops = readJson("ops.json");
  const sheets = readJson("casinoSpecSheets.json");
  const opSlugs = new Set(ops.map((o) => o.slug));

  const raw = readFileSync(resolvedPath, "utf8");
  const table = parseCsv(raw);
  if (table.length < 2) {
    console.error("CSV has no data rows.");
    process.exit(1);
  }
  const header = table[0].map((h) => h.trim().toLowerCase());
  const col = (name) => header.indexOf(name);
  const required = ["operator_slug", "group_title", "label", "sourcing"];
  for (const r of required) {
    if (col(r) === -1) {
      console.error(`Missing required column: ${r}`);
      process.exit(1);
    }
  }

  const errors = [];
  const parsed = [];

  table.slice(1).forEach((cells, i) => {
    const lineNo = i + 2;
    const get = (name) => (col(name) === -1 ? "" : (cells[col(name)] ?? "").trim());

    const operatorSlug = get("operator_slug");
    if (!operatorSlug) return; // blank line

    const groupTitle = get("group_title");
    const label = get("label");
    const value = get("value") || undefined;
    const chipsStr = get("chips");
    const chips = chipsStr ? chipsStr.split(";").map((c) => c.trim()).filter(Boolean) : undefined;
    const flagLabel = get("flag_label") || undefined;
    const flagTone = get("flag_tone");
    const sourcing = get("sourcing");
    const sourceUrl = get("source_url") || undefined;
    const asOf = get("as_of") || undefined;

    if (!opSlugs.has(operatorSlug)) errors.push(`Line ${lineNo}: unknown operator_slug "${operatorSlug}" (not in data/ops.json)`);
    if (!groupTitle) errors.push(`Line ${lineNo}: group_title is required`);
    if (!label) errors.push(`Line ${lineNo}: label is required`);
    if (!value && !chips) errors.push(`Line ${lineNo}: needs either value or chips`);
    if (!SOURCING_ENUM.includes(sourcing)) errors.push(`Line ${lineNo}: sourcing "${sourcing}" must be one of ${SOURCING_ENUM.join(", ")}`);
    if (sourcing !== "site-data") {
      if (!sourceUrl || !/^https?:\/\//.test(sourceUrl)) errors.push(`Line ${lineNo}: source_url "${sourceUrl}" must be a full http(s) URL when sourcing is "${sourcing}"`);
      if (!asOf || Number.isNaN(new Date(asOf).getTime())) errors.push(`Line ${lineNo}: as_of "${asOf}" is not a valid date (use YYYY-MM-DD)`);
      if (sourceUrl && THIRD_PARTY_REVIEW_DOMAINS.some((d) => new RegExp(`(^|\\.)${d.replace(".", "\\.")}$`, "i").test(safeHostname(sourceUrl)))) {
        errors.push(`Line ${lineNo}: source_url "${sourceUrl}" is a third-party review site, not the operator's own page — spec-sheet facts must be editorially checked first-party (see data/README.md's "Casino spec sheet" section for why). This data belongs in onChainVolume.json instead if it genuinely can't be gathered any other way.`);
      }
    }
    if (flagTone && !FLAG_TONES[flagTone]) errors.push(`Line ${lineNo}: flag_tone "${flagTone}" must be one of ${Object.keys(FLAG_TONES).join(", ")}`);

    const flag = flagLabel && flagTone ? { label: flagLabel, ...FLAG_TONES[flagTone] } : undefined;

    parsed.push({ operatorSlug, groupTitle, fact: { label, value, chips, flag, sourcing, sourceUrl, asOf } });
  });

  if (errors.length > 0) {
    console.error(`${errors.length} error(s) — fix these and re-run. No files were changed.\n`);
    errors.forEach((e) => console.error(`  ${e}`));
    process.exit(1);
  }

  // Group into { operatorSlug: { groupTitle: [facts...] } }, preserving first-seen order.
  const byOperator = new Map();
  for (const row of parsed) {
    if (!byOperator.has(row.operatorSlug)) byOperator.set(row.operatorSlug, new Map());
    const groups = byOperator.get(row.operatorSlug);
    if (!groups.has(row.groupTitle)) groups.set(row.groupTitle, []);
    groups.get(row.groupTitle).push(row.fact);
  }

  const sheetsBySlug = new Map(sheets.map((s) => [s.operatorSlug, s]));
  let replaced = 0;
  let added = 0;
  for (const [operatorSlug, groups] of byOperator) {
    const entry = { operatorSlug, groups: [...groups.entries()].map(([title, facts]) => ({ title, facts })) };
    if (sheetsBySlug.has(operatorSlug)) replaced++;
    else added++;
    sheetsBySlug.set(operatorSlug, entry);
  }

  const next = [...sheetsBySlug.values()].sort((a, b) => a.operatorSlug.localeCompare(b.operatorSlug));

  console.log(`Parsed ${parsed.length} valid fact row(s) from ${csvPath}`);
  console.log(`  casinoSpecSheets.json: ${added} new operator(s), ${replaced} replaced (${next.length} operators total)`);

  if (dryRun) {
    console.log("\n--dry-run: no files were changed.");
    return;
  }

  writeJson("casinoSpecSheets.json", next);
  console.log("\nDone.");
}

main();
