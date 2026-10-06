import { fetchText, decode } from "../lib/studio-fetch.mjs";

/**
 * Hacksaw Gaming (hacksawgaming.com). The sitemap is from 2022 and the game
 * pages' og:image is the studio logo, so the reader works from the game
 * grid instead: every tile on /games (and the category grids) carries the
 * game's name and its square key-art tile, the 367x367
 * www-live.hacksawgaming.com/casino_thumbnails/<id>.jpg with the title logo
 * over the game's art. A game page itself shows a device mock-up
 * ("_hero_..._Devices_Desktop.png", a reel screenshot in a laptop) and a
 * bare logo, neither of which is key art.
 *
 * About 100 of the 252 tiles have no game page of their own; for those the
 * item points at the grid page the tile sits on. Titles the studio does not
 * show on its site at all (partner-studio releases among them) stay unmatched.
 */
const BASE = "https://www.hacksawgaming.com";
const GRIDS = ["/games", "/games/slots", "/games/instant-win-games", "/games/crash", "/games/scratchcards"];

export default {
  studio: "Hacksaw Gaming",
  host: "hacksawgaming.com",
  async list() {
    const byId = new Map();
    for (const grid of GRIDS) {
      const html = await fetchText(BASE + grid);
      if (!html) continue;
      for (const part of html.split(/<li class="GridListItem(?: js-launch-game)?"/).slice(1)) {
        const tile = part.split("</li>")[0];
        const id = (tile.match(/^\s*data-gameid="(\d+)"/) ?? [])[1];
        const name = (tile.match(/aria-label="([^"]*?)\s*\|\s*casino game image"/) ?? [])[1];
        const image = (tile.match(/data-bg-image="(https:\/\/www-live\.hacksawgaming\.com\/casino_thumbnails\/[^"]+)"/) ?? [])[1];
        if (!id || !name || !image) continue;
        const href = (tile.match(/href="(\/games\/[^"]+)" title="Read more/) ?? [])[1];
        const prev = byId.get(id);
        if (prev && (prev.hasPage || !href)) continue;
        byId.set(id, { url: href ? BASE + href : BASE + grid, hasPage: !!href, name: decode(name), image });
      }
    }
    return [...byId.values()];
  },
  art(_html, item) {
    return { name: item.name, image: item.image };
  },
};
