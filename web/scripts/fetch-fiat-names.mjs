#!/usr/bin/env node
/**
 * The brand name each licensed (fiat) site gives itself, into
 * data/fiat-site-names.json.
 *
 * Registers mostly list web addresses and companies — "spela.svenskaspel.se"
 * under "Svenska Spel Sport & Casino AB" — so a reader scanning for "Svenska
 * Spel" or "ATG" could not find them. This reads the name from the site's own
 * home page: its og:site_name, its application-name / apple-mobile-web-app-
 * title, or its <title>. A name is kept only when it matches the domain
 * (letters of one contained in the other), so a page titled "Online Casino |
 * Play Now" never renames a site. Anything not kept falls back, on the page,
 * to the register's own brand or the domain.
 *
 * Usage, from web/:
 *   node scripts/fetch-fiat-names.mjs            # domains without a name yet
 *   node scripts/fetch-fiat-names.mjs --force    # all of them again
 */
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";

const OUT = path.join("data", "fiat-site-names.json");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36";
const FORCE = process.argv.includes("--force");
/** Domains named on the command line: read just those (for a quick check). */
const ONLY = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const CONCURRENCY = 24;

const data = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : { names: {}, failed: {} };
data.note =
  "Each licensed site's own name, read from its home page (og:site_name, application-name or <title>) by scripts/fetch-fiat-names.mjs, kept only where it matches the domain. sourceUrl is the page it was read from.";

const clean = (d) => String(d).trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
const domains = new Set();
const world = JSON.parse(fs.readFileSync(path.join("data", "world-market.json"), "utf8"));
for (const m of Object.values(world.countries))
  for (const k of ["casinos", "sportsbooks", "operators"]) {
    const l = m[k];
    if (!l) continue;
    for (const o of l.operators) for (const d of o.domains ?? []) domains.add(clean(d));
    for (const d of l.domains ?? []) domains.add(clean(d));
  }
const todo = (ONLY.length ? ONLY : [...domains]).filter((d) => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(d)).filter((d) => FORCE || !(d in data.names || d in data.failed)).sort();
console.log(`${domains.size} domains · ${todo.length} to read`);

function get(url) {
  return new Promise((resolve) => {
    execFile("curl", ["-sL", "-A", UA, "-H", "Accept-Language: en", "--connect-timeout", "6", "-m", "14", "--max-filesize", "3000000", "-w", "\n__META__%{http_code} %{url_effective}", url], { maxBuffer: 6 * 1024 * 1024 }, (_e, stdout) => {
      const out = String(stdout ?? "");
      const i = out.lastIndexOf("\n__META__");
      if (i < 0) return resolve({ status: 0, body: "", url });
      const [status, ...rest] = out.slice(i + 9).split(" ");
      resolve({ status: Number(status), body: out.slice(0, i), url: rest.join(" ").trim() || url });
    });
  });
}

const ENT = { amp: "&", quot: '"', apos: "'", "#39": "'", "#039": "'", nbsp: " ", ndash: "–", mdash: "—", "#8211": "–", "#8212": "—", "#8217": "'", "#x27": "'", "#124": "|" };
const decode = (s) => s.replace(/&(#?\w+);/g, (m, k) => ENT[k.toLowerCase()] ?? (k.startsWith("#") ? String.fromCodePoint(parseInt(k.slice(1).replace(/^x/i, "0x"), k[1]?.toLowerCase() === "x" ? 16 : 10) || 32) : m)).replace(/\s+/g, " ").trim();
const meta = (html, re) => {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) if (re.test(tag)) {
    const c = (tag.match(/\bcontent=["']([^"']*)["']/i) ?? [])[1];
    if (c) return decode(c);
  }
  return null;
};
const letters = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
/** The domain's naming label: "spela.svenskaspel.se" → "svenskaspel", "se.bingo.com" → "bingo". */
const label = (d) => {
  const parts = d.split(".");
  const tld2 = /^(co|com|org|net|bet|gov)$/.test(parts[parts.length - 2]) && parts.length > 2;
  return parts[parts.length - (tld2 ? 3 : 2)];
};
const matches = (name, d) => {
  const n = letters(name), l = letters(label(d));
  if (n.length < 2 || l.length < 2) return false;
  return n === l || (l.length >= 3 && n.includes(l)) || (n.length >= 3 && l.includes(n));
};

/** Candidate names from the page, best first; the first that matches the domain wins. */
function pick(html, d) {
  const cands = [];
  for (const re of [/property=["']og:site_name["']/i, /name=["']application-name["']/i, /name=["']apple-mobile-web-app-title["']/i]) {
    const v = meta(html, re);
    if (v) cands.push(v);
  }
  const t = (html.match(/<title[^>]*>([^<]*)<\/title>/i) ?? [])[1];
  if (t) for (const seg of decode(t).split(/\s+[|–—\-:·•]\s+|\s*[|–—·•]\s*/)) cands.push(seg.trim());
  for (const c of cands) {
    // Trademark marks out; a trailing market ("BetMGM Sweden", "Unibet UK")
    // is the page's locale, not the brand.
    const name = c
      .replace(/\s*(®|™)\s*/g, " ")
      .replace(/\s+(Sweden|Sverige|Danmark|Denmark|Deutschland|Germany|Italia|Italy|España|Spain|Espana|France|Nederland|Netherlands|Belgi[eë]|Belgium|Portugal|Česko|Czech|Latvija|Ontario|Canada|UK|United Kingdom|Argentina)$/i, "")
      .trim();
    // A candidate that is itself a web address ("atg.se") names nothing new.
    if (/^[\w.-]+\.[a-z]{2,}$/i.test(name)) continue;
    if (name.length >= 2 && name.length <= 32 && matches(name, d)) return name;
  }
  return null;
}

let done = 0, kept = 0;
const queue = [...todo];
async function worker() {
  while (queue.length) {
    const d = queue.shift();
    const r = await get(`https://${d}/`);
    const name = r.status >= 200 && r.status < 400 ? pick(r.body, d) : null;
    if (name) {
      data.names[d] = { name, sourceUrl: r.url };
      delete data.failed[d];
      kept++;
    } else {
      delete data.names[d];
      data.failed[d] = r.status ? `HTTP ${r.status}, no matching name` : "no answer";
    }
    if (++done % 100 === 0) {
      console.log(`  ${done}/${todo.length} · ${kept} names`);
      fs.writeFileSync(OUT, JSON.stringify(data, null, 1) + "\n");
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
fs.writeFileSync(OUT, JSON.stringify(data, null, 1) + "\n");
console.log(`done: ${kept} of ${todo.length} named · ${Object.keys(data.names).length} names on file`);
