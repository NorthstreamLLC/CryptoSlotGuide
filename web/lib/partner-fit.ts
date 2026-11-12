import { siteData } from "./site-data";
import { getSpecFact } from "./spec-sheet";
import { accessIn } from "./legal";
import { payoutView } from "./payout";
import { wagerView } from "./wager";
import { inHouseOrder } from "./house-order";
import coinsBy from "@/data/coinsBy.json";
import type { Operator } from "./types";

/**
 * Which partner to put on a page: the one that fits it, not the same casino
 * everywhere.
 *
 * Each partner scores on what the page is about (takes this coin, runs a
 * sportsbook, publishes edges for its originals, is similar to the casino
 * being reviewed) and on the two things every player weighs (withdrawal speed,
 * wagering). Equal scores are broken by a hash of the page's own key, so two
 * slot pages with nothing to tell the partners apart show different ones, and
 * each page shows the same one on every visit. House order is only a small
 * weight inside that, so commercial priority leans a list without deciding it.
 *
 * A partner is never scored for a claim we have no data for: there is no
 * casino-to-studio mapping on file, so a slot page never says "carries this
 * game".
 */

export type PartnerContext =
  | { kind: "coin"; ticker: string }
  | { kind: "sports" }
  | { kind: "esports" }
  | { kind: "slots" }
  | { kind: "house" }
  | { kind: "wallet" }
  | { kind: "general" }
  /** The casino whose review this is: partners like it, with a reason each. */
  | { kind: "alternative"; of: string };

export interface PartnerPick {
  o: Operator;
  pitch: string;
  score: number;
}

const COINS = coinsBy as Record<string, string[]>;
const KYC_RANK: Record<string, number> = { none: 0, tiered: 1, required: 2 };

