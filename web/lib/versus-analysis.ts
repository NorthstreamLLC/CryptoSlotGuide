/**
 * Written analysis for head-to-head pages. A pair page is indexed only once it
 * has an entry here: the table alone is the same data as the two reviews, the
 * analysis is what makes the page worth ranking. Every claim restates a
 * spec-sheet fact (or a code's terms in ops.json), listed in `cite` so the page
 * links each section to its sources.
 */
import opsJson from "@/data/ops.json";

export type Cite = { slug: string; group: string; label: string };

export type VersusAnalysis = {
  /** One line under the H1. */
  verdict: string;
  /** "Pick X if…" reasons, keyed by casino slug. */
  pickIf: Record<string, string[]>;
  sections: { title: string; body: string; cite: Cite[] }[];
  published: string;
};

const WRITTEN: Record<string, VersusAnalysis> = {
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
        body: "Both are licensed in Curaçao. Roobet is run by Raw Entertainment B.V., whose licence the Curaçao Gaming Authority's register dated 30 October 2026 lists as \"Indefinite\", with no expiry. Stake is run by Medium Rare N.V., whose licence on the same register shows an expiry of 9 June 2026 and the status \"Assessment in progress\", as do 298 of the 666 licences listed.",
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
        body: "Both are licensed in Curaçao. Shuffle's operator, Natural Nine B.V., is listed on the Curaçao Gaming Authority's register dated 30 October 2026 as \"Indefinite\", with no expiry. Stake's operator, Medium Rare N.V., shows an expiry of 9 June 2026 and the status \"Assessment in progress\" on the same register, as do 298 of the 666 licences listed.",
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
        body: "Stake is run by Medium Rare N.V. in Curaçao, whose licence shows the status \"Assessment in progress\" on the Curaçao Gaming Authority's register dated 30 October 2026. Gamdom is licensed in Anjouan, under a licence held by Moon Revolution Limitada of Costa Rica. In October 2026 Gamdom took its systems offline after finding an unauthorised connection on a server; it said user funds were safe and is back online.",
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
        body: "Stake's compliance team may ask for documents at any time. Gamdom says verification isn't needed to deposit, play or withdraw unless it asks. Stake sets no withdrawal maximum; Gamdom describes high limits without a figure, asks that deposits be wagered once and pays out in the coin you deposited.",
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
        body: "Both are licensed in Curaçao, and both licences are listed as \"Indefinite\", with no expiry, on the Curaçao Gaming Authority's register dated 30 October 2026: Raw Entertainment B.V. for Roobet and Natural Nine B.V. for Shuffle.",
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
        body: "Roobet is run by Raw Entertainment B.V., whose Curaçao licence is listed as \"Indefinite\", with no expiry, on the Curaçao Gaming Authority's register dated 30 October 2026. Gamdom is licensed in Anjouan under a licence held by Moon Revolution Limitada of Costa Rica, and in October 2026 took its systems offline after finding an unauthorised connection on a server; it said user funds were safe and is back online.",
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
        body: "Shuffle is run by Natural Nine B.V., whose Curaçao licence is listed as \"Indefinite\", with no expiry, on the Curaçao Gaming Authority's register dated 30 October 2026. Gamdom is licensed in Anjouan under a licence held by Moon Revolution Limitada of Costa Rica, and in October 2026 took its systems offline after finding an unauthorised connection on a server; it said user funds were safe and is back online.",
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

/**
 * One sourced paragraph per casino and topic. Pairs without a hand-written
 * entry above are composed from these: each section puts the two casinos'
 * paragraphs side by side, so every sentence is still one cited fact.
 */
type Block = { text: string; cite: [string, string][] };
type CasinoBlocks = { verdictIf: string; pickIf: string[]; code: Block; licence: Block; rewards: Block; vip: Block; cash: Block };

const B = "Bonus terms", C = "Compliance", P = "Payouts & fees", K = "Coins & deposit limits", S = "Sportsbook";

const BLOCKS: Record<string, CasinoBlocks> = {
  roobet: {
    verdictIf: "you want a welcome package and a weekly raffle",
    pickIf: WRITTEN["roobet-vs-stake"].pickIf.roobet,
    code: { text: "At Roobet, code ELITE unlocks a welcome package of a 20% deposit match up to $500, then 100 free spins at $10,000 wagered and 500 more at $50,000, claimed through CasinoPerks on Telegram, and joining with an affiliate code boosts its rakeback by 20% for 72 hours.", cite: [[B, "Rakeback"]] },
    licence: { text: "Roobet is run by Raw Entertainment B.V., whose Curaçao licence is listed as \"Indefinite\", with no expiry, on the Curaçao Gaming Authority's register dated 30 October 2026.", cite: [[C, "Register check"]] },
    rewards: { text: "Roobet pays instant rakeback claimable every 30 minutes and runs a $100,000 weekly raffle with 100 winners, one ticket per $1,000 wagered.", cite: [[B, "Rakeback"], [B, "Weekly raffle"]] },
    vip: { text: "Roobet's VIP Club is invite-only, with no way to apply.", cite: [[B, "VIP levels"]] },
    cash: { text: "Roobet's terms set no maximum withdrawal, but deposits must be wagered once before you withdraw, and it may ask for ID at any time.", cite: [[P, "Withdrawal limits"], [C, "KYC policy"]] },
  },
  stake: {
    verdictIf: "you want rakeback from your first bet and a daily race that pays 5,000 places",
    pickIf: WRITTEN["roobet-vs-stake"].pickIf.stake,
    code: { text: "At Stake, code SLOTGUIDE entered within 24 hours of signing up switches on its 3.5% rakeback straight away, instead of only once you reach Bronze at $10,000 wagered.", cite: [[B, "Welcome offer"]] },
    licence: { text: "Stake is run by Medium Rare N.V., whose Curaçao licence shows an expiry of 9 June 2026 and the status \"Assessment in progress\" on the Curaçao Gaming Authority's register dated 30 October 2026, as do 298 of the 666 licences listed.", cite: [[C, "Register check"]] },
    rewards: { text: "Stake pays 3.5% of the house edge as rakeback and runs a $100,000 Daily Race paying the top 5,000.", cite: [[B, "Rakeback"], [B, "Leaderboards"]] },
    vip: { text: "Stake publishes 15 VIP levels, from Bronze at 10,000 to Obsidian at a billion, and counts sports wagers three times faster toward them.", cite: [[B, "VIP levels"], [B, "Perks by level"]] },
    cash: { text: "Stake sets no maximum withdrawal and says crypto withdrawals should be processed immediately.", cite: [[P, "Withdrawal limits"], [P, "Stated withdrawal time"]] },
  },
  shuffle: {
    verdictIf: "you want a $100,000 weekly race that pays 1,000 places and deposits from a cent",
    pickIf: WRITTEN["roobet-vs-shuffle"].pickIf.shuffle,
    code: { text: "Shuffle's code carries no bonus of its own; its deposit bonus applies to the first deposit only, with the amount shown inside your account.", cite: [[B, "Deposit bonus"]] },
    licence: { text: "Shuffle is run by Natural Nine B.V., whose Curaçao licence is listed as \"Indefinite\", with no expiry, on the Curaçao Gaming Authority's register dated 30 October 2026.", cite: [[C, "Register check"]] },
    rewards: { text: "Shuffle pays rakeback instantly after each bet plus weekly and monthly, all withdrawable straight away, and runs a $100,000 weekly race paying the top 1,000.", cite: [[B, "Rakeback"], [B, "Leaderboards"]] },
    vip: { text: "Shuffle's ranks run from Wood at $500 wagered to Diamond, and every rank pays an automatic level-up bonus.", cite: [[B, "VIP levels"]] },
    cash: { text: "Shuffle takes deposits from $0.01, and deposits must be wagered once before withdrawal unless the money goes back to the same wallet on the same network.", cite: [[K, "Minimum deposit"], [P, "Withdrawal limits"]] },
  },
  gamdom: {
    verdictIf: "you want 15% rakeback for your first week and no ID check unless asked",
    pickIf: WRITTEN["roobet-vs-gamdom"].pickIf.gamdom,
    code: { text: "At Gamdom, new accounts get instant rewards boosted to as much as 15%, activated within the first 6 hours after registering and valid for 7 days.", cite: [[B, "Standing offer"]] },
    licence: { text: "Gamdom is licensed in Anjouan under a licence held by Moon Revolution Limitada of Costa Rica, and in October 2026 took its systems offline after finding an unauthorised connection on a server; it said user funds were safe and is back online.", cite: [[C, "Licence"], [C, "Security incident"]] },
    rewards: { text: "Gamdom pays rakeback in real time, claimable from $0.10 and never expiring, and its King of the Hill pays $30,000 a day across the top 200 plus two $500,000 tournaments a month.", cite: [[B, "Rakeback"], [B, "Leaderboards"]] },
    vip: { text: "Gamdom's Royalty Up has 24 levels across eight tiers, with rank-up rewards you claim yourself and an invite-only VIP programme on top.", cite: [[B, "Perks by level"]] },
    cash: { text: "Gamdom advertises high withdrawal limits without a published figure and doesn't ask for ID unless it needs to, though deposits must be wagered once.", cite: [[P, "Withdrawal limits"], [C, "KYC policy"]] },
  },
  duel: {
    verdictIf: "you want half the slot house edge back instantly and a $3 million monthly race",
    pickIf: [
      "You'd rather have no bonus strings: Duel returns 50% of the slot house edge instantly instead",
      "You chase big races: $3,000,000 a month, $1.5 million to first",
      "You play house games: Duel Originals run at zero edge within a daily allowance",
    ],
    code: { text: "Duel runs no deposit bonuses by design, so there's no package to claim; instead, 50% of the house edge you pay on third-party slots comes back instantly.", cite: [[B, "Standing offer"], [B, "Rakeback"]] },
    licence: { text: "Duel is licensed in Anjouan; its own about page says it's run by the operator known as Monarch, who previously ran CSGOEmpire, and its company, Immortal Snail LLC, is registered in Nevis.", cite: [[C, "Licence"], [C, "Operator"], [C, "Company"]] },
    rewards: { text: "Duel's $3,000,000 monthly race pays $1,500,000 to first, with a $25,000 daily race alongside, and its Originals run at zero edge within a daily allowance.", cite: [[B, "Leaderboard prizes"], [B, "Rakeback"]] },
    vip: { text: "Duel has no VIP ladder or level-up rewards; it returns value through instant rakeback instead.", cite: [[B, "VIP levels"]] },
    cash: { text: "Duel may ask for KYC before processing a withdrawal, and its terms bar 30 countries, including the US, the UK, Australia, France, Germany and Spain.", cite: [[C, "KYC policy"], [C, "Restricted countries"]] },
  },
  rainbet: {
    verdictIf: "you want a $1 million monthly race and no ID check for crypto",
    pickIf: [
      "You chase big races: a $1M monthly race, $100,000 to first",
      "You'd rather not send ID: crypto play and withdrawals need no KYC",
      "You like frequent payouts: rakeback claimable every 15 minutes",
    ],
    code: { text: "Rainbet's first deposit bonus puts a $30 to $700 deposit and its match into a promotional balance that must be wagered 40x, with games above 97.4% RTP switched off while it's active.", cite: [[B, "Standing offer"]] },
    licence: { text: "Rainbet's Anjouan licence ALSI-152406029-FI2 shows as VALID on the validator linked from its footer, which names the holder as Rain Group Ltd; its terms name RBGAMING N.V.", cite: [[C, "Licence"]] },
    rewards: { text: "Rainbet's rakeback is claimable every 15 minutes, and it runs daily and weekly races, a $1M monthly race paying $100,000 to first, and a $20,000 weekly raffle.", cite: [[B, "Rakeback"], [B, "Leaderboards"], [B, "Weekly raffle"]] },
    vip: { text: "Rainbet's 25 ranks start at Bronze I at $4,000 wagered, with a rank-up bonus at each and weekly free spins from Gold.", cite: [[B, "Perks by level"]] },
    cash: { text: "Rainbet says crypto play and withdrawals need no KYC and withdrawals take 5 to 15 minutes, though it offers no deposit limits, pointing players to loss limits instead.", cite: [[C, "KYC policy"], [P, "Stated withdrawal time"], [K, "Deposit limits"]] },
  },
  razed: {
    verdictIf: "you want a 100% welcome bonus with free spins and a VIP ladder with cars as prizes",
    pickIf: [
      "You want a welcome bonus: 100% up to $300 plus up to 150 free spins",
      "You like climbing: rank-up rewards up to $500,000, and a car for the first to the top ranks",
      "You bet sports: sports turnover counts three times toward VIP",
    ],
    code: { text: "At Razed, new players get a 100% match on the first deposit up to $300 plus up to 150 free spins on Sugar Rush 1000, opted into on the deposit screen, with 40x wagering on one balance holding deposit and bonus.", cite: [[B, "Standing offer"], [B, "Wagering"]] },
    licence: { text: "Razed is licensed in Anjouan and run by Wild Technology Ltd. of Costa Rica.", cite: [[C, "Licence"], [C, "Company"]] },
    rewards: { text: "Razed pays rakeback from the entry Starter rank, builds lossback into its monthly bonus, and runs a $100,000 monthly race with $30,000 for first.", cite: [[B, "Rakeback"], [B, "Cashback"], [B, "Leaderboards"]] },
    vip: { text: "Razed pays cash rank-up rewards from $20 at Bronze 1 to $500,000 at Onyx, gives a car to the first players to reach its top three ranks, and counts sports turnover three times toward VIP.", cite: [[B, "Rank-up rewards"], [B, "Milestone prizes"], [S, "Sportsbook"]] },
    cash: { text: "Razed sets no maximum crypto withdrawal; it calls itself no-KYC, though its AML policy says ID is requested when you withdraw.", cite: [[P, "Withdrawal limits"], [C, "KYC policy"]] },
  },
  duelbits: {
    verdictIf: "you want 25% rakeback with no deposit bonus to wager off",
    pickIf: [
      "You want rakeback with nothing to wager off: 25% of the house edge, 10% of it instantly",
      "You play slots: its leaderboards score lower-RTP games highest",
      "You want prediction markets: Duelbits Predict covers sports, crypto and politics",
    ],
    code: { text: "Duelbits runs no deposit bonus; every player gets 25% of the house edge back as rakeback, 10% instantly and 5% each daily, weekly and monthly, and a referral code has to be set within 24 hours of registering.", cite: [[B, "Deposit bonus"], [B, "Rakeback"], [B, "Referral program"]] },
    licence: { text: "Duelbits is run by Liquid Entertainment N.V., whose Curaçao licence shows an expiry of 24 December 2025 and the status \"Assessment in progress\" on the Curaçao Gaming Authority's register dated 30 October 2026.", cite: [[C, "Register check"]] },
    rewards: { text: "Duelbits' leaderboards score wager × (1 − RTP), so $100 on a 96% slot earns 400 points against 71 on blackjack; a $10,000 daily board pays the top 100 and a $30,000 weekly board the top 250.", cite: [[B, "Leaderboards"]] },
    vip: { text: "Duelbits' Ace's Lounge levels add up to 12.5% rakeback on top of the base 25%, and selected VIPs get extra rakeback every Tuesday.", cite: [[B, "VIP levels"], [B, "Reload bonuses"]] },
    cash: { text: "Duelbits sets no withdrawal cap and charges no platform fee, but at least 10% of a deposit must be wagered before you withdraw, and access can be restricted until documents are verified.", cite: [[P, "Withdrawal limits"], [C, "KYC policy"]] },
  },
  goated: {
    verdictIf: "you want a 100% first deposit bonus up to $1,000 and a $25,000 weekly race",
    pickIf: [
      "You want a welcome bonus: 100% up to $1,000 from a $20 deposit",
      "You like reloads: weekly reloads arrive as 168 hourly claims",
      "You'd rather start light on ID: sign-up needs only an email or a wallet",
    ],
    code: { text: "Goated's 100% first deposit bonus goes up to $1,000 from a $20 deposit, with 35x wagering on deposit plus bonus and VIP rewards halved while it's active.", cite: [[B, "Standing offer"]] },
    licence: { text: "Goated is licensed in Anjouan and run by Mirai Kaze Ltd, registered there.", cite: [[C, "Licence"], [C, "Company"]] },
    rewards: { text: "Goated pays instant rakeback from Bronze with no wagering strings, at better rates on its own $GOATED token, and runs a $25,000 weekly race for the top 20 and a $2,500 daily race on its Originals.", cite: [[B, "Rakeback"], [B, "Leaderboards"]] },
    vip: { text: "Goated has 45 VIP levels across nine tiers, each paying a level-up bonus, and weekly reloads split into 168 hourly claims.", cite: [[B, "VIP levels"], [B, "Reload bonuses"]] },
    cash: { text: "Goated says most withdrawals reach the blockchain in a minute or two, with the network fee added on top of the amount, and every deposit must be wagered once first; sign-up needs only an email or a wallet.", cite: [[P, "Stated withdrawal time"], [P, "Withdrawal fees"], [C, "KYC policy"]] },
  },
  degen: {
    verdictIf: "you want rakeback that climbs to 8% and a $25,000 weekly race",
    pickIf: [
      "You want rakeback that grows: from 3% at Bronze I up to 8% at the top rank",
      "You like level-up bonuses: from $10 up to $100,000 at the Degen rank",
      "You make big withdrawals: per-coin limits of about $1 million in crypto",
    ],
    code: { text: "Degen's 100% first deposit match goes only to accounts registered under an eligible referral code, so check it's offered before you deposit; its rakeback runs from 3% at Bronze I to 8% at the top rank, claimable any time.", cite: [[B, "Standing offer"], [B, "Rakeback"]] },
    licence: { text: "Degen is licensed in Anjouan and run by Degen Legend Limitada of Costa Rica; its payouts policy still names its dispute body with a placeholder.", cite: [[C, "Licence"], [C, "Company"], [C, "Dispute body"]] },
    rewards: { text: "Degen runs a $25,000 weekly race for the top 20, $10,000 to first, and pays weekly and monthly bonuses from Bronze.", cite: [[B, "Leaderboards"], [B, "Recurring bonuses"]] },
    vip: { text: "Degen's 27 levels pay level-up bonuses from $10 at Bronze I to $100,000 at the Degen rank, with daily reloads from Platinum.", cite: [[B, "VIP levels"], [B, "Reload bonuses"]] },
    cash: { text: "Degen's per-coin withdrawal limits run to about $1 million in crypto, but deposits must come from a method in your own name, and deposits from mixers can freeze an account.", cite: [[P, "Withdrawal limits"], [K, "Deposit rules"]] },
  },
  betfury: {
    verdictIf: "you want a welcome pack over three deposits and 10% rakeback for every player",
    pickIf: [
      "You want a big welcome pack: up to 590% plus 225 free spins over three deposits",
      "You want rakeback from day one: 10% of the house edge for every player",
      "You like battles: $20,000 Daily Battles, up to $100,000 for VIPs",
    ],
    code: { text: "BetFury's Welcome Pack spreads up to 590% in deposit bonuses and 225 free spins across three deposits, each to be wagered within 14 days with bets capped at $10.", cite: [[B, "Standing offer"]] },
    licence: { text: "BetFury is run by Universe B Games B.V., whose Curaçao licence shows an expiry of 31 July 2026 and the status \"Assessment in progress\" on the Curaçao Gaming Authority's register dated 30 October 2026.", cite: [[C, "Register check"]] },
    rewards: { text: "BetFury pays every player 10% of the house edge as rakeback, withdrawable every 20 minutes, works out cashback twice a week, and runs $20,000 Daily Battles.", cite: [[B, "Rakeback"], [B, "Cashback"], [B, "Leaderboards"]] },
    vip: { text: "BetFury's VIP Club adds higher cashback and a personal manager, and its Super VIP Club, from Rank 15, doubles rakeback.", cite: [[B, "VIP levels"]] },
    cash: { text: "BetFury caps what it pays on any single bet or spin at $300,000, and anything deposited below a coin's minimum is lost.", cite: [[P, "Withdrawal limits"], [K, "Deposit limits"]] },
  },
  winna: {
    verdictIf: "you want rakeback every 7 minutes and a $50,000 weekly race",
    pickIf: [
      "You claim often: instant rakeback every 7 minutes",
      "You chase races: $50,000 weekly and $10,000 daily, entered automatically",
      "You'd like a regulator other than Curaçao or Anjouan: the Tobique Gaming Commission",
    ],
    code: { text: "Winna runs no deposit bonus; its rewards are VIP-based, starting with instant rakeback claimable every 7 minutes from the VIP Center.", cite: [[B, "Deposit bonus"], [B, "Rakeback"]] },
    licence: { text: "Winna is licensed by the Tobique Gaming Commission, whose register lists GG Gaming S.R.L with a licence running to 8 May 2027, while Winna's terms name GG Gaming LLC in Costa Rica.", cite: [[C, "Licence"], [C, "Company"]] },
    rewards: { text: "Winna runs a $10,000 daily race and a $50,000 weekly race with automatic entry, where slots score about four times Originals, and pays lossback of up to 25% from Platinum.", cite: [[B, "Leaderboards"], [B, "Cashback"]] },
    vip: { text: "Winna's six VIP bands of five levels run from Bronze 1 at $1,000 wagered to Nebula 5 at a billion.", cite: [[B, "VIP levels"]] },
    cash: { text: "Winna caps withdrawals at $10,000 per 24 hours, which a VIP host can raise, with a $20 minimum, and runs due diligence within 30 days of your first deposit.", cite: [[P, "Withdrawal limits"], [C, "KYC policy"]] },
  },
  thrill: {
    verdictIf: "you want rakeback from your very first bet and a $50,000 weekly race that pays 350 places",
    pickIf: [
      "You want rakeback from the start: instant rakeback from the entry Base level",
      "You chase deep races: $50,000 a week, paid to 350 places",
      "You bet sports: sports earn 3 XP per $1, the fastest way up its levels",
    ],
    code: { text: "Thrill runs no deposit bonus; instant rakeback and weekly and monthly bonuses start at the entry Base level, so they apply from your first bet.", cite: [[B, "Deposit bonus"], [B, "VIP levels"]] },
    licence: { text: "Thrill is licensed in Anjouan and run by Gravity Unleashed Limitada.", cite: [[C, "Licence"], [C, "Company"]] },
    rewards: { text: "Thrill's $50,000 weekly race runs Wednesday to Wednesday across casino and sportsbook and pays the top 350, with $15,000 to first.", cite: [[B, "Leaderboards"]] },
    vip: { text: "Thrill's level-up bonuses go from $15 at Bronze to $12,800 at Diamond I, and its Platinum ranks unlock reloads of up to 42 days.", cite: [[B, "Perks by level"], [B, "Reload bonuses"]] },
    cash: { text: "Thrill sets no minimum or maximum crypto deposit and no maximum withdrawal, and asks for no KYC to register.", cite: [[K, "Deposit limits"], [P, "Withdrawal limits"], [C, "KYC policy"]] },
  },
  yeet: {
    verdictIf: "you want a 100% welcome bonus up to $1,000 with no cashout cap",
    pickIf: [
      "You want a welcome bonus with no cashout cap: 100% up to $1,000",
      "You bet sports multis: YEET Boost adds up to 20% to winning multis of 12 legs",
      "You'd like time to clear it: 90 days for the 35x wagering",
    ],
    code: { text: "Yeet's 100% first deposit bonus goes up to $1,000 with 35x wagering on deposit plus bonus over 90 days, and Yeet sets no maximum cashout on it.", cite: [[B, "Standing offer"], [B, "Max cashout"]] },
    licence: { text: "Yeet holds Anjouan licence ALSI-20251036-FI2, and its complaints policy names Pacific Edge Ltd as its operator reference.", cite: [[C, "Licence"], [C, "Company"]] },
    rewards: { text: "Yeet pays 5% instant rakeback from Bronze to Eternal and 10% at the invite-only Chairman tier, and runs a $50,000 weekly Chairman's Cup for the top 25.", cite: [[B, "Rakeback"], [B, "Leaderboards"]] },
    vip: { text: "Yeet's tiers run from Copper at $100 wagered to Eternal at $250 million, each level paying a bonus that never expires, with a VIP host from Diamond.", cite: [[B, "Perks by level"]] },
    cash: { text: "Yeet sets no withdrawal limits and pays out in crypto only, but needs Level 1 KYC before you can deposit.", cite: [[P, "Withdrawal limits"], [C, "KYC policy"]] },
  },
  "bc-game": {
    verdictIf: "you want a deposit bonus every month and a weekly raffle",
    pickIf: ["A deposit bonus of up to 360% every month, with no wagering multiplier", "A $20,000 weekly raffle with 150 winners", "Every VIP level pays a bonus that never expires"],
    code: { text: "At BC.Game there is no code to type: our link adds the referral. Its standing offer is a Monthly 4-Deposit Bonus, up to four deposit bonuses a month from 180% on a $5 deposit to 360% on $30, added as locked rakeback that unlocks as you wager, with no wagering multiplier and no expiry.", cite: [[B, "Standing offer"]] },
    licence: { text: "BC.Game is run by Twocent Technology Limited in Belize and holds Anjouan licence ALSI-202410011-FI1.", cite: [[C, "Company"], [C, "Licence"]] },
    rewards: { text: "BC.Game doesn't publish a rakeback percentage, but runs a $20,000 weekly raffle with 150 winners and a Daily Wager Contest for the ten biggest wagerers each day.", cite: [[B, "Rakeback"], [B, "Weekly raffle"], [B, "Leaderboards"]] },
    vip: { text: "BC.Game has seven VIP tiers, from Beginner to Eternal, each split into Levels I to X, and every level pays a level-up bonus that never expires.", cite: [[B, "VIP levels"], [B, "Perks by level"]] },
    cash: { text: "BC.Game's minimum withdrawal is the equivalent of 20 USDT on major coins, its help centre states no crypto withdrawal time, and its basic KYC is a photo ID plus a selfie from five angles.", cite: [[P, "Minimum withdrawal"], [P, "Stated withdrawal time"], [C, "KYC policy"]] },
  },
  rollbit: {
    verdictIf: "you want 5% rakeback with nothing to unlock and a $25,000 daily race",
    pickIf: ["5% rakeback on all bets, claimable every 30 minutes", "A $25,000 Daily Race where sports and crypto futures wagers count", "No withdrawal fees beyond on-chain gas"],
    code: { text: "Rollbit has no code from us and no deposit bonus: its offer is the Rewards Calendar, 5% rakeback on all bets plus daily, weekly, monthly and rank-up bonuses.", cite: [[B, "Standing offer"]] },
    licence: { text: "Rollbit is run by Bull Gaming N.V., whose Curaçao licence OGL/2024/1260/0494 the Curaçao Gaming Authority's register dated 30 October 2026 lists as \"Expired. Re-evaluating in administrative appeal.\", with a listed expiry of 23 May 2026.", cite: [[C, "Company"], [C, "Register check"]] },
    rewards: { text: "Rollbit pays 5% rakeback on all bets, claimable every 30 minutes, and runs a $25,000 Daily Race with $10,000 for first place, where sports, casino and crypto futures wagers all count.", cite: [[B, "Rakeback"], [B, "Leaderboards"]] },
    vip: { text: "Rollbit's daily, weekly and monthly bonuses pay 20% straight away and release the other 80% over the calendar period, with lossback built into the weekly and monthly ones.", cite: [[B, "Reload bonuses"], [B, "Cashback"]] },
    cash: { text: "Rollbit charges no withdrawal fees beyond on-chain gas, says withdrawals are generally instant, from a few seconds to 60 minutes, and runs KYC in up to five levels.", cite: [[P, "Withdrawal fees"], [P, "Stated withdrawal time"], [C, "KYC policy"]] },
  },
  bitstarz: {
    verdictIf: "you want a big welcome package and weekly slot tournaments",
    pickIf: ["A 5 BTC + 180 free spins welcome package", "Weekly Slot Wars and Table Wars tournaments", "No withdrawal fees from BitStarz"],
    code: { text: "BitStarz has no code from us; its welcome package is 5 BTC plus 180 free spins, opening with 100% up to 1 BTC and 180 free spins on the first deposit, and its terms set 40× wagering for all bonuses unless stated otherwise.", cite: [[B, "Standing offer"], [B, "Wagering"]] },
    licence: { text: "BitStarz is run by Gareton B.V., which holds Curaçao licence OGL/2024/165/0185.", cite: [[C, "Company"], [C, "Licence"]] },
    rewards: { text: "BitStarz runs two weekly tournaments, Slot Wars with €5,000 and 5,000 free spins split between the top 150 and Table Wars with a $10,000 pool, plus a 50% Reload Monday up to $300 once you've made four deposits.", cite: [[B, "Leaderboards"], [B, "Reload bonuses"]] },
    vip: { text: "BitStarz's Level Up Adventure pays rewards from play alone, each time its progress bar fills.", cite: [[B, "VIP levels"]] },
    cash: { text: "BitStarz charges no withdrawal fees and aims to pay within an hour, but caps Bitcoin withdrawals at 1 BTC per transaction, and needs KYC documents before it pays out.", cite: [[P, "Withdrawal fees"], [P, "Stated withdrawal time"], [P, "Withdrawal limits"], [C, "KYC policy"]] },
  },
};

const TOPICS: [keyof Omit<CasinoBlocks, "verdictIf" | "pickIf">, string][] = [
  ["code", "What each code gets you"],
  ["licence", "Licence and who runs them"],
  ["rewards", "Rakeback and races"],
  ["vip", "VIP"],
  ["cash", "Withdrawals and ID checks"],
];

/** Pairs composed from the blocks: our top four codes against the rest, and the newer three against each other. */
// In versus.ts order (VERSUS_SLUGS), so each key is the pair's canonical URL.
const TOP = ["roobet", "stake", "shuffle", "gamdom"];
/** A pair in versus.ts order (VERSUS_SLUGS), so its key is the canonical URL. Kept in step with that list by hand: versus.ts imports this file. */
const ORDER = ["roobet", "stake", "bc-game", "shuffle", "rollbit", "gamdom", "duelbits", "rainbet", "razed", "winna", "thrill", "duel", "goated", "500-casino", "bitstarz", "yeet", "degen", "betfury"];
const ordered = (x: string, y: string): [string, string] => (ORDER.indexOf(x) < ORDER.indexOf(y) ? [x, y] : [y, x]);
const COMPOSED_PAIRS: [string, string][] = [
  ...TOP.flatMap((a) => ["duelbits", "rainbet", "razed", "duel", "goated", "yeet"].map((b) => [a, b] as [string, string])),
  ["duelbits", "goated"],
  ["duelbits", "yeet"],
  ["goated", "yeet"],
  ...TOP.flatMap((a) => ["winna", "thrill", "degen", "betfury"].map((b) => [a, b] as [string, string])),
  ["winna", "thrill"],
  ["winna", "degen"],
  ["winna", "betfury"],
  ["thrill", "degen"],
  ["thrill", "betfury"],
  ["degen", "betfury"],
  // November 2026: BC.Game, Rollbit and BitStarz against the top four and each other.
  ...["bc-game", "rollbit", "bitstarz"].flatMap((x) => [...TOP, "bc-game", "rollbit", "bitstarz"].filter((y) => y !== x).map((y) => ordered(x, y))),
];

const NEW = new Set(["bc-game", "rollbit", "bitstarz"]);

function compose(a: string, b: string): VersusAnalysis {
  const A = BLOCKS[a], Bk = BLOCKS[b];
  const name = (slug: string) => (opsJson as { slug: string; name: string }[]).find((o) => o.slug === slug)?.name ?? slug;
  return {
    verdict: `${name(a)} if ${A.verdictIf}; ${name(b)} if ${Bk.verdictIf}.`,
    published: NEW.has(a) || NEW.has(b) ? "2026-11-04" : "2026-10-30",
    pickIf: { [a]: A.pickIf, [b]: Bk.pickIf },
    sections: TOPICS.map(([k, title]) => ({
      title,
      body: `${A[k].text} ${Bk[k].text}`,
      cite: [...A[k].cite.map(([group, label]) => ({ slug: a, group, label })), ...Bk[k].cite.map(([group, label]) => ({ slug: b, group, label }))],
    })),
  };
}

/** Every pair with written analysis, keyed by its canonical pair slug (versus.ts order). */
export const VERSUS_ANALYSIS: Record<string, VersusAnalysis> = (() => {
  const out: Record<string, VersusAnalysis> = { ...WRITTEN };
  for (const [a, b] of COMPOSED_PAIRS) {
    const key = `${a}-vs-${b}`;
    if (!out[key]) out[key] = compose(a, b);
  }
  return out;
})();
