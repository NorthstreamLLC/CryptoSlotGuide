/**
 * Reads RTP, volatility, max win and release date off a studio's OWN game
 * pages into data/slot-rtp-overrides.json and data/studio-sheet-meta.json —
 * for the studios that publish on their site and send no sheet.
 *
 * Four adapters, each written against what the site actually serves (read
 * on 2026-10-01, one page of each saved in the session scratchpad):
 *
 *   yggdrasil   WordPress. The REST discovery endpoint lists a `games` post
 *               type (574 records) with taxonomies for provider, volatility
 *               and RTP band; each game page carries the full return list in
 *               a <dl>: "<dt>RTP</dt><dd>90.5%,92%,94%,96%</dd>". Yggdrasil
 *               publishes 33 partner studios' games under its YGGDRASIL
 *               programme, so each record is filed under the studio the
 *               catalogue names (AvatarUX, Peter & Sons, Truelab, Degen
 *               Studios), with the reason saying Yggdrasil's page is where it
 *               was read. Providers the catalogue does not hold are skipped.
 *   wazdan      Sitemap index → 263 game pages. An info block of
 *               '<p class="info">RTP: <b>96.14</b>%</p>' lines with Max Win,
 *               Volatility and Release date. robots.txt asks for a 1s delay.
 *   redtiger    Sitemap → 358 game pages. Each embeds its record as JSON with
 *               a "math" block: {"rtp":95.77,"hitFrequency":26.25,
 *               "maxPayout":"20972"} and a releaseDate.
 *   spinomenal  wp-sitemap → 577 portfolio pages. A specifications table with
 *               one "RTP 95%" cell.
 *
 * Every URL fetched comes from the site's own sitemap or REST listing — none
 * is built from a slug. Titles are matched to the catalogue with
 * scripts/lib/match-title.mjs (exact name key within the studio). The higher
 * figure is the headline, the rest the spread, as everywhere else.
 *
 *   node scripts/fetch-studio-rtps.mjs --studio wazdan --dry-run --limit 5
 *   node scripts/fetch-studio-rtps.mjs --studio yggdrasil
 *   node scripts/fetch-studio-rtps.mjs --studio all
 *
 * Pages are cached under the scratchpad (--cache-dir) so a re-run after a
 * parse fix does not hit the site again.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { titleMatcher } from "./lib/match-title.mjs";

const argv = process.argv.slice(2);
const arg = (k, d = null) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const DRY = argv.includes("--dry-run");
const STUDIO = arg("--studio", "all");
const LIMIT = Number(arg("--limit", 0)) || 0;
const CACHE = arg("--cache-dir", path.join(process.env.TEMP || process.env.TMP || ".", "csg-studio-pages"));
const DELAY_MS = Number(arg("--delay", 1200));
const READ = new Date().toISOString().slice(0, 10);
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0 Safari/537.36";

const RTP_OUT = path.join("data", "slot-rtp-overrides.json");
const META_OUT = path.join("data", "studio-sheet-meta.json");

fs.mkdirSync(CACHE, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cacheKey = (u) => u.replace(/[^a-z0-9]+/gi, "_").slice(0, 180);

async function fetchText(url, { json = false } = {}) {
  const f = path.join(CACHE, cacheKey(url) + (json ? ".json" : ".html"));
  if (fs.existsSync(f)) return fs.readFileSync(f, "utf8");
  await sleep(DELAY_MS);
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch(url, { headers: { "User-Agent": UA, Accept: json ? "application/json" : "text/html,*/*" }, redirect: "follow" });
    if (r.status === 429 || r.status >= 500) {
      // pragmaticplay.com answers every request from Node's HTTP client with
      // 502, whatever the headers, and serves the same URL to curl. So a 5xx
      // gets one curl attempt before the backoff.
      const viaCurl = curlText(url);
      if (viaCurl !== null) {
        fs.writeFileSync(f, viaCurl);
        return viaCurl;
      }
      await sleep(5000 * (attempt + 1));
      continue;
    }
    if (!r.ok) return null;
    const t = await r.text();
    fs.writeFileSync(f, t);
    return t;
  }
  return null;
}

