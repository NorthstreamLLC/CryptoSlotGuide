/**
 * What needs re-checking, and what has already gone wrong on its own.
 *
 * Two different problems, which is why this is one script and not two:
 *
 * 1. STALE — a fact whose `asOf` is older than its subject deserves. Bonus
 *    terms move constantly; a licence number does not. One flat "everything
 *    over 30 days" threshold would drown the real signal in licence rows that
 *    are perfectly fine, so facts are tiered by how fast their subject actually
 *    moves.
 *
 * 2. DECAYING — a fact whose VALUE was only ever true on the day it was
 *    recorded: a countdown ("16d 07h"), a "currently", a hard future date.
 *    These are worse than stale, because re-checking the source does not fix
 *    them -- the fact should never have been stored in that form. Split into
 *    a fatal level (clocks and calendars) and an advisory one, because a first
 *    pass that treated every "currently" as fatal buried one real countdown
 *    under four false positives.
 *
 * Usage: node scripts/audit-freshness.mjs [--json] [--all]
 * Exits non-zero when anything is overdue or decaying, so it can gate a deploy
 * or drive a scheduled re-check.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(web, "data");
const asJson = process.argv.includes("--json");
const showAll = process.argv.includes("--all");
const TODAY = new Date();

/**
 * How long a fact stays trustworthy, by subject. Matched against the group or
 * label a fact sits under. First match wins, so order matters.
 */
const TIERS = [
  { days: 30, label: "fast", test: /bonus|promo|offer|rakeback|cashback|reload|race|raffle|vip|tournament|wager|free spin/i },
  { days: 60, label: "medium", test: /withdraw|deposit|payout|fee|limit|coin|minimum|maximum|game|provider|slot|sportsbook|esports|market|odds/i },
  { days: 365, label: "slow", test: /licen[cs]e|company|registration|compliance|kyc|privacy|terms|ownership|address|award/i },
];
const DEFAULT_TIER = { days: 90, label: "default" };

const tierFor = (context) => TIERS.find((t) => t.test.test(context)) ?? DEFAULT_TIER;

/**
 * Values that were only true the moment they were written.
 *
 * Two severities, because a first pass that flagged every "currently" buried
 * one real countdown under four false positives — "a period ends in net loss"
 * and "doesn't reduce today's cashback" are ordinary prose, not clocks.
 *
 * error: the value is a reading off a clock or a calendar. Always wrong to
 *   store, and re-checking the source will not fix it.
 * warn:  the value is pinned to an unstated "now". Usually fine, occasionally a
 *   real operational detail that will change. Reported, never fatal.
 */
const DECAY = [
  // A countdown needs digits attached to the verb, or it matches "ends in net loss".
  { name: "countdown", level: "error", re: /\b\d+\s*d\s*\d+\s*h\b|\b\d+\s*(?:days?|hrs?|hours?|mins?|minutes?)\s+(?:left|remaining|to go)\b|\b(?:ends?|resets?|expires?|closes?)\s+in\s+\d/i },
  { name: "dated-promo", level: "error", re: /\b(?:until|through|expires?|valid until|ends)\s+(?:\d{1,2}\s+)?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{0,4}\b/i },
  // Deliberately narrow: bare "today's"/"this week's" read as generic in prose
  // ("doesn't reduce today's cashback" means any day), so only the forms that
  // actually pin a claim to the day it was written are listed.
  { name: "relative-now", level: "warn", re: /\b(?:currently|right now|at the moment|as of (?:today|this week)|at present)\b/i },
];

const days = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(+d) ? null : Math.floor((TODAY - d) / 86400000);
};

