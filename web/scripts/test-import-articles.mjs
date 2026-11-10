#!/usr/bin/env node
/**
 * Tests for scripts/import-articles.mjs (scripts/lib/research-import.mjs).
 * Each test runs against a throwaway git repo holding copies of the site's real
 * ops, spec-sheet, source-registry and legacy data, so casino slugs and source
 * ownership are the site's own. All article and change content is synthetic.
 *
 *   node --test scripts/test-import-articles.mjs     (or npm run test:import)
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { run, plan, gitInfo, loadSite, sourceOwner, validateArticle, validateChange, zonedDate, changeFingerprint, CATEGORIES, CONTENT_TYPES, applyWrites, checkInternalPath } from "./lib/research-import.mjs";

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SECRET = "PRIVATE-SYNTHETIC-NOTE-7f3a";
const XSECRET = "SYNTHETIC-X-DRAFT-91bc";

function fixture({ branch = "feature/test" } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rimport-"));
  const web = path.join(root, "web");
  fs.mkdirSync(path.join(web, "data"), { recursive: true });
  for (const f of ["ops.json", "casinoSpecSheets.json", "source-registry.json", "legacy.json"]) fs.copyFileSync(path.join(WEB, "data", f), path.join(web, "data", f));
  const rows = [{ slug: "existing-guide", title: "An existing guide written by hand", mono: "EX", tint: "#AEBAC1", standfirst: "A guide that predates the importer.", category: "Law", readMins: 3, updated: "2026-10-01" }];
  const bodies = { "existing-guide": { published: "2026-09-30", key: ["Existing key point."], body: ["Existing paragraph.", "Another."] } };
  fs.writeFileSync(path.join(web, "data", "guideRows.json"), JSON.stringify(rows, null, 2) + "\n");
  fs.writeFileSync(path.join(web, "data", "guideBodies.json"), JSON.stringify(bodies, null, 2) + "\n");
  fs.writeFileSync(path.join(root, ".gitignore"), "/inbox/\n");
  const git = (...a) => execFileSync("git", a, { cwd: root, stdio: "ignore" });
  git("init", "-q", "-b", branch);
  git("-c", "user.email=t@t", "-c", "user.name=t", "add", "-A");
  git("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "fixture");
  const ctx = { root, webDir: web, appDir: path.join(WEB, "app"), libDir: path.join(WEB, "lib"), reviewDir: path.join(root, "inbox"), git: gitInfo(root) };
  return { root, web, ctx };
}

/** Every file under root except .git, as { relPath: content }. */
function snapshot(root) {
  const out = {};
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === ".git") continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out[path.relative(root, p)] = fs.readFileSync(p, "utf8");
    }
  };
  walk(root);
  return out;
}
/** Files git would commit (tracked or untracked-but-not-ignored). */
function committable(root) {
  return execFileSync("git", ["ls-files", "-co", "--exclude-standard"], { cwd: root, encoding: "utf8" }).split("\n").filter(Boolean);
}

function article(over = {}) {
  return {
    schemaVersion: "1.0",
    storyId: "synthetic-story-one",
    revision: 1,
    status: "draft",
    contentType: "news",
    slug: "synthetic-story-one",
    headline: "Synthetic headline for importer tests",
    excerpt: "A synthetic excerpt used only by the importer tests; it describes no real event.",
    keyPoints: ["A synthetic key point for the tests."],
    body: ["Synthetic opening paragraph.", "## Synthetic subheading", "Synthetic paragraph with **bold** text."],
    category: "News",
    tags: ["synthetic", "test"],
    cover: { mono: "SY", tint: "#6FB7FF" },
    readMins: 2,
    dates: { published: "2026-11-10", events: [] },
    sources: [{ label: "Synthetic regulator document", url: "https://www.cga.cw/en/synthetic-document", publishedAt: null, verifiedAt: "2026-11-10T12:00:00Z", primary: true }],
    verification: { status: "verified", checkedAt: "2026-11-10T12:00:00Z" },
    next: [{ href: "/legal/curacao-licence-tracker", label: "Curaçao licence tracker", hint: "Synthetic hint." }],
    ...over,
  };
}
function change(over = {}) {
  return {
    type: "casino_change",
    casino: "goated",
    topic: "welcome_offer",
    summary: "Synthetic summary of a change, for tests only.",
    after_quote: "Synthetic quoted wording.",
    source_url: "https://goated.com/synthetic-page",
    source_published: null,
    event_date: null,
    verified_at: "2026-11-10T12:00:00Z",
    confidence: "high",
    ...over,
  };
}
const inputs = (...vals) => vals.map((v, i) => ({ name: `input-${i}.json`, value: v }));
const quiet = { log: () => {} };
const rowsOf = (web) => JSON.parse(fs.readFileSync(path.join(web, "data", "guideRows.json"), "utf8"));
const bodiesOf = (web) => JSON.parse(fs.readFileSync(path.join(web, "data", "guideBodies.json"), "utf8"));

