#!/usr/bin/env node
/**
 * Import article packages from the research agent as DRAFTS.
 *
 * An article is one row in data/guideRows.json plus one body in
 * data/guideBodies.json, shown at /guides/<slug>. The site has no draft flag,
 * so a draft is a git branch: each story is written onto `drafts/<storyId>`,
 * cut from origin/main, and pushed. Vercel builds a Preview of that branch for
 * review; merging it into main is the only thing that publishes. This script
 * never commits to main.
 *
 * Package format: see docs/article-import.md (schemaVersion "1.0").
 *
 * Dedup and updates: each story gets a record at data/imports/<storyId>.json
 * (not loaded by the app). A package whose storyId already has a record
 * updates that story's slug; the slug never changes after first import.
 * The record keeps a hash of what was last written. If the article on main
 * (published) or on its draft branch (unpublished) no longer matches that
 * hash, a person has edited it, and the update goes to a separate
 * `drafts/<storyId>-r<revision>` branch instead of overwriting their edit.
 *
 * Private fields (editorialNotes, x) are never written into web/. They go
 * to <repo>/inbox/<storyId>/, which is git-ignored.
 *
 * Usage (from web/):
 *   node scripts/import-articles.mjs <package.json | folder>   validate, write a draft branch, push
 *   node scripts/import-articles.mjs <...> --dry-run           validate only, print what would happen
 *   node scripts/import-articles.mjs <...> --no-push           make the branch and commit, don't push
 *   node scripts/import-articles.mjs <...> --no-git            write into the current working tree (local preview)
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO = path.resolve(WEB, "..");
const ROWS = "web/data/guideRows.json";
const BODIES = "web/data/guideBodies.json";
const IMPORTS = "web/data/imports";
const INBOX = path.join(REPO, "inbox");

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const inputs = args.filter((a) => !a.startsWith("--"));
const DRY = flags.has("--dry-run");
const NO_GIT = flags.has("--no-git");
const NO_PUSH = flags.has("--no-push");

// ---------------------------------------------------------------- validation

const CATEGORIES = ["News", "Law", "Crypto", "Bonuses", "Slots", "Betting", "Accounts", "Wallets", "Method"];
const TINTS = { News: "#6FB7FF", Law: "#9AAE5E", Crypto: "#F7931A", Bonuses: "#FFC531", Slots: "#FF7EB6", Betting: "#57E39A", Accounts: "#5FE3E8", Wallets: "#B79CFF", Method: "#AEBAC1" };
/** Not primary sources: reports may be tipped off by these, never cite them. */
const NOT_PRIMARY = /(^|\.)(reddit\.com|x\.com|twitter\.com|t\.me|youtube\.com|medium\.com|bitcointalk\.org|casinoguru|askgamblers|slotessentials\.com|trustpilot\.com)$/i;
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const ISO_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

