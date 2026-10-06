import { fetchText, decode } from "../lib/studio-fetch.mjs";

/**
 * ELK Studios (elk-studios.com). The /games/ grid lists every game as a tile:
 * the game's `game--feature-image` (alt = the game's name) over a generic
 * blue background, plus an "Info" link to its page. That feature image is
 * the game's title logo (often with its characters) on a transparent
 * background, and is also each game page's og:image and hero; ELK publishes
 * no separate banner or framed tile, so it is the key art taken here. The
 * page backgrounds ("background-webpage", "blu-background") carry no title.
 *
 * The site answers HTML requests with 429 Too Many Requests after one or two
 * pages (the image files are not limited), so the reader reads the single
 * grid page instead of 160 game pages: every item points at /games/, which
 * the runner then fetches once from cache. If /games/ itself is answered
 * with a 429, list() returns nothing; rerun a few minutes later.
 */
const GRID = "https://www.elk-studios.com/games/";

export default {
  studio: "ELK Studios",
  host: "elk-studios.com",
  async list() {
    const html = await fetchText(GRID);
    if (!html) return [];
    const items = [];
    const seen = new Set();
    for (const tile of html.split(/class="game-item--container/).slice(1)) {
      const fig = (tile.match(/<figure class="game--feature-image">([\s\S]*?)<\/figure>/) ?? [])[1];
      if (!fig) continue;
      const image = (fig.match(/\bsrc="(https:\/\/www\.elk-studios\.com\/app\/uploads\/[^"]+)"/) ?? [])[1];
      const name = decode((fig.match(/\balt="([^"]*)"/) ?? [])[1] ?? "");
      const page = (tile.match(/href="(https:\/\/www\.elk-studios\.com\/games\/[^"]+)">Info</) ?? [])[1];
      if (!image || !name || seen.has(name)) continue;
      seen.add(name);
      items.push({ url: GRID, name, image, page });
    }
    return items;
  },
  art(_html, item) {
    return { name: item.name, image: item.image };
  },
};
