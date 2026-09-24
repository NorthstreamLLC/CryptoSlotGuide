/**
 * Fails the build if lib/house-order.ts names a slug that no longer exists.
 *
 * Worth a script because the failure mode is silent: `houseRank` returns the
 * unranked fallback for anything it doesn't recognise, so a renamed operator
 * just quietly drops to alphabetical and the placement it was meant to have
 * disappears without an error anywhere.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(web, p), "utf8"));

const known = new Set([...read("data/ops.json"), ...read("data/sweeps.json")].map((o) => o.slug));

// Pulled out of the source rather than imported, so this runs as plain node
// without a TypeScript step in the way.
const src = fs.readFileSync(path.join(web, "lib/house-order.ts"), "utf8");
const block = src.match(/const TIERS: string\[\]\[\] = \[([\s\S]*?)\n\];/);
if (!block) {
  console.error("check:house — could not find the TIERS block in lib/house-order.ts");
  process.exit(1);
}
const slugs = [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);

const missing = slugs.filter((s) => !known.has(s));
const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);

if (missing.length || dupes.length) {
  if (missing.length) console.error(`check:house — not in ops.json or sweeps.json: ${missing.join(", ")}`);
  if (dupes.length) console.error(`check:house — listed twice: ${[...new Set(dupes)].join(", ")}`);
  process.exit(1);
}

console.log(`check:house — ${slugs.length} placed slugs, all present`);
