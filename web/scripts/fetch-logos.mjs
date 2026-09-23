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
 *   node scripts/fetch-logos.mjs --all      # re-check everything, keeping the better file
 *   node scripts/fetch-logos.mjs --all --force   # take the site's current icon regardless of size
 *   node scripts/fetch-logos.mjs stake kraken
 *
 * Sites behind a bot wall (Bybit) or serving only a wordmark (Nolimit City,
 * Rabby) are listed in EXACT below, pointing at the one asset on their own
 * site that actually works; everything else is discovered from the page.
 *
 * Limitation worth knowing before you trust a run: this uses plain fetch, and a
 * good number of operator sites answer that with a bot wall — they report NONE
 * here even though their icon is fine in a real browser. NONE never overwrites
 * anything, so a throttled run is safe, just unproductive. For those, drive a
 * headless browser instead: load the page, read <link rel=icon> plus the
 * manifest icons, measure each with an Image, and take the largest square.
 * Casinos with no url in ops.json (7bit, goated, degencity, housebets) aren't
 * reachable from here at all and need their domain added to DOMAINS first.
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join("public", "assets", "logos");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";

/**
 * Slugs whose domain isn't in the data files, or whose own site needs naming outright.
 * The studio entries matter: provider-licences.json stores the licence page a studio's
 * licences were read from, and for every studio in the Evolution group that page is on
 * evolution.com — deriving a domain from it would write Evolution's mark under Big Time
 * Gaming, NetEnt and Red Tiger. Each studio is pinned to its own site instead.
 */
