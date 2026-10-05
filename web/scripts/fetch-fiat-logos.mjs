#!/usr/bin/env node
/**
 * Site icons for every licensed (fiat) site in the regulator registers we
 * hold, into public/assets/logos/fiat/<domain>.webp.
 *
 * Same rule as scripts/fetch-logos.mjs: each file is the site's own icon,
 * read from the site's own pages — the apple-touch-icon, the icons in its web
 * manifest, or its favicon — never a logo aggregator or a review site.
 * data/fiat-logo-sources.json records the exact URL behind every file.
 *
 * Icons are normalised to a 96px square WebP (a few KB each), so 800 brands
 * cost about as much as one hero image. ICO files are opened by hand: most
 * modern ones carry a PNG inside, which is taken; an ICO holding only bitmaps
 * is skipped rather than guessed at.
 *
 * Domains come from data/world-market.json (every register's rows and the
 * web addresses a register lists by licence type) and data/uk-licences.json.
 *
 * Usage, from web/:
 *   node scripts/fetch-fiat-logos.mjs --limit 20      # try a few
 *   node scripts/fetch-fiat-logos.mjs                 # every domain without a file
 *   node scripts/fetch-fiat-logos.mjs --force         # re-fetch everything
 */
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import sharp from "sharp";

const OUT = path.join("public", "assets", "logos", "fiat");
const SOURCES = path.join("data", "fiat-logo-sources.json");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36";
const argv = process.argv.slice(2);
const LIMIT = Number(argv[argv.indexOf("--limit") + 1]) || 0;
const FORCE = argv.includes("--force");
const CONCURRENCY = 16;
const SIZE = 96;

fs.mkdirSync(OUT, { recursive: true });
const sources = fs.existsSync(SOURCES) ? JSON.parse(fs.readFileSync(SOURCES, "utf8")) : { note: "", logos: {}, failed: {} };
sources.note =
  "Site icons for licensed (fiat) sites, each read from the site's own pages by scripts/fetch-fiat-logos.mjs and stored as a 96px WebP in public/assets/logos/fiat. sourceUrl is the icon file it came from. `failed` lists domains whose own pages gave no usable icon (bot walls, geo-blocks, bitmap-only ICOs).";

/* ---------------------------------------------------------- domains */

const clean = (d) =>
  String(d)
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");

const domains = new Set();
const world = JSON.parse(fs.readFileSync(path.join("data", "world-market.json"), "utf8"));
for (const m of Object.values(world.countries)) {
  for (const k of ["casinos", "sportsbooks", "operators"]) {
    const l = m[k];
    if (!l) continue;
    for (const o of l.operators) for (const d of o.domains ?? []) domains.add(clean(d));
    for (const d of l.domains ?? []) domains.add(clean(d));
  }
}
const uk = JSON.parse(fs.readFileSync(path.join("data", "uk-licences.json"), "utf8"));
for (const b of Object.values(uk.brands)) for (const l of b.licences) for (const d of l.domains ?? []) domains.add(clean(d));

const todo = [...domains]
  .filter((d) => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(d)) // ASCII hostnames only
  .filter((d) => FORCE || !sources.logos[d])
  .sort();
const list = LIMIT ? todo.slice(0, LIMIT) : todo;
console.log(`${domains.size} domains in the registers · ${list.length} to fetch`);

/* ---------------------------------------------------------- fetching */

/**
 * GET with curl (several of these hosts refuse Node's client): { status, body, url }.
 * Asynchronous, so the workers below really do run side by side — a
 * synchronous call blocked the event loop and made sixteen workers one.
 */
function get(url, binary = false) {
  return new Promise((resolve) => {
    // A command line has a length limit; no real page or icon URL comes near it.
    if (!url || url.length > 2000) return resolve({ status: 0, url, body: binary ? Buffer.alloc(0) : "" });
    execFile(
      "curl",
      ["-sL", "-A", UA, "--connect-timeout", "6", "-m", "12", "--max-filesize", "4000000", "-w", "\n__META__%{http_code} %{url_effective}", url],
      { maxBuffer: 8 * 1024 * 1024, encoding: "buffer" },
      (_err, stdout) => {
        const out = stdout ?? Buffer.alloc(0);
        const marker = out.lastIndexOf(Buffer.from("\n__META__"));
        if (marker < 0) return resolve({ status: 0, url, body: binary ? Buffer.alloc(0) : "" });
        const meta = out.slice(marker + 9).toString();
        const [status, ...rest] = meta.split(" ");
        const body = out.slice(0, marker);
        resolve({ status: Number(status), url: rest.join(" ").trim() || url, body: binary ? body : body.toString("utf8") });
      }
    );
  });
}

const abs = (href, base) => {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
};

