/**
 * Refreshes the brand marks in public/assets/logos from each brand's own site.
 *
 * Every file is the brand's own square site icon (apple-touch-icon, manifest
 * icon, app icon or press mark) fetched from its own domain — never a logo
 * aggregator, a review site or a CDN that repackages other people's marks.
 * data/logo-sources.json records the URL behind each file.
 *
 * Run from web/:
 *   node scripts/fetch-logos.mjs            # only slugs with no file yet
 *   node scripts/fetch-logos.mjs --all      # re-fetch everything
 *   node scripts/fetch-logos.mjs stake kraken
 *
 * Sites behind a bot wall (Bybit) or serving only a wordmark (Nolimit City,
 * Rabby) are listed in EXACT below, pointing at the one asset on their own
 * site that actually works; everything else is discovered from the page.
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join("public", "assets", "logos");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";

/** Slugs whose domain isn't in the data files, or whose own site needs a specific asset. */
const DOMAINS = {
  ledger: "www.ledger.com",
  metamask: "metamask.io",
  phantom: "phantom.com",
  "trust-wallet": "trustwallet.com",
  kraken: "www.kraken.com",
  okx: "www.okx.com",
  coinbase: "www.coinbase.com",
  kucoin: "www.kucoin.com",
};

/** Where a site's own icon has to be named outright. Each was checked by hand. */
const EXACT = {
  // www.bybit.com is behind a bot wall and its own favicon.ico holds only a 48px BMP;
  // Bybit's announcements subdomain serves the same mark as a 256px PNG inside the .ico.
  bybit: { url: "https://announcements.bybit.com/images/favicon.ico", ico: true },
  // Nolimit City publishes a 32px favicon and a wide wordmark; this is its square bolt mark.
  "nolimit-city": { url: "https://fan-cdn.nolimitcity.com/nlcboltyellow_15_4f7b3d308b.svg" },
  // Rabby's favicon is 32px; this is the same mark at 512px.
  rabby: { url: "https://rabby.io/assets/logos/logo_twitter.png" },
};

const read = (p) => JSON.parse(fs.readFileSync(path.join("data", p), "utf8"));
const host = (u) => {
  try {
    return new URL(u).hostname;
  } catch {
    return null;
  }
};

/** Every slug the site renders a brand mark for, with the domain to ask. */
function targets() {
  const out = new Map();
  for (const o of read("ops.json")) if (o.url || o.signupUrl) out.set(o.slug, host(o.url ?? o.signupUrl));
  for (const s of read("sweeps.json")) out.set(s.slug, s.domain);
  for (const st of read("provider-licences.json")) out.set(st.slug, host(st.sourceUrl));
  for (const p of read("providers.json")) if (!out.get(p.slug)) out.set(p.slug, null);
  for (const [slug, dom] of Object.entries(DOMAINS)) out.set(slug, dom);
  for (const slug of Object.keys(EXACT)) if (!out.has(slug)) out.set(slug, null);
  return out;
}

async function get(url, ms = 15000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    return await fetch(url, { headers: { "user-agent": UA, accept: "image/*,text/html,*/*" }, redirect: "follow", signal: c.signal });
  } finally {
    clearTimeout(t);
  }
}

