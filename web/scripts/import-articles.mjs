#!/usr/bin/env node
/**
 * Import research-agent input for review. Nothing here commits, pushes,
 * merges, deploys or pings search engines.
 *
 *   article packages   → draft edits to data/guideRows.json + data/guideBodies.json
 *                        (+ a tracked, non-sensitive record in data/imports/<storyId>.json),
 *                        on the current feature branch only; refused on main/master
 *   article_private    → sidecar with editorialNotes / X drafts, matched by storyId + revision
 *   casino_change      → private review record in inbox/changes/; no site data is edited
 *   research_lead      → private record in inbox/leads/; never enters guide data
 *
 * Private output goes to <repo>/inbox/, which must be git-ignored and untracked.
 * Private text (editorial notes, X drafts) is never printed.
 *
 * Usage, from web/:
 *   node scripts/import-articles.mjs <file.json | folder> [...] --dry-run
 *   node scripts/import-articles.mjs <file.json | folder> [...]
 *   node scripts/import-articles.mjs <file.json> --adopt <storyId>    take over an existing article with no import record
 *
 * Exit codes: 0 done, 1 rejected or refused (nothing written), 3 done but a proposal needs review.
 * Contract and review steps: docs/article-import.md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run, gitInfo, parseJsonSafe } from "./lib/research-import.mjs";

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = path.resolve(WEB, "..");

const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const adoptAt = argv.indexOf("--adopt");
const adopt = adoptAt >= 0 ? argv[adoptAt + 1] : undefined;
const files = argv.filter((a, i) => !a.startsWith("--") && !(adoptAt >= 0 && i === adoptAt + 1));
const unknownFlags = argv.filter((a) => a.startsWith("--") && !["--dry-run", "--adopt"].includes(a));

if (!files.length || unknownFlags.length || (adoptAt >= 0 && !adopt)) {
  console.error("Usage: node scripts/import-articles.mjs <file.json | folder> [...] [--dry-run] [--adopt <storyId>]");
  process.exit(2);
}

const inputs = files.flatMap((f) => {
  const abs = path.resolve(process.cwd(), f);
  if (!fs.existsSync(abs)) return [{ name: path.basename(f), error: "file not found" }];
  const list = fs.statSync(abs).isDirectory() ? fs.readdirSync(abs).filter((x) => x.endsWith(".json")).sort().map((x) => path.join(abs, x)) : [abs];
  return list.map((p) => ({ name: path.basename(p), ...parseJsonSafe(fs.readFileSync(p, "utf8")) }));
});

const ctx = { root: ROOT, webDir: WEB, appDir: path.join(WEB, "app"), libDir: path.join(WEB, "lib"), reviewDir: path.join(ROOT, "inbox"), git: gitInfo(ROOT) };
const res = run(inputs, ctx, { dryRun, adopt });

for (const it of res.items) {
  console.log(`${it.outcome.padEnd(10)} ${it.label}${it.slug ? `  → /guides/${it.slug}` : ""}`);
  for (const m of it.messages ?? []) console.log(`           ${it.outcome === "rejected" ? "✗" : "·"} ${m}`);
}
if (dryRun && !res.errors.length) {
  console.log("\nDry run: nothing written. Would write:");
  for (const w of res.writes) console.log(`  ${w.tracked ? "tracked" : "private"}  ${path.relative(ROOT, w.file)}`);
}
if (res.refused) console.log(`\n✗ ${res.refused}`);
process.exit(res.exitCode);
