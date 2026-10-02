#!/usr/bin/env node
/**
 * Reads SlotEssentials' studio profiles into data/slotessentials-providers.json.
 *
 * Same rule as the slot links: every URL comes from slotessentials.com's own
 * sitemap, never built from a name. SlotEssentials' provider slugs are its
 * own — Hacksaw is /providers/hacksaw, Pragmatic is /providers/pragmatic,
 * some carry a trailing hyphen — and a constructed URL like
 * /providers/hacksaw-gaming answers 200 with an empty shell, so a guessed
 * link would look fine and land nowhere.
 *
 * The studio's name is read from each profile's own <title>
 * ("Hacksaw Gaming Slots, RTP & Provider Review | SlotEssentials"); a page
 * whose title does not carry a studio name is dropped.
 *
 * Usage, from web/:
 *   node scripts/fetch-se-providers.mjs --dry-run
 *   node scripts/fetch-se-providers.mjs
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join("data", "slotessentials-providers.json");
const SITEMAP = "https://slotessentials.com/sitemap.xml";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/129.0 Safari/537.36";
const DRY = process.argv.includes("--dry-run");

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').trim();

const xml = await (await fetch(SITEMAP, { headers: { "user-agent": UA } })).text();
const urls = [...new Set([...xml.matchAll(/<loc>(https:\/\/slotessentials\.com\/providers\/[^<]+)<\/loc>/g)].map((m) => m[1]))];
console.log(`${urls.length} provider URLs in the sitemap`);

const providers = [];
for (const url of urls) {
  const html = await (await fetch(url, { headers: { "user-agent": UA } })).text();
  const title = decode((html.match(/<title>([^<]*)/) || [])[1] ?? "");
  const name = title.replace(/\s*Slots,\s*RTP.*$/i, "").trim();
  if (!name || /^SlotEssentials/i.test(name)) {
    console.log(`  skip ${url} (no studio name in title)`);
    continue;
  }
  providers.push({ name, url });
}
providers.sort((a, b) => a.name.localeCompare(b.name));

const out = {
  note: "SlotEssentials studio profiles, read from slotessentials.com/sitemap.xml by scripts/fetch-se-providers.mjs. Each name is the one the profile's own <title> gives. Matched to our studio names in lib/slotessentials.ts; never construct a URL from a name — SlotEssentials' slugs are its own.",
  sitemap: SITEMAP,
  read: new Date().toISOString().slice(0, 10),
  providers,
};
if (DRY) console.log(JSON.stringify(out, null, 2).slice(0, 2000));
else {
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`wrote ${OUT}: ${providers.length} profiles`);
}
