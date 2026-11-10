/**
 * Core of scripts/import-articles.mjs: validation, source ownership, hashing,
 * date rules and the import plan for research-agent input. No git operations
 * beyond read-only checks; nothing here commits, pushes or publishes.
 *
 * Inputs (classified by shape):
 *   article          schemaVersion "1.0" package → branch-only draft in data/guideRows.json + data/guideBodies.json
 *   article_private  sidecar with editorialNotes / x for an article (matched by storyId + revision)
 *   casino_change    change report → private review record only; site data is never edited
 *   research_lead    unverified lead → private review output only
 *
 * See docs/article-import.md for the contract and the reviewer's workflow.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

// ------------------------------------------------------------------ constants

export const CATEGORIES = ["News", "Law", "Crypto", "Bonuses", "Slots", "Betting"];
export const CONTENT_TYPES = ["news", "analysis", "opinion"];
export const TOPICS = ["welcome_offer", "withdrawals", "kyc", "licence", "security", "promo_code", "coins", "corporate"];
const TINTS = { News: "#6FB7FF", Law: "#9AAE5E", Crypto: "#F7931A", Bonuses: "#FFC531", Slots: "#FF7EB6", Betting: "#57E39A" };
/** Owner kinds that count as primary evidence for a website claim. */
const PRIMARY_KINDS = new Set(["casino", "regulator", "court", "government", "studio"]);
/** Topics a regulator, court or government document can evidence for a casino change. */
const OFFICIAL_TOPICS = new Set(["licence", "security", "corporate"]);
export const DATE_ZONE = "America/New_York";

const STORY_ID = /^[a-z0-9][a-z0-9-]{2,80}$/;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_TS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})$/;

const ARTICLE_KEYS = new Set(["schemaVersion", "storyId", "revision", "status", "contentType", "slug", "headline", "excerpt", "keyPoints", "body", "category", "tags", "cover", "readMins", "dates", "sources", "verification", "next", "noPartners", "editorialNotes", "x"]);
const ARTICLE_REQUIRED = ["schemaVersion", "storyId", "revision", "status", "contentType", "slug", "headline", "excerpt", "keyPoints", "body", "category", "dates", "sources", "verification"];
const PRIVATE_FIELDS = ["editorialNotes", "x"];
const SIDECAR_KEYS = new Set(["type", "storyId", "revision", "editorialNotes", "x"]);
const CHANGE_KEYS = new Set(["type", "casino", "topic", "summary", "before", "after_quote", "source_url", "source_published", "event_date", "verified_at", "confidence"]);
const CHANGE_REQUIRED = ["type", "casino", "topic", "summary", "after_quote", "source_url", "source_published", "event_date", "verified_at", "confidence"];
const LEAD_KEYS = new Set(["type", "storyId", "verification", "editorialNotes", "discovered"]);

// ------------------------------------------------------------------ small helpers

/** JSON with keys sorted at every level: the basis of every hash here. */
export function canonical(v) {
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  if (v && typeof v === "object") return `{${Object.keys(v).sort().filter((k) => v[k] !== undefined).map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(",")}}`;
  return JSON.stringify(v);
}
export const hash = (v) => crypto.createHash("sha256").update(canonical(v)).digest("hex").slice(0, 32);
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const str = (v, min = 1, max = 100000) => typeof v === "string" && v.trim().length >= min && v.length <= max;
export const isIsoDate = (v) => typeof v === "string" && ISO_DATE.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) && new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v;
export const isTimestamp = (v) => typeof v === "string" && ISO_TS.test(v) && !Number.isNaN(Date.parse(v));
const norm = (s) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim() : s);

/** Calendar date of an instant in America/New_York, as yyyy-mm-dd. */
export function zonedDate(ts, zone = DATE_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(ts));
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** A JSON parse error that can't echo file content (private text could be in it). */
export function parseJsonSafe(text) {
  try {
    return { value: JSON.parse(text) };
  } catch (e) {
    const pos = /position (\d+)/.exec(String(e.message))?.[1];
    return { error: `not valid JSON${pos ? ` (near character ${pos})` : ""}` };
  }
}

function unknownKeys(obj, allowed, where, errors) {
  for (const k of Object.keys(obj)) if (!allowed.has(k)) errors.push(`${where}${k}: unknown field`);
}

// ------------------------------------------------------------------ site data

/** Everything the validator needs from the site, read once. */
export function loadSite(ctx) {
  const data = (f) => JSON.parse(fs.readFileSync(path.join(ctx.webDir, "data", f), "utf8"));
  const ops = data("ops.json");
  const opSlugs = new Set((Array.isArray(ops) ? ops : ops.ops).map((o) => o.slug));
  const specSheets = data("casinoSpecSheets.json");
  const registry = data("source-registry.json");
  const legacy = data("legacy.json");
  const guideRows = data("guideRows.json");
  const guideBodies = data("guideBodies.json");
  const libText = (f) => fs.readFileSync(path.join(ctx.libDir, f), "utf8");
  const months = [...libText("news.ts").matchAll(/month:\s*"(\d{4}-\d{2})"/g)].map((m) => m[1]);
  const skip = new Set([...(/const SKIP = new Set\(\[([^\]]*)\]\)/.exec(libText("legacy.ts"))?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]));
  return {
    opSlugs,
    specSheets,
    registry,
    guideRows,
    guideBodies,
    routes: routeTable(ctx.appDir),
    families: {
      casino: opSlugs,
      guide: new Set(guideRows.map((r) => r.slug)),
      month: new Set(months),
      legacy: new Set(legacy.items.map((i) => i.slug).filter((s) => !skip.has(s))),
      category: new Set(legacy.categories.filter((c) => c.count > 0).map((c) => c.slug)),
    },
    owners: buildOwners(registry, specSheets, opSlugs),
    ledger: readLedger(ctx),
  };
}

