import fs from "node:fs";
import path from "node:path";
import { fetchText, decode } from "../lib/studio-fetch.mjs";
import { titleMatcher } from "../lib/match-title.mjs";

/**
 * Yggdrasil (yggdrasilgaming.com). WordPress. The games grid at /games is
 * filled from the theme's own feed, admin-ajax.php?action=games_data (the
 * page POSTs it; WordPress answers the same action by GET), which lists
 * every game page with its title, its provider term and `image`: the
 * 720x300 title thumbnail the grid shows for that game. The game page itself
 * shows only a logo on transparency over a title-less backdrop
 * ("_Single-Game-Logo_", "_Background_"), so the grid thumbnail is the key art.
 * Files sit on yggdrasilgaming.com/w/files.
 *
 * The site publishes its YG Masters partners' games too. Partners with a
 * website of their own (Peter & Sons and its BitPunch titles — see
 * peterandsons.mjs) are left to their own reader and skipped here.
 * Degen Studios keeps its own catalogue name; everything else is matched as
 * Yggdrasil, the name the catalogue gives the partner titles it holds
 * (4ThePlayer, Spinon and the rest), so a partner title the catalogue does
 * not hold simply finds no match.
 *
 * The feed names four games differently from the catalogue, for the same
 * game: "The legend of the Golden Monkey" (its own blurb says "Legend of the
 * Golden Monkey"), "Multifly! MultiMax" (its page title is "Multifly!", the
 * catalogue's "MultiFly!"), and the first two Splitz games without the
 * "Splitz" the catalogue gives them: "Temple Stacks" (the page calls it
 * "Temple Stacks: Splitz™") and "Neon Rush" (the next Splitz game that page
 * announces, catalogued as "Neon Rush Splitz"). The catalogue's spelling is
 * offered only when the feed's own is not in the catalogue, and must still
 * match a Yggdrasil title exactly. GigaBlox, DuoMax, Splitz and similar
 * builds of a game the site lists under its own name are not aliased.
 */
const STUDIO = "Yggdrasil";
const ALIAS = {
  "The legend of the Golden Monkey": "Legend of the Golden Monkey",
  "Multifly! MultiMax": "MultiFly!",
  "Temple Stacks": "Temple Stacks: Splitz",
  "Neon Rush": "Neon Rush Splitz",
};
let matcher = null;
const known = (name) => {
  matcher ??= titleMatcher(JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games);
  return Boolean(matcher.match(name, STUDIO));
};
const spelling = (name) => (!known(name) && ALIAS[name] && known(ALIAS[name]) ? ALIAS[name] : name);
const SKIP = new Set(["peter-and-sons", "bitpunch"]);
const PROVIDERS = {
  "avatar-ux": "AvatarUX",
  "degen-studios": "Degen Studios",
};

export default {
  studio: STUDIO,
  host: "yggdrasilgaming.com",
  async list() {
    const t = await fetchText("https://yggdrasilgaming.com/w/wp-admin/admin-ajax.php?action=games_data");
    let games = [];
    try {
      games = JSON.parse(t ?? "[]");
    } catch {
      return [];
    }
    return games
      .filter((g) => g.link && g.title && !(g.provider ?? []).some((p) => SKIP.has(p)))
      .map((g) => {
        const term = (g.provider ?? []).find((p) => PROVIDERS[p]);
        const provider = PROVIDERS[term] ?? STUDIO;
        const name = decode(g.title);
        return { url: g.link, name: provider === STUDIO ? spelling(name) : name, image: g.image || null, provider };
      });
  },
  art(_html, item) {
    const image = item.image && /^https:\/\/yggdrasilgaming\.com\/w\/files\//.test(item.image) ? item.image : null;
    return { name: item.name, image };
  },
};
