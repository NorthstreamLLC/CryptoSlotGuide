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

// --scan: Hacksaw's listing shows only part of its library. Its game server
// names every game in the <title> of the game's own page, so walking the game
// ids finds the rest by name. A game usually has several builds under
// consecutive ids; Hacksaw's site uses the lowest for 123 of the 134 games it
// lists (checked 14 Nov 2026), so the lowest is kept. Only fills titles the
// listing didn't give.
if (process.argv.includes("--scan")) {
  const key = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
  const ourNames = new Map(games.filter((g) => /hacksaw/i.test(g.provider ?? "")).map((g) => [key(g.name), g.slug]));
  const lowest = new Map();
  const ids = Array.from({ length: 3200 - 1000 + 1 }, (_, i) => 1000 + i);
  for (let i = 0; i < ids.length; i += 24) {
    await Promise.all(
      ids.slice(i, i + 24).map(async (id) => {
        try {
          const r = await fetch(`https://static-live.hacksawgaming.com/${id}/version.json`);
          if (!r.ok) return;
          const v = (await r.json()).version;
          if (!v || !/^[\d.]+$/.test(v)) return;
          const title = (await (await fetch(`https://static-live.hacksawgaming.com/${id}/${v}/index.html`)).text()).match(/<title>([^<]*)/)?.[1]?.trim();
          const slug = title && ourNames.get(key(title));
          if (slug && !(slug in found) && (!lowest.has(slug) || id < lowest.get(slug))) lowest.set(slug, id);
        } catch {
          /* skip an id that fails */
        }
      })
    );
  }
  for (const [slug, id] of lowest) found[slug] ??= id;
  console.log(`slot-demos: --scan found ${lowest.size} more Hacksaw titles by name`);
}

const prev = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : {};
const next = { ...prev, hacksaw: Object.fromEntries(Object.entries({ ...(prev.hacksaw ?? {}), ...found }).sort(([a], [b]) => a.localeCompare(b))) };
fs.writeFileSync(out, JSON.stringify(next, null, 2) + "\n");
console.log(`slot-demos: ${Object.keys(found).length} Hacksaw demos found, ${Object.keys(next.hacksaw).length} on file`);