/** Page routes from app/**\/page.tsx, as segment lists ("[slug]" kept for dynamic ones). */
export function routeTable(appDir) {
  const out = [];
  const walk = (dir, segs) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (e.name.startsWith("_") || e.name.startsWith("@")) continue;
        walk(path.join(dir, e.name), /^\(.*\)$/.test(e.name) ? segs : [...segs, e.name]);
      } else if (e.name === "page.tsx" || e.name === "page.ts") out.push(segs);
    }
  };
  walk(appDir, []);
  return out;
}

/** Dynamic segments we can check against real slugs; anything else isn't accepted in "next". */
const DYNAMIC = {
  "casinos/[slug]": "casino",
  "casinos/[slug]/facts": "casino",
  "guides/[slug]": "guide",
  "news/[month]": "month",
  "[legacy]": "legacy",
  "category/[slug]": "category",
};

/** Is this a page on the site? Returns null when it is, or the reason it isn't. */
export function checkInternalPath(href, site, extraGuides = new Set()) {
  if (typeof href !== "string" || !href.startsWith("/") || href.startsWith("//") || href.includes("\\")) return "must be a site path starting with a single /";
  if (/[\s?]/.test(href)) return "query strings and spaces aren't allowed";
  const [pathPart, frag] = href.split("#");
  if (frag !== undefined && !/^[a-z0-9-]{1,60}$/i.test(frag)) return "invalid #fragment";
  const segs = pathPart.replace(/\/+$/, "").split("/").filter(Boolean);
  if (segs.some((s) => s === "." || s === ".." || !/^[a-z0-9-]+$/.test(s))) return "invalid path segment";
  for (const route of site.routes) {
    if (route.length !== segs.length) continue;
    const key = route.join("/");
    if (route.every((r, i) => !r.startsWith("[") && r === segs[i])) return null;
    if (route.some((r) => r.startsWith("["))) {
      if (!route.every((r, i) => r.startsWith("[") || r === segs[i])) continue;
      const fam = DYNAMIC[key];
      if (!fam) continue;
      const slug = segs[route.findIndex((r) => r.startsWith("["))];
      const known = fam === "guide" ? site.families.guide.has(slug) || extraGuides.has(slug) : site.families[fam].has(slug);
      if (known) return null;
    }
  }
  return "not a page on the site (or a route the importer can't check yet)";
}

// ------------------------------------------------------------------ source ownership

const hostMatches = (host, domain) => host === domain || host.endsWith(`.${domain}`);

export function buildOwners(registry, specSheets, opSlugs) {
  const nonCasino = registry.owners.filter((o) => o.kind !== "casino").flatMap((o) => o.domains);
  const blocked = [...registry.discoveryHosts, ...registry.excludedHosts, ...registry.sharedHosts, ...nonCasino];
  const owners = registry.owners.map((o) => ({ ...o, domains: [...o.domains], derived: [] }));
  for (const sheet of specSheets) {
    if (!opSlugs.has(sheet.operatorSlug)) continue;
    const hosts = new Set();
    for (const g of sheet.groups) for (const f of g.facts) {
      if (!f.sourceUrl) continue;
      try {
        const h = new URL(f.sourceUrl).hostname.toLowerCase().replace(/^www\./, "");
        if (!blocked.some((b) => hostMatches(h, b))) hosts.add(h);
      } catch {
        /* a malformed stored URL just isn't a mapping */
      }
    }
    let o = owners.find((x) => x.kind === "casino" && x.id === sheet.operatorSlug);
    if (!o) owners.push((o = { id: sheet.operatorSlug, kind: "casino", name: sheet.operatorSlug, domains: [], sharedPaths: [], derived: [] }));
    for (const h of hosts) if (!o.domains.includes(h)) {
      o.domains.push(h);
      o.derived.push(h);
    }
  }
  return { owners, registry };
}

/**
 * Who owns a source URL: { kind, id } or { kind: "unknown" | "discovery" | "invalid", reason }.
 * Shared hosts (help-centre platforms, CDNs) only match through a reviewed path mapping.
 */
export function sourceOwner(url, { owners, registry }) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return { kind: "invalid", reason: "not a valid URL" };
  }
  if (u.protocol !== "https:") return { kind: "invalid", reason: "must be https" };
  if (u.username || u.password) return { kind: "invalid", reason: "credentials in the URL aren't allowed" };
  if (u.port) return { kind: "invalid", reason: "non-standard ports aren't allowed" };
  const host = u.hostname.toLowerCase().replace(/\.$/, "").replace(/^www\./, "");
  if (/^[\d.]+$/.test(host) || host.includes(":")) return { kind: "invalid", reason: "IP-address hosts aren't allowed" };
  if (registry.discoveryHosts.some((d) => hostMatches(host, d))) return { kind: "discovery", reason: `${host} is a discovery source, not evidence` };
  if (registry.sharedHosts.some((d) => hostMatches(host, d))) {
    const first = u.pathname.split("/").filter(Boolean)[0] ?? "";
    const hit = owners.filter((o) => o.sharedPaths?.some((s) => s.host === host && s.prefix === first));
    if (hit.length === 1) return { kind: hit[0].kind, id: hit[0].id };
    return { kind: "unknown", reason: `${host} is shared; /${first} has no reviewed owner` };
  }
  if (registry.excludedHosts.some((d) => hostMatches(host, d))) return { kind: "unknown", reason: `${host} is excluded until its owner is reviewed` };
  const hit = owners.filter((o) => o.domains.some((d) => hostMatches(host, d)));
  if (hit.length === 1) return { kind: hit[0].kind, id: hit[0].id };
  if (hit.length > 1) return { kind: "unknown", reason: `${host} matches more than one owner` };
  return { kind: "unknown", reason: `${host} has no reviewed owner` };
}

// ------------------------------------------------------------------ text rules

