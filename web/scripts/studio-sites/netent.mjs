import fs from "node:fs";
import path from "node:path";
import { sitemapUrls, decode, meta } from "../lib/studio-fetch.mjs";
import { titleMatcher } from "../lib/match-title.mjs";

/**
 * NetEnt (netent.com). Same Evolution fan-site build as Red Tiger: the
 * og:image is one placeholder for every game ("netentmetaplaceholder"), but
 * each game page embeds the game's own record with named image fields:
 * `splashPoster` (the 2560x820 title banner), `icon` (the square tile),
 * `logo` (the bare title logo) and `images` (symbols and feature screens,
 * not key art). The banner is taken first, then the tile; files sit on the
 * group CDN fan-cdn.nolimitcity.com, which netent.com's own pages load.
 *
 * A few game records spell the name differently from the catalogue, for the
 * same game (one page each on the site, no second game of either name):
 * "Blood Suckers 2" (the catalogue's "Blood Suckers II"), "Fruit Shop
 * Christmas" ("Fruit Shop Christmas Edition"), "Jack Hammer 3: Diamond
 * Affair" (the catalogue drops the subtitle: "Jack Hammer 3"), "Ozzy
 * Osbourne" (netent.com's own branded-games page names it "Ozzy Osbourne
 * Video Slots", as the catalogue does) and "Codex of Fortune" (the catalogue
 * writes "Codex of Fortune™", and titleKey reads its ™ as the letters "TM").
 * The catalogue's spelling is offered only when the site's own is not in
 * the catalogue, and must still match a NetEnt title exactly. Sequels and
 * builds ("Victorious MAX", "Dead or Alive 2" vs "... Feature Buy") are
 * other games and are not aliased.
 */
const STUDIO = "NetEnt";
const ALIAS = {
  "Blood Suckers 2": "Blood Suckers II",
  "Fruit Shop Christmas": "Fruit Shop Christmas Edition",
  "Jack Hammer 3: Diamond Affair": "Jack Hammer 3",
  "Ozzy Osbourne": "Ozzy Osbourne Video Slots",
  "Codex of Fortune": "Codex of Fortune™",
};
let matcher = null;
const known = (name) => {
  matcher ??= titleMatcher(JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games);
  return Boolean(matcher.match(name, STUDIO));
};
const spelling = (name) => (!known(name) && ALIAS[name] && known(ALIAS[name]) ? ALIAS[name] : name);

function pick(rec, field) {
  const start = rec.search(new RegExp(`"${field}":\\[?\\{"id":\\d+,"name":`));
  if (start < 0) return null;
  // Only this field's own object: a field without a "medium" rendition must
  // not borrow the next field's.
  let i = rec.indexOf("{", start), depth = 0;
  const from = i;
  for (; i < rec.length; i++) {
    if (rec[i] === "{") depth++;
    else if (rec[i] === "}" && --depth === 0) break;
  }
  const chunk = rec.slice(from, i + 1);
  const url = (size) => (chunk.match(new RegExp(`"${size}":\\{[^}]*?"url":"([^"]+)"`)) ?? [])[1];
  const original = (chunk.match(/\},"hash":"[^"]*","ext":"[^"]*","mime":"[^"]*","size":[\d.]+,"url":"([^"]+)"/) ?? [])[1];
  return url("medium") ?? url("large") ?? original ?? url("small") ?? null;
}

export default {
  studio: STUDIO,
  host: "netent.com",
  async list() {
    const urls = await sitemapUrls("https://netent.com/sitemap.xml");
    return urls
      .filter((u) => u.startsWith("https://netent.com/games/") && u.replace(/\/$/, "").split("/").length === 5)
      .map((url) => ({ url }));
  },
  art(html) {
    const flat = html.replace(/\\"/g, '"');
    const math = flat.match(/"math":\{([^}]*)\}/);
    const before = flat.slice(0, math ? math.index : 0);
    const names = [...before.matchAll(/"name":"((?:[^"\\]|\\.)*)"/g)]
      .map((m) => m[1])
      .filter((n) => !/\.(png|jpe?g|webp|svg|mp4|gif)$/i.test(n));
    // A few records carry no "math" block; their name then comes from the
    // og:title, "<name> Slot - Play | <rtp> RTP, ...".
    const name = decode(names.pop() ?? "") || (meta(html, "og:title") ?? "").replace(/ Slot - Play \|.*$/, "");
    // Druids' Dream's banner is the Druid's Magic artwork (checked by eye);
    // its `logo` field holds the game's own 512px title tile instead.
    if (/^druids'? dream$/i.test(name.replace(/[’']/g, "'"))) return { name, image: pick(flat, "logo") };
    const image = pick(flat, "splashPoster") ?? pick(flat, "icon");
    // An unreleased game's banner is a generic "Coming Soon" placard.
    return { name: spelling(name), image: /coming_soon/i.test(image ?? "") ? null : image };
  },
};
