import { fetchText, sitemapUrls, meta, decode } from "../lib/studio-fetch.mjs";

/**
 * Play'n GO (playngo.com). A Wix site. Its game pages (/games/<slug>) are
 * not in the sitemap, and the /games grid pages through Wix's data API, but
 * the sitemap's "additional-game-content" collection lists one page per game
 * under the same slug, so each slug's /games/ page is requested; a slug with
 * no game page returns nothing.
 *
 * A game page's og:image is the game's own 500x350 title tile (logo over the
 * characters), served from Wix's media host static.wixstatic.com, which the
 * site loads all its pictures from. The page's other images are the hero
 * backdrop ("_startpage", a phone mock-up without the title), the logo
 * alone, desktop/mobile screenshots and a symbol gallery — not key art.
 * The name is the og:title less its " Slot Demo" suffix.
 */
export default {
  studio: "Play'n GO",
  host: "playngo.com",
  async list() {
    const urls = await sitemapUrls("https://www.playngo.com/sitemap.xml");
    const slugs = new Set();
    for (const u of urls) {
      const m = u.match(/^https:\/\/www\.playngo\.com\/(?:additional-game-content|games)\/([^/?#]+)\/?$/);
      if (m) slugs.add(m[1]);
    }
    return [...slugs].map((slug) => ({ url: `https://www.playngo.com/games/${slug}` }));
  },
  art(html) {
    const title = meta(html, "og:title") ?? "";
    if (!/Slot Demo/i.test(title)) return { name: null, image: null }; // not a game page
    const name = decode(title.replace(/\s*Slot Demo.*$/i, ""));
    const og = meta(html, "og:image");
    const image = og && /^https:\/\/static\.wixstatic\.com\/media\//.test(og) ? og : null;
    return { name, image };
  },
};
