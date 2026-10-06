import fs from "node:fs";
import path from "node:path";
import { sitemapUrls, h1 } from "../lib/studio-fetch.mjs";
import { titleMatcher } from "../lib/match-title.mjs";

/**
 * Evolution (games.evolution.com, the games site evolution.com links its
 * brand pages to). WordPress; sitemap_index.xml lists each game page, the
 * live tables at /live-casino/<category>/<slug>/ and the RNG versions at
 * /first-person/<slug>/. The site's og:image is one "social-thumbnail.jpg"
 * for every page, so it is not used. Each game page shows its own 600x840
 * poster (<img class="poster" alt="<Game> poster">, "<game>_poster_600x840"
 * or "<game>_web_imagery_600x840"): the game's title logo over its host and
 * art. That poster is the key art; the page's other images are the bare
 * logo ("conclusion-graphic") and tiles of related games. A page without a
 * poster (several older tables) gives no art. The /slots/ pages are the
 * group's NetEnt, Red Tiger and other brands' games, left to their own
 * readers; only English pages are read.
 *
 * Evolution names a live game show by its title alone ("Red Baron") where
 * the catalogue adds "Live" ("Red Baron Live"), the suffix the poster's own
 * logo carries. The reader offers the page's name first and, only on a
 * /live-casino/ page whose name the catalogue does not hold, the name with
 * " Live"; either must still match an Evolution Gaming title exactly.
 */
const STUDIO = "Evolution Gaming";
const BASE = "https://games.evolution.com";
let matcher = null;
const known = (name) => {
  matcher ??= titleMatcher(JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games);
  return Boolean(matcher.match(name, STUDIO));
};

export default {
  studio: STUDIO,
  host: "games.evolution.com",
  async list() {
    const urls = await sitemapUrls(`${BASE}/sitemap_index.xml`);
    return urls
      .filter((u) => /^https:\/\/games\.evolution\.com\/(live-casino\/[a-z0-9-]+|first-person)\/[a-z0-9-]+\/$/.test(u))
      .map((url) => ({ url }));
  },
  art(html, item) {
    let name = h1(html);
    if (name && !known(name) && item.url.includes("/live-casino/") && known(`${name} Live`)) name = `${name} Live`;
    const poster = (html.match(/<img\b[^>]*\bclass="poster"[^>]*>/i) ?? [])[0];
    const src = poster && (poster.match(/\bsrc="([^"]+)"/) ?? [])[1];
    const image = src && /^https:\/\/games\.evolution\.com\/wp-content\/uploads\/.+\.(jpe?g|png|webp)$/i.test(src) ? src : null;
    return { name, image };
  },
};
