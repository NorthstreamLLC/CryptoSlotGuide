/**
 * Reads UK operator licences from the Gambling Commission's own public
 * register into data/uk-licences.json.
 *
 * The register is the right source and the operators are the wrong one. A
 * .com site serves the international entity: casumo.com states a Gibraltar
 * licence, leovegas.com and betway.com state Malta. Reading "UKGC" off those
 * would be wrong, and the data this replaces claimed exactly that with no
 * source at all. The register maps company to account number to domain,
 * which is the part the operator sites obscure.
 *
 * MATCHED BY DOMAIN, not by name — the same lesson the US brands taught.
 * "Casumo" returns two entities and neither is called Casumo: the licence is
 * held by Recro Limited. Searching a brand and trusting the first hit would
 * have attributed the wrong company.
 *
 * Usage, from web/:
 *   node scripts/fetch-uk-licences.mjs --dry-run
 *   node scripts/fetch-uk-licences.mjs
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join("data", "uk-licences.json");
const BASE = "https://www.gamblingcommission.gov.uk";
const SEARCH = `${BASE}/public-register/businesses/results?business-search=`;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0 Safari/537.36";
const DRY = process.argv.includes("--dry-run");

/**
 * Brands to look for, and the domain that identifies each one's licence.
 * The search term is only a way to get candidate rows out of the register;
 * the domain is what decides which row is actually this brand.
 */
const BRANDS = [
  { slug: "leovegas", name: "LeoVegas", search: "LeoVegas", domains: ["leovegas.co.uk", "leovegas.com"] },
  { slug: "casumo", name: "Casumo", search: "Casumo", domains: ["casumo.com", "casumo.co.uk"] },
  { slug: "888casino", name: "888casino", search: "888", domains: ["888casino.com", "888casino.co.uk", "888.com"] },
  { slug: "bet365", name: "bet365 Casino", search: "bet365", domains: ["bet365.com", "bet365.co.uk"] },
  { slug: "playojo", name: "PlayOJO", search: "PlayOJO", domains: ["playojo.com", "playojo.co.uk"] },
  { slug: "betway", name: "Betway Casino", search: "Betway", domains: ["betway.com", "betway.co.uk"] },
];

const strip = (h) => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

async function get(url) {
  const r = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow" });
  if (!r.ok) throw new Error(`${r.status} for ${url}`);
  return r.text();
}

/**
 * One entry per result block. Split on the list item rather than scanning
 * flattened text: a run-together page puts the previous result's domain list
 * immediately before the next result's name, which is how an earlier pass
 * read "List of domain names casumo.com Recro Limited" as a company.
 */
function parseResults(html) {
  return html
    .split(/<li class="gcweb-search-result--item/)
    .slice(1)
    .map((block) => {
      const a = block.match(/<a href="(\/public-register\/business\/detail\/(\d+))"[^>]*>([\s\S]*?)<\/a>/);
      if (!a) return null;
      // The label wraps: "Account\n    number: </strong>61549".
      const acct = block.match(/Account\s*number:\s*<\/strong>\s*(\d+)/);
      const domains = [...block.matchAll(/<li>\s*([a-z0-9.-]+\.[a-z]{2,})\s*<\/li>/gi)].map((m) => m[1].toLowerCase());
      return {
        entity: strip(a[3]),
        accountNumber: acct ? acct[1] : a[2],
        detailUrl: BASE + a[1],
        domains: [...new Set(domains)],
      };
    })
    .filter(Boolean);
}

const out = { note: "", source: `${BASE}/public-register`, read: new Date().toISOString().slice(0, 10), brands: {} };

for (const b of BRANDS) {
  let rows = [];
  try {
    rows = parseResults(await get(SEARCH + encodeURIComponent(b.search)));
  } catch (e) {
    console.log(`  ${b.name.padEnd(14)} SEARCH FAILED — ${e.message}`);
    continue;
  }
  const want = b.domains.map((d) => d.toLowerCase());
  const hits = rows.filter((r) => r.domains.some((d) => want.includes(d) || want.some((w) => d.endsWith(`.${w}`))));
  if (!hits.length) {
    console.log(`  ${b.name.padEnd(14)} no register row carries ${b.domains.join(" / ")} (${rows.length} searched)`);
    continue;
  }
  out.brands[b.slug] = { name: b.name, licences: hits };
  for (const h of hits) console.log(`  ${b.name.padEnd(14)} ${h.entity} #${h.accountNumber}  [${h.domains.join(", ")}]`);
}

out.note =
  "UK operator licences, read from the Gambling Commission's public register by scripts/fetch-uk-licences.mjs. " +
  "Matched by DOMAIN, never by brand name: the register lists the licence holder, which is often not the brand — Casumo's is held by Recro Limited. " +
  "The operators' own .com sites state their international licences (Gibraltar for Casumo, Malta for LeoVegas and Betway), so they cannot be used to establish a UK licence. " +
  "Each entry keeps the register's own detail-page URL, which is the citation.";

const found = Object.keys(out.brands).length;
console.log(`\n  ${found} of ${BRANDS.length} brands matched to a register entry`);
if (DRY) console.log("  --dry-run: nothing written");
else {
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`  wrote ${OUT}`);
}