function validate(p) {
  const errors = [];
  const warn = [];
  const need = (cond, msg) => cond || errors.push(msg);
  const str = (v, min = 1, max = 100000) => typeof v === "string" && v.trim().length >= min && v.length <= max;
  /** Body-copy rules: the guide page renders plain text with only "## " and **bold**. */
  const prose = (v, where) => {
    if (/<[a-z/!]/i.test(v)) errors.push(`${where}: HTML isn't allowed`);
    if (/https?:\/\/|www\./i.test(v)) errors.push(`${where}: links go in sources or next, not in the text`);
    if (/\]\(/.test(v)) errors.push(`${where}: Markdown links aren't supported`);
    if (/\{\w+\}/.test(v)) errors.push(`${where}: "{word}" is a site placeholder; rephrase without curly braces`);
    if ((v.match(/\*\*/g) || []).length % 2) errors.push(`${where}: unbalanced **bold** markers`);
    if (/^\s*([-*•]|\d+\.)\s/.test(v)) errors.push(`${where}: lists aren't supported; write it as a sentence or a paragraph`);
  };

  need(p.schemaVersion === "1.0", `schemaVersion must be "1.0"`);
  need(typeof p.storyId === "string" && /^[a-z0-9][a-z0-9-]{2,80}$/.test(p.storyId), "storyId: lowercase letters, numbers and hyphens, 3–81 characters");
  need(Number.isInteger(p.revision) && p.revision >= 1, "revision must be a whole number from 1");
  need(["draft", "ready_for_review"].includes(p.status), `status must be "draft" or "ready_for_review" (only a person publishes)`);
  need(["news", "analysis", "opinion"].includes(p.contentType), `contentType must be "news", "analysis" or "opinion"`);
  need(typeof p.slug === "string" && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug) && p.slug.length <= 90, "slug: lowercase words joined by hyphens, up to 90 characters");
  need(str(p.headline, 10, 120), "headline: 10–120 characters");
  need(str(p.excerpt, 40, 400), "excerpt: 40–400 characters");
  need(CATEGORIES.includes(p.category), `category must be one of ${CATEGORIES.join(", ")}`);
  need(Array.isArray(p.keyPoints) && p.keyPoints.length >= 1 && p.keyPoints.length <= 6 && p.keyPoints.every((k) => str(k, 10, 400)), "keyPoints: 1–6 points, each 10–400 characters");
  need(Array.isArray(p.body) && p.body.length >= 2 && p.body.every((b) => str(b, 2, 4000)), "body: at least 2 paragraphs, each up to 4,000 characters");
  for (const [i, k] of (p.keyPoints || []).entries()) if (typeof k === "string") prose(k, `keyPoints[${i}]`);
  for (const [i, b] of (p.body || []).entries()) {
    if (typeof b !== "string") continue;
    prose(b, `body[${i}]`);
    if (/^\s*#/.test(b) && !/^## \S/.test(b)) errors.push(`body[${i}]: subheadings start with "## " (one level only)`);
  }
  for (const f of ["headline", "excerpt"]) if (typeof p[f] === "string") prose(p[f], f);
  if (p.body?.[0]?.startsWith("## ")) warn.push("body starts with a subheading; open with a paragraph");

  need(p.dates && ISO.test(p.dates.published ?? ""), "dates.published: yyyy-mm-dd");
  if (p.dates?.published && ISO.test(p.dates.published) && p.dates.published > new Date(Date.now() + 864e5).toISOString().slice(0, 10)) errors.push("dates.published is in the future");

  need(Array.isArray(p.sources) && p.sources.length >= 1, "sources: at least one");
  for (const [i, s] of (p.sources || []).entries()) {
    let host = "";
    try {
      const u = new URL(s.url);
      host = u.hostname.replace(/^www\./, "");
      if (u.protocol !== "https:") errors.push(`sources[${i}].url must be https`);
    } catch {
      errors.push(`sources[${i}].url isn't a valid URL`);
    }
    if (!str(s.label, 5, 300)) errors.push(`sources[${i}].label: 5–300 characters`);
    if (s.primary && NOT_PRIMARY.test(host)) errors.push(`sources[${i}]: ${host} isn't a primary source`);
    if (s.publishedAt != null && !ISO.test(s.publishedAt)) errors.push(`sources[${i}].publishedAt: yyyy-mm-dd or null`);
    if (s.verifiedAt != null && !ISO_TIME.test(s.verifiedAt)) errors.push(`sources[${i}].verifiedAt: an ISO date-time`);
  }
  need((p.sources || []).some((s) => s.primary === true), "at least one source must be marked primary: the casino's or regulator's own page");
  need(p.verification?.status === "verified", `verification.status must be "verified"; unverified leads stay with the research agent`);

  for (const [i, n] of (p.next || []).entries()) {
    if (!(typeof n.href === "string" && n.href.startsWith("/") && !n.href.startsWith("//"))) errors.push(`next[${i}].href must be a cryptoslotguide.com path starting with "/"`);
    if (!str(n.label, 2, 80) || !str(n.hint, 2, 160)) errors.push(`next[${i}]: label (up to 80) and hint (up to 160) are required`);
  }
  if (p.cover) {
    if (p.cover.mono != null && !/^[A-Za-z0-9]{1,3}$/.test(p.cover.mono)) errors.push("cover.mono: 1–3 letters or digits");
    if (p.cover.tint != null && !/^#[0-9A-Fa-f]{6}$/.test(p.cover.tint)) errors.push("cover.tint: a #RRGGBB colour");
  }
  if (p.readMins != null && !(Number.isInteger(p.readMins) && p.readMins >= 1 && p.readMins <= 60)) errors.push("readMins: 1–60");
  if (p.image) warn.push("image is ignored: articles use generated covers");
  if (p.author) warn.push("author is ignored: the site uses one byline");
  if (p.seo?.title || p.seo?.description) warn.push("seo overrides are ignored: the page uses the headline and excerpt");

  return { errors, warn };
}

// ---------------------------------------------------------------- package → site format

function wordsIn(p) {
  return [p.excerpt, ...p.keyPoints, ...p.body].join(" ").split(/\s+/).filter(Boolean).length;
}

/** The website fields only. Private fields never pass through here. */
function toSite(p, slug) {
  const row = {
    slug,
    title: p.headline.trim(),
    mono: (p.cover?.mono || p.category.slice(0, 2)).toUpperCase(),
    tint: p.cover?.tint || TINTS[p.category],
    standfirst: p.excerpt.trim(),
    category: p.category,
    readMins: p.readMins ?? Math.max(2, Math.round(wordsIn(p) / 220)),
    updated: (p.dates.updated && ISO.test(p.dates.updated) ? p.dates.updated : p.verification?.checkedAt?.slice(0, 10)) || p.dates.published,
  };
  const body = {
    published: p.dates.published,
    ...(p.contentType !== "news" ? { contentType: p.contentType } : {}),
    key: p.keyPoints.map((k) => k.trim()),
    body: p.body.map((b) => b.trim()),
    sources: p.sources.map((s) => ({ label: s.label.trim(), url: s.url })),
    ...(p.next?.length ? { next: p.next.map((n) => ({ href: n.href, label: n.label, hint: n.hint })) } : {}),
    ...(p.noPartners ? { noPartners: true } : {}),
  };
  return { row, body };
}

const hashOf = (row, body) => crypto.createHash("sha256").update(JSON.stringify([row ?? null, body ?? null])).digest("hex").slice(0, 16);

// ---------------------------------------------------------------- git and files

const git = (...a) => execFileSync("git", a, { cwd: REPO, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const tryGit = (...a) => {
  try {
    return git(...a);
  } catch {
    return null;
  }
};
/** A file's text at a ref (origin/main, origin/drafts/x), or null. */
const show = (ref, file) => tryGit("show", `${ref}:${file}`);
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(REPO, file), "utf8"));
const writeJson = (file, data) => {
  fs.mkdirSync(path.dirname(path.join(REPO, file)), { recursive: true });
  fs.writeFileSync(path.join(REPO, file), JSON.stringify(data, null, 2) + "\n");
};

function articleAt(ref, slug) {
  const rows = show(ref, ROWS);
  const bodies = show(ref, BODIES);
  if (!rows || !bodies) return null;
  const row = JSON.parse(rows).find((r) => r.slug === slug);
  const body = JSON.parse(bodies)[slug];
  return row || body ? { row: row ?? null, body: body ?? null } : null;
}

function ensureInboxIgnored() {
  const gi = path.join(REPO, ".gitignore");
  const text = fs.existsSync(gi) ? fs.readFileSync(gi, "utf8") : "";
  if (!/^\/?inbox\/?$/m.test(text)) {
    if (DRY) return console.log("  would add /inbox/ to .gitignore");
    fs.writeFileSync(gi, text + (text && !text.endsWith("\n") ? "\n" : "") + "# Research-agent packages, private notes and X drafts: never committed.\n/inbox/\n");
  }
}

function savePrivate(p) {
  const priv = { storyId: p.storyId, revision: p.revision, editorialNotes: p.editorialNotes ?? null, x: p.x ?? null, tags: p.tags ?? [], verification: p.verification ?? null, events: p.dates?.events ?? [] };
  if (DRY) return;
  const dir = path.join(INBOX, p.storyId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `r${p.revision}.private.json`), JSON.stringify(priv, null, 2) + "\n");
}

