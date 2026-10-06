import fs from "node:fs";
import path from "node:path";
import { sitemapUrls, h1 } from "../lib/studio-fetch.mjs";
import { titleMatcher } from "../lib/match-title.mjs";

/**
 * Endorphina (endorphina.com). sitemap.xml lists each game at /games/<slug>.
 * The pages carry no og:image; the game's key art is the first picture of
 * the page's own gallery (section.game-detail → ul.slider-for), the
 * 1440x900 title splash ("/uploads/photos/<game>-<hash>.jpg", logo over the
 * game's art); the gallery's later pictures are numbered in-game
 * screenshots and /uploads/game-symbols/ holds the symbols. The name is the
 * <h1> less its " Slot" suffix.
 *
 * Names the catalogue spells differently, for the same game:
 *   - the yearly "20xx Hit Slot" games, whose <h1> is "2026 Hit Slot": there
 *     " Slot" is part of the name (the page is /games/2026-hit-slot), so the
 *     <h1> as written is offered too;
 *   - "Hell Hot Dice 100" (catalogue "Hell Hot 100 Dice") and "The Vampires
 *     II Dice" (catalogue "The Vampires 2 (Dice)"): the Dice build of the
 *     same game, its words in another order;
 *   - "Amazons Riches" (catalogue "Amazon Riches"; the site has no other).
 * The catalogue's spelling is offered only when the page's own is not in
 * the catalogue, and must still match an Endorphina title exactly. A Dice
 * build is never folded onto its base game ("Lucky Streak 1" is not
 * "Lucky Streak 1 (Dice)").
 */
const STUDIO = "Endorphina";
const ALIAS = {
  "Hell Hot Dice 100": "Hell Hot 100 Dice",
  "The Vampires II Dice": "The Vampires 2 (Dice)",
  "Amazons Riches": "Amazon Riches",
};
let matcher = null;
const known = (name) => {
  matcher ??= titleMatcher(JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games);
  return Boolean(matcher.match(name, STUDIO));
};

export default {
  studio: STUDIO,
  host: "endorphina.com",
  async list() {
    const urls = await sitemapUrls("https://endorphina.com/sitemap.xml");
    return urls.filter((u) => /^https:\/\/endorphina\.com\/games\/[a-z0-9-]+\/?$/.test(u)).map((url) => ({ url }));
  },
  art(html, item) {
    const full = h1(html);
    const short = full.replace(/\s+Slot$/i, "");
    const name = [short, full, ALIAS[short]].find((n) => n && known(n)) ?? short;
    const gallery = html.slice(Math.max(0, html.indexOf('class="slider-for"')));
    const first = html.includes('class="slider-for"') ? (gallery.match(/href="(\/uploads\/photos\/[^"]+\.(?:jpe?g|png|webp))"/i) ?? [])[1] : null;
    return { name, image: first ? new URL(first, "https://endorphina.com").href : null };
  },
};
