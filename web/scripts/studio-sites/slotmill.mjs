import { sitemapUrls, meta, h1 } from "../lib/studio-fetch.mjs";

/**
 * Slotmill (slotmill.com). A Next.js site on a Strapi CMS; sitemap.xml lists
 * each game page at /games/<slug>. Each page's og:image is the game's own
 * 855x688 banner ("<Game>-game-banner" in its alt text, title logo over the
 * game's art), served from the studio's CMS at cms.slotmill.com/uploads.
 * Pages without one fall back to the site-wide slotmill-og-logo.png on
 * slotmill.com itself, which the host check leaves out. The name is the
 * page's <h1>.
 *
 * Slotmill's site and CMS do not list Candy Castle.
 */
export default {
  studio: "Slotmill",
  host: "slotmill.com",
  async list() {
    const urls = await sitemapUrls("https://slotmill.com/sitemap.xml");
    return urls.filter((u) => /^https:\/\/slotmill\.com\/games\/[a-z0-9-]+$/.test(u)).map((url) => ({ url }));
  },
  art(html) {
    const name = h1(html) || (meta(html, "og:title") ?? "").replace(/\s+\|.*$/, "");
    const image = meta(html, "og:image");
    return { name, image: image && /^https:\/\/cms\.slotmill\.com\/uploads\//.test(image) ? image : null };
  },
};
