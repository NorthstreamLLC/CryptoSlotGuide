import { sitemapUrls, meta, decode } from "../lib/studio-fetch.mjs";

/**
 * Big Time Gaming (bigtimegaming.com). A Squarespace site; sitemap.xml lists
 * each game at /games/<slug>. The page opens on the game's landscape title
 * banner ("banner_large_<Game>_1600x755.jpg", logo over the game's scene),
 * and its og:image is the game's portrait title tile ("<Game>_400x600.png").
 * Both sit on Squarespace's file hosts (images.squarespace-cdn.com,
 * static1.squarespace.com), which the site loads its pictures from. The rest
 * of the page is a gallery of feature screenshots ("_FreeSpins_9_mobile.png"
 * and so on), not key art. The name is the page's entry-title <h1>.
 */
export default {
  studio: "Big Time Gaming",
  host: "bigtimegaming.com",
  async list() {
    const urls = await sitemapUrls("https://www.bigtimegaming.com/sitemap.xml");
    return urls.filter((u) => /^https:\/\/www\.bigtimegaming\.com\/games\/[a-z0-9-]+\/?$/.test(u)).map((url) => ({ url }));
  },
  art(html) {
    const name = decode(((html.match(/<h1[^>]*entry-title[^>]*>([\s\S]*?)<\/h1>/) ?? [])[1] ?? "").replace(/<[^>]+>/g, " "));
    // The page's first image block is the landscape title banner
    // ("banner_large_<Game>_1600x755.jpg"), taken first; the portrait og:image
    // tile otherwise.
    const banner = (html.match(/(?:data-image|src)="(https:\/\/images\.squarespace-cdn\.com\/content\/v1\/[^"?]+\/banner[^"?/]*\.(?:jpe?g|png|webp))/i) ?? [])[1];
    let og = meta(html, "og:image");
    if (og) og = og.replace(/^http:\/\//, "https://");
    const tile = og && /^https:\/\/(static1\.squarespace\.com|images\.squarespace-cdn\.com)\//.test(og) && !/logo/i.test(og) ? og : null;
    return { name, image: banner ?? tile };
  },
};
