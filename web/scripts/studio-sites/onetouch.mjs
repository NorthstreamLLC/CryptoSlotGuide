import { sitemapUrls, meta, h1 } from "../lib/studio-fetch.mjs";

/**
 * OneTouch (onetouch.io). A WordPress site with one page per game under
 * /games/<slug>/ (game-sitemap.xml). Each page's og:image is the game's own
 * 1500x904 key art ("<Game>_1500x904.jpg", title logo over the game's art) in
 * wp-content/uploads; the other images on the page (<Game>_01.png, _02.png)
 * are reel screenshots. The name is the og:title without " - OneTouch".
 */
export default {
  studio: "OneTouch",
  host: "onetouch.io",
  async list() {
    const urls = await sitemapUrls("https://www.onetouch.io/game-sitemap.xml");
    return urls.filter((u) => /^https:\/\/www\.onetouch\.io\/games\/[^/]+\/$/.test(u)).map((url) => ({ url }));
  },
  art(html) {
    const name = (meta(html, "og:title") ?? "").replace(/\s+-\s+OneTouch$/i, "") || h1(html);
    const image = meta(html, "og:image");
    return { name, image: image && /onetouch\.io\/wp-content\/uploads\//.test(image) ? image : null };
  },
};
