import fs from "node:fs";
import path from "node:path";
import { sitemapUrls, h1 } from "../lib/studio-fetch.mjs";
import { titleMatcher } from "../lib/match-title.mjs";

/**
 * Fantasma Games (fantasmagames.com). WordPress; game-sitemap.xml lists each
 * game page at /game/<slug>/. The pages carry no og:image. The page's hero
 * holds two images: a backdrop ("<slug>-hero-bgr.webp", shown at 70%
 * opacity behind everything) and, over it, the game's 800x800 title tile
 * ("<slug>-hero-thumb.webp", logo over the game's art), which is the key
 * art. The rest of the page is numbered gameplay screenshots
 * ("01_<Game>_Intro-1024x576.jpg" …). Files sit on
 * www.fantasmagames.com/wp-content/uploads. The name is the page's <h1>.
 * Test pages ("…-slider-test", "slider-video-poker-test") are skipped.
 *
 * The site titles its Megaways game "Wins Of Nautilus" (the page lists
 * "Megaways" among its features); the catalogue holds it as "Wins of
 * Nautilus Megaways". The reader offers the site's name first and, only when
 * the catalogue does not hold it and the page says Megaways, the name with
 * " Megaways" added; either must still match a Fantasma title exactly.
 */
const STUDIO = "Fantasma Games";
let matcher = null;
const known = (name) => {
  matcher ??= titleMatcher(JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games);
  return Boolean(matcher.match(name, STUDIO));
};

export default {
  studio: STUDIO,
  host: "fantasmagames.com",
  async list() {
    const urls = await sitemapUrls("https://www.fantasmagames.com/game-sitemap.xml");
    return urls.filter((u) => /^https:\/\/www\.fantasmagames\.com\/game\/[a-z0-9-]+\/$/.test(u) && !/test\/$/.test(u)).map((url) => ({ url }));
  },
  art(html) {
    const base = h1(html);
    const megaways = /\bMegaways\b/.test(html.replace(/<[^>]+>/g, " ")) && !/megaways/i.test(base) ? [`${base} Megaways`] : [];
    const name = [base, ...megaways].find(known) ?? base;
    const image = (html.match(/<img\b[^>]*\bsrc="(https:\/\/www\.fantasmagames\.com\/wp-content\/uploads\/[^"]+-hero-thumb\.(?:webp|jpe?g|png))"/) ?? [])[1] ?? null;
    return { name, image };
  },
};
