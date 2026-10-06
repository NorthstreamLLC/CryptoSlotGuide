import { sitemapUrls } from "../lib/studio-fetch.mjs";

/**
 * PG Soft (pgsoft.com). Game pages are /games/<id>/, a Nuxt build with no
 * og:image; the game's record sits in window.__NUXT__ as `ggl` (name `n`)
 * and `gml`, a list of media typed by `pi`:
 *   3  games_cover          art without the title
 *   4  appicon              square icon, PG logo, no title
 *   8  games_details_phonecover_en   portrait poster WITH the title logo
 *   9  games_details_marketing       art without the title
 *   15 games_banner_bg_static        character cut-out, no title
 *   24 game_banner_en       1200x480 title banner (newest games only)
 * The landscape title banner is taken where the page has one, otherwise the
 * portrait title poster. Files are served from www.pgsoft.com/uploads.
 *
 * The sitemap names only the newest 100 game pages, but every id below
 * the highest one resolves, so ids 1..max+10 are all listed; an id with no
 * game gives no name and is skipped.
 */
const BASE = "https://www.pgsoft.com";
const unesc = (s) => s.replace(/\\u002F/g, "/").replace(/\\"/g, '"');

export default {
  studio: "PG Soft",
  host: "pgsoft.com",
  async list() {
    const ids = (await sitemapUrls(`${BASE}/sitemap.xml`))
      .map((u) => (u.match(/\/games\/(\d+)\/$/) ?? [])[1])
      .filter(Boolean)
      .map(Number);
    const max = Math.max(0, ...ids);
    return Array.from({ length: max + 10 }, (_, i) => ({ url: `${BASE}/games/${i + 1}/` }));
  },
  art(html) {
    const g = html.match(/gamesApiData:\{g:\{ggl:\{[^}]*?\bn:"((?:[^"\\]|\\.)*)"/);
    if (!g) return null;
    const name = unesc(g[1]);
    const gml = (html.match(/gamesApiData:\{g:\{ggl:\{[\s\S]*?\},gml:\[([\s\S]*?)\]/) ?? [])[1] ?? "";
    const media = {};
    for (const m of gml.matchAll(/\{[^{}]*?\bpi:(\d+),v:"((?:[^"\\]|\\.)*)"[^{}]*\}/g)) media[m[1]] ??= unesc(m[2]);
    const path = media[24] ?? media[8];
    const image = path && path.startsWith("/uploads/") ? BASE + path : null;
    return { name, image };
  },
};
