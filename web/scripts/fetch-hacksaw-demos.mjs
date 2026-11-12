/**
 * Refreshes data/slot-demos.json from Hacksaw Gaming's own game listing: each
 * game card there carries the game id its "Try it" button launches the free
 * demo with. Only titles we hold a catalogue entry for are kept, under our
 * slug. Run: node scripts/fetch-hacksaw-demos.mjs
 *
 * The build number is not stored: /demo/hacksaw/<id> (app/demo) reads the
 * current one from Hacksaw's version.json when someone presses play.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(web, "data/slot-demos.json");
const cat = JSON.parse(fs.readFileSync(path.join(web, "data/gameCatalogue.json"), "utf8"));
const games = Array.isArray(cat) ? cat : cat.games ?? Object.values(cat).find(Array.isArray);
const ours = new Set(games.filter((g) => /hacksaw/i.test(g.provider ?? "")).map((g) => g.slug));

const found = {};
for (const url of ["https://www.hacksawgaming.com/games", "https://www.hacksawgaming.com/games/slots"]) {
  const html = await (await fetch(url)).text();
  for (const chunk of html.split('<li class="GridListItem"').slice(1)) {
    const li = chunk.split("</li>")[0];
    const id = li.match(/data-gameid="(\d+)"/)?.[1];
    const slug = li.match(/href="\/games\/([a-z0-9-]+)"/)?.[1];
    if (id && slug && ours.has(slug)) found[slug] ??= Number(id);
  }
}

const prev = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : {};
const next = { ...prev, hacksaw: Object.fromEntries(Object.entries({ ...(prev.hacksaw ?? {}), ...found }).sort(([a], [b]) => a.localeCompare(b))) };
fs.writeFileSync(out, JSON.stringify(next, null, 2) + "\n");
console.log(`slot-demos: ${Object.keys(found).length} Hacksaw demos found, ${Object.keys(next.hacksaw).length} on file`);
