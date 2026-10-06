import { fetchText, decode } from "../lib/studio-fetch.mjs";

/**
 * Mirror Image Gaming (mirrorimagegaming.io). A one-page Squarespace site
 * with no page per game: its "Games" section is a row of cards, each the
 * game's own 4:5 poster (title over the game's art; "3.png",
 * "Untitled design (2).png" — Squarespace keeps upload names) with the
 * game's name as the image's alt text and again as the card heading, then a
 * demo or "Play on Stake" link. The images sit on images.squarespace-cdn.com
 * under the site's own content id (66f352bfc7ffcf0098fbf0e0), which is
 * where the site's pages load them from; "?format=1000w" asks Squarespace
 * for its 1000px rendition of the same file. Only images inside the Games
 * section (between its heading and the Partners heading) are read, so the
 * partner and studio logos further down are never taken. The name is the
 * card's alt text; the item URL is the home page, where the card is.
 *
 * The catalogue writes "K-Pop Drop!" with an exclamation mark; the site
 * writes "K-Pop Drop". The title key ignores punctuation, so they match.
 */
const HOME = "https://www.mirrorimagegaming.io/";
const CDN = /^https:\/\/images\.squarespace-cdn\.com\/content\/v1\/66f352bfc7ffcf0098fbf0e0\//;

export default {
  studio: "Mirror Image Gaming",
  host: "mirrorimagegaming.io",
  async list() {
    const html = (await fetchText(HOME)) ?? "";
    const start = html.search(/<h[1-4][^>]*>\s*(?:<[^>]+>\s*)*Games\s*</);
    const end = html.search(/<h[1-4][^>]*>\s*(?:<[^>]+>\s*)*Partners\s*</);
    if (start < 0 || end < start) return [];
    const out = new Map();
    for (const m of html.slice(start, end).matchAll(/<img\b[^>]*>/g)) {
      const src = (m[0].match(/\b(?:data-src|src)="([^"]+)"/) ?? [])[1];
      const name = decode((m[0].match(/\balt="([^"]*)"/) ?? [])[1]);
      if (!src || !name || !CDN.test(src) || out.has(name)) continue;
      out.set(name, { url: HOME, name, image: `${src.split("?")[0]}?format=1000w` });
    }
    return [...out.values()];
  },
  art(_html, item) {
    return { name: item.name, image: item.image };
  },
};
