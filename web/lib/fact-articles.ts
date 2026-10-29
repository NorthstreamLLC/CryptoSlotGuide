/**
 * "10 facts about <casino>" articles at /casinos/<slug>/facts. Every fact is
 * written from one spec-sheet fact (by group + label), which supplies its
 * source link and date, so the article can't cite something the sheet
 * doesn't hold. Re-check the wording here whenever those facts change.
 */
export type FactItem = { icon: string; title: string; body: string; group: string; label: string };

export type FactArticle = {
  /** Lede under the H1. */
  intro: string;
  /** First published, YYYY-MM-DD. */
  published: string;
  /** Short figures for the strip under the hero. */
  glance: { k: string; v: string }[];
  facts: FactItem[];
};

export const FACT_ARTICLES: Record<string, FactArticle> = {
  stake: {
    intro: "Stake is one of the biggest names in crypto gambling, but most players know it for its sponsors rather than its terms. Here are ten things worth knowing before you sign up, each checked against Stake's own pages or its regulator's register.",
    published: "2026-10-29",
    glance: [
      { k: "Licence", v: "Curaçao" },
      { k: "Rakeback", v: "3.5% of edge" },
      { k: "Min deposit", v: "None on crypto" },
      { k: "Max withdrawal", v: "No cap" },
    ],
    facts: [
      {
        icon: "🏢",
        title: "Stake is run by Medium Rare N.V. in Curaçao",
        body: "Its footer names Medium Rare N.V., registration 145353, at Seru Loraweg 17 B in Curaçao, with Medium Rare Limited and MRS Tech Limited as its payment agents.",
        group: "Compliance",
        label: "Company",
      },
      {
        icon: "🏛️",
        title: "Its licence reads \"assessment in progress\"",
        body: "Medium Rare N.V. holds licence OGL/2024/1451/0918 on the Curaçao Gaming Authority's register dated 20 October 2026. The listed expiry, 9 June 2026, has passed and the status reads \"Assessment in progress\", the same as 297 of the 666 licences on the list. Stake's own footer shows no licence number.",
        group: "Compliance",
        label: "Register check",
      },
      {
        icon: "🎁",
        title: "There's no deposit match",
        body: "Stake doesn't run a fixed welcome bonus. Its value comes as rakeback and recurring bonuses instead: a monthly bonus, a weekly boost posted in its VIP Telegram group, drop codes, level-up bonuses and a birthday bonus.",
        group: "Bonus terms",
        label: "Standing offer",
      },
      {
        icon: "⚡",
        title: "A code starts your rakeback from the first bet",
        body: "Rakeback normally only starts at Bronze, after $10,000 wagered. Enter an affiliate code on the offers page within 24 hours of opening your account and Stake's welcome offer unlocks its 3.5% rakeback straight away.",
        group: "Bonus terms",
        label: "Welcome offer",
      },
      {
        icon: "💰",
        title: "Rakeback is 3.5% of the house edge, not of your bet",
        body: "On casino games you get back 3.5% of the edge, win or lose. Poker pays 3.5% of the rake and sports 3.5% of a 3% theoretical edge. What builds up can be claimed at any time from the rakeback tab on the VIP page.",
        group: "Bonus terms",
        label: "Rakeback",
      },
      {
        icon: "🏁",
        title: "A $100,000 race pays 5,000 players every day",
        body: "The Daily Race resets every 24 hours and pays the top 5,000 racers each cycle. Alongside it run Stake Wheel Wars, a Pragmatic Play promotion with a $150,000 monthly prize pool, and rotating casino challenges.",
        group: "Bonus terms",
        label: "Leaderboards",
      },
      {
        icon: "👑",
        title: "There are 15 VIP levels, up to a billion wagered",
        body: "They run from Bronze at 10,000 to Obsidian at 1,000,000,000. Monthly, weekly and level-up bonuses start at Bronze, daily bonuses at Platinum, and custom benefits at Diamond.",
        group: "Bonus terms",
        label: "VIP levels",
      },
      {
        icon: "⚽",
        title: "Sports bets move you up three times faster",
        body: "Stake's VIP page says sports wagering progresses your level three times faster than casino play, so a sports bettor reaches each bonus tier sooner.",
        group: "Bonus terms",
        label: "Perks by level",
      },
      {
        icon: "💸",
        title: "There's no maximum withdrawal",
        body: "Your whole available balance can be withdrawn, with no daily or monthly cap stated. Each coin has its own minimum, 0.00002504 BTC for Bitcoin, and a per-coin withdrawal fee comes off your balance.",
        group: "Payouts & fees",
        label: "Withdrawal limits",
      },
      {
        icon: "🤝",
        title: "Drake, the UFC and Everton are on its partner list",
        body: "Its Sponsorships menu lists more than 20 partners, from Drake, the UFC and Everton to the X Games, Team Vitality, Astralis and footballers Kun Agüero, Iker Casillas and Eden Hazard.",
        group: "Compliance",
        label: "Partners",
      },
    ],
  },
  roobet: {
    intro: "Roobet is one of the most recognisable crypto casinos, but the details that matter sit in its terms and help centre. Here are ten things worth knowing before you sign up, each checked against Roobet's own pages or its regulator's register.",
    published: "2026-10-29",
    glance: [
      { k: "Licence", v: "Curaçao" },
      { k: "Code boost", v: "+20% for 72h" },
      { k: "Weekly raffle", v: "$100,000" },
      { k: "Max withdrawal", v: "No cap" },
    ],
    facts: [
      {
        icon: "🏢",
        title: "Roobet is run by Raw Entertainment B.V. in Curaçao",
        body: "Its footer names Raw Entertainment B.V., registration 157205, at Korporaalweg 10 in Curaçao. A sister company, Raw Entertainment Ltd in Limassol, Cyprus, acts as its paying and operational agent.",
        group: "Compliance",
        label: "Company",
      },
      {
        icon: "🏛️",
        title: "Its Curaçao licence has no expiry date",
        body: "Raw Entertainment B.V. holds licence OGL/2024/687/0427, issued 24 December 2025. On the Curaçao Gaming Authority's register dated 20 October 2026 it has no expiry and its status reads \"Indefinite\", as it does for 209 of the 666 licences listed.",
        group: "Compliance",
        label: "Register check",
      },
      {
        icon: "⚡",
        title: "An affiliate code boosts your rakeback by 20% for 72 hours",
        body: "Roobet's Rakeboosts lift your rakeback rate for a while: +10% for 24 hours at sign-up, and +20% for 72 hours when you join with an affiliate code. Boosts don't stack; only the highest one applies.",
        group: "Bonus terms",
        label: "Rakeback",
      },
      {
        icon: "🎟️",
        title: "A $100,000 raffle pays 100 players every week",
        body: "Every $1,000 you wager earns a raffle ticket, and some games give two. The pool is usually $100,000, split among 100 winners each week.",
        group: "Bonus terms",
        label: "Weekly raffle",
      },
      {
        icon: "🎰",
        title: "Its Roo Jackpots side bet pays back about 80%",
        body: "Launched on 12 October 2026, Roo Jackpots lets you add $0.10, $1 or $5 to every bet for a shot at four jackpots starting at $200, $5,000, $75,000 and $250,000. Wins carry no wagering, but Roobet's own jackpot window puts the average RTP at 80%.",
        group: "Bonus terms",
        label: "Roo Jackpots",
      },
      {
        icon: "📅",
        title: "Rewards drop daily, weekly, monthly and three times a day",
        body: "A daily bonus builds for up to 72 hours, a weekly bonus lands every Saturday, a monthly one on the 1st, and the Vault opens every 8 hours with rewards that expire after 24 hours.",
        group: "Bonus terms",
        label: "Reload bonuses",
      },
      {
        icon: "👑",
        title: "The VIP Club is invite-only",
        body: "There's no way to apply: Roobet's VIP team sends invitations based on loyalty, activity and variety of play. Members get VIP events and tournaments, weekly slot rewards, activity-based cashback and 24/7 VIP support.",
        group: "Bonus terms",
        label: "VIP levels",
      },
      {
        icon: "🔮",
        title: "You can trade prediction markets from your Roobet balance",
        body: "Its prediction markets are powered by Polymarket: Yes and No shares cost $0.01 to $0.99 and each winning share pays $1. Money spent on positions doesn't count toward Roobet's rewards.",
        group: "Sportsbook",
        label: "Prediction markets",
      },
      {
        icon: "🌍",
        title: "It isn't open in the US, the UK or Australia",
        body: "Its terms restrict 25 countries and territories, including the United States, the United Kingdom, Australia, the Netherlands, Cyprus, Malta and Curaçao itself.",
        group: "Bonus terms",
        label: "Restricted countries",
      },
      {
        icon: "🤝",
        title: "Chelsea FC is on its partner list",
        body: "Its homepage names Roobet an official partner of Chelsea FC, alongside UFC fighters Charles Oliveira and Diego Lopes, esports team 100 Thieves, Karate Combat, Matchroom and the World Nineball Tour.",
        group: "Compliance",
        label: "Partners",
      },
    ],
  },
  shuffle: {
    intro: "Shuffle runs its own token, SHFL, alongside one of the bigger weekly races in crypto gambling. Here are ten things worth knowing before you sign up, each checked against Shuffle's own pages or its regulator's register.",
    published: "2026-10-29",
    glance: [
      { k: "Licence", v: "Curaçao" },
      { k: "Weekly race", v: "$100,000" },
      { k: "Min deposit", v: "$0.01" },
      { k: "Sports max win", v: "$500,000" },
    ],
    facts: [
      {
        icon: "🏢",
        title: "Shuffle is run by Natural Nine B.V. in Curaçao",
        body: "Its licence page names Natural Nine B.V., Curaçao registration 160998, as the company behind Shuffle, holding licence OGL/2024/1337/0628.",
        group: "Compliance",
        label: "Company",
      },
      {
        icon: "🏛️",
        title: "Its Curaçao licence has no expiry date",
        body: "On the Curaçao Gaming Authority's register dated 20 October 2026, Natural Nine B.V.'s licence, issued 24 December 2025, has no expiry and its status reads \"Indefinite\", as it does for 209 of the 666 licences listed.",
        group: "Compliance",
        label: "Register check",
      },
      {
        icon: "💰",
        title: "Rakeback comes in three layers, and you can withdraw all of it",
        body: "Instant rakeback lands straight after each bet, with weekly and monthly rakeback on top, at a rate set by your VIP level. None of it carries wagering: it can be played or withdrawn right away.",
        group: "Bonus terms",
        label: "Rakeback",
      },
      {
        icon: "🏁",
        title: "A $100,000 race pays 1,000 players every week",
        body: "The weekly leaderboard runs Sunday to Sunday at 07:00 UTC and pays the top 1,000, though only the top 20 are shown publicly. Casino and sports wagers both count.",
        group: "Bonus terms",
        label: "Leaderboards",
      },
      {
        icon: "🎱",
        title: "It runs a weekly lottery for holders of its own token",
        body: "The SHFL Lottery draws every Friday. Each ticket takes 50 staked SHFL tokens, you pick five numbers from 1 to 55 plus a Powerball from 1 to 18, and prizes are paid in USDC.",
        group: "Bonus terms",
        label: "Weekly raffle",
      },
      {
        icon: "🪜",
        title: "Every one of its ranks pays a level-up bonus",
        body: "Ranks run from Wood at $500 wagered through Bronze, Silver, Gold, Platinum, Jade, Sapphire and Ruby to Diamond at $17 million and up. Each pays an automatic level-up bonus, from about $0.90 at Bronze to about $9,360 at Diamond 1.",
        group: "Bonus terms",
        label: "VIP levels",
      },
      {
        icon: "📅",
        title: "Bonus codes drop in its Telegram channels every day",
        body: "On top of a daily bonus from Bronze, a weekly bonus and a monthly bonus, Shuffle posts bonus drop codes at random times each day in its Telegram channels.",
        group: "Bonus terms",
        label: "Reload bonuses",
      },
      {
        icon: "🪙",
        title: "You can deposit from one cent",
        body: "The minimum deposit is $0.01 or the crypto equivalent on every supported coin. Claiming a deposit bonus takes at least $20, unless the offer says otherwise.",
        group: "Coins & deposit limits",
        label: "Minimum deposit",
      },
      {
        icon: "⚽",
        title: "Sports winnings are capped at $500,000 a day",
        body: "Shuffle's sports rules set a maximum win of $500,000 on sports bets, and the same figure as a customer's maximum daily winnings unless Shuffle has agreed otherwise.",
        group: "Sportsbook",
        label: "Max payout",
      },
      {
        icon: "🤝",
        title: "It's an official partner of Sunderland AFC",
        body: "Shuffle says it is an official partner of Sunderland, with its own promotions hub carrying exclusive offers and boosted odds on the club's matches.",
        group: "Compliance",
        label: "Partners",
      },
    ],
  },
  gamdom: {
    intro: "Gamdom made headlines in October 2026, but there's more to know than the outage. Here are ten things worth knowing before you sign up, each checked against Gamdom's own pages.",
    published: "2026-10-29",
    glance: [
      { k: "Licence", v: "Anjouan" },
      { k: "Code boost", v: "15% for 7 days" },
      { k: "ID check", v: "Only if asked" },
      { k: "Withdrawal limit", v: "None" },
    ],
    facts: [
      {
        icon: "🛑",
        title: "It went offline in October after a security scare",
        body: "In October 2026 Gamdom took all of its systems offline after finding an unauthorised connection on one of its automation servers, spotted while it was investigating a possible disk failure. It said user funds were safe and has since announced it is back online.",
        group: "Compliance",
        label: "Security incident",
      },
      {
        icon: "🏛️",
        title: "It's licensed in Anjouan, not Curaçao",
        body: "Gamdom's help centre names the Anjouan Gaming Authority as its regulator, under licence ALSI-152406043-FI held by its operator, Moon Revolution Limitada.",
        group: "Compliance",
        label: "Licence",
      },
      {
        icon: "🏢",
        title: "Its operator is based in Costa Rica",
        body: "Its terms name Moon Revolution Limitada, registration 3-102-903008, with an address on La Ceiba Street in Escazú, San José, Costa Rica.",
        group: "Compliance",
        label: "Company",
      },
      {
        icon: "🪪",
        title: "You don't need to verify your ID unless asked",
        body: "Gamdom says verification isn't required to deposit, play or withdraw unless it specifically asks for it.",
        group: "Compliance",
        label: "KYC policy",
      },
      {
        icon: "⚡",
        title: "New accounts get up to 15% rakeback for a week",
        body: "New players get instant rewards boosted to as much as 15%, activated within the first 6 hours after registering and valid for 7 days.",
        group: "Bonus terms",
        label: "Standing offer",
      },
      {
        icon: "💰",
        title: "Rakeback is paid in real time and never expires",
        body: "Instant rakeback adjusts as you play, factoring in each game's RTP and house edge. You can claim it from $0.10, it credits instantly, and it never expires. Weekly and monthly rewards run alongside it.",
        group: "Bonus terms",
        label: "Rakeback",
      },
      {
        icon: "👑",
        title: "King of the Hill pays out $1 million a month",
        body: "A daily leaderboard pays $30,000 across the top 200, and two $500,000 tournaments a month each pay the top 1,000. Prizes carry no wagering and don't expire.",
        group: "Bonus terms",
        label: "Leaderboards",
      },
      {
        icon: "🪜",
        title: "Its 24 levels pay rewards you claim yourself",
        body: "Royalty Up has 24 levels across eight tiers, from Bronze to Opal. Every rank-up pays a reward, but you have to claim it from the Rewards page; it never expires. An invite-only VIP programme adds fee-free withdrawals and a dedicated team.",
        group: "Bonus terms",
        label: "Perks by level",
      },
      {
        icon: "💸",
        title: "There are no withdrawal limits",
        body: "Gamdom says there are no withdrawal limits on fiat or crypto. Deposits must be wagered once first, and withdrawals go out in the same coin you deposited.",
        group: "Payouts & fees",
        label: "Withdrawal limits",
      },
      {
        icon: "🤝",
        title: "Its name is on a Scottish football shirt",
        body: "Gamdom News is a front-of-shirt partner of Dunfermline Athletic, who play in the Scottish Championship.",
        group: "Compliance",
        label: "Partners",
      },
    ],
  },
};

export const hasFactArticle = (slug: string) => slug in FACT_ARTICLES;
