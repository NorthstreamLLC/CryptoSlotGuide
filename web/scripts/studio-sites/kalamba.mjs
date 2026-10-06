import fs from "node:fs";
import path from "node:path";
import { fetchText, decode, meta } from "../lib/studio-fetch.mjs";
import { titleMatcher } from "../lib/match-title.mjs";

/**
 * Kalamba Games (kalambagames.com). WordPress (Divi). Each game has a page at
 * /<slug>/ (older ones /<slug>_, project-sitemap.xml). The pages are not
 * consistent about their art: newer ones have a 1200x630 og:image, older ones
 * none, and the large page images are a logo on transparency ("logo-web",
 * "logocc.png") and 1280x720 reel screenshots. The one image every game has
 * is the 320x440 portrait title tile (game logo over the game's art,
 * "<game>-product-thumbnail.jpg", "<game>-320x440px.jpg", on the oldest
 * games "tn-<game>.jpg") that the site's own games grid at /games/ links to
 * each game page, so the grid is read once and each page's tile taken from
 * it. Files sit on kalambagames.com/wp-content/uploads.
 *
 * The name is the page's <title> (og:title) without " - Kalamba Games".
 * Kalamba titles its Christmas re-skin of Joker Times "Joker Times Xmas
 * Edition", where the catalogue holds "Joker Times Xmas": the same game, the
 * word "Edition" dropped. The reader offers the site's name first and, only
 * when the catalogue does not hold it, the name without a trailing
 * " Edition" after "Xmas"; either must still match a Kalamba title exactly.
 */
const STUDIO = "Kalamba Games";
const BASE = "https://kalambagames.com";
let matcher = null;
const known = (name) => {
  matcher ??= titleMatcher(JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games);
  return Boolean(matcher.match(name, STUDIO));
};
const spellings = (name) => [name, name.replace(/\bXmas Edition$/i, "Xmas")];

export default {
  studio: STUDIO,
  host: "kalambagames.com",
  async list() {
    const html = await fetchText(`${BASE}/games/`);
    const out = new Map();
    // <a href="https://kalambagames.com/<slug>/"><span class="et_pb_image_wrap …"><div …></div><img … src="…product-thumbnail.jpg"
    const re = /<a href="(https:\/\/kalambagames\.com\/[^"#?]+)"[^>]*>\s*<span class="et_pb_image_wrap[^"]*">(?:<div class="box-shadow-overlay"><\/div>)?<img[^>]+src="([^"]+)"/g;
    for (const m of (html ?? "").matchAll(re)) if (!out.has(m[1])) out.set(m[1], { url: m[1], tile: m[2] });
    return [...out.values()];
  },
  art(html, item) {
    const base = (meta(html, "og:title") ?? decode((html.match(/<title>(.*?)<\/title>/s) ?? [])[1])).replace(/\s+-\s+Kalamba Games$/i, "");
    const name = spellings(base).find(known) ?? base;
    const image = item.tile && /^https:\/\/kalambagames\.com\/wp-content\/uploads\/.+\.(jpe?g|png|webp)$/i.test(item.tile) ? item.tile : null;
    return { name, image };
  },
};
