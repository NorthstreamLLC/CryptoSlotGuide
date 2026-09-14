#!/usr/bin/env node
/**
 * On-chain deposit-volume CSV import — same shape as
 * scripts/import-rtp-readings.mjs and scripts/import-operator-audit.mjs,
 * for a different dataset: third-party platforms' (Tanzanite,
 * FairGambling, etc.) own attribution of on-chain wallet activity to an
 * operator. See lib/onchain-volume.ts and lib/types.ts's
 * OnChainVolumeSource for why this is kept separate from the
 * field-tested/community-reported/editorial sourcing tiers — it's
 * neither our own testing nor an aggregate of player reports, it's a
 * named platform's own wallet-clustering heuristic, which can be wrong.
 *
 * Usage:
 *   npm run import:onchain -- path/to/volume.csv
 *   npm run import:onchain -- path/to/volume.csv --dry-run
 *
 * CSV columns (header row required, any order, extra columns ignored):
 *   operator_slug, source, metric, value, note (optional), as_of, source_url
 *
 *   operator_slug — must exist in data/ops.json
 *   source        — platform name, e.g. "Tanzanite", "FairGambling"
 *   metric        — what was measured, e.g. "30-day deposit volume"
 *   value         — display-ready figure, e.g. "$2.25B" — not re-derived
 *   note          — optional secondary figure, e.g. "+13.8% vs prior month"
 *   as_of         — YYYY-MM-DD, the platform's own "last updated" date
 *                   where it publishes one, else the date you checked it
 *   source_url    — the exact page the figure was read from
 *
 * See data/onchain-volume-template.csv for a starting point.
 *
 * What this does:
 *  1. Validates every row against real ops.json slugs and required
 *     fields. Fails the whole import on any invalid row rather than
 *     writing a partial result.
 *  2. Upserts into data/onChainVolume.json, keyed by
 *     (operator_slug, source, metric) — a re-import of the same triple
 *     replaces the old figure (a platform's numbers move daily) rather
 *     than duplicating it. New (source, metric) pairs are appended to
 *     that operator's sources array; a brand-new operator gets a new
 *     entry. This file holds ONLY real, checked citations — it starts
 *     empty and only this script (or a careful hand-edit) should add to it.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");

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
    console.error("Usage: npm run import:onchain -- path/to/volume.csv [--dry-run]");
    process.exit(1);
  }
  const resolvedPath = path.resolve(process.cwd(), csvPath);
  if (!existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const ops = readJson("ops.json");
  const onChainVolume = readJson("onChainVolume.json");
  const opSlugs = new Set(ops.map((o) => o.slug));

  const raw = readFileSync(resolvedPath, "utf8");
  const table = parseCsv(raw);
  if (table.length < 2) {
    console.error("CSV has no data rows.");
    process.exit(1);
  }
  const header = table[0].map((h) => h.trim().toLowerCase());
  const col = (name) => header.indexOf(name);
  const required = ["operator_slug", "source", "metric", "value", "as_of", "source_url"];
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

    const source = get("source");
    const metric = get("metric");
    const value = get("value");
    const note = get("note") || undefined;
    const asOf = get("as_of");
    const sourceUrl = get("source_url");

    if (!opSlugs.has(operatorSlug)) errors.push(`Line ${lineNo}: unknown operator_slug "${operatorSlug}" (not in data/ops.json)`);
    if (!source) errors.push(`Line ${lineNo}: source is required`);
    if (!metric) errors.push(`Line ${lineNo}: metric is required`);
    if (!value) errors.push(`Line ${lineNo}: value is required`);
    if (Number.isNaN(new Date(asOf).getTime())) errors.push(`Line ${lineNo}: as_of "${asOf}" is not a valid date (use YYYY-MM-DD)`);
    if (!sourceUrl || !/^https?:\/\//.test(sourceUrl)) errors.push(`Line ${lineNo}: source_url "${sourceUrl}" must be a full http(s) URL`);

    parsed.push({ operatorSlug, source, metric, value, note, asOf, sourceUrl });
  });

  if (errors.length > 0) {
    console.error(`${errors.length} error(s) — fix these and re-run. No files were changed.\n`);
    errors.forEach((e) => console.error(`  ${e}`));
    process.exit(1);
  }

  const bySlug = new Map(onChainVolume.map((e) => [e.operatorSlug, e]));
  let newOperators = 0;
  let newSources = 0;
  let updatedSources = 0;

  for (const row of parsed) {
    let entry = bySlug.get(row.operatorSlug);
    if (!entry) {
      entry = { operatorSlug: row.operatorSlug, sources: [] };
      bySlug.set(row.operatorSlug, entry);
      newOperators++;
    }
    const existingIdx = entry.sources.findIndex((s) => s.source === row.source && s.metric === row.metric);
    const nextSource = { source: row.source, metric: row.metric, value: row.value, note: row.note, asOf: row.asOf, sourceUrl: row.sourceUrl };
    if (existingIdx === -1) {
      entry.sources.push(nextSource);
      newSources++;
    } else {
      entry.sources[existingIdx] = nextSource;
      updatedSources++;
    }
  }

  const next = [...bySlug.values()]
    .map((e) => ({ ...e, sources: e.sources.slice().sort((a, b) => a.source.localeCompare(b.source) || a.metric.localeCompare(b.metric)) }))
    .sort((a, b) => a.operatorSlug.localeCompare(b.operatorSlug));

  console.log(`Parsed ${parsed.length} valid row(s) from ${csvPath}`);
  console.log(`  onChainVolume.json: ${newOperators} new operator(s), ${newSources} new citation(s), ${updatedSources} updated citation(s) (${next.length} operators total)`);

  if (dryRun) {
    console.log("\n--dry-run: no files were changed.");
    return;
  }

  writeJson("onChainVolume.json", next);
  console.log("\nDone.");
}

main();
