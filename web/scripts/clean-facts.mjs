// Strips research notes out of published fact text: date stamps ("Article dated ...") and sentences
// about how a fact was gathered ("blocks fetching", "geo-blocked", "Google snippet"). The source link
// and asOf date already carry that provenance, so readers only see the fact itself.
// Run from web/: `node scripts/clean-facts.mjs` (prints every change).
import fs from "node:fs";

const FILE = "data/casinoSpecSheets.json";
const d = JSON.parse(fs.readFileSync(FILE, "utf8"));

const STAMP = /\s*\(?(?:Help |Crypto |Fiat |Rain )?(?:article|page|terms)(?: last)? (?:dated|updated|modified) [^.;)]*\)?[.;]?/gi;
const NOTE = /blocks fetching|could not be (?:fetched|viewed|found)|couldn.t be (?:identified|fetched)|geo-?blocked|research location|google snippet|cloudflare|wayback|found yet|were found in the text|was not found on (?:its|the) own pages|the only figure found|is behind a (?:bot|captcha)/i;

function clean(v) {
  // 1. Drop whole parentheticals that are research notes, e.g. "(the sports page is geo-blocked ...)".
  let out = v.replace(/\s*\(([^()]*)\)/g, (m, inner) => (NOTE.test(inner) || /^(?:help |crypto |fiat |rain )?(?:article|page|faq|terms)[^()]*(?:dated|updated|modified)/i.test(inner) ? "" : m));
  // 2. Drop trailing date stamps like "Article dated March 16, 2026." (outside brackets).
  out = out.replace(/\s*(?:Help |Crypto |Fiat |Rain )?(?:[Aa]rticle|[Pp]age|[Tt]erms)(?: last)? (?:dated|updated|modified) [A-Z0-9][^.;]*(?:[.;]|$)/g, "");
  // 3. Drop whole sentences that describe how the fact was gathered.
  out = out.split(/(?<=[.;])\s+/).filter((s) => s && !NOTE.test(s)).join(" ");
  return out.replace(/\s{2,}/g, " ").replace(/\s+([.,;])/g, "$1").replace(/;\s*$/, ".").trim();
}

let n = 0;
for (const e of d)
  for (const g of e.groups)
    for (const f of g.facts) {
      if (!f.value) continue;
      const c = clean(f.value);
      if (c !== f.value) {
        n++;
        console.log(`${e.operatorSlug} | ${f.label}\n  - ${f.value.slice(0, 200)}\n  + ${c.slice(0, 200)}`);
        f.value = c;
      }
    }
fs.writeFileSync(FILE, JSON.stringify(d, null, 2) + "\n");
console.log(`cleaned ${n} facts`);
