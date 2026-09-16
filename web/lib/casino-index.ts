/**
 * Ported from the `isBtc` block in CryptoSlotGuide.dc.html (search for
 * `<sc-if value="{{ isBtc }}"`) plus `btcViews`, `filterFns`, `decorate()`,
 * `sortList()` and the `btc*` renderVals keys. This is the crypto-casino
 * index — "six views off one dataset" per design/README.md's routing map:
 * /crypto-casinos, /crypto-casinos/no-kyc, /fastest-payouts,
 * /lowest-wagering, /casino-sportsbooks, /esports-casinos.
 */
import { wagerView, compareWager } from "./wager";
import type { Operator } from "./types";
import { comparePayout, payoutView } from "./payout";

export type BtcFilterKey = "all" | "nokyc" | "fast" | "lowwager" | "sports" | "esports";

export const btcViews: Record<BtcFilterKey, { crumb: string; kicker: string; h1: string; p: string; note: string }> = {
  all: {
    crumb: "Crypto casinos",
    kicker: "operators · 8 coins tracked",
    h1: "Best crypto casinos, compared on payout speed",
    p: "Which cryptos each operator credits, the confirmations it waits for, and whether Lightning works — the three things that decide how long you wait. Withdrawal times are each operator's own stated figure, cited on its review; we haven't timed them on our own funded accounts yet.",
    note: "Showing operators that credit ",
  },
  nokyc: {
    crumb: "No-KYC casinos",
    kicker: "no-KYC operators · listed policy",
    h1: "No-KYC crypto casinos",
    p: "Operators listed as paying withdrawals without asking for a document. That's their listed policy — we haven't yet cashed out on our own account to confirm it. Operators that verify at a threshold are excluded, however high that threshold is.",
    note: "No-KYC operators that credit ",
  },
  fast: {
    crumb: "Fastest payouts",
    kicker: "operators stating 15 minutes or less",
    h1: "Fastest-paying crypto casinos",
    p: "Ranked on each operator's own stated withdrawal time — the worst case where it gives a range — cited on its review page. We haven't timed these ourselves, and operators that publish no time are left out rather than guessed. When we field-test an operator, its timed median replaces the stated figure.",
    note: "Operators stating 15 minutes or less that credit ",
  },
  lowwager: {
    crumb: "Lowest wagering",
    kicker: "operators at 1× wagering",
    h1: "Crypto casinos with 1× bonus wagering",
    p: "Wagering is the only bonus term that decides whether an offer is worth taking. These operators clear at 1× turnover — the bonus is effectively cash — instead of the 35× to 45× that makes a headline number meaningless.",
    note: "1× wagering operators that credit ",
  },
  sports: {
    crumb: "Casino + sportsbook",
    kicker: "operators with a sportsbook",
    h1: "Crypto casinos with a sportsbook attached",
    p: "Operators listed with a sportsbook alongside the casino. We haven't yet priced margins ourselves across football, basketball and tennis, or checked market depth beyond what each operator lists.",
    note: "Sportsbook operators that credit ",
  },
  esports: {
    crumb: "Esports betting",
    kicker: "operators with esports markets",
    h1: "Crypto casinos that take esports bets",
    p: "Operators listed with CS2, League of Legends, Dota 2 or Valorant markets alongside the casino. Market depth outside the majors and how quickly a settled map pays are not yet checked by us.",
    note: "Esports operators that credit ",
  },
};

export const filterFns: Record<BtcFilterKey, (o: Operator) => boolean> = {
  all: () => true,
  nokyc: (o) => o.kyc === "none",
  sports: (o) => o.sports,
  esports: (o) => o.esports,
  fast: (o) => { const p = payoutView(o); return p.mins !== null && p.mins <= 15; },
  lowwager: (o) => { const w = wagerView(o); return w.kind === "none" || (w.mult !== null && w.mult <= 1); },
};

/** No score sort — the site doesn't score casinos. Sorts are on cited facts or name. */
export type SortKey = "payout" | "wager" | "name";
export type SortDir = "asc" | "desc";

export function sortOps(list: Operator[], key: SortKey, dir: SortDir): Operator[] {
  const d = dir === "asc" ? 1 : -1;
  const out = [...list];
  if (key === "wager") out.sort((a, b) => (d === 1 ? compareWager(a, b) : compareWager(b, a)));
  else if (key === "payout") out.sort((a, b) => (d === 1 ? comparePayout(a, b) : comparePayout(b, a)));
  else if (key === "name") out.sort((a, b) => a.name.localeCompare(b.name) * d);
  return out;
}

export function kycStyle(kyc: Operator["kyc"]): { kycBg: string; kycColor: string } {
  if (kyc === "none") return { kycBg: "rgba(0,194,204,.14)", kycColor: "#5FE3E8" };
  if (kyc === "tiered") return { kycBg: "rgba(255,255,255,.06)", kycColor: "#B7C4CB" };
  return { kycBg: "rgba(196,101,58,.14)", kycColor: "#DA9877" };
}

/** @deprecated import from lib/logo.ts directly — kept here so existing `import { logoFor } from "@/lib/casino-index"` call sites don't all need touching. */
export { logoFor } from "./logo";

/** Median payout stat block above the table, computed against the currently filtered list. */
export function btcStats(list: Operator[]): { v: string; l: string }[] {
  return [
    { v: String(list.filter((o) => payoutView(o).kind !== "none").length), l: "state a withdrawal time" },
    { v: String(list.filter((o) => o.conf === 1).length), l: "clear at 1 confirmation" },
    { v: String(list.filter((o) => o.ln).length), l: "support Lightning" },
    { v: String(list.filter((o) => wagerView(o).kind === "cited").length), l: "state a bonus wagering figure" },
  ];
}
