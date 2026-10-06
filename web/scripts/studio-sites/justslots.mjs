import { sitemapUrls, meta, h1 } from "../lib/studio-fetch.mjs";

/**
 * Just Slots (just-slots.com). A Next.js site fed from Sanity; sitemap.xml
 * lists each game page at /game/<slug>. Every game record carries a
 * `cardImage`, the 1200x800 key art the games grid shows (the title logo over
 * the game's art, alt text "<Game> logo with ..."), and the page's og:image
 * is that same Sanity asset, cropped to 1200x630. The other images on the
 * page are the hero backdrop (1920x823, no title), a character cut-out and
 * feature screens. So the og:image is taken only when its asset is the
 * page's `cardImage`, and without the crop parameters, i.e. the whole card.
 * Files sit on cdn.sanity.io/images/oyszdhdc, the site's own image store.
 * The name is the page's <h1>.
 */
const ASSET = /^https:\/\/cdn\.sanity\.io\/images\/oyszdhdc\/production\/([0-9a-f]{40})-(\d+x\d+)\.(webp|png|jpe?g)/;

export default {
  studio: "Just Slots",
  host: "just-slots.com",
  async list() {
    const urls = await sitemapUrls("https://www.just-slots.com/sitemap.xml");
    return urls.filter((u) => /^https:\/\/www\.just-slots\.com\/game\/[a-z0-9-]+$/.test(u)).map((url) => ({ url }));
  },
  art(html) {
    const name = h1(html);
    const m = (meta(html, "og:image") ?? "").match(ASSET);
    if (!m) return { name, image: null };
    const flat = html.replace(/\\"/g, '"');
    const isCard = flat.includes(`"cardImage":{"_type":"image"`) && new RegExp(`"cardImage":\\{[^{}]*"asset":\\{"_ref":"image-${m[1]}-`).test(flat);
    return { name, image: isCard ? m[0] : null };
  },
};
