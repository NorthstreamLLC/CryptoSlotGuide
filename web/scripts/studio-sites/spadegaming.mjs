import fs from "node:fs";
import path from "node:path";
import { fetchText, decode } from "../lib/studio-fetch.mjs";
import { titleMatcher } from "../lib/match-title.mjs";

/**
 * Spade Gaming (spadegaming.com). The site is a React single-page app: every
 * URL serves the same empty shell, and the games grid is drawn from
 * /api/game-list.json, which the site's own bundle loads. Each record has
 * the game's name and `img`, its 300x300 key-art tile (title logo over the
 * game's art, "<Name>_300x300_EN_<hash>.png"), served from
 * www.spadegaming.com/api/uploads/. The per-game /api/detail/<code>.json
 * holds only a bare `logo`, a blurred `bg` and a `character` cut-out, none
 * of which is key art, so the tile is taken.
 *
 * The item URL is the game's own page, /game-detail/<link>, or /games when
 * the record has no page. The site lists about 70 games; the older
 * catalogue titles are not on it.
 *
 * Two of the grid's records are named short of the game's full title
 * ("Joker Treasure Exclusive", "Legacy of Kong"); the site's release posts
 * name them in full. The news feed the site's /news page reads
 * (/api/news-list.json) holds one post per release (`type: "game"`, titled
 * "New Game Released: <Game>" or "New Release: <Game>"), and the post's own
 * record (/api/news/<slug>.json, shown at /news-detail/<slug>) names its
 * `img`, the 480x250 card the news grid shows: the game's title logo over
 * its art. Its `banner` is the larger header but on some posts sets a reel
 * screenshot beside the logo, so it is only the fallback. Those posts are
 * read after the grid, so a game the grid already matches keeps its tile.
 *
 * The grid writes "Double Fortune" (S-DF01, Spade's only game of that name,
 * whose own tile reads "Double Fortunes") where the catalogue has "Double
 * Fortunes": the reader offers the site's
 * name first and the catalogue's spelling only when the catalogue does not
 * hold the site's; either must still match a Spade Gaming title exactly.
 */
const BASE = "https://www.spadegaming.com";
const STUDIO = "Spade Gaming";
const SPELLED = { "Double Fortune": "Double Fortunes" };
let matcher = null;
const known = (name) => {
  matcher ??= titleMatcher(JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games);
  return Boolean(matcher.match(name, STUDIO));
};
const json = (raw) => {
  try {
    return JSON.parse(String(raw ?? "").replace(/^﻿/, ""));
  } catch {
    return null;
  }
};
const upload = (p) => (p ? `${BASE}/api${p.startsWith("/") ? "" : "/"}${p}` : null);

export default {
  studio: STUDIO,
  host: "spadegaming.com",
  async list() {
    const games = json(await fetchText(`${BASE}/api/game-list.json`)) ?? [];
    const out = games
      .filter((g) => g.name && g.img)
      .map((g) => ({
        url: g.link ? `${BASE}/game-detail/${g.link}` : `${BASE}/games`,
        name: g.name,
        image: upload(g.img),
      }));
    const news = json(await fetchText(`${BASE}/api/news-list.json`)) ?? [];
    for (const n of news) {
      if (n.type !== "game" || !n.slug) continue;
      const name = decode(String(n.title ?? "").replace(/^\s*New (?:Game )?Release(?:d)?:\s*/i, ""));
      if (name) out.push({ url: `${BASE}/api/news/${n.slug}.json`, page: `${BASE}/news-detail/${n.slug}`, name, news: true });
    }
    return out;
  },
  art(raw, item) {
    if (item.news) {
      const d = json(raw) ?? {};
      return { name: item.name, image: upload(d.img) ?? upload(d.banner) };
    }
    const name = known(item.name) ? item.name : SPELLED[item.name] ?? item.name;
    return { name, image: item.image };
  },
};
