import fs from "node:fs";
import path from "node:path";
import { fetchText, decode } from "../lib/studio-fetch.mjs";
import { titleMatcher } from "../lib/match-title.mjs";

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
 * item points at the grid page the tile sits on.
 *
 * The grid names a few of its scratchcards differently from the catalogue:
 * "Scratch Bronze" / "Silver" / "Gold" / "Platinum" (the catalogue's
 * "Bronze scratch" ... "Platinum Scratch"), "Lucky Number x8" ... "x20"
 * ("Lucky Numbers x8" ...), "Spooky Scary Scratchy" ("Scary Spooky
 * Scratchy") and "Double Salary For 1 Year" ("Double Salary 1 Year"). Each
 * is Hacksaw's only game of that name, the same title written two ways, so
 * the reader offers the site's name first and, only when the catalogue does
 * not hold it, the catalogue's spelling from the table below; either must
 * still match a Hacksaw title exactly.
 *
 * Titles the studio does not show on its site at all stay unmatched. The
 * OpenRGS partner studios' releases (Bullshark Games, Kitsune Studios, NowNow
 * Gaming and others) are only named in text on the /news round-ups, with no
 * image; there is no partner-studio grid, and the site has no other game
 * list (the sitemap is from 2022 and the bundle loads no game API).
 */
const BASE = "https://www.hacksawgaming.com";
const GRIDS = ["/games", "/games/slots", "/games/instant-win-games", "/games/crash", "/games/scratchcards"];
const STUDIO = "Hacksaw Gaming";
const SPELLED = {
  "Scratch Bronze": "Bronze scratch",
  "Scratch Silver": "Silver Scratch",
  "Scratch Gold": "Gold Scratch",
  "Scratch Platinum": "Platinum Scratch",
  "Lucky Number x8": "Lucky Numbers x8",
  "Lucky Number x12": "Lucky Numbers x12",
  "Lucky Number x16": "Lucky Numbers x16",
  "Lucky Number x20": "Lucky Numbers x20",
  "Spooky Scary Scratchy": "Scary Spooky Scratchy",
  "Double Salary For 1 Year": "Double Salary 1 Year",
};
let matcher = null;
const known = (name) => {
  matcher ??= titleMatcher(JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games);
  return Boolean(matcher.match(name, STUDIO));
};

export default {
  studio: STUDIO,
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
    const name = known(item.name) ? item.name : SPELLED[item.name] ?? item.name;
    return { name, image: item.image };
  },
};