/** Icon candidates the page declares, largest stated size first. */
function candidates(html, base) {
  const out = [];
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const rel = (tag.match(/\brel=["']?([^"'>]+)/i) ?? [])[1]?.toLowerCase() ?? "";
    const href = (tag.match(/\bhref=["']?([^"'\s>]+)/i) ?? [])[1];
    if (!href) continue;
    if (rel.includes("manifest")) {
      out.push({ kind: "manifest", url: abs(href, base), size: 0 });
      continue;
    }
    if (!/icon/.test(rel) || /mask-icon/.test(rel)) continue;
    const sizes = (tag.match(/\bsizes=["']?(\d+)x\d+/i) ?? [])[1];
    const size = sizes ? Number(sizes) : /apple-touch/.test(rel) ? 180 : 32;
    out.push({ kind: "icon", url: abs(href, base), size });
  }
  return out.filter((c) => c.url);
}

/** The largest PNG stored inside an .ico, or null when it holds only bitmaps. */
function pngFromIco(buf) {
  if (buf.length < 6 || buf.readUInt16LE(0) !== 0 || buf.readUInt16LE(2) !== 1) return null;
  const n = buf.readUInt16LE(4);
  let best = null;
  for (let i = 0; i < n; i++) {
    const e = 6 + i * 16;
    if (e + 16 > buf.length) break;
    const w = buf[e] || 256;
    const size = buf.readUInt32LE(e + 8);
    const off = buf.readUInt32LE(e + 12);
    const data = buf.slice(off, off + size);
    if (data.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) && (!best || w > best.w)) best = { w, data };
  }
  return best?.data ?? null;
}

async function toWebp(buf, url) {
  let input = buf;
  if (/\.ico(\?|$)/i.test(url) || (buf[0] === 0 && buf[1] === 0 && buf[2] === 1)) {
    input = pngFromIco(buf);
    if (!input) return null;
  }
  try {
    const img = sharp(input, { density: 300 });
    const meta = await img.metadata();
    if (!meta.width || meta.width < 32) return null;
    const out = await img
      .resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 82 })
      .toBuffer();
    return { out, width: meta.width };
  } catch {
    return null;
  }
}

async function one(domain) {
  const home = await get(`https://${domain}/`);
  const base = home.url || `https://${domain}/`;
  let cands = home.status >= 200 && home.status < 400 ? candidates(home.body, base) : [];
  // Manifest icons carry real sizes; open the manifest if there is one.
  for (const m of cands.filter((c) => c.kind === "manifest")) {
    const r = await get(m.url);
    try {
      const j = JSON.parse(r.body);
      for (const ic of j.icons ?? []) {
        const s = Number(String(ic.sizes ?? "").split("x")[0]) || 0;
        const u = abs(ic.src, m.url);
        if (u) cands.push({ kind: "icon", url: u, size: s });
      }
    } catch {
      /* not JSON */
    }
  }
  cands = cands.filter((c) => c.kind === "icon");
  // The conventional paths, last, for sites that declare nothing.
  cands.push({ kind: "icon", url: `https://${domain}/apple-touch-icon.png`, size: 180 }, { kind: "icon", url: `https://${domain}/favicon.ico`, size: 16 });
  cands.sort((a, b) => b.size - a.size);
  const seen = new Set();
  for (const c of cands) {
    if (seen.has(c.url)) continue;
    seen.add(c.url);
    if (/\.svg(\?|$)/i.test(c.url) === false && c.size && c.size < 16) continue;
    // An icon inlined in the page as a data: URL is still the site's own icon.
    const inline = c.url.match(/^data:image\/[\w+.-]+;base64,(.+)$/i);
    const r = inline ? { status: 200, url: c.url, body: Buffer.from(inline[1], "base64") } : await get(c.url, true);
    if (r.status < 200 || r.status >= 300 || r.body.length < 100) continue;
    const head = r.body.slice(0, 64).toString("utf8").trim().toLowerCase();
    if (head.startsWith("<!doctype") || head.startsWith("<html")) continue; // a page, not an image
    const w = await toWebp(r.body, c.url);
    if (!w) continue;
    fs.writeFileSync(path.join(OUT, `${domain}.webp`), w.out);
    return { file: `${domain}.webp`, sourceUrl: inline ? `${base} (icon inlined in the page)` : c.url, width: w.width };
  }
  return null;
}

let done = 0,
  ok = 0;
const queue = [...list];
async function worker() {
  while (queue.length) {
    const d = queue.shift();
    const r = await one(d);
    done++;
    if (r) {
      ok++;
      sources.logos[d] = { ...r, fetched: new Date().toISOString().slice(0, 10) };
      delete sources.failed[d];
    } else sources.failed[d] = new Date().toISOString().slice(0, 10);
    if (done % 25 === 0) {
      console.log(`  ${done}/${list.length} · ${ok} logos`);
      fs.writeFileSync(SOURCES, JSON.stringify(sources, null, 2) + "\n");
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

/*
 * Sibling domains. One brand often runs the same site under a domain per
 * market — 888casino.dk, 888casino.es, 888casino.se — and many of those answer
 * a script with a geo-block while one of them does not. A failed domain takes
 * the icon of a sibling with the same name before the TLD, which is the same
 * brand's own icon; the record says which sibling it came from.
 */
const label = (d) => d.split(".").slice(-2)[0];
const byLabel = new Map();
for (const [d, v] of Object.entries(sources.logos)) if (!v.via && !byLabel.has(label(d))) byLabel.set(label(d), { d, v });
let reused = 0;
for (const d of Object.keys(sources.failed)) {
  const sib = byLabel.get(label(d));
  if (!sib) continue;
  fs.copyFileSync(path.join(OUT, sib.v.file), path.join(OUT, `${d}.webp`));
  sources.logos[d] = { file: `${d}.webp`, sourceUrl: sib.v.sourceUrl, width: sib.v.width, via: sib.d, fetched: sib.v.fetched };
  delete sources.failed[d];
  reused++;
}
console.log(`  ${reused} domains took a sibling domain's icon`);
fs.writeFileSync(SOURCES, JSON.stringify(sources, null, 2) + "\n");
console.log(`done: ${ok} of ${list.length} fetched · ${Object.keys(sources.logos).length} logos on file · ${Object.keys(sources.failed).length} without a usable icon`);
