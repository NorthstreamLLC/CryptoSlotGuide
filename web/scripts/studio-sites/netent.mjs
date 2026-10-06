import { sitemapUrls, decode, meta } from "../lib/studio-fetch.mjs";

/**
 * NetEnt (netent.com). Same Evolution fan-site build as Red Tiger: the
 * og:image is one placeholder for every game ("netentmetaplaceholder"), but
 * each game page embeds the game's own record with named image fields:
 * `splashPoster` (the 2560x820 title banner), `icon` (the square tile),
 * `logo` (the bare title logo) and `images` (symbols and feature screens,
 * not key art). The banner is taken first, then the tile; files sit on the
 * group CDN fan-cdn.nolimitcity.com, which netent.com's own pages load.
 */
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
  studio: "NetEnt",
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
    return { name, image: /coming_soon/i.test(image ?? "") ? null : image };
  },
};
