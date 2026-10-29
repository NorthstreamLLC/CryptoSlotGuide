/**
 * Written analysis for head-to-head pages. A pair page is indexed only once it
 * has an entry here: the table alone is the same data as the two reviews, the
 * analysis is what makes the page worth ranking. Every claim restates a
 * spec-sheet fact (or a code's terms in ops.json), listed in `cite` so the page
 * links each section to its sources.
 */
export type Cite = { slug: string; group: string; label: string };

export type VersusAnalysis = {
  /** One line under the H1. */
  verdict: string;
  /** "Pick X if…" reasons, keyed by casino slug. */
  pickIf: Record<string, string[]>;
  sections: { title: string; body: string; cite: Cite[] }[];
  published: string;
};

export const VERSUS_ANALYSIS: Record<string, VersusAnalysis> = {
  "roobet-vs-stake": {
    verdict: "Roobet if you want a welcome package and a weekly raffle; Stake if you want rakeback from your first bet and a daily race that pays 5,000 places.",
    published: "2026-10-29",
    pickIf: {
      roobet: [
        "You want a welcome package: code ELITE gets 20% up to $500 plus up to 600 free spins, claimed through CasinoPerks",
        "You like a weekly raffle: $100,000 split among 100 winners",
        "You want prediction markets from the same balance",
      ],
      stake: [
        "You want rakeback from your very first bet, with nothing to wager off",
        "You'd rather race every day: $100,000 paid to the top 5,000",
        "You bet sports: sports wagers move you up its VIP levels three times faster",
      ],
    },
    sections: [
      {
        title: "What each code gets you",
        body: "At Roobet, code ELITE unlocks a welcome package of a 20% deposit match up to $500, then 100 free spins at $10,000 wagered and 500 more at $50,000, claimed through CasinoPerks on Telegram. Joining with an affiliate code also boosts Roobet's rakeback by 20% for 72 hours. At Stake, code SLOTGUIDE entered within 24 hours of signing up switches on its 3.5% rakeback straight away, instead of only once you reach Bronze at $10,000 wagered.",
        cite: [
          { slug: "roobet", group: "Bonus terms", label: "Rakeback" },
          { slug: "stake", group: "Bonus terms", label: "Welcome offer" },
        ],
      },
      {
        title: "Licence and who runs them",
        body: "Both are licensed in Curaçao. Roobet is run by Raw Entertainment B.V., whose licence the Curaçao Gaming Authority's register dated 20 October 2026 lists as \"Indefinite\", with no expiry. Stake is run by Medium Rare N.V., whose licence on the same register shows an expiry of 9 June 2026 and the status \"Assessment in progress\", as do 297 of the 666 licences listed.",
        cite: [
          { slug: "roobet", group: "Compliance", label: "Register check" },
          { slug: "stake", group: "Compliance", label: "Register check" },
        ],
      },
      {
        title: "Rakeback and races",
        body: "Stake pays rakeback as 3.5% of the house edge on casino games, claimable any time, and runs a $100,000 Daily Race paying the top 5,000. Roobet pays instant rakeback claimable every 30 minutes, with Rakeboosts on top, and a $100,000 weekly raffle with 100 winners, one ticket per $1,000 wagered.",
        cite: [
          { slug: "stake", group: "Bonus terms", label: "Rakeback" },
          { slug: "stake", group: "Bonus terms", label: "Leaderboards" },
          { slug: "roobet", group: "Bonus terms", label: "Rakeback" },
          { slug: "roobet", group: "Bonus terms", label: "Weekly raffle" },
        ],
      },
      {
        title: "VIP",
        body: "Stake publishes 15 VIP levels, from Bronze at 10,000 to Obsidian at a billion, with weekly and monthly bonuses from Bronze and daily bonuses from Platinum. Roobet's VIP Club is invite-only: there's no way to apply, and the VIP team picks members on loyalty, activity and variety of play.",
        cite: [
          { slug: "stake", group: "Bonus terms", label: "VIP levels" },
          { slug: "roobet", group: "Bonus terms", label: "VIP levels" },
        ],
      },
      {
        title: "Withdrawals",
        body: "Neither sets a maximum withdrawal. Stake says crypto withdrawals should be processed immediately and the whole balance can be withdrawn. Roobet sends withdrawals instantly on request, but deposits must be wagered once before you can withdraw them.",
        cite: [
          { slug: "stake", group: "Payouts & fees", label: "Withdrawal limits" },
          { slug: "stake", group: "Payouts & fees", label: "Stated withdrawal time" },
          { slug: "roobet", group: "Payouts & fees", label: "Withdrawal limits" },
          { slug: "roobet", group: "Payouts & fees", label: "Stated withdrawal time" },
        ],
      },
      {
        title: "Beyond the casino",
        body: "Both run a sportsbook. Roobet adds prediction markets powered by Polymarket, traded from your normal balance, and an opt-in Roo Jackpots side bet that Roobet says pays back about 80%. Stake counts sports wagers three times faster toward its VIP levels.",
        cite: [
          { slug: "roobet", group: "Sportsbook", label: "Prediction markets" },
          { slug: "roobet", group: "Bonus terms", label: "Roo Jackpots" },
          { slug: "stake", group: "Bonus terms", label: "Perks by level" },
        ],
      },
    ],
  },
};
