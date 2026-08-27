#!/usr/bin/env node
/**
 * RTP Watch CSV import — the "pragmatic default" ingest path root
 * README.md's RTP Watch section describes: testers work in a
 * spreadsheet, one row per reading, and this imports it. No CMS, no
 * auth, no new dependency (plain Node, no npm packages added).
 *
 * Usage:
 *   npm run import:rtp -- path/to/readings.csv
 *   npm run import:rtp -- path/to/readings.csv --dry-run
 *
 * CSV columns (header row required, any order, extra columns ignored):
 *   slot_slug, operator_slug, rtp, published_rtp, checked_at,
 *   checked_by, source, screenshot_url (optional), notes (optional)
 *
 * See data/rtp-readings-template.csv for a starting point.
 *
 * What this does:
 *  1. Validates every row against real slots.json / ops.json slugs and
 *     the rtp_reading schema (root README.md). Fails the whole import
 *     on any invalid row rather than writing a partial result — a bad
 *     row is far more likely to be a typo than something to silently
 *     drop.
 *  2. Upserts into data/rtpWatch.json, keyed by (slot_slug,
 *     operator_slug) — a re-import of the same pair replaces the old
 *     reading rather than duplicating it. This file holds ONLY real
 *     readings; it starts empty and only this script (or a careful
 *     hand-edit) should add to it.
 *  3. Adds any newly-seen operator to data/watchOps.json, so the RTP
 *     Watch matrix picks up a column for it automatically.
 *  4. Adds any newly-seen operator to data/fieldTestedOperators.json —
 *     reading a paytable inside an operator's client requires the same
 *     funded account casino/wallet/exchange reviews need, so a real
 *     RTP check is evidence for that broader claim too (see
 *     lib/field-tested.ts).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");

const SOURCE_ENUM = ["in_client_paytable", "operator_support", "reader_report"];

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
    console.error("Usage: npm run import:rtp -- path/to/readings.csv [--dry-run]");
    process.exit(1);
  }
  const resolvedPath = path.resolve(process.cwd(), csvPath);
  if (!existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const slots = readJson("slots.json");
  const ops = readJson("ops.json");
  const watchOps = readJson("watchOps.json");
  const rtpWatch = readJson("rtpWatch.json");
  const fieldTested = readJson("fieldTestedOperators.json");

  const slotSlugs = new Set(slots.map((s) => s.slug));
  const opBySlug = new Map(ops.map((o) => [o.slug, o]));
  const watchOpSlugs = new Set(watchOps.map((o) => o.slug));
  const fieldTestedSlugs = new Set(fieldTested);

  const raw = readFileSync(resolvedPath, "utf8");
  const table = parseCsv(raw);
  if (table.length < 2) {
    console.error("CSV has no data rows.");
    process.exit(1);
  }
  const header = table[0].map((h) => h.trim().toLowerCase());
  const col = (name) => header.indexOf(name);
  const required = ["slot_slug", "operator_slug", "rtp", "published_rtp", "checked_at", "checked_by", "source"];
  for (const r of required) {
    if (col(r) === -1) {
      console.error(`Missing required column: ${r}`);
      process.exit(1);
    }
  }

  const errors = [];
  const parsed = [];

  table.slice(1).forEach((cells, i) => {
    const lineNo = i + 2; // +1 for header, +1 for 1-indexing
    const get = (name) => (col(name) === -1 ? "" : (cells[col(name)] ?? "").trim());

    const slotSlug = get("slot_slug");
    const operatorSlug = get("operator_slug");
    const rtpStr = get("rtp");
    const publishedRtpStr = get("published_rtp");
    const checkedAt = get("checked_at");
    const checkedBy = get("checked_by");
    const source = get("source");
    const screenshotUrl = get("screenshot_url") || undefined;
    const notes = get("notes") || undefined;

    if (!slotSlug && !operatorSlug) return; // blank line

    if (!slotSlugs.has(slotSlug)) errors.push(`Line ${lineNo}: unknown slot_slug "${slotSlug}" (not in data/slots.json)`);
    if (!opBySlug.has(operatorSlug)) errors.push(`Line ${lineNo}: unknown operator_slug "${operatorSlug}" (not in data/ops.json)`);

    const rtp = Number(rtpStr);
    const publishedRtp = Number(publishedRtpStr);
    if (!Number.isFinite(rtp) || rtp <= 0 || rtp > 100) errors.push(`Line ${lineNo}: rtp "${rtpStr}" is not a valid percentage`);
    if (!Number.isFinite(publishedRtp) || publishedRtp <= 0 || publishedRtp > 100) errors.push(`Line ${lineNo}: published_rtp "${publishedRtpStr}" is not a valid percentage`);
    if (Number.isFinite(rtp) && Number.isFinite(publishedRtp) && rtp > publishedRtp) {
      errors.push(`Line ${lineNo}: rtp (${rtp}) is higher than published_rtp (${publishedRtp}) — an operator build can only match or cut the published figure, never exceed it`);
    }

    if (Number.isNaN(new Date(checkedAt).getTime())) errors.push(`Line ${lineNo}: checked_at "${checkedAt}" is not a valid date (use YYYY-MM-DD)`);
    if (!checkedBy) errors.push(`Line ${lineNo}: checked_by is required`);
    if (!SOURCE_ENUM.includes(source)) errors.push(`Line ${lineNo}: source "${source}" must be one of ${SOURCE_ENUM.join(", ")}`);

    parsed.push({
      id: `${slotSlug}-${operatorSlug}`,
      slotSlug,
      operatorSlug,
      rtp,
      publishedRtp,
      checkedAt,
      checkedBy,
      source,
      screenshotUrl,
      notes,
    });
  });

  if (errors.length > 0) {
    console.error(`${errors.length} error(s) — fix these and re-run. No files were changed.\n`);
    errors.forEach((e) => console.error(`  ${e}`));
    process.exit(1);
  }

  // Upsert by (slotSlug, operatorSlug)
  const key = (r) => `${r.slotSlug}::${r.operatorSlug}`;
  const existingByKey = new Map(rtpWatch.map((r) => [key(r), r]));
  let added = 0;
  let updated = 0;
  for (const row of parsed) {
    if (existingByKey.has(key(row))) updated++;
    else added++;
    existingByKey.set(key(row), row);
  }
  const nextRtpWatch = [...existingByKey.values()].sort((a, b) => a.slotSlug.localeCompare(b.slotSlug) || a.operatorSlug.localeCompare(b.operatorSlug));

  const newWatchOps = [];
  for (const row of parsed) {
    if (!watchOpSlugs.has(row.operatorSlug)) {
      watchOpSlugs.add(row.operatorSlug);
      newWatchOps.push({ slug: row.operatorSlug, name: opBySlug.get(row.operatorSlug).name });
    }
  }
  const nextWatchOps = [...watchOps, ...newWatchOps];

  const newFieldTested = [];
  for (const row of parsed) {
    if (!fieldTestedSlugs.has(row.operatorSlug)) {
      fieldTestedSlugs.add(row.operatorSlug);
      newFieldTested.push(row.operatorSlug);
    }
  }
  const nextFieldTested = [...fieldTested, ...newFieldTested].sort();

  console.log(`Parsed ${parsed.length} valid reading(s) from ${csvPath}`);
  console.log(`  rtpWatch.json: ${added} new, ${updated} updated (${nextRtpWatch.length} total)`);
  console.log(`  watchOps.json: ${newWatchOps.length} new operator(s)${newWatchOps.length ? " — " + newWatchOps.map((o) => o.name).join(", ") : ""}`);
  console.log(`  fieldTestedOperators.json: ${newFieldTested.length} new operator(s)${newFieldTested.length ? " — " + newFieldTested.join(", ") : ""}`);

  if (dryRun) {
    console.log("\n--dry-run: no files were changed.");
    return;
  }

  writeJson("rtpWatch.json", nextRtpWatch);
  if (newWatchOps.length) writeJson("watchOps.json", nextWatchOps);
  if (newFieldTested.length) writeJson("fieldTestedOperators.json", nextFieldTested);
  console.log("\nDone.");
}

main();
