import { sitemapUrls, h1 } from "../lib/studio-fetch.mjs";

/**
 * Endorphina (endorphina.com). sitemap.xml lists each game at /games/<slug>.
 * The pages carry no og:image; the game's key art is the first picture of
 * the page's own gallery (section.game-detail → ul.slider-for), the
 * 1440x900 title splash ("/uploads/photos/<game>-<hash>.jpg", logo over the
 * game's art); the gallery's later pictures are numbered in-game
 * screenshots and /uploads/game-symbols/ holds the symbols. The name is the
 * <h1> less its " Slot" suffix.
 */
export default {
  studio: "Endorphina",
  host: "endorphina.com",
  async list() {
    const urls = await sitemapUrls("https://endorphina.com/sitemap.xml");
    return urls.filter((u) => /^https:\/\/endorphina\.com\/games\/[a-z0-9-]+\/?$/.test(u)).map((url) => ({ url }));
  },
  art(html, item) {
    const name = h1(html).replace(/\s+Slot$/i, "");
    const gallery = html.slice(Math.max(0, html.indexOf('class="slider-for"')));
    const first = html.includes('class="slider-for"') ? (gallery.match(/href="(\/uploads\/photos\/[^"]+\.(?:jpe?g|png|webp))"/i) ?? [])[1] : null;
    return { name, image: first ? new URL(first, "https://endorphina.com").href : null };
  },
};
