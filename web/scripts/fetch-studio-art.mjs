#!/usr/bin/env node
/**
 * Slot artwork from each studio's own website, for the catalogue titles whose
 * only image sits on an operator's CDN (cdn-cms.razed.com), which is not ours
 * to republish.
 *
 * One small reader per studio in scripts/studio-sites/<key>.mjs lists that
 * studio's game pages and says where the game's key art sits on each page —
 * the og:image where it is the game's own, otherwise the field the page names
 * (Red Tiger's "images", "splashPoster", "icon"). Titles are matched to the
 * catalogue by exact title key within the studio (scripts/lib/match-title.mjs)
 * — the same rule the RTP readers use — so a near-namesake never takes
 * another game's art.
 *
 * Each image is saved as a 640px-wide WebP (square tiles framed, see
 * scripts/lib/frame-art.mjs) in public/assets/games/<slug>.webp
 * and recorded in data/game-art-sources.json under `art`, with the image URL,
 * the studio page it came from and the date; the title leaves
 * `heldPendingRights`. Only titles still without publishable art are
 * touched.
 *
 * Usage, from web/:
 *   node scripts/fetch-studio-art.mjs --studio redtiger --dry-run --limit 10
 *   node scripts/fetch-studio-art.mjs --studio redtiger
 *   node scripts/fetch-studio-art.mjs --studio all
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { titleMatcher } from "./lib/match-title.mjs";
import { fetchText, fetchBinary } from "./lib/studio-fetch.mjs";
import { frameArt } from "./lib/frame-art.mjs";

const argv = process.argv.slice(2);
const arg = (k, d = null) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const DRY = argv.includes("--dry-run");
const STUDIO = arg("--studio", "all");
const LIMIT = Number(arg("--limit", 0)) || 0;
// --preview <dir>: write the chosen images there as <slug>.jpg and touch no
// site data, so a reader's picks can be checked by eye before a real run.
const PREVIEW = arg("--preview", null);
const TODAY = new Date().toISOString().slice(0, 10);

const OUT = path.join("public", "assets", "games");
const SOURCES = path.join("data", "game-art-sources.json");
const SITES = path.join("scripts", "studio-sites");

const catalogue = JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games;
const matcher = titleMatcher(catalogue);
const sources = JSON.parse(fs.readFileSync(SOURCES, "utf8"));
sources.art ??= {};
sources.heldPendingRights ??= {};

/** Catalogue titles that still need art: image on a host we may not republish, and no file of ours. */
const OURS = new Set(["api.slotessentials.com"]);
const needsArt = (g) => {
  if (!g.slug || sources.art[g.slug]) return false;
  try {
    return !OURS.has(new URL(g.image).hostname);
  } catch {
    return true;
  }
};

const keys = STUDIO === "all" ? fs.readdirSync(SITES).filter((f) => f.endsWith(".mjs")).map((f) => f.slice(0, -4)) : STUDIO.split(",");
let total = 0;
for (const key of keys) {
  const site = (await import(new URL(`./studio-sites/${key}.mjs`, import.meta.url))).default;
  const wanted = catalogue.filter((g) => g.provider === site.studio && needsArt(g));
  console.log(`\n== ${site.studio}: ${wanted.length} titles need art`);
  if (!wanted.length) continue;
  let items = await site.list();
  console.log(`  ${items.length} game pages on ${site.host}`);
  if (LIMIT) items = items.slice(0, LIMIT);
  const stat = { matched: 0, saved: 0, noArt: 0, unmatched: [], already: 0 };
  for (const item of items) {
    const html = await fetchText(item.url);
    if (!html) continue;
    const found = site.art(html, item);
    if (!found?.name) continue;
    const g = matcher.match(found.name, item.provider ?? site.studio);
    if (!g) {
      stat.unmatched.push(found.name);
      continue;
    }
    stat.matched++;
    if (!needsArt(g)) {
      stat.already++;
      continue;
    }
    if (!found.image) {
      stat.noArt++;
      continue;
    }
    const buf = await fetchBinary(found.image);
    if (!buf || buf.length < 2000) {
      stat.noArt++;
      continue;
    }
    let out;
    try {
      out = await frameArt(buf);
    } catch {
      stat.noArt++;
      continue;
    }
    const file = `${g.slug}.webp`;
    if (PREVIEW) {
      fs.mkdirSync(PREVIEW, { recursive: true });
      await sharp(out).jpeg({ quality: 70 }).toFile(path.join(PREVIEW, `${g.slug}.jpg`));
      stat.saved++;
      continue;
    }
    if (!DRY) fs.writeFileSync(path.join(OUT, file), out);
    sources.art[g.slug] = {
      file,
      bytes: out.length,
      type: "image/webp",
      sourceUrl: found.image,
      sourceHost: new URL(found.image).hostname,
      page: item.url,
      provider: g.provider,
      fetched: TODAY,
      via: `${site.studio}'s own game page`,
    };
    delete sources.heldPendingRights[g.slug];
    stat.saved++;
  }
  total += stat.saved;
  console.log(`  matched ${stat.matched} · saved ${stat.saved} · already had art ${stat.already} · no art on page ${stat.noArt} · unmatched ${stat.unmatched.length}`);
  if (stat.unmatched.length) console.log(`  unmatched: ${stat.unmatched.slice(0, 12).join(" · ")}${stat.unmatched.length > 12 ? " …" : ""}`);
  if (!DRY && !PREVIEW) fs.writeFileSync(SOURCES, JSON.stringify(sources, null, 2) + "\n");
}
console.log(`\n${total} titles given studio art${DRY ? " (dry run: nothing written)" : ""}`);