/** Errors for one public text field. The text itself is public, so a short echo is fine. */
function proseErrors(v, where, { headings = false } = {}) {
  const e = [];
  if (/[\r\n]/.test(v)) e.push(`${where}: one paragraph per string, no line breaks`);
  if (/<\/?[a-z][^>]*>|<!--|&lt;|&#\d+;/i.test(v)) e.push(`${where}: HTML isn't allowed`);
  if (/!?\[[^\]]*\]\([^)]*\)/.test(v)) e.push(`${where}: Markdown links and images aren't supported; use sources or next`);
  if (/https?:\/\/|\bwww\.[a-z0-9-]+\./i.test(v)) e.push(`${where}: URLs belong in sources (evidence) or next (site links)`);
  if (/\{[^{}]*\}|\{\{|\}\}/.test(v)) e.push(`${where}: curly braces are site placeholders; rephrase`);
  if (/^\s*([-*+•]|\d+[.)])\s+/.test(v)) e.push(`${where}: lists aren't supported; write a sentence or paragraph`);
  if ((v.match(/\*\*/g) || []).length % 2) e.push(`${where}: unbalanced **bold**`);
  if (/(^|[^*])\*(?!\*)[^*]+\*(?!\*)/.test(v) || /(^|\s)_[^_]+_(\s|$)/.test(v)) e.push(`${where}: only **bold** is supported`);
  if (/^\s*#/.test(v) && !(headings && /^## \S/.test(v))) e.push(`${where}: ${headings ? 'subheadings start with "## " (one level)' : "headings aren't allowed here"}`);
  if (/`/.test(v)) e.push(`${where}: code formatting isn't supported`);
  return e;
}

/** Characterising words outside quotation marks: a reviewer warning, never an automatic rejection. */
function characterising(v) {
  const outside = v.replace(/"[^"]*"|“[^”]*”|‘[^’]*’/g, " ");
  return /\b(scam|scammers?|rigged|illegal|unlicen[cs]ed|fraud(ulent)?)\b/i.test(outside);
}

// ------------------------------------------------------------------ validators

export function validateArticle(p, site) {
  const errors = [];
  const warnings = [];
  if (!isObj(p)) return { errors: ["package must be a JSON object"], warnings };
  unknownKeys(p, ARTICLE_KEYS, "", errors);
  for (const k of ARTICLE_REQUIRED) if (p[k] === undefined) errors.push(`${k}: required`);

  if (p.schemaVersion !== undefined && p.schemaVersion !== "1.0") errors.push(`schemaVersion must be "1.0"`);
  if (p.storyId !== undefined && !(typeof p.storyId === "string" && STORY_ID.test(p.storyId))) errors.push("storyId: lowercase letters, digits and hyphens, 3–81 characters");
  if (p.revision !== undefined && !(Number.isInteger(p.revision) && p.revision >= 1)) errors.push("revision: a whole number from 1");
  if (p.status !== undefined && p.status !== "draft") errors.push(`status must be exactly "draft"; a person publishes by merging`);
  if (p.contentType !== undefined && !CONTENT_TYPES.includes(p.contentType)) errors.push(`contentType: one of ${CONTENT_TYPES.join(", ")}`);
  if (p.slug !== undefined && !(typeof p.slug === "string" && SLUG.test(p.slug) && p.slug.length <= 90)) errors.push("slug: lowercase words joined by hyphens, up to 90 characters");
  if (p.category !== undefined && !CATEGORIES.includes(p.category)) errors.push(`category: one of ${CATEGORIES.join(", ")}`);

  if (p.headline !== undefined) errors.push(...(str(p.headline, 10, 120) ? proseErrors(p.headline, "headline") : ["headline: 10–120 characters"]));
  if (p.excerpt !== undefined) errors.push(...(str(p.excerpt, 40, 400) ? proseErrors(p.excerpt, "excerpt") : ["excerpt: 40–400 characters"]));
  if (p.keyPoints !== undefined) {
    if (!(Array.isArray(p.keyPoints) && p.keyPoints.length >= 1 && p.keyPoints.length <= 6)) errors.push("keyPoints: 1–6 strings");
    else p.keyPoints.forEach((k, i) => (str(k, 10, 400) ? errors.push(...proseErrors(k, `keyPoints[${i}]`)) : errors.push(`keyPoints[${i}]: 10–400 characters`)));
  }
  if (p.body !== undefined) {
    if (!(Array.isArray(p.body) && p.body.length >= 2)) errors.push("body: at least 2 strings");
    else {
      p.body.forEach((b, i) => (str(b, 2, 4000) ? errors.push(...proseErrors(b, `body[${i}]`, { headings: true })) : errors.push(`body[${i}]: 2–4,000 characters`)));
      if (typeof p.body[0] === "string" && p.body[0].startsWith("## ")) warnings.push("body opens with a subheading; start with a paragraph");
    }
  }
  for (const [field, v] of [["headline", p.headline], ["excerpt", p.excerpt], ...(Array.isArray(p.keyPoints) ? p.keyPoints.map((k, i) => [`keyPoints[${i}]`, k]) : []), ...(Array.isArray(p.body) ? p.body.map((b, i) => [`body[${i}]`, b]) : [])]) {
    if (typeof v === "string" && characterising(v)) warnings.push(`${field}: characterising word outside quotation marks; check it is attributed, dated source wording`);
  }

  if (p.tags !== undefined && !(Array.isArray(p.tags) && p.tags.length <= 12 && p.tags.every((t) => typeof t === "string" && /^[a-z0-9][a-z0-9-]{0,40}$/.test(t)))) errors.push("tags: up to 12 lowercase-hyphenated strings");
  if (p.cover !== undefined) {
    if (!isObj(p.cover)) errors.push("cover: object");
    else {
      unknownKeys(p.cover, new Set(["mono", "tint"]), "cover.", errors);
      if (p.cover.mono !== undefined && !/^[A-Za-z0-9]{1,3}$/.test(p.cover.mono)) errors.push("cover.mono: 1–3 letters or digits");
      if (p.cover.tint !== undefined && !/^#[0-9A-Fa-f]{6}$/.test(p.cover.tint)) errors.push("cover.tint: #RRGGBB");
    }
  }
  if (p.readMins !== undefined && !(Number.isInteger(p.readMins) && p.readMins >= 1 && p.readMins <= 60)) errors.push("readMins: 1–60");
  if (p.noPartners !== undefined && typeof p.noPartners !== "boolean") errors.push("noPartners: true or false");

  if (p.dates !== undefined) {
    if (!isObj(p.dates)) errors.push("dates: object");
    else {
      unknownKeys(p.dates, new Set(["published", "events", "updated"]), "dates.", errors);
      if (!isIsoDate(p.dates.published)) errors.push("dates.published: yyyy-mm-dd");
      if (p.dates.updated !== undefined && !isIsoDate(p.dates.updated)) errors.push("dates.updated: yyyy-mm-dd when given");
      if (!Array.isArray(p.dates.events)) errors.push("dates.events: required (an empty list is fine)");
      else p.dates.events.forEach((ev, i) => {
        if (!isObj(ev)) return errors.push(`dates.events[${i}]: object`);
        unknownKeys(ev, new Set(["what", "date"]), `dates.events[${i}].`, errors);
        if (!str(ev.what, 2, 200)) errors.push(`dates.events[${i}].what: 2–200 characters`);
        if (ev.date !== null && !isIsoDate(ev.date)) errors.push(`dates.events[${i}].date: yyyy-mm-dd or null`);
      });
    }
  }

  if (p.verification !== undefined) {
    if (!isObj(p.verification)) errors.push("verification: object");
    else {
      unknownKeys(p.verification, new Set(["status", "checkedAt", "method"]), "verification.", errors);
      if (p.verification.status !== "verified") errors.push(`verification.status must be "verified"; send unverified material as a research_lead`);
      if (!isTimestamp(p.verification.checkedAt)) errors.push("verification.checkedAt: an ISO timestamp with a time zone");
      if (p.verification.method !== undefined && !str(p.verification.method, 2, 300)) errors.push("verification.method: 2–300 characters when given");
    }
  }

  if (p.sources !== undefined) {
    if (!(Array.isArray(p.sources) && p.sources.length >= 1)) errors.push("sources: at least one");
    else p.sources.forEach((s, i) => {
      const w = `sources[${i}]`;
      if (!isObj(s)) return errors.push(`${w}: object`);
      unknownKeys(s, new Set(["label", "url", "publishedAt", "verifiedAt", "primary"]), `${w}.`, errors);
      if (!str(s.label, 5, 300)) errors.push(`${w}.label: 5–300 characters`);
      else errors.push(...proseErrors(s.label, `${w}.label`).filter((m) => !/curly|bold|only/.test(m)));
      if (s.publishedAt !== undefined && s.publishedAt !== null && !isIsoDate(s.publishedAt)) errors.push(`${w}.publishedAt: yyyy-mm-dd or null`);
      if (!isTimestamp(s.verifiedAt)) errors.push(`${w}.verifiedAt: an ISO timestamp with a time zone`);
      if (s.primary !== true) errors.push(`${w}.primary must be true: discovery-only sources (news, affiliates, social) stay in editorialNotes`);
      const owner = sourceOwner(s.url, site.owners);
      if (owner.kind === "invalid") errors.push(`${w}.url: ${owner.reason}`);
      else if (!PRIMARY_KINDS.has(owner.kind)) errors.push(`${w}.url: review required, ${owner.reason}. Add a reviewed mapping to web/data/source-registry.json if this is a casino, regulator, court, government or studio page`);
    });
  }

  if (p.next !== undefined) {
    if (!Array.isArray(p.next) || p.next.length > 6) errors.push("next: up to 6 links");
    else p.next.forEach((n, i) => {
      if (!isObj(n)) return errors.push(`next[${i}]: object`);
      unknownKeys(n, new Set(["href", "label", "hint"]), `next[${i}].`, errors);
      const why = checkInternalPath(n.href, site, new Set([p.slug]));
      if (why) errors.push(`next[${i}].href: ${why}`);
      if (!str(n.label, 2, 80)) errors.push(`next[${i}].label: 2–80 characters`);
      if (!str(n.hint, 2, 160)) errors.push(`next[${i}].hint: 2–160 characters`);
    });
  }

  errors.push(...validatePrivate(p, ""));
  return { errors, warnings };
}

/** Shape checks on private fields. Messages name fields only, never their content. */
function validatePrivate(o, where) {
  const errors = [];
  if (o.editorialNotes !== undefined && !(typeof o.editorialNotes === "string" && o.editorialNotes.length <= 20000)) errors.push(`${where}editorialNotes: a string up to 20,000 characters`);
  if (o.x !== undefined) {
    if (!isObj(o.x)) errors.push(`${where}x: object`);
    else {
      unknownKeys(o.x, new Set(["post", "thread"]), `${where}x.`, errors);
      if (o.x.post !== undefined && typeof o.x.post !== "string") errors.push(`${where}x.post: string`);
      if (o.x.thread !== undefined && !(Array.isArray(o.x.thread) && o.x.thread.every((t) => typeof t === "string"))) errors.push(`${where}x.thread: list of strings`);
    }
  }
  return errors;
}

export function validateSidecar(s) {
  const errors = [];
  if (!isObj(s)) return ["sidecar must be a JSON object"];
  unknownKeys(s, SIDECAR_KEYS, "", errors);
  if (s.type !== "article_private") errors.push(`type must be "article_private"`);
  if (!(typeof s.storyId === "string" && STORY_ID.test(s.storyId))) errors.push("storyId: required, lowercase letters, digits and hyphens");
  if (!(Number.isInteger(s.revision) && s.revision >= 1)) errors.push("revision: required whole number from 1");
  errors.push(...validatePrivate(s, ""));
  return errors;
}

export function validateLead(l) {
  const errors = [];
  if (!isObj(l)) return ["lead must be a JSON object"];
  unknownKeys(l, LEAD_KEYS, "", errors);
  if (!isObj(l.verification) || l.verification.status !== "unverified") errors.push(`verification.status must be "unverified" for a research_lead`);
  else unknownKeys(l.verification, new Set(["status"]), "verification.", errors);
  if (typeof l.editorialNotes !== "string" || !l.editorialNotes.trim()) errors.push("editorialNotes: required");
  if (l.storyId !== undefined && !(typeof l.storyId === "string" && STORY_ID.test(l.storyId))) errors.push("storyId: lowercase letters, digits and hyphens");
  if (l.discovered !== undefined && !(Array.isArray(l.discovered) && l.discovered.every((u) => typeof u === "string" && u.length < 2000))) errors.push("discovered: list of URLs");
  return errors;
}

export function validateChange(c, site) {
  const errors = [];
  const warnings = [];
  if (!isObj(c)) return { errors: ["report must be a JSON object"], warnings };
  unknownKeys(c, CHANGE_KEYS, "", errors);
  for (const k of CHANGE_REQUIRED) if (!(k in c)) errors.push(`${k}: required${["source_published", "event_date"].includes(k) ? " (null is fine)" : ""}`);
  if (c.type !== "casino_change") errors.push(`type must be "casino_change"`);
  if (typeof c.casino !== "string" || !site.opSlugs.has(c.casino)) errors.push(`casino: must be one of the ${site.opSlugs.size} tracked casino slugs`);
  if (!TOPICS.includes(c.topic)) errors.push(`topic: one of ${TOPICS.join(", ")}`);
  if (!str(c.summary, 10, 600)) errors.push("summary: 10–600 characters");
  if (c.before !== undefined && c.before !== null && !str(c.before, 1, 1000)) errors.push("before: up to 1,000 characters, or leave it out");
  if (!(typeof c.after_quote === "string" && c.after_quote.trim().length >= 1 && c.after_quote.length < 300)) errors.push("after_quote: 1–299 characters");
  for (const k of ["source_published", "event_date"]) if (k in c && c[k] !== null && !isIsoDate(c[k])) errors.push(`${k}: yyyy-mm-dd or null`);
  if (!isTimestamp(c.verified_at)) errors.push("verified_at: an ISO timestamp with a time zone");
  if (!["high", "medium"].includes(c.confidence)) errors.push(`confidence: "high" or "medium"`);
  if (typeof c.source_url === "string") {
    const o = sourceOwner(c.source_url, site.owners);
    const ok = (o.kind === "casino" && o.id === c.casino) || (OFFICIAL_TOPICS.has(c.topic) && ["regulator", "court", "government"].includes(o.kind));
    if (o.kind === "invalid") errors.push(`source_url: ${o.reason}`);
    else if (o.kind === "casino" && o.id !== c.casino) errors.push(`source_url belongs to ${o.id}, not ${c.casino}`);
    else if (!ok) errors.push(`source_url: review required, ${o.reason ?? `a ${o.kind} page can't evidence a ${c.topic} change`}. Add a reviewed mapping to web/data/source-registry.json if this is ${c.casino}'s own page`);
  } else errors.push("source_url: required");
  if (c.confidence === "medium") warnings.push("medium confidence: flagged for human review");
  return { errors, warnings };
}

// ------------------------------------------------------------------ mapping, dates, hashes

/** The public fields of a package, private fields removed: the basis of packageHash. */
export function publicPart(p) {
  const out = { ...p };
  for (const f of PRIVATE_FIELDS) delete out[f];
  return out;
}

/** dates.updated, else verification.checkedAt as a calendar date in America/New_York. */
export function updatedDate(p) {
  return p.dates.updated ?? zonedDate(p.verification.checkedAt);
}

function words(p) {
  return [p.excerpt, ...p.keyPoints, ...p.body].join(" ").split(/\s+/).filter(Boolean).length;
}

/** Map a package to the site's row and body. `published` is the date to keep (original on updates). */
export function toSite(p, slug, published) {
  const row = {
    slug,
    title: p.headline.trim(),
    mono: (p.cover?.mono ?? p.category.slice(0, 2)).toUpperCase(),
    tint: p.cover?.tint ?? TINTS[p.category],
    standfirst: p.excerpt.trim(),
    category: p.category,
    readMins: p.readMins ?? Math.max(2, Math.round(words(p) / 220)),
    updated: updatedDate(p),
  };
  const body = {
    published,
    contentType: p.contentType,
    key: p.keyPoints.map((k) => k.trim()),
    body: p.body.map((b) => b.trim()),
    sources: p.sources.map((s) => ({ label: s.label.trim(), url: s.url })),
    ...(p.next?.length ? { next: p.next.map((n) => ({ href: n.href, label: n.label, hint: n.hint })) } : {}),
    ...(p.noPartners ? { noPartners: true } : {}),
  };
  return { row, body };
}

export const contentHash = (row, body) => hash({ row: row ?? null, body: body ?? null });

/** Deterministic change fingerprint: everything material, not the verification time. */
export function changeFingerprint(c) {
  const rest = { ...c };
  delete rest.verified_at;
  const normed = Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, norm(v)]));
  if (normed.before === undefined) normed.before = null;
  return hash(normed).slice(0, 24);
}

// ------------------------------------------------------------------ ledger

export function readLedger(ctx) {
  const dir = path.join(ctx.webDir, "data", "imports");
  const out = new Map();
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    const rec = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    out.set(rec.storyId, rec);
  }
  return out;
}

// ------------------------------------------------------------------ site-data locations for a change

const TOPIC_FACTS = {
  welcome_offer: [["Bonus terms", ["Standing offer", "Welcome offer", "Wagering", "Wagering rules", "Max bet", "Max cashout", "Minimum deposit", "Expiry", "Game contribution"]]],
  withdrawals: [["Payouts & fees", null]],
  kyc: [["Compliance", ["KYC policy"]]],
  licence: [["Compliance", ["Licence", "Register check", "Company"]]],
  security: [["Compliance", ["Security incident"]]],
  promo_code: [["Bonus terms", ["Welcome offer", "Referral program"]]],
  coins: [["Coins & deposit limits", ["Coins accepted", "Networks", "Deposit limits"]]],
  corporate: [["Compliance", ["Company", "Partners", "Licence"]]],
};
const TOPIC_OPS_FIELDS = { welcome_offer: ["bonus", "bonusShort", "wager", "bonusExpiry"], withdrawals: ["payout", "payoutLabel", "payoutStated"], kyc: ["kyc"], licence: ["licence"], promo_code: ["promoCode", "codePerk", "bonus"], coins: [], security: [], corporate: [] };
const DERIVED_FILES = ["web/lib/fact-articles.ts", "web/lib/versus-analysis.ts", "web/lib/bonus-index.ts", "web/lib/promo-configs.ts", "web/lib/promo-pages.ts"];

/** Where a change would land in site data, with today's stored values. Read-only. */
export function siteLocations(c, site, ctx) {
  const sheet = site.specSheets.find((s) => s.operatorSlug === c.casino);
  const facts = [];
  for (const [group, labels] of TOPIC_FACTS[c.topic] ?? []) {
    const g = sheet?.groups.find((x) => x.title === group);
    for (const f of g?.facts ?? []) if (!labels || labels.includes(f.label)) facts.push({ file: "web/data/casinoSpecSheets.json", group, label: f.label, current: f.value ?? null, sourceUrl: f.sourceUrl ?? null, asOf: f.asOf ?? null });
  }
  const files = DERIVED_FILES.filter((f) => {
    const p = path.join(ctx.root, f);
    return fs.existsSync(p) && fs.readFileSync(p, "utf8").includes(`"${c.casino}"`);
  });
  return { specFacts: facts, opsFields: (TOPIC_OPS_FIELDS[c.topic] ?? []).map((k) => `web/data/ops.json → ${c.casino}.${k}`), mentionedIn: files, note: facts.length ? "Existing stored facts for this topic, for comparison." : "No stored fact for this topic yet; a reviewer decides where it belongs." };
}

// ------------------------------------------------------------------ git (read-only)

export function gitInfo(root) {
  const run = (...a) => execFileSync("git", a, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  return {
    branch() {
      try {
        return run("symbolic-ref", "--quiet", "--short", "HEAD");
      } catch {
        return null; // detached HEAD
      }
    },
    isIgnored(rel) {
      try {
        execFileSync("git", ["check-ignore", "-q", "--no-index", rel], { cwd: root, stdio: "ignore" });
        return true;
      } catch {
        return false;
      }
    },
    trackedUnder(rel) {
      return run("ls-files", "--", rel).split("\n").filter(Boolean);
    },
  };
}

// ------------------------------------------------------------------ the plan

/**
 * Work out every write for a batch, validating everything first.
 * Returns { items, writes, errors }; nothing is written here.
 * `writes` are { file (absolute), content, tracked } entries.
 */
export function plan(inputs, ctx, opts = {}) {
  const site = loadSite(ctx);
  const items = [];
  const errors = [];
  const writes = [];
  const rel = (abs) => path.relative(ctx.root, abs);
  const review = (...p) => {
    const abs = path.resolve(ctx.reviewDir, ...p);
    if (!abs.startsWith(path.resolve(ctx.reviewDir) + path.sep)) throw new Error("unsafe review path");
    return abs;
  };
  const fail = (label, msgs) => {
    items.push({ label, outcome: "rejected", messages: msgs });
    errors.push(...msgs.map((m) => `${label}: ${m}`));
  };

  // 1) Classify.
  const articles = [];
  const sidecars = [];
  for (const inp of inputs) {
    if (inp.error) {
      fail(inp.name, [inp.error]);
      continue;
    }
    const v = inp.value;
    const type = isObj(v) ? v.type : undefined;
    if (type === "casino_change") {
      const it = planChange(inp.name, v, site, ctx, review, writes, fail);
      if (it) items.push(it);
    } else if (type === "research_lead") {
      const it = planLead(inp.name, v, review, writes, fail);
      if (it) items.push(it);
    }
    else if (type === "article_private") sidecars.push(inp);
    else if (isObj(v) && "schemaVersion" in v && type === undefined) articles.push(inp);
    else fail(inp.name, ["unrecognised input: expected an article package, an article_private sidecar, a casino_change or a research_lead"]);
  }

  // 2) Sidecars must each match exactly one article in the batch.
  const sidecarFor = new Map();
  for (const s of sidecars) {
    const errs = validateSidecar(s.value);
    if (errs.length) {
      fail(s.name, errs);
      continue;
    }
    const key = `${s.value.storyId}@${s.value.revision}`;
    if (sidecarFor.has(key)) {
      fail(s.name, ["a second sidecar for the same storyId and revision"]);
      continue;
    }
    if (!articles.some((a) => isObj(a.value) && a.value.storyId === s.value.storyId && a.value.revision === s.value.revision)) {
      fail(s.name, ["no article package with this storyId and revision in the batch"]);
      continue;
    }
    sidecarFor.set(key, s);
  }

  // 3) Articles.
  const batchSlugs = new Map();
  const batchIds = new Map();
  const slugOwner = new Map([...site.ledger.values()].map((r) => [r.slug, r.storyId]));
  for (const a of articles) {
    const p = a.value;
    const label = `${a.name}${typeof p.storyId === "string" ? ` [${p.storyId}]` : ""}`;
    const { errors: errs, warnings } = validateArticle(p, site);
    // Private fields: embedded, sidecar, or both when they agree.
    const sc = sidecarFor.get(`${p.storyId}@${p.revision}`);
    const priv = {};
    for (const f of PRIVATE_FIELDS) {
      const emb = p[f];
      const side = sc?.value[f];
      if (emb !== undefined && side !== undefined && canonical(emb) !== canonical(side)) errs.push(`${f}: the package and its sidecar disagree; send one value`);
      priv[f] = emb ?? side;
    }
    if (errs.length) {
      fail(label, errs);
      continue;
    }
    if (batchIds.has(p.storyId)) {
      fail(label, [`storyId appears twice in this batch`]);
      continue;
    }
    batchIds.set(p.storyId, true);

    const rec = site.ledger.get(p.storyId);
    const pkgHash = hash(publicPart(p));
    const privHash = hash(priv);
    const slug = rec?.slug ?? p.slug;
    const notes = [...warnings];
    if (rec && p.slug !== rec.slug) notes.push(`slug stays "${rec.slug}" (fixed at first import); "${p.slug}" ignored`);
    if (batchSlugs.has(slug) && batchSlugs.get(slug) !== p.storyId) {
      fail(label, [`slug "${slug}" is used by another story in this batch`]);
      continue;
    }
    batchSlugs.set(slug, p.storyId);

    const rowNow = site.guideRows.find((r) => r.slug === slug) ?? null;
    const bodyNow = site.guideBodies[slug] ?? null;
    let published;
    let adopted = false;

    if (!rec) {
      if (slugOwner.has(slug)) {
        fail(label, [`slug "${slug}" belongs to story ${slugOwner.get(slug)}`]);
        continue;
      }
      if (rowNow || bodyNow) {
        if (opts.adopt !== p.storyId) {
          fail(label, [`/guides/${slug} already exists with no import record. To have this story take it over, re-run with --adopt ${p.storyId}`]);
          continue;
        }
        adopted = true;
        published = bodyNow?.published ?? p.dates.published;
        notes.push(`adopting the existing article at /guides/${slug}; its publication date ${published} is kept`);
      } else published = p.dates.published;
    } else {
      if (p.revision < rec.revision) {
        fail(label, [`revision ${p.revision} is older than imported revision ${rec.revision}`]);
        continue;
      }
      if (p.revision === rec.revision) {
        if (pkgHash === rec.packageHash) {
          const privFile = review("articles", p.storyId, `r${p.revision}.json`);
          const privNow = fs.existsSync(privFile) ? hash(pick(JSON.parse(fs.readFileSync(privFile, "utf8")), PRIVATE_FIELDS)) : null;
          if (privNow && privNow !== privHash) {
            fail(label, [`revision ${p.revision} was already imported with different private fields; send a new revision`]);
            continue;
          }
          items.push({ label, outcome: "unchanged", messages: notes });
          continue;
        }
        fail(label, [`revision ${p.revision} was already imported with different content; send revision ${rec.revision + 1}`]);
        continue;
      }
      published = rec.published ?? bodyNow?.published ?? p.dates.published;
    }

    const { row, body } = toSite(p, slug, published);
    const newHash = contentHash(row, body);
    const record = {
      storyId: p.storyId,
      slug,
      revision: p.revision,
      contentType: p.contentType,
      category: p.category,
      tags: p.tags ?? [],
      published,
      updated: row.updated,
      packageHash: pkgHash,
      contentHash: newHash,
      checkedAt: p.verification.checkedAt,
      sources: p.sources.map((s) => ({ url: s.url, publishedAt: s.publishedAt ?? null, verifiedAt: s.verifiedAt })),
      ...(adopted || rec?.adopted ? { adopted: true } : {}),
      note: "Imported as a branch-only draft. Publication is a person merging the branch; this record doesn't track it.",
    };
    const privateRecord = { storyId: p.storyId, revision: p.revision, editorialNotes: priv.editorialNotes ?? null, x: priv.x ?? null, verification: p.verification, events: p.dates.events, sources: p.sources, tags: p.tags ?? [] };

    // A person edited the article since the last import: propose, don't overwrite.
    if (rec && contentHash(rowNow, bodyNow) !== rec.contentHash) {
      writes.push({ file: review("proposals", `${p.storyId}-r${p.revision}.json`), content: json({ storyId: p.storyId, slug, fromRevision: rec.revision, toRevision: p.revision, reason: "the article was changed by hand after the last import", changedFields: diffFields({ row: rowNow, body: bodyNow }, { row, body }), current: { row: rowNow, body: bodyNow }, proposed: { row, body } }), tracked: false });
      writes.push({ file: review("articles", p.storyId, `r${p.revision}.json`), content: json(privateRecord), tracked: false });
      items.push({ label, outcome: "proposal", messages: [...notes, `hand edits found on /guides/${slug}; proposed revision ${p.revision} saved privately for review, guide files untouched`] });
      continue;
    }

    const rows = site.guideRows.slice();
    const i = rows.findIndex((r) => r.slug === slug);
    if (i >= 0) rows[i] = row;
    else rows.unshift(row);
    const bodies = { ...site.guideBodies, [slug]: body };
    site.guideRows = rows;
    site.guideBodies = bodies;
    site.families.guide.add(slug);
    writes.push({ file: review("articles", p.storyId, `r${p.revision}.json`), content: json(privateRecord), tracked: false });
    writes.push({ file: path.join(ctx.webDir, "data", "imports", `${p.storyId}.json`), content: json(record), tracked: true });
    items.push({ label, outcome: rec ? "updated" : adopted ? "adopted" : "created", slug, messages: notes });
  }

  if (items.some((x) => x.outcome === "created" || x.outcome === "updated" || x.outcome === "adopted")) {
    writes.push({ file: path.join(ctx.webDir, "data", "guideRows.json"), content: json(site.guideRows), tracked: true });
    writes.push({ file: path.join(ctx.webDir, "data", "guideBodies.json"), content: json(site.guideBodies), tracked: true });
  }
  return { items, writes: dedupeWrites(writes), errors, rel };
}

function planChange(name, c, site, ctx, review, writes, fail) {
  const label = `${name} [${isObj(c) && typeof c.casino === "string" ? c.casino : "?"} change]`;
  const { errors, warnings } = validateChange(c, site);
  if (errors.length) {
    fail(label, errors);
    return null;
  }
  const fp = changeFingerprint(c);
  const file = review("changes", c.casino, `${fp}.json`);
  const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
  const { verified_at, ...report } = c;
  if (prev) {
    if (prev.verifiedAt.includes(verified_at)) return { label, outcome: "unchanged", messages: ["same report, same check: nothing to update"] };
    const seen = [...prev.verifiedAt, verified_at].sort();
    writes.push({ file, content: json({ ...prev, verifiedAt: seen, firstSeen: seen[0], lastSeen: seen[seen.length - 1], seenCount: seen.length }), tracked: false });
    return { label, outcome: "seen-again", messages: [`already recorded (${fp}); last-seen updated`, ...warnings] };
  }
  const owner = sourceOwner(c.source_url, site.owners);
  writes.push({
    file,
    content: json({
      fingerprint: fp,
      status: "needs_review",
      confidence: c.confidence,
      flags: c.confidence === "medium" ? ["MEDIUM CONFIDENCE: the page may be ambiguous or contradict itself. Confirm on the primary page before changing any site data."] : [],
      report: { ...report, before: report.before ?? null },
      beforeProvided: report.before !== undefined && report.before !== null,
      sourceOwner: owner,
      firstSeen: verified_at,
      lastSeen: verified_at,
      seenCount: 1,
      verifiedAt: [verified_at],
      siteData: siteLocations(c, site, ctx),
      note: "Proposed change for review. The importer edits no site data; a person applies it.",
    }),
    tracked: false,
  });
  return { label, outcome: "recorded", messages: [`review record ${fp}`, ...warnings] };
}

function planLead(name, l, review, writes, fail) {
  const label = `${name} [research lead]`;
  const errs = validateLead(l);
  if (errs.length) {
    fail(label, errs);
    return null;
  }
  const id = hash(l).slice(0, 24);
  const file = review("leads", `${id}.json`);
  if (fs.existsSync(file)) return { label, outcome: "unchanged", messages: [] };
  writes.push({ file, content: json({ leadId: id, ...l, note: "Unverified: never imported into guide data." }), tracked: false });
  return { label, outcome: "recorded", messages: [`private lead ${id}; not imported`] };
}

function pick(o, keys) {
  return Object.fromEntries(keys.map((k) => [k, o[k] ?? undefined]));
}
function diffFields(a, b) {
  const out = [];
  for (const part of ["row", "body"]) {
    const keys = new Set([...Object.keys(a[part] ?? {}), ...Object.keys(b[part] ?? {})]);
    for (const k of keys) if (canonical(a[part]?.[k] ?? null) !== canonical(b[part]?.[k] ?? null)) out.push(`${part}.${k}`);
  }
  return out;
}
function dedupeWrites(ws) {
  const m = new Map();
  for (const w of ws) m.set(w.file, w);
  return [...m.values()];
}
export const json = (v) => JSON.stringify(v, null, 2) + "\n";

// ------------------------------------------------------------------ applying

/**
 * Write everything or nothing: each file goes to a temp file then renames into place;
 * on any failure every file already replaced is restored and new files removed.
 */
export function applyWrites(writes, fsx = fs) {
  const done = [];
  try {
    for (const w of writes) {
      const existed = fsx.existsSync(w.file);
      const before = existed ? fsx.readFileSync(w.file, "utf8") : null;
      fsx.mkdirSync(path.dirname(w.file), { recursive: true });
      const tmp = `${w.file}.tmp-${process.pid}`;
      fsx.writeFileSync(tmp, w.content);
      done.push({ file: w.file, before, tmp });
      fsx.renameSync(tmp, w.file);
      done[done.length - 1].tmp = null;
    }
  } catch (e) {
    for (const d of done.reverse()) {
      try {
        if (d.tmp && fsx.existsSync(d.tmp)) fsx.unlinkSync(d.tmp);
        if (d.before === null) {
          if (fsx.existsSync(d.file)) fsx.unlinkSync(d.file);
        } else fsx.writeFileSync(d.file, d.before);
      } catch {
        /* best effort; the error below still stops the run */
      }
    }
    throw new Error(`write failed, all changes rolled back: ${e.message}`);
  }
}

/** Run a batch: plan, check the branch and the private directory, then write (unless dry-run). */
export function run(inputs, ctx, opts = {}) {
  const p = plan(inputs, ctx, opts);
  const log = opts.log ?? console.log;
  if (p.errors.length) return { ...p, written: false, exitCode: 1, refused: "validation failed; nothing written" };
  const tracked = p.writes.filter((w) => w.tracked);
  const priv = p.writes.filter((w) => !w.tracked);
  if (opts.dryRun) return { ...p, written: false, exitCode: 0 };
  const g = ctx.git;
  if (tracked.length) {
    const b = g.branch();
    if (!b || ["main", "master"].includes(b)) return { ...p, written: false, exitCode: 1, refused: `refusing to change guide files on ${b ?? "a detached HEAD"}; switch to a feature branch` };
  }
  if (priv.length) {
    const relDir = path.relative(ctx.root, ctx.reviewDir) || ".";
    if (!g.isIgnored(path.join(relDir, "probe.json")) || g.trackedUnder(relDir).length) return { ...p, written: false, exitCode: 1, refused: `${relDir}/ must be git-ignored and untracked before private files are written` };
  }
  applyWrites(p.writes, opts.fs);
  log(`wrote ${tracked.length} tracked file(s) and ${priv.length} private file(s)`);
  return { ...p, written: true, exitCode: p.items.some((x) => x.outcome === "proposal") ? 3 : 0 };
}