const DOMAINS = {
  // Wallets and exchanges: no URL field in the row data.
  ledger: "www.ledger.com",
  metamask: "metamask.io",
  phantom: "phantom.com",
  "trust-wallet": "trustwallet.com",
  kraken: "www.kraken.com",
  okx: "www.okx.com",
  coinbase: "www.coinbase.com",
  kucoin: "www.kucoin.com",
  // Studios, pinned to their own sites rather than a parent's licence page.
  evolution: "www.evolution.com",
  "big-time-gaming": "www.bigtimegaming.com",
  netent: "www.netent.com",
  "red-tiger": "www.redtiger.com",
  quickspin: "www.quickspin.com",
  octoplay: "www.octoplay.com",
  "relax-gaming": "www.relax-gaming.com",
  "hacksaw-gaming": "www.hacksawgaming.com",
  "booming-games": "www.booming-games.com",
  "print-studios": "printstudios.com",
  spribe: "spribe.co",
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

  // Two slugs on one host means a derived domain is a parent's site, not the brand's own.
  // Drop the derived ones rather than write one brand's mark under another's slug.
  const byHost = new Map();
  for (const [slug, dom] of out) if (dom) byHost.set(dom, [...(byHost.get(dom) ?? []), slug]);
  for (const [dom, slugs] of byHost) {
    if (slugs.length < 2) continue;
    const owner = slugs.find((s) => DOMAINS[s] === dom) ?? null;
    for (const s of slugs) if (s !== owner) out.set(s, null);
  }
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

/**
 * Icon candidates from a page, largest first. The manifest matters: several sites
 * ship a 32px favicon in <head> and their real 512px app icon only in the manifest,
 * which is how the first pass ended up with 16px marks for brands that publish 1000px ones.
 */
async function candidates(html, base) {
  const out = [];
  for (const m of html.matchAll(/<link[^>]*>/gi)) {
    const tag = m[0];
    const rel = (tag.match(/rel=["']([^"']+)/i) ?? [])[1] ?? "";
    const href = (tag.match(/href=["']([^"']+)/i) ?? [])[1];
    if (!href) continue;
    if (/manifest/i.test(rel)) {
      try {
        const j = await (await get(new URL(href, base).href)).json();
        for (const i of j.icons ?? []) {
          const w = Number(String(i.sizes ?? "").split("x")[0]) || 0;
          out.push({ url: new URL(i.src, new URL(href, base).href).href, size: w, vector: /\.svg(\?|$)/i.test(i.src) });
        }
      } catch {}
      continue;
    }
    if (!/icon/i.test(rel)) continue;
    const size = Number((tag.match(/sizes=["'](\d+)x/i) ?? [])[1]) || (/apple-touch/i.test(rel) ? 180 : 32);
    try {
      out.push({ url: new URL(href, base).href, size, vector: /\.svg(\?|$)/i.test(href) });
    } catch {}
  }
  // A vector beats any raster; otherwise the biggest declared size wins.
  return out.sort((a, b) => Number(b.vector) - Number(a.vector) || b.size - a.size);
}

/** Width of a PNG, or Infinity for an SVG — what a file on disk is worth against a candidate. */
function currentWorth(slug) {
  const f = fs.readdirSync(OUT).find((x) => x.replace(/\.[a-z]+$/, "") === slug);
  if (!f) return { worth: 0, file: null };
  if (f.endsWith(".svg")) return { worth: Infinity, file: f };
  const b = fs.readFileSync(path.join(OUT, f));
  if (f.endsWith(".png") && b.subarray(1, 4).toString() === "PNG") return { worth: b.readUInt32BE(16), file: f };
  // A format this script can't measure (webp, jpg): only a clearly large candidate should replace it.
  return { worth: 255, file: f };
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
  const { worth, file } = currentWorth(slug);
  const keep = (size) => file && !FORCE && size <= worth;
  const note = (ext) => (file && !file.endsWith("." + ext) ? `  ⚠ extension changed ${file} → ${slug}.${ext}: update LOGOS in lib/logo.ts` : "");

  const exact = EXACT[slug];
  if (exact) {
    const r = await get(exact.url);
    const buf = Buffer.from(await r.arrayBuffer());
    if (exact.ico) {
      const best = fromIco(buf);
      if (!best) return `${slug}: ico had no PNG`;
      if (keep(best.size)) return `${slug}: kept ${file} (${worth}px ≥ ${best.size}px)`;
      write(slug, "png", best.data);
      return `${slug}: png ${best.size}px ${exact.url}${note("png")}`;
    }
    const ext = /\.svg/i.test(exact.url) ? "svg" : "png";
    if (keep(ext === "svg" ? Infinity : 0)) return `${slug}: kept ${file}`;
    write(slug, ext, buf);
    return `${slug}: ${ext} ${buf.length}B ${exact.url}${note(ext)}`;
  }
  if (!domain) return `${slug}: no domain known — add it to DOMAINS`;

  const base = `https://${domain}/`;
  let list = [];
  try {
    const r = await get(base);
    list = await candidates(await r.text(), r.url || base);
  } catch {}
  for (const u of ["apple-touch-icon.png", "favicon.png", "favicon.svg", "favicon.ico"]) list.push({ url: base + u, size: 0, vector: u.endsWith(".svg") });

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
        if (keep(best.size)) return `${slug}: kept ${file} (${worth}px ≥ ${best.size}px)`;
        write(slug, "png", best.data);
        return `${slug}: png ${best.size}px ${c.url}${note("png")}`;
      }

      const ext = type.includes("svg") ? "svg" : type.includes("png") ? "png" : type.includes("webp") ? "webp" : type.includes("jpeg") ? "jpg" : null;
      if (!ext) continue;
      // Measure a PNG rather than trust the declared size; a vector always wins.
      const real = ext === "svg" ? Infinity : ext === "png" && buf.subarray(1, 4).toString() === "PNG" ? buf.readUInt32BE(16) : c.size || 0;
      if (keep(real)) return `${slug}: kept ${file} (${worth}px ≥ ${real === Infinity ? "svg" : real + "px"})`;
      write(slug, ext, buf);
      return `${slug}: ${ext} ${real === Infinity ? "vector" : real + "px"} ${c.url}${note(ext)}`;
    } catch {}
  }
  return `${slug}: NONE`;
}


const args = process.argv.slice(2);
const all = args.includes("--all");
/** Without this, a re-fetch can only ever improve a mark, never replace it with a smaller one. */
const FORCE = args.includes("--force");
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
