import { sitemapUrls, fetchText, meta, h1, decode } from "../lib/studio-fetch.mjs";

/**
 * Microgaming / Games Global. gamesglobal.com is a corporate site with no
 * game pages (its routes are About, Studios, Products, Media...). The game
 * pages sit on Microgaming's own site, microgaming.io (WordPress), listed in
 * its game sitemap: one page per title, studio shown as a tag.
 *
 * The og:image there is one generic "SEO_coverImage" for every page. The
 * game's key art is the demo poster, an <img alt="<Game> Game Asset"> whose
 * data-src is the group's ImageBuilder CDN (….bithe.net/ImageBuilder/v1/
 * images/en/Square/600x600/P1_<game>.JPG): the 600x600 square title tile,
 * the only size the page loads.
 */
/** Same game, catalogue spelling. ("Tiger's Treasures" / "Dragon's Rhythm" are left alone: not certainly the catalogue's title.) */
const ALIAS = {
  "Lucky Twins PowerClusters": "Lucky Twins PowerCluster",
  "Incredible Balloon Machine": "The Incredible Balloon Machine",
};

const sleep =(ms) => new Promise((r) => setTimeout(r, ms));

/**
 * microgaming.io answers 429 "Too many requests" after ~50 quick page loads,
 * faster than the runner's pacing. So list() reads the pages itself first,
 * through the same cache the runner uses, at one page every ~1.5 s, and on a
 * refusal waits a minute before one more try; the runner then reads them
 * from the cache. Pages still refused are simply skipped by the runner.
 */
async function warm(urls) {
  for (const url of urls) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const t = Date.now();
      const html = await fetchText(url);
      if (html) {
        if (Date.now() - t > 50) await sleep(1100);
        break;
      }
      await sleep(attempt ? 120000 : 60000);
    }
  }
}

export default {
  studio: "Microgaming / Games Global",
  host: "microgaming.io",
  async list() {
    const urls = (await sitemapUrls("https://microgaming.io/sitemaps.xml")).filter((u) =>
      /^https:\/\/microgaming\.io\/game\/[^/]+\/?$/.test(u)
    );
    await warm(urls);
    return urls.map((url) => ({ url }));
  },
  art(html) {
    const raw = h1(html) || meta(html, "og:title") || "";
    const name = ALIAS[raw] ?? raw;
    let image = null;
    for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
      if (!/alt="[^"]*Game Asset"/i.test(tag)) continue;
      const src = decode((tag.match(/data-src="([^"]+)"/) ?? tag.match(/\bsrc="(https?:[^"]+)"/) ?? [])[1] ?? "");
      if (/^https:\/\//.test(src)) {
        image = src;
        break;
      }
    }
    return { name, image };
  },
};
