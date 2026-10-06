import fs from "node:fs";
import path from "node:path";
import { sitemapUrls, decode } from "../lib/studio-fetch.mjs";
import { titleMatcher } from "../lib/match-title.mjs";

/**
 * Red Tiger (redtiger.com). Its og:image is one generic picture for every
 * game, but each game page embeds the game's own record, whose image fields
 * are named: `splashPoster` (the 2560x820 title banner), `icon` (the square
 * tile) and `images` (a gallery of symbols and feature screens, not key art).
 * The banner is taken first, in its "medium" rendition; files sit on the Evolution group CDN.
 *
 * The name is the last record name before the record's "math" block; a few
 * records carry no "math" (no RTP published yet: the page title reads
 * "undefined% RTP"), and for those the name is the page record's own, the
 * first "name" of getPopulatedGameBySlugV2's data. A page still waiting
 * for its art shows a generic "coming_soon" splash, which is no game's art
 * and is skipped.
 *
 * The site writes two titles differently from the catalogue: "Sugarlicious
 * Everyway" (Red Tiger's EveryWay mechanic; the catalogue's "Sugarlicious
 * Everywhere" has the slug sugarlicious-everyway) and "Snow Wild and the
 * Seven Features" (the catalogue's "...the 7 Features"). The reader offers
 * the site's name first and, only when the catalogue does not hold it, the
 * catalogue's spelling from the table below; either must still match a Red
 * Tiger title exactly.
 *
 * Only the games in the sitemap have a page; any other /games/<slug> serves
 * the generic catalogue shell. The /games grid itself is drawn in the
 * browser from the group's CMS (cmsevo.com/api), which takes a bearer key,
 * and the fetch helpers send no headers, so titles without a page stay
 * unmatched.
 */
const STUDIO = "Red Tiger";
const SPELLED = {
  "Sugarlicious Everyway": "Sugarlicious Everywhere",
  "Snow Wild and the Seven Features": "Snow Wild And The 7 Features",
};
let matcher = null;
const known = (name) => {
  matcher ??= titleMatcher(JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games);
  return Boolean(matcher.match(name, STUDIO));
};
const unjson = (raw) => {
  try {
    return decode(JSON.parse(`"${raw}"`));
  } catch {
    return decode(raw);
  }
};
function pick(rec, field) {
  const start = rec.search(new RegExp(`"${field}":\\[?\\{"id":\\d+,"name":`));
  if (start < 0) return null;
  const chunk = rec.slice(start, start + 4000);
  const url = (size) => (chunk.match(new RegExp(`"${size}":\\{[^}]*?"url":"([^"]+)"`)) ?? [])[1];
  return url("medium") ?? url("large") ?? url("small") ?? null;
}

export default {
  studio: STUDIO,
  host: "redtiger.com",
  async list() {
    const urls = await sitemapUrls("https://redtiger.com/sitemap.xml");
    return urls
      .filter((u) => u.startsWith("https://redtiger.com/games/") && u.replace(/\/$/, "").split("/").length === 5)
      .map((url) => ({ url }));
  },
  art(html) {
    const flat = html.replace(/\\"/g, '"');
    const math = flat.match(/"math":\{([^}]*)\}/);
    const before = flat.slice(0, math ? math.index : 0);
    const names = [...before.matchAll(/"name":"((?:[^"\\]|\\.)*)"/g)]
      .map((m) => m[1])
      .filter((n) => !/\.(png|jpe?g|webp|svg|mp4|gif)$/i.test(n));
    // Names are JSON strings ("Cake & Ice Cream"): unescape before decoding.
    let raw = math ? names.pop() ?? "" : "";
    if (!raw) raw = (flat.match(/"getPopulatedGameBySlugV2\([^)]*\)":\{[\s\S]{0,800}?"data":\{"id":\d+,"name":"((?:[^"\\]|\\.)*)"/) ?? [])[1] ?? "";
    const site = unjson(raw);
    const name = known(site) ? site : SPELLED[site] ?? site;
    const image = pick(flat, "splashPoster") ?? pick(flat, "icon") ?? pick(flat, "images");
    return { name, image: image && !/coming_soon/i.test(image) ? image : null };
  },
};
