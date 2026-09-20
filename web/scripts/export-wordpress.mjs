// One-off migration: exports the live WordPress site (posts, pages, categories) to data/legacy.json
// and downloads its images to public/legacy/, so every existing URL keeps working after the move.
// Run from web/: `node scripts/export-wordpress.mjs`
import fs from "node:fs";
import path from "node:path";

const SITE = "https://cryptoslotguide.com";
const UA = { "user-agent": "Mozilla/5.0 (compatible; CryptoSlotGuide-migration/1.0)" };
const IMG_DIR = path.join("public", "legacy");
fs.mkdirSync(IMG_DIR, { recursive: true });

async function all(type) {
  const out = [];
  for (let page = 1; page < 20; page++) {
    const r = await fetch(`${SITE}/wp-json/wp/v2/${type}?per_page=100&page=${page}&_embed=1`, { headers: UA });
    if (!r.ok) break;
    const batch = await r.json();
    if (!batch.length) break;
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

const seen = new Map();
async function localise(url) {
  if (seen.has(url)) return seen.get(url);
  try {
    const r = await fetch(url, { headers: UA });
    if (!r.ok || !/^image\//.test(r.headers.get("content-type") ?? "")) return url;
    const ext = (new URL(url).pathname.match(/\.[a-z0-9]+$/i) ?? [".jpg"])[0];
    const name = `${Buffer.from(url).toString("base64url").slice(-24)}${ext}`;
    fs.writeFileSync(path.join(IMG_DIR, name), Buffer.from(await r.arrayBuffer()));
    const local = `/legacy/${name}`;
    seen.set(url, local);
    return local;
  } catch {
    return url;
  }
}

/** Rewrite content: keep it self-hosted (images local, internal links relative), drop WordPress cruft. */
async function clean(html) {
  let out = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s(class|id|data-[a-z-]+|style|srcset|sizes|loading|decoding|fetchpriority)="[^"]*"/g, "")
    .replace(/<figure[^>]*>|<\/figure>/g, "")
    .replace(new RegExp(SITE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), "");
  for (const m of [...out.matchAll(/src="([^"]+)"/g)]) {
    const url = m[1].startsWith("/") ? SITE + m[1] : m[1];
    if (/^https?:/.test(url)) out = out.split(m[1]).join(await localise(url));
  }
  return out.trim();
}

const strip = (s) => s.replace(/<[^>]*>/g, "").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n)).replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();

const [posts, pages, cats] = await Promise.all([all("posts"), all("pages"), all("categories")]);
const catName = Object.fromEntries(cats.map((c) => [c.id, { name: strip(c.name), slug: c.slug }]));

const items = [];
for (const p of [...posts, ...pages]) {
  items.push({
    slug: p.slug,
    type: p.type,
    title: strip(p.title.rendered),
    excerpt: strip(p.excerpt?.rendered ?? "").slice(0, 300),
    date: p.date.slice(0, 10),
    modified: p.modified.slice(0, 10),
    categories: (p.categories ?? []).map((id) => catName[id]).filter(Boolean),
    image: p._embedded?.["wp:featuredmedia"]?.[0]?.source_url ? await localise(p._embedded["wp:featuredmedia"][0].source_url) : null,
    html: await clean(p.content.rendered),
  });
}

fs.writeFileSync("data/legacy.json", JSON.stringify({ items, categories: cats.map((c) => ({ slug: c.slug, name: strip(c.name), description: strip(c.description ?? ""), count: c.count })) }, null, 1) + "\n");
console.log(`${items.length} items (${posts.length} posts, ${pages.length} pages), ${seen.size} images, ${cats.length} categories`);
