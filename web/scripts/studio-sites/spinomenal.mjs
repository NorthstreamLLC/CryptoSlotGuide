import fs from "node:fs";
import path from "node:path";
import { fetchText, decode } from "../lib/studio-fetch.mjs";
import { titleMatcher } from "../lib/match-title.mjs";

/**
 * Spinomenal (spinomenal.com). WordPress. The game page (/portfolio/<slug>/)
 * shows only the in-game backdrop ("_InGameBg", no title on it); the game's
 * title tile is the 650x406 thumbnail ("650x406_<Game>_EN.jpg") that the
 * site's own games grid at /games/ shows for it, so the grid is read once
 * and each game page's tile taken from it. Files sit on
 * spinomenal.com/wp-content/uploads.
 *
 * Spinomenal writes its build suffixes "Hold & Hit 3×3" where the catalogue
 * has "Hold and Hit 3x3": the same name with a different ampersand and
 * multiplication sign. The reader offers the site's spelling first and, only
 * when the catalogue does not hold it, the "and"/"x" spelling; either must
 * still match a Spinomenal title exactly.
 */
const STUDIO = "Spinomenal";
let matcher = null;
const known = (name) => {
  matcher ??= titleMatcher(JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games);
  return Boolean(matcher.match(name, STUDIO));
};
const spellings = (name) => [name, name.replace(/×/g, "x"), name.replace(/×/g, "x").replace(/\s*&\s*/g, " and ")];

export default {
  studio: STUDIO,
  host: "spinomenal.com",
  async list() {
    const html = await fetchText("https://spinomenal.com/games/");
    const out = new Map();
    // <a href=".../portfolio/<slug>/" ...><img data-src="...650x406..."> … <div class="thumb-title …">Name</div>
    const re = /<a href="(https:\/\/spinomenal\.com\/portfolio\/[a-z0-9-]+\/?)"[^>]*>([\s\S]*?)<\/a>/g;
    for (const m of (html ?? "").matchAll(re)) {
      const img = (m[2].match(/<img[^>]+data-src="([^"]+)"/) ?? [])[1];
      const title = decode((m[2].match(/class="thumb-title[^"]*"[^>]*>([^<]*)</) ?? [])[1]);
      if (!out.has(m[1])) out.set(m[1], { url: m[1], tile: img ?? null, tileTitle: title });
    }
    return [...out.values()];
  },
  art(html, item) {
    const page = decode((html.match(/<title>(.*?)<\/title>/s) ?? [])[1]).replace(/\s*[–-]\s*Spinomenal$/i, "");
    const base = page || item.tileTitle;
    const name = spellings(base).find(known) ?? base;
    const image = item.tile && /^https:\/\/spinomenal\.com\/wp-content\/uploads\//.test(item.tile) ? item.tile : null;
    return { name, image };
  },
};
