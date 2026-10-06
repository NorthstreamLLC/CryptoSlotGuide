import { fetchText, h1 } from "../lib/studio-fetch.mjs";

/**
 * Wicked Games (wicked.games). A Webflow site; the games grid at /games/all
 * links each game page at /game/<slug>. Both the game page's hero and most
 * grid cards are layered: a title-less backdrop ("…_BG.webp") with the
 * logo and characters on transparency over it ("…_LOGO.webp",
 * "…HERO-SECTION_<Game>.webp"), none of which is the key art by itself.
 * Some grid cards instead carry one composed square tile, the game's own
 * 384x384 roadmap image ("WICKED-WEBSITE-ROADMAP-IMAGES (n).webp", title logo
 * over the game's art): the card's backdrop slot is then empty (Webflow marks
 * it "w-dyn-bind-empty") and the tile sits in the "character" slot. Only
 * that case is taken; a card with a backdrop of its own has a cut-out logo
 * in that slot. Files sit on the Webflow CDN the site loads its images from,
 * cdn.prod.website-files.com/680a00e68141cc2033600a0e (the site's asset
 * collection). The name is the game page's <h1>.
 *
 * Lucked has a page but no grid card, and its page shows only the layered
 * hero, so it gets no tile.
 */
const BASE = "https://www.wicked.games";
const CDN = /^https:\/\/cdn\.prod\.website-files\.com\/680a00e68141cc2033600a0e\//;

export default {
  studio: "Wicked Games",
  host: "wicked.games",
  async list() {
    const html = await fetchText(`${BASE}/games/all`);
    const out = new Map();
    for (const card of (html ?? "").split(/role="listitem"/).slice(1)) {
      const href = (card.match(/href="(\/game\/[a-z0-9-]+)"/) ?? [])[1];
      if (!href || out.has(href)) continue;
      const bg = card.match(/<img src="[^"]+"[^>]*class="image_game-all( [^"]*)?"/);
      const tile = (card.match(/<img src="([^"]+)"[^>]*class="image_game-all character"/) ?? [])[1];
      const composed = bg && /w-dyn-bind-empty/.test(bg[1] ?? "") && tile && CDN.test(tile);
      out.set(href, { url: `${BASE}${href}`, tile: composed ? tile : null });
    }
    return [...out.values()];
  },
  art(html, item) {
    return { name: h1(html), image: item.tile };
  },
};
