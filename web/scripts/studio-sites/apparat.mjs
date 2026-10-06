import { sitemapUrls, meta, h1 } from "../lib/studio-fetch.mjs";

/**
 * Apparat Gaming (apparatgaming.com). WordPress (Flatsome portfolio, Yoast);
 * featured_item-sitemap.xml lists each game page at /games/slot/<slug>/.
 * Each page's og:image is the game's own 1400x800 key art
 * ("Apparat_<Game>-1400x800-1.jpg", title logo over the game's art) in
 * wp-content/uploads; the other images on a game page are its loader and
 * reel screenshots ("…-desktop-view-base", "…-mobile-portrait-…") and the
 * other games' 1400x800 tiles in the portfolio strip. The name is the page's
 * <h1> (the post title).
 */
export default {
  studio: "Apparat Gaming",
  host: "apparatgaming.com",
  async list() {
    const urls = await sitemapUrls("https://www.apparatgaming.com/featured_item-sitemap.xml");
    return urls.filter((u) => /^https:\/\/www\.apparatgaming\.com\/games\/slot\/[a-z0-9-]+\/$/.test(u)).map((url) => ({ url }));
  },
  art(html) {
    const name = h1(html) || (meta(html, "og:title") ?? "").replace(/\s+-\s+Apparat Gaming$/i, "");
    const image = meta(html, "og:image");
    return { name, image: image && /^https:\/\/www\.apparatgaming\.com\/wp-content\/uploads\//.test(image) ? image : null };
  },
};
