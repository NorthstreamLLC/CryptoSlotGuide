#!/usr/bin/env node
/**
 * Desk-research import for the four "editorial" criteria in
 * data/criteria.json — bonus fairness, crypto support, trust &
 * licensing, and the catalogue side of game & RTP quality. None of
 * these need a funded account: they're read straight from an
 * operator's own terms/help pages, the licensing regulator's own
 * register, and AskGamblers/Casino.Guru's complaint history. This is
 * the "way faster" path for those four — the same CSV-import pattern
 * as scripts/import-rtp-readings.mjs, just for a different dataset.
 *
 * Usage:
 *   npm run import:audit -- path/to/audit.csv
 *   npm run import:audit -- path/to/audit.csv --dry-run
 *
 * CSV columns (header row required, any order, extra columns ignored):
 *   operator_slug, licence, kyc, bonus, wager, conf, absorbs_fee, ln,
 *   coins, audited_by, audited_at, notes (optional)
 *
 *   licence       — e.g. "Curaçao", "MGA", "Kahnawake" (as shown on the
 *                   regulator's own public register, not just the
 *                   operator's footer claim)
 *   kyc           — none | tiered | required
 *   bonus         — the real headline offer text, transcribed
 *   wager         — number, e.g. 1 or 40 (40x wagering)
 *   conf          — integer, confirmations required before credit
 *   absorbs_fee   — true/false — does the operator eat the network fee
 *   ln            — true/false — Lightning Network support
 *   coins         — semicolon-separated tickers, e.g. "BTC;ETH;USDT;SOL"
 *   audited_by    — initials or name
 *   audited_at    — YYYY-MM-DD
 *
 * See data/operator-audit-template.csv for a starting point.
 *
 * What this does:
 *  1. Validates every row against real ops.json slugs, the kyc enum,
 *     numeric fields, and coinDefs.json tickers. Fails the whole
 *     import on any invalid row — a bad row is far more likely to be a
 *     typo than something to silently drop.
 *  2. Updates the matching operator's licence/kyc/bonus/wager/conf/
 *     absorbsFee/ln fields directly in data/ops.json (these are
 *     properties of an existing record, not append-only per-cell data
 *     like RTP Watch — so this overwrites rather than upserts a list).
 *  3. Updates data/coinsBy.json for that operator if a coins column
 *     was supplied.
 *  4. Adds the operator to data/editoriallyAuditedOperators.json —
 *     this is what flips the review page's badges/copy from
 *     "published, not yet audited" to "desk-audited."
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");

const KYC_ENUM = ["none", "tiered", "required"];

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

function parseBool(v, lineNo, field, errors) {
  const s = v.trim().toLowerCase();
  if (["true", "yes", "1"].includes(s)) return true;
  if (["false", "no", "0", ""].includes(s)) return false;
  errors.push(`Line ${lineNo}: ${field} "${v}" must be true/false (or yes/no)`);
  return false;
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const csvPath = args.find((a) => !a.startsWith("--"));

  if (!csvPath) {
    console.error("Usage: npm run import:audit -- path/to/audit.csv [--dry-run]");
    process.exit(1);
  }
  const resolvedPath = path.resolve(process.cwd(), csvPath);
  if (!existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const ops = readJson("ops.json");
  const coinDefs = readJson("coinDefs.json");
  const coinsBy = readJson("coinsBy.json");
  const audited = readJson("editoriallyAuditedOperators.json");

  const opBySlug = new Map(ops.map((o) => [o.slug, o]));
  const validTickers = new Set(coinDefs.map((c) => c.ticker));
  const auditedSlugs = new Set(audited);

  const raw = readFileSync(resolvedPath, "utf8");
  const table = parseCsv(raw);
  if (table.length < 2) {
    console.error("CSV has no data rows.");
    process.exit(1);
  }
  const header = table[0].map((h) => h.trim().toLowerCase());
  const col = (name) => header.indexOf(name);
  const required = ["operator_slug", "licence", "kyc", "bonus", "wager", "conf", "audited_by", "audited_at"];
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

    if (!opBySlug.has(operatorSlug)) {
      errors.push(`Line ${lineNo}: unknown operator_slug "${operatorSlug}" (not in data/ops.json)`);
      return;
    }

    const licence = get("licence");
    const kyc = get("kyc");
    const bonus = get("bonus");
    const wagerStr = get("wager");
    const confStr = get("conf");
    const auditedBy = get("audited_by");
    const auditedAt = get("audited_at");
    const coinsStr = get("coins");
    const notes = get("notes") || undefined;

    if (!licence) errors.push(`Line ${lineNo}: licence is required`);
    if (!KYC_ENUM.includes(kyc)) errors.push(`Line ${lineNo}: kyc "${kyc}" must be one of ${KYC_ENUM.join(", ")}`);
    if (!bonus) errors.push(`Line ${lineNo}: bonus is required`);

    const wager = Number(wagerStr);
    if (!Number.isFinite(wager) || wager <= 0) errors.push(`Line ${lineNo}: wager "${wagerStr}" is not a valid multiplier`);

    const conf = Number(confStr);
    if (!Number.isInteger(conf) || conf < 0) errors.push(`Line ${lineNo}: conf "${confStr}" is not a valid confirmation count`);

    const absorbsFee = col("absorbs_fee") !== -1 ? parseBool(get("absorbs_fee"), lineNo, "absorbs_fee", errors) : undefined;
    const ln = col("ln") !== -1 ? parseBool(get("ln"), lineNo, "ln", errors) : undefined;

    let coins;
    if (coinsStr) {
      coins = coinsStr.split(";").map((t) => t.trim().toUpperCase()).filter(Boolean);
      for (const t of coins) {
        if (!validTickers.has(t)) errors.push(`Line ${lineNo}: unknown coin ticker "${t}" (not in data/coinDefs.json)`);
      }
    }

    if (Number.isNaN(new Date(auditedAt).getTime())) errors.push(`Line ${lineNo}: audited_at "${auditedAt}" is not a valid date (use YYYY-MM-DD)`);
    if (!auditedBy) errors.push(`Line ${lineNo}: audited_by is required`);

    parsed.push({ operatorSlug, licence, kyc, bonus, wager, conf, absorbsFee, ln, coins, auditedBy, auditedAt, notes });
  });

  if (errors.length > 0) {
    console.error(`${errors.length} error(s) — fix these and re-run. No files were changed.\n`);
    errors.forEach((e) => console.error(`  ${e}`));
    process.exit(1);
  }

  let updated = 0;
  let coinUpdates = 0;
  const newlyAudited = [];

  for (const row of parsed) {
    const op = opBySlug.get(row.operatorSlug);
    op.licence = row.licence;
    op.kyc = row.kyc;
    op.bonus = row.bonus;
    op.wager = row.wager;
    op.conf = row.conf;
    if (row.absorbsFee !== undefined) op.absorbsFee = row.absorbsFee;
    if (row.ln !== undefined) op.ln = row.ln;
    updated++;

    if (row.coins) {
      coinsBy[row.operatorSlug] = row.coins;
      coinUpdates++;
    }

    if (!auditedSlugs.has(row.operatorSlug)) {
      auditedSlugs.add(row.operatorSlug);
      newlyAudited.push(row.operatorSlug);
    }
  }

  console.log(`Parsed ${parsed.length} valid row(s) from ${csvPath}`);
  console.log(`  ops.json: ${updated} operator(s) updated`);
  console.log(`  coinsBy.json: ${coinUpdates} operator(s) updated`);
  console.log(`  editoriallyAuditedOperators.json: ${newlyAudited.length} new operator(s)${newlyAudited.length ? " — " + newlyAudited.join(", ") : ""}`);

  if (dryRun) {
    console.log("\n--dry-run: no files were changed.");
    return;
  }

  writeJson("ops.json", ops);
  if (coinUpdates > 0) writeJson("coinsBy.json", coinsBy);
  if (newlyAudited.length > 0) writeJson("editoriallyAuditedOperators.json", [...auditedSlugs].sort());
  console.log("\nDone.");
}

main();
