/**
 * Studio artwork for reviewed slots (data/slots.json) that have none.
 *
 * fetch-studio-art.mjs works through the catalogue, and a reviewed slot is
 * not always in it under the same key, so a few of the site's best-known
 * titles (Mental, Fire in the Hole 2, Bonanza Megaways) were drawing a
 * monogram. This reuses the same per-studio readers (scripts/studio-sites)
 * and the same framing, but looks up each named slot's own page on its
 * studio's site, takes the image only when the page's own title matches the
 * slot, and records the source in data/game-art-sources.json exactly as the
 * catalogue run does.
 *
 * A slot whose studio page goes by another name takes it explicitly as
 * slug=url (Bonanza Megaways is "Bonanza" on bigtimegaming.com); run those
 * with --preview first and check the picture by eye.
 *
 * Usage, from web/:
 *   node scripts/fetch-reviewed-art.mjs --preview /tmp/art mental fire-in-the-hole-2
 *   node scripts/fetch-reviewed-art.mjs mental fire-in-the-hole-2
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fetchText, fetchBinary } from "./lib/studio-fetch.mjs";
import { frameArt } from "./lib/frame-art.mjs";
import { makeThumb } from "./make-art-thumbs.mjs";

const argv = process.argv.slice(2);
const PREVIEW = argv.includes("--preview") ? argv[argv.indexOf("--preview") + 1] : null;
const args = argv.filter((a, i) => !a.startsWith("--") && argv[i - 1] !== "--preview");
const slugs = args.map((a) => a.split("=")[0]);
const pageFor = Object.fromEntries(args.filter((a) => a.includes("=")).map((a) => [a.split("=")[0], a.slice(a.indexOf("=") + 1)]));
const TODAY = new Date().toISOString().slice(0, 10);
const OUT = path.join("public", "assets", "games");
const SOURCES = path.join("data", "game-art-sources.json");
const SITES = path.join("scripts", "studio-sites");

const slots = JSON.parse(fs.readFileSync(path.join("data", "slots.json"), "utf8"));
const sources = JSON.parse(fs.readFileSync(SOURCES, "utf8"));
sources.art ??= {};

/** Lowercase letters and digits only: "Gonzo’s Quest Megaways" → "gonzosquestmegaways". */
const key = (s) => s.normalize("NFKD").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");

const readers = {};
for (const f of fs.readdirSync(SITES).filter((f) => f.endsWith(".mjs"))) {
  const site = (await import(new URL(`./studio-sites/${f}`, import.meta.url))).default;
  (readers[site.studio] ??= []).push(site);
}

const lists = new Map();
for (const slug of slugs) {
  const s = slots.find((x) => x.slug === slug);
  if (!s) {
    console.log(`${slug}: not a reviewed slot`);
    continue;
  }
  const sites = readers[s.provider] ?? [];
  if (!sites.length) {
    console.log(`${slug}: no reader for ${s.provider}`);
    continue;
  }
  let done = false;
  for (const site of sites) {
    if (!lists.has(site)) lists.set(site, await site.list());
    // The page whose address carries the title; the reader then confirms it by the page's own name.
    const want = key(s.name);
    const given = pageFor[slug];
    const items = given ? lists.get(site).filter((it) => it.url === given) : lists.get(site).filter((it) => key((it.url ?? "").split("/").filter(Boolean).pop() ?? "") === want);
    for (const item of items) {
      const html = await fetchText(item.url);
      const found = html && site.art(html, item);
      if (!found?.name || (!given && key(found.name) !== want) || !found.image) continue;
      const buf = await fetchBinary(found.image);
      if (!buf || buf.length < 2000) continue;
      const out = await frameArt(buf);
      const file = `${slug}.webp`;
      if (PREVIEW) {
        fs.mkdirSync(PREVIEW, { recursive: true });
        await sharp(out).jpeg({ quality: 75 }).toFile(path.join(PREVIEW, `${slug}.jpg`));
      } else {
        fs.writeFileSync(path.join(OUT, file), out);
        await makeThumb(file, true);
        sources.art[slug] = {
          file,
          bytes: out.length,
          type: "image/webp",
          sourceUrl: found.image,
          sourceHost: new URL(found.image).hostname,
          page: item.page ?? item.url,
          provider: s.provider,
          fetched: TODAY,
          via: `${s.provider}'s own game page`,
        };
      }
      console.log(`${slug}: ${found.name} ← ${item.url}`);
      done = true;
      break;
    }
    if (done) break;
  }
  if (!done) console.log(`${slug}: no matching page with art on ${sites.map((x) => x.host).join(", ")}`);
}
if (!PREVIEW) fs.writeFileSync(SOURCES, JSON.stringify(sources, null, 2) + "\n");
