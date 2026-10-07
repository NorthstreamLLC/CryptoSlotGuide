#!/usr/bin/env node
/**
 * 128px-wide thumbnails of the game art in public/assets/games, written to
 * public/assets/games/t/<same name>. List pages draw a tile at 52px; serving
 * them the 640px art cost ~60KB a row where ~4KB does, across pages of 700
 * rows. Run after adding art (scripts/fetch-studio-art.mjs makes its own as
 * it goes); existing thumbnails are kept unless --force.
 *
 *   node scripts/make-art-thumbs.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

export const THUMB_W = 128;
const SRC = path.join("public", "assets", "games");
const OUT = path.join(SRC, "t");

export async function makeThumb(file, force = false) {
  const to = path.join(OUT, file);
  if (!force && fs.existsSync(to)) return false;
  fs.mkdirSync(OUT, { recursive: true });
  await sharp(path.join(SRC, file)).resize({ width: THUMB_W, withoutEnlargement: true }).webp({ quality: 68 }).toFile(to);
  return true;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const force = process.argv.includes("--force");
  let made = 0;
  for (const f of fs.readdirSync(SRC).filter((f) => f.endsWith(".webp"))) if (await makeThumb(f, force)) made++;
  // A thumbnail whose full-size file is gone goes too.
  for (const f of fs.existsSync(OUT) ? fs.readdirSync(OUT) : []) if (!fs.existsSync(path.join(SRC, f))) fs.unlinkSync(path.join(OUT, f));
  console.log(`${made} thumbnails written to ${OUT}`);
}
