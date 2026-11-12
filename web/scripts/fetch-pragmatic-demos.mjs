/**
 * Adds Pragmatic Play's free demos to data/slot-demos.json. Each game page on
 * pragmaticplay.com (listed in its own sitemap) carries the game code its demo
 * opens with (gameSymbol, e.g. vs20olympgate for Gates of Olympus). Only titles
 * we hold a catalogue entry for are kept, under our slug, matched by name.
 * Run: node scripts/fetch-pragmatic-demos.mjs
 *
 * /demo/pragmatic/<code> (app/demo) sends the player to Pragmatic's own demo.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(web, "data/slot-demos.json");
const cat = JSON.parse(fs.readFileSync(path.join(web, "data/gameCatalogue.json"), "utf8"));
const games = Array.isArray(cat) ? cat : cat.games ?? Object.values(cat).find(Array.isArray);
const key = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
const ours = new Map(games.filter((g) => /^pragmatic/i.test(g.provider ?? "")).map((g) => [key(g.name), g.slug]));

const index = await (await fetch("https://www.pragmaticplay.com/sitemap_index.xml")).text();
const maps = [...new Set(index.match(/https:\/\/www\.pragmaticplay\.com\/games-sitemap\d*\.xml/g) ?? [])];
const pages = new Set();
for (const m of maps) for (const u of (await (await fetch(m)).text()).match(/<loc>[^<]+<\/loc>/g) ?? []) {
  const url = u.replace(/<\/?loc>/g, "");
  if (/\/en\/games\/[^/]+\/$/.test(url)) pages.add(url);
}

// Only fetch pages whose name matches a title of ours.
const todo = [...pages]
  .map((url) => ({ url, slug: ours.get(key(url.split("/").at(-2).replace(/-slot$/, ""))) }))
  .filter((x) => x.slug);

const found = {};
for (let i = 0; i < todo.length; i += 4) {
  await Promise.all(
    todo.slice(i, i + 4).map(async ({ url, slug }) => {
      try {
        const code = (await (await fetch(url)).text()).match(/gameSymbol=([a-z0-9]+)/i)?.[1];
        if (code) found[slug] ??= code;
      } catch {
        /* skip a page that fails; the next run picks it up */
      }
    })
  );
}

const prev = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : {};
const merged = Object.fromEntries(Object.entries({ ...(prev.pragmatic ?? {}), ...found }).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(out, JSON.stringify({ ...prev, pragmatic: merged }, null, 2) + "\n");
console.log(`slot-demos: ${pages.size} Pragmatic game pages, ${todo.length} match our catalogue, ${Object.keys(found).length} demo codes found, ${Object.keys(merged).length} on file`);
