import { sitemapUrls, h1 } from "../lib/studio-fetch.mjs";

/**
 * Popiplay (popiplay.com). WordPress (Elementor); wp-sitemap-posts-game-1.xml
 * lists each game page at /game/<slug>/. The page has no og:image; its key
 * art is the post's featured image, the game's own 500x500 tile
 * ("<Game>_500x500.jpg", title logo over the game's art), which Elementor
 * names in the page's config script ("post":{…,"featuredImage":"…"}) and
 * also paints as the hero background. The page's other picture
 * ("Untitled-1920-x-1080-px-….png") is an in-game screenshot with reels and
 * balance bar, so it is not taken. Files sit on
 * popiplay.com/wp-content/uploads. The name is the page's <h1>.
 *
 * The site's "Blazing Coins Deluxe: Hold & Win" matches the catalogue title
 * of that name; the catalogue's second entry for the same game, plain
 * "Blazing Coins Deluxe", is not matched to it (one page, one title).
 */
export default {
  studio: "Popiplay",
  host: "popiplay.com",
  async list() {
    const urls = await sitemapUrls("https://www.popiplay.com/wp-sitemap-posts-game-1.xml");
    return urls.filter((u) => /^https:\/\/www\.popiplay\.com\/game\/[a-z0-9-]+\/$/.test(u)).map((url) => ({ url }));
  },
  art(html) {
    const name = h1(html);
    const raw = (html.match(/"post":\{"id":\d+,[^{}]*?"featuredImage":"([^"]+)"/) ?? [])[1];
    const image = raw ? JSON.parse(`"${raw}"`) : null;
    return { name, image: image && /^https:\/\/www\.popiplay\.com\/wp-content\/uploads\//.test(image) ? image : null };
  },
};