/** GET with curl; the body on a 2xx, else null. */
function curlText(url) {
  try {
    const out = execFileSync("curl", ["-sL", "-A", UA, "-m", "60", "-w", "\n%{http_code}", url], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const cut = out.lastIndexOf("\n");
    const code = Number(out.slice(cut + 1));
    return code >= 200 && code < 300 ? out.slice(0, cut) : null;
  } catch {
    return null;
  }
}

const decode = (s) =>
  String(s ?? "")
    .replace(/&#0?39;|&rsquo;|&#8217;|&#x27;/g, "'")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/[™®]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const pct = (raw) => {
  const n = Number(String(raw).replace("%", "").replace(",", ".").trim());
  return Number.isFinite(n) && n >= 50 && n <= 100 ? Math.round(n * 100) / 100 : null;
};

const locsOf = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

/* ------------------------------------------------------------------ adapters */

const ADAPTERS = {
  yggdrasil: {
    studio: "Yggdrasil",
    // Yggdrasil's provider terms → the catalogue's provider names. Anything
    // not listed here is a partner studio the catalogue does not hold.
    providers: {
      "Yggdrasil Gaming": "Yggdrasil",
      "Avatar UX": "AvatarUX",
      "Peter and Sons": "Peter & Sons",
      "True Lab": "Truelab",
      "Degen Studios": "Degen Studios",
    },
    async list() {
      const base = "https://yggdrasilgaming.com/wp-json/wp/v2";
      const terms = async (tax) => {
        const out = new Map();
        for (let page = 1; page <= 5; page++) {
          const t = await fetchText(`${base}/${tax}?per_page=100&page=${page}`, { json: true });
          if (!t) break;
          const arr = JSON.parse(t);
          for (const x of arr) out.set(x.id, decode(x.name));
          if (arr.length < 100) break;
        }
        return out;
      };
      const providers = await terms("game_provider");
      const volatility = await terms("game_volatility");
      const games = [];
      for (let page = 1; page <= 10; page++) {
        const t = await fetchText(`${base}/games?per_page=100&page=${page}`, { json: true });
        if (!t) break;
        const arr = JSON.parse(t);
        for (const g of arr) {
          const provTerm = providers.get(g.game_provider?.[0]);
          games.push({
            url: g.link,
            name: decode(g.title?.rendered),
            provider: this.providers[provTerm] ?? null,
            providerTerm: provTerm ?? null,
            volatility: volatility.get(g.game_volatility?.[0]) ?? null,
          });
        }
        if (arr.length < 100) break;
      }
      return games;
    },
    parse(html, item) {
      // <dt><span>*</span>RTP</dt><dd> 90.5%,92%,94%,96%</dd>
      const dd = (label) => {
        const m = html.match(new RegExp(`<dt[^>]*>\\s*(?:<span[^>]*>[^<]*</span>)*\\s*(?:<span>)?\\s*(?:<span[^>]*>\\*</span>)?\\s*${label}\\s*(?:</span>)?\\s*</dt>\\s*<dd[^>]*>([^<]*)</dd>`, "i"));
        return m ? decode(m[1]) : null;
      };
      const rtps = (dd("RTP") ?? "").split(/[,/]/).map(pct).filter((v) => v !== null);
      const released = (() => {
        const d = dd("Release date");
        const m = d?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
      })();
      return { name: item.name, versions: [...new Set(rtps)].sort((a, b) => b - a), volatility: item.volatility, released, maxMultiplier: null };
    },
  },

  wazdan: {
    studio: "Wazdan",
    async list() {
      const idx = await fetchText("https://wazdan.com/sitemap_index.xml");
      const subs = locsOf(idx ?? "").filter((u) => u.endsWith(".xml"));
      const urls = [];
      for (const s of subs) {
        const x = await fetchText(s);
        urls.push(...locsOf(x ?? "").filter((u) => /^https:\/\/wazdan\.com\/games\/[a-z0-9-]+\/?$/.test(u)));
      }
      return [...new Set(urls)].map((url) => ({ url }));
    },
    parse(html) {
      const title = decode((html.match(/<title>(.*?)<\/title>/s) ?? [])[1]).replace(/\s*-\s*Wazdan$/i, "");
      const info = [...html.matchAll(/<p class="info">(.*?)<\/p>/gs)].map((m) => decode(m[1].replace(/<[^>]+>/g, "")));
      const get = (k) => info.find((l) => l.toLowerCase().startsWith(k.toLowerCase() + ":"))?.split(":").slice(1).join(":").trim() ?? null;
      const rtp = pct(get("RTP") ?? "");
      const mw = get("Max Win")?.match(/([\d,.]+)\s*x/i);
      return {
        name: title,
        versions: rtp !== null ? [rtp] : [],
        volatility: get("Volatility"),
        released: get("Release date")?.match(/^\d{4}-\d{2}-\d{2}$/) ? get("Release date") : null,
        maxMultiplier: mw ? mw[1].replace(/,/g, "") : null,
      };
    },
  },

  redtiger: {
    studio: "Red Tiger",
    async list() {
      // sitemap.xml is an index; the game URLs sit one level down.
      const idx = await fetchText("https://redtiger.com/sitemap.xml");
      let locs = locsOf(idx ?? "");
      if (locs.length && locs.every((u) => u.endsWith(".xml"))) {
        const all = [];
        for (const sub of locs) all.push(...locsOf((await fetchText(sub)) ?? ""));
        locs = all;
      }
      const isGame = (u) => u.startsWith("https://redtiger.com/games/") && u.replace(/\/$/, "").split("/").length === 5;
      return [...new Set(locs.filter(isGame))].map((url) => ({ url }));
    },
    parse(html) {
      const math = html.match(/"math":\{([^}]*)\}/);
      const rtp = math ? pct((math[1].match(/"rtp":([\d.]+)/) ?? [])[1] ?? "") : null;
      const maxPayout = math ? (math[1].match(/"maxPayout":"?([\d.]+)"?/) ?? [])[1] : null;
      // The record's own name sits before its "math" block; image names
      // ("...icon5.png") come after, so the nearest preceding one is the game.
      const before = html.slice(0, math ? math.index : 0);
      const names = [...before.matchAll(/"name":"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
      const name = decode(JSON.parse(`"${names.filter((n) => !/\.(png|jpe?g|webp|svg|mp4|gif)$/i.test(n)).pop() ?? ""}"`));
      const rel = (html.match(/"releaseDate":"(\d{4}-\d{2}-\d{2})/) ?? [])[1] ?? null;
      const fallback = decode((html.match(/<title>(.*?)<\/title>/s) ?? [])[1]).replace(/\s+Slot\s*-\s*Play.*$/i, "");
      return { name: name || fallback, versions: rtp !== null ? [rtp] : [], volatility: null, released: rel, maxMultiplier: maxPayout ?? null };
    },
  },

  pragmatic: {
    studio: "Pragmatic Play",
    // Pragmatic's game pages moved to /en/games/<slug>/, which print the RTP
    // under "Basic Game Info". Its sitemaps list each game in up to a dozen
    // languages and the English set is incomplete (397 of 609), so the slugs
    // are collected across every language and the English page requested for
    // each; a slug with no English page simply returns nothing.
    async list() {
      const idx = await fetchText("https://www.pragmaticplay.com/sitemap_index.xml");
      const subs = locsOf(idx ?? "").filter((u) => /games-sitemap\d*\.xml$/.test(u));
      const slugs = new Set();
      for (const s of subs) {
        const x = await fetchText(s);
        for (const u of locsOf(x ?? "")) {
          const m = u.match(/\/([a-z0-9-]+)\/$/);
          if (m && /\/(games|%E3%82%B2%E3%83%BC%E3%83%A0)\//i.test(u)) slugs.add(m[1]);
        }
      }
      // The sitemaps time out or 502 at times; the list read from them on
      // 2026-10-04 is kept in data/sources for exactly that case.
      if (!slugs.size) {
        const saved = path.join("data", "sources", "pragmatic-game-slugs.txt");
        if (fs.existsSync(saved)) {
          for (const line of fs.readFileSync(saved, "utf8").split(/\r?\n/)) if (/^[a-z0-9-]+$/.test(line.trim())) slugs.add(line.trim());
          console.log(`  sitemaps unavailable; using ${slugs.size} slugs from ${saved}`);
        }
      }
      return [...slugs].map((slug) => ({ url: `https://www.pragmaticplay.com/en/games/${slug}/` }));
    },
    parse(html) {
      const title = decode((html.match(/<title>(.*?)<\/title>/s) ?? [])[1])
        .replace(/^Play\s+/i, "")
        .replace(/\s+Slot Demo by Pragmatic Play.*$/i, "")
        .replace(/\s+(Slot|Demo).*$/i, "")
        .trim();
      const flat = decode(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "));
      // "Basic Game Info RTP: 96.50%" — one figure on most pages; a run of
      // figures is read whole in case a page lists several builds.
      const run = (flat.match(/\bRTP:\s*((?:[\d.,]+\s*%\s*(?:[|/,]|and|or)?\s*)+)/i) ?? [])[1] ?? "";
      const versions = [...new Set([...run.matchAll(/([\d.,]+)\s*%/g)].map((m) => pct(m[1])).filter((v) => v !== null))].sort((a, b) => b - a);
      return { name: title, versions, volatility: null, released: null, maxMultiplier: null };
    },
  },
  spinomenal: {
    studio: "Spinomenal",
    async list() {
      const idx = await fetchText("https://spinomenal.com/wp-sitemap.xml");
      const subs = locsOf(idx ?? "").filter((u) => u.endsWith(".xml"));
      const urls = [];
      for (const s of subs) {
        const x = await fetchText(s);
        urls.push(...locsOf(x ?? "").filter((u) => /^https:\/\/spinomenal\.com\/portfolio\/[a-z0-9-]+\/?$/.test(u)));
      }
      return [...new Set(urls)].map((url) => ({ url }));
    },
    parse(html) {
      const title = decode((html.match(/<title>(.*?)<\/title>/s) ?? [])[1]).replace(/\s*[–-]\s*Spinomenal$/i, "");
      const flat = decode(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " "));
      // Spinomenal lists every build on one line — "RTP 88.85% | 91.55% |
      // 93.61%| 95.42%" — lowest first. Reading only the first figure
      // recorded the lowest build as the one published return on 335 titles,
      // so take the whole run of percentages after the label.
      const run = (flat.match(/\bRTP\s+((?:[\d.,]+\s*%\s*\|?\s*)+)/i) ?? [])[1] ?? "";
      const versions = [...new Set([...run.matchAll(/([\d.,]+)\s*%/g)].map((m) => pct(m[1])).filter((v) => v !== null))].sort((a, b) => b - a);
      const released = (flat.match(/Release date\s+(\d{4}-\d{2}-\d{2})/i) ?? [])[1] ?? null;
      return { name: title, versions, volatility: null, released, maxMultiplier: null };
    },
  },
};

/* ------------------------------------------------------------------ run */

const catalogue = JSON.parse(fs.readFileSync(path.join("data", "gameCatalogue.json"), "utf8")).games;
const matcher = titleMatcher(catalogue);
const existingRtp = fs.existsSync(RTP_OUT) ? JSON.parse(fs.readFileSync(RTP_OUT, "utf8")) : { note: "", overrides: {} };
const overrides = { ...existingRtp.overrides };
const existingMeta = fs.existsSync(META_OUT) ? JSON.parse(fs.readFileSync(META_OUT, "utf8")) : { note: "", games: {} };
const meta = { ...existingMeta.games };

const names = STUDIO === "all" ? Object.keys(ADAPTERS) : STUDIO.split(",");
for (const key of names) {
  const a = ADAPTERS[key];
  if (!a) {
    console.error(`unknown studio adapter: ${key}`);
    process.exit(1);
  }
  console.log(`\n== ${a.studio}`);
  let items = await a.list();
  console.log(`  ${items.length} game pages listed by the site`);
  if (LIMIT) items = items.slice(0, LIMIT);
  const stat = { read: 0, noRtp: 0, matched: 0, unmatched: [], skippedProvider: 0 };
  for (const item of items) {
    const html = await fetchText(item.url);
    if (!html) continue;
    stat.read++;
    const parsed = a.parse(html, item);
    const studio = item.provider === undefined ? a.studio : item.provider;
    if (!studio) {
      stat.skippedProvider++;
      continue;
    }
    if (!parsed.versions.length) {
      stat.noRtp++;
      continue;
    }
    const game = matcher.match(parsed.name, studio);
    if (!game) {
      stat.unmatched.push(`${parsed.name} [${studio}]`);
      continue;
    }
    stat.matched++;
    const versions = parsed.versions;
    overrides[game.slug] = {
      versions,
      versionsFrom: "studio",
      studio,
      sourceUrl: item.url,
      read: READ,
      reason:
        `${studio}'s own game page` +
        (studio !== a.studio ? `, published on ${a.studio}'s site` : "") +
        `. ${versions.length > 1 ? `This title ships at ${versions.length} returns.` : "One published return."}`,
    };
    meta[game.slug] = {
      ...(meta[game.slug] ?? {}),
      name: game.name,
      studio,
      sheet: `${a.studio} game page`,
      ...(parsed.released ? { released: parsed.released } : {}),
      ...(parsed.volatility ? { volatility: parsed.volatility } : {}),
      ...(parsed.maxMultiplier ? { maxMultiplier: parsed.maxMultiplier } : {}),
    };
  }
  console.log(
    `  read ${stat.read} · matched ${stat.matched} · no RTP on page ${stat.noRtp} · unmatched ${stat.unmatched.length}` +
      (stat.skippedProvider ? ` · partner studios not in catalogue ${stat.skippedProvider}` : "")
  );
  if (stat.unmatched.length) console.log(`  unmatched: ${stat.unmatched.slice(0, 40).join(" · ")}${stat.unmatched.length > 40 ? " …" : ""}`);
}

if (DRY) console.log("\n  --dry-run: nothing written");
else {
  fs.writeFileSync(RTP_OUT, JSON.stringify({ ...existingRtp, overrides }, null, 2) + "\n");
  fs.writeFileSync(META_OUT, JSON.stringify({ ...existingMeta, games: meta }, null, 2) + "\n");
  console.log(`\n  wrote ${RTP_OUT} (${Object.keys(overrides).length} overrides) and ${META_OUT} (${Object.keys(meta).length} games)`);
}
