import fs from "node:fs";
import path from "node:path";
import { sitemapUrls, meta, h1, decode } from "../lib/studio-fetch.mjs";
import { titleMatcher } from "../lib/match-title.mjs";

/**
 * Peter & Sons (peterandsonsgames.com; the old peterandsons.org only points
 * there). A Next.js site; pages-sitemap.xml lists each game at
 * /games/<Slug>. A game page's og:image is the game's backdrop with no title
 * on it ("_Background"); the page's own game record, embedded in the page
 * data, names `background`, `logo` (the logo alone) and `thumbnail`: the
 * 525x525 title tile (logo over the game's character), which is the key art.
 * The page data also carries the whole media library and other games'
 * records, so the record is found by its `background` — the og:image — with
 * its `thumbnail` the next media entry after it. Files sit on the studio's
 * Cloudinary account (res.cloudinary.com/dvdvr52pj), which the site loads
 * every picture from.
 *
 * Two names differ from the catalogue only by a leading "The", for the same
 * game: the site's "The Mafiosi" is the catalogue's "Mafiosi" and its
 * "Soapranos" the catalogue's "The Soapranos". The catalogue's spelling is
 * offered only when the page's own is not in the catalogue, and must still
 * match a Peter & Sons title exactly. The Scratchcard builds ("Ghost Father
 * Scratchcard" and the rest) are other games and are not aliased.
 */
const STUDIO = "Peter & Sons";
const ALIAS = { "The Mafiosi": "Mafiosi", Soapranos: "The Soapranos" };
let matcher = null;
const known = (name) => {
  matcher ??= titleMatcher(JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games);
  return Boolean(matcher.match(name, STUDIO));
};
const spelling = (name) => (!known(name) && ALIAS[name] && known(ALIAS[name]) ? ALIAS[name] : name);
export default {
  studio: STUDIO,
  host: "peterandsonsgames.com",
  async list() {
    const urls = await sitemapUrls("https://peterandsonsgames.com/sitemap.xml");
    return urls.filter((u) => /^https:\/\/peterandsonsgames\.com\/games\/[^/]+$/.test(u)).map((url) => ({ url }));
  },
  art(html) {
    const name = decode(h1(html) || (meta(html, "og:title") ?? "").replace(/\s*\|\s*Peter & Sons$/i, ""));
    const bg = meta(html, "og:image");
    if (!bg) return { name: spelling(name), image: null };
    const flat = html.replace(/\\"/g, '"');
    let image = null;
    for (let i = flat.indexOf(bg); i >= 0 && !image; i = flat.indexOf(bg, i + 1)) {
      const after = flat.slice(i, i + 6000);
      const m = after.match(/"thumbnail":\{"id":\d+,[^{}]*?"url":"(https:\/\/res\.cloudinary\.com\/dvdvr52pj\/[^"]+)"/);
      // The thumbnail must belong to this record: no other record's
      // background may come between the og:image and it.
      if (m && !/"background":\{/.test(after.slice(bg.length, m.index))) image = m[1];
    }
    return { name: spelling(name), image };
  },
};