// ------------------------------------------------------------------ schema

test("accepts the revised schema without dates.updated or verification.method", () => {
  const { ctx } = fixture();
  const r = run(inputs(article()), ctx, quiet);
  assert.equal(r.exitCode, 0, JSON.stringify(r.errors));
  assert.equal(r.items[0].outcome, "created");
});

test("every category and content type validates", () => {
  const { ctx } = fixture();
  const site = loadSite(ctx);
  for (const category of CATEGORIES) for (const contentType of CONTENT_TYPES) {
    const { errors } = validateArticle(article({ category, contentType }), site);
    assert.deepEqual(errors, [], `${category}/${contentType}`);
  }
  assert.ok(validateArticle(article({ category: "Accounts" }), site).errors.some((e) => e.startsWith("category")));
  assert.ok(validateArticle(article({ contentType: "review" }), site).errors.some((e) => e.startsWith("contentType")));
});

test("null source and event dates are accepted; dates.events is required", () => {
  const { ctx } = fixture();
  const site = loadSite(ctx);
  assert.deepEqual(validateArticle(article({ dates: { published: "2026-11-10", events: [{ what: "Synthetic event", date: null }] } }), site).errors, []);
  assert.ok(validateArticle(article({ dates: { published: "2026-11-10" } }), site).errors.some((e) => e.startsWith("dates.events")));
  assert.ok(validateArticle(article({ verification: { status: "verified", checkedAt: "10 Nov 2026" } }), site).errors.some((e) => e.startsWith("verification.checkedAt")));
});

test("only drafts are accepted", () => {
  const { ctx } = fixture();
  const site = loadSite(ctx);
  for (const status of ["published", "ready_for_review"]) assert.ok(validateArticle(article({ status }), site).errors.some((e) => e.startsWith("status")), status);
});

test("unknown fields, author and image are rejected", () => {
  const { ctx } = fixture();
  const site = loadSite(ctx);
  for (const extra of [{ author: "x" }, { image: { src: "/x.png" } }, { seo: { title: "x" } }, { surprise: 1 }]) {
    assert.ok(validateArticle(article(extra), site).errors.some((e) => /unknown field/.test(e)), Object.keys(extra)[0]);
  }
});

test("body rules: HTML, links, images, lists, placeholders and stray headings are rejected", () => {
  const { ctx } = fixture();
  const site = loadSite(ctx);
  const bad = ["<b>html</b>", "see [this](https://a.example)", "![img](x.png)", "- a list item", "1. numbered", "Of {casinos} casinos", "visit https://a.example", "# one hash", "### three", "line\nbreak"];
  for (const b of bad) assert.ok(validateArticle(article({ body: ["Synthetic opening.", b] }), site).errors.length > 0, b);
  // A quotation containing a characterising word is a warning, not a rejection.
  const r = validateArticle(article({ body: ["Synthetic opening.", 'The regulator\'s notice says the site was "rigged", in its words.'] }), site);
  assert.deepEqual(r.errors, []);
  const w = validateArticle(article({ body: ["Synthetic opening.", "This casino is a scam."] }), site);
  assert.deepEqual(w.errors, []);
  assert.ok(w.warnings.some((x) => /characterising/.test(x)));
});

test("next links must be real site pages", () => {
  const { ctx } = fixture();
  const site = loadSite(ctx);
  for (const href of ["/legal/curacao-licence-tracker", "/casinos/goated", "/casinos/goated/facts", "/guides/existing-guide", "/guides/synthetic-story-one", "/crypto-casinos", "/casinos/razed#tested"]) assert.equal(checkInternalPath(href, site, new Set(["synthetic-story-one"])), null, href);
  for (const href of ["https://example.com", "//evil.example", "/casinos/not-a-casino", "/guides/nope", "/nope", "/casinos/goated?x=1", "/../etc", "/sweepstakes-casinos/anything"]) assert.notEqual(checkInternalPath(href, site, new Set()), null, href);
});

// ------------------------------------------------------------------ sources

