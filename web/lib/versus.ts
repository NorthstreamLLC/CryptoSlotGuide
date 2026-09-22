import { siteData } from "@/lib/site-data";
import { casinoFacts, maxWithdrawal } from "@/lib/casino-facts";
import { getSpecFact } from "@/lib/spec-sheet";
import { raceFor, partnerFor, dropFor } from "@/lib/races";
import { rtpSummary } from "@/lib/rtp-watch-view";
import type { Operator } from "@/lib/types";

/** The casinos we build head-to-head pages for: the ones players compare most. */
export const VERSUS_SLUGS = ["roobet", "stake", "bc-game", "shuffle", "rollbit", "gamdom", "duelbits", "rainbet", "razed", "winna", "thrill", "duel", "goated", "500-casino", "bitstarz"];

const op = (slug: string) => siteData.ops.find((o) => o.slug === slug) ?? null;

/** Every pair once, in a stable order so each pair has one canonical URL. */
export function versusPairs(): [string, string][] {
  const out: [string, string][] = [];
  const list = VERSUS_SLUGS.filter((s) => op(s));
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) out.push([list[i], list[j]]);
  return out;
}

export const pairSlug = (a: string, b: string) => `${a}-vs-${b}`;

/**
 * The head-to-head pages a casino appears on, in VERSUS_SLUGS order so the
 * casinos players compare most come first. Empty for a casino with no pair page.
 */
export function rivalPairs(slug: string, limit = 3): { rival: Operator; href: string }[] {
  return versusPairs()
    .filter(([a, b]) => a === slug || b === slug)
    .map(([a, b]) => ({ rival: op(a === slug ? b : a)!, href: `/compare/${pairSlug(a, b)}` }))
    .slice(0, limit);
}

export function parsePair(pair: string): [Operator, Operator] | null {
  for (const [a, b] of versusPairs()) if (pairSlug(a, b) === pair) return [op(a)!, op(b)!];
  return null;
}

export interface VersusRow {
  label: string;
  a: string | null;
  b: string | null;
  /** Which side is better on this row, when it can be judged from the numbers alone. */
  edge?: "a" | "b" | null;
}

const has = (slug: string, g: string, l: string) => !!getSpecFact(slug, g, l);

/** Side-by-side rows, each value from the same cited facts the casino reports use. */
export function versusRows(a: Operator, b: Operator): VersusRow[] {
  const fa = casinoFacts(a), fb = casinoFacts(b);
  const mins = (o: Operator) => o.payoutStatedMaxMins ?? null;
  const lower = (x: number | null, y: number | null): "a" | "b" | null => (x == null || y == null || x === y ? null : x < y ? "a" : "b");
  const higher = (x: number, y: number): "a" | "b" | null => (x === y ? null : x > y ? "a" : "b");
  const wag = (o: Operator) => (/No wagering/.test(casinoFacts(o).wagering ?? "") ? 0 : o.wager ?? null);
  const monthly = (o: Operator) => raceFor(o.slug)?.monthly ?? 0;
  const yes = (o: Operator, g: string, l: string) => (has(o.slug, g, l) ? "Yes" : null);
  const rtp = (o: Operator) => {
    const r = rtpSummary(o.slug);
    return r ? (r.cut ? `Reduced on ${r.cut} of ${r.count} slots` : `Full RTP on ${r.count} slots`) : null;
  };
  return [
    { label: "Welcome offer", a: fa.headline, b: fb.headline },
    { label: "Wagering", a: fa.wagering, b: fb.wagering, edge: lower(wag(a), wag(b)) },
    { label: "Withdrawals", a: fa.withdrawals, b: fb.withdrawals, edge: lower(mins(a), mins(b)) },
    { label: "Withdrawal fee", a: fa.fee, b: fb.fee },
    { label: "Min deposit", a: fa.minDeposit, b: fb.minDeposit },
    { label: "Max withdrawal", a: maxWithdrawal(a.slug), b: maxWithdrawal(b.slug) },
    { label: "Races & raffles", a: raceFor(a.slug)?.label ?? null, b: raceFor(b.slug)?.label ?? null, edge: monthly(a) || monthly(b) ? higher(monthly(a), monthly(b)) : null },
    { label: "Reward drops", a: dropFor(a.slug), b: dropFor(b.slug) },
    { label: "Coins accepted", a: fa.coins.length ? String(fa.coins.length) : null, b: fb.coins.length ? String(fb.coins.length) : null, edge: fa.coins.length && fb.coins.length ? higher(fa.coins.length, fb.coins.length) : null },
    { label: "Sportsbook", a: a.sports ? "Yes" : "No", b: b.sports ? "Yes" : "No" },
    { label: "Prediction markets", a: yes(a, "Sportsbook", "Prediction markets") ?? "No", b: yes(b, "Sportsbook", "Prediction markets") ?? "No" },
    { label: "Slot RTP", a: rtp(a), b: rtp(b) },
    { label: "KYC", a: fa.kyc, b: fb.kyc },
    { label: "Licence", a: fa.licence, b: fb.licence },
    { label: "Official partners", a: partnerFor(a.slug), b: partnerFor(b.slug) },
  ];
}
