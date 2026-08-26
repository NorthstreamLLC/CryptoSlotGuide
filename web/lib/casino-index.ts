/**
 * Ported from the `isBtc` block in CryptoSlotGuide.dc.html (search for
 * `<sc-if value="{{ isBtc }}"`) plus `btcViews`, `filterFns`, `decorate()`,
 * `sortList()` and the `btc*` renderVals keys. This is the crypto-casino
 * index — "six views off one dataset" per design/README.md's routing map:
 * /crypto-casinos, /crypto-casinos/no-kyc, /fastest-payouts,
 * /lowest-wagering, /casino-sportsbooks, /esports-casinos.
 */
import type { Operator } from "./types";

export type BtcFilterKey = "all" | "nokyc" | "fast" | "lowwager" | "sports" | "esports";

export const btcViews: Record<BtcFilterKey, { crumb: string; kicker: string; h1: string; p: string; note: string }> = {
  all: {
    crumb: "Crypto casinos",
    kicker: "operators · 8 coins tracked · updated 24 Aug 2026",
    h1: "Best crypto casinos, ranked by verified payout speed",
    p: "Every operator here was tested with real on-chain withdrawals, coin by coin. We list which cryptos each one actually credits, the confirmations it waits for, and whether Lightning works — the three things that decide how long you wait.",
    note: "Showing operators that credit ",
  },
  nokyc: {
    crumb: "No-KYC casinos",
    kicker: "no-KYC operators · verified at withdrawal · updated 24 Aug 2026",
    h1: "No-KYC crypto casinos, verified by withdrawing",
    p: 'These operators took a deposit and paid a withdrawal without asking for a document. Nothing here is on the list because a marketing page claims "no KYC" — we cashed out to confirm it. Operators that verify at a threshold are excluded, however high that threshold is.',
    note: "No-KYC operators that credit ",
  },
  fast: {
    crumb: "Fastest payouts",
    kicker: "operators under 6 minutes · timed · updated 24 Aug 2026",
    h1: "Fastest-paying crypto casinos, timed to the second",
    p: "Median time from a confirmed withdrawal request to the first on-chain broadcast, measured across three withdrawal sizes. Network congestion is excluded, so the number reflects the operator's own batching and review policy.",
    note: "Sub-6-minute operators that credit ",
  },
  lowwager: {
    crumb: "Lowest wagering",
    kicker: "operators at 1× wagering · updated 24 Aug 2026",
    h1: "Crypto casinos with 1× bonus wagering",
    p: "Wagering is the only bonus term that decides whether an offer is worth taking. These operators clear at 1× turnover — the bonus is effectively cash — instead of the 35× to 45× that makes a headline number meaningless.",
    note: "1× wagering operators that credit ",
  },
  sports: {
    crumb: "Casino + sportsbook",
    kicker: "operators with a sportsbook · updated 24 Aug 2026",
    h1: "Crypto casinos with a real sportsbook attached",
    p: 'One balance across casino and sports, with margins we priced ourselves across football, basketball and tennis. Operators whose "sportsbook" is a white-label iframe with three markets are not on this list.',
    note: "Sportsbook operators that credit ",
  },
  esports: {
    crumb: "Esports betting",
    kicker: "operators with esports markets · updated 24 Aug 2026",
    h1: "Crypto casinos that take esports bets",
    p: "CS2, League of Legends, Dota 2 and Valorant markets on the same balance as the casino, judged on market depth outside the majors and how quickly a settled map pays.",
    note: "Esports operators that credit ",
  },
};

export const filterFns: Record<BtcFilterKey, (o: Operator) => boolean> = {
  all: () => true,
  nokyc: (o) => o.kyc === "none",
  sports: (o) => o.sports,
  esports: (o) => o.esports,
  fast: (o) => o.payout <= 6,
  lowwager: (o) => o.wager <= 1,
};

export type SortKey = "rank" | "score" | "payout" | "name";
export type SortDir = "asc" | "desc";

export function sortOps(list: Operator[], key: SortKey, dir: SortDir): Operator[] {
  const d = dir === "asc" ? 1 : -1;
  const out = [...list];
  if (key === "rank") out.sort((a, b) => b.score - a.score);
  else if (key === "score") out.sort((a, b) => (b.score - a.score) * d);
  else if (key === "payout") out.sort((a, b) => (a.payout - b.payout) * d);
  else if (key === "name") out.sort((a, b) => a.name.localeCompare(b.name) * d);
  return out;
}

export function kycStyle(kyc: Operator["kyc"]): { kycBg: string; kycColor: string } {
  if (kyc === "none") return { kycBg: "rgba(0,194,204,.14)", kycColor: "#5FE3E8" };
  if (kyc === "tiered") return { kycBg: "rgba(255,255,255,.06)", kycColor: "#B7C4CB" };
  return { kycBg: "rgba(196,101,58,.14)", kycColor: "#DA9877" };
}

export function logoFor(slug: string): string {
  return slug === "roobet" ? "/assets/roobet-logo.png" : `/assets/logos/${slug}.png`;
}

/** Median payout stat block above the table, computed against the currently filtered list. */
export function btcStats(list: Operator[]): { v: string; l: string }[] {
  const p = [...list.map((o) => o.payout)].sort((a, b) => a - b);
  const mid = p.length ? (p.length % 2 ? p[(p.length - 1) / 2] : (p[p.length / 2 - 1] + p[p.length / 2]) / 2) : 0;
  const m = Math.floor(mid);
  const sec = Math.round((mid - m) * 60);
  return [
    { v: `${m}m ${String(sec).padStart(2, "0")}s`, l: "median payout here" },
    { v: String(list.filter((o) => o.conf === 1).length), l: "clear at 1 confirmation" },
    { v: String(list.filter((o) => o.ln).length), l: "support Lightning" },
    { v: String(list.filter((o) => o.wager === 1).length), l: "at 1× wagering" },
  ];
}
