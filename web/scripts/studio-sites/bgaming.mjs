import { sitemapUrls, meta, h1 } from "../lib/studio-fetch.mjs";

/**
 * BGaming (bgaming.com). WordPress; game-sitemap.xml lists each game page at
 * /games/<slug>. Every game page carries two title tiles of its own in
 * wp-content/uploads, both the game's logo over its art:
 *   - the landscape tile ("<Game>_1020x618.webp"), named as the `image` of
 *     the page's own VideoGame record in its JSON-LD (@id ".../<slug>/#game";
 *     the other VideoGame records there are related games);
 *   - the portrait tile ("<Game>_1020x1280.webp", on older pages
 *     "<Game>logo_vertical.webp"), which is the og:image.
 * The landscape tile is taken first, the portrait one otherwise. Each is a
 * different file on every game page, never a site-wide default. The name is
 * the page's <h1> (the post title). Branded copies ("…branded…", which
 * robots.txt keeps out of the index) are skipped.
 *
 * Some file names carry a Cyrillic "с"/"х" ("vertiсal", "1020х618"), so the
 * URL is percent-encoded before it reaches curl.
 */
const UPLOADS = /^https:\/\/bgaming\.com\/wp-content\/uploads\//;
const clean = (u) => (u && UPLOADS.test(u) ? encodeURI(decodeURI(u)) : null);

export default {
  studio: "BGaming",
  host: "bgaming.com",
  async list() {
    const urls = await sitemapUrls("https://bgaming.com/game-sitemap.xml");
    return urls.filter((u) => /^https:\/\/bgaming\.com\/games\/[a-z0-9-]+\/?$/.test(u) && !/branded/.test(u)).map((url) => ({ url }));
  },
  art(html, item) {
    const name = h1(html);
    const slug = item.url.replace(/\/$/, "").split("/").pop();
    const rec = html.match(new RegExp(`"@type":"VideoGame","@id":"https://bgaming\\.com/games/${slug}/#game"[^{}]*?"image":"([^"]+)"`));
    const landscape = rec ? JSON.parse(`"${rec[1]}"`) : null;
    const image = clean(landscape) ?? clean(meta(html, "og:image"));
    return { name, image };
  },
};
