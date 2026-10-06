import fs from "node:fs";
import path from "node:path";
import { fetchText, locsOf, meta, decode } from "../lib/studio-fetch.mjs";
import { titleMatcher } from "../lib/match-title.mjs";

/**
 * Pragmatic Play (pragmaticplay.com). WordPress; game pages at
 * /en/games/<slug>/. The sitemaps list each game in up to a dozen languages
 * and the English set is incomplete, so slugs are gathered across every
 * language and the English page requested for each (the same listing as
 * scripts/fetch-studio-rtps.mjs, with its saved slug list for when the
 * sitemaps 502).
 *
 * The game page's og:image is the game's own title tile
 * ("<CODE>_EN_339x180.png", the logo over the game's art) in
 * wp-content/uploads; the page has no larger picture of the game. The name
 * is the page's <h1 class="game-details__title"> (™ written "&#x2122;").
 *
 * One page names its game differently from the catalogue: "Book of the
 * Fallen" (/en/games/book-of-the-fallen/, tile "Book-of-Fallen_339x180") is
 * the catalogue's "Book of Fallen". The catalogue's spelling is offered only
 * when the page's own is not in the catalogue, and must still match a
 * Pragmatic Play title exactly. The jackpot builds ("Wolf Gold 1 Million",
 * "Diamond Strike 100,000", "Queen of Gold 100,000") are other games and are
 * not aliased to their base titles.
 */
const STUDIO = "Pragmatic Play";
const ALIAS = { "Book of the Fallen": "Book of Fallen" };
let matcher = null;
const known = (name) => {
  matcher ??= titleMatcher(JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games);
  return Boolean(matcher.match(name, STUDIO));
};
const spelling = (name) => (!known(name) && ALIAS[name] && known(ALIAS[name]) ? ALIAS[name] : name);
export default {
  studio: STUDIO,
  host: "pragmaticplay.com",
  async list() {
    const idx = await fetchText("https://www.pragmaticplay.com/sitemap_index.xml");
    const subs = locsOf(idx).filter((u) => /games-sitemap\d*\.xml$/.test(u));
    const slugs = new Set();
    for (const s of subs) {
      for (const u of locsOf(await fetchText(s))) {
        const m = u.match(/\/([a-z0-9-]+)\/$/);
        if (m && /\/(games|%E3%82%B2%E3%83%BC%E3%83%A0)\//i.test(u)) slugs.add(m[1]);
      }
    }
    if (!slugs.size) {
      const saved = path.join("data", "sources", "pragmatic-game-slugs.txt");
      if (fs.existsSync(saved)) {
        for (const line of fs.readFileSync(saved, "utf8").split(/\r?\n/)) if (/^[a-z0-9-]+$/.test(line.trim())) slugs.add(line.trim());
      }
    }
    return [...slugs].map((slug) => ({ url: `https://www.pragmaticplay.com/en/games/${slug}/` }));
  },
  art(html) {
    const name = decode((html.match(/<h1[^>]*game-details__title[^>]*>([^<]*)</) ?? [])[1]);
    if (!name) return { name: null, image: null };
    const og = meta(html, "og:image");
    // The game's own tile only: an upload, not the theme's or a logo.
    const image = og && /^https:\/\/www\.pragmaticplay\.com\/wp-content\/uploads\//.test(og) && !/logo/i.test(og) ? og : null;
    return { name: spelling(name), image };
  },
};
