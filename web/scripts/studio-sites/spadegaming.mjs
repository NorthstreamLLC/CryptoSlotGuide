import { fetchText } from "../lib/studio-fetch.mjs";

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
 */
const BASE = "https://www.spadegaming.com";

export default {
  studio: "Spade Gaming",
  host: "spadegaming.com",
  async list() {
    const raw = await fetchText(`${BASE}/api/game-list.json`);
    if (!raw) return [];
    const games = JSON.parse(raw.replace(/^﻿/, ""));
    return games
      .filter((g) => g.name && g.img)
      .map((g) => ({
        url: g.link ? `${BASE}/game-detail/${g.link}` : `${BASE}/games`,
        name: g.name,
        image: `${BASE}/api${g.img.startsWith("/") ? "" : "/"}${g.img}`,
      }));
  },
  art(_html, item) {
    return { name: item.name, image: item.image };
  },
};
