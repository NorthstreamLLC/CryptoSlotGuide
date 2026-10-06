import fs from "node:fs";
import path from "node:path";
import { sitemapUrls, meta, h1 } from "../lib/studio-fetch.mjs";
import { titleKey } from "../lib/match-title.mjs";

/**
 * GAMOMAT (gamomat.com, WordPress). Each game page opens with a hero media
 * block (data-media-type="image") listing the game's landscape key art
 * "<game>_l" in several widths (400 to 2400, 1.9:1, logo and character);
 * the og:image is the same art as a 600x900 portrait "<game>_s". The hero is
 * taken at the first width of 900 or more; the og:image is the fallback.
 * The "image-teaser" blocks further down are other games' tiles.
 */
function hero(html) {
  for (const m of html.matchAll(/<div\b[^>]*class="js-media-container[^"]*"[^>]*>/g)) {
    const tag = m[0];
    if (!/data-media-type="image"/.test(tag)) continue;
    const dir = (tag.match(/data-dir="([^"]+)"/) ?? [])[1];
    let imgs, widths;
    try {
      imgs = JSON.parse((tag.match(/data-imgs='([^']+)'/) ?? [])[1] ?? "[]");
      widths = JSON.parse((tag.match(/data-widths='([^']+)'/) ?? [])[1] ?? "[]").map(Number);
    } catch {
      continue;
    }
    if (!dir || !imgs.length) continue;
    let i = widths.findIndex((w) => w >= 900);
    if (i < 0 || i >= imgs.length) i = imgs.length - 1;
    return new URL(`${dir.replace(/\/$/, "")}/${imgs[i]}`, "https://gamomat.com").href;
  }
  return null;
}

/**
 * Names: the catalogue abbreviates GAMOMAT's jackpot editions, which the site
 * spells out: "Red Hot Firepot" = RHFP (once "RHF"), "Golden Nights" = GDN or
 * GONI, "Respins of Amun-Re" = ROAR, "Easter Egg" = EE. Each edition has its
 * own page and art, so the spelt-out name is mapped to whichever abbreviated
 * form the catalogue holds for Gamomat (exact key, nothing fuzzy). A few
 * same-game spellings are listed in ALIAS.
 */
const EDITIONS = [
  [/\s+Red Hot Firepot$/i, [" RHFP", " RHF"]],
  [/\s+Golden Nights$/i, [" GDN", " GONI"]],
  [/\s+Respins of Amun-Re$/i, [" ROAR"]],
  [/\s+Easter Egg$/i, [" EE"]],
];
const ALIAS = {
  "Book of the Ages": "Book of Ages",
  "Ancient Riches": "Ancient Riches Casino",
  "Ancient Riches Casino Red Hot Firepot": "Ancient Riches RHFP",
};

let known = null;
function catalogueKeys() {
  if (known) return known;
  known = new Set();
  try {
    const games = JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games;
    for (const g of games) if (g.provider === "Gamomat") known.add(titleKey(g.name));
  } catch {}
  return known;
}

function resolveName(name) {
  const keys = catalogueKeys();
  if (keys.has(titleKey(name))) return name;
  const aliased = Object.entries(ALIAS).find(([k]) => titleKey(k) === titleKey(name));
  if (aliased) return aliased[1];
  const bases = [...new Set([name, name.replace(/^The\s+/i, ""), name.replace(/\bXtreme\b/i, "Extreme"), name.replace(/^The\s+/i, "").replace(/\bXtreme\b/i, "Extreme")])];
  const forms = [...bases];
  for (const b of bases) {
    for (const [re, abbrs] of EDITIONS) if (re.test(b)) for (const a of abbrs) forms.push(b.replace(re, a));
  }
  return forms.find((f) => keys.has(titleKey(f))) ?? name;
}

export default {
  studio: "Gamomat",
  host: "gamomat.com",
  async list() {
    const urls = await sitemapUrls("https://gamomat.com/sitemap_index.xml");
    return urls.filter((u) => /^https:\/\/gamomat\.com\/games\/[^/]+\/?$/.test(u)).map((url) => ({ url }));
  },
  art(html) {
    const raw = h1(html) || meta(html, "og:image:alt") || "";
    const name = raw ? resolveName(raw) : "";
    const og = meta(html, "og:image");
    const image = hero(html) ?? (og && /\/wp-content\/uploads\//.test(og) ? og : null);
    return { name, image };
  },
};