/** Write the article into the working tree's guide files; new stories go to the top of the list. */
function applyArticle(row, body) {
  const rows = readJson(ROWS);
  const bodies = readJson(BODIES);
  const i = rows.findIndex((r) => r.slug === row.slug);
  if (i >= 0) rows[i] = row;
  else rows.unshift(row);
  bodies[row.slug] = body;
  writeJson(ROWS, rows);
  writeJson(BODIES, bodies);
}

// ---------------------------------------------------------------- main

function packagesFrom(list) {
  const files = list.flatMap((x) => {
    const abs = path.resolve(process.cwd(), x);
    if (!fs.existsSync(abs)) throw new Error(`Not found: ${x}`);
    return fs.statSync(abs).isDirectory() ? fs.readdirSync(abs).filter((f) => f.endsWith(".json") && !f.endsWith(".private.json")).map((f) => path.join(abs, f)) : [abs];
  });
  return files.map((f) => {
    try {
      return { file: path.basename(f), pkg: JSON.parse(fs.readFileSync(f, "utf8")) };
    } catch (e) {
      return { file: path.basename(f), pkg: null, parseError: e.message };
    }
  });
}

function main() {
  if (!inputs.length) {
    console.error("Usage: node scripts/import-articles.mjs <package.json | folder> [--dry-run] [--no-push] [--no-git]");
    process.exit(2);
  }
  const pkgs = packagesFrom(inputs);
  let failed = 0;

  if (!NO_GIT && !DRY) {
    if (git("status", "--porcelain", "--untracked-files=no")) {
      console.error("The working tree has uncommitted changes. Commit or stash them first: the importer switches branches.");
      process.exit(1);
    }
    git("fetch", "--quiet", "origin");
  }
  const startBranch = NO_GIT ? null : git("rev-parse", "--abbrev-ref", "HEAD");
  ensureInboxIgnored();

  for (const { file, pkg, parseError } of pkgs) {
    console.log(`\n▸ ${file}`);
    if (!pkg) {
      console.log(`  ✗ not valid JSON: ${parseError}`);
      failed++;
      continue;
    }
    const { errors, warn } = validate(pkg);
    warn.forEach((w) => console.log(`  ! ${w}`));
    if (errors.length) {
      errors.forEach((e) => console.log(`  ✗ ${e}`));
      failed++;
      continue;
    }

    // Which story is this, and where does it stand?
    const recordFile = `${IMPORTS}/${pkg.storyId}.json`;
    const draftRef = `origin/drafts/${pkg.storyId}`;
    const hasDraft = !NO_GIT && !!tryGit("rev-parse", "--verify", "--quiet", draftRef);
    const recordText = NO_GIT ? (fs.existsSync(path.join(REPO, recordFile)) ? fs.readFileSync(path.join(REPO, recordFile), "utf8") : null) : show("origin/main", recordFile) ?? (hasDraft ? show(draftRef, recordFile) : null);
    const record = recordText ? JSON.parse(recordText) : null;
    const slug = record?.slug ?? pkg.slug;
    if (record && pkg.slug !== record.slug) console.log(`  ! slug is fixed at "${record.slug}" from the first import; ignoring "${pkg.slug}"`);
    if (record && pkg.revision <= record.revision) {
      console.log(`  ✗ revision ${pkg.revision} is not newer than the imported revision ${record.revision}; nothing to do`);
      failed++;
      continue;
    }

    const published = NO_GIT ? null : articleAt("origin/main", slug);
    if (!record) {
      // A new story must not take an existing article's address.
      const taken = NO_GIT ? readJson(ROWS).some((r) => r.slug === slug) || !!readJson(BODIES)[slug] : !!published;
      if (taken) {
        console.log(`  ✗ /guides/${slug} already exists and isn't from this story; choose another slug`);
        failed++;
        continue;
      }
    }

    // Has a person edited it since the last import?
    const current = !NO_GIT && record ? (published ?? (hasDraft ? articleAt(draftRef, slug) : null)) : null;
    const edited = !!(record && current && hashOf(current.row, current.body) !== record.writtenHash);
    // Published stories update from main; unpublished ones from their draft branch (edited or not,
    // so a separate proposal branch differs from the person's version only by this revision).
    const base = published || !hasDraft ? "origin/main" : draftRef;
    const branch = edited || (published && record) ? `drafts/${pkg.storyId}-r${pkg.revision}` : `drafts/${pkg.storyId}`;

    const { row, body } = toSite(pkg, slug);
    const newRecord = {
      storyId: pkg.storyId,
      slug,
      revision: pkg.revision,
      contentType: pkg.contentType,
      importedAt: new Date().toISOString(),
      writtenHash: hashOf(row, body),
      branch: NO_GIT ? null : branch,
      sources: pkg.sources.map((s) => ({ url: s.url, publishedAt: s.publishedAt ?? null, verifiedAt: s.verifiedAt ?? null, primary: !!s.primary })),
      verifiedAt: pkg.verification?.checkedAt ?? null,
      history: [...(record?.history ?? []), { revision: pkg.revision, importedAt: new Date().toISOString(), branch: NO_GIT ? null : branch, humanEditsPreserved: edited }],
    };

    const what = record ? `update to revision ${pkg.revision}` : "new story";
    console.log(`  ✓ valid: ${what}, /guides/${slug}`);
    if (edited) console.log(`  ! the article was edited by hand since revision ${record.revision}; the update goes to its own branch so those edits aren't overwritten`);
    if (DRY) {
      console.log(`  would write ${ROWS}, ${BODIES} and ${recordFile} on ${NO_GIT ? "the working tree" : `branch ${branch} (from ${base})`}`);
      continue;
    }

    savePrivate(pkg);
    if (NO_GIT) {
      applyArticle(row, body);
      writeJson(recordFile, newRecord);
      console.log(`  ✓ written to the working tree (not committed). Preview with npm run dev at /guides/${slug}`);
      continue;
    }

    git("checkout", "--quiet", "-B", branch, base);
    try {
      applyArticle(row, body);
      writeJson(recordFile, newRecord);
      execFileSync("node", ["scripts/check-no-borrowed-copy.mjs"], { cwd: WEB, stdio: "inherit" });
      git("add", ROWS, BODIES, recordFile);
      git("commit", "--quiet", "-m", `Draft: ${row.title}\n\nImported from research package ${pkg.storyId} r${pkg.revision} (${pkg.contentType}). Not published: merge this branch into main to publish /guides/${slug}.`);
      if (!NO_PUSH) {
        git("push", "--quiet", "-u", "origin", branch);
        console.log(`  ✓ pushed ${branch}. Vercel builds a Preview of it; review /guides/${slug} there, then merge into main to publish.`);
      } else {
        console.log(`  ✓ committed on ${branch} (not pushed)`);
      }
    } catch (e) {
      console.log(`  ✗ ${e.message.split("\n")[0]}`);
      tryGit("checkout", "--quiet", "--", ".");
      failed++;
    } finally {
      git("checkout", "--quiet", startBranch);
    }
  }

  console.log(`\n${pkgs.length - failed} of ${pkgs.length} package(s) ${DRY ? "valid" : "imported"}.`);
  process.exit(failed ? 1 : 0);
}

main();