/** Every fact-shaped record, with enough context to tier it and to point a human at it. */
function collect() {
  const out = [];
  for (const file of fs.readdirSync(DATA).filter((f) => f.endsWith(".json"))) {
    let json;
    try {
      json = JSON.parse(fs.readFileSync(path.join(DATA, file), "utf8"));
    } catch {
      continue;
    }
    walk(json, { file, trail: [], owner: null, asOf: null, sourceUrl: null });
  }
  return out;

  function walk(node, ctx) {
    if (Array.isArray(node)) return node.forEach((n) => walk(n, ctx));
    if (!node || typeof node !== "object") return;

    // Carry the nearest owner/date/source down the tree: a fact often inherits
    // its asOf from the group or operator above it.
    const next = {
      ...ctx,
      owner: node.operatorSlug ?? node.slug ?? ctx.owner,
      asOf: node.asOf ?? node.checked ?? node.updated ?? ctx.asOf,
      sourceUrl: node.sourceUrl ?? node.url ?? ctx.sourceUrl,
      trail: [...ctx.trail, node.title ?? node.label ?? null].filter(Boolean),
    };

    const value = typeof node.value === "string" ? node.value : null;
    const isFact = value !== null || (typeof node.headline === "string" && node.title);

    if (isFact) {
      const text = [value, node.headline, node.subCopy, ...(node.stats ?? []).map((s) => `${s.label}: ${s.value}`)].filter(Boolean).join(" ");
      const context = `${next.trail.join(" ")} ${ctx.file}`;
      const tier = tierFor(context);
      const age = next.asOf ? days(next.asOf) : null;
      out.push({
        file: ctx.file,
        owner: next.owner,
        label: next.trail[next.trail.length - 1] ?? "(unlabelled)",
        tier: tier.label,
        limit: tier.days,
        asOf: next.asOf,
        age,
        overdue: age !== null && age > tier.days,
        undated: !next.asOf,
        unsourced: !next.sourceUrl,
        decay: DECAY.filter((d) => d.re.test(text)).map((d) => ({ name: d.name, level: d.level })),
        sourceUrl: next.sourceUrl,
        sample: text.slice(0, 110),
      });
    }

    for (const [k, v] of Object.entries(node)) {
      if (k === "stats") continue;
      walk(v, next);
    }
  }
}

const facts = collect();
const decaying = facts.filter((f) => f.decay.length);
const broken = decaying.filter((f) => f.decay.some((d) => d.level === "error"));
const smells = decaying.filter((f) => !f.decay.some((d) => d.level === "error"));
const overdue = facts.filter((f) => f.overdue);
const undated = facts.filter((f) => f.undated);
const unsourced = facts.filter((f) => f.unsourced);

if (asJson) {
  console.log(JSON.stringify({ checked: TODAY.toISOString().slice(0, 10), total: facts.length, broken, smells, overdue, undated: undated.length, unsourced: unsourced.length }, null, 2));
  process.exit(broken.length || overdue.length ? 1 : 0);
}

console.log(`audit:freshness — ${facts.length} facts, checked ${TODAY.toISOString().slice(0, 10)}\n`);

console.log("BY TIER");
for (const t of [...TIERS, DEFAULT_TIER]) {
  const rows = facts.filter((f) => f.tier === t.label && !f.undated);
  if (!rows.length) continue;
  const late = rows.filter((f) => f.overdue).length;
  const oldest = Math.max(...rows.map((f) => f.age ?? 0));
  console.log(`  ${t.label.padEnd(8)} re-check every ${String(t.days).padStart(3)}d · ${String(rows.length).padStart(4)} facts · ${String(late).padStart(3)} overdue · oldest ${oldest}d`);
}

if (broken.length) {
  console.log(`\nDECAYED (${broken.length}) — a clock or a calendar stored as a fact. Re-checking the source will not fix these; rewrite the value.`);
  for (const f of broken.slice(0, showAll ? 999 : 12)) console.log(`  [${f.decay.map((d) => d.name).join(",")}] ${f.owner ?? "?"} · ${f.label}: ${f.sample}`);
  if (!showAll && broken.length > 12) console.log(`  … ${broken.length - 12} more (--all)`);
}

if (smells.length) {
  console.log(`\nPINNED TO "NOW" (${smells.length}) — advisory; check the wording still holds`);
  for (const f of smells.slice(0, showAll ? 999 : 8)) console.log(`  ${f.owner ?? "?"} · ${f.label}: ${f.sample}`);
  if (!showAll && smells.length > 8) console.log(`  … ${smells.length - 8} more (--all)`);
}

if (overdue.length) {
  console.log(`\nOVERDUE (${overdue.length})`);
  const byOwner = new Map();
  for (const f of overdue) byOwner.set(f.owner ?? f.file, (byOwner.get(f.owner ?? f.file) ?? 0) + 1);
  for (const [owner, n] of [...byOwner.entries()].sort((a, b) => b[1] - a[1]).slice(0, showAll ? 999 : 15)) console.log(`  ${String(n).padStart(4)}  ${owner}`);
}

console.log(`\nundated: ${undated.length}   unsourced: ${unsourced.length}`);
if (broken.length || overdue.length) {
  console.log("\nFAIL — see above");
  process.exit(1);
}
console.log("\nOK");
