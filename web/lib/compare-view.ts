/**
 * Ported from the `isCompare` block in CryptoSlotGuide.dc.html plus
 * `cmpDefs`/`cmpScore`/`cmpRows`/`cmpHeads` in renderVals() (search for
 * (search for "Compare builder" comment block). Winner-per-row logic matches exactly: lower
 * is better on payout/wagering/confirmations, higher on score/coins,
 * licence and headline offer are deliberately never marked.
 */
import type { Operator } from "./types";
import type { CoinsByOperator } from "./types";
import { SCORE_BRAND } from "./score-tier";

export interface CompareCell {
  v: string;
  color: string;
  weight: string;
  bg: string;
}

export interface CompareRow {
  label: string;
  cells: CompareCell[];
}

type ScoreKind = "high" | "lowPayout" | "highCoins" | "lowWager" | "kyc" | "lowConf" | "yes" | "none";

export function getCompareRows(cmpOps: Operator[], coinsBy: CoinsByOperator): CompareRow[] {
  const defs: [string, (o: Operator) => string, ScoreKind][] = [
    [SCORE_BRAND, (o) => o.score.toFixed(1), "high"],
    ["Median withdrawal", (o) => o.payoutLabel, "lowPayout"],
    ["Coins credited", (o) => String((coinsBy[o.slug] ?? []).length), "highCoins"],
    ["Wagering", (o) => `${o.wager}×`, "lowWager"],
    ["KYC", (o) => o.kyc, "kyc"],
    ["Confirmations", (o) => String(o.conf), "lowConf"],
    ["Lightning", (o) => (o.ln ? "Yes" : "No"), "yes"],
    ["Sportsbook", (o) => (o.sports ? "Yes" : "No"), "yes"],
    ["Esports", (o) => (o.esports ? "Yes" : "No"), "yes"],
    ["Licence", (o) => o.licence, "none"],
    ["Headline offer", (o) => o.bonus, "none"],
  ];

  const score: Record<ScoreKind, (o: Operator) => number | null> = {
    high: (o) => o.score,
    lowPayout: (o) => -o.payout,
    highCoins: (o) => (coinsBy[o.slug] ?? []).length,
    lowWager: (o) => -o.wager,
    kyc: (o) => (o.kyc === "none" ? 2 : o.kyc === "tiered" ? 1 : 0),
    lowConf: (o) => -o.conf,
    yes: () => 0,
    none: () => null,
  };

  return defs.map(([label, get, kind]) => {
    let bestVal: number | null = null;
    if (kind !== "none" && kind !== "yes" && cmpOps.length) {
      bestVal = Math.max(...cmpOps.map((o) => score[kind](o) ?? -Infinity));
    }
    return {
      label,
      cells: cmpOps.map((o) => {
        const v = get(o);
        const winner = kind === "yes" ? v === "Yes" : bestVal !== null && score[kind](o) === bestVal && cmpOps.length > 1;
        return { v, color: winner ? "#5FE3E8" : "#B7C4CB", weight: winner ? "700" : "400", bg: winner ? "rgba(0,194,204,.08)" : "transparent" };
      }),
    };
  });
}
