// Writes data/generated/client-facts.json: the few spec-sheet facts that
// client components read (which facts exist, and each casino's cited wagering
// term). The full casinoSpecSheets.json is ~690KB; importing it from a
// "use client" file ships all of it to every visitor. Runs in prebuild, so the
// file can't drift from the spec sheets in a deploy.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const p = (f) => fileURLToPath(new URL(`../data/${f}`, import.meta.url));
const sheets = JSON.parse(readFileSync(p("casinoSpecSheets.json"), "utf8"));
const out = {};
for (const s of sheets) {
  const labels = [];
  let wagering;
  for (const g of s.groups) for (const f of g.facts) {
    labels.push(`${g.title}|${f.label}`);
    if (g.title === "Bonus terms" && f.label === "Wagering" && f.value) wagering = f.value;
  }
  out[s.operatorSlug] = wagering ? { labels, wagering } : { labels };
}
writeFileSync(p("generated/client-facts.json"), JSON.stringify(out) + "\n");
console.log(`client-facts: ${Object.keys(out).length} casinos`);
