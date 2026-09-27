/**
 * Fetches the payment providers' marks into public/assets/payments.
 *
 * Same rule as scripts/fetch-logos.mjs: every file comes from the provider's
 * OWN domain — its declared site icon, apple-touch-icon or manifest app icon —
 * never a logo aggregator or a CDN that repackages other people's marks. The
 * URL behind each file is recorded in data/payment-logo-sources.json.
 *
 * Domains come from lib/payment-partners.ts, so the registry stays the single
 * place a provider is defined.
 *
 * Run from web/:
 *   node scripts/fetch-payment-logos.mjs           # only slugs with no file
 *   node scripts/fetch-payment-logos.mjs --all     # re-check, keep the better file
 *   node scripts/fetch-payment-logos.mjs visa pix
 *
 * As with the casino marks: plain fetch, so a provider behind a bot wall
 * reports NONE even when its icon is fine in a browser. NONE never overwrites
 * anything, so a throttled run is safe — just unproductive.
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join("public", "assets", "payments");
const SOURCES = path.join("data", "payment-logo-sources.json");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";

const argv = process.argv.slice(2);
const ALL = argv.includes("--all");
const only = argv.filter((a) => !a.startsWith("--"));

/** Parsed out of the TS registry so the domains are not duplicated here. */
function registry() {
  const src = fs.readFileSync(path.join("lib", "payment-partners.ts"), "utf8");
  const out = [];
  for (const m of src.matchAll(/\{\s*slug:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*domain:\s*"([^"]+)"/g)) {
    out.push({ slug: m[1], name: m[2], domain: m[3] });
  }
  return out;
}

/**
 * Providers whose mark cannot be discovered from the page, with the one asset
 * on their OWN domain that works. Apple and Google render their heads with
 * JavaScript, so a plain fetch sees no icon link at all; Papara answers an
 * unknown client with a 403 error page and only that page's favicon.
 *
 * Apple Pay and Google Pay resolve to the Apple and Google marks rather than
 * the wallet lockups: those lockups are governed by each company's brand
 * guidelines and are not published as a plain icon. The company mark is the
 * recognisable thing in a payment row, and it comes from the company's site.
 */
const EXACT = {
  "apple-pay": "https://www.apple.com/favicon.ico",
  "google-pay": "https://www.google.com/favicon.ico",
  papara: "https://cdn.papara.com/web/customerrors/favicon.ico",
};

async function get(url, ms = 15000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    return await fetch(url, { headers: { "user-agent": UA, accept: "image/*,text/html,*/*" }, redirect: "follow", signal: c.signal });
  } finally {
    clearTimeout(t);
  }
}

