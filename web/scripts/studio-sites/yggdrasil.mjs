import { fetchText, decode } from "../lib/studio-fetch.mjs";

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
 */
const SKIP = new Set(["peter-and-sons", "bitpunch"]);
const PROVIDERS = {
  "avatar-ux": "AvatarUX",
  "degen-studios": "Degen Studios",
};

export default {
  studio: "Yggdrasil",
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
        return { url: g.link, name: decode(g.title), image: g.image || null, provider: PROVIDERS[term] ?? "Yggdrasil" };
      });
  },
  art(_html, item) {
    const image = item.image && /^https:\/\/yggdrasilgaming\.com\/w\/files\//.test(item.image) ? item.image : null;
    return { name: item.name, image };
  },
};
