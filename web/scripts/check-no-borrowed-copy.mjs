#!/usr/bin/env node
/**
 * Fails the build if prose from a sister site reaches this one.
 *
 * The same owner runs slotessentials.com, whose game export ships a templated
 * description per title — one template used 269 times across 338 games, 65 of
 * them with an affiliate link inline. The importer quarantines those, but an
 * import is not the only way copy travels: a hand-paste into a JSON file, a
 * future export with a differently-named column, or somebody deciding the
 * descriptions are "already written" all bypass it.
 *
 * Two sites publishing the same paragraphs is a duplicate-content problem for
 * both, and the borrowed copy is marketing prose rather than a sourced fact,
 * which is the opposite of what this site claims to be. So the phrases are
 * checked directly, everywhere, on every build.
 *
 * Usage: node scripts/check-no-borrowed-copy.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Distinctive strings from the slotessentials export. Chosen to be specific
 * enough that a false positive would have to be a near-verbatim copy — a
 * generic phrase here would fail the build on ordinary writing.
 */
const BORROWED = [
  "Our Favorite Casino for",
  "is our top recommendation",
  "delivers one of the smoothest slot experiences online",
  "With instant signup, fast crypto deposits",
  "making it the ideal home for spinning",
  "You'll also find exclusive promotions",
  "’ll also find exclusive promotions",
];

/** Affiliate links belong in ops.json's signupUrl, never inside prose. */
const INLINE_AFFILIATE = /\]\(https?:\/\/[^)]*\?ref=/i;

const roots = ["data", "app", "components", "lib"];
const exts = new Set([".json", ".ts", ".tsx", ".md"]);
const skip = new Set(["node_modules", ".next", ".git"]);

const hits = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!exts.has(path.extname(entry.name))) continue;
    // This file names the phrases it looks for, so it would flag itself.
    if (full.endsWith("check-no-borrowed-copy.mjs")) continue;

    let text;
    try {
      text = fs.readFileSync(full, "utf8");
    } catch {
      continue;
    }
    const rel = path.relative(web, full);
    for (const phrase of BORROWED) {
      if (text.includes(phrase)) hits.push({ rel, why: `borrowed phrase: "${phrase}"` });
    }
    const m = text.match(INLINE_AFFILIATE);
    if (m) hits.push({ rel, why: `affiliate link inside prose: ${m[0].slice(0, 60)}` });
  }
}

for (const r of roots) {
  const dir = path.join(web, r);
  if (fs.existsSync(dir)) walk(dir);
}

if (hits.length) {
  console.error(`check:copy — ${hits.length} instance(s) of copy that belongs to another site:\n`);
  for (const h of hits) console.error(`  ${h.rel}\n    ${h.why}`);
  console.error(`\nWrite it fresh from the stats instead. Two sites publishing the same`);
  console.error(`paragraphs costs both of them, and this site's claim is sourced facts,`);
  console.error(`not marketing prose.`);
  process.exit(1);
}

console.log(`check:copy — no borrowed prose or inline affiliate links found`);
