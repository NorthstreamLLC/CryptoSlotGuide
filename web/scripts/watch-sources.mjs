/**
 * Detects when a source page changes underneath a fact we publish.
 *
 * It does NOT edit any fact. It tells a human which sources moved, so the
 * re-check is aimed instead of being a blind sweep of 1,900 facts. Auto-editing
 * a published claim from a scraped diff is how you end up publishing a
 * navigation change as a bonus change.
 *
 * How it decides something changed
 * --------------------------------
 * Raw HTML is useless for this: a build hash, a CSRF token or a rotating hero
 * image changes every fetch and would report all 103 domains as changed every
 * week. So each page is reduced to its visible text with scripts, styles and
 * markup stripped, collapsed whitespace, and digits preserved (the digits are
 * usually the fact). That text is hashed, and a hash is compared against the
 * baseline in data/source-baseline.json.
 *
 * Reachability is measured, not assumed — see audit-source-reachability.mjs.
 * Of 103 source domains, 69 answer a plain fetch, 9 return a JS-only shell and
 * 25 block it (mostly Cloudflare 403). Operator help centres are readable where
 * the marketing domain is not, so where a fact cites both, the help-centre URL
 * is the one worth watching. Blocked hosts are reported as "unreadable" rather
 * than silently counted as unchanged, because an unchecked source that looks
 * checked is worse than an obvious gap.
 *
 * Usage:
 *   node scripts/watch-sources.mjs                 # report, exit 1 on changes
 *   node scripts/watch-sources.mjs --update        # accept current state as the baseline
 *   node scripts/watch-sources.mjs --email         # also send the report (needs SENDGRID_API_KEY)
 *   node scripts/watch-sources.mjs --limit 20      # sample, for a quick local run
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(web, "data");
const BASELINE = path.join(DATA, "source-baseline.json");

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : process.argv[i + 1];
};
const UPDATE = process.argv.includes("--update");
const EMAIL = process.argv.includes("--email");
const LIMIT = Number(arg("--limit") ?? 0);
const CONCURRENCY = 6;

/** Every source URL we cite, with the facts that depend on it. */
function sources() {
  const map = new Map();
  for (const file of fs.readdirSync(DATA).filter((f) => f.endsWith(".json") && f !== "source-baseline.json")) {
    let json;
    try {
      json = JSON.parse(fs.readFileSync(path.join(DATA, file), "utf8"));
    } catch {
      continue;
    }
    walk(json, { file, owner: null });
  }
  return map;

  function walk(node, ctx) {
    if (Array.isArray(node)) return node.forEach((n) => walk(n, ctx));
    if (!node || typeof node !== "object") return;
    const next = { ...ctx, owner: node.operatorSlug ?? node.slug ?? ctx.owner };
    const url = typeof node.sourceUrl === "string" ? node.sourceUrl : null;
    if (url && /^https?:/.test(url)) {
      const e = map.get(url) ?? { url, facts: [] };
      e.facts.push({ owner: next.owner, label: node.label ?? node.title ?? "(unlabelled)", file: ctx.file });
      map.set(url, e);
    }
    for (const v of Object.values(node)) walk(v, next);
  }
}

/**
 * The comparable text of a page. Everything that changes without the meaning
 * changing has to come out here, or every run reports everything.
 */
function extract(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    // Cache-busting ids and hashes that ride along in visible text.
    .replace(/\b[0-9a-f]{16,}\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const hash = (s) => crypto.createHash("sha256").update(s).digest("hex").slice(0, 16);

const CHALLENGE = /just a moment|cf-browser-verification|enable javascript and cookies|attention required|access denied/i;

async function check(url) {
  try {
    const r = await fetch(url, {
      signal: AbortSignal.timeout(20000),
      redirect: "follow",
      headers: { "user-agent": "Mozilla/5.0 (compatible; CryptoSlotGuide-freshness/1.0; +https://cryptoslotguide.com)" },
    });
    if (!r.ok) return { state: "unreadable", why: `HTTP ${r.status}` };
    const body = await r.text();
    if (CHALLENGE.test(body)) return { state: "unreadable", why: "bot challenge" };
    const text = extract(body);
    // A JS-only shell yields almost no text; treat it as unreadable rather than
    // hashing an empty string and calling it stable forever.
    if (text.length < 800) return { state: "unreadable", why: "JS-only shell" };
    return { state: "ok", hash: hash(text), length: text.length };
  } catch (e) {
    return { state: "unreadable", why: e.name === "TimeoutError" ? "timeout" : e.message.slice(0, 60) };
  }
}

const baseline = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, "utf8")) : { checked: null, sources: {} };
const all = [...sources().values()];
const list = LIMIT ? all.slice(0, LIMIT) : all;

