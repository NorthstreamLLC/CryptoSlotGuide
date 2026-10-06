/**
 * Fetching for the studio-site readers (scripts/studio-sites/*.mjs): plain
 * GETs through curl — several studio hosts refuse Node's client and serve
 * curl — cached on disk so a re-run reads nothing twice.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFile } from "node:child_process";

export const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36";
const CACHE = path.join(process.env.TEMP || process.env.TMP || ".", "csg-studio-art");
fs.mkdirSync(CACHE, { recursive: true });
const DELAY_MS = 400;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const keyOf = (u) => crypto.createHash("sha1").update(u).digest("hex").slice(0, 20);

function curl(url, binary) {
  return new Promise((resolve) => {
    execFile(
      "curl",
      ["-sL", "-A", UA, "--connect-timeout", "10", "-m", "60", "-w", "\n__CODE__%{http_code}", url],
      { encoding: "buffer", maxBuffer: 64 * 1024 * 1024 },
      (_e, out) => {
        const b = out ?? Buffer.alloc(0);
        const i = b.lastIndexOf(Buffer.from("\n__CODE__"));
        if (i < 0) return resolve(null);
        const code = Number(b.slice(i + 9).toString());
        if (code < 200 || code >= 300) return resolve(null);
        const body = b.slice(0, i);
        resolve(binary ? body : body.toString("utf8"));
      }
    );
  });
}

/** Page text, cached; null on any non-2xx. */
export async function fetchText(url) {
  const f = path.join(CACHE, keyOf(url) + ".html");
  if (fs.existsSync(f)) return fs.readFileSync(f, "utf8");
  await sleep(DELAY_MS);
  const t = await curl(url, false);
  if (t !== null) fs.writeFileSync(f, t);
  return t;
}

/** Image bytes, cached; null on failure or a non-image body. */
export async function fetchBinary(url) {
  const f = path.join(CACHE, keyOf(url) + ".bin");
  if (fs.existsSync(f)) return fs.readFileSync(f);
  await sleep(DELAY_MS);
  const b = await curl(url, true);
  if (!b) return null;
  const head = b.slice(0, 64).toString("utf8").trim().toLowerCase();
  if (head.startsWith("<!doctype") || head.startsWith("<html")) return null;
  fs.writeFileSync(f, b);
  return b;
}

export const locsOf = (xml) => [...String(xml ?? "").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

/** Every page URL in a sitemap, following one level of sitemap index. */
export async function sitemapUrls(indexUrl) {
  let locs = locsOf(await fetchText(indexUrl));
  if (locs.length && locs.every((u) => /\.xml(\?|$)/.test(u))) {
    const all = [];
    for (const sub of locs) all.push(...locsOf(await fetchText(sub)));
    locs = all;
  }
  return [...new Set(locs)];
}

export const decode = (s) =>
  String(s ?? "")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&rsquo;|&lsquo;/g, "'")
    .replace(/[™®]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** The content of a <meta property|name="..."> tag. */
export function meta(html, prop) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (new RegExp(`(?:property|name)=["']${prop}["']`, "i").test(tag)) {
      const c = (tag.match(/\bcontent=["']([^"']*)["']/i) ?? [])[1];
      if (c) return decode(c);
    }
  }
  return null;
}

/** The page's <h1> text. */
export const h1 = (html) => decode(((html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) ?? [])[1] ?? "").replace(/<[^>]+>/g, " "));
