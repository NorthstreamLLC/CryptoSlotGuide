import { fetchText } from "../lib/studio-fetch.mjs";

/**
 * TokaCity (tokacity.com). A React single-page app: every URL serves the
 * same empty shell, and the games grid at /games is written into the site's
 * own main bundle (static/js/main.<hash>.chunk.js) as one card per game,
 * {gameImage, gameName, gameType, url}, where gameImage names a file the
 * bundle imports from static/media. That card image is the game's title
 * tile: "thumbnail_ascend" (the ASCEND logo over the arena and two of its
 * fighters) for Ascend Arena 3D, "ascend_arena_2d" (the ASCEND ARENA / 2D
 * poster) for Ascend Arena 2D. The game pages (/games/<url>) show only a
 * title-less arena banner (`headerImage`) and gameplay stills, so the card
 * is taken. The bundle's file name changes with each build, so it is read
 * from the shell's <script> tag every time.
 *
 * The catalogue files TokaCity's games under two provider names, "Toka City"
 * and "Toka City Slots"; tokacity-slots.mjs re-exports this reader under the
 * second one.
 */
const BASE = "https://tokacity.com";

export default {
  studio: "Toka City",
  host: "tokacity.com",
  async list() {
    const shell = await fetchText(`${BASE}/`);
    const main = shell && (shell.match(/src="\/?(static\/js\/main\.[0-9a-f]+\.chunk\.js)"/) ?? [])[1];
    const js = main && (await fetchText(`${BASE}/${main}`));
    if (!js) return [];
    const media = (v) => (js.match(new RegExp(`[,;\\s]${v}=\\w+\\.p\\+"(static/media/[^"]+\\.(?:png|jpe?g|webp))"`)) ?? [])[1];
    return [...js.matchAll(/\{gameImage:([\w$]+),gameName:"([^"]+)"[^{}]*?url:"([a-z0-9-]+)"\}/g)].map(([, v, name, slug]) => {
      const file = media(v);
      return { url: `${BASE}/games/${slug}`, name, image: file ? `${BASE}/${file}` : null };
    });
  },
  art(_html, item) {
    return { name: item.name, image: item.image };
  },
};
