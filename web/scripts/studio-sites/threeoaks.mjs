import { fetchText, decode } from "../lib/studio-fetch.mjs";

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
 */
const ORIGIN = "https://3oaks.com";
const abs = (p) => (p ? new URL(p, ORIGIN).href : null);

export default {
  studio: "3 Oaks Gaming",
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
    const name = decode(d.title_text ?? item.name ?? "");
    const image = abs(d.banner_file) ?? abs(item.mainLogo) ?? abs(item.icon);
    return { name, image };
  },
};
