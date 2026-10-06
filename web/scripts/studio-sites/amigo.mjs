import { fetchText, h1 } from "../lib/studio-fetch.mjs";

/**
 * Amigo Gaming (amigogaming.com). Laravel. Each game has a page at
 * /games/<slug> (sitemap.xml), but the page shows only a logo on
 * transparency ("image_header/…_LOGO.webp") over a title-less frame of the
 * background video. The game's tile — logo over the game's art — is the
 * "game icon" the site's own games grid at /games shows for it; the grid is
 * filled from /fetchGames?offsetPage=<n>&locale=en (the call the site's
 * games_page bundle makes; robots.txt keeps only /games?* out), which pages
 * through every game with its `url` and `image_main`, that icon. The other
 * image there, `image_alt`, is the "gameplay icon" shown on hover, a reel
 * view, so it is not taken. Files sit on amigogaming.com/storage/games.
 * Records marked `is_coming_soon` are skipped. Older icons have spaces in
 * their file names ("wildfire joker_icon new.png"), so the URL is
 * percent-encoded before it reaches curl. The name is the game page's <h1>.
 *
 * The site's "Mega Mushrooms" is likely the catalogue's "Mega Mushroom",
 * but the two disagree on its volatility (high on the site, medium in the
 * catalogue), so it is not mapped and stays unmatched until that is settled.
 */
const BASE = "https://amigogaming.com";
const ALIASES = {};

export default {
  studio: "Amigo Gaming",
  host: "amigogaming.com",
  async list() {
    const out = new Map();
    for (let page = 1, total = 1; page <= total && page <= 50; page++) {
      const raw = await fetchText(`${BASE}/fetchGames?offsetPage=${page}&locale=en`);
      let j;
      try {
        j = JSON.parse(raw ?? "");
      } catch {
        break;
      }
      total = Number(j.total_pages) || 0;
      for (const g of j.items ?? []) {
        if (!g.url || g.is_coming_soon || out.has(g.url)) continue;
        out.set(g.url, { url: g.url, image: g.image_main || null });
      }
    }
    return [...out.values()];
  },
  art(html, item) {
    const image = item.image && /^https:\/\/amigogaming\.com\/storage\/games\/[^"]+\.(webp|jpe?g|png)$/i.test(item.image) ? encodeURI(decodeURI(item.image)) : null;
    const name = h1(html);
    return { name: ALIASES[name] ?? name, image };
  },
};
