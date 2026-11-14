/**
 * Booming Games' free demos, from the studio's own demo lobby
 * (demo.asia.booming-games.com, linked from the game list Booming shares):
 * its marketing API lists the demo game ids and its metadata API names them.
 * Titles we hold are matched by name. /demo/booming/<id> opens
 * operator.asia.booming-games.com/promotion/play/<id>/desktop/demo-links/en,
 * which the lobby itself uses; checked loading inside our player (14 Nov 2026).
 * Run: node scripts/fetch-booming-demos.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(web, "data/slot-demos.json");
const games = JSON.parse(fs.readFileSync(path.join(web, "data/gameCatalogue.json"), "utf8")).games;
const key = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
const ours = new Map(games.filter((g) => /booming/i.test(g.provider ?? "")).map((g) => [key(g.name), g.slug]));

const RPC = "https://rpc.asia.booming-games.com";
const ids = (await (await fetch(`${RPC}/marketing/pages/demo-links`)).json()).data.game_ids;
const meta = await (await fetch(`${RPC}/games/metadata/get`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ game_ids: ids }) })).json();
const list = Array.isArray(meta) ? meta : meta.data;

const found = {};
for (const g of list) {
  const name = g.title_name ?? g.en?.title_name;
  const slug = name && ours.get(key(name));
  if (slug && /^[a-f0-9]{24}$/.test(g.game_id)) found[slug] ??= g.game_id;
}
const demos = JSON.parse(fs.readFileSync(out, "utf8"));
demos.booming = Object.fromEntries(Object.entries({ ...(demos.booming ?? {}), ...found }).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(out, JSON.stringify(demos, null, 2) + "\n");
console.log(`slot-demos: Booming lobby lists ${ids.length} demos, ${Object.keys(found).length} match our catalogue (${ours.size} titles)`);
