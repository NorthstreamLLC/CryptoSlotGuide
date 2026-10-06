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
 *
 * Names with an apostrophe ("Captain Xeno's Earth Adventure", "Free Reelin'
 * Joker") need two things the plain path misses: the sitemap writes the slug
 * XML-escaped ("free-reelin&apos;-joker"), and the og tags are read by their
 * double-quoted content here, since the shared meta() helper stops at the
 * first apostrophe and would cut the title to "Captain Xeno".
 */
const og = (html, prop) => {
  const m = html.match(new RegExp(`<meta\\b[^>]*\\bproperty="${prop}"[^>]*\\bcontent="([^"]*)"`, "i"));
  return m ? decode(m[1]) : meta(html, prop);
};

export default {
  studio: "Play'n GO",
  host: "playngo.com",
  async list() {
    const urls = await sitemapUrls("https://www.playngo.com/sitemap.xml");
    const slugs = new Set();
    for (const u of urls) {
      const m = u.match(/^https:\/\/www\.playngo\.com\/(?:additional-game-content|games)\/([^/?#]+)\/?$/);
      // The sitemap is XML, so a slug with an apostrophe arrives as
      // "free-reelin&apos;-joker"; the page lives at "free-reelin'-joker".
      if (m) slugs.add(m[1].replace(/&apos;/g, "'").replace(/&amp;/g, "&"));
    }
    return [...slugs].map((slug) => ({ url: `https://www.playngo.com/games/${slug}` }));
  },
  art(html) {
    const title = og(html, "og:title") ?? "";
    if (!/Slot Demo/i.test(title)) return { name: null, image: null }; // not a game page
    const name = decode(title.replace(/\s*Slot Demo.*$/i, ""));
    const img = og(html, "og:image");
    const image = img && /^https:\/\/static\.wixstatic\.com\/media\//.test(img) ? img : null;
    return { name, image };
  },
};
