import { sitemapUrls, meta, h1 } from "../lib/studio-fetch.mjs";

/**
 * AvatarUX (avatarux.com). WordPress (Yoast); game-sitemap.xml lists each
 * game page at /games/<slug>/ (cz_game-sitemap.xml is the client zone and is
 * left alone). The page's hero is two layers drawn on top of each other — a
 * title-less backdrop ("Web-BG-1600x900-…", "…-Web-Background-…") and the
 * game's logo on transparency ("Web-Logo-Trailer-722x540-…") — and the games
 * grid at /games/ is built the same way, so neither is a picture of the key
 * art by itself. The one composed image of the game is the page's og:image,
 * its square thumbnail ("<Game>-Thumbnail-AvatarUX-300x300px.png",
 * "Thumbnail-150x150-<Game>.png"): the title logo over the game's art. It is
 * a different file on every page, never a site-wide default. Some games carry
 * only the 150px thumbnail; it is the studio's own tile all the same.
 *
 * The og:image is written protocol-relative ("//avatarux.com/…"), so https
 * is added. The name is the page's <h1>.
 *
 * Yggdrasil's YG Masters feed (yggdrasil.mjs, provider term "avatar-ux")
 * carries a few AvatarUX games too; the studio's own pages are read here.
 */
const UPLOADS = /^https:\/\/avatarux\.com\/wp-content\/uploads\//;

export default {
  studio: "AvatarUX",
  host: "avatarux.com",
  async list() {
    const urls = await sitemapUrls("https://avatarux.com/game-sitemap.xml");
    return urls.filter((u) => /^https:\/\/avatarux\.com\/games\/[a-z0-9-]+\/$/.test(u)).map((url) => ({ url }));
  },
  art(html) {
    const name = h1(html);
    let image = meta(html, "og:image");
    if (image?.startsWith("//")) image = `https:${image}`;
    return { name, image: image && UPLOADS.test(image) ? image : null };
  },
};
