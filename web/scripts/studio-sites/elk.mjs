import fs from "node:fs";
import path from "node:path";
import { fetchText, decode } from "../lib/studio-fetch.mjs";
import { titleMatcher } from "../lib/match-title.mjs";

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
 *
 * The grid names three games differently from the catalogue, for the same
 * game: "Gritty Kitty" and "Rogue Rats" are the Nitropolis spin-offs the
 * catalogue calls "Gritty Kitty of Nitropolis" and "Rogue Rats of
 * Nitropolis" (the full name is on their logos), and "Taco Brothers
 * Deralied" is a typo for "Taco Brothers Derailed". The catalogue's spelling
 * is offered only when the grid's own is not in the catalogue, and must still
 * match an ELK Studios title exactly.
 */
const STUDIO = "ELK Studios";
const ALIAS = {
  "Gritty Kitty": "Gritty Kitty of Nitropolis",
  "Rogue Rats": "Rogue Rats of Nitropolis",
  "Taco Brothers Deralied": "Taco Brothers Derailed",
};
let matcher = null;
const known = (name) => {
  matcher ??= titleMatcher(JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games);
  return Boolean(matcher.match(name, STUDIO));
};
const spelling = (name) => (!known(name) && ALIAS[name] && known(ALIAS[name]) ? ALIAS[name] : name);
const GRID = "https://www.elk-studios.com/games/";

export default {
  studio: STUDIO,
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
      items.push({ url: GRID, name: spelling(name), image, page });
    }
    return items;
  },
  art(_html, item) {
    return { name: item.name, image: item.image };
  },
};
