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
  "stake-vs-shuffle": {
    verdict: "Stake if you want your code to switch on rakeback from your first bet; Shuffle if you want a $100,000 weekly race that pays 1,000 places and deposits from a cent.",
    published: "2026-10-29",
    pickIf: {
      stake: [
        "Your code does something: SLOTGUIDE starts 3.5% rakeback from your first bet",
        "You'd rather race every day: $100,000 to the top 5,000",
        "You bet sports: sports wagers move you up its VIP levels three times faster",
      ],
      shuffle: [
        "You want a race that pays deep: $100,000 a week to the top 1,000",
        "You want to start small: deposits from $0.01",
        "You want a licence listed with no expiry on Curaçao's register",
      ],
    },
    sections: [
      {
        title: "What each code gets you",
        body: "At Stake, code SLOTGUIDE entered within 24 hours of signing up switches on its 3.5% rakeback straight away, instead of only once you reach Bronze at $10,000 wagered. At Shuffle the code carries no bonus of its own: you get its standard rakeback, paid instantly after each bet plus weekly and monthly, at a rate set by your VIP level, and all of it can be played or withdrawn right away.",
        cite: [
          { slug: "stake", group: "Bonus terms", label: "Welcome offer" },
          { slug: "shuffle", group: "Bonus terms", label: "Rakeback" },
        ],
      },
      {
        title: "Licence and who runs them",
        body: "Both are licensed in Curaçao. Shuffle's operator, Natural Nine B.V., is listed on the Curaçao Gaming Authority's register dated 20 October 2026 as \"Indefinite\", with no expiry. Stake's operator, Medium Rare N.V., shows an expiry of 9 June 2026 and the status \"Assessment in progress\" on the same register, as do 297 of the 666 licences listed.",
        cite: [
          { slug: "shuffle", group: "Compliance", label: "Register check" },
          { slug: "stake", group: "Compliance", label: "Register check" },
        ],
      },
      {
        title: "Races",
        body: "Stake's $100,000 Daily Race resets every 24 hours and pays the top 5,000. Shuffle's $100,000 leaderboard runs weekly, Sunday to Sunday, and pays the top 1,000, counting casino and sports wagers; only the top 20 are shown publicly.",
        cite: [
          { slug: "stake", group: "Bonus terms", label: "Leaderboards" },
          { slug: "shuffle", group: "Bonus terms", label: "Leaderboards" },
        ],
      },
      {
        title: "VIP",
        body: "Stake publishes 15 VIP levels, from Bronze at 10,000 to Obsidian at a billion. Shuffle's ranks run from Wood at $500 wagered to Diamond at $17 million and up, and every rank pays an automatic level-up bonus, from about $0.90 at Bronze to about $9,360 at Diamond 1.",
        cite: [
          { slug: "stake", group: "Bonus terms", label: "VIP levels" },
          { slug: "shuffle", group: "Bonus terms", label: "VIP levels" },
        ],
      },
      {
        title: "Deposits and withdrawals",
        body: "Stake has no minimum on crypto deposits and no maximum withdrawal. Shuffle takes deposits from $0.01, but deposits must be wagered once before withdrawal unless the money goes back to the same wallet on the same network.",
        cite: [
          { slug: "stake", group: "Coins & deposit limits", label: "Minimum deposit" },
          { slug: "stake", group: "Payouts & fees", label: "Withdrawal limits" },
          { slug: "shuffle", group: "Coins & deposit limits", label: "Minimum deposit" },
          { slug: "shuffle", group: "Payouts & fees", label: "Withdrawal limits" },
        ],
      },
      {
        title: "Beyond the casino",
        body: "Both run a sportsbook. Stake counts sports wagers three times faster toward its VIP levels; Shuffle caps sports winnings at $500,000 a day. Shuffle also runs a weekly SHFL Lottery for holders of its own token, paid in USDC.",
        cite: [
          { slug: "stake", group: "Bonus terms", label: "Perks by level" },
          { slug: "shuffle", group: "Sportsbook", label: "Max payout" },
          { slug: "shuffle", group: "Bonus terms", label: "Weekly raffle" },
        ],
      },
    ],
  },
  "stake-vs-gamdom": {
    verdict: "Stake if you want rakeback from your first bet and a daily race that pays 5,000 places; Gamdom if you want 15% rakeback for your first week, no ID check unless asked and $1 million a month in leaderboards.",
    published: "2026-10-29",
    pickIf: {
      stake: [
        "Your code does something: SLOTGUIDE starts 3.5% rakeback from your first bet",
        "You want published VIP levels: 15, from Bronze to Obsidian",
        "You bet sports: sports wagers move you up its VIP levels three times faster",
      ],
      gamdom: [
        "You want a strong start: instant rakeback boosted to 15% for your first 7 days",
        "You'd rather not send ID: Gamdom only asks if it needs to",
        "You chase leaderboards: $30,000 a day and two $500,000 tournaments a month",
      ],
    },
    sections: [
      {
        title: "What each code gets you",
        body: "At Stake, code SLOTGUIDE entered within 24 hours of signing up switches on its 3.5% rakeback straight away, instead of from Bronze at $10,000 wagered. At Gamdom, new accounts get instant rewards boosted to as much as 15%, activated within the first 6 hours after registering and valid for 7 days.",
        cite: [
          { slug: "stake", group: "Bonus terms", label: "Welcome offer" },
          { slug: "gamdom", group: "Bonus terms", label: "Standing offer" },
        ],
      },
      {
        title: "Licence and who runs them",
        body: "Stake is run by Medium Rare N.V. in Curaçao, whose licence shows the status \"Assessment in progress\" on the Curaçao Gaming Authority's register dated 20 October 2026. Gamdom is licensed in Anjouan, under a licence held by Moon Revolution Limitada of Costa Rica. In October 2026 Gamdom took its systems offline after finding an unauthorised connection on a server; it said user funds were safe and is back online.",
        cite: [
          { slug: "stake", group: "Compliance", label: "Register check" },
          { slug: "gamdom", group: "Compliance", label: "Licence" },
          { slug: "gamdom", group: "Compliance", label: "Security incident" },
        ],
      },
      {
        title: "Rakeback and races",
        body: "Stake pays 3.5% of the house edge as rakeback and runs a $100,000 Daily Race for the top 5,000. Gamdom's rakeback is paid in real time, factoring in each game's RTP and house edge, claimable from $0.10 and never expiring; its King of the Hill pays $30,000 a day across the top 200 and two $500,000 tournaments a month.",
        cite: [
          { slug: "stake", group: "Bonus terms", label: "Rakeback" },
          { slug: "stake", group: "Bonus terms", label: "Leaderboards" },
          { slug: "gamdom", group: "Bonus terms", label: "Rakeback" },
          { slug: "gamdom", group: "Bonus terms", label: "Leaderboards" },
        ],
      },
      {
        title: "VIP",
        body: "Stake publishes 15 VIP levels with weekly and monthly bonuses from Bronze and daily bonuses from Platinum. Gamdom's Royalty Up has 24 levels across eight tiers, with a reward at every rank-up that you claim yourself, and an invite-only VIP programme that adds fee-free withdrawals.",
        cite: [
          { slug: "stake", group: "Bonus terms", label: "VIP levels" },
          { slug: "gamdom", group: "Bonus terms", label: "Perks by level" },
        ],
      },
      {
        title: "ID checks and withdrawals",
        body: "Stake's compliance team may ask for documents at any time. Gamdom says verification isn't needed to deposit, play or withdraw unless it asks. Neither sets a withdrawal limit, though Gamdom asks that deposits be wagered once and pays out in the coin you deposited.",
        cite: [
          { slug: "stake", group: "Compliance", label: "KYC policy" },
          { slug: "gamdom", group: "Compliance", label: "KYC policy" },
          { slug: "stake", group: "Payouts & fees", label: "Withdrawal limits" },
          { slug: "gamdom", group: "Payouts & fees", label: "Withdrawal limits" },
        ],
      },
    ],
  },
  "roobet-vs-shuffle": {
    verdict: "Roobet if you want a welcome package and a $100,000 weekly raffle; Shuffle if you want a $100,000 weekly race that pays 1,000 places and deposits from a cent.",
    published: "2026-10-29",
    pickIf: {
      roobet: [
        "You want a welcome package: code ELITE gets 20% up to $500 plus up to 600 free spins, claimed through CasinoPerks",
        "You like a weekly raffle: $100,000 split among 100 winners",
        "You want prediction markets from the same balance",
      ],
      shuffle: [
        "You want a race that pays deep: $100,000 a week to the top 1,000",
        "You want to start small: deposits from $0.01",
        "You hold SHFL: a weekly lottery for token holders, paid in USDC",
      ],
    },
    sections: [
      {
        title: "What each code gets you",
        body: "At Roobet, code ELITE unlocks a welcome package of a 20% deposit match up to $500, then 100 free spins at $10,000 wagered and 500 more at $50,000, claimed through CasinoPerks on Telegram. Joining with an affiliate code also boosts Roobet's rakeback by 20% for 72 hours. Shuffle's code carries no bonus of its own; its deposit bonus applies to the first deposit only, with the amount shown inside your account.",
        cite: [
          { slug: "roobet", group: "Bonus terms", label: "Rakeback" },
          { slug: "shuffle", group: "Bonus terms", label: "Deposit bonus" },
        ],
      },
      {
        title: "Licence and who runs them",
        body: "Both are licensed in Curaçao, and both licences are listed as \"Indefinite\", with no expiry, on the Curaçao Gaming Authority's register dated 20 October 2026: Raw Entertainment B.V. for Roobet and Natural Nine B.V. for Shuffle.",
        cite: [
          { slug: "roobet", group: "Compliance", label: "Register check" },
          { slug: "shuffle", group: "Compliance", label: "Register check" },
        ],
      },
      {
        title: "Races and raffles",
        body: "Roobet runs a $100,000 weekly raffle with 100 winners and a ticket for every $1,000 wagered. Shuffle runs a $100,000 weekly leaderboard paying the top 1,000, plus a weekly SHFL Lottery for holders of its own token.",
        cite: [
          { slug: "roobet", group: "Bonus terms", label: "Weekly raffle" },
          { slug: "shuffle", group: "Bonus terms", label: "Leaderboards" },
          { slug: "shuffle", group: "Bonus terms", label: "Weekly raffle" },
        ],
      },
      {
        title: "Recurring rewards",
        body: "Roobet pays a daily bonus that builds for up to 72 hours, a weekly bonus on Saturdays, a monthly one on the 1st, and opens its Vault every 8 hours. Shuffle pays a daily bonus from Bronze, weekly and monthly bonuses, and posts bonus drop codes in its Telegram channels every day.",
        cite: [
          { slug: "roobet", group: "Bonus terms", label: "Reload bonuses" },
          { slug: "shuffle", group: "Bonus terms", label: "Reload bonuses" },
        ],
      },
      {
        title: "VIP",
        body: "Roobet's VIP Club is invite-only, with no way to apply. Shuffle's ranks run from Wood at $500 wagered up to Diamond, and every rank pays an automatic level-up bonus.",
        cite: [
          { slug: "roobet", group: "Bonus terms", label: "VIP levels" },
          { slug: "shuffle", group: "Bonus terms", label: "VIP levels" },
        ],
      },
      {
        title: "Withdrawals",
        body: "Both want deposits wagered before you withdraw: Roobet once in full, Shuffle in full unless the money goes back to the same wallet on the same network. Roobet's terms set no maximum withdrawal.",
        cite: [
          { slug: "roobet", group: "Payouts & fees", label: "Withdrawal limits" },
          { slug: "shuffle", group: "Payouts & fees", label: "Withdrawal limits" },
        ],
      },
    ],
  },
  "roobet-vs-gamdom": {
    verdict: "Roobet if you want a welcome package and a weekly raffle; Gamdom if you want 15% rakeback for your first week, no ID check unless asked and $1 million a month in leaderboards.",
    published: "2026-10-29",
    pickIf: {
      roobet: [
        "You want a welcome package: code ELITE gets 20% up to $500 plus up to 600 free spins, claimed through CasinoPerks",
        "You like a weekly raffle: $100,000 split among 100 winners",
        "You want prediction markets from the same balance",
      ],
      gamdom: [
        "You want a strong start: instant rakeback boosted to 15% for your first 7 days",
        "You'd rather not send ID: Gamdom only asks if it needs to",
        "You chase leaderboards: $30,000 a day and two $500,000 tournaments a month",
      ],
    },
    sections: [
      {
        title: "What each code gets you",
        body: "At Roobet, code ELITE unlocks a welcome package of a 20% deposit match up to $500, then 100 free spins at $10,000 wagered and 500 more at $50,000, claimed through CasinoPerks on Telegram. Joining with an affiliate code also boosts Roobet's rakeback by 20% for 72 hours. At Gamdom, new accounts get instant rewards boosted to as much as 15%, activated within the first 6 hours after registering and valid for 7 days.",
        cite: [
          { slug: "roobet", group: "Bonus terms", label: "Rakeback" },
          { slug: "gamdom", group: "Bonus terms", label: "Standing offer" },
        ],
      },
      {
        title: "Licence and who runs them",
        body: "Roobet is run by Raw Entertainment B.V., whose Curaçao licence is listed as \"Indefinite\", with no expiry, on the Curaçao Gaming Authority's register dated 20 October 2026. Gamdom is licensed in Anjouan under a licence held by Moon Revolution Limitada of Costa Rica, and in October 2026 took its systems offline after finding an unauthorised connection on a server; it said user funds were safe and is back online.",
        cite: [
          { slug: "roobet", group: "Compliance", label: "Register check" },
          { slug: "gamdom", group: "Compliance", label: "Licence" },
          { slug: "gamdom", group: "Compliance", label: "Security incident" },
        ],
      },
      {
        title: "Rakeback",
        body: "Roobet's instant rakeback is claimable every 30 minutes and never expires, with Rakeboosts that lift it for a while. Gamdom's is paid in real time, claimable from $0.10 and never expires, and its weekly and monthly rewards can be taken as a 7-day reload that adds 25%.",
        cite: [
          { slug: "roobet", group: "Bonus terms", label: "Rakeback" },
          { slug: "gamdom", group: "Bonus terms", label: "Rakeback" },
          { slug: "gamdom", group: "Bonus terms", label: "Rakeback reload" },
        ],
      },
      {
        title: "Races and raffles",
        body: "Roobet runs a $100,000 weekly raffle with 100 winners. Gamdom's King of the Hill pays $30,000 a day across the top 200, plus two $500,000 tournaments a month for the top 1,000.",
        cite: [
          { slug: "roobet", group: "Bonus terms", label: "Weekly raffle" },
          { slug: "gamdom", group: "Bonus terms", label: "Leaderboards" },
        ],
      },
      {
        title: "ID checks and where you can play",
        body: "Roobet may ask for documents at any time and can hold withdrawals until you're verified, and its terms restrict 25 countries, including the US, the UK and Australia. Gamdom says verification isn't needed to deposit, play or withdraw unless it asks.",
        cite: [
          { slug: "roobet", group: "Compliance", label: "KYC policy" },
          { slug: "roobet", group: "Bonus terms", label: "Restricted countries" },
          { slug: "gamdom", group: "Compliance", label: "KYC policy" },
        ],
      },
    ],
  },
  "shuffle-vs-gamdom": {
    verdict: "Shuffle if you want a $100,000 weekly race and a Curaçao licence with no expiry; Gamdom if you want 15% rakeback for your first week and no ID check unless asked.",
    published: "2026-10-29",
    pickIf: {
      shuffle: [
        "You want a race that pays deep: $100,000 a week to the top 1,000",
        "You want to start small: deposits from $0.01",
        "You want rakeback you can withdraw straight away",
      ],
      gamdom: [
        "You want a strong start: instant rakeback boosted to 15% for your first 7 days",
        "You'd rather not send ID: Gamdom only asks if it needs to",
        "You chase leaderboards: $30,000 a day and two $500,000 tournaments a month",
      ],
    },
    sections: [
      {
        title: "What each code gets you",
        body: "Shuffle's code carries no bonus of its own; its deposit bonus applies to the first deposit only, with the amount shown inside your account. At Gamdom, new accounts get instant rewards boosted to as much as 15%, activated within the first 6 hours after registering and valid for 7 days.",
        cite: [
          { slug: "shuffle", group: "Bonus terms", label: "Deposit bonus" },
          { slug: "gamdom", group: "Bonus terms", label: "Standing offer" },
        ],
      },
      {
        title: "Licence and who runs them",
        body: "Shuffle is run by Natural Nine B.V., whose Curaçao licence is listed as \"Indefinite\", with no expiry, on the Curaçao Gaming Authority's register dated 20 October 2026. Gamdom is licensed in Anjouan under a licence held by Moon Revolution Limitada of Costa Rica, and in October 2026 took its systems offline after finding an unauthorised connection on a server; it said user funds were safe and is back online.",
        cite: [
          { slug: "shuffle", group: "Compliance", label: "Register check" },
          { slug: "gamdom", group: "Compliance", label: "Licence" },
          { slug: "gamdom", group: "Compliance", label: "Security incident" },
        ],
      },
      {
        title: "Rakeback",
        body: "Shuffle pays rakeback instantly after each bet plus weekly and monthly, at a rate set by your VIP level, and all of it can be withdrawn right away. Gamdom's is paid in real time, factoring in each game's RTP and house edge, claimable from $0.10 and never expiring.",
        cite: [
          { slug: "shuffle", group: "Bonus terms", label: "Rakeback" },
          { slug: "gamdom", group: "Bonus terms", label: "Rakeback" },
        ],
      },
      {
        title: "Races",
        body: "Shuffle's $100,000 weekly leaderboard pays the top 1,000. Gamdom's King of the Hill pays $30,000 a day across the top 200, plus two $500,000 tournaments a month for the top 1,000.",
        cite: [
          { slug: "shuffle", group: "Bonus terms", label: "Leaderboards" },
          { slug: "gamdom", group: "Bonus terms", label: "Leaderboards" },
        ],
      },
      {
        title: "VIP",
        body: "Shuffle's ranks run from Wood at $500 wagered to Diamond, each paying an automatic level-up bonus. Gamdom's Royalty Up has 24 levels across eight tiers, with rank-up rewards you claim yourself and an invite-only VIP programme on top.",
        cite: [
          { slug: "shuffle", group: "Bonus terms", label: "VIP levels" },
          { slug: "gamdom", group: "Bonus terms", label: "Perks by level" },
        ],
      },
    ],
  },
};
