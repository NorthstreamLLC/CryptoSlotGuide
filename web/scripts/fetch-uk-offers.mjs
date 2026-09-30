/**
 * Pulls each UK operator's welcome offer wording off its OWN promotions page
 * and prints it for reading. Writes nothing.
 *
 * Deliberately an extractor, not a classifier. The last time a regex was
 * pointed at operator prose it filed four casinos as "KYC required" when all
 * four said the opposite, so this prints candidate sentences with their
 * source URL and a person decides what the fact is. What it saves is the
 * fetching and the hunting, which is the slow part.
 *
 * These sites are single-page apps whose homepage HTML carries no useful
 * links, but the promotions pages themselves are server-rendered — so the
 * homepage is scraped only for the promo URL, and the promo page for the
 * wording.
 *
 * Only standing offers belong in the data this feeds. A welcome bonus is
 * standing; a dated seasonal promotion is not, and must not be recorded.
 *
 *   node scripts/fetch-uk-offers.mjs
 *   node scripts/fetch-uk-offers.mjs leovegas
 *
 * WHERE YOU RUN THIS FROM DECIDES WHETHER IT IS TRUE. These operators serve
 * different terms by visitor location, and this machine answers from the US:
 * casumo.co.uk redirects to casumo.com/gi/ — Gibraltar — so the 30x wagering
 * it returns is the Gibraltar offer, not the UK one, and recording it as a
 * UK fact would be wrong in the same way reading a UKGC licence off a .com
 * site was wrong. LeoVegas happens not to redirect, and its .co.uk pages
 * carry GamStop and BeGambleAware, so that one is genuinely UK.
 *
 * Run from a UK connection before trusting anything here for a UK page.
 * Results as of 2026-09-30 from a US address:
 *   LeoVegas   UK offer, usable — 1x wagering, £10 deposit, 50 free spins
 *   Casumo     redirected to Gibraltar, NOT usable for the UK
 *   888casino  no promotions link in the shell HTML
 *   PlayOJO    no promotions link in the shell HTML
 *   Betway     no promotions link in the shell HTML
 *   bet365     403 to a scripted request
 */
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0 Safari/537.36";

const SITES = [
  { slug: "leovegas", name: "LeoVegas", home: "https://www.leovegas.co.uk/" },
  { slug: "casumo", name: "Casumo", home: "https://www.casumo.com/" },
  { slug: "888casino", name: "888casino", home: "https://www.888casino.com/" },
  { slug: "playojo", name: "PlayOJO", home: "https://www.playojo.com/" },
  { slug: "betway", name: "Betway", home: "https://betway.co.uk/" },
  { slug: "bet365", name: "bet365", home: "https://www.bet365.com/" },
];

const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));

async function get(url) {
  const r = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow" });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.text();
}

const text = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#163;|&pound;/g, "£")
    .replace(/\s+/g, " ")
    .trim();

/** Promotion and terms URLs, from whatever the shell HTML does carry. */
function candidates(html, home) {
  const host = new URL(home).host;
  const urls = new Set();
  for (const h of html.matchAll(/href="([^"]+)"/g)) {
    let u = h[1];
    try {
      u = new URL(u, home).href;
    } catch {
      continue;
    }
    if (new URL(u).host !== host) continue;
    if (/\/(promotions?|welcome|offers?|bonus|terms)(\/|$)/i.test(new URL(u).pathname)) urls.add(u.split("#")[0]);
  }
  // Rank: a welcome/casino offer page first, then generic promotions.
  return [...urls].sort(
    (a, b) => (/(welcome|casino)/i.test(b) ? 1 : 0) - (/(welcome|casino)/i.test(a) ? 1 : 0) || a.length - b.length
  );
}

/** Sentences that look like they carry an offer term, with light dedupe. */
function offerLines(t) {
  const out = [];
  const seen = new Set();
  for (const re of [
    /[^.!?]{0,150}\bwager[^.!?]{0,150}[.!?]/gi,
    /[^.!?]{0,120}\b\d+\s?x\b[^.!?]{0,120}[.!?]/gi,
    /[^.!?]{0,120}(free spins|bonus funds|match bonus)[^.!?]{0,120}[.!?]/gi,
    /[^.!?]{0,100}min(?:imum)?\.? deposit[^.!?]{0,120}[.!?]/gi,
  ]) {
    for (const m of t.matchAll(re)) {
      const s = m[0].trim().replace(/\s+/g, " ");
      const k = s.slice(0, 70).toLowerCase();
      if (s.length > 28 && s.length < 400 && !seen.has(k)) {
        seen.add(k);
        out.push(s);
      }
    }
  }
  return out.slice(0, 4);
}

for (const site of SITES) {
  if (only.length && !only.includes(site.slug)) continue;
  console.log(`\n═══ ${site.name}`);
  let home;
  try {
    home = await get(site.home);
  } catch (e) {
    console.log(`   homepage unreachable (${e.message}) — needs a manual source`);
    continue;
  }
  const urls = candidates(home, site.home);
  if (!urls.length) {
    console.log("   no promotions or terms URL in the shell HTML — needs a manual source");
    continue;
  }
  let printed = 0;
  for (const u of urls.slice(0, 3)) {
    let lines = [];
    try {
      lines = offerLines(text(await get(u)));
    } catch (e) {
      console.log(`   ${u} → ${e.message}`);
      continue;
    }
    if (!lines.length) continue;
    console.log(`   ${u}`);
    for (const l of lines) console.log(`      · ${l}`);
    if (++printed >= 2) break;
  }
  if (!printed) console.log(`   nothing extractable; checked ${urls.slice(0, 3).join(" , ")}`);
}
console.log("\n  Read these before recording anything. Nothing was written.");
