import fs from "node:fs";
import path from "node:path";
import { sitemapUrls, meta, decode } from "../lib/studio-fetch.mjs";
import { titleKey } from "../lib/match-title.mjs";

/**
 * Betsoft (betsoft.com, WordPress). Each game page's og:image is the game's
 * own "<slug>-game-thumbnail.jpg" (800x510 title tile with the logo), on
 * betsoft.com's own uploads. The page also carries a logo PNG, a background
 * and feature screens (BuyBonus, HoldAndWin, Wild...), which are not key art.
 * The <h1> holds the name with a <sup>TM</sup> that is dropped.
 *
 * Names: the site writes "X – Hold & Win" where the catalogue mostly has
 * "X - Hold and Win", and sometimes drops or adds the "Hold and Win" tag on
 * the same game. So the name returned is the first spelling that the
 * catalogue holds for Betsoft, from: as written; "&" read as "and" (and the
 * reverse); with the " – Hold & Win" tag removed; with it added. No page on
 * the site carries both a tagged and an untagged version of one game, so the
 * tag never chooses between two games. A few further same-game spellings are
 * listed in ALIAS; "Plus" / "JP" builds are separate titles and not aliased.
 */
const ALIAS = {
  "Four Seasons": "4 Seasons",
  Lucky7: "Lucky Seven",
  "The SlotFather Part II": "Slotfather 2",
  "The Slotfather JP": "Slotfather JP",
  "Lost: Mystery Chests": "Lost Mystery Chest",
  "Sugar Pop 2: Double Dipped": "Sugar Pop 2",
  "Mystic Hive": "The Mystic Hive",
  "The Glam Life": "Glam Life",
  "American (US) Blackjack": "American Blackjack",
  "Captain's Quest Treasure Island": "Captain's Quest Treasure Quest",
  "The Slotfather: Book of Wins – HOLD & WIN": "The Slotfather Book of Wins",
};
const aliasByKey = new Map(Object.entries(ALIAS).map(([k, v]) => [titleKey(k), v]));

let known = null;
function catalogueKeys() {
  if (known) return known;
  known = new Set();
  try {
    const games = JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games;
    for (const g of games) if (g.provider === "Betsoft") known.add(titleKey(g.name));
  } catch {}
  return known;
}

function resolveName(name) {
  const alias = aliasByKey.get(titleKey(name));
  if (alias) return alias;
  const tag = /\s*[–—:-]?\s*hold\s*(?:&|and)\s*win\s*$/i;
  const base = name.replace(tag, "").trim();
  const forms = [
    name,
    name.replace(/&/g, "and"),
    name.replace(/\band\b/gi, "&"),
    base,
    `${base} - Hold and Win`,
  ];
  const keys = catalogueKeys();
  return forms.find((f) => keys.has(titleKey(f))) ?? name;
}

export default {
  studio: "Betsoft",
  host: "betsoft.com",
  async list() {
    const urls = await sitemapUrls("https://betsoft.com/sitemap_index.xml");
    return urls
      .filter((u) => /^https:\/\/betsoft\.com\/games\/[^/]+\/?$/.test(u))
      .map((url) => ({ url }));
  },
  art(html) {
    const raw = (html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) ?? [])[1] ?? "";
    let name = decode(raw.replace(/<sup\b[\s\S]*?<\/sup>/gi, "").replace(/<[^>]+>/g, " "));
    if (!name) name = meta(html, "og:image:alt") ?? "";
    const og = meta(html, "og:image");
    const image = og && /\/wp-content\/uploads\//.test(og) ? og : null;
    return { name: name ? resolveName(name) : "", image };
  },
};