test("source ownership: exact domains, subdomains, lookalikes and shared hosts", () => {
  const { ctx } = fixture();
  const { owners } = loadSite(ctx);
  assert.deepEqual(sourceOwner("https://goated.com/x", owners), { kind: "casino", id: "goated" });
  assert.deepEqual(sourceOwner("https://help.stake.com/en/articles/1", owners), { kind: "casino", id: "stake" });
  assert.equal(sourceOwner("https://goated.com.attacker.test/x", owners).kind, "unknown");
  assert.equal(sourceOwner("https://evilgoated.com/x", owners).kind, "unknown");
  assert.deepEqual(sourceOwner("https://intercom.help/playlink/en/articles/1", owners), { kind: "casino", id: "bluff" });
  assert.equal(sourceOwner("https://intercom.help/someone-else/en/articles/1", owners).kind, "unknown");
  assert.equal(sourceOwner("https://intercom.help/", owners).kind, "unknown");
  assert.equal(sourceOwner("https://www.reddit.com/r/x", owners).kind, "discovery");
  assert.equal(sourceOwner("https://x.com/a/status/1", owners).kind, "discovery");
  assert.equal(sourceOwner("http://goated.com/x", owners).kind, "invalid");
  assert.equal(sourceOwner("https://user:pw@goated.com/x", owners).kind, "invalid");
  assert.deepEqual(sourceOwner("https://gamingcontrol.spin-cdn.com/media/x.pdf", owners), { kind: "regulator", id: "curacao-gaming-authority" });
  assert.equal(sourceOwner("https://dafc.co.uk/news", owners).kind, "unknown");
});

test("article sources must be recognised primary owners; primary:false is discovery-only", () => {
  const { ctx } = fixture();
  const site = loadSite(ctx);
  const src = (url, primary = true) => article({ sources: [{ label: "Synthetic source", url, publishedAt: null, verifiedAt: "2026-11-10T12:00:00Z", primary }] });
  assert.deepEqual(validateArticle(src("https://goated.com/x"), site).errors, []);
  assert.ok(validateArticle(src("https://news.example/story"), site).errors.some((e) => /review required/.test(e)));
  assert.ok(validateArticle(src("https://www.reddit.com/r/x"), site).errors.some((e) => /discovery/.test(e)));
  assert.ok(validateArticle(src("https://goated.com/x", false), site).errors.some((e) => /primary must be true/.test(e)));
});

// ------------------------------------------------------------------ private fields

test("embedded private fields are extracted and never reach tracked or public files", () => {
  const { root, web, ctx } = fixture();
  const logs = [];
  const r = run(inputs(article({ editorialNotes: SECRET, x: { post: XSECRET, thread: [XSECRET] } })), ctx, { log: (m) => logs.push(m) });
  assert.equal(r.exitCode, 0, JSON.stringify(r.errors));
  for (const f of committable(root)) assert.ok(!fs.readFileSync(path.join(root, f), "utf8").includes(SECRET) && !fs.readFileSync(path.join(root, f), "utf8").includes(XSECRET), f);
  assert.ok(!JSON.stringify(r.items).includes(SECRET) && !logs.join("").includes(SECRET));
  const priv = fs.readFileSync(path.join(root, "inbox", "articles", "synthetic-story-one", "r1.json"), "utf8");
  assert.ok(priv.includes(SECRET) && priv.includes(XSECRET));
  assert.ok(!fs.readFileSync(path.join(web, "data", "guideBodies.json"), "utf8").includes("editorialNotes"));
});

test("a separate sidecar is matched by storyId and revision", () => {
  const { root, ctx } = fixture();
  const sidecar = { type: "article_private", storyId: "synthetic-story-one", revision: 1, editorialNotes: SECRET, x: { post: XSECRET } };
  const r = run(inputs(article(), sidecar), ctx, quiet);
  assert.equal(r.exitCode, 0, JSON.stringify(r.errors));
  assert.ok(fs.readFileSync(path.join(root, "inbox", "articles", "synthetic-story-one", "r1.json"), "utf8").includes(SECRET));
  // A sidecar with no matching article is rejected.
  const { ctx: c2 } = fixture();
  assert.equal(run(inputs({ ...sidecar, revision: 2 }, article()), c2, quiet).exitCode, 1);
});

