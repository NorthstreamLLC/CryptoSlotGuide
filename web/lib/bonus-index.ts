/**
 * The Bonus True-Cost Index (/bonuses/true-cost-index): what each first-deposit
 * match bonus asks for, worked out per $100 deposited.
 *
 * Every number here is read from one stored fact in data/casinoSpecSheets.json
 * ("Bonus terms / Wagering" for the multiplier and what it applies to, and the
 * fact named in `matchFrom` for the match percentage). The page shows each
 * fact's source link, and the monthly re-check covers those facts: when one
 * changes, update the row here to match.
 */

export type WagerBase = "deposit+bonus" | "bonus" | "deposit";

export type IndexRow = {
  slug: string;
  /** First-deposit match, as a fraction (1 = 100%). */
  match: number;
  /** Wagering multiplier. */
  mult: number;
  /** What the multiplier applies to. */
  base: WagerBase;
  /** The Bonus terms fact the match percentage comes from. */
  matchFrom: "Standing offer" | "Wagering";
  /**
   * Bets count by house edge against this baseline (wager × edge ÷ baseline),
   * so finishing the wagering costs the same expected amount on every game:
   * baseline × the wagering. Read from the "Game contribution" or "Wagering
   * rules" fact.
   */
  edgeBase?: number;
  /** One short, sourced caveat shown under the row. */
  note?: string;
};

/** First-deposit match bonuses whose terms state the match, the multiplier and its base. */
export const INDEX_ROWS: IndexRow[] = [
  { slug: "1win", match: 1, mult: 30, base: "bonus", matchFrom: "Wagering" },
  { slug: "bitcasino-io", match: 1, mult: 30, base: "bonus", matchFrom: "Standing offer", note: "Its own Reward Terms page says it offers no deposit or welcome rewards, contradicting the promotion page." },
  { slug: "coincasino", match: 2, mult: 60, base: "deposit", matchFrom: "Wagering", note: "The bonus is released in 10% instalments, each time you wager 6× the deposit." },
  { slug: "mbit", match: 1, mult: 40, base: "bonus", matchFrom: "Standing offer", note: "Bonus funds work on slots only, and the bonus is valid for 1 day unless a promotion says otherwise." },
  { slug: "betplay", match: 1, mult: 60, base: "deposit", matchFrom: "Standing offer", note: "The bonus is paid once the wagering is done, then withdrawable straight away." },
  { slug: "degen", match: 1, mult: 30, base: "deposit+bonus", matchFrom: "Standing offer", edgeBase: 0.04, note: "Needs an account registered under an eligible referral code." },
  { slug: "flush", match: 1, mult: 30, base: "deposit+bonus", matchFrom: "Wagering", note: "This is the $10–$200 tier; the 150% tier for $200–$1,000 deposits uses 35×." },
  { slug: "jackpotbet", match: 1, mult: 35, base: "deposit+bonus", matchFrom: "Standing offer", edgeBase: 0.035 },
  { slug: "shock", match: 1, mult: 35, base: "deposit+bonus", matchFrom: "Standing offer", edgeBase: 0.04, note: "Not on its promotions page; you ask support for the bonus after depositing." },
  { slug: "yeet", match: 1, mult: 35, base: "deposit+bonus", matchFrom: "Standing offer", edgeBase: 0.04 },
  { slug: "rainbet", match: 1, mult: 40, base: "deposit+bonus", matchFrom: "Wagering", note: "Games above 97.4% RTP are disabled while the bonus is active." },
  { slug: "razed", match: 1, mult: 40, base: "deposit+bonus", matchFrom: "Standing offer", note: "The match starts at a $100 deposit." },
];

/** Bonuses that unlock a little with every bet instead of after a multiplier. */
export const UNLOCK_ROWS: { slug: string; match: number; per: number; from: "Wagering" | "Wagering rules" }[] = [
  // $1 per $400 wagered, on a 300% "rakeback boost".
  { slug: "500-casino", match: 3, per: 400, from: "Wagering rules" },
  // 1 USDB per $1,000 wagered, on a 180% first-deposit match.
  { slug: "solcasino", match: 1.8, per: 1000, from: "Wagering rules" },
];

/** Welcome bonuses left out because the terms don't say what the multiplier applies to, or give two different multipliers. */
export const UNCLEAR_SLUGS = ["bitstarz", "betfury", "sportsbet-io", "7bit"];

/** Programmes that pay rewards with no wagering instead of a deposit match. */
export const NO_WAGER_SLUGS = ["cloudbet", "housebets", "spartans", "whale-io", "roobet", "stake"];

export const DEPOSIT = 100;
export const RTP = 0.96;

export function cost(r: IndexRow) {
  const bonus = DEPOSIT * r.match;
  const baseAmt = r.base === "deposit+bonus" ? DEPOSIT + bonus : r.base === "bonus" ? bonus : DEPOSIT;
  const bets = r.mult * baseAmt;
  // Edge-weighted terms fix the cost whatever you play; otherwise assume a 96% RTP slot.
  const expectedCost = bets * (r.edgeBase ?? 1 - RTP);
  // The RTP a game would need for the bonus to pay on average (none when every game costs the same).
  const breakEven = r.edgeBase ? null : 1 - bonus / bets;
  return { bonus, bets, expectedCost, net: bonus - expectedCost, breakEven };
}

export const BASE_LABEL: Record<WagerBase, string> = {
  "deposit+bonus": "deposit + bonus",
  bonus: "bonus only",
  deposit: "deposit only",
};
