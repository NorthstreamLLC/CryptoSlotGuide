#!/usr/bin/env node
/**
 * Downloads the game art the catalogue points at into public/assets/games,
 * and records where each file came from in data/game-art-sources.json.
 *
 * Self-hosting rather than hotlinking, for three reasons measured rather than
 * assumed:
 *
 *  1. The links rot. 110 of the 157 cdn-cms.razed.com URLs in the export were
 *     already 404 on 2026-09-25 — the art was captured at some point and that
 *     CDN has moved on since. Pointing production <img> tags at it would mean
 *     two thirds broken on day one and the rest breaking unpredictably.
 *  2. It is someone else's CDN. Hotlinking an operator's assets sends our
 *     readers' requests, and their referrer, to that operator on every page
 *     view, and leaves our pages at the mercy of their infrastructure.
 *  3. It is billed to them. Serving our traffic from their bandwidth is not
 *     ours to spend.
 *
 * RIGHTS. Game art is the studio's copyright. A copy sitting on an operator's
 * CDN is that operator's licensed use, not a public asset, so a working URL is
 * not permission. The clean source is the studio's own press or affiliate kit,
 * which most studios publish for exactly this purpose. This script records the
 * exact origin of every file it writes so that anything sourced from an
 * operator CDN can be found again and replaced.
 *
 * Usage:
 *   node scripts/fetch-game-art.mjs --dry-run
 *   node scripts/fetch-game-art.mjs                 # fetch what is missing
 *   node scripts/fetch-game-art.mjs --only slotessentials.com
 *   node scripts/fetch-game-art.mjs --force         # re-fetch everything
 *   node scripts/fetch-game-art.mjs --pages --only slotessentials.com
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(web, "data");
const OUT = path.join(web, "public", "assets", "games");
const SOURCES = path.join(DATA, "game-art-sources.json");

const argv = process.argv.slice(2);
const DRY = argv.includes("--dry-run");
const FORCE = argv.includes("--force");
const ONLY = argv.includes("--only") ? argv[argv.indexOf("--only") + 1] : null;
/**
 * --pages restricts the run to titles that actually get a page of their own:
 * a studio demo plus more than one published RTP, the same bar lib/slot-page.ts
 * applies. Without it, --only slotessentials.com matches thousands of games and
 * pulls a quarter of a gigabyte of art for pages that do not exist.
 */
const PAGES_ONLY = argv.includes("--pages");
/**
 * Mirrors lib/slot-page.ts: the automatic bar, plus the editorial picks, which
 * get a page regardless and so need art like any other. TOP_SLOTS is read out
 * of the TS module rather than copied, so the two cannot drift.
 */
const TOP_SLOTS = (() => {
  const src = fs.readFileSync(path.join(web, "lib", "top-slots.ts"), "utf8");
  const block = src.match(/export const TOP_SLOTS: string\[\] = \[([\s\S]*?)\];/);
  return new Set(block ? [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : []);
})();
/**
 * Mirrors lib/slot-page.ts. A studio source page counts the same as a studio
 * demo: both prove the title is the studio's and give the reader somewhere
 * real, and the overrides file is where the studio-read RTPs live.
 */
const OVERRIDES = (() => {
  const f = path.join(DATA, "slot-rtp-overrides.json");
  if (!fs.existsSync(f)) return {};
  return JSON.parse(fs.readFileSync(f, "utf8")).overrides ?? {};
})();
const versionCount = (g) => (OVERRIDES[g.slug]?.versions ?? g.rtpVariants ?? []).length;
const qualifies = (g) =>
  g.kind === "slot" &&
  g.slug &&
  (((g.demoUrl || OVERRIDES[g.slug]?.sourceUrl) && versionCount(g) > 1) || TOP_SLOTS.has(g.slug));

const catalogue = JSON.parse(fs.readFileSync(path.join(DATA, "gameCatalogue.json"), "utf8"));

const EXT = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "image/avif": "avif", "image/gif": "gif" };