test("conflicting embedded and sidecar values are rejected without echoing them", () => {
  const { root, ctx } = fixture();
  const before = snapshot(root);
  const r = run(inputs(article({ editorialNotes: SECRET }), { type: "article_private", storyId: "synthetic-story-one", revision: 1, editorialNotes: `${SECRET}-different` }), ctx, quiet);
  assert.equal(r.exitCode, 1);
  assert.ok(r.errors.some((e) => /disagree/.test(e)));
  assert.ok(!JSON.stringify(r.errors).includes(SECRET));
  assert.deepEqual(snapshot(root), before);
});

test("unknown sidecar fields are rejected", () => {
  const { ctx } = fixture();
  const r = run(inputs(article(), { type: "article_private", storyId: "synthetic-story-one", revision: 1, editorialNotes: "n", extra: true }), ctx, quiet);
  assert.equal(r.exitCode, 1);
  assert.ok(r.errors.some((e) => /extra: unknown field/.test(e)));
});

test("unverified material never enters guide data", () => {
  const { root, web, ctx } = fixture();
  const rows = fs.readFileSync(path.join(web, "data", "guideRows.json"), "utf8");
  const rejected = run(inputs(article({ verification: { status: "unverified", checkedAt: "2026-11-10T12:00:00Z" } })), ctx, quiet);
  assert.equal(rejected.exitCode, 1);
  assert.ok(rejected.errors.some((e) => /research_lead/.test(e)));
  const lead = run(inputs({ type: "research_lead", verification: { status: "unverified" }, editorialNotes: SECRET }), ctx, quiet);
  assert.equal(lead.exitCode, 0, JSON.stringify(lead.errors));
  assert.equal(fs.readFileSync(path.join(web, "data", "guideRows.json"), "utf8"), rows);
  assert.equal(fs.readdirSync(path.join(root, "inbox", "leads")).length, 1);
  assert.ok(!committable(root).some((f) => fs.readFileSync(path.join(root, f), "utf8").includes(SECRET)));
});

// ------------------------------------------------------------------ casino changes

test("casino change validation", () => {
  const { ctx } = fixture();
  const site = loadSite(ctx);
  assert.deepEqual(validateChange(change(), site).errors, []);
  assert.ok(validateChange(change({ casino: "not-a-casino" }), site).errors.some((e) => e.startsWith("casino")));
  assert.ok(validateChange(change({ topic: "gossip" }), site).errors.some((e) => e.startsWith("topic")));
  assert.ok(validateChange(change({ confidence: "low" }), site).errors.some((e) => e.startsWith("confidence")));
  assert.ok(validateChange(change({ after_quote: "x".repeat(300) }), site).errors.some((e) => e.startsWith("after_quote")));
  assert.ok(validateChange(change({ source_url: "https://stake.com/x" }), site).errors.some((e) => /belongs to stake/.test(e)));
  assert.ok(validateChange(change({ source_url: "https://news.example/x" }), site).errors.some((e) => /review required/.test(e)));
  assert.ok(validateChange(change({ extra: 1 }), site).errors.some((e) => /unknown field/.test(e)));
  const noDates = change();
  delete noDates.event_date;
  assert.ok(validateChange(noDates, site).errors.some((e) => e.startsWith("event_date")));
  // A regulator document can evidence a licence change, not a welcome offer.
  assert.deepEqual(validateChange(change({ topic: "licence", source_url: "https://www.cga.cw/en/synthetic" }), site).errors, []);
  assert.ok(validateChange(change({ source_url: "https://www.cga.cw/en/synthetic" }), site).errors.length > 0);
});

test("casino changes create one private review record, dedupe, and never touch site data", () => {
  const { root, web, ctx } = fixture();
  const before = snapshot(path.join(web, "data"));
  const a = run(inputs(change({ confidence: "medium" })), ctx, quiet);
  assert.equal(a.exitCode, 0, JSON.stringify(a.errors));
  assert.equal(a.items[0].outcome, "recorded");
  const dir = path.join(root, "inbox", "changes", "goated");
  const [file] = fs.readdirSync(dir);
  const rec = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  assert.equal(rec.status, "needs_review");
  assert.ok(rec.flags[0].startsWith("MEDIUM CONFIDENCE"));
  assert.equal(rec.report.before, null);
  assert.equal(rec.beforeProvided, false);
  assert.ok(rec.siteData.specFacts.length > 0, "points at existing stored facts");
  // Same report later: last-seen updates, no second record.
  const b = run(inputs(change({ confidence: "medium", verified_at: "2026-11-12T08:00:00Z" })), ctx, quiet);
  assert.equal(b.items[0].outcome, "seen-again");
  assert.equal(fs.readdirSync(dir).length, 1);
  const rec2 = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  assert.equal(rec2.seenCount, 2);
  assert.equal(rec2.lastSeen, "2026-11-12T08:00:00Z");
  // Exact repeat: nothing to do.
  assert.equal(run(inputs(change({ confidence: "medium", verified_at: "2026-11-12T08:00:00Z" })), ctx, quiet).items[0].outcome, "unchanged");
  // A materially different change is its own record.
  run(inputs(change({ after_quote: "Different synthetic wording." })), ctx, quiet);
  assert.equal(fs.readdirSync(dir).length, 2);
  assert.deepEqual(snapshot(path.join(web, "data")), before, "no site data changed");
});

