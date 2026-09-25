/**
 * Proves the featured placement never appears on a page scoped to a territory
 * the featured operator's own restricted list names.
 *
 * Data-driven on purpose: it reads the restricted list and checks EVERY country
 * on it that we publish a page for. A hand-typed list of five URLs passes
 * forever while the operator quietly adds a sixth country to its terms.
 *
 * Run against a running server: `node scripts/audit-partner-geo.mjs [baseUrl]`.
 * Exits non-zero on a leak, so it can gate a deploy.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(web, p), "utf8"));
const BASE = (process.argv[2] ?? "http://localhost:3001").replace(/\/$/, "");

const featured = read("data/ops.json").find((o) => o.featured);
if (!featured) {
  console.log("audit:geo — no featured operator, nothing to check");
  process.exit(0);
}
const blocked = new Set((read("data/restricted.json").find((r) => r.slug === featured.slug)?.codes ?? []).map((c) => c.toUpperCase()));
if (!blocked.size) {
  console.error(`audit:geo — no restricted list on file for ${featured.slug}; cannot verify the geo gate`);
  process.exit(1);
}

// Every published URL, so a new page type scoped to a country is covered the
// day it ships rather than whenever someone remembers to add it here.
const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, BASE));

/** A page is "scoped to" a territory when its path ends in that country code, or it is a US page. */
function scopeOf(pathname) {
  const m = pathname.match(/\/(?:crypto-casinos\/in|legal)\/([a-z]{2})$/i);
  if (m) return m[1].toUpperCase();
  if (/^\/legal\/us(\/|$)/.test(pathname) || /^\/sweepstakes-casinos(\/|$)/.test(pathname)) return "US";
  return null;
}

const targets = urls.filter((u) => {
  const s = scopeOf(new URL(u).pathname);
  return s && blocked.has(s);
});

let leaks = 0;
for (let i = 0; i < targets.length; i += 6) {
  await Promise.all(
    targets.slice(i, i + 6).map(async (u) => {
      const html = await (await fetch(u)).text();
      // The marker, not the rendered copy: React splits interpolated text into
      // separate SSR nodes, so matching a sentence reports a false pass.
      if (new RegExp(`data-featured-partner="${featured.slug}"`).test(html)) {
        console.error(`  LEAK  ${new URL(u).pathname}`);
        leaks++;
      }
    })
  );
}

const covered = [...new Set(targets.map((u) => scopeOf(new URL(u).pathname)))].sort();
console.log(`audit:geo — ${featured.slug} blocks ${blocked.size} territories; checked ${targets.length} pages across ${covered.join(", ")}`);
if (leaks) {
  console.error(`audit:geo — ${leaks} page(s) show the placement where the operator does not accept players`);
  process.exit(1);
}
console.log("audit:geo — no leaks");
