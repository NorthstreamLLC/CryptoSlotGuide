#!/usr/bin/env node
/**
 * Game CSV import, in two modes, plus a quarantine for fields that cannot be
 * published as they stand.
 *
 *   CATALOGUE mode (no casino column)
 *     "This game exists, from this studio, with these mechanics."
 *     Writes data/gameCatalogue.json. Says NOTHING about who carries it.
 *
 *   AVAILABILITY mode (a casino column is present)
 *     "This casino's lobby lists this game."
 *     Writes data/casinoGames.json, one entry per casino.
 *
 * The mode is read off the header rather than chosen by a flag, so a catalogue
 * export can never become availability data by accident. That accident is the
 * expensive one: it would let a provider page claim an operator carries a
 * studio's games on the strength of a spreadsheet that never named the operator.
 *
 * ABSENCE IS NOT A NEGATIVE
 * A casino's list is what we know it HAS. A missing game means "not seen", not
 * "not offered" — lobby exports are partial, regional and change hourly. Every
 * casino entry is `complete: false` unless --complete says the export really was
 * the whole lobby, and only a true there may support a negative claim anywhere.
 *
 * QUARANTINE
 * Real exports carry fields that are wrong to publish rather than merely
 * missing. Those are dropped by default, counted, and the reason printed, so
 * the decision is visible instead of silent. See REJECT below.
 *
 * Usage:
 *   npm run import:games -- games.csv --dry-run
 *   npm run import:games -- games.csv --source "Roobet lobby" --as-of 2026-09-24
 *   npm run import:games -- games.csv --complete        # the export IS the full lobby
 *   npm run import:games -- games.csv --keep-rejected   # write them to a review file
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(web, "data");
const OUT_AVAIL = path.join(DATA, "casinoGames.json");
const OUT_CATALOGUE = path.join(DATA, "gameCatalogue.json");
const OUT_REVIEW = path.join(DATA, "gameCatalogue.review.json");
const CHANGES = path.join(DATA, "casinoGames.changes.json");

const argv = process.argv.slice(2);
const file = argv.find((a) => !a.startsWith("--"));
const DRY = argv.includes("--dry-run");
const COMPLETE = argv.includes("--complete");
const KEEP = argv.includes("--keep-rejected");
const after = (flag, fallback) => (argv.includes(flag) && argv[argv.indexOf(flag) + 1] ? argv[argv.indexOf(flag) + 1] : fallback);
const AS_OF = after("--as-of", new Date().toISOString().slice(0, 10));
const SOURCE = after("--source", null);

if (!file) {
  console.error('usage: npm run import:games -- games.csv [--dry-run] [--source "…"] [--as-of YYYY-MM-DD] [--complete] [--keep-rejected]');
  process.exit(1);
}

const read = (p) => JSON.parse(fs.readFileSync(path.join(DATA, p), "utf8"));
const OPS = read("ops.json");
const PROVIDERS = read("providers.json");
// Studios we hold licence data for but have no profile page for yet. Matching
// against both means a name resolves to its canonical spelling even when the
// site cannot link to it, which keeps "Netent" and "NetEnt" from becoming two
// studios the moment a profile page is added.
const LICENSED = read("provider-licences.json");

/**
 * Short forms an export uses for a studio we already know under a fuller name.
 * Without this, "Hacksaw" and "Hacksaw Gaming" are two different studios and
 * the 183 games behind the short form never reach the provider page.
 */
const STUDIO_ALIASES = {
  hacksaw: "Hacksaw Gaming",
  netent: "NetEnt",
  "playngo": "Play'n GO",
  "playngo!": "Play'n GO",
  bigtimegaming: "Big Time Gaming",
  btg: "Big Time Gaming",
  nolimit: "Nolimit City",
  redtiger: "Red Tiger",
  relax: "Relax Gaming",
  push: "Push Gaming",
  pragmatic: "Pragmatic Play",
  print: "Print Studios",
  elk: "ELK Studios",
  "gamesglobal": "Microgaming / Games Global",
  microgaming: "Microgaming / Games Global",
};
const key = (s) => String(s ?? "").toLowerCase().replace(/[\s_\-.]/g, "");