const changed = [];
const unreadable = [];
const fresh = [];
const next = {};

for (let i = 0; i < list.length; i += CONCURRENCY) {
  await Promise.all(
    list.slice(i, i + CONCURRENCY).map(async (s) => {
      const r = await check(s.url);
      const prev = baseline.sources[s.url];
      if (r.state === "unreadable") {
        unreadable.push({ ...s, why: r.why });
        // Keep the old hash: an unreadable fetch is not evidence the page changed.
        if (prev) next[s.url] = prev;
        return;
      }
      next[s.url] = { hash: r.hash, length: r.length, seen: new Date().toISOString().slice(0, 10) };
      if (!prev) fresh.push(s);
      else if (prev.hash !== r.hash) changed.push({ ...s, from: prev.hash, to: r.hash, delta: r.length - (prev.length ?? r.length), since: prev.seen });
    })
  );
  process.stderr.write(`  ${Math.min(i + CONCURRENCY, list.length)}/${list.length}\r`);
}

const report = buildReport();
console.log(report);

if (UPDATE) {
  fs.writeFileSync(BASELINE, JSON.stringify({ checked: new Date().toISOString().slice(0, 10), sources: next }, null, 2) + "\n");
  console.log(`\nbaseline updated — ${Object.keys(next).length} sources`);
}

if (EMAIL) await sendEmail(report);

process.exit(changed.length ? 1 : 0);

function buildReport() {
  const L = [];
  L.push(`Source watch — ${new Date().toISOString().slice(0, 10)}`);
  L.push(`${list.length} sources · ${changed.length} changed · ${unreadable.length} unreadable · ${fresh.length} new`);
  if (baseline.checked) L.push(`previous baseline: ${baseline.checked}`);

  if (changed.length) {
    L.push(`\nCHANGED — re-read these and update the facts that cite them`);
    for (const c of changed) {
      const who = [...new Set(c.facts.map((f) => f.owner).filter(Boolean))].join(", ") || "—";
      const labels = [...new Set(c.facts.map((f) => f.label))].slice(0, 4).join(" · ");
      L.push(`\n  ${c.url}`);
      L.push(`    last seen ${c.since}, text ${c.delta >= 0 ? "+" : ""}${c.delta} chars`);
      L.push(`    ${c.facts.length} fact(s) · ${who}`);
      L.push(`    ${labels}${c.facts.length > 4 ? " …" : ""}`);
    }
  }

  if (unreadable.length) {
    L.push(`\nUNREADABLE (${unreadable.length}) — needs a browser or a human; NOT counted as unchanged`);
    const byWhy = new Map();
    for (const u of unreadable) byWhy.set(u.why, (byWhy.get(u.why) ?? 0) + 1);
    for (const [why, n] of [...byWhy.entries()].sort((a, b) => b[1] - a[1])) L.push(`    ${String(n).padStart(3)}  ${why}`);
  }

  if (fresh.length) L.push(`\nNEW (${fresh.length}) — first time seen, baseline recorded`);
  if (!changed.length && !fresh.length) L.push(`\nNo changes.`);
  return L.join("\n");
}

async function sendEmail(body) {
  const key = process.env.SENDGRID_API_KEY;
  const to = process.env.FRESHNESS_EMAIL_TO;
  const from = process.env.SENDGRID_FROM;
  if (!key || !to || !from) {
    console.error(`\n--email skipped: need SENDGRID_API_KEY, FRESHNESS_EMAIL_TO and SENDGRID_FROM`);
    return;
  }
  const subject = changed.length ? `${changed.length} source${changed.length === 1 ? "" : "s"} changed — CryptoSlotGuide` : `Source watch clean — CryptoSlotGuide`;
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from, name: "CryptoSlotGuide" },
      subject,
      content: [{ type: "text/plain", value: body }],
    }),
  });
  // 202 is SendGrid's accepted-for-delivery response; anything else is a real failure.
  console.error(res.status === 202 ? `\nemailed ${to}` : `\nemail failed: HTTP ${res.status} ${await res.text()}`);
}