test("change fingerprints ignore the verification time only", () => {
  assert.equal(changeFingerprint(change()), changeFingerprint(change({ verified_at: "2027-01-01T00:00:00Z" })));
  assert.equal(changeFingerprint(change()), changeFingerprint(change({ summary: "Synthetic   summary of a change, for tests only." })));
  assert.notEqual(changeFingerprint(change()), changeFingerprint(change({ topic: "withdrawals" })));
  assert.notEqual(changeFingerprint(change()), changeFingerprint(change({ before: "Earlier wording." })));
});

test("casino changes are allowed on main (private output only); article writes are not", () => {
  const { root, ctx } = fixture({ branch: "main" });
  assert.equal(run(inputs(change()), ctx, quiet).exitCode, 0);
  const before = snapshot(path.join(root, "web"));
  const r = run(inputs(article()), ctx, quiet);
  assert.equal(r.exitCode, 1);
  assert.match(r.refused, /main/);
  assert.deepEqual(snapshot(path.join(root, "web")), before);
});

// ------------------------------------------------------------------ dedup, revisions, edits

test("idempotent re-import, stale revisions and same-revision conflicts", () => {
  const { root, web, ctx } = fixture();
  assert.equal(run(inputs(article()), ctx, quiet).exitCode, 0);
  const after1 = snapshot(root);
  const again = run(inputs(article()), ctx, quiet);
  assert.equal(again.items[0].outcome, "unchanged");
  assert.deepEqual(snapshot(root), after1, "a no-op import writes nothing");
  const conflict = run(inputs(article({ headline: "Synthetic headline, changed but same revision" })), ctx, quiet);
  assert.equal(conflict.exitCode, 1);
  assert.ok(conflict.errors.some((e) => /different content/.test(e)));
  assert.equal(run(inputs(article({ revision: 2, headline: "Synthetic headline, revision two" })), ctx, quiet).items[0].outcome, "updated");
  const stale = run(inputs(article({ revision: 1 })), ctx, quiet);
  assert.ok(stale.errors.some((e) => /older than/.test(e)));
  assert.equal(rowsOf(web).filter((r) => r.slug === "synthetic-story-one").length, 1, "one article, no duplicate");
});

test("slugs: fixed after first import, never shared, existing articles need --adopt", () => {
  const { web, ctx } = fixture();
  run(inputs(article()), ctx, quiet);
  const moved = run(inputs(article({ revision: 2, slug: "a-new-slug" })), ctx, quiet);
  assert.equal(moved.items[0].slug, "synthetic-story-one");
  assert.ok(!rowsOf(web).some((r) => r.slug === "a-new-slug"));
  const taken = run(inputs(article({ storyId: "another-story", slug: "synthetic-story-one" })), ctx, quiet);
  assert.ok(taken.errors.some((e) => /belongs to story synthetic-story-one/.test(e)));
  const existing = run(inputs(article({ storyId: "adopter", slug: "existing-guide", dates: { published: "2026-11-10", events: [] } })), ctx, quiet);
  assert.ok(existing.errors.some((e) => /--adopt adopter/.test(e)));
  const adopted = run(inputs(article({ storyId: "adopter", slug: "existing-guide", dates: { published: "2026-11-10", events: [] } })), ctx, { ...quiet, adopt: "adopter" });
  assert.equal(adopted.items[0].outcome, "adopted", JSON.stringify(adopted.errors));
  assert.equal(bodiesOf(web)["existing-guide"].published, "2026-09-30", "adoption keeps the original publication date");
});

