import fs from "node:fs";
import path from "node:path";
import { sitemapUrls, meta, h1 } from "../lib/studio-fetch.mjs";
import { titleMatcher } from "../lib/match-title.mjs";

/**
 * OneTouch (onetouch.io). A WordPress site with one page per game under
 * /games/<slug>/ (game-sitemap.xml). Each page's og:image is the game's own
 * 1500x904 key art ("<Game>_1500x904.jpg", title logo over the game's art) in
 * wp-content/uploads; the other images on the page (<Game>_01.png, _02.png)
 * are reel screenshots. The name is the og:title without " - OneTouch".
 *
 * The catalogue writes a few OneTouch names with a reel-count tag or another
 * spelling, for the same game (the site has one game of each name, and the
 * catalogue's own entry for each points at that game's art): "Fortune
 * Miner" and "Juicy 7" are "Fortune Miner - 3 reels" and "Juicy7 - 3 reels",
 * "Sumo Showdown" is "Sumo Showdown - 4 reels", and "Reel Fruit Frenzy"
 * (key art file "OT_ReelFruitzFrenzy_1500x904.jpg") is "Reel Fruitz Frenzy".
 * The catalogue's spelling is offered only when the page's own is not in the
 * catalogue, and must still match a OneTouch title exactly. Deluxe and Feature
 * Buy builds ("Wild Wild West Deluxe 2120", "Grand Heist Feature Buy") are
 * other games and are not aliased.
 */
const STUDIO = "OneTouch";
const ALIAS = {
  "Fortune Miner": "Fortune Miner - 3 reels",
  "Juicy 7": "Juicy7 - 3 reels",
  "Sumo Showdown": "Sumo Showdown - 4 reels",
  "Reel Fruit Frenzy": "Reel Fruitz Frenzy",
};
let matcher = null;
const known = (name) => {
  matcher ??= titleMatcher(JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games);
  return Boolean(matcher.match(name, STUDIO));
};
const spelling = (name) => (!known(name) && ALIAS[name] && known(ALIAS[name]) ? ALIAS[name] : name);

export default {
  studio: STUDIO,
  host: "onetouch.io",
  async list() {
    const urls = await sitemapUrls("https://www.onetouch.io/game-sitemap.xml");
    return urls.filter((u) => /^https:\/\/www\.onetouch\.io\/games\/[^/]+\/$/.test(u)).map((url) => ({ url }));
  },
  art(html) {
    const name = (meta(html, "og:title") ?? "").replace(/\s+-\s+OneTouch$/i, "") || h1(html);
    const image = meta(html, "og:image");
    return { name: spelling(name), image: image && /onetouch\.io\/wp-content\/uploads\//.test(image) ? image : null };
  },
};
