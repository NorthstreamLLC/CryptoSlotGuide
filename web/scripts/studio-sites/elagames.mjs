import { sitemapUrls, h1 } from "../lib/studio-fetch.mjs";

/**
 * ELA Games (elagames.com). A Webflow site; sitemap.xml lists each game page
 * at /games/<slug>. The page has no og:image; its hero shows the game's own
 * 1000x1000 key art (<img class="game_img">, "…_1000x1000_<game>.webp",
 * title logo over the game's art). Further down the page come the reel
 * screenshots ("<game>_1 1.webp" …), a 1992x1116 promo banner with feature
 * symbols and a "Win up to" line, and the other games' 320x510 portrait
 * tiles (class "image-42"), none of which is taken. Files sit on the
 * Webflow CDN the site loads its images from,
 * cdn.prod.website-files.com/627a360c799876600d073b88 (the site's games
 * collection). The name is the page's <h1>.
 */
const CDN = /^https:\/\/cdn\.prod\.website-files\.com\/627a360c799876600d073b88\//;

export default {
  studio: "Ela Games",
  host: "elagames.com",
  async list() {
    const urls = await sitemapUrls("https://www.elagames.com/sitemap.xml");
    return urls.filter((u) => /^https:\/\/www\.elagames\.com\/games\/[a-z0-9-]+$/.test(u)).map((url) => ({ url }));
  },
  art(html) {
    const image = (html.match(/<img src="([^"]+)"[^>]*class="game_img"/) ?? [])[1] ?? null;
    return { name: h1(html), image: image && CDN.test(image) ? image : null };
  },
};
