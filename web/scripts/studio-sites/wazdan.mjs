import { fetchText, locsOf, meta, decode } from "../lib/studio-fetch.mjs";

/**
 * Wazdan (wazdan.com). WordPress; the sitemap index lists games-sitemap.xml
 * with each game page at /games/<slug>/. The game's og:image is its own
 * 600x450 title tile ("<Game>_icon_600x450_webp90.webp"), the same file the
 * page shows as its `img.poster`; the other pictures on the page are
 * award badges, feature "highlights" and loose symbols, not key art.
 * Files sit on wazdan.com/wp-content/uploads.
 *
 * The sitemap is the whole list: the /games page embeds the same 265 games
 * (name, page, tile) as JSON, and the WordPress REST API asks for a login.
 * The seasonal network-promotion builds in the catalogue ("... Easter
 * Jackpots", "Halloween Jackpots", "Love the Jackpot", "Score the
 * Jackpot", "Xmas Edition", and most "Burning Board" builds) have no page
 * and no tile of their own anywhere on the site, only a campaign banner on
 * the promotion's news post, so they stay unmatched; the base game's tile
 * is never taken for one, as an edition is a different title.
 */
export default {
  studio: "Wazdan",
  host: "wazdan.com",
  async list() {
    const idx = await fetchText("https://wazdan.com/sitemap_index.xml");
    const subs = locsOf(idx).filter((u) => u.endsWith(".xml"));
    const urls = [];
    for (const s of subs) {
      if (!/games-sitemap/.test(s)) continue;
      urls.push(...locsOf(await fetchText(s)).filter((u) => /^https:\/\/wazdan\.com\/games\/[a-z0-9-]+\/?$/.test(u)));
    }
    return [...new Set(urls)].map((url) => ({ url }));
  },
  art(html) {
    const name = decode((html.match(/<title>(.*?)<\/title>/s) ?? [])[1]).replace(/\s*-\s*Wazdan$/i, "");
    // The first `img.poster` is the game's 600x450 tile on every page
    // (named "_icon_600x450", "_600x450" or "_banner_600x450"). og:image is
    // the same tile on most pages, but on many it falls back to a site-wide
    // photo of the Wazdan team at a trade show ("wazdan-online-gaining.jpg"),
    // so it is only a fallback, and only when it is a 600x450 game file.
    const poster = (html.match(/<img class="poster lazy" src="([^"]+)"/) ?? [])[1];
    const og = meta(html, "og:image");
    const image =
      (poster && /\/wp-content\/uploads\//.test(poster) && !/_symbol/i.test(poster) ? poster : null) ??
      (og && /_600x450/.test(og) && !/wazdan-online-gaining/.test(og) ? og : null);
    return { name, image };
  },
};
