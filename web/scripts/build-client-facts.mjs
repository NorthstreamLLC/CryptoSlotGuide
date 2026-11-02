// Writes data/generated/client-facts.json: the few spec-sheet facts that
// client components read (which facts exist, and each casino's cited wagering
// term). The full casinoSpecSheets.json is ~690KB; importing it from a
// "use client" file ships all of it to every visitor. Runs in prebuild, so the
// file can't drift from the spec sheets in a deploy.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const p = (f) => fileURLToPath(new URL(`../data/${f}`, import.meta.url));
const sheets = JSON.parse(readFileSync(p("casinoSpecSheets.json"), "utf8"));
// Values (no sources) for the facts casinoFacts() puts on casino cards.
const CARD = new Set([
  "Payouts & fees|Stated withdrawal time", "Payouts & fees|Withdrawal fees", "Payouts & fees|Minimum withdrawal",
  "Coins & deposit limits|Minimum deposit", "Coins & deposit limits|Coins accepted",
  "Bonus terms|Minimum deposit", "Bonus terms|Standing offer", "Bonus terms|Expiry", "Bonus terms|Max cashout", "Bonus terms|Max bet",
  "Compliance|KYC policy", "Compliance|Licence",
]);
const out = {};
for (const s of sheets) {
  const labels = [];
  let wagering;
  const vals = {};
  for (const g of s.groups) for (const f of g.facts) {
    const k = `${g.title}|${f.label}`;
    labels.push(k);
    if (CARD.has(k)) vals[k] = { label: f.label, value: f.value, ...(f.chips ? { chips: f.chips } : {}) };
    if (g.title === "Bonus terms" && f.label === "Wagering" && f.value) wagering = f.value;
  }
  out[s.operatorSlug] = { labels, vals, ...(wagering ? { wagering } : {}) };
}
writeFileSync(p("generated/client-facts.json"), JSON.stringify(out) + "\n");
console.log(`client-facts: ${Object.keys(out).length} casinos`);
