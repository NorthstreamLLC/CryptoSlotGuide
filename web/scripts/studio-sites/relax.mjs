import { fetchText, decode } from "../lib/studio-fetch.mjs";

/**
 * Relax Gaming (relax-gaming.com). A server-rendered site whose sitemap.txt
 * lists each game page at /products/casino/<id>. The page has no og:image;
 * its key art is the 600x600 game thumbnail at the head of the page
 * (<img alt="<Game> Thumbnail">, "Thumbnail_<Game>_600x600.png", title logo
 * over the game's art), served from the studio's own asset host,
 * clientarea.relax-gaming.com/gameassets/<id>/thumbnail2x/. The other
 * pictures there (".../screenshot/...") are reel screenshots.
 *
 * Relax also publishes its partner studios' games ("Powered by Relax",
 * "Silver Bullet"); each page names its studio under the title
 * (<a href="/partners/studio/<studio>">). Only pages naming Relax Gaming
 * itself are read, so a partner's game never takes a Relax title. The name
 * is the breadcrumb's last item, the game's title.
 */
const ASSETS = /^https:\/\/clientarea\.relax-gaming\.com\/gameassets\/[^/]+\/thumbnail2x\//;

export default {
  studio: "Relax Gaming",
  host: "relax-gaming.com",
  async list() {
    const t = await fetchText("https://relax-gaming.com/sitemap.txt");
    const urls = (t ?? "").split(/\s+/).filter((u) => /^https:\/\/relax-gaming\.com\/products\/casino\/[a-z0-9_-]+$/i.test(u));
    return [...new Set(urls)].map((url) => ({ url }));
  },
  art(html) {
    const studio = (html.match(/<a href="\/partners\/studio\/([a-z0-9-]+)"/) ?? [])[1];
    if (studio !== "relax-gaming") return null;
    const name = decode((html.match(/<li class="breadcrumb-item active"[^>]*>([^<]*)<\/li>/) ?? [])[1]);
    const image = (html.match(/<img src="([^"]+)" alt="[^"]*Thumbnail"/) ?? [])[1] ?? null;
    return { name, image: image && ASSETS.test(image) ? encodeURI(decodeURI(image)) : null };
  },
};