/** A stable 0–1 number per (page, partner): the rotation. */
function jitter(seed: string, slug: string): number {
  let h = 2166136261;
  for (const c of `${seed}|${slug}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

const payoutMins = (o: Operator) => payoutView(o).mins;
const wagerMult = (o: Operator) => {
  const w = wagerView(o);
  return w.kind === "cited" ? w.mult : null;
};

/** Withdrawal speed and wagering, the line every placement can fall back on. */
export function defaultPitch(o: Operator): string | null {
  const pv = payoutView(o);
  const wv = wagerView(o);
  const parts: string[] = [];
  if (pv.kind !== "none") parts.push(`${pv.label} withdrawals`);
  if (wv.kind !== "unknown") parts.push(wv.label.toLowerCase());
  if (!parts.length) return null;
  const line = parts.join(" · ");
  return line.charAt(0).toUpperCase() + line.slice(1);
}

/**
 * Points every partner can earn: fast withdrawals, nothing to wager. A casino
 * with no deposit bonus has nothing to wager either, so it scores like "no
 * wagering" rather than losing to the one casino that cites a zero. Coarse on
 * purpose: these separate good partners from slow or heavy-wagering ones, and
 * the rotation does the rest.
 */
function baseScore(o: Operator): number {
  let s = 0;
  const m = payoutMins(o);
  s += m === null ? 0.3 : m <= 15 ? 1 : m <= 60 ? 0.6 : 0;
  const w = wagerView(o);
  s += w.kind === "none" || (w.kind === "cited" && w.mult === 0) ? 1 : w.kind === "note" ? 0.6 : w.kind === "cited" && (w.mult ?? 99) <= 30 ? 0.3 : 0;
  return s;
}

/** Context points and the line saying why, or null where the partner has nothing for this page. */
function fit(o: Operator, ctx: PartnerContext): { pts: number; pitch: string | null } {
  const spec = (group: string, label: string) => getSpecFact(o.slug, group, label)?.value ?? null;
  switch (ctx.kind) {
    case "coin": {
      const list = (COINS[o.slug] ?? []).map(String);
      if (!list.includes(ctx.ticker.toUpperCase())) return { pts: -3, pitch: null };
      return { pts: 3, pitch: `Takes ${ctx.ticker.toUpperCase()} deposits and withdrawals, alongside ${list.length - 1} other coins.` };
    }
    case "sports": {
      const v = o.sports ? spec("Sportsbook", "Sportsbook") : null;
      return o.sports ? { pts: 3, pitch: v } : { pts: -3, pitch: null };
    }
    case "esports": {
      const v = o.esports ? spec("Sportsbook", "Esports titles") ?? spec("Sportsbook", "Esports") : null;
      return o.esports ? { pts: 3, pitch: v } : { pts: -3, pitch: null };
    }
    case "house": {
      const own = siteData.houseGames
        .map((g) => ({ name: g.name, edge: g.edges.find((e) => e.casino === o.slug)?.value }))
        .filter((x): x is { name: string; edge: string } => !!x.edge);
      if (!own.length) return { pts: -1, pitch: null };
      return { pts: Math.min(3, own.length), pitch: `Publishes its own edge for ${own.slice(0, 3).map((x) => `${x.name} (${x.edge})`).join(", ")}.` };
    }
    case "wallet": {
      const n = (COINS[o.slug] ?? []).length;
      if (!n) return { pts: 0, pitch: null };
      return { pts: n / 8 + (o.ln ? 1 : 0), pitch: `Takes ${n} coins for deposits and withdrawals${o.ln ? ", including Bitcoin over Lightning" : ""}.` };
    }
    case "alternative":
      return alternativeFit(o, ctx.of);
    case "slots":
    case "general":
    default:
      return { pts: 0, pitch: null };
  }
}

/**
 * How a partner compares with the casino whose review this is: lighter ID
 * checks, faster withdrawals, lower wagering, the same coins, a sportsbook
 * where the reviewed casino has one. Only differences the data shows.
 */
function alternativeFit(p: Operator, of: string): { pts: number; pitch: string | null } {
  const x = siteData.ops.find((o) => o.slug === of);
  if (!x) return { pts: 0, pitch: null };
  const reasons: string[] = [];
  let pts = 0;

  const kp = KYC_RANK[p.kyc] ?? 1;
  const kx = KYC_RANK[x.kyc] ?? 1;
  if (kp < kx) {
    pts += 1.5;
    reasons.push(p.kyc === "none" ? "No ID check by default" : "Lighter ID checks");
  } else if (kp > kx) pts -= 1;

  const mp = payoutMins(p);
  const mx = payoutMins(x);
  if (mp !== null && mx !== null && mp < mx) {
    pts += 1;
    reasons.push(`${payoutView(p).label} withdrawals`);
  }

  const wp = wagerMult(p);
  const wx = wagerMult(x);
  if (wp !== null && wx !== null && wp < wx) {
    pts += 1;
    reasons.push(wp === 0 ? "no wagering" : `lower wagering (${wp}× against ${wx}×)`);
  }

  const cx = new Set((COINS[x.slug] ?? []).map(String));
  const shared = (COINS[p.slug] ?? []).filter((c) => cx.has(String(c))).length;
  if (cx.size) {
    // Scored, not stated: the coin lists on file are each casino's leading
    // coins, capped, so "8 of the same coins" would read as more than it is.
    pts += shared / cx.size;
  }

  // Most partners run a sportsbook, so it only fills a line that has room.
  if (x.sports) {
    if (p.sports) {
      pts += 0.5;
      if (reasons.length < 2) reasons.push("a sportsbook too");
    } else pts -= 1;
  }

  if (!reasons.length) return { pts, pitch: null };
  // A sportsbook alone says little; lead with the partner's own speed and wagering.
  if (reasons.length === 1 && reasons[0] === "a sportsbook too") {
    const d = defaultPitch(p);
    if (d) return { pts, pitch: `${d} · a sportsbook too` };
  }
  const line = reasons.slice(0, 2).join(" · ");
  return { pts, pitch: line.charAt(0).toUpperCase() + line.slice(1) };
}

const firstSentence = (s: string, max = 190): string => {
  const cut = s.split(/(?<=\.)\s+/)[0] ?? s;
  return cut.length > max ? `${cut.slice(0, max - 1).replace(/[\s,;-]+$/, "")}…` : cut;
};

/**
 * Partners for a page, best fit first. `country` drops those that turn that
 * country away (pages about one place); visitor geo is applied in the browser
 * by GeoRanked, so callers ask for a few more than they show.
 */
export function pickPartners({
  context = { kind: "general" },
  seed,
  exclude = [],
  country,
  limit = 6,
}: {
  context?: PartnerContext;
  /** The page's own key (its slug); decides ties, so pages rotate. */
  seed?: string;
  exclude?: string[];
  country?: string;
  limit?: number;
}): PartnerPick[] {
  const pool = inHouseOrder(siteData.ops.filter((o) => o.affiliate && o.signupUrl && !exclude.includes(o.slug))).filter(
    (o) => !(country && accessIn(o.slug, country) === "restricted")
  );
  const key = seed ?? JSON.stringify(context);
  return pool
    .map((o, rank) => {
      const f = fit(o, context);
      const raw = f.pitch ?? defaultPitch(o);
      if (!raw) return null;
      // House order: at most 0.3, well under one fit point, so it leans and
      // never decides; the page's own rotation (up to 1.2) outweighs it.
      const house = 0.3 * (1 - rank / Math.max(1, pool.length));
      return { o, pitch: firstSentence(raw), score: f.pts + baseScore(o) + house + 1.2 * jitter(key, o.slug) };
    })
    .filter((r): r is PartnerPick => !!r)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
