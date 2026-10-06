import fs from "node:fs";
import path from "node:path";
import { fetchText, decode } from "../lib/studio-fetch.mjs";
import { titleKey } from "../lib/match-title.mjs";

/**
 * Novomatic. novomatic.com has no game pages; Novomatic's online slots are
 * published by its own online-gaming subsidiary Greentube (greentube.com,
 * WordPress), whose /all-games/ page embeds every game as a JSON record:
 * title, permalink (/game/<slug>/) and four images on greentube.com's own
 * uploads. Checked by eye: `button` is the square 1080x1080 tile with the
 * game's logo (the key art); `atmosphere` is the bare background,
 * `character` a cut-out mascot and `screenshot` an in-game reel screen. The
 * game pages themselves show only the latter three, so the tile is taken
 * from the record and the game's permalink is kept as its page.
 *
 * Only games whose name the catalogue holds for Novomatic are listed, so
 * the runner does not fetch ~700 pages to match ~100 (Greentube also lists
 * its Eurocoin and own-brand games).
 */
const ALL = "https://www.greentube.com/all-games/";
const STUDIO = "Novomatic";

function records(html) {
  const out = new Map();
  const re = /\{"ID":\d+,"id":\d+,"title":/g;
  let m;
  while ((m = re.exec(html))) {
    let depth = 0;
    let i = m.index;
    for (; i < html.length; i++) {
      const ch = html[i];
      if (ch === '"') {
        for (i++; i < html.length && html[i] !== '"'; i++) if (html[i] === "\\") i++;
        continue;
      }
      if (ch === "{") depth++;
      else if (ch === "}" && --depth === 0) break;
    }
    try {
      const r = JSON.parse(html.slice(m.index, i + 1));
      if (r.permalink && !out.has(r.id)) out.set(r.id, r);
    } catch {}
  }
  return [...out.values()];
}

function catalogueKeys() {
  try {
    const games = JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games;
    return new Set(games.filter((g) => g.provider === STUDIO).map((g) => titleKey(g.name)));
  } catch {
    return null;
  }
}

/** Greentube's name as the catalogue spells it, where only punctuation differs ("Book of Ra™ – Temple of Gold™"). */
export const nameOf = (r) => decode(r.title);

export default {
  studio: STUDIO,
  host: "greentube.com",
  async list() {
    const html = await fetchText(ALL);
    if (!html) return [];
    const keys = catalogueKeys();
    // A name can appear twice (market builds); keep one record per name,
    // preferring the one Greentube shows in its lists and that has a tile.
    const rank = (r) => (r.button ? 0 : 2) + (r.hideOnLists ? 1 : 0);
    const byName = new Map();
    for (const r of records(html)) {
      const k = titleKey(nameOf(r));
      if (keys && !keys.has(k)) continue;
      if (!byName.has(k) || rank(r) < rank(byName.get(k))) byName.set(k, r);
    }
    return [...byName.values()].map((r) => ({ url: r.permalink, name: nameOf(r), tile: r.button || null }));
  },
  art(_html, item) {
    return { name: item.name, image: item.tile };
  },
  records,
};