// The site's own house-game taxonomy, so the classifier below agrees with the
// section these titles actually belong in rather than inventing a second list.
const HOUSE_SLUGS = new Set(read("houseGames.json").map((g) => key(g.slug ?? g.name)));

/**
 * What we found when we checked each studio against its own site and the MGA
 * and Curacao registers. Carried onto every game so a page can say how much is
 * actually known about who made it, instead of printing a name from a
 * spreadsheet as though it were established.
 */
const VERIFIED = new Map(read("studio-verification.json").studios.map((v) => [key(v.exportName), v]));

/**
 * Studios we already hold regulator data for in provider-licences.json, each
 * gathered from the regulator's own register. Checking here first means the
 * established names do not come back as "unchecked" merely because they were
 * verified in an earlier pass rather than this one.
 */
const LICENCE_BACKED = new Map(
  LICENSED.filter((p) => (p.licences ?? []).length > 0).map((p) => [
    key(p.name),
    { status: "licensed", note: null, licence: `${p.licences.length} licence(s) on file`, licenceUrl: p.sourceUrl ?? null },
  ])
);


/** Minimal RFC-4180 reader — exports routinely have quoted commas and newlines in prose fields. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { cell += '"'; i++; }
        else quoted = false;
      } else cell += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

/**
 * Splits a provider label into the studio name and the integration it arrived
 * through: "Hacksaw (Neutron)" -> { base: "Hacksaw", integration: "Neutron" }.
 *
 * DO NOT treat the base as authorship. A suffix like this names the platform
 * that DELIVERS the game, and Hacksaw's OpenRGS hosts third-party studios, so
 * the bucket is a mix of Hacksaw's own titles and other people's. Spot-checking
 * three titles in the "Hacksaw (Neutron)" set found two genuinely Hacksaw and
 * one ("Lucky Multifruit: Crystal Dust") by Trusty Gaming. Folding the whole
 * bucket into "Hacksaw Gaming" would therefore have published a false
 * attribution on an unknown subset of 192 games.
 *
 * So an integration suffix marks the studio UNCONFIRMED: the base name is kept
 * as a lead, the game never links to a studio page, and the games are listed
 * for per-title resolution against each studio's own site.
 */
function splitStudio(name) {
  const raw = String(name ?? "").replace(/\s+/g, " ").trim();
  const m = raw.match(/^(.*?)\s*\((neutron(?:\s*-\s*f)?|f|fun|demo|social)\)$/i);
  if (!m) return { base: raw, integration: null };
  return { base: m[1].trim(), integration: m[2].trim() };
}

/**
 * A "slots" export is rarely only slots. This one carries 15 table and house
 * games — Roulette, Baccarat, Video Poker, Mines, Crash, Plinko, Limbo and so
 * on — and only Blackjack tripped the 99% shape guard. Listing Roulette as a
 * slot would be wrong on the page and would drag the RTP median with it, so
 * every row is classified instead of assumed.
 *
 * House games match the site's own taxonomy by EXACT name: plenty of real slots
 * have "dice" or "wheel" in the title, so a substring test here would reclassify
 * them. Table games do use a substring, because "Speed Blackjack Pro" is a
 * blackjack variant and should be caught.
 */
