/**
 * The /rakeback-casinos comparison. Each row restates spec-sheet facts (by
 * group + label), which supply its source links; `href` covers the one rate
 * that lives in a help article rather than the sheet (Shuffle's 5%). Rates
 * are all a share of the house edge, so they compare like for like; casinos
 * that publish no rate are listed separately rather than guessed.
 */
export type RakebackRow = {
  slug: string;
  /** Headline rate as a % of the house edge, for ranking; null where the casino publishes none. */
  rate: number | null;
  rateText: string;
  claim: string;
  starts: string;
  /** What signing up with our code adds, where it adds anything. */
  code?: string;
  note?: string;
  cite: [string, string][];
  href?: string;
};

const B = "Bonus terms";

export const RAKEBACK: RakebackRow[] = [
  { slug: "duel", rate: 50, rateText: "50% on third-party slots", claim: "Instantly", starts: "Not stated", note: "Duel Originals run at zero edge within a daily allowance, so there's no edge left to return.", cite: [[B, "Rakeback"]] },
  { slug: "duelbits", rate: 25, rateText: "25%, up to 37.5% with level-ups", claim: "10% instantly, then 5% daily, weekly and monthly", starts: "Not stated", note: "Sports count at a 1% edge, so $10,000 on sports returns $25.", cite: [[B, "Rakeback"]] },
  { slug: "betfury", rate: 10, rateText: "10%", claim: "Every 20 minutes", starts: "Every player, from the start", note: "Doubled for a while with a Rakeback Boost; unclaimed rakeback expires after 90 days.", cite: [[B, "Rakeback"]] },
  { slug: "degen", rate: 8, rateText: "3%, rising to 8% by rank", claim: "Any time", starts: "Bronze I", code: "A 3% boost for 24 hours on the new account we opened with SLOTGUIDE", cite: [[B, "Rakeback"]] },
  { slug: "yeet", rate: 5, rateText: "5% (10% at Chairman)", claim: "Immediately; it never expires", starts: "Bronze ($1,000 wagered)", note: "Sports bets don't count.", cite: [[B, "Rakeback"], [B, "Perks by level"]] },
  { slug: "shuffle", rate: 5, rateText: "5% on casino games", claim: "Instantly, plus weekly and monthly", starts: "Bronze ($1,000 wagered)", note: "All of it can be withdrawn right away; sports bets don't count.", cite: [[B, "Rakeback"], [B, "VIP levels"]], href: "https://help.shuffle.com/en/articles/10020509-how-does-rakeback-work" },
  { slug: "stake", rate: 3.5, rateText: "3.5%", claim: "Any time, from the VIP page", starts: "Bronze ($10,000 wagered)", code: "Starts from your first bet instead of at Bronze", note: "Poker pays 3.5% of the rake and sports 3.5% of a 3% edge.", cite: [[B, "Rakeback"], [B, "Welcome offer"]] },
  { slug: "winna", rate: null, rateText: "Not published; scales with VIP level", claim: "Every 7 minutes", starts: "Bronze 1 ($1,000 wagered)", cite: [[B, "Rakeback"], [B, "Perks by level"], [B, "VIP levels"]] },
  { slug: "rainbet", rate: null, rateText: "Not published; based on total wagered", claim: "Every 15 minutes", starts: "Not stated", note: "Part of it feeds the Daily Reload.", cite: [[B, "Rakeback"]] },
  { slug: "roobet", rate: null, rateText: "Not published; a share of each wager", claim: "Every 30 minutes; it never expires", starts: "Not stated", code: "+20% for 72 hours when you join with an affiliate code", cite: [[B, "Rakeback"]] },
  { slug: "gamdom", rate: null, rateText: "Not published; factors in RTP and house edge", claim: "Instantly, from $0.10; it never expires", starts: "Not stated", code: "Boosted to 15% for your first 7 days", cite: [[B, "Rakeback"], [B, "Standing offer"]] },
  { slug: "goated", rate: null, rateText: "Not published; higher on its $GOATED token", claim: "Instantly, with no wagering strings", starts: "Bronze 1 ($1,000 wagered)", cite: [[B, "Rakeback"], [B, "VIP levels"]] },
  { slug: "thrill", rate: null, rateText: "Not published; a share of the house edge", claim: "Paid through its other bonuses", starts: "Base level, your first bet", cite: [[B, "Rakeback"]] },
  { slug: "razed", rate: null, rateText: "Not published; a share of the house edge", claim: "Not stated", starts: "Starter, the entry rank", note: "Lossback is built into the monthly bonus from the same rank.", cite: [[B, "Rakeback"], [B, "Cashback"]] },
];
