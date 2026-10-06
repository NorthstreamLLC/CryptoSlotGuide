import fs from "node:fs";
import path from "node:path";
import { sitemapUrls, meta, h1 } from "../lib/studio-fetch.mjs";
import { titleMatcher } from "../lib/match-title.mjs";

/**
 * Habanero (habanerosystems.com). Each game page (/games/<GameKey>, English
 * only; the zh-CN/it-IT/es-ES copies are skipped) has a per-game og:image:
 * the 425x266 landscape title tile, app-test.insvr.com/img/r/425/<Key>_en.png,
 * served from Habanero's own game-asset host. The page's JSON-LD carries a
 * portrait variant (img/rp/...) of the same art; the landscape tile is the
 * one taken. The name is the page's <h1>.
 *
 * The page /games/SGFrontierFortunes is headed "Frontier Fortune"; the game
 * key (and the catalogue) say "Frontier Fortunes", the same game. The
 * catalogue's spelling is offered only when the page's own is not in the
 * catalogue, and must still match a Habanero title exactly.
 */
const STUDIO = "Habanero";
const ALIAS = { "Frontier Fortune": "Frontier Fortunes" };
let matcher = null;
const known = (name) => {
  matcher ??= titleMatcher(JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games);
  return Boolean(matcher.match(name, STUDIO));
};
const spelling = (name) => (!known(name) && ALIAS[name] && known(ALIAS[name]) ? ALIAS[name] : name);
export default {
  studio: STUDIO,
  host: "habanerosystems.com",
  async list() {
    const urls = await sitemapUrls("https://www.habanerosystems.com/sitemap.xml");
    return urls.filter((u) => /^https:\/\/habanerosystems\.com\/games\/[^/]+$/.test(u)).map((url) => ({ url }));
  },
  art(html) {
    const name = h1(html) || meta(html, "og:image:alt");
    const image = meta(html, "og:image");
    return { name: spelling(name), image: image && /insvr\.com\/img\//.test(image) ? image : null };
  },
};
