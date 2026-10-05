#!/usr/bin/env node
/**
 * App icons for licensed (fiat) sites whose own pages gave no usable icon.
 *
 * Many of those sites refuse automated requests or serve only the country
 * they are licensed in, but the same brand publishes an app, and the icon on
 * its App Store listing is the brand's own published mark. This asks Apple's
 * own search service (itunes.apple.com/search) in the market's country store
 * and takes an app's icon only when the app is provably the site's:
 *
 *   - the app's developer website (sellerUrl) is on the site's domain label
 *     (spela.svenskaspel.se ↔ svenskaspel), or
 *   - the app is named for the brand and its publisher shares the licence
 *     holder's name as the register gives it.
 *
 * A match is written to public/assets/logos/fiat/<domain>.webp like any other
 * icon, and data/fiat-logo-sources.json records the App Store listing as its
 * source. Apple limits the search service to about 20 calls a minute, so the
 * calls are spaced.
 *
 * Usage, from web/:  node scripts/fetch-fiat-app-icons.mjs [--limit N]
 */
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import sharp from "sharp";

const OUT = path.join("public", "assets", "logos", "fiat");
const SOURCES = path.join("data", "fiat-logo-sources.json");
const argv = process.argv.slice(2);
const LIMIT = Number(argv[argv.indexOf("--limit") + 1]) || 0;
const GAP_MS = 3200;

const sources = JSON.parse(fs.readFileSync(SOURCES, "utf8"));
const names = JSON.parse(fs.readFileSync(path.join("data", "fiat-site-names.json"), "utf8")).names;
const world = JSON.parse(fs.readFileSync(path.join("data", "world-market.json"), "utf8"));

const host = (d) => String(d).trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
const letters = (s) => String(s ?? "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
const labelOf = (d) => {
  const parts = d.split(".");
  const tld2 = parts.length > 2 && /^(co|com|org|net|bet|gov)$/.test(parts[parts.length - 2]);
  return parts[parts.length - (tld2 ? 3 : 2)] ?? d;
};
const isDomain = (s) => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(String(s).trim());
/** Company words that say nothing about who the company is. */
const FORM = /\b(ltd|limited|plc|p\.?l\.?c|llc|inc|ab|as|a\/s|aps|oü|ou|gmbh|s\.?a\.?|s\.?r\.?l|s\.?p\.?a|b\.?v|n\.?v|sp\.? z o\.?o\.?|d\.?o\.?o\.?|pty|enc|group|holdings?|gaming|entertainment|international|europe|online|malta|the)\b/gi;
const core = (s) => letters(String(s ?? "").replace(FORM, " "));

// Every domain without a logo, with the first market it is listed in, its
// register brand and licence holder.
const todo = new Map();
for (const [code, m] of Object.entries(world.countries)) {
  const cc = code.split("-")[0].toLowerCase();
  for (const k of ["casinos", "sportsbooks", "operators"]) {
    for (const o of m[k]?.operators ?? []) {
      for (const raw of o.domains ?? []) {
        const d = host(raw);
        if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(d) || sources.logos[d] || todo.has(d)) continue;
        const brand = (o.domains.length === 1 && !isDomain(o.brand) && o.brand !== o.licenseHolder ? o.brand : null) ?? names[d]?.name ?? labelOf(d);
        todo.set(d, { country: cc === "gb" ? "gb" : cc, brand, holder: o.licenseHolder ?? null });
      }
    }
  }
}
const list = [...todo.entries()].slice(0, LIMIT || undefined);
console.log(`${todo.size} sites without a logo · reading ${list.length}`);

