import fs from "node:fs";
import path from "node:path";
import { fetchText, decode } from "../lib/studio-fetch.mjs";
import { titleMatcher } from "../lib/match-title.mjs";

/**
 * 3 Oaks Gaming (3oaks.com). The site is a single-page app with no sitemap
 * (every path, robots.txt included, returns the same app shell); its game
 * pages are drawn from the site's own JSON API at /api/v1. The public list
 * (/api/v1/games/?page_num=N, 10 per page) carries each game's `name` slug,
 * and the per-game record (/api/v1/games/<name>) — the one the game page at
 * 3oaks.com/games/<name> renders — names its images:
 *   banner_file     768x432 title banner (logo over the game's backdrop)
 *   main_logo_file  500x500 square title tile
 *   icon_file       370x555 portrait title tile (list record only)
 *   logo_file       the logo alone on transparency, not a picture
 *   gallery_images  in-game screenshots, not key art
 * The landscape banner is taken first, then the square tile. All files sit
 * on 3oaks.com itself.
 *
 * The public list holds only the games 3 Oaks currently markets (about 110,
 * all `provider: "3oaks"`; its search, `game_name=`, finds no others). The
 * older catalogue titles from the studio's Booongo years ("Book of Sun",
 * "Wolf Saga", "Pearl Diver" ...) are not on it, and the fuller list the
 * site has (/games/client_area) is behind the partner login, so they stay
 * unmatched.
 *
 * One site name differs from the catalogue's in spelling only: "Coin
 * Princess x1000" is the catalogue's "Coin Princess 1000" (3 Oaks writes
 * its x1000 builds "x1000": "DJ Tiger x1000", "Egypt Power x1000"; the
 * studio has no other Coin Princess 1000). The reader offers the site's
 * name first and, only when the catalogue does not hold it, the catalogue's
 * spelling from the table below; either must still match a 3 Oaks title
 * exactly.
 */
const ORIGIN = "https://3oaks.com";
const STUDIO = "3 Oaks Gaming";
const SPELLED = { "Coin Princess x1000": "Coin Princess 1000" };
let matcher = null;
const known = (name) => {
  matcher ??= titleMatcher(JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games);
  return Boolean(matcher.match(name, STUDIO));
};
const abs = (p) => (p ? new URL(p, ORIGIN).href : null);

export default {
  studio: STUDIO,
  host: "3oaks.com",
  async list() {
    const out = [];
    for (let page = 1; page <= 50; page++) {
      const t = await fetchText(`${ORIGIN}/api/v1/games/?page_num=${page}`);
      if (!t) break;
      let d;
      try {
        d = JSON.parse(t).data;
      } catch {
        break;
      }
      for (const g of d?.items ?? []) {
        if (g.name && g.has_page !== false)
          out.push({ url: `${ORIGIN}/api/v1/games/${g.name}`, page: `${ORIGIN}/games/${g.name}`, name: g.title_text, mainLogo: g.main_logo_file, icon: g.icon_file });
      }
      if (!d?.items?.length || page >= (d.total_pages ?? 0)) break;
    }
    return out;
  },
  art(json, item) {
    let d = {};
    try {
      d = JSON.parse(json).data ?? {};
    } catch {
      /* fall back to the list record */
    }
    const site = decode(d.title_text ?? item.name ?? "");
    const name = known(site) ? site : SPELLED[site] ?? site;
    const image = abs(d.banner_file) ?? abs(item.mainLogo) ?? abs(item.icon);
    return { name, image };
  },
};
