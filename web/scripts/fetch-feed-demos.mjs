/**
 * Demo links our game catalogue already carries (gameCatalogue.json demoUrl),
 * for titles the studio scripts don't cover. Two kinds:
 *  - studios we already handle (Pragmatic, Thunderkick, Kalamba): the id is
 *    read out of the link and added to that studio's list;
 *  - studios whose links work as given (Apparat, Penguin King, Wicked Games):
 *    the link is kept under "feed", and /demo/feed/<slug> sends players to it.
 * Each host was checked loading inside another site's page (14 Nov 2026).
 * Left out: Massive Studios ("Invalid value"), TrueLab (expired token), Spade
 * Gaming (opens its website), Booming (refuses embedding), Spinomenal (refuses
 * our machines). Run: node scripts/fetch-feed-demos.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(web, "data/slot-demos.json");
const games = JSON.parse(fs.readFileSync(path.join(web, "data/gameCatalogue.json"), "utf8")).games;
const demos = JSON.parse(fs.readFileSync(out, "utf8"));
const covered = new Set(Object.entries(demos).filter(([k]) => k !== "feed").flatMap(([, ids]) => Object.keys(ids)));

const BY_ID = {
  "demogamesfree.pragmaticplay.net": ["pragmatic", (u) => u.searchParams.get("gameSymbol")],
  "forfun.thunderkick.com": ["thunderkick", (u) => u.searchParams.get("gameId")],
  "kalamba.integration.demo.kalambagames.com": ["kalamba", (u) => u.searchParams.get("gameCode")],
  "kalamba-for-kl.integration.demo.kalambagames.com": ["kalamba", (u) => u.searchParams.get("gameCode")],
};
export const FEED_HOSTS = ["router.apparatgaming.net", "lobby-api.penguinking.com", "wrapper.demo.wicked.games"];

const added = {};
demos.feed = demos.feed ?? {};
for (const g of games) {
  if (!g.slug || !g.demoUrl || g.kind !== "slot" || covered.has(g.slug)) continue;
  let u;
  try {
    u = new URL(g.demoUrl);
  } catch {
    continue;
  }
  const byId = BY_ID[u.hostname];
  if (byId) {
    const id = byId[1](u);
    if (id && /^[A-Za-z0-9_-]{2,80}$/.test(id)) {
      (demos[byId[0]] ??= {})[g.slug] ??= id;
      added[byId[0]] = (added[byId[0]] ?? 0) + 1;
    }
  } else if (FEED_HOSTS.includes(u.hostname) && u.protocol === "https:") {
    demos.feed[g.slug] = g.demoUrl;
    added[u.hostname] = (added[u.hostname] ?? 0) + 1;
  }
}
for (const k of Object.keys(demos)) demos[k] = Object.fromEntries(Object.entries(demos[k]).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(out, JSON.stringify(demos, null, 2) + "\n");
console.log("feed demos added:", added);
