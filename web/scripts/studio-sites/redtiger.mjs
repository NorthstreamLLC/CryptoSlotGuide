import { sitemapUrls, decode } from "../lib/studio-fetch.mjs";

/**
 * Red Tiger (redtiger.com). Its og:image is one generic picture for every
 * game, but each game page embeds the game's own record, whose image fields
 * are named: `splashPoster` (the 2560x820 title banner), `icon` (the square
 * tile) and `images` (a gallery of symbols and feature screens, not key art).
 * The banner is taken first, in its "medium" rendition; files sit on the Evolution group CDN.
 */
function pick(rec, field) {
  const start = rec.search(new RegExp(`"${field}":\\[?\\{"id":\\d+,"name":`));
  if (start < 0) return null;
  const chunk = rec.slice(start, start + 4000);
  const url = (size) => (chunk.match(new RegExp(`"${size}":\\{[^}]*?"url":"([^"]+)"`)) ?? [])[1];
  return url("medium") ?? url("large") ?? url("small") ?? null;
}

export default {
  studio: "Red Tiger",
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
    const raw = names.pop() ?? "";
    let name;
    try {
      name = decode(JSON.parse(`"${raw}"`));
    } catch {
      name = decode(raw);
    }
    const image = pick(flat, "splashPoster") ?? pick(flat, "icon") ?? pick(flat, "images");
    return { name, image };
  },
};