const TABLE_RE = /\b(blackjack|roulette|baccarat|video poker|poker|sic ?bo|craps|dragon tiger|andar bahar|teen patti|bingo|pontoon|hold ?'?em|three card|caribbean stud|red dog)\b/i;

function classify(name) {
  if (HOUSE_SLUGS.has(key(name))) return "house";
  if (TABLE_RE.test(name)) return "table";
  return "slot";
}

/**
 * Fields a real export carries that must not be published as they stand. Each
 * says WHY, because "dropped 338 values" with no reason is how a rule gets
 * quietly reverted later.
 */
/**
 * Suppliers whose products are not slots, with the regulator evidence. Betby is
 * a sportsbook platform: its MGA licence (Earlybird Limited, MGA/B2B/780/2020)
 * is Type 2, fixed-odds betting only, with no Type 1 RNG-casino authorisation,
 * which a slot supplier would need. Its "SlotBets" product wraps live sports
 * and esports markets in slot-machine styling, which is how six wrestling
 * events ended up in a slots export at 99.3% "RTP".
 */
const NON_SLOT_SUPPLIERS = {
  betby: "Betby is a sportsbook platform (MGA/B2B/780/2020, Type 2 betting only — no Type 1 RNG casino licence). Its SlotBets product is a betting market styled as a slot.",
  betbysportsbook: "Betby is a sportsbook platform (MGA/B2B/780/2020, Type 2 betting only — no Type 1 RNG casino licence). Its SlotBets product is a betting market styled as a slot.",
};

const REJECT = {
  observedRtp:
    "rtpDaily/rtpWeekly are observed return over a short window, not RTP — values above 100% (up to 1763%) prove it. Publishing them as RTP would be false.",
  hotCold:
    'rtpState HOT/COLD tells a reader a game is "due". That is the gambler\'s fallacy, it is untrue of an independent RNG, and it is the opposite of what this site is for.',
  templatedCopy:
    "description/descriptionShort are templated marketing prose with affiliate links inline, not a sourced fact about the game.",
  constantRating: "rating is the same value on every row, so it distinguishes nothing.",
  implausibleRtp: "rtpBase outside 80–100 is not a slot RTP (0 usually means 'unknown' in this export).",
  excludedStudio: "studio checked and excluded — see data/studio-verification.json for the finding.",
  notASlot: "supplier does not make slots — see NON_SLOT_SUPPLIERS for the licence evidence.",
  notSlotShaped:
    "no reels, no paylines and a return at or above 99% — that is a betting margin, not a slot RTP. Usually a sports or event market that arrived in a slots export.",
};

function main() {
  const raw = parseCsv(fs.readFileSync(file, "utf8"));
  if (raw.length < 2) {
    console.error("csv has no data rows");
    process.exit(1);
  }

  const header = raw[0].map(key);
  const col = (...names) => {
    for (const n of names) {
      const i = header.indexOf(key(n));
      if (i !== -1) return i;
    }
    return -1;
  };

  const iCasino = col("casino", "casinoname", "casinoslug", "operator", "operatorname", "operatorslug", "site", "sitename", "brand", "brandname", "availableat");
  const iGame = col("game", "gamename", "gametitle", "title", "name", "slot", "slotname");
  const iSlug = col("slug", "gameslug");
  const iProvider = col("provider.name", "provider", "providername", "studio", "studioname", "vendor", "supplier", "gameprovider", "developer");
  const iRtp = col("rtpbase", "rtp", "rtppercent", "returntoplayer");
  const iVol = col("volantility", "volatility", "variance");
  const iReels = col("reels");
  const iRows = col("rows");
  const iLines = col("paylines", "lines");
  const iMaxWin = col("maxwinmultiplier", "maxwin");
  const iMinBet = col("minbet");
  const iMaxBet = col("maxbet");
  const iReleased = col("releasedat", "released", "releasedate");
  const iImage = col("imageurl", "image");
  const iDeleted = col("isdeleted", "deleted");
  // Present-but-rejected columns, counted so the report can say what was dropped.
  const rejected = { observedRtp: 0, hotCold: 0, templatedCopy: 0, constantRating: 0, implausibleRtp: 0, notASlot: 0, notSlotShaped: 0, excludedStudio: 0 };
  const excluded = [];
  const iDaily = col("rtpdaily");
  const iWeekly = col("rtpweekly");
  const iState = col("rtpstate");
  const iDesc = col("description");
  const iRating = col("rating");

  if (iGame === -1) {
    console.error(`csv needs a game/name column. Found headers: ${raw[0].join(", ")}`);
    process.exit(1);
  }

  const MODE = iCasino === -1 ? "catalogue" : "availability";

  const opBy = new Map();
  for (const o of OPS) { opBy.set(key(o.slug), o); opBy.set(key(o.name), o); }
  // Profile pages win over licence-only entries, so a studio that has a page
  // links to it; both are registered so either spelling resolves.
  const provBy = new Map();
  for (const p of LICENSED) { provBy.set(key(p.slug), { slug: null, name: p.name }); provBy.set(key(p.name), { slug: null, name: p.name }); }
  for (const p of PROVIDERS) { provBy.set(key(p.slug), p); provBy.set(key(p.name), p); }

  // Where the export's own asset links point. Recorded with the data because it
  // is the only durable evidence of where the rows really came from: a source
  // string is an assertion, this is a measurement.
  const assetHosts = { image: new Map(), demo: new Map() };
  const iDemo = col("playdemourl", "demourl", "demo");
  const noteHost = (bucket, url) => {
    try { const h = new URL(url).hostname.replace(/^www\./, ""); bucket.set(h, (bucket.get(h) ?? 0) + 1); } catch { /* not a url */ }
  };

  const unknownCasinos = new Map();
  const unmappedStudios = new Map();
  const mergedStudios = new Map();
  const byCasino = new Map();
  const catalogue = new Map();
  const review = [];
  let rows = 0;
  let dupes = 0;
  let skippedDeleted = 0;
  let blankCasino = 0;
  let unconfirmedStudio = 0;

  const num = (v) => {
    const n = Number(String(v ?? "").replace("%", "").trim());
    return Number.isFinite(n) && n !== 0 ? n : null;
  };
  const int = (v) => {
    const n = parseInt(String(v ?? "").trim(), 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  for (const r of raw.slice(1)) {
    const name = (r[iGame] ?? "").trim();
    if (!name) continue;
    if (iDeleted !== -1 && /true/i.test(r[iDeleted] ?? "")) { skippedDeleted++; continue; }
    rows++;

    if (iDaily !== -1 && (r[iDaily] ?? "").trim()) rejected.observedRtp++;
    /* eslint-disable-next-line no-unused-expressions */
    if (iWeekly !== -1 && (r[iWeekly] ?? "").trim()) rejected.observedRtp++;
    if (iState !== -1 && /hot|cold/i.test(r[iState] ?? "")) rejected.hotCold++;
    if (iDesc !== -1 && (r[iDesc] ?? "").trim()) rejected.templatedCopy++;
    if (iRating !== -1 && (r[iRating] ?? "").trim()) rejected.constantRating++;

    const studioRaw = iProvider === -1 ? "" : (r[iProvider] ?? "").trim();
    const { base, integration } = splitStudio(studioRaw);

    // Not a slot: by supplier, on licence evidence.
    // `aliased` is resolved further down, so the canonical spelling is looked
    // up here rather than referenced before it exists.
    const canonical = STUDIO_ALIASES[key(base)] ?? base;
    const verdict = VERIFIED.get(key(base)) ?? VERIFIED.get(key(studioRaw)) ?? LICENCE_BACKED.get(key(canonical)) ?? LICENCE_BACKED.get(key(base));
    // Studios we checked and decided not to publish. The reason lives in
    // studio-verification.json so this stays a recorded decision rather than a
    // silent gap someone re-imports later.
    if (verdict?.exclude) {
      rejected.excludedStudio++;
      excluded.push({ name, studio: studioRaw, why: verdict.note });
      continue;
    }
    if (verdict?.status === "not-a-slot-studio") {
      rejected.notASlot++;
      excluded.push({ name, studio: studioRaw, why: verdict.note });
      continue;
    }
    const nonSlot = NON_SLOT_SUPPLIERS[key(base)] ?? NON_SLOT_SUPPLIERS[key(studioRaw)];
    if (nonSlot) {
      rejected.notASlot++;
      excluded.push({ name, studio: studioRaw, why: nonSlot });
      continue;
    }

    // Not a slot: by shape, for suppliers we have no ruling on. A slot has
    // reels or paylines and does not return 99%+.
    const rtpProbe = Number(String(r[iRtp] ?? "").replace("%", "").trim());
    const noReels = iReels === -1 || !parseInt(r[iReels] ?? "", 10);
    const noLines = iLines === -1 || !parseInt(r[iLines] ?? "", 10);
    if (Number.isFinite(rtpProbe) && rtpProbe >= 99 && noReels && noLines) {
      rejected.notSlotShaped++;
      excluded.push({ name, studio: studioRaw, why: REJECT.notSlotShaped });
      continue;
    }
    const aliased = STUDIO_ALIASES[key(base)] ?? base;
    // An integration suffix means authorship is unconfirmed, so the label is
    // recorded but never resolved to a studio page.
    const prov = !integration && aliased ? provBy.get(key(aliased)) : null;
    if (integration) {
      const set = mergedStudios.get(aliased) ?? new Set();
      set.add(studioRaw);
      mergedStudios.set(aliased, set);
      unconfirmedStudio++;
    } else if (aliased && !prov) {
      unmappedStudios.set(aliased, (unmappedStudios.get(aliased) ?? 0) + 1);
    }

    // Only a figure that could actually be a slot RTP.
    const rtpRaw = iRtp === -1 ? null : num(r[iRtp]);
    const rtp = rtpRaw !== null && rtpRaw >= 80 && rtpRaw <= 100 ? rtpRaw : null;
    if (rtpRaw !== null && rtp === null) rejected.implausibleRtp++;
    if (iRtp !== -1 && rtp === null) review.push({ name, studio: aliased, rtpBase: r[iRtp], why: REJECT.implausibleRtp });

    if (iImage !== -1) noteHost(assetHosts.image, r[iImage]);
    if (iDemo !== -1) noteHost(assetHosts.demo, r[iDemo]);

    const kind = classify(name);
    const game = {
      name,
      /** slot | table | house — so nothing lists Roulette among the slots. */
      kind,
      slug: iSlug !== -1 && (r[iSlug] ?? "").trim() ? r[iSlug].trim() : null,
      provider: prov?.name ?? aliased ?? null,
      // Null whenever authorship is unconfirmed, so nothing can link a game to
      // a studio page on the strength of a delivery label.
      providerSlug: integration ? null : prov?.slug ?? null,
      studioConfirmed: !integration,
      /**
       * From data/studio-verification.json, or from licence data already on
       * file. Forced to "unconfirmed" whenever the export only gave us a
       * delivery label: a game routed through Hacksaw's platform must not
       * inherit Hacksaw's licence, because Hacksaw may not have made it.
       */
      studioStatus: integration ? "unconfirmed" : verdict?.status ?? null,
      /** Where the credit probably belongs when the named studio only distributes. */
      studioCaveat: integration
        ? `Delivered via ${aliased} ${integration}. That names the platform, not the developer, so the studio is unconfirmed.`
        : verdict && verdict.status !== "licensed"
          ? verdict.note
          : null,
      integration: integration ? `${aliased} ${integration}` : null,
      rtp,
      volatility: iVol !== -1 && (r[iVol] ?? "").trim() ? r[iVol].trim().toLowerCase() : null,
      reels: iReels === -1 ? null : int(r[iReels]),
      rows: iRows === -1 ? null : int(r[iRows]),
      paylines: iLines === -1 ? null : int(r[iLines]),
      maxWinMultiplier: iMaxWin === -1 ? null : int(r[iMaxWin]),
      minBet: iMinBet === -1 ? null : num(r[iMinBet]),
      maxBet: iMaxBet === -1 ? null : num(r[iMaxBet]),
      released: iReleased !== -1 && /^\d{4}-\d{2}-\d{2}/.test(r[iReleased] ?? "") ? r[iReleased].slice(0, 10) : null,
      /**
       * Dated after the import, so not out yet. The export lists upcoming
       * titles alongside live ones with no flag distinguishing them — 43 of
       * 237 here, running two months ahead — and a player cannot play any of
       * them. Kept, because they are real and coming, but nothing may present
       * one as available.
       */
      upcoming: iReleased !== -1 && /^\d{4}-\d{2}-\d{2}/.test(r[iReleased] ?? "") ? r[iReleased].slice(0, 10) > AS_OF : false,
      image: iImage !== -1 && /^https?:/.test(r[iImage] ?? "") ? r[iImage].trim() : null,
    };

    if (MODE === "catalogue") {
      const gk = key(name) + "|" + key(game.provider ?? "");
      if (catalogue.has(gk)) dupes++;
      catalogue.set(gk, game);
      continue;
    }

    const casinoRaw = (r[iCasino] ?? "").trim();
    if (!casinoRaw) {
      // A blank cell is not an availability claim about anybody.
      blankCasino++;
      catalogue.set(key(name) + "|" + key(game.provider ?? ""), game);
      continue;
    }
    const op = opBy.get(key(casinoRaw));
    if (!op) { unknownCasinos.set(casinoRaw, (unknownCasinos.get(casinoRaw) ?? 0) + 1); continue; }
    const entry = byCasino.get(op.slug) ?? { slug: op.slug, games: new Map() };
    if (entry.games.has(key(name))) dupes++;
    entry.games.set(key(name), game);
    byCasino.set(op.slug, entry);
  }

  // ---------- report ----------
  console.log(`mode: ${MODE.toUpperCase()}${MODE === "catalogue" ? "  — no casino column, so this says nothing about who carries these games" : ""}`);
  console.log(`${rows} rows${dupes ? `, ${dupes} duplicate(s) collapsed` : ""}${skippedDeleted ? `, ${skippedDeleted} marked deleted and skipped` : ""}\n`);

  const dropped = Object.entries(rejected).filter(([, n]) => n > 0);
  if (dropped.length) {
    console.log("NOT IMPORTED — present in the CSV, wrong to publish as-is");
    for (const [k, n] of dropped) console.log(`  ${String(n).padStart(5)} × ${k}\n        ${REJECT[k]}`);
    console.log();
  }

  if (mergedStudios.size) {
    console.log(`STUDIO UNCONFIRMED (${unconfirmedStudio} games) — the label names the platform that DELIVERS`);
    console.log("the game, not who made it, so these do not link to a studio page:");
    for (const [base, vars] of mergedStudios) console.log(`  ${base}  ←  ${[...vars].join(", ")}`);
    console.log();
  }

  if (MODE === "catalogue") {
    const games = [...catalogue.values()].sort((a, b) => a.name.localeCompare(b.name));
    const studios = new Set(games.map((g) => g.providerSlug ?? g.provider).filter(Boolean));
    const field = (k) => games.filter((g) => g[k] !== null).length;
    const kinds = games.reduce((m, g) => ({ ...m, [g.kind]: (m[g.kind] ?? 0) + 1 }), {});
    console.log(`IMPORTED  ${games.length} games · ${studios.size} studios`);
    console.log(`  kinds            ${Object.entries(kinds).map(([k, n]) => `${n} ${k}`).join(" · ")}`);
    const byStatus = games.reduce((m, g) => ({ ...m, [g.studioStatus ?? "unchecked"]: (m[g.studioStatus ?? "unchecked"] ?? 0) + 1 }), {});
    console.log(`  studio status    ${Object.entries(byStatus).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n} ${k}`).join(" · ")}`);
    const soon = games.filter((g) => g.upcoming);
    if (soon.length) console.log(`  not out yet      ${soon.length} dated after ${AS_OF}, latest ${soon.map((g) => g.released).sort().pop()} — flagged upcoming, never present these as playable`);
    // The median only means anything across one kind of game.
    const slotRtp = games.filter((g) => g.kind === "slot" && g.rtp !== null).map((g) => g.rtp).sort((a, b) => a - b);
    if (slotRtp.length) console.log(`  slot RTP median  ${slotRtp[Math.floor(slotRtp.length / 2)].toFixed(2)}%  (n=${slotRtp.length})`);
    for (const k of ["rtp", "volatility", "reels", "paylines", "maxWinMultiplier", "released", "image"]) {
      console.log(`  ${k.padEnd(18)} ${String(field(k)).padStart(4)} / ${games.length}`);
    }
    reportUnknowns();
    console.log(`\nThis cannot support "casino X carries game Y". For that, re-export with a`);
    console.log(`casino column, or import one lobby at a time with --source naming it.`);
    if (!DRY) {
      fs.writeFileSync(OUT_CATALOGUE, JSON.stringify({ asOf: AS_OF, source: SOURCE ?? "game catalogue export", assetHosts: topHosts(), games }, null, 2) + "\n");
      if (KEEP && (review.length || excluded.length)) fs.writeFileSync(OUT_REVIEW, JSON.stringify({ rtpOutOfRange: review, notImported: excluded }, null, 2) + "\n");
      console.log(`\nwrote data/gameCatalogue.json (${games.length} games)${KEEP && review.length ? ` and gameCatalogue.review.json (${review.length})` : ""}`);
    }
    return finish();
  }

  // ---------- availability ----------
  const out = [...byCasino.values()]
    .map((e) => ({
      slug: e.slug,
      count: e.games.size,
      asOf: AS_OF,
      source: SOURCE ?? "operator lobby export",
      complete: COMPLETE,
      games: [...e.games.values()].sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  const prev = fs.existsSync(OUT_AVAIL) ? read("casinoGames.json") : [];
  const prevBy = new Map(prev.map((e) => [e.slug, new Set(e.games.map((g) => key(g.name)))]));
  const changes = [];
  for (const e of out) {
    const before = prevBy.get(e.slug);
    if (!before) { changes.push({ slug: e.slug, firstImport: true, added: e.games.length, removed: 0, addedGames: [], removedGames: [] }); continue; }
    const now = new Set(e.games.map((g) => key(g.name)));
    const added = e.games.filter((g) => !before.has(key(g.name))).map((g) => g.name);
    const removed = [...before].filter((k) => !now.has(k));
    if (added.length || removed.length) changes.push({ slug: e.slug, firstImport: false, added: added.length, removed: removed.length, addedGames: added.slice(0, 50), removedGames: removed.slice(0, 50) });
  }

  console.log(`IMPORTED  ${out.length} casinos · ${out.reduce((n, e) => n + e.count, 0)} availability entries · complete=${COMPLETE}`);
  if (blankCasino) console.log(`${blankCasino} row(s) had no casino — sent to the catalogue, not attributed to anyone`);
  for (const e of out.slice(0, 12)) {
    const studios = new Set(e.games.map((g) => g.providerSlug ?? g.provider).filter(Boolean));
    console.log(`  ${e.slug.padEnd(16)} ${String(e.count).padStart(5)} games · ${studios.size} studios`);
  }
  if (out.length > 12) console.log(`  … ${out.length - 12} more`);

  reportUnknowns();

  if (changes.length) {
    console.log(`\nCHANGES SINCE LAST IMPORT`);
    for (const c of changes.slice(0, 20)) {
      if (c.firstImport) console.log(`  ${c.slug.padEnd(16)} first import, ${c.added} games`);
      else console.log(`  ${c.slug.padEnd(16)} +${c.added} / −${c.removed}${c.addedGames.length ? `   new: ${c.addedGames.slice(0, 5).join(", ")}${c.addedGames.length > 5 ? " …" : ""}` : ""}`);
    }
    if (!COMPLETE) console.log(`\n  note: complete=false, so "−" means the game left this export, not the lobby.`);
  }
  if (!COMPLETE) console.log(`\nAll casinos recorded complete:false — a missing game means "not seen", not "not offered".`);

  if (!DRY) {
    fs.writeFileSync(OUT_AVAIL, JSON.stringify(out, null, 2) + "\n");
    fs.writeFileSync(CHANGES, JSON.stringify({ importedAt: AS_OF, complete: COMPLETE, changes }, null, 2) + "\n");
    if (catalogue.size) fs.writeFileSync(OUT_CATALOGUE, JSON.stringify({ asOf: AS_OF, source: SOURCE ?? "game catalogue export", games: [...catalogue.values()].sort((a, b) => a.name.localeCompare(b.name)) }, null, 2) + "\n");
    console.log(`\nwrote data/casinoGames.json (${out.length} casinos) and data/casinoGames.changes.json`);
  }
  return finish();

  /**
   * The hosts the export's own image and demo links point at, commonest first.
   *
   * Stored with the data because it is the only durable evidence of where the
   * rows really came from — a `source` string is an assertion, this is a
   * measurement. If these are an operator's CDN rather than the studios', the
   * RTPs are that operator's configured versions and must be labelled as such
   * before anything publishes them as a studio's published figure.
   */
  function topHosts() {
    const top = (m) => Object.fromEntries([...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8));
    return { image: top(assetHosts.image), demo: top(assetHosts.demo) };
  }

  function reportUnknowns() {
    if (unknownCasinos.size) {
      console.log(`\nUNMATCHED CASINOS (${unknownCasinos.size}) — rows skipped`);
      for (const [n, c] of [...unknownCasinos.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)) console.log(`  ${String(c).padStart(6)}  ${n}`);
    }
    if (unmappedStudios.size) {
      console.log(`\nSTUDIOS NOT YET PROFILED (${unmappedStudios.size}) — kept as text; they will not link to a provider page`);
      for (const [n, c] of [...unmappedStudios.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(`  ${String(c).padStart(6)}  ${n}`);
    }
  }

  function finish() {
    if (DRY) console.log(`\n--dry-run: nothing written`);
  }
}

main();