/** Icon candidates from a page, best first: a vector beats any raster, then largest declared size. */
async function candidates(html, base) {
  const out = [];
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    const rel = (tag.match(/rel=["']([^"']+)/i) ?? [])[1] ?? "";
    const href = (tag.match(/href=["']([^"']+)/i) ?? [])[1];
    if (!href) continue;
    if (/manifest/i.test(rel)) {
      try {
        const mf = new URL(href, base).href;
        const j = await (await get(mf)).json();
        for (const i of j.icons ?? []) {
          const w = Number(String(i.sizes ?? "").split("x")[0]) || 0;
          out.push({ url: new URL(i.src, mf).href, size: w, vector: /\.svg(\?|$)/i.test(i.src) });
        }
      } catch {}
      continue;
    }
    // rel="mask-icon" is Safari's pinned-tab silhouette: a single-colour mask,
    // not a logo. It matches /icon/ and sorts first as a vector, which is how
    // Interac ended up as a black blob invisible on a dark card.
    if (/mask-icon/i.test(rel) || /safari-pinned-tab/i.test(href)) continue;
    if (!/icon/i.test(rel)) continue;
    const size = Number((tag.match(/sizes=["'](\d+)x/i) ?? [])[1]) || (/apple-touch/i.test(rel) ? 180 : 32);
    try {
      out.push({ url: new URL(href, base).href, size, vector: /\.svg(\?|$)/i.test(href) });
    } catch {}
  }
  out.push({ url: new URL("/favicon.ico", base).href, size: 1, vector: false });
  return out.sort((a, b) => Number(b.vector) - Number(a.vector) || b.size - a.size);
}

/** Width of a PNG, Infinity for an SVG — what a file already on disk is worth. */
function currentWorth(slug) {
  const f = fs.readdirSync(OUT).find((x) => x.replace(/\.[a-z]+$/, "") === slug);
  if (!f) return { worth: 0, file: null };
  if (f.endsWith(".svg")) return { worth: Infinity, file: f };
  const b = fs.readFileSync(path.join(OUT, f));
  if (b.subarray(1, 4).toString() === "PNG") return { worth: b.readUInt32BE(16), file: f };
  return { worth: 255, file: f };
}

/**
 * What a buffer is, for files that are not PNG or SVG.
 *
 * Banxa serves its site icon as a JPEG and several schemes serve a classic
 * BMP-encoded .ico. Both render fine in an <img> at the 18px these chips draw
 * at, and rejecting them was losing Visa, Pix, UPI, Webpay and Banxa — five of
 * the nine misses — over a format check that only mattered for measuring.
 */
function sniff(buf) {
  if (buf.subarray(1, 4).toString() === "PNG") return "png";
  if (buf[0] === 0xff && buf[1] === 0xd8) return "jpg";
  if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "webp";
  if (buf.length > 4 && buf.readUInt16LE(0) === 0 && buf.readUInt16LE(2) === 1) return "ico";
  return null;
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

async function one({ slug, domain }) {
  const { worth, file } = currentWorth(slug);
  if (file && !ALL && !only.length) return { line: `${slug}: have ${file}`, src: null };

  if (EXACT[slug]) {
    try {
      const buf = Buffer.from(await (await get(EXACT[slug])).arrayBuffer());
      const best = sniff(buf) === "ico" ? fromIco(buf) : null;
      if (best) {
        write(slug, "png", best.data);
        return { line: `${slug}: png ${best.size}px (pinned)`, src: EXACT[slug] };
      }
      const ext = sniff(buf);
      if (ext) {
        write(slug, ext, buf);
        return { line: `${slug}: ${ext} (pinned)`, src: EXACT[slug] };
      }
    } catch {}
    return { line: `${slug}: NONE (pin failed)`, src: null };
  }

  let html = "";
  for (const base of [`https://${domain}/`, `https://${domain}`]) {
    try {
      const r = await get(base);
      if (!r.ok) continue;
      html = await r.text();
      if (html) break;
    } catch {}
  }
  if (!html) return { line: `${slug}: NONE (no page from ${domain})`, src: null };

  for (const c of (await candidates(html, `https://${domain}/`)).slice(0, 8)) {
    try {
      const r = await get(c.url);
      if (!r.ok) continue;
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 100) continue;

      const kind = sniff(buf);
      if (kind === "ico") {
        // A PNG inside the .ico is worth unwrapping; a BMP-encoded one is not,
        // but the .ico itself renders, so keep it rather than dropping the mark.
        const best = fromIco(buf);
        if (best) {
          if (file && best.size <= worth) return { line: `${slug}: kept ${file}`, src: null };
          write(slug, "png", best.data);
          return { line: `${slug}: png ${best.size}px`, src: c.url };
        }
        if (file) return { line: `${slug}: kept ${file}`, src: null };
        write(slug, "ico", buf);
        return { line: `${slug}: ico`, src: c.url };
      }

      const isSvg = c.vector || buf.subarray(0, 200).toString().includes("<svg");
      if (isSvg) {
        if (worth === Infinity && !ALL) return { line: `${slug}: kept ${file}`, src: null };
        write(slug, "svg", buf);
        return { line: `${slug}: svg`, src: c.url };
      }
      if (kind === "jpg" || kind === "webp") {
        if (file && !ALL) return { line: `${slug}: kept ${file}`, src: null };
        write(slug, kind, buf);
        return { line: `${slug}: ${kind}`, src: c.url };
      }
      if (kind !== "png") continue;
      const w = buf.readUInt32BE(16);
      if (file && w <= worth) return { line: `${slug}: kept ${file} (${worth}px >= ${w}px)`, src: null };
      write(slug, "png", buf);
      return { line: `${slug}: png ${w}px`, src: c.url };
    } catch {}
  }
  return { line: `${slug}: NONE (no usable icon)`, src: null };
}

fs.mkdirSync(OUT, { recursive: true });
const sources = fs.existsSync(SOURCES) ? JSON.parse(fs.readFileSync(SOURCES, "utf8")) : {};
const todo = registry().filter((p) => !only.length || only.includes(p.slug));

for (const p of todo) {
  const { line, src } = await one(p);
  if (src) sources[p.slug] = { url: src, fetched: new Date().toISOString().slice(0, 10) };
  console.log("  " + line);
}
// The extension varies by what each provider serves, so record the filename
// rather than leaving the app to guess it.
for (const f of fs.readdirSync(OUT)) {
  const slug = f.replace(/\.[a-z]+$/, "");
  sources[slug] = { ...(sources[slug] ?? {}), file: f };
}
fs.writeFileSync(SOURCES, JSON.stringify(sources, null, 2) + "\n");
console.log(`\n  ${fs.readdirSync(OUT).length} marks in ${OUT}`);
