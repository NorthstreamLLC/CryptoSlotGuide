import { sitemapUrls, decode, meta } from "../lib/studio-fetch.mjs";

/**
 * Nolimit City (nolimitcity.com). The same Evolution fan-site build as
 * netent.mjs and redtiger.mjs, but Nolimit's game records are sparser: most
 * carry no `splashPoster` or `coverImage`, and their `icon` is a text-less
 * character portrait ("Website Icon No Text - <Game>.png"), not title art.
 * What every game record does carry is its own SEO share image, `metaImage`
 * ("Share Image - <Game>.png", "<game>_meta_image.jpg", 1200x628): the
 * title logo over the game's art, which the page also gives as its og:image.
 * Some of these carry a thin strip of compliance logos (18+, MGA) along the
 * bottom edge. The og:image is taken only when it is that record's
 * `metaImage` on fan-cdn.nolimitcity.com, the group CDN nolimitcity.com's
 * own pages load.
 *
 * The name is the page's own record, the `data` of its
 * getPopulatedGameBySlugV2 query ("Tombstone R.I.P", "San Quentin xWays"),
 * not the og:title, which adds " Slot - Play | ...".
 */
export default {
  studio: "Nolimit City",
  host: "nolimitcity.com",
  async list() {
    const urls = await sitemapUrls("https://nolimitcity.com/sitemap.xml");
    return urls.filter((u) => /^https:\/\/nolimitcity\.com\/games\/[a-z0-9-]+$/.test(u)).map((url) => ({ url }));
  },
  art(html, item) {
    const flat = html.replace(/\\"/g, '"');
    const slug = item.url.split("/").pop();
    const q = flat.indexOf(`"endpointName":"getPopulatedGameBySlugV2"`);
    const rec = q < 0 ? null : flat.slice(q).match(/"data":\{"id":\d+,"name":"((?:[^"\\]|\\.)*)"[^{}]*?"slug":"([^"]+)"/);
    let name = null;
    if (rec && rec[2] === slug) {
      try {
        name = decode(JSON.parse(`"${rec[1]}"`));
      } catch {
        name = decode(rec[1]);
      }
    }
    name ||= (meta(html, "og:title") ?? "").replace(/ Slot - Play \|.*$/, "");
    const og = meta(html, "og:image");
    const file = og && og.match(/^https:\/\/fan-cdn\.nolimitcity\.com\/([^/?#]+)$/)?.[1];
    const isMeta = file && new RegExp(`"metaImage":\\{"id":\\d+,[^]{0,3000}?"url":"https://fan-cdn\\.nolimitcity\\.com/${file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`).test(flat);
    return { name, image: isMeta ? og : null };
  },
};