function get(url, binary = false) {
  return new Promise((resolve) => {
    execFile("curl", ["-sL", "--connect-timeout", "8", "-m", "25", url], { maxBuffer: 12 * 1024 * 1024, encoding: binary ? "buffer" : "utf8" }, (_e, out) => resolve(out ?? (binary ? Buffer.alloc(0) : "")));
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const GAMBLING = /bet|casino|casin[oò]|poker|slot|bingo|apuest|wett|scommess|spiel|kladion|tipov|sázen|lotto|jackpot|sportsbook/i;

/** The app that is provably this site's, or null. */
function pick(results, d, brand, holder, foreign = false) {
  const label = letters(labelOf(d));
  const b = letters(brand);
  const scored = [];
  const tld = d.split(".").pop();
  // A site on a subdomain (apuestas.marca.es) shares its label with the
  // parent's other products; only a betting app is the site's.
  const parts = d.split(".");
  const sub = parts.length > 2 && !(parts.length === 3 && /^(co|com|org|net|bet|gov)$/.test(parts[1]));
  for (const r of results) {
    if (sub && !/bet|apuest|casino|wett|scommess|slot|spiel|lotto|poker|bingo/i.test(r.trackName)) continue;
    const sellerHost = r.sellerUrl ? host(r.sellerUrl) : null;
    // Same label on another country's domain is another company (playland.de
    // is not playland.com.tr).
    const sellerTld = sellerHost ? sellerHost.split(".").pop() : null;
    // A developer site on another domain counts only on the same ending or
    // the brand's .com: betano.com covers betano.de, proper.gr does not
    // cover proper.bet, yolo.com.gt does not cover yolo.com.
    if (sellerTld && sellerTld !== tld && sellerTld !== "com") continue;
    const seller = sellerHost ? letters(labelOf(sellerHost)) : null;
    const name = letters(r.trackName);
    const byUrl = seller && label.length >= 3 && seller === label;
    const holderCore = core(holder), sellerCore = core(r.sellerName);
    const byName = b.length >= 3 && name.startsWith(b) && holderCore.length >= 3 && sellerCore.length >= 3 && (holderCore.includes(sellerCore) || sellerCore.includes(holderCore));
    if (!byUrl && !byName) continue;
    // A developer site on another domain (supersport.com for supersport.hr,
    // wing.com for wing.ph) proves nothing unless the app is a gambling app.
    const regOf = (h) => { const p = h.split("."); return (p.length > 2 && /^(co|com|org|net|bet|gov)$/.test(p[p.length - 2]) ? p.slice(-3) : p.slice(-2)).join("."); };
    if (byUrl && !byName && regOf(sellerHost) !== regOf(d) && !GAMBLING.test(r.trackName)) continue;
    // Outside the market's own store, only the developer website proves it:
    // "MrGreen LLC" in the US store is not Mr Green.
    if (foreign && !byUrl) continue;
    // Among one publisher's apps, the one named for the brand, and a casino or
    // sportsbook rather than a poker or lottery side app.
    let score = (byUrl ? 4 : 0) + (byName ? 2 : 0) + (name.includes(label) || name.includes(b) ? 2 : 0) + (/casino|sport|bet/i.test(r.trackName) ? 1 : 0) - (/poker|tur|lotto|bingo|news|tv/i.test(r.trackName) ? 1 : 0);
    scored.push({ r, score, how: byUrl ? `developer website ${host(r.sellerUrl)}` : `publisher ${r.sellerName}` });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored[0] ?? null;
}

let found = 0, n = 0;
for (const [d, { country, brand, holder }] of list) {
  n++;
  let hit = null;
  for (const store of [...new Set([country, "us"])]) {
    const q = `https://itunes.apple.com/search?term=${encodeURIComponent(brand)}&entity=software&country=${store}&limit=15`;
    let json = null;
    try {
      json = JSON.parse(await get(q));
    } catch {
      json = null;
    }
    await sleep(GAP_MS);
    hit = json ? pick(json.results ?? [], d, brand, holder, store !== country) : null;
    if (hit) break;
  }
  if (hit) {
    const art = hit.r.artworkUrl512 || hit.r.artworkUrl100;
    const buf = await get(art, true);
    try {
      const out = await sharp(buf).resize(96, 96, { fit: "cover" }).webp({ quality: 82 }).toBuffer();
      fs.writeFileSync(path.join(OUT, `${d}.webp`), out);
      sources.logos[d] = { file: `${d}.webp`, sourceUrl: hit.r.trackViewUrl.replace(/\?.*$/, ""), via: `App Store icon (${hit.how})`, width: 512 };
      delete sources.failed?.[d];
      found++;
    } catch {
      /* not an image */
    }
  }
  if (n % 25 === 0) {
    fs.writeFileSync(SOURCES, JSON.stringify(sources, null, 2) + "\n");
    console.log(`  ${n}/${list.length} · ${found} app icons`);
  }
}
fs.writeFileSync(SOURCES, JSON.stringify(sources, null, 2) + "\n");
console.log(`done: ${found} of ${list.length} matched to an app`);
