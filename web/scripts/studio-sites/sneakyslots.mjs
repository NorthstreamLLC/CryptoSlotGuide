import { sitemapUrls } from "../lib/studio-fetch.mjs";
import nolimit from "./nolimitcity.mjs";

/**
 * Sneaky Slots (sneakyslots.com), an Evolution studio whose site is the same
 * fan-site build as nolimitcity.com, page for page: each game page embeds
 * its record from getPopulatedGameBySlugV2, whose `icon` is a text-less
 * portrait ("Website Icon No Text - <Game>.png") and whose `images` are
 * symbols and feature cards, while its SEO `metaImage` ("Share Image -
 * <Game>.png", 1200x628, also the og:image) is the title logo over the
 * game's art, with a strip of compliance logos along the bottom edge. So the
 * Nolimit City reader's art() is reused as is; files sit on the group CDN
 * fan-cdn.nolimitcity.com, which sneakyslots.com's own pages load. The site
 * has a page for only some of its games (sitemap-0.xml, /games/<slug>).
 */
export default {
  ...nolimit,
  studio: "Sneaky Slots",
  host: "sneakyslots.com",
  async list() {
    const urls = await sitemapUrls("https://sneakyslots.com/sitemap.xml");
    return urls.filter((u) => /^https:\/\/sneakyslots\.com\/games\/[a-z0-9-]+$/.test(u)).map((url) => ({ url }));
  },
};