/** Filename from the game's own slug, so the art is findable without a lookup table. */
const fileFor = (g) => (g.slug ?? g.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")).slice(0, 80);

const existing = fs.existsSync(SOURCES) ? JSON.parse(fs.readFileSync(SOURCES, "utf8")) : { note: "", fetched: null, art: {} };

/**
 * Hosts whose art is ours to republish. Everything else is the studio's
 * copyright under some operator's licence, and a working URL is not
 * permission.
 *
 * This is a hard filter, not a convention. The rule used to live only in the
 * file header and in remembering to pass --only slotessentials.com; the first
 * run that forgot the flag pulled 16 files off an operator CDN straight into
 * the repo. --allow-host exists for the day a studio's own press kit is the
 * source, and names the host explicitly.
 */
const OURS = new Set(["api.slotessentials.com", ...(argv.includes("--allow-host") ? [argv[argv.indexOf("--allow-host") + 1]] : [])]);
const publishable = (g) => {
  try {
    return OURS.has(new URL(g.image).hostname);
  } catch {
    return false;
  }
};

const skippedForRights = catalogue.games.filter(
  (g) => g.image && !publishable(g) && (!PAGES_ONLY || qualifies(g))
);
const targets = catalogue.games.filter(
  (g) => g.image && publishable(g) && (!ONLY || g.image.includes(ONLY)) && (!PAGES_ONLY || qualifies(g))
);
if (skippedForRights.length) {
  const hosts = [...new Set(skippedForRights.map((g) => new URL(g.image).hostname))];
  console.log(`  ${skippedForRights.length} held for rights (${hosts.join(", ")}) — not ours to republish`);
}
if (!fs.existsSync(OUT) && !DRY) fs.mkdirSync(OUT, { recursive: true });

const art = { ...existing.art };
let written = 0;
let skipped = 0;
let dead = 0;

for (let i = 0; i < targets.length; i += 6) {
  await Promise.all(
    targets.slice(i, i + 6).map(async (g) => {
      const base = fileFor(g);
      if (!FORCE && art[base] && fs.existsSync(path.join(OUT, art[base].file))) { skipped++; return; }
      try {
        const r = await fetch(g.image, { signal: AbortSignal.timeout(20000), headers: { "user-agent": "Mozilla/5.0 (compatible; CryptoSlotGuide/1.0)" } });
        if (!r.ok) { dead++; return; }
        const type = (r.headers.get("content-type") ?? "").split(";")[0].trim();
        const ext = EXT[type];
        // Only real images, and only types we can serve. An HTML error page with
        // a 200 is the classic way a fetcher fills a directory with junk.
        if (!ext) { dead++; return; }
        const buf = Buffer.from(await r.arrayBuffer());
        if (buf.length < 1024) { dead++; return; }
        const file = `${base}.${ext}`;
        if (!DRY) fs.writeFileSync(path.join(OUT, file), buf);
        art[base] = { file, bytes: buf.length, type, sourceUrl: g.image, sourceHost: new URL(g.image).hostname, provider: g.provider, fetched: new Date().toISOString().slice(0, 10) };
        written++;
      } catch { dead++; }
    })
  );
  process.stderr.write(`  ${Math.min(i + 6, targets.length)}/${targets.length}\r`);
}

const byHost = new Map();
for (const a of Object.values(art)) byHost.set(a.sourceHost, (byHost.get(a.sourceHost) ?? 0) + 1);
const bytes = Object.values(art).reduce((n, a) => n + a.bytes, 0);

console.log(`\n${written} fetched · ${skipped} already on disk · ${dead} unavailable`);
console.log(`${Object.keys(art).length} files · ${(bytes / 1048576).toFixed(1)} MB in public/assets/games`);
for (const [h, n] of [...byHost.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${h}`);
console.log(`\n${catalogue.games.length - Object.keys(art).length} of ${catalogue.games.length} games still have no art.`);

if (DRY) {
  console.log("\n--dry-run: nothing written");
  process.exit(0);
}

fs.writeFileSync(
  SOURCES,
  JSON.stringify(
    {
      note: "Where each file in public/assets/games came from. Everything under `art` is served from a host we may republish from; the fetcher refuses anything else. `heldPendingRights` is what it refused and why — titles whose only art sits on an operator's CDN, to be replaced from the studio's own press or affiliate kit.",
      fetched: new Date().toISOString().slice(0, 10),
      art,
      // Written every run, so the list of what we could not take stays
      // accurate instead of going stale the first time someone reruns this.
      heldPendingRights: Object.fromEntries(
        skippedForRights
          .map((g) => [
            fileFor(g),
            { sourceUrl: g.image, sourceHost: new URL(g.image).hostname, provider: g.provider, name: g.name },
          ])
          .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
      ),
    },
    null,
    2
  ) + "\n"
);
console.log(`wrote data/game-art-sources.json`);