/** <link rel=icon> candidates, biggest and vector first. */
function candidates(html, base) {
  const out = [];
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    const rel = (tag.match(/rel=["']([^"']+)/i) ?? [])[1] ?? "";
    if (!/icon/i.test(rel)) continue;
    const href = (tag.match(/href=["']([^"']+)/i) ?? [])[1];
    if (!href) continue;
    const size = Number((tag.match(/sizes=["'](\d+)x/i) ?? [])[1]) || (/apple-touch/i.test(rel) ? 180 : 32);
    const svg = /\.svg(\?|$)/i.test(href);
    try {
      out.push({ url: new URL(href, base).href, score: (svg ? 300 : size) + (/apple-touch/i.test(rel) ? 40 : 0) });
    } catch {}
  }
  return out.sort((a, b) => b.score - a.score);
}

/** The largest image inside a .ico, when it is stored as a PNG. */
function fromIco(buf) {
  if (buf.length < 22 || buf.readUInt16LE(2) !== 1) return null;
  const n = buf.readUInt16LE(4);
  const entries = [];
  for (let i = 0; i < n; i++) {
    const o = 6 + i * 16;
    entries.push({ w: buf[o] || 256, size: buf.readUInt32LE(o + 8), off: buf.readUInt32LE(o + 12) });
  }
  entries.sort((a, b) => b.w - a.w);
  for (const e of entries) {
    const d = buf.subarray(e.off, e.off + e.size);
    if (d.subarray(1, 4).toString() === "PNG") return { data: d, size: e.w };
  }
  return null;
}

function write(slug, ext, buf) {
  for (const f of fs.readdirSync(OUT)) if (f.startsWith(slug + ".")) fs.unlinkSync(path.join(OUT, f));
  fs.writeFileSync(path.join(OUT, `${slug}.${ext}`), buf);
}

async function one(slug, domain) {
  const exact = EXACT[slug];
  if (exact) {
    const r = await get(exact.url);
    const buf = Buffer.from(await r.arrayBuffer());
    if (exact.ico) {
      const best = fromIco(buf);
      if (!best) return `${slug}: ico had no PNG`;
      write(slug, "png", best.data);
      return `${slug}: png ${best.size}px ${exact.url}`;
    }
    const ext = /\.svg/i.test(exact.url) ? "svg" : "png";
    write(slug, ext, buf);
    return `${slug}: ${ext} ${buf.length}B ${exact.url}`;
  }
  if (!domain) return `${slug}: no domain known`;

  const base = `https://${domain}/`;
  let list = [];
  try {
    const r = await get(base);
    list = candidates(await r.text(), r.url || base);
  } catch {}
  list.push({ url: base + "apple-touch-icon.png" }, { url: base + "favicon.png" }, { url: base + "favicon.svg" }, { url: base + "favicon.ico" });

  for (const c of list) {
    try {
      const r = await get(c.url);
      const type = r.headers.get("content-type") ?? "";
      if (!r.ok || !/^image\//.test(type)) continue;
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 300) continue;
      if (/icon|\.ico/.test(type)) {
        const best = fromIco(buf);
        if (!best || best.size < 64) continue;
        write(slug, "png", best.data);
        return `${slug}: png ${best.size}px ${c.url}`;
      }
      const ext = type.includes("svg") ? "svg" : type.includes("png") ? "png" : type.includes("webp") ? "webp" : type.includes("jpeg") ? "jpg" : null;
      if (!ext) continue;
      write(slug, ext, buf);
      return `${slug}: ${ext} ${buf.length}B ${c.url}`;
    } catch {}
  }
  return `${slug}: NONE`;
}

const args = process.argv.slice(2);
const all = args.includes("--all");
const only = args.filter((a) => !a.startsWith("--"));

fs.mkdirSync(OUT, { recursive: true });
const have = new Set(fs.readdirSync(OUT).map((f) => f.replace(/\.[a-z]+$/, "")));
const list = [...targets()].filter(([slug]) => (only.length ? only.includes(slug) : all || !have.has(slug)));

if (!list.length) {
  console.log("Nothing to fetch — every slug already has a file. Use --all to re-fetch.");
} else {
  const res = await Promise.all(list.map(([slug, dom]) => one(slug, dom)));
  console.log(res.join("\n"));
  console.log(`\n${res.filter((r) => r.endsWith("NONE") || r.includes("no domain")).length} of ${res.length} unresolved.`);
  console.log("Record every new URL in data/logo-sources.json, then check the mark is legible on a dark tile —");
  console.log("black-on-transparent art needs adding to LIGHT_PLATE in lib/logo.ts.");
}