test("hand edits are never overwritten: the update becomes a private proposal", () => {
  const { root, web, ctx } = fixture();
  run(inputs(article()), ctx, quiet);
  const rows = rowsOf(web);
  rows.find((r) => r.slug === "synthetic-story-one").title = "Headline edited by a person";
  fs.writeFileSync(path.join(web, "data", "guideRows.json"), JSON.stringify(rows, null, 2) + "\n");
  const r = run(inputs(article({ revision: 2, headline: "Synthetic headline, revision two" })), ctx, quiet);
  assert.equal(r.exitCode, 3);
  assert.equal(r.items[0].outcome, "proposal");
  assert.equal(rowsOf(web).find((x) => x.slug === "synthetic-story-one").title, "Headline edited by a person");
  const prop = JSON.parse(fs.readFileSync(path.join(root, "inbox", "proposals", "synthetic-story-one-r2.json"), "utf8"));
  assert.ok(prop.changedFields.includes("row.title"));
});

// ------------------------------------------------------------------ dates

test("date fallback: checkedAt as a New York calendar date; original publication date kept", () => {
  assert.equal(zonedDate("2026-11-11T03:30:00Z"), "2026-11-10");
  assert.equal(zonedDate("2026-11-11T05:30:00Z"), "2026-11-11");
  assert.equal(zonedDate("2026-07-01T03:30:00Z"), "2026-06-30");
  const { web, ctx } = fixture();
  run(inputs(article({ verification: { status: "verified", checkedAt: "2026-11-11T03:30:00Z" } })), ctx, quiet);
  assert.equal(rowsOf(web)[0].updated, "2026-11-10");
  run(inputs(article({ revision: 2, dates: { published: "2026-12-01", events: [], updated: "2026-12-02" }, verification: { status: "verified", checkedAt: "2026-12-02T15:00:00Z" } })), ctx, quiet);
  assert.equal(bodiesOf(web)["synthetic-story-one"].published, "2026-11-10", "revision keeps the first publication date");
  assert.equal(rowsOf(web)[0].updated, "2026-12-02");
});

test("all guide rows store full ISO dates", () => {
  for (const r of JSON.parse(fs.readFileSync(path.join(WEB, "data", "guideRows.json"), "utf8"))) assert.match(r.updated, /^\d{4}-\d{2}-\d{2}$/, r.slug);
});

// ------------------------------------------------------------------ safety

test("dry run writes nothing, including private files", () => {
  const { root, ctx } = fixture();
  const before = snapshot(root);
  const r = run(inputs(article({ editorialNotes: SECRET }), change()), ctx, { ...quiet, dryRun: true });
  assert.equal(r.exitCode, 0);
  assert.ok(r.writes.length > 0);
  assert.deepEqual(snapshot(root), before);
  assert.ok(!fs.existsSync(path.join(root, "inbox")));
});

test("refuses private writes when the review directory isn't git-ignored", () => {
  const { root, ctx } = fixture();
  fs.writeFileSync(path.join(root, ".gitignore"), "");
  const r = run(inputs(change()), ctx, quiet);
  assert.equal(r.exitCode, 1);
  assert.match(r.refused, /git-ignored/);
});

test("a failed write rolls every file back", () => {
  const { root, ctx } = fixture();
  const before = snapshot(root);
  const p = plan(inputs(article({ editorialNotes: SECRET })), ctx);
  let renames = 0;
  const flaky = { ...fs, renameSync: (a, b) => (++renames === 3 ? (() => { throw new Error("synthetic disk error"); })() : fs.renameSync(a, b)) };
  assert.throws(() => applyWrites(p.writes, flaky), /rolled back/);
  const now = snapshot(root);
  assert.deepEqual(Object.keys(now).filter((k) => !k.startsWith("inbox")), Object.keys(before));
  for (const k of Object.keys(before)) assert.equal(now[k], before[k], k);
  assert.ok(!Object.keys(now).some((k) => k.includes(".tmp-")));
});

test("unsafe story IDs can't escape the review directory", () => {
  const { ctx } = fixture();
  const site = loadSite(ctx);
  for (const storyId of ["../../etc", "a/b", "UPPER", "x"]) assert.ok(validateArticle(article({ storyId }), site).errors.some((e) => e.startsWith("storyId")), storyId);
});

test("JSON parse errors don't echo file content", async () => {
  const { parseJsonSafe } = await import("./lib/research-import.mjs");
  const r = parseJsonSafe(`{"editorialNotes": "${SECRET}" oops}`);
  assert.ok(r.error && !r.error.includes(SECRET));
});

test("guide files keep their formatting: unchanged content round-trips byte for byte", () => {
  for (const f of ["guideRows.json", "guideBodies.json"]) {
    const raw = fs.readFileSync(path.join(WEB, "data", f), "utf8");
    assert.equal(JSON.stringify(JSON.parse(raw), null, 2) + "\n", raw, f);
  }
});
