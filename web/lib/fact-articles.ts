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
        body: "Medium Rare N.V. holds licence OGL/2024/1451/0918 on the Curaçao Gaming Authority's register dated 30 October 2026. The listed expiry, 9 June 2026, has passed and the status reads \"Assessment in progress\", the same as 296 of the 666 licences on the list. Stake's own footer shows no licence number.",
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
        body: "Raw Entertainment B.V. holds licence OGL/2024/687/0427, issued 24 December 2025. On the Curaçao Gaming Authority's register dated 30 October 2026 it has no expiry and its status reads \"Indefinite\", as it does for 209 of the 666 licences listed.",
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
        body: "On the Curaçao Gaming Authority's register dated 30 October 2026, Natural Nine B.V.'s licence, issued 24 December 2025, has no expiry and its status reads \"Indefinite\", as it does for 209 of the 666 licences listed.",
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
        body: "The minimum deposit is $0.01 or the crypto equivalent on every supported coin.",
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
      { k: "Withdrawal limit", v: "High, no figure" },
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
        title: "It promises high withdrawal limits, but names no figure",
        body: "Gamdom describes \"high withdrawal limits\" on fiat and crypto without publishing a number. Deposits must be wagered once first, and withdrawals go out in the same coin you deposited.",
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
  duel: {
    intro: "Duel is the crypto casino that refuses to run bonuses and pays its players back through the house edge instead. Here are ten things worth knowing before you sign up, each checked against Duel's own pages.",
    published: "2026-10-29",
    glance: [
      { k: "Licence", v: "Anjouan" },
      { k: "Deposit bonus", v: "None, by design" },
      { k: "Slots rakeback", v: "50% of edge" },
      { k: "Monthly race", v: "$3,000,000" },
    ],
    facts: [
      {
        icon: "🎮",
        title: "Its operator used to run CSGOEmpire",
        body: "Duel's own about page says it is run by the operator known as Monarch, who previously ran the CS skin casino CSGOEmpire, with a team of around 100 people.",
        group: "Compliance",
        label: "Operator",
      },
      {
        icon: "🏢",
        title: "The company behind it is registered in Nevis",
        body: "Its footer names Immortal Snail LLC, registration L22982, at the Arthur L. Evelyn Building on Main Street, Charlestown, Nevis.",
        group: "Compliance",
        label: "Company",
      },
      {
        icon: "🏛️",
        title: "It's licensed in Anjouan",
        body: "Duel's footer shows an Anjouan licence, ALSI-202411026-FI1, rather than a Curaçao one.",
        group: "Compliance",
        label: "Licence",
      },
      {
        icon: "🚫",
        title: "It doesn't do deposit bonuses, on purpose",
        body: "Duel argues against bonuses rather than offering them, and even has a page called \"Why Bonuses Suck\". Its in-house Originals are built to 100% RTP with zero house edge instead.",
        group: "Bonus terms",
        label: "Standing offer",
      },
      {
        icon: "💰",
        title: "Half the house edge on slots comes straight back",
        body: "On third-party slots, 50% of the house edge you pay is returned instantly, turning a 4% edge into an effective 2%. On Duel Originals the 0.1% edge is refunded as rakeback within a daily zero-edge allowance.",
        group: "Bonus terms",
        label: "Rakeback",
      },
      {
        icon: "🎯",
        title: "It says its house games pay 99.9%",
        body: "Duel says its house games run at 99.9% RTP, with a goal of reaching 100%, against the 99% it calls standard elsewhere. That's Duel's own claim; we haven't verified the figures.",
        group: "Bonus terms",
        label: "House edge claim",
      },
      {
        icon: "🏁",
        title: "Its monthly race pays $1.5 million to first place",
        body: "The $3,000,000 monthly race pays $1,500,000 for 1st, $345,000 for 2nd and $225,000 for 3rd, and still $30,000 at 10th. A $25,000 daily race runs alongside.",
        group: "Bonus terms",
        label: "Leaderboard prizes",
      },
      {
        icon: "👑",
        title: "There's no VIP ladder",
        body: "Duel has no VIP levels or level-up rewards. It calls daily, weekly and monthly level-up bonuses retention tricks and returns value through instant rakeback instead.",
        group: "Bonus terms",
        label: "VIP levels",
      },
      {
        icon: "⚖️",
        title: "Disputes go to arbitration in Anjouan",
        body: "Complaints start with its support team. Anything unresolved goes to binding arbitration in Anjouan, each side pays its own costs, and players waive class actions.",
        group: "Compliance",
        label: "Disputes",
      },
      {
        icon: "🌍",
        title: "It's closed to the US, the UK and much of Europe",
        body: "Its terms list 30 restricted countries, including the USA, the UK, Australia, France, Germany, Spain and the Netherlands, and St Kitts and Nevis, where its own company is registered.",
        group: "Compliance",
        label: "Restricted countries",
      },
    ],
  },
  duelbits: {
    intro: "Duelbits skips the deposit bonus and pays rakeback four ways instead. Here are ten things worth knowing before you sign up, each checked against Duelbits' own pages or its regulator's register.",
    published: "2026-10-29",
    glance: [
      { k: "Licence", v: "Curaçao" },
      { k: "Rakeback", v: "25% of edge" },
      { k: "Deposit bonus", v: "None" },
      { k: "Max withdrawal", v: "No cap" },
    ],
    facts: [
      {
        icon: "🏢",
        title: "Duelbits is run by Liquid Entertainment N.V.",
        body: "Its help centre names Liquid Entertainment N.V., registration 153298, as the company behind Duelbits.",
        group: "Compliance",
        label: "Company",
      },
      {
        icon: "🏛️",
        title: "Its Curaçao licence reads \"assessment in progress\"",
        body: "Liquid Entertainment N.V. holds licence OGL/2024/1507/0838. On the Curaçao Gaming Authority's register dated 30 October 2026, its listed expiry of 24 December 2025 has passed and the status reads \"Assessment in progress\", as it does for 296 of the 666 licences listed.",
        group: "Compliance",
        label: "Register check",
      },
      {
        icon: "💰",
        title: "Rakeback is 25% of the house edge, paid four ways",
        body: "10% comes back instantly, then 5% daily, 5% weekly every Monday and 5% monthly. Unclaimed rakeback resets: daily at 00:00 UTC, weekly on Monday and monthly on the 1st.",
        group: "Bonus terms",
        label: "Rakeback",
      },
      {
        icon: "📈",
        title: "Level-ups and referrals can take it to 47.5%",
        body: "Level-up rewards in Ace's Lounge add up to 12.5% on top, for 37.5%, and referrals add up to 10% of the house edge from invited players' wagers. Sports bets count at a 1% edge, so $10,000 wagered returns $25.",
        group: "Bonus terms",
        label: "Rakeback",
      },
      {
        icon: "🏁",
        title: "Its leaderboards reward low-RTP games",
        body: "Points are wager x (1 - RTP), so $100 on a 96% RTP slot scores 400 points while $100 on 99.29% blackjack scores 71. A $10,000 daily board pays the top 100 and a $30,000 weekly board the top 250.",
        group: "Bonus terms",
        label: "Leaderboards",
      },
      {
        icon: "🚫",
        title: "There's no deposit bonus",
        body: "Its help centre lists weekly promos, VIP rakeback, giveaways and Ace's Rewards, with no deposit bonus, so your deposit is never locked behind a rollover.",
        group: "Bonus terms",
        label: "Deposit bonus",
      },
      {
        icon: "🎁",
        title: "VIPs get extra rakeback every Tuesday",
        body: "Selected VIP players can collect extra rakeback from casino or sportsbook every Tuesday, alongside weekly promos and one-click community giveaways on Discord.",
        group: "Bonus terms",
        label: "Reload bonuses",
      },
      {
        icon: "🔮",
        title: "You can bet on real-world events with Duelbits Predict",
        body: "Its prediction markets cover sports and esports, crypto prices, gaming and entertainment, culture and politics. Payout is stake x odds, some markets allow early cash-out, and predictions can't be changed once placed.",
        group: "Sportsbook",
        label: "Prediction markets",
      },
      {
        icon: "💸",
        title: "No maximum withdrawal, but wager 10% first",
        body: "There's no withdrawal cap and no platform fee, but at least 10% of a deposit must be wagered before you withdraw. Minimums run from $10 for coins like LTC and SOL to $50 for BTC and ETH.",
        group: "Payouts & fees",
        label: "Withdrawal limits",
      },
      {
        icon: "🤝",
        title: "It sponsors Team Liquid's CS2 roster",
        body: "Duelbits is title sponsor of Team Liquid's Counter-Strike 2 team, works with former UFC champion Michael Bisping, backs the CUPRA KIRO Formula E team and sponsors Eddie Hall's strongman series, Battle of the Beasts.",
        group: "Compliance",
        label: "Partners",
      },
    ],
  },
  rainbet: {
    intro: "Rainbet runs a $1 million monthly race and lets crypto players skip ID checks. Here are ten things worth knowing before you sign up, each checked against Rainbet's own pages.",
    published: "2026-10-29",
    glance: [
      { k: "Licence", v: "Anjouan" },
      { k: "Monthly race", v: "$1,000,000" },
      { k: "ID check", v: "Not for crypto" },
      { k: "Withdrawals", v: "5–15 min" },
    ],
    facts: [
      {
        icon: "🏢",
        title: "Its terms name RBGAMING N.V.",
        body: "Its terms name RBGAMING N.V., registration 16077, as the company behind Rainbet.",
        group: "Compliance",
        label: "Company",
      },
      {
        icon: "🏛️",
        title: "Its Anjouan licence checks out as valid",
        body: "Rainbet's Anjouan licence, ALSI-152406029-FI2, shows as VALID on the Anjouan Gaming validator linked from its footer seal, which names the holder as Rain Group Ltd.",
        group: "Compliance",
        label: "Licence",
      },
      {
        icon: "🪪",
        title: "Crypto players don't need to verify their ID",
        body: "Rainbet says crypto play and withdrawals need no KYC, though it may ask for documents if it sees suspicious activity.",
        group: "Compliance",
        label: "KYC policy",
      },
      {
        icon: "🏆",
        title: "Its monthly race pays $100,000 to first place",
        body: "The $1M monthly race pays $100,000 for 1st, $62,000 for 2nd and $42,000 for 3rd, still paying $1,600 at 100th. Daily and weekly races run alongside, and sportsbook bets count three times toward your rank.",
        group: "Bonus terms",
        label: "Leaderboards",
      },
      {
        icon: "🎟️",
        title: "Everyone gets a free raffle ticket every week",
        body: "The $20,000 weekly raffle gives every participant one free ticket, plus one per $500 wagered. Each week 50 tickets are drawn and each wins $400.",
        group: "Bonus terms",
        label: "Weekly raffle",
      },
      {
        icon: "⏱️",
        title: "You can claim rakeback every 15 minutes",
        body: "Rakeback is based on your total wagered and can be claimed every 15 minutes, with part of it feeding the Daily Reload. RakeBoosts lift it for an hour at a time.",
        group: "Bonus terms",
        label: "Rakeback",
      },
      {
        icon: "🎁",
        title: "The first deposit bonus needs 40x turnover",
        body: "Deposit and bonus go into a promotional balance that must be turned over 40x, so $100 becomes $200 in play and needs $8,000 of wagering. Games above 97.4% RTP are switched off while it's active. Rainbet's terms page also lists a No Wager Lock version.",
        group: "Bonus terms",
        label: "Standing offer",
      },
      {
        icon: "🛑",
        title: "It doesn't offer deposit limits",
        body: "Rainbet's help centre says it offers no responsible-gambling deposit limits and points players to loss limits instead.",
        group: "Coins & deposit limits",
        label: "Deposit limits",
      },
      {
        icon: "💸",
        title: "Withdrawals take 5 to 15 minutes",
        body: "Rainbet says withdrawals are typically processed within 5 to 15 minutes.",
        group: "Payouts & fees",
        label: "Stated withdrawal time",
      },
      {
        icon: "🥊",
        title: "Its partners include UFC fighters and 6ix9ine",
        body: "Its homepage names Rainbet an official partner of UFC fighters Sean Strickland, Justin Gaethje and Joshua Van, rapper 6ix9ine, and Bare Knuckle Fighting Championship.",
        group: "Compliance",
        label: "Partners",
      },
    ],
  },
  razed: {
    intro: "Razed pairs a welcome bonus with a VIP ladder that has cars as prizes. Here are ten things worth knowing before you sign up, each checked against Razed's own pages.",
    published: "2026-10-29",
    glance: [
      { k: "Licence", v: "Anjouan" },
      { k: "Welcome bonus", v: "100% up to $300" },
      { k: "Monthly race", v: "$100,000" },
      { k: "Top VIP prize", v: "Lamborghini" },
    ],
    facts: [
      {
        icon: "🏢",
        title: "Razed is run from Costa Rica",
        body: "Its footer names Wild Technology Ltd., registration 3-102-898807 in Costa Rica, with DEDARIO LTD in Cyprus as its payment agent.",
        group: "Compliance",
        label: "Company",
      },
      {
        icon: "🏛️",
        title: "It's licensed in Anjouan",
        body: "Razed's footer shows Anjouan licence ALSI-132405034-FI3.",
        group: "Compliance",
        label: "Licence",
      },
      {
        icon: "🪪",
        title: "It calls itself no-KYC, but asks for ID when you withdraw",
        body: "Razed describes itself as a no-KYC crypto casino, while its AML policy says ID documents are requested when you withdraw.",
        group: "Compliance",
        label: "KYC policy",
      },
      {
        icon: "🎁",
        title: "New players get 100% up to $300 plus up to 150 free spins",
        body: "The first deposit is matched 100% up to $300, opted into on the deposit screen, plus 100 free spins on Sugar Rush 1000 for a $100 to $199 deposit or 150 for $200 and up, spread over five days.",
        group: "Bonus terms",
        label: "Standing offer",
      },
      {
        icon: "🏎️",
        title: "The first players to reach its top ranks win a car",
        body: "The first to reach Red Diamond wins a Mercedes G-Wagon, the first to Blue Diamond a Lamborghini Huracán STO, and the first to Onyx a Lamborghini Revuelto.",
        group: "Bonus terms",
        label: "Milestone prizes",
      },
      {
        icon: "💵",
        title: "Rank-up rewards go as high as $500,000",
        body: "Every rank pays a cash reward, from $20 at Bronze 1 ($10,000 wagered) and $100 at Gold 1 to $15,000 at Diamond and $500,000 at Onyx, a billion wagered.",
        group: "Bonus terms",
        label: "Rank-up rewards",
      },
      {
        icon: "🔁",
        title: "Lossback is built into the monthly bonus",
        body: "From the entry Starter rank, the Monthly Bonus is worked out on both your total wager and your losses, so part of it works as lossback.",
        group: "Bonus terms",
        label: "Cashback",
      },
      {
        icon: "⚽",
        title: "Sports bets count three times toward VIP",
        body: "Its sportsbook lists more than 40 sports, from soccer and American football to darts, snooker and NASCAR, and all sports turnover counts 3x toward your VIP progress.",
        group: "Sportsbook",
        label: "Sportsbook",
      },
      {
        icon: "🏁",
        title: "A $100,000 race runs every month",
        body: "The Monthly Race has a $100,000 pool with $30,000 for first place, and a $10,000 Weekly Race runs alongside it.",
        group: "Bonus terms",
        label: "Leaderboards",
      },
      {
        icon: "🎮",
        title: "It sponsors esports team HEROIC",
        body: "Razed sponsors HEROIC, the esports organisation, and runs a dedicated HEROIC page in its promotions section.",
        group: "Compliance",
        label: "Partners",
      },
    ],
  },
  goated: {
    intro: "Goated grew up without a welcome bonus and added one in October 2026. Here are ten things worth knowing before you sign up, each checked against Goated's own pages.",
    published: "2026-10-29",
    glance: [
      { k: "Licence", v: "Anjouan" },
      { k: "Welcome bonus", v: "100% up to $1,000" },
      { k: "Weekly race", v: "$25,000" },
      { k: "Withdrawals", v: "1–2 min" },
    ],
    facts: [
      {
        icon: "🏢",
        title: "Goated is run by Mirai Kaze Ltd in Anjouan",
        body: "Its footer names Mirai Kaze Ltd, registration 16180, in Anjouan.",
        group: "Compliance",
        label: "Company",
      },
      {
        icon: "🏛️",
        title: "It's licensed in Anjouan",
        body: "Goated's footer shows Anjouan licence ALSI-202411063-FI2.",
        group: "Compliance",
        label: "Licence",
      },
      {
        icon: "🆕",
        title: "Its first deposit bonus halves your VIP rewards",
        body: "The new 100% first deposit bonus goes up to $1,000 from a $20 deposit, with 35x wagering on deposit plus bonus and a $10 max bet. While it's active, VIP rewards are halved.",
        group: "Bonus terms",
        label: "Standing offer",
      },
      {
        icon: "🪙",
        title: "Betting its own token earns better rakeback",
        body: "Instant rakeback starts at Bronze with no wagering strings, and players wagering the $GOATED token get enhanced rates compared with other currencies.",
        group: "Bonus terms",
        label: "Rakeback",
      },
      {
        icon: "⚡",
        title: "Most withdrawals land in a minute or two",
        body: "Goated says most withdrawals reach the blockchain within a minute or two; larger ones go to manual review first, and every withdrawal needs a two-factor code.",
        group: "Payouts & fees",
        label: "Stated withdrawal time",
      },
      {
        icon: "💸",
        title: "The network fee comes on top of your withdrawal",
        body: "The fee is deducted on top of the amount you take out, so withdrawing 100 USDC on Ethereum costs 103 USDC. Every deposit must be wagered once before you withdraw.",
        group: "Payouts & fees",
        label: "Withdrawal fees",
      },
      {
        icon: "🗓️",
        title: "Weekly reloads arrive as 168 hourly claims",
        body: "Weekly Reloads land automatically every Tuesday, sized on your past week's wagering, profit and VIP level, then split into 168 hourly claims that each stay open for 12 hours.",
        group: "Bonus terms",
        label: "Reload bonuses",
      },
      {
        icon: "👑",
        title: "There are 45 VIP levels, each with a bonus",
        body: "Nine tiers of five levels run from Bronze 1 at $1,000 wagered to Diamond 5 at $40 million, and every level pays a level-up bonus sized on your level and the games you play.",
        group: "Bonus terms",
        label: "VIP levels",
      },
      {
        icon: "🔄",
        title: "You can bring your VIP status from Stake or Roobet",
        body: "Players with higher status at Stake, Roobet, Shuffle, Gamdom, Rainbet and others can ask support for a transfer, then hit a casino-only wager target in their first 30 days.",
        group: "Bonus terms",
        label: "VIP transfer",
      },
      {
        icon: "🪪",
        title: "You can sign up with just an email or a wallet",
        body: "Level 0 needs only an email or wallet. Name, date of birth and address unlock betting and withdrawals, and ID and proof of address raise your limits.",
        group: "Compliance",
        label: "KYC policy",
      },
    ],
  },
  yeet: {
    intro: "Yeet pairs an uncapped welcome bonus with an invite-only top tier that comes with access to its founders. Here are ten things worth knowing before you sign up, each checked against Yeet's own pages.",
    published: "2026-10-29",
    glance: [
      { k: "Licence", v: "Anjouan" },
      { k: "Welcome bonus", v: "100% up to $1,000" },
      { k: "Max cashout", v: "No cap" },
      { k: "Rakeback", v: "5% to 10%" },
    ],
    facts: [
      {
        icon: "🏢",
        title: "Its complaints policy names Pacific Edge Ltd",
        body: "Yeet's complaints policy gives Pacific Edge Ltd as its operator reference.",
        group: "Compliance",
        label: "Company",
      },
      {
        icon: "🏛️",
        title: "It's licensed in Anjouan",
        body: "Yeet's help centre gives Anjouan licence ALSI-20251036-FI2.",
        group: "Compliance",
        label: "Licence",
      },
      {
        icon: "🎁",
        title: "Its welcome bonus has no cashout cap",
        body: "New accounts get a 100% first deposit bonus up to $1,000, with 35x wagering on deposit plus bonus over 90 days and a $10 max bet. Yeet sets no maximum win or cashout, and you can cancel the bonus at any time.",
        group: "Bonus terms",
        label: "Standing offer",
      },
      {
        icon: "🪪",
        title: "You'll need to verify before you deposit",
        body: "Level 1 KYC is required before depositing, and more checks may be asked for on any withdrawal.",
        group: "Compliance",
        label: "KYC policy",
      },
      {
        icon: "💰",
        title: "Rakeback is 5% at almost every tier",
        body: "Instant rakeback is 5% of the house edge from Bronze all the way to Eternal, rising to 10% only at the invite-only Chairman tier. It never expires, and sports bets don't count.",
        group: "Bonus terms",
        label: "Rakeback",
      },
      {
        icon: "⚽",
        title: "Big sports multis get a cash boost",
        body: "YEET Boost adds a cash bonus to winning multis with five or more selections: 5% at five, rising a point per leg to 10% at ten, then 15% at 11 and 20% at 12, with no wagering.",
        group: "Bonus terms",
        label: "Standing offer",
      },
      {
        icon: "🏆",
        title: "A $50,000 Chairman's Cup runs every week",
        body: "The top 25 players share a $50,000 prize pool each week, alongside a general leaderboard across game types.",
        group: "Bonus terms",
        label: "Leaderboards",
      },
      {
        icon: "👑",
        title: "Its top tier gets you the founding team",
        body: "Chairman is invite-only and comes with access to Yeet's founding team. A VIP host unlocks earlier, at Diamond.",
        group: "Bonus terms",
        label: "VIP levels",
      },
      {
        icon: "🔄",
        title: "It will match your VIP status from another casino",
        body: "With $250,000 wagered elsewhere and a $100 deposit, the VIP Tier Match pays $1,500 for hitting $250,000 in 45 days, up to $150,000 for $25 million.",
        group: "Bonus terms",
        label: "VIP transfer",
      },
      {
        icon: "💸",
        title: "There are no withdrawal limits",
        body: "Yeet sets no withdrawal limits, pays out in crypto only and asks that deposits be wagered once before withdrawing.",
        group: "Payouts & fees",
        label: "Withdrawal limits",
      },
    ],
  },
  degen: {
    intro: "Degen pays rakeback on a ladder that climbs from 3% to 8%. Here are ten things worth knowing before you sign up, each checked against Degen's own pages.",
    published: "2026-10-29",
    glance: [
      { k: "Licence", v: "Anjouan" },
      { k: "Rakeback", v: "3% to 8%" },
      { k: "Weekly race", v: "$25,000" },
      { k: "Top level-up", v: "$100,000" },
    ],
    facts: [
      {
        icon: "🏢",
        title: "Degen is run from Costa Rica",
        body: "Its footer names Degen Legend Limitada, registration 3-102-932227, at Barrio Dent in San José, Costa Rica.",
        group: "Compliance",
        label: "Company",
      },
      {
        icon: "🏛️",
        title: "It's licensed in Anjouan",
        body: "Degen's footer shows a licence from Anjouan in the Union of Comoros, ALSI-202509061-FI2.",
        group: "Compliance",
        label: "Licence",
      },
      {
        icon: "📝",
        title: "Its disputes policy still has a placeholder in it",
        body: "Its payouts policy points unresolved disputes to its regulator, but the published text reads \"[Anjouan Authority or Other Jurisdiction License]\" instead of naming one.",
        group: "Compliance",
        label: "Dispute body",
      },
      {
        icon: "🎁",
        title: "Its deposit bonus needs an eligible referral code",
        body: "The 100% first deposit match goes up to $1,500 from a $20 deposit, but only if your account was registered under an eligible referral code.",
        group: "Bonus terms",
        label: "Standing offer",
      },
      {
        icon: "💰",
        title: "Rakeback climbs from 3% to 8%",
        body: "Rakeback builds on every wager and can be claimed any time from the Rewards panel. The rate rises with VIP rank from 3% at Bronze I to 8% at the top Degen rank, and sports bets earn a theoretical 3%.",
        group: "Bonus terms",
        label: "Rakeback",
      },
      {
        icon: "🪜",
        title: "Its 27 levels pay up to $100,000 for a level-up",
        body: "Levels run from Unranked to Degen, with wagering targets from $10,000 at Bronze I to $1 billion at the top. Level-up bonuses go from $10 at Bronze I to $100,000 at Degen.",
        group: "Bonus terms",
        label: "VIP levels",
      },
      {
        icon: "💎",
        title: "Reaching a new rank pays an extra bonus",
        body: "The first level of each new rank adds a rank-up bonus: $10 at Bronze I, $100 at Platinum I, $5,000 at Ruby I, $20,000 at Diamond I and $60,000 at Degen.",
        group: "Bonus terms",
        label: "Perks by level",
      },
      {
        icon: "🏁",
        title: "A $25,000 race runs every week",
        body: "The Weekly Race covers house games, live casino, slots and sports. The top 20 share the pool, from $10,000 for first down to $100, paid automatically.",
        group: "Bonus terms",
        label: "Leaderboards",
      },
      {
        icon: "💸",
        title: "Withdrawals go up to about $1 million in crypto",
        body: "Its per-coin withdrawal limits are pegged to roughly $1,000,000, about 13 BTC or 408 ETH, and recalculated as prices move. Minimums are tiny, such as 1 USDT.",
        group: "Payouts & fees",
        label: "Withdrawal limits",
      },
      {
        icon: "🌀",
        title: "Deposits from a mixer can freeze your account",
        body: "Deposits must come from a method in your own name, third-party deposits are refused, and deposits from mixers can freeze the account.",
        group: "Coins & deposit limits",
        label: "Deposit rules",
      },
    ],
  },
  betfury: {
    intro: "BetFury spreads its welcome bonus over three deposits and pays rakeback to every player from day one. Here are ten things worth knowing before you sign up, each checked against BetFury's own pages or its regulator's register.",
    published: "2026-10-29",
    glance: [
      { k: "Licence", v: "Curaçao" },
      { k: "Welcome pack", v: "Up to 590%" },
      { k: "Rakeback", v: "10% of edge" },
      { k: "Max win", v: "$300,000" },
    ],
    facts: [
      {
        icon: "🏢",
        title: "BetFury is run by Universe B Games",
        body: "Its terms name Universe B Games B.V., registration 155126, though its footer calls the company an N.V.",
        group: "Compliance",
        label: "Company",
      },
      {
        icon: "🏛️",
        title: "Its Curaçao licence reads \"assessment in progress\"",
        body: "Universe B Games B.V. holds licence OGL/2024/1494/0942. On the Curaçao Gaming Authority's register dated 30 October 2026, its listed expiry of 31 July 2026 has passed and the status reads \"Assessment in progress\", as it does for 296 of the 666 licences listed.",
        group: "Compliance",
        label: "Register check",
      },
      {
        icon: "🎁",
        title: "Its welcome pack covers three deposits",
        body: "Three welcome bonuses, each activated by its own deposit, add up to 590% in deposit bonus plus 225 free spins. Each has 14 days to wager and bets are capped at $10 while a bonus is active.",
        group: "Bonus terms",
        label: "Standing offer",
      },
      {
        icon: "💰",
        title: "Every player gets 10% rakeback",
        body: "Rakeback is 10% of the house edge on every bet, for everyone, and can be withdrawn once every 20 minutes. Leave it unclaimed for 90 days and it expires.",
        group: "Bonus terms",
        label: "Rakeback",
      },
      {
        icon: "🔁",
        title: "Cashback is paid twice a week",
        body: "Cashback on lost deposit funds is worked out every Tuesday and Friday, at a rate set by your rank and the game category. BetFury's own page gives the ceiling as both 20% and 25%.",
        group: "Bonus terms",
        label: "Cashback",
      },
      {
        icon: "🏆",
        title: "A single bet or spin can win at most $300,000",
        body: "BetFury's Maximum Win Limit caps what it is obliged to pay on any bet or spin, including bonus rounds and bought free spins, at the equivalent of $300,000.",
        group: "Payouts & fees",
        label: "Withdrawal limits",
      },
      {
        icon: "⚔️",
        title: "It runs battles worth up to $100,000",
        body: "Daily Battles share $20,000 every day, Sports Battles go up to $30,000, and VIP & High Rollers Battles up to $100,000, paid in BFG and USDT as each ends.",
        group: "Bonus terms",
        label: "Leaderboards",
      },
      {
        icon: "📲",
        title: "Its Telegram bot can triple your monthly bonus",
        body: "The monthly bonus is worked out on the 1st from last month's wagering and losses, and connecting BetFury's Telegram bot can increase it up to three times.",
        group: "Bonus terms",
        label: "Reload bonuses",
      },
      {
        icon: "🔮",
        title: "You can bet on Eurovision and elections",
        body: "A Predictions section in its sportsbook covers real-world events such as Eurovision, politics and elections, crypto prices, stocks and sports milestones, as fixed-odds bets.",
        group: "Sportsbook",
        label: "Prediction markets",
      },
      {
        icon: "⚠️",
        title: "Deposits below the minimum are lost",
        body: "Each currency has its own minimum deposit, and anything sent below it is lost and not refunded. There's no maximum deposit and no deposit fee.",
        group: "Coins & deposit limits",
        label: "Deposit limits",
      },
    ],
  },
  winna: {
    intro: "Winna is licensed by the Tobique Gaming Commission rather than in Curaçao or Anjouan, and pays rakeback every few minutes. Here are ten things worth knowing before you sign up, each checked against Winna's own pages or its regulator's register.",
    published: "2026-10-29",
    glance: [
      { k: "Licence", v: "Tobique" },
      { k: "Rakeback", v: "Every 7 min" },
      { k: "Weekly race", v: "$50,000" },
      { k: "Daily withdrawal", v: "$10,000" },
    ],
    facts: [
      {
        icon: "🏛️",
        title: "It's licensed by the Tobique Gaming Commission",
        body: "The Tobique Gaming Commission's licence-holder register lists GG Gaming S.R.L with a B2C licence that runs to 8 May 2027, while Winna's footer and terms name the operator as GG Gaming LLC.",
        group: "Compliance",
        label: "Licence",
      },
      {
        icon: "🏢",
        title: "Its operator is based in Costa Rica",
        body: "Its terms name GG Gaming LLC, in San José, Costa Rica.",
        group: "Compliance",
        label: "Company",
      },
      {
        icon: "💸",
        title: "Withdrawals are capped at $10,000 a day",
        body: "The standard limit is $10,000 per 24 hours, which a VIP host can raise at higher levels. The minimum is $20 per withdrawal.",
        group: "Payouts & fees",
        label: "Withdrawal limits",
      },
      {
        icon: "⏱️",
        title: "You can claim rakeback every 7 minutes",
        body: "Instant rakeback returns part of every wager and becomes claimable every 7 minutes from the VIP Center, at a rate that scales with your VIP level.",
        group: "Bonus terms",
        label: "Rakeback",
      },
      {
        icon: "🔁",
        title: "Lossback goes up to 25% from Platinum",
        body: "Platinum players and above can get up to 25% of losses back as a bonus, and the monthly bonus from Bronze 1 is part rakeback, part lossback.",
        group: "Bonus terms",
        label: "Cashback",
      },
      {
        icon: "🏁",
        title: "Slots score about four times more in its races",
        body: "A $10,000 daily race and a $50,000 weekly race enter everyone automatically. Points are weighted by game: Originals about 1x, sports about 3x and slots about 4x on average.",
        group: "Bonus terms",
        label: "Leaderboards",
      },
      {
        icon: "🎯",
        title: "Challenges pay the first to hit a target multiplier",
        body: "The first player to hit a target such as 2,000x to 10,000x on a listed game at the minimum bet wins that challenge. Bonus buys don't count.",
        group: "Bonus terms",
        label: "Missions",
      },
      {
        icon: "🪜",
        title: "Its top band starts at a billion wagered",
        body: "Six VIP bands of five levels each run from Bronze 1 at $1,000 wagered to Nebula 5 at $1,000,000,000 and up.",
        group: "Bonus terms",
        label: "VIP levels",
      },
      {
        icon: "🔄",
        title: "It will match your VIP status from another casino",
        body: "With $1 million wagered elsewhere and a $100 deposit, a VIP transfer gets you 30 days of VIP perks and a dedicated host.",
        group: "Bonus terms",
        label: "VIP transfer",
      },
      {
        icon: "🪪",
        title: "You'll be verified within 30 days of your first deposit",
        body: "Winna runs due diligence within 30 days of your first deposit, before your first withdrawal, or before you wager EUR 2,000, whichever comes first.",
        group: "Compliance",
        label: "KYC policy",
      },
    ],
  },
  thrill: {
    intro: "Thrill starts paying rakeback from the very first level and runs a weekly race that pays 350 places. Here are ten things worth knowing before you sign up, each checked against Thrill's own pages.",
    published: "2026-10-29",
    glance: [
      { k: "Licence", v: "Anjouan" },
      { k: "Weekly race", v: "$50,000" },
      { k: "Rakeback", v: "From Base level" },
      { k: "Deposit limits", v: "None" },
    ],
    facts: [
      {
        icon: "🏢",
        title: "Thrill is run from Costa Rica",
        body: "Its footer names Gravity Unleashed Limitada, registration 3-102-923055.",
        group: "Compliance",
        label: "Company",
      },
      {
        icon: "🏛️",
        title: "It's licensed in Anjouan",
        body: "Thrill's footer shows Anjouan licence ALSI-202506019-FI1.",
        group: "Compliance",
        label: "Licence",
      },
      {
        icon: "🪪",
        title: "You don't need ID to sign up",
        body: "Thrill asks for no KYC at registration, though verification may be required later.",
        group: "Compliance",
        label: "KYC policy",
      },
      {
        icon: "💰",
        title: "Rakeback starts from your very first bet",
        body: "Instant rakeback returns a share of the house edge on every eligible casino bet, win or lose, and is available from the entry Base level up.",
        group: "Bonus terms",
        label: "Rakeback",
      },
      {
        icon: "🏁",
        title: "Its $50,000 weekly race pays 350 places",
        body: "The race runs Wednesday to Wednesday at 2pm UTC across casino and sportsbook, pays $15,000 to first and still pays $8 at 350th, straight into your USDT wallet.",
        group: "Bonus terms",
        label: "Leaderboards",
      },
      {
        icon: "⚽",
        title: "Sports bets level you up fastest",
        body: "Sports earn 3 XP per $1 wagered at odds of 1.10 or more, while casino games earn 0.5 to 1.5 XP per $1 depending on house edge.",
        group: "Bonus terms",
        label: "VIP levels",
      },
      {
        icon: "🪜",
        title: "Level-up bonuses reach $12,800",
        body: "Bronze adds level-up bonuses, from $15 at Bronze up to $12,800 at Diamond I, and Emerald brings a VIP host and the High Rollers Telegram.",
        group: "Bonus terms",
        label: "Perks by level",
      },
      {
        icon: "🔁",
        title: "Platinum ranks unlock reloads of up to 42 days",
        body: "Reaching Platinum I, II and III pays 14-, 28- and 42-day reloads, and host reloads are added from Emerald.",
        group: "Bonus terms",
        label: "Reload bonuses",
      },
      {
        icon: "🪙",
        title: "There's no minimum or maximum deposit",
        body: "Thrill sets no minimum and no maximum deposit for any supported cryptocurrency.",
        group: "Coins & deposit limits",
        label: "Deposit limits",
      },
      {
        icon: "💸",
        title: "There's no maximum withdrawal",
        body: "Withdrawals have no maximum. Each coin's minimum equals its fixed fee, such as 0.00002504 BTC with a 0.00001571 fee.",
        group: "Payouts & fees",
        label: "Withdrawal limits",
      },
    ],
  },
  "1win": {
    "intro": "1win runs a large casino and sportsbook, but its own pages and its terms don't always tell the same story. Here are ten things worth knowing before you sign up, each checked against 1win's own pages or its regulator's register.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Curaçao"
      },
      {
        "k": "Wagering",
        "v": "30× bonus"
      },
      {
        "k": "Max bonus",
        "v": "$500"
      },
      {
        "k": "ID check",
        "v": "Over $500"
      }
    ],
    "facts": [
      {
        "icon": "🏛️",
        "title": "Its Curaçao licence reads \"assessment in progress\"",
        "body": "1Win N.V. holds licence OGL/2024/587/0621 on the Curaçao Gaming Authority's register dated 14 Sep 2026. It was issued on 6 Sep 2025, the listed expiry of 6 Mar 2026 has passed, and the status reads \"Assessment in progress\". 1win's own pages don't name 1Win N.V.",
        "group": "Compliance",
        "label": "Register check"
      },
      {
        "icon": "🔍",
        "title": "Its own pages name no licence or regulator",
        "body": "Neither its terms nor its footer give a licence number or a regulator. The footer shows a Gamecheck Trust Seal, and its FAQ says only that it operates under an international licence.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🎁",
        "title": "The first-deposit bonus carries 30× wagering",
        "body": "Its bonus card shows a 100% first-deposit bonus with 30× wagering, and its terms say the requirement applies to the bonus amount only.",
        "group": "Bonus terms",
        "label": "Wagering"
      },
      {
        "icon": "🔒",
        "title": "The first-deposit bonus is capped at $500",
        "body": "Its bonus card lists a maximum bonus of $500 and a maximum withdrawal of ×1.",
        "group": "Bonus terms",
        "label": "Max cashout"
      },
      {
        "icon": "⚠️",
        "title": "Withdrawing while a bonus is active cancels it",
        "body": "Bonus funds sit in a separate balance and are only used once your real balance drops below $0.50 with no open bets. Withdrawing while a bonus is active or pending cancels it, and so does activating a queued bonus.",
        "group": "Bonus terms",
        "label": "Bonus rules"
      },
      {
        "icon": "💰",
        "title": "Rakeback only starts at Bronze 2",
        "body": "From Bronze 2, rakeback is credited win or lose on slots, live, table and 1win games, with crypto bets earning a higher percentage. It is worked out from your stake and the game's house edge, and carries x1 wagering before you can withdraw it.",
        "group": "Bonus terms",
        "label": "Rakeback"
      },
      {
        "icon": "👑",
        "title": "Its VIP programme has 20 levels",
        "body": "You start at Bronze 1 and climb by lifetime turnover, from US$5,000 for Bronze 2 to US$5,000,000,000 for Black 5. 1win says exclusive privileges start at Gold 3, which takes US$1,000,000.",
        "group": "Bonus terms",
        "label": "VIP levels"
      },
      {
        "icon": "⏱️",
        "title": "Its guide says 3 minutes, its terms say up to 5 days",
        "body": "Its crypto withdrawal guide says payouts usually confirm in about 3 minutes on TRC-20, BEP-20 and TON. Its terms allow 1 to 60 minutes for up to $50, and up to 5 days above that, with up to 3 more business days possible.",
        "group": "Payouts & fees",
        "label": "Stated withdrawal time"
      },
      {
        "icon": "🪪",
        "title": "ID can be requested once withdrawals pass $500",
        "body": "Its crypto guide says KYC isn't mandatory on every withdrawal, but its terms let it ask for ID once total withdrawals pass $500, and for ID, proof of address or a bank statement at any time.",
        "group": "Compliance",
        "label": "KYC policy"
      },
      {
        "icon": "🌍",
        "title": "It isn't open in the US, the UK or Australia",
        "body": "Its restricted list includes the United States, the United Kingdom, Australia, France, Germany, Spain, Italy, the Netherlands and Curaçao among many others, and VPNs are prohibited.",
        "group": "Compliance",
        "label": "Restricted countries"
      }
    ]
  },
  "bc-game": {
    "intro": "BC.Game is one of the longest-running crypto casinos, with a bonus system built around locked rakeback rather than wagering. Here are ten things worth knowing before you sign up, each checked against BC.Game's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Anjouan"
      },
      {
        "k": "Deposit bonus",
        "v": "Up to 360%"
      },
      {
        "k": "Weekly raffle",
        "v": "$20,000"
      },
      {
        "k": "ID check",
        "v": "ID + selfie"
      }
    ],
    "facts": [
      {
        "icon": "🏛️",
        "title": "It's licensed in Anjouan",
        "body": "Its licence is ALSI-202410011-FI1 from Anjouan, in the Union of Comoros.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🏢",
        "title": "Its operator is registered in Belize",
        "body": "BC.Game names Twocent Technology Limited, registration 000041939, on Sea Urchin Street in San Pedro, Ambergris Caye.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "📜",
        "title": "It holds separate permits in Nigeria and Mexico",
        "body": "Its licences page lists bcbet.ng under a Nigerian National Sports Betting Permit (#2005793, to 31 Jul 2028) and bcgame.mx under Mexican permit DGAJS/SCEVF/P-06/2005-Ter.",
        "group": "Compliance",
        "label": "Other licences"
      },
      {
        "icon": "🎁",
        "title": "Its deposit bonus resets every month, up to 360%",
        "body": "The Monthly 4-Deposit Bonus pays 180%, 240%, 300% and then 360% across four deposits, claimed in order and reset on the 1st at 00:00 UTC. Each bonus is added as locked rakeback rather than bonus cash.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "🔓",
        "title": "The bonus unlocks as you play, not by a multiplier",
        "body": "There's no wagering multiplier: each bonus sits as locked rakeback and is released at amount wagered × house edge × 1%, at a rate set by game type, house edge and turnover.",
        "group": "Bonus terms",
        "label": "Wagering rules"
      },
      {
        "icon": "🛡️",
        "title": "New players get 20% of net losses back, up to $5,000",
        "body": "A Welcome Shield covers 20% of net losses up to $5,000 for a limited time after joining. Eligible VIPs can also request lossback in real money through support, with no wagering and no expiry once issued.",
        "group": "Bonus terms",
        "label": "Cashback"
      },
      {
        "icon": "🎟️",
        "title": "A $20,000 raffle pays 150 players every week",
        "body": "Wager $100 in a day for a ticket, then earn one more per $1,000 wagered, up to 100 a week. The draw runs every Monday at 12:00 UTC, paying $5,000 for first place down to $20 for 51st to 150th.",
        "group": "Bonus terms",
        "label": "Weekly raffle"
      },
      {
        "icon": "🔐",
        "title": "Changing your password freezes withdrawals for 24 hours",
        "body": "Withdrawals are suspended for 24 hours after any password change.",
        "group": "Payouts & fees",
        "label": "Withdrawal holds"
      },
      {
        "icon": "🪪",
        "title": "Its basic ID check needs a selfie from five angles",
        "body": "Basic KYC is a government photo ID, front and back, plus a selfie from five angles. Advanced KYC, if requested, adds proof of address from the last 3 months.",
        "group": "Compliance",
        "label": "KYC policy"
      },
      {
        "icon": "🤝",
        "title": "Leicester City is on its partner list",
        "body": "BC.Game became Official Principal Partner of Leicester City Football Club in 2024, and its Sponsorships menu also lists Jason Derulo, Lil Pump, Colby Covington, the Abu Dhabi T10 League and its own BC Game Esports team.",
        "group": "Compliance",
        "label": "Partners"
      }
    ]
  },
  "500-casino": {
    "intro": "500 Casino grew out of CS2 and Rust skin gambling, and it still pays out in skins as well as crypto. Here are ten things worth knowing before you sign up, each checked against 500 Casino's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Curaçao"
      },
      {
        "k": "Welcome",
        "v": "300% boost"
      },
      {
        "k": "Bonus wagering",
        "v": "40×"
      },
      {
        "k": "Max bet",
        "v": "$100"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "It is run by Perfect Storm B.V. in Curaçao",
        "body": "Its operator is Perfect Storm B.V., Curaçao registration 150536.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "It holds a Curaçao licence",
        "body": "Its licence is OGL/2024/1354/0882 from the Curaçao Gaming Control Board.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🎁",
        "title": "Its 300% welcome bonus is a rakeback boost, not cash",
        "body": "A first eligible deposit over $25 adds 300% of the deposit, up to $15,000, as a rakeback boost plus 50 free spins. The most you can withdraw from the offer is 3x the rakeback boost plus $1,000 from the free spins.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "🐢",
        "title": "The boost unlocks $1 for every $400 wagered",
        "body": "The rakeback boost releases $1 per $400 you wager, and the free-spin bonus balance carries 40× wagering on casino games.",
        "group": "Bonus terms",
        "label": "Wagering"
      },
      {
        "icon": "⏳",
        "title": "You have 7 days to make the qualifying deposit",
        "body": "Deposit within 7 days of registering. The rakeback boost then lasts 90 days, free spins must be claimed within 48 hours, and unclaimed bonus balance is lost after 14 days.",
        "group": "Bonus terms",
        "label": "Expiry"
      },
      {
        "icon": "🎯",
        "title": "Bonus-balance bets are capped at $100",
        "body": "Each bet made with bonus balance is limited to $100.",
        "group": "Bonus terms",
        "label": "Max bet"
      },
      {
        "icon": "⌚",
        "title": "Reaching level 1200 pays a Rolex",
        "body": "VIP starts at Level 500 and runs through 12 tiers of 100 levels each, from Silver to Supernova. A direct VIP host starts at Sapphire, and reaching level 1200 (Obsidian) pays a Rolex watch.",
        "group": "Bonus terms",
        "label": "Perks by level"
      },
      {
        "icon": "🎮",
        "title": "You can cash out in crypto or in CS2 and Rust skins",
        "body": "500 Casino doesn't offer direct real-money withdrawals: payouts go out in crypto or as P2P items for CS2 and Rust via a connected Steam account. You need to be at least Level 1 with a previous deposit, and no maximum withdrawal figure is published.",
        "group": "Payouts & fees",
        "label": "Withdrawal limits"
      },
      {
        "icon": "🏁",
        "title": "Its own pages disagree on how often its leaderboards run",
        "body": "The rewards overview, dated 21 July 2026, describes Weekly and Daily Royales, while the Royales article describes Monthly Royales in which the top 100 share a $250,000 pool with a $100,000 top prize.",
        "group": "Bonus terms",
        "label": "Leaderboards"
      },
      {
        "icon": "🪪",
        "title": "You get 7 days to send KYC documents",
        "body": "The casino may request any KYC documentation, which has to be provided within 7 calendar days.",
        "group": "Compliance",
        "label": "KYC policy"
      }
    ]
  },
  "sportsbet-io": {
    "intro": "Sportsbet.io is a crypto sportsbook first, with a casino alongside and two Premier League clubs on its partner list. Here are ten things worth knowing before you sign up, each checked against Sportsbet.io's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Curaçao"
      },
      {
        "k": "Welcome",
        "v": "100% to 300 USDT"
      },
      {
        "k": "Max cashout",
        "v": "3,000 USDT"
      },
      {
        "k": "Crypto fee",
        "v": "Covered"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "Sportsbet.io is run by mBet Solutions N.V. in Curaçao",
        "body": "Its operator is mBet Solutions N.V., number 129230, at Schout Bij Nacht Doormanweg 40, with some payments handled by its subsidiary mProcessing Solutions Ltd in Nicosia, Cyprus.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "It holds a Curaçao Gaming Authority licence",
        "body": "Licence OGL/2023/110/0072 was issued on 22 July 2024 and extended under the LOK.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🎁",
        "title": "The welcome bonus is 100% up to 300 USDT",
        "body": "The Champions Welcome Bonus matches a deposit of at least 10 USDT and can be used on sports or casino. You opt in via the Rewards or Promotions tab, with a 72-hour window after activation.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "🔒",
        "title": "Your whole deposit stays locked while you wager the bonus",
        "body": "Wagering is 25× on sports or 40× on casino games, and the deposit stays locked until the bonus is wagered or forfeited. The terms don't say whether the multiplier covers the deposit too.",
        "group": "Bonus terms",
        "label": "Wagering"
      },
      {
        "icon": "💵",
        "title": "Bonus winnings are capped at 3,000 USDT",
        "body": "The maximum cashout is 10× the maximum bonus amount, which works out at 3,000 USDT.",
        "group": "Bonus terms",
        "label": "Max cashout"
      },
      {
        "icon": "🎰",
        "title": "Live table games count just 10% toward casino wagering",
        "body": "Slots count 100%, live game shows 20%, and live baccarat, roulette and blackjack, table and RNG games 10%. Some games are excluded entirely.",
        "group": "Bonus terms",
        "label": "Game contribution"
      },
      {
        "icon": "⛽",
        "title": "It covers the crypto network fee on withdrawals",
        "body": "Sportsbet.io says it pays the crypto transaction fee, so the amount you withdraw is what arrives, though its general terms still reserve the right to deduct fees.",
        "group": "Payouts & fees",
        "label": "Withdrawal fees"
      },
      {
        "icon": "🪪",
        "title": "Withdrawals over €2,500 may need extra checks",
        "body": "Additional KYC may apply to withdrawals over €2,500, or to smaller ones.",
        "group": "Compliance",
        "label": "KYC policy"
      },
      {
        "icon": "⚽",
        "title": "Top football wins are capped at €1,000,000 a bet",
        "body": "Maximum winnings are set per sport in any 24-hour period and exclude stake: €1,000,000 per single bet on top football, tennis Grand Slams and the Super Bowl, €500,000 on the NBA and €100,000 on top esports. On a multiple, the lowest limit applies.",
        "group": "Sportsbook",
        "label": "Max payout"
      },
      {
        "icon": "🤝",
        "title": "Tottenham and Aston Villa are on its partner list",
        "body": "Tottenham Hotspur named Sportsbet.io its Official North America & Africa Betting Partner in a three-year deal from the 2026/27 season, and Aston Villa named it the club's Official Crypto Betting Partner.",
        "group": "Compliance",
        "label": "Partners"
      }
    ]
  },
  jackpotbet: {
    "intro": "JackpotBet pairs a 100% deposit bonus with flat 6% rakeback, but its terms carry caps that aren't on the front page. Here are ten things worth knowing before you sign up, each checked against JackpotBet's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Anjouan"
      },
      {
        "k": "Wagering",
        "v": "35× dep + bonus"
      },
      {
        "k": "Rakeback",
        "v": "6% of edge"
      },
      {
        "k": "Daily win cap",
        "v": "EUR 100,000"
      }
    ],
    "facts": [
      {
        "icon": "🏛️",
        "title": "It's licensed in Anjouan",
        "body": "Take The Crown LLC holds Internet Gaming Licence ALSI-202409051-FI2, issued by the Offshore Finance Authority of the State of Anjouan and shown as valid on the Anjouan validator.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🏢",
        "title": "Its operator is registered in St Vincent & the Grenadines",
        "body": "Take The Crown LLC, registration 3701 LLC 2024, is based at Euro House, Richmond Hill Road, Kingstown.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🎁",
        "title": "Its 100% bonus needs 35× the deposit plus the bonus",
        "body": "Wagering on the regular 100% up to $1,000 offer is 35× the deposit plus the bonus, and the same page says all its deposit bonuses carry either a 35× or a 40× rollover.",
        "group": "Bonus terms",
        "label": "Wagering"
      },
      {
        "icon": "🎯",
        "title": "Bets are capped at 5% while you clear the bonus",
        "body": "On the regular offer the maximum bet is 5% of the deposit plus the bonus, with a $5 floor if that works out lower.",
        "group": "Bonus terms",
        "label": "Max bet"
      },
      {
        "icon": "🎰",
        "title": "Table games count only 10% toward wagering",
        "body": "Most slots count 100%, table games 10%, and blackjack, roulette, video poker, arcade and craps 5%. Covering 24 or more roulette numbers voids winnings.",
        "group": "Bonus terms",
        "label": "Wagering rules"
      },
      {
        "icon": "💰",
        "title": "Rakeback is 6% of the house edge, claimable from $10,000 wagered",
        "body": "Instant rakeback returns 6% of the house edge on every bet. It builds up from your first bet but only becomes claimable at Bronze, after $10,000 wagered.",
        "group": "Bonus terms",
        "label": "Rakeback"
      },
      {
        "icon": "🔁",
        "title": "VIPs from other casinos get 30 days to match their rank",
        "body": "Hit a wager target of 10% of what you wagered elsewhere within 30 days and JackpotBet matches your rank and pays a cash bonus, from $105 for Gold up to $26,250 for Apex. Players who have already wagered $2,500 or taken another welcome offer aren't eligible.",
        "group": "Bonus terms",
        "label": "VIP transfer"
      },
      {
        "icon": "🪪",
        "title": "It asks for a selfie with your ID on deposits and withdrawals",
        "body": "Its AML policy asks for proof of identity and address plus a selfie holding the ID both when any deposit is made and when a withdrawal is requested.",
        "group": "Compliance",
        "label": "KYC policy"
      },
      {
        "icon": "💸",
        "title": "Daily winnings are capped at EUR 100,000",
        "body": "Wins over EUR 50,000 can be paid in monthly instalments of up to EUR 50,000, with progressive jackpots paid in full, and daily winnings are capped at EUR 100,000 unless the casino agrees otherwise.",
        "group": "Payouts & fees",
        "label": "Payout caps"
      },
      {
        "icon": "⚽",
        "title": "You can't bet on sports with an active bonus",
        "body": "There's no sports bonus, and the sportsbook can't be used with a currency that has an active deposit-bonus rollover.",
        "group": "Sports bonus terms",
        "label": "Offer"
      }
    ]
  },
  vave: {
    "intro": "Vave offers one of the bigger BTC welcome packages, but the terms that decide what you can withdraw sit deep in its bonus rules. Here are ten things worth knowing before you sign up, each checked against Vave's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Curaçao"
      },
      {
        "k": "Welcome",
        "v": "Up to 4 BTC"
      },
      {
        "k": "Bonus win cap",
        "v": "10,000 USDT"
      },
      {
        "k": "Weekly cashback",
        "v": "Up to 7%"
      }
    ],
    "facts": [
      {
        "icon": "🏛️",
        "title": "Its licence number isn't confirmed on the Curaçao register",
        "body": "Vave's help centre says TechOptions Group B.V. holds a licence from the Curaçao gaming authority, and a November 2024 blog post gives the number as GLH-OCCHKTW0702282021. That number is not confirmed on the Curaçao Gaming Authority register.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🎁",
        "title": "Its welcome package runs to 4 BTC plus 100 free spins",
        "body": "It is spread over four deposits: 150% up to 1.5 BTC with 100 free spins, then 100% up to 1 BTC, 50% up to 1 BTC and 25% up to 0.5 BTC. The minimum deposit for the standard bonuses is $20.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "🔍",
        "title": "The wagering multiplier is only shown on the bonus card",
        "body": "Deposit bonuses must be wagered the number of times set in each bonus's terms, and the welcome bonus is paid in instalments as you go. The multiplier itself only appears in the info tab on the bonus card.",
        "group": "Bonus terms",
        "label": "Wagering rules"
      },
      {
        "icon": "⚖️",
        "title": "Its terms disagree on the maximum bet",
        "body": "The welcome bonus terms say there's no maximum bet while wagering it, free spins excluded, but its general bonus terms set 5 USDT with an active casino bonus unless a bonus's own terms say otherwise.",
        "group": "Bonus terms",
        "label": "Max bet"
      },
      {
        "icon": "🔒",
        "title": "Bonus winnings are capped at 10,000 USDT",
        "body": "Winnings from any deposit, cashback, VIP, weekly, tournament or Vave points bonus are capped at 10,000 USDT, with the excess forfeited. Winnings from no-deposit bonuses or free spins are capped at 50 USDT.",
        "group": "Bonus terms",
        "label": "Max cashout"
      },
      {
        "icon": "🎰",
        "title": "Table and live dealer games don't count toward wagering",
        "body": "Slots count 100%, except a long list of excluded titles including Dead or Alive 2, Book of Shadows and jackpot games. Table and live dealer games don't count at all.",
        "group": "Bonus terms",
        "label": "Game contribution"
      },
      {
        "icon": "💰",
        "title": "VIP players get up to 7% of losses back every week",
        "body": "Weekly Cashback pays up to 7% of net losses every Monday from VIP level 1. Football Cashback and Bundesliga Cashback also pay 5% on all football bets each week.",
        "group": "Bonus terms",
        "label": "Cashback"
      },
      {
        "icon": "💸",
        "title": "Large withdrawals can be paid in instalments",
        "body": "Its help centre says there are no withdrawal restrictions, in an article last updated 18/09/2023. Its terms add that requests over a payment system's limit are paid in instalments, and some options take up to 3 days.",
        "group": "Payouts & fees",
        "label": "Withdrawal limits"
      },
      {
        "icon": "🪪",
        "title": "You generally don't need to send documents",
        "body": "Vave says documents generally aren't needed, though it may ask for ID or a selfie if issues arise.",
        "group": "Compliance",
        "label": "KYC policy"
      },
      {
        "icon": "🎱",
        "title": "Snooker player Judd Trump is its brand ambassador",
        "body": "Vave announced Judd Trump MBE as its global brand ambassador on its news blog on 9 February 2023, covering international marketing campaigns and social media giveaways.",
        "group": "Compliance",
        "label": "Partners"
      }
    ]
  },
  "wager-com": {
    "intro": "Wager.com is a crypto-only casino and sportsbook that currently runs no welcome bonus, and its withdrawal terms are tighter than most. Here are ten things worth knowing before you sign up, each checked against Wager.com's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Anjouan"
      },
      {
        "k": "Welcome bonus",
        "v": "None live"
      },
      {
        "k": "Withdrawals",
        "v": "€10,000 a month"
      },
      {
        "k": "Unwagered fee",
        "v": "8%"
      }
    ],
    "facts": [
      {
        "icon": "🏛️",
        "title": "It's licensed in Anjouan",
        "body": "Its footer shows Anjouan licence ALSI-2025 01037-FI2, as written, under the Computer Gaming Licensing Act 007 of 2005, with a seal that links to a validator.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🏢",
        "title": "Its operator is based in Anjouan",
        "body": "Wager.com is run by Scivias Ltd, registration 15923, at Hamchako, Mutsamudu, on the Autonomous Island of Anjouan.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🚫",
        "title": "There's no welcome bonus right now",
        "body": "Its live promotions panel lists only Refer a Friend and VIP Transfer. A 150% up to $3,000 deposit offer survives only on an expired page still branded with its former name.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "💸",
        "title": "Withdrawals are capped at €10,000 a month",
        "body": "The cap drops to €5,000 a month if your balance is at least 10 times your total deposits, and withdrawals over USD 50,000 can be paid in instalments capped at USD 50,000 a month.",
        "group": "Payouts & fees",
        "label": "Monthly withdrawal caps"
      },
      {
        "icon": "⛽",
        "title": "Withdrawing an unwagered deposit costs 8%",
        "body": "There's no commission if the deposit has been wagered at least once; otherwise an 8% fee applies, with a €4 minimum. The network fee comes off every withdrawal, and a chargeback carries a €50 administration fee.",
        "group": "Payouts & fees",
        "label": "Withdrawal fees"
      },
      {
        "icon": "🪙",
        "title": "It doesn't swap between crypto and fiat",
        "body": "Crypto transactions are only allowed if your first deposit was in crypto, later transactions must use that same cryptocurrency, and Wager doesn't exchange crypto for fiat or back.",
        "group": "Payouts & fees",
        "label": "Currency rule"
      },
      {
        "icon": "⚠️",
        "title": "It can exclude games from wagering without notice",
        "body": "Wager can exclude games, providers, bet types or odds ranges from wagering, rakeback and VIP progression at any time, and says wagers on excluded games don't count even if you didn't know.",
        "group": "Bonus terms",
        "label": "Bonus restrictions"
      },
      {
        "icon": "👑",
        "title": "Sports bets earn three times the VIP XP of casino play",
        "body": "You earn 1 XP per $1 on casino and live casino and 3 XP per $1 on sports, across levels from Rock at 1,000 XP to Adamantium at 10,000,000, plus invite-only Void Stone. Every new level pays a level-up bonus.",
        "group": "Bonus terms",
        "label": "Perks by level"
      },
      {
        "icon": "🪪",
        "title": "Its AML policy and help centre disagree on ID checks",
        "body": "The AML policy lists ID and proof of address among what players provide at registration, with checks again on withdrawals and at EUR 2,000 of cumulative withdrawals. The help centre describes four risk-based tiers and says not all withdrawals need verification.",
        "group": "Compliance",
        "label": "KYC policy"
      },
      {
        "icon": "🌍",
        "title": "It isn't open in the US or the UK",
        "body": "Its restricted list covers Austria, France, Germany, the Netherlands, Spain, the Union of Comoros, the United Kingdom, the USA and their territories, plus all FATF-blacklisted countries. VPNs are prohibited.",
        "group": "Compliance",
        "label": "Restricted countries"
      }
    ]
  },
  dicey: {
    "intro": "Dicey is a newer crypto casino and sportsbook built by Magic Eden, with a welcome bonus that only works on sports. Here are ten things worth knowing before you sign up, each checked against Dicey's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Anjouan"
      },
      {
        "k": "Sports welcome",
        "v": "100% to $1,000"
      },
      {
        "k": "Wagering",
        "v": "15× dep + bonus"
      },
      {
        "k": "Weekly race",
        "v": "$35,000"
      }
    ],
    "facts": [
      {
        "icon": "🏛️",
        "title": "It's licensed in Anjouan",
        "body": "Dicey holds Anjouan licence ALSI-202511054-FI2.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🤝",
        "title": "It's built by Magic Eden and names no sports sponsors",
        "body": "Dicey names no sports team, esports team, sponsorship or ambassador. Its footer credits Magic Eden, and its VIP Transfer page lists Sequoia, Greylock and Paradigm as backers. It is operated by 3-102-943011 S.R.L.",
        "group": "Compliance",
        "label": "Partners"
      },
      {
        "icon": "🎁",
        "title": "Its welcome bonus is for sports only",
        "body": "New players opt in at sign-up to a 100% match on the first qualifying deposit, from $20 up to a $1,000 bonus. It works on sports markets only, at minimum odds of 1.5.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "🔁",
        "title": "Wagering is 15× the deposit plus the bonus",
        "body": "The Sports Welcome Bonus needs 15× the deposit plus the bonus, and the deposit itself must also be wagered once. The page also calls it a multiple of the bonus, but its examples use deposit plus bonus.",
        "group": "Bonus terms",
        "label": "Wagering"
      },
      {
        "icon": "⚽",
        "title": "Each bet counts for no more than the bonus amount",
        "body": "Only settled or cashed-out sports bets at odds of 1.5 or higher count, each for no more than the bonus amount. Casino play and pushed bets count 0%, and bonus funds can't be used on casino games.",
        "group": "Bonus terms",
        "label": "Game contribution"
      },
      {
        "icon": "💰",
        "title": "Rakeback is paid on every Originals and casino bet",
        "body": "Instant rakeback runs win or lose, at a rate based on each game's house edge, so higher-edge games return more. There's a 15-minute cooldown between claims, and it keeps building while a welcome bonus is active.",
        "group": "Bonus terms",
        "label": "Rakeback"
      },
      {
        "icon": "🏁",
        "title": "A $35,000 race pays 75 players every week",
        "body": "The Weekly Wager Race pays $8,750 for first place down to $100 for places 51 to 75, credited in USDC. Every $1 wagered on Originals, slots or sports earns a point, but wagers funded by bonus credit don't count.",
        "group": "Bonus terms",
        "label": "Leaderboards"
      },
      {
        "icon": "🌧️",
        "title": "Rain drops a prize pool every 30 minutes",
        "body": "Dicey seeds each pool with $25 and the community can add from $0.50. When the timer hits zero, 10 winners are drawn from that round's joiners. You need rank Bronze I plus a minimum wager to take part.",
        "group": "Bonus terms",
        "label": "Weekly raffle"
      },
      {
        "icon": "💸",
        "title": "No withdrawal cap is stated, but wins per bet are capped",
        "body": "Dicey publishes only minimums: $1 per token, or $2.50 for USDT on Tron. Its help centre caps the win per bet instead, at $300,000 on Coinflip, Dice, Limbo, Mines and Plinko, and $100,000 to $3,000,000 on third-party games depending on the provider.",
        "group": "Payouts & fees",
        "label": "Withdrawal limits"
      },
      {
        "icon": "🔁",
        "title": "You can bring your VIP rank over from another casino",
        "body": "Players with VIP status elsewhere, Stake for example, can upload proof of status and wager to be matched to a rank. Requests are usually reviewed within 24 to 72 hours and answered on Telegram; balances and wager history don't carry over.",
        "group": "Bonus terms",
        "label": "VIP transfer"
      }
    ]
  },
  cloudbet: {
    "intro": "Cloudbet skips the wagering requirement and pays its welcome package as cash over the first 30 days. Here are ten things worth knowing before you sign up, each checked against Cloudbet's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Curaçao"
      },
      {
        "k": "Welcome",
        "v": "Up to $2,500 cash"
      },
      {
        "k": "Wagering",
        "v": "None"
      },
      {
        "k": "Unverified cap",
        "v": "$2,200 a day"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "Cloudbet is run by Halcyon Super Holdings B.V.",
        "body": "The company behind Cloudbet is Halcyon Super Holdings B.V., company number 148526.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "It holds a Curaçao Gaming Authority licence",
        "body": "Cloudbet lists licence OGL/2024/328/0599 from the Curaçao Gaming Authority.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🎁",
        "title": "The welcome package pays up to $2,500 in cash",
        "body": "Instead of a deposit match, new players get up to $2,500 in cash plus 10% rakeback from day one and daily cash drops. The package ends 30 days after your first deposit or when you hit the $2,500 cap, whichever comes first.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "✅",
        "title": "There's no wagering on the welcome package",
        "body": "The package pays cash, made up of 10% rakeback of the house edge plus daily and weekly cash drops, with no wagering requirements.",
        "group": "Bonus terms",
        "label": "Wagering rules"
      },
      {
        "icon": "💵",
        "title": "Any deposit amount activates the welcome package",
        "body": "Cloudbet sets no minimum deposit for the Welcome Package.",
        "group": "Bonus terms",
        "label": "Minimum deposit"
      },
      {
        "icon": "👑",
        "title": "Rakeback can reach 25% at the top tier",
        "body": "Base rakeback is 5% from Bronze to Ruby and 10% at Diamond and Blue Diamond. Boosted rakeback rises from 10% at Bronze through Emerald to 25% at Blue Diamond, and the VIP page frames the combined ceiling as up to 80% back on the house edge.",
        "group": "Bonus terms",
        "label": "Rakeback"
      },
      {
        "icon": "🪪",
        "title": "Unverified accounts are capped at $2,200 a day",
        "body": "Unverified and Level 1 accounts have a $2,200 daily withdrawal limit. Completing Level 2 verification removes it, so any amount can be withdrawn on any day.",
        "group": "Payouts & fees",
        "label": "Withdrawal limits"
      },
      {
        "icon": "💸",
        "title": "Its help centre and terms disagree on fees",
        "body": "The help centre says there are no fees beyond the network fee, but the terms reserve a handling charge of up to 5%.",
        "group": "Payouts & fees",
        "label": "Withdrawal fees"
      },
      {
        "icon": "📈",
        "title": "It says there are no limits on wins",
        "body": "No maximum-win figure is stated, and Cloudbet's no-limits page says there are no limits on wins. Each click still has a maximum stake, and limits depend on market liquidity.",
        "group": "Sportsbook",
        "label": "Max payout"
      },
      {
        "icon": "🥊",
        "title": "It sponsors the PFL and Karate Combat",
        "body": "Cloudbet says it sponsors the Professional Fighters League and Karate Combat, and names UFC heavyweight champion Tom Aspinall as a partner.",
        "group": "Compliance",
        "label": "Partners"
      }
    ]
  },
  toshibet: {
    "intro": "Toshibet says it will never ask for ID and unlocks its deposit bonus as you wager rather than up front. Here are ten things worth knowing before you sign up, each checked against Toshibet's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Anjouan"
      },
      {
        "k": "ID check",
        "v": "Never"
      },
      {
        "k": "Min withdrawal",
        "v": "$5"
      },
      {
        "k": "Withdrawal fee",
        "v": "None"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "It's run from St Vincent and the Grenadines",
        "body": "The company named is BowToYourSensei Ltd, at Suite 305, Griffith Corporate Centre, Kingstown, St Vincent and the Grenadines.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "Its Anjouan licence showed as valid, under a different domain",
        "body": "Licence ALSI-202601015-FI1 showed Operating status VALID on the validator linked from its site on 16 Sep 2026. The registered website is toshibet.com, while the casino runs on toshi.bet.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🌍",
        "title": "The licence doesn't cover several big markets",
        "body": "The Anjouan licence excludes Australia, Comoros, France, the Netherlands, Spain, the United Kingdom and the USA, plus FATF-blacklisted and sanctioned countries. Complaints from players there fall outside the regulator's scope.",
        "group": "Compliance",
        "label": "Licence exclusions"
      },
      {
        "icon": "🪪",
        "title": "It says it will never ask for ID",
        "body": "Its help centre says it will never KYC you, whatever the amount.",
        "group": "Compliance",
        "label": "KYC policy"
      },
      {
        "icon": "🎁",
        "title": "The bonus unlocks at $1 per $250 wagered",
        "body": "The first three deposits get 200%, 150% and 100%, but the bonus isn't paid up front. It unlocks at $1 for every $250 wagered, tracked on the rewards page. This comes from its help centre, as its live site sat behind a challenge.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "🔒",
        "title": "The deposit bonus is capped at $60,000",
        "body": "The most that can be claimed from the deposit bonus is $60,000.",
        "group": "Bonus terms",
        "label": "Max cashout"
      },
      {
        "icon": "🎟️",
        "title": "Sports bets earn three times the raffle tickets",
        "body": "The $25,000 weekly raffle gives 1 ticket per $100 wagered on casino and 3 per $100 on sports. Each week 100 tickets are drawn, with $2,500 for first.",
        "group": "Bonus terms",
        "label": "Weekly raffle"
      },
      {
        "icon": "💸",
        "title": "Withdrawals start at $5",
        "body": "The minimum withdrawal is $5.",
        "group": "Payouts & fees",
        "label": "Minimum withdrawal"
      },
      {
        "icon": "🚫",
        "title": "The UK, US and much of Europe are blocked",
        "body": "Its restricted list includes the United Kingdom, the United States, Australia, Germany, France, Spain, Italy and Ontario, among others. Using a VPN to get around this breaches its terms.",
        "group": "Compliance",
        "label": "Restricted countries"
      },
      {
        "icon": "⚖️",
        "title": "Its liability for any claim is capped at €100",
        "body": "Its user agreement caps its total liability for any claim at €100.",
        "group": "Compliance",
        "label": "Liability cap"
      }
    ]
  },
  qzino: {
    "intro": "Qzino has no deposit match and leans on cashback, rakeback and a 77-level VIP ladder instead. Here are ten things worth knowing before you sign up, each checked against Qzino's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Anjouan"
      },
      {
        "k": "Cashback",
        "v": "Up to 40%"
      },
      {
        "k": "Max win",
        "v": "$300,000"
      },
      {
        "k": "Withdrawals",
        "v": "Up to 7 days"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "Qzino is run by CG Universe in Costa Rica",
        "body": "The company named is CG Universe, Costa Rica, registration 3-102-919306.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "It holds an Anjouan licence",
        "body": "Qzino lists Anjouan licence ALSI-202503015-FI1.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🎁",
        "title": "There's no deposit match",
        "body": "Its Bonus Hub lists cashback, rakeback, weekly and monthly bonuses, a Wheel of Luck and VIP-only bonuses, with no deposit-match offer.",
        "group": "Bonus terms",
        "label": "Deposit bonus"
      },
      {
        "icon": "💰",
        "title": "Casino cashback is paid twice a week, up to 40%",
        "body": "Casino cashback rises with rank to 40% of losses, stated with no limit. Sports cashback runs separately at up to 20%, and it's forfeited if you don't claim it before the next period starts.",
        "group": "Bonus terms",
        "label": "Cashback"
      },
      {
        "icon": "⏱️",
        "title": "Rakeback can be claimed every 30 minutes",
        "body": "Rakeback accrues on betting volume and scales with rank up to 15%. Sports bets need odds of 1.20 or higher, and free bets and cashed-out bets don't count.",
        "group": "Bonus terms",
        "label": "Rakeback"
      },
      {
        "icon": "👑",
        "title": "The VIP ladder has 77 levels",
        "body": "Levels run from Level 1 at $250 wagered to Level 77 (Blue Diamond) at $2,777,777,777, and ranks never go down. VIP perks start at Level 30 and Super VIP perks at Level 57.",
        "group": "Bonus terms",
        "label": "Perks by level"
      },
      {
        "icon": "🏁",
        "title": "Sports bets earn 40 times the race points of slots",
        "body": "The $20,000 Weekly Race pays the top 200. Each $1 wagered gives 0.75 points on originals, 1 point on slots and 40 points on sports.",
        "group": "Bonus terms",
        "label": "Leaderboards"
      },
      {
        "icon": "🔒",
        "title": "Winnings are capped at $300,000",
        "body": "There's no per-transaction or daily withdrawal cap, but payable winnings from any bet, spin or bonus round can't exceed $300,000. Wins of $50,000 or more may in exceptional cases be paid in instalments over up to 30 days.",
        "group": "Payouts & fees",
        "label": "Withdrawal limits"
      },
      {
        "icon": "🐢",
        "title": "Withdrawals can take up to seven days",
        "body": "Qzino says processing can take up to seven days or longer.",
        "group": "Payouts & fees",
        "label": "Stated withdrawal time"
      },
      {
        "icon": "🔁",
        "title": "Each deposit must be wagered before withdrawing",
        "body": "Every deposit must be wagered in full before you can withdraw, unless you're at level 15 or above.",
        "group": "Payouts & fees",
        "label": "Withdrawal conditions"
      }
    ]
  },
  fortunejack: {
    "intro": "FortuneJack spreads a 500% casino welcome bonus over four missions. Here are ten things worth knowing before you sign up, each checked against FortuneJack's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Anjouan"
      },
      {
        "k": "Max bet",
        "v": "$10 on bonus"
      },
      {
        "k": "ID check",
        "v": "From $10,000"
      },
      {
        "k": "Withdrawals",
        "v": "Within 30 min"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "FortuneJack is run by PlayWave SRL in Costa Rica",
        "body": "The company named is PlayWave SRL, Costa Rica, registration 3-102-914970.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "It holds an Anjouan licence",
        "body": "FortuneJack lists Anjouan licence ALSI-202411021-FI1.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🎁",
        "title": "The casino welcome bonus is 500% over four missions",
        "body": "The four missions pay 100%, 150%, 100% and 150% + 15 Bonus Rounds, each unlocked by wagering 10x in Slots or Aviator. Sports players can instead take a 100% freebet up to 200 USD after wagering 3x in Sports.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "❓",
        "title": "The missions don't say 10x of what",
        "body": "Each welcome mission says to wager 10× in slots or Aviator without saying 10× of what. Its general bonus terms default to 30× the bonus unless an offer says otherwise.",
        "group": "Bonus terms",
        "label": "Wagering rules"
      },
      {
        "icon": "🔒",
        "title": "Bonus winnings are capped at 5x the bonus",
        "body": "Winnings from a wagering bonus are capped at 5× the original bonus, and anything above is forfeited.",
        "group": "Bonus terms",
        "label": "Max cashout"
      },
      {
        "icon": "🛑",
        "title": "Bets are capped at $10 while a bonus is active",
        "body": "The max bet is 10 USD or equivalent per bet while a bonus is pending or active.",
        "group": "Bonus terms",
        "label": "Max bet"
      },
      {
        "icon": "💰",
        "title": "Monthly cashback climbs from 2% to 15%",
        "body": "Cashback is based on the previous month's net losses and scales from 2% at Bronze 1 to 15% at Legend, with no wagering. To qualify, net losses must reach 40%-80% of deposits depending on level, and it expires if not claimed within 10 days.",
        "group": "Bonus terms",
        "label": "Cashback"
      },
      {
        "icon": "💶",
        "title": "Fiat withdrawals are capped at €2,000 each",
        "body": "Fiat withdrawals run from EUR 20 to EUR 2,000 per transaction. FortuneJack also reserves the right to pay withdrawals in instalments, decided case by case.",
        "group": "Payouts & fees",
        "label": "Withdrawal limits"
      },
      {
        "icon": "⚡",
        "title": "Crypto withdrawals usually take under 30 minutes",
        "body": "Crypto withdrawals usually arrive within 30 minutes, and its USDC page says around three minutes on average.",
        "group": "Payouts & fees",
        "label": "Stated withdrawal time"
      },
      {
        "icon": "🪪",
        "title": "ID is needed once deposits reach $10,000",
        "body": "FortuneJack asks for ID and proof of address once total deposits reach $10,000, or on suspicious activity.",
        "group": "Compliance",
        "label": "KYC policy"
      }
    ]
  },
  coincasino: {
    "intro": "CoinCasino advertises a 200% welcome bonus up to $30,000, but the terms behind it are steep. Here are ten things worth knowing before you sign up, each checked against CoinCasino's own pages or its regulator's register.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Not on register"
      },
      {
        "k": "Welcome",
        "v": "200% to $30,000"
      },
      {
        "k": "Wagering",
        "v": "60× deposit"
      },
      {
        "k": "Min deposit",
        "v": "$10"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "Its withdrawal terms name Deep Sea Tech Ventures",
        "body": "Deep Sea Tech Ventures is the company named in CoinCasino's withdrawal terms.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "It isn't on the Curaçao licence register",
        "body": "CoinCasino wasn't found on the Curaçao Gaming Authority's online gaming licence register dated 14 Sep 2026, searched under CoinCasino, Deep Sea Tech Ventures and Gaming Services Provider N.V.",
        "group": "Compliance",
        "label": "Register check"
      },
      {
        "icon": "🎁",
        "title": "The welcome bonus is 200% up to $30,000",
        "body": "It's first deposit only, with free spins on Wanted Dead or a Wild scaled by deposit size, up to 50 Super Spins at $4 for deposits of $1,000 or more.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "🔄",
        "title": "Wagering is 60x the deposit",
        "body": "A $100 deposit needs $6,000 of bets to unlock the $200 bonus, released in 10% instalments. Bonuses above $10,000 carry 75× and are credited in one go at the end of the 14 days.",
        "group": "Bonus terms",
        "label": "Wagering"
      },
      {
        "icon": "⏳",
        "title": "You get 14 days to finish the wagering",
        "body": "The first deposit must be made within 7 days of registering, then there are 14 days to finish the wagering, and any unreleased bonus is forfeited. Its terms also say this period is included in the 7 days.",
        "group": "Bonus terms",
        "label": "Expiry"
      },
      {
        "icon": "🎰",
        "title": "Bonus bets are capped at $20 a round",
        "body": "Bonus funds carry a $/€20 max bet per round, no feature buys, and can't be used on live casino or table games. Slots count 100%, while dice, arcade and crash count 0%.",
        "group": "Bonus terms",
        "label": "Bonus play rules"
      },
      {
        "icon": "💸",
        "title": "Withdrawing unwagered deposits costs 8%",
        "body": "There's no fee if the deposit has been wagered at least 1×. Otherwise an 8% fee applies, with a minimum of €4.",
        "group": "Payouts & fees",
        "label": "Withdrawal fees"
      },
      {
        "icon": "🏦",
        "title": "Crypto withdrawals are capped at €150,000 a month",
        "body": "That's the default for crypto, with higher limits for VIPs at its discretion. Fiat is limited to €4,000 a day, €10,000 a week and €20,000 a month.",
        "group": "Payouts & fees",
        "label": "Withdrawal limits"
      },
      {
        "icon": "😴",
        "title": "Inactive accounts can be charged 10% a month",
        "body": "After 180 days with no bets, a fee of 10% of the balance per month may be deducted until it falls to €10, after 30 days' notice.",
        "group": "Payouts & fees",
        "label": "Inactive accounts"
      },
      {
        "icon": "🚫",
        "title": "The US and UK are restricted",
        "body": "The restricted list includes the USA and its territories, the United Kingdom, Bulgaria, Malta, Lithuania, Curaçao, Aruba, Sint Maarten and French overseas territories, among others.",
        "group": "Compliance",
        "label": "Restricted countries"
      }
    ]
  },
  bluff: {
    "intro": "Bluff is built around prediction markets, with a casino and sportsbook on the same balance. Here are nine things worth knowing before you sign up, each checked against Bluff's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Anjouan"
      },
      {
        "k": "Min withdrawal",
        "v": "$20"
      },
      {
        "k": "Max withdrawal",
        "v": "$250,000/month"
      },
      {
        "k": "ID check",
        "v": "Usually not"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "Bluff is run by Wink Wink Ltd",
        "body": "The company named is Wink Wink Ltd, registered in Anjouan under number 16036.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "It holds an Anjouan licence",
        "body": "Bluff lists Anjouan licence ALSI-202506028-FI1.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🔮",
        "title": "Its main product is prediction markets",
        "body": "Players trade on real-world outcomes such as elections, finals, award shows and launches. Predictions share one account and balance with Bluff's Packs, Battles and UpDowns games.",
        "group": "Sportsbook",
        "label": "Prediction markets"
      },
      {
        "icon": "🎁",
        "title": "Its promotions page shows no welcome offer",
        "body": "The live promotions page lists five items and no first-deposit offer. Two help articles from August 2026 still describe a first-deposit match, and they disagree with each other on the size.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "🎲",
        "title": "Originals and live casino count 10% toward wagering",
        "body": "Slots count 100%, while originals, game shows, live casino, table games and instant-win games such as Crash, Mines and Plinko count 10%. The sportsbook is excluded.",
        "group": "Bonus terms",
        "label": "Game contribution"
      },
      {
        "icon": "🤝",
        "title": "It will match your VIP tier from another casino",
        "body": "Send screenshots of your tier and lifetime wager history through live chat and, if approved, you're placed in a provisional tier with a VIP host. The match is reviewed after a 30-day introductory period, and Bluff says it responds within 48 hours.",
        "group": "Bonus terms",
        "label": "VIP transfer"
      },
      {
        "icon": "🏦",
        "title": "Withdrawals are capped at $250,000 a month",
        "body": "The minimum is USD 20 per transaction and the maximum USD 250,000 per month. A withdrawal can only be requested once the deposit has been wagered at least once.",
        "group": "Payouts & fees",
        "label": "Withdrawal limits"
      },
      {
        "icon": "💸",
        "title": "It publishes no fixed withdrawal fee",
        "body": "Fees may apply, and the withdrawal form shows the fee in your coin before you confirm, but Bluff publishes no fixed fee or percentage.",
        "group": "Payouts & fees",
        "label": "Withdrawal fees"
      },
      {
        "icon": "🪪",
        "title": "ID is usually only needed if you take a bonus",
        "body": "KYC is usually not needed to withdraw, but it's required if you opt into a bonus.",
        "group": "Compliance",
        "label": "KYC policy"
      }
    ]
  },
  betplay: {
    "intro": "Betplay states no gaming licence on its site and doesn't ask players to verify their ID. Here are ten things worth knowing before you sign up, each checked against Betplay's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "None stated"
      },
      {
        "k": "Wagering",
        "v": "60× deposit"
      },
      {
        "k": "Daily limit",
        "v": "$8,000"
      },
      {
        "k": "Cashback",
        "v": "10% weekly"
      }
    ],
    "facts": [
      {
        "icon": "🏛️",
        "title": "No gaming licence is stated on its site",
        "body": "Betplay's site states no gaming licence, and its terms are governed by Costa Rican law.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🏢",
        "title": "It's run by LAMA TECH, LIMITADA in Costa Rica",
        "body": "The company named is LAMA TECH, LIMITADA, Costa Rica, corporate ID 3-102-857685.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🪪",
        "title": "Its terms set no ID requirement",
        "body": "Betplay's terms have no verification requirement, and the personal data it lists collecting is your email address and usage data.",
        "group": "Compliance",
        "label": "KYC policy"
      },
      {
        "icon": "🎁",
        "title": "The welcome bonus is 250% up to 5,000 USDT",
        "body": "It's spread over the first 3 deposits: 100% up to 1,000 USDT, 50% up to 2,000 USDT, then 100% up to 2,000 USDT.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "🔄",
        "title": "Wagering is 60x the deposit, and the bonus comes after",
        "body": "You wager 60× the total deposit amount. The bonus is only paid once that's done, and can then be withdrawn straight away.",
        "group": "Bonus terms",
        "label": "Wagering"
      },
      {
        "icon": "💰",
        "title": "Weekly cashback is 10% from the first VIP level",
        "body": "Cashback on losses is paid automatically every Thursday from VIP Bronze I, up to $20,000 a week. Sportsbook and live dealer bets are excluded.",
        "group": "Bonus terms",
        "label": "Cashback"
      },
      {
        "icon": "🏦",
        "title": "Withdrawals are capped at $8,000 a day",
        "body": "You can withdraw up to $8,000 of crypto every 24 hours, plus whatever you deposited the same day. Higher VIP levels can raise the limit.",
        "group": "Payouts & fees",
        "label": "Withdrawal limits"
      },
      {
        "icon": "⚡",
        "title": "Betplay charges no withdrawal fee",
        "body": "You only pay the blockchain network fee, and Betplay suggests Lightning or Liquid to avoid Bitcoin fees.",
        "group": "Payouts & fees",
        "label": "Withdrawal fees"
      },
      {
        "icon": "😴",
        "title": "Balances are deducted after 6 months of inactivity",
        "body": "After 6 months with no activity the balance is deducted, with 14 days' email notice first and 10 days to appeal.",
        "group": "Payouts & fees",
        "label": "Inactive accounts"
      },
      {
        "icon": "🚫",
        "title": "The US, UK and Spain are restricted",
        "body": "Its restricted list also includes Austria, Hungary, Japan, Poland, Turkey, Slovakia, Curaçao and several overseas territories.",
        "group": "Compliance",
        "label": "Restricted countries"
      }
    ]
  },
  solcasino: {
    "intro": "Solcasino spreads a four-part deposit bonus over a token that unlocks slowly as you wager. Here are ten things worth knowing before you sign up, each checked against Solcasino's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Tobique"
      },
      {
        "k": "Rakeback",
        "v": "5% of edge"
      },
      {
        "k": "Min deposit",
        "v": "$10"
      },
      {
        "k": "Withdrawals",
        "v": "Within 1 hour"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "It's run by Three Gaming Limitada in Costa Rica",
        "body": "The company named is Three Gaming Limitada, Costa Rica, registration 3-102-910242.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "It's licensed by the Tobique Gaming Commission",
        "body": "Solcasino names the Tobique Gaming Commission as its licensing body, but doesn't state a licence number.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🎁",
        "title": "Four deposit bonuses run from 180% to 360%",
        "body": "The 1st deposit gets 180% up to 20,000.00 USDB and the 4th gets 360% up to 100,000.00 USDB, paid in USDB, a reward denominated in USDT. Withdrawing before it unlocks cancels the bonus.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "🐢",
        "title": "The bonus unlocks at 1 USDB per $1,000 wagered",
        "body": "Each wager unlocks 0.1% of its amount. At least 5 USDB must be unlocked before you can claim, and withdrawing at any time cancels the rest of the bonus.",
        "group": "Bonus terms",
        "label": "Wagering rules"
      },
      {
        "icon": "💵",
        "title": "Each bonus has its own minimum deposit",
        "body": "You need $10 for the 1st deposit bonus, $50 for the 2nd, $100 for the 3rd and $200 for the 4th.",
        "group": "Bonus terms",
        "label": "Minimum deposit"
      },
      {
        "icon": "⏱️",
        "title": "Rakeback is 5% and only half is paid at once",
        "body": "A 5% rakeback based on the house edge applies to all bets and can be collected every 30 minutes. Half is added instantly and the other half is split over three days on the Rewards Calendar.",
        "group": "Bonus terms",
        "label": "Rakeback"
      },
      {
        "icon": "🏁",
        "title": "A $25,000 weekly race pays the top 100",
        "body": "All casino and sports bets count, and prizes are credited in USDC when the race ends, with $6,250 for 1st down to $25 for 91st-100th.",
        "group": "Bonus terms",
        "label": "Leaderboards"
      },
      {
        "icon": "🔁",
        "title": "You must wager $10 before your first withdrawal",
        "body": "New accounts must deposit and wager at least $10 before withdrawals are enabled, and poker and trading don't count. Core tokens have a default limit of $10,000 a day.",
        "group": "Payouts & fees",
        "label": "Withdrawal conditions"
      },
      {
        "icon": "⚡",
        "title": "It aims to pay out within an hour",
        "body": "Solcasino aims to pay out within 1 hour, and its terms also cite a 10-minute average.",
        "group": "Payouts & fees",
        "label": "Stated withdrawal time"
      },
      {
        "icon": "🪪",
        "title": "Users agree to KYC checks through Sumsub",
        "body": "Signing up means agreeing to KYC checks via Sumsub, and a selfie with ID may be required.",
        "group": "Compliance",
        "label": "KYC policy"
      }
    ]
  },
  gamba: {
    "intro": "Gamba skips ID checks for play and pays rakeback that rises to 10% with VIP rank. Here are ten things worth knowing before you sign up, each checked against Gamba's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Anjouan"
      },
      {
        "k": "KYC",
        "v": "Not to play"
      },
      {
        "k": "Max withdrawal",
        "v": "No cap"
      },
      {
        "k": "Rakeback",
        "v": "Up to 10%"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "Gamba is run by Gamba Gaming N.V.",
        "body": "The operator is named as Gamba Gaming N.V., registration 162205.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "It's licensed in Anjouan",
        "body": "Gamba lists an Anjouan licence, number ALSI-152512013-F13.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🪪",
        "title": "You don't need KYC to play",
        "body": "Gamba doesn't require identity verification to play. It offers four optional verification levels instead.",
        "group": "Compliance",
        "label": "KYC policy"
      },
      {
        "icon": "💸",
        "title": "There's no maximum or daily withdrawal limit",
        "body": "The only floor is a minimum of 1.5x the current network transaction fee, which updates every 10 seconds with network conditions. That fee is deducted from the amount you withdraw.",
        "group": "Payouts & fees",
        "label": "Withdrawal limits"
      },
      {
        "icon": "⚡",
        "title": "Over 90% of withdrawals are processed instantly",
        "body": "The rest go through a manual review, which Gamba says averages under 3 minutes.",
        "group": "Payouts & fees",
        "label": "Stated withdrawal time"
      },
      {
        "icon": "💰",
        "title": "Rakeback rises to 10% and never expires",
        "body": "It pays back a portion of every bet, win or lose, worked out on your total wager against each game's house edge (typically around 3%). You can claim it at will with a 2-minute cooldown, and it's paid in the currency you bet in.",
        "group": "Bonus terms",
        "label": "Rakeback"
      },
      {
        "icon": "🔁",
        "title": "Bonus rollover counts your deposit as well as the bonus",
        "body": "Each deposit bonus sets its own multiplier, shown under View Details, and the rollover applies to the deposit plus the bonus. Gamba's own worked example uses 20×.",
        "group": "Bonus terms",
        "label": "Wagering rules"
      },
      {
        "icon": "🎟️",
        "title": "A weekly lottery starts with a $10,000 jackpot",
        "body": "It's drawn every Saturday at 15:00 UTC and the jackpot rolls over if nobody wins. You get 1 free ticket per $100 wagered, and extra tickets cost $0.10.",
        "group": "Bonus terms",
        "label": "Weekly raffle"
      },
      {
        "icon": "👑",
        "title": "Rank-up bonuses run from $7.50 to $220,000",
        "body": "Each rank pays a fixed bonus in USDT, from $7.50 at Bronze 1 to $220,000 at Immortal 3. Incremental Mode splits each one into four claims at 25% progress steps.",
        "group": "Bonus terms",
        "label": "Perks by level"
      },
      {
        "icon": "🛟",
        "title": "VIP lossback of 10-20% is arranged through a host",
        "body": "Players with $1,000+ in losses can ask live support for custom lossback. Hosts are hand-picked on wager volume, profit and loss, deposits and activity rather than assigned automatically.",
        "group": "Bonus terms",
        "label": "Cashback"
      }
    ]
  },
  flush: {
    "intro": "Flush advertises fast, fee-free withdrawals, but its terms set daily, weekly and monthly caps. Here are ten things worth knowing before you sign up, each checked against Flush's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Anjouan"
      },
      {
        "k": "Welcome bonus",
        "v": "275% to $3,000"
      },
      {
        "k": "Daily withdrawal",
        "v": "$2,500 cap"
      },
      {
        "k": "Weekly race",
        "v": "$10,000"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "Flush is run by Fordegens Limitada in Costa Rica",
        "body": "The operator is named as Fordegens Limitada, registration 3102928865, in Costa Rica.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "It's licensed in Anjouan",
        "body": "Flush lists an Anjouan licence, number ALSI-202509008-FI1.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🚧",
        "title": "Its terms cap withdrawals at $2,500 a day",
        "body": "Clause 9.6 of the Terms of Service sets rolling caps of $2,500 a day, $5,000 a week and $10,000 a month, unless you have a special agreement or a VIP level that allows more. Its transparency page says there are no daily caps.",
        "group": "Payouts & fees",
        "label": "Withdrawal limits"
      },
      {
        "icon": "🔢",
        "title": "Its terms and FAQ give different minimum withdrawals",
        "body": "The terms say $10 per transaction. The FAQ says $1 for most coins, $10 for ETH and $30 for BTC.",
        "group": "Payouts & fees",
        "label": "Minimum withdrawal"
      },
      {
        "icon": "🎁",
        "title": "The welcome bonus is 275% up to $3,000 over three deposits",
        "body": "A first deposit of $10-$200 gets 100% up to $200 at 30x wagering, or $200-$1,000 gets 150% up to $1,500 at 35x. The second deposit gets 75% up to $750 and the third 50% up to $750, and you must click Accept on the deposit page before each one or the bonus doesn't apply.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "🎯",
        "title": "Only bets of $5 or less count toward wagering",
        "body": "Repeated bigger bets while a bonus is active can void it.",
        "group": "Bonus terms",
        "label": "Max bet"
      },
      {
        "icon": "🎲",
        "title": "Flush originals count just 5% toward wagering",
        "body": "Slots count 100%, live casino and table games 10%, and Flush originals such as Crash, Dice and Plinko 5%. Some games are restricted.",
        "group": "Bonus terms",
        "label": "Game contribution"
      },
      {
        "icon": "💰",
        "title": "Rakeback is released as cash every 30 minutes",
        "body": "It builds up in 30-minute windows and is released automatically once a window reaches $5, with anything less carried forward. It has no wagering requirement, rises with each VIP tier and is earned on every game, including sportsbook bets.",
        "group": "Bonus terms",
        "label": "Rakeback"
      },
      {
        "icon": "🏁",
        "title": "A $10,000 weekly race pays the top 15",
        "body": "First place takes $2,000 and fifteenth $100, and bets need a minimum of $0.20 to count. Half of a prize is credited when you claim it and the other half over 14 consecutive days.",
        "group": "Bonus terms",
        "label": "Leaderboards"
      },
      {
        "icon": "🪪",
        "title": "Lifetime deposits of $10,000 trigger full KYC",
        "body": "Its AML and KYC policies set a $10,000 cumulative lifetime deposit threshold for compulsory full KYC. No maximum deposit is stated, and Flush takes crypto only, with no fiat deposits.",
        "group": "Coins & deposit limits",
        "label": "Deposit limits"
      }
    ]
  },
  "bitcasino-io": {
    "intro": "Bitcasino.io is licensed in Curaçao and takes fiat alongside crypto, but its bonus pages don't agree with each other. Here are ten things worth knowing before you sign up, each checked against Bitcasino's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Curaçao"
      },
      {
        "k": "Welcome",
        "v": "Up to 5,000 USDT"
      },
      {
        "k": "Wagering",
        "v": "30×"
      },
      {
        "k": "Rakeback cap",
        "v": "2,000 USDT/week"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "Bitcasino is run by Moon Technologies B.V. in Curaçao",
        "body": "The operator is named as Moon Technologies B.V., at Schout Bij Nacht Doormanweg 40 in Curaçao.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "It holds a Curaçao licence first issued by the GCB",
        "body": "Its licence, OGL/2023/111/0069, was issued by the GCB and extended by the CGA.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🎁",
        "title": "Its welcome bonus and its reward terms contradict each other",
        "body": "The welcome offer promises up to 5,000 USDT over three deposits: 100% up to 1,500 USDT, then 50% up to 2,000 USDT, then 100% up to 1,500 USDT, with a 50 USDT minimum deposit and 30x wagering. Bitcasino's own Reward Terms & Conditions page says it offers no deposit or welcome rewards.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "⏳",
        "title": "Withdrawing early removes the reward and its winnings",
        "body": "With a deposit reward, the deposit can't be withdrawn until wagering is met. Rewards must be used within 72 hours unless their terms say otherwise, and there's one per person, household, IP address or shared device.",
        "group": "Bonus terms",
        "label": "Bonus play rules"
      },
      {
        "icon": "💰",
        "title": "Weekly rakeback is capped at 2,000 USDT",
        "body": "Selected slots pay 3% for 1,000-49,999 wagered in a week and 5% for 50,000 or more, worked out as wager x house edge x rate. It's credited in USDT every Monday by 15:00 GMT.",
        "group": "Bonus terms",
        "label": "Rakeback"
      },
      {
        "icon": "👑",
        "title": "Loyalty milestone rewards carry no wagering",
        "body": "Real-money bets earn 5 loyalty points per 1 USDT across seven levels, and the points multiplier climbs from 1x up to Expert to 3x at Hero. Milestone rewards are free spins, free chips or cashback, paid as real money.",
        "group": "Bonus terms",
        "label": "Perks by level"
      },
      {
        "icon": "🏦",
        "title": "Very large withdrawals can be paid at 1 million USDT a week",
        "body": "Your email must be verified and a deposit needs 3 blockchain confirmations before it can be withdrawn. Bitcasino may require the deposit to be wagered once, or 5× if it suspects the account is used as a mixer.",
        "group": "Payouts & fees",
        "label": "Withdrawal rules"
      },
      {
        "icon": "💤",
        "title": "Dormant accounts can be charged 5% a month",
        "body": "After 3 months without using a positive balance you get a notice, and the balance can be removed a month later, though its safety team can recover it. After 12 months inactive, a 5% monthly administration fee can be deducted.",
        "group": "Payouts & fees",
        "label": "Inactive accounts"
      },
      {
        "icon": "🪪",
        "title": "Withdrawals over €2,500 may need extra KYC",
        "body": "Bitcasino says additional KYC may apply to withdrawals over €2,500, or to smaller ones.",
        "group": "Compliance",
        "label": "KYC policy"
      },
      {
        "icon": "🌍",
        "title": "Playing from Japan is prohibited",
        "body": "Players in its restricted jurisdictions can't register, and Japan is named specifically. The full list is in its help centre.",
        "group": "Compliance",
        "label": "Restricted countries"
      }
    ]
  },
  metawin: {
    "intro": "MetaWin has no welcome bonus and puts prize draws at the centre of its rewards. Here are ten things worth knowing before you sign up, each checked against MetaWin's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Anjouan"
      },
      {
        "k": "Welcome bonus",
        "v": "None"
      },
      {
        "k": "Withdrawal fee",
        "v": "$2.50"
      },
      {
        "k": "Sports cap",
        "v": "$100,000 a day"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "MetaWin is run by Rivolo Limited in Nevis",
        "body": "The operator is named as Rivolo Limited, Nevis, company number C62588.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "It's licensed in Anjouan",
        "body": "MetaWin lists an Anjouan licence, number ALSI-202602025-FI1.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🪪",
        "title": "It asks for photo ID and a selfie",
        "body": "MetaWin identifies players at onboarding and on an ongoing basis, using photo ID and a selfie.",
        "group": "Compliance",
        "label": "KYC policy"
      },
      {
        "icon": "🎁",
        "title": "There's no welcome bonus, only Prize Funds",
        "body": "30% of every deposit is credited as Prize Funds, which can only be used on prize draw entries when your real balance can't cover them. Any left reset to $0 when you withdraw, and the promotion page shows an end date of 1 January 2027.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "🚧",
        "title": "Your 24-hour withdrawal limit depends on your tier",
        "body": "One FAQ answer lists $10,000 for Unranked up to $500,000 for Red Room, while another gives different figures, and the terms cap swaps out at 5 ETH per 24 hours. The minimum withdrawal is $20 and every withdrawal carries a $2.50 fee.",
        "group": "Payouts & fees",
        "label": "Withdrawal limits"
      },
      {
        "icon": "🔁",
        "title": "Every deposit must be wagered once before withdrawal",
        "body": "There's no maximum deposit, and minimums depend on the coin, such as 0.0001 BTC or 0.002 ETH. Deposits below the minimum are not credited and cannot be recovered.",
        "group": "Coins & deposit limits",
        "label": "Deposit limits"
      },
      {
        "icon": "⏱️",
        "title": "Instant WinBack must be claimed within 30 minutes",
        "body": "The Instant Bonus pays a share of the house edge on your last 30 minutes of wagering and is recalculated every 30 minutes. Zero House Edge games earn nothing, and games over 98% RTP count at 25%.",
        "group": "Bonus terms",
        "label": "Rakeback"
      },
      {
        "icon": "🎟️",
        "title": "A monthly $250,000 prize draw has a $100,000 top prize",
        "body": "You get 1 free entry per $100 wagered on casino, up to 15,000, and 3 per 24 hours for depositing $20+. At least one deposit in the month is required, and prizes are paid in USDT with 1x wagering.",
        "group": "Bonus terms",
        "label": "Prize draws"
      },
      {
        "icon": "⚽",
        "title": "Sports winnings are capped at $100,000 a day",
        "body": "The cap applies per customer per calendar day, across all sports, markets and bet types. Separately, the maximum win on any single wager is $1,500,000.",
        "group": "Sportsbook",
        "label": "Max payout"
      },
      {
        "icon": "👑",
        "title": "Its own pages disagree on wagering for rank-up rewards",
        "body": "The help centre says Rank Up Rewards carry 1x wagering, while MetaWin Hub guides say 0x. Tiers run from Unranked to Platinum, then the invite-only Red Room, and ranks never decay.",
        "group": "Bonus terms",
        "label": "VIP levels"
      }
    ]
  },
  cybet: {
    "intro": "Cybet pairs a 20% rakeback deal for Pioneer Tier players with a VIP status match from other casinos. Here are eight things worth knowing before you sign up, each checked against Cybet's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Anjouan"
      },
      {
        "k": "Rakeback",
        "v": "20% at Pioneer"
      },
      {
        "k": "Max single win",
        "v": "$100,000"
      },
      {
        "k": "VIP match",
        "v": "Up to Plat 43"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "Cybet is run by Eskimo Adventures Ltd in Belize",
        "body": "The operator is named as Eskimo Adventures Ltd, Belize registration 000043034.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "It's licensed in Anjouan",
        "body": "Cybet lists an Anjouan licence, number ALSI-202409034-FI2.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🪪",
        "title": "Full KYC only when it's needed",
        "body": "Cybet's KYC is risk-based, with full verification only when needed for security or compliance.",
        "group": "Compliance",
        "label": "KYC policy"
      },
      {
        "icon": "🎰",
        "title": "Live casino and sports can't be played with bonus coins",
        "body": "Slots count 25% to 100% depending on RTP, with higher-RTP slots counting less, and Originals 10%. Live casino, game shows and sports don't count at all.",
        "group": "Bonus terms",
        "label": "Game contribution"
      },
      {
        "icon": "📅",
        "title": "The welcome promotion was dated to end on 1 October 2026",
        "body": "The promotion was listed as running from 1 June to 1 October 2026. Once activated, a bonus has 14 days before it's cancelled automatically.",
        "group": "Bonus terms",
        "label": "Expiry"
      },
      {
        "icon": "💰",
        "title": "20% rakeback needs the Pioneer Tier",
        "body": "It's based on an implied 1% house edge, so Cybet's own example returns $2 on $1,000 wagered. Rakeback is credited automatically once it reaches $1 and covers casino wagers only.",
        "group": "Bonus terms",
        "label": "Rakeback"
      },
      {
        "icon": "🚧",
        "title": "Its KYC page caps a single winning at $100,000",
        "body": "That cap is per transaction, while the fast-payout page says there is no upper cap. The bonus withdrawal cap also differs between pages: 5x the initial deposit in the bonus FAQ, 10x deposit plus bonus in the guidebook.",
        "group": "Payouts & fees",
        "label": "Withdrawal limits"
      },
      {
        "icon": "🔀",
        "title": "VIPs from other casinos can get a status match up to Plat 43",
        "body": "You apply through its Telegram bot with proof of your level, and reviews take 24 to 72 hours. Approved players then pick a 30-day VIP Mission worth up to $7,000 in total.",
        "group": "Bonus terms",
        "label": "VIP transfer"
      }
    ]
  },
  spartans: {
    "intro": "Spartans builds its rewards around CashRake, a rakeback and cashback scheme that pays more on lower-RTP games. Here are ten things worth knowing before you sign up, each checked against Spartans' own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Anjouan"
      },
      {
        "k": "CashRake",
        "v": "Up to 33%"
      },
      {
        "k": "Daily withdrawal",
        "v": "6,000 BRL cap"
      },
      {
        "k": "KYC",
        "v": "Before withdrawal"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "Spartans is run by Nexus International Entertainment Ltd in Belize",
        "body": "The operator is named as Nexus International Entertainment Ltd, Belize registration 000043488.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "It's licensed in Anjouan",
        "body": "Spartans lists an Anjouan licence, number ALSI-202409038-FI2.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🪪",
        "title": "You must verify your ID before your first withdrawal",
        "body": "Spartans requires ID verification before the first withdrawal.",
        "group": "Compliance",
        "label": "KYC policy"
      },
      {
        "icon": "🎁",
        "title": "CashRake is \"up to 33%\", not a flat 33%",
        "body": "The 33% is a limit sized by your deposits: a $100 deposit gives a $33 CashRake limit and a further $100 raises it to $66. Accrued CashRake must be claimed within 24 hours of your last claim or it resets to zero.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "📉",
        "title": "The lower a game's RTP, the higher the rakeback",
        "body": "Spartans publishes its rate card by RTP: a 94.00% RTP game pays 33% rakeback, falling to 5% at 99.50%. The sportsbook is benchmarked at an RTP of 98.",
        "group": "Bonus terms",
        "label": "Rakeback"
      },
      {
        "icon": "🚧",
        "title": "Daily withdrawals are capped at 6,000 BRL",
        "body": "The cap is in BRL even though the same document lists Brazil as a restricted country. Deposits must be wagered at least 1.3x, and transactions of $10,000 or more trigger enhanced due diligence.",
        "group": "Payouts & fees",
        "label": "Withdrawal limits"
      },
      {
        "icon": "🇧🇷",
        "title": "Its only deposit bonus is a 200% Pix offer in BRL",
        "body": "The 200% first-deposit bonus is for Pix deposits, with a maximum bonus of BRL 10,000 and 60x bonus wagering. Only slot games count toward it, and there's no sports welcome offer.",
        "group": "Sports bonus terms",
        "label": "Offer"
      },
      {
        "icon": "👑",
        "title": "Four VIP levels can be bought with a deposit",
        "body": "The first level of Bronze, Silver, Gold and Platinum can be bought with a single deposit at up to $5K, $25K, $150K and $1M, with the price falling as you wager. Elite is earned only.",
        "group": "Bonus terms",
        "label": "Perks by level"
      },
      {
        "icon": "🤝",
        "title": "Conor Benn and Era Istrefi are its headline partners",
        "body": "Official partnership pages cover boxer Conor Benn, UFC lightweight Arman Tsarukyan and brand ambassador Era Istrefi. No sports team partnership is live, and its roadmap lists one as planned.",
        "group": "Compliance",
        "label": "Partners"
      },
      {
        "icon": "🏁",
        "title": "Its leaderboard page says \"Coming soon\"",
        "body": "The leaderboard page shows an empty table with no prizes, while the promotions page advertises an Era Istrefi monthly leaderboard as live. No prize pool, schedule or standings are published anywhere.",
        "group": "Bonus terms",
        "label": "Leaderboards"
      }
    ]
  },
  housebets: {
    "intro": "Housebets lets you choose how your rewards split between rakeback and lossback, and ranks its leaderboards by XP rather than wager. Here are ten things worth knowing before you sign up, each checked against Housebets' own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Curaçao"
      },
      {
        "k": "Deposit playthrough",
        "v": "1×"
      },
      {
        "k": "Rakeback",
        "v": "Casino only"
      },
      {
        "k": "VIP levels",
        "v": "43"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "Housebets is run by Bridge Technologies B.V.",
        "body": "The operator is named as Bridge Technologies B.V., registration 160264(0).",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "It holds a Curaçao Gaming Control Board licence",
        "body": "Housebets lists licence OGL/2024/431/0231 from the Curaçao Gaming Control Board.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🔁",
        "title": "Every deposit must be wagered once before withdrawal",
        "body": "There's no single minimum or maximum withdrawal: limits and fees are set per coin, network and method and shown in the wallet. Withdrawals need completed verification, are normally automatic within minutes, and some need manual approval.",
        "group": "Payouts & fees",
        "label": "Withdrawal limits"
      },
      {
        "icon": "🎚️",
        "title": "A slider splits your rewards between rakeback and lossback",
        "body": "Rakeback is a share of every wager, while lossback only pays if you finish the period down. Weekly and monthly are set separately, changes apply from the next cycle, and the default is 50% each.",
        "group": "Bonus terms",
        "label": "Cashback"
      },
      {
        "icon": "💰",
        "title": "Sports bets earn no rakeback",
        "body": "Instant rakeback accrues on real-money casino bets from Bronze 1, and daily rakeback is generated at 15:00 UTC the next day. Claims carry 0x wagering, but Housebets doesn't publish the payout rates.",
        "group": "Bonus terms",
        "label": "Rakeback"
      },
      {
        "icon": "📆",
        "title": "The weekly reload starts at Silver 1",
        "body": "It's generated every Thursday at 15:00 UTC from Silver 1 (10,000 XP), and the monthly bonus from Gold 1 (100,000 XP). Sports play doesn't count toward either.",
        "group": "Bonus terms",
        "label": "Reload bonuses"
      },
      {
        "icon": "👑",
        "title": "There are 43 levels, up to 500 million XP",
        "body": "Levels run from Bronze at 200 XP to Castle 3, and $1 wagered at a 1% house edge earns 1 XP. A dedicated VIP host is available from Platinum 3 (1 million XP), and level-up bonuses reach $60,000 each across Palladium and Castle.",
        "group": "Bonus terms",
        "label": "Perks by level"
      },
      {
        "icon": "🏁",
        "title": "Leaderboards rank XP, not amount wagered",
        "body": "Weekly and monthly boards rank players by XP earned in the period, weighted by each game's house edge. Casino and sports bets both count.",
        "group": "Bonus terms",
        "label": "Leaderboards"
      },
      {
        "icon": "⏳",
        "title": "Unclaimed bonuses can be cancelled after 60 days",
        "body": "Bonuses may be cancelled after their claim period or 60 days, whichever is shorter.",
        "group": "Bonus terms",
        "label": "Expiry"
      },
      {
        "icon": "🔀",
        "title": "A VIP transfer needs a $1,000 deposit",
        "body": "To move VIP status over from another casino, you need a single real-money deposit of at least $1,000 made in the last 30 days.",
        "group": "Bonus terms",
        "label": "VIP levels"
      }
    ]
  },
  dustbit: {
    "intro": "Dustbit skips ID checks for play and withdrawals and pays rakeback from 21% at its first VIP tier. Here are ten things worth knowing before you sign up, each checked against Dustbit's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Anjouan"
      },
      {
        "k": "KYC",
        "v": "Not required"
      },
      {
        "k": "Rakeback",
        "v": "21% to 50%"
      },
      {
        "k": "Withdrawals",
        "v": "5–10 minutes"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "Dustbit is run by Oxilium Limited in Belize",
        "body": "The operator is named as Oxilium Limited, Belize registration 000047923.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "It's licensed in Anjouan",
        "body": "Dustbit lists an Anjouan licence, number ALSI-202509012-FI1.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🪪",
        "title": "No KYC is required to play or withdraw",
        "body": "Dustbit doesn't require verification as standard, though it may ask for ID or proof of source of funds.",
        "group": "Compliance",
        "label": "KYC policy"
      },
      {
        "icon": "⚡",
        "title": "Crypto withdrawals usually take 5–10 minutes",
        "body": "Some withdrawals are briefly reviewed, and Dustbit says most of those still finish within minutes.",
        "group": "Payouts & fees",
        "label": "Stated withdrawal time"
      },
      {
        "icon": "💸",
        "title": "No maximum withdrawal is published",
        "body": "There's no stated per-day or per-month payout cap either. Its terms say only that limits appear on the website, that withdrawals go back to the deposit method where possible, and that extra verification may be applied.",
        "group": "Payouts & fees",
        "label": "Withdrawal limits"
      },
      {
        "icon": "👑",
        "title": "Rakeback runs from 21% to 50% by VIP tier",
        "body": "NewComer pays 21% from $1,000 wagered, rising through seven tiers to 50% for Immortal Whale at $1 billion. XP is earned at 100 per $1 on casino and 50 per $1 on sports.",
        "group": "Bonus terms",
        "label": "Perks by level"
      },
      {
        "icon": "🔁",
        "title": "Its help centre gives wagering only as an example",
        "body": "Bonus funds move to your main balance once wagering is complete, but the help centre only uses 10× the bonus as an example. Eligible games are shown under My Profile › Promotions.",
        "group": "Bonus terms",
        "label": "Wagering rules"
      },
      {
        "icon": "⚽",
        "title": "Football bets pay out when your team goes two goals ahead",
        "body": "Pre-match 1X2 bets on listed competitions, including the Premier League and Champions League, are settled as won at a two-goal lead even if your team later loses. There's no opt-in, and cash-outs and in-play bets don't qualify.",
        "group": "Bonus terms",
        "label": "Early payout"
      },
      {
        "icon": "🔀",
        "title": "VIP status from another casino can be transferred",
        "body": "You send support a screenshot of your VIP level and stats, the wallet address you used there, and the betslip link for a $0.01 bet on an Originals game to prove ownership. Dustbit then grants an equivalent or adjusted status.",
        "group": "Bonus terms",
        "label": "VIP transfer"
      },
      {
        "icon": "💳",
        "title": "It takes cards and e-wallets as well as crypto",
        "body": "Fiat deposits go through card, Apple Pay, Revolut Pay, Google Pay, Skrill and Neteller. No maximum deposit is published, and you can set your own daily, monthly or yearly deposit and loss limits.",
        "group": "Coins & deposit limits",
        "label": "Deposit limits"
      }
    ]
  },
  "whale-io": {
    "intro": "Whale.io pays daily cashback that climbs with every level and promotes 90-second withdrawals. Here are ten things worth knowing before you sign up, each checked against Whale.io's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Anjouan"
      },
      {
        "k": "Min deposit",
        "v": "$1"
      },
      {
        "k": "Daily cashback",
        "v": "Up to 25%"
      },
      {
        "k": "Withdrawals",
        "v": "90 seconds"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "Whale.io is run by Whale Operations Ltd. in the Seychelles",
        "body": "Its terms name Whale Operations Ltd., a Seychelles company, as the operator.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "It holds an Anjouan licence",
        "body": "Whale.io lists licence ALSI-202503012-FI1 from Anjouan.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🎁",
        "title": "The 200% deposit bonus unlocks bit by bit",
        "body": "On your first qualifying deposit, 200% of the deposit goes into a Bonus Balance. It unlocks a little each time you claim Daily Cashback, the Weekly Bonus or the Monthly Bonus, and what unlocks becomes withdrawable cash with no extra wagering.",
        "group": "Bonus terms",
        "label": "Wagering rules"
      },
      {
        "icon": "💸",
        "title": "Daily cashback climbs from 1% to 25%",
        "body": "Cashback on the previous day's net loss starts at 1% at Bronze 1 and rises 1% per level to 24% at Emerald 4 and 25% at Whale. It's paid as real cash with 1x wagering and can be claimed from 07:00 UTC, within 24 hours.",
        "group": "Bonus terms",
        "label": "Cashback"
      },
      {
        "icon": "💰",
        "title": "Weekly and monthly bonuses pay 2% and 1.5% of your wager",
        "body": "A weekly bonus of 2% of your adjusted wager is paid in cash every Monday, and a monthly bonus of 1.5% of the month's adjusted wager on the 1st. Neither carries wagering after you claim it.",
        "group": "Bonus terms",
        "label": "Rakeback"
      },
      {
        "icon": "👑",
        "title": "There are 25 levels and they never reset",
        "body": "The 25 levels run across seven ranks from Bronze to Whale, and each one lifts daily cashback by one point. Levels are permanent and earned only by playing.",
        "group": "Bonus terms",
        "label": "Perks by level"
      },
      {
        "icon": "🎰",
        "title": "Its lootboxes include a $150,000 Lamborghini box",
        "body": "Lootboxes always pay a prize you can claim or sell straight back, from free spins packs at $3 and merch boxes at $1.50 to slot booster packs from $20. They're open to all players and shipped globally.",
        "group": "Bonus terms",
        "label": "Lootboxes"
      },
      {
        "icon": "⚡",
        "title": "It promotes 90-second withdrawals",
        "body": "Its homepage advertises 90-second withdrawals alongside instant, gas-free crypto withdrawals.",
        "group": "Payouts & fees",
        "label": "Stated withdrawal time"
      },
      {
        "icon": "🏦",
        "title": "Withdrawals above 50,000 USDT may come in instalments",
        "body": "No maximum withdrawal is stated and the minimum is $5. Requests above the equivalent of 50,000 USDT may be paid in instalments with extra verification, and you need Level 2 verification and to have wagered your first deposit before withdrawing.",
        "group": "Payouts & fees",
        "label": "Withdrawal limits"
      },
      {
        "icon": "🪙",
        "title": "You can deposit from $1",
        "body": "The minimum deposit is the equivalent of $1 at the exchange rate when you deposit.",
        "group": "Coins & deposit limits",
        "label": "Minimum deposit"
      }
    ]
  },
  shock: {
    "intro": "Shock keeps its welcome match off its promotions page and pays rakeback you can claim every half hour. Here are ten things worth knowing before you sign up, each checked against Shock's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Curaçao"
      },
      {
        "k": "Wagering",
        "v": "35× dep + bonus"
      },
      {
        "k": "Max bet",
        "v": "$10"
      },
      {
        "k": "Crypto payouts",
        "v": "1–5 min"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "Shock is run by PR Entertainment N.V.",
        "body": "Its terms name PR Entertainment N.V., registration 163398, as the company behind Shock.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "It operates under a Curaçao licence",
        "body": "Shock states that it holds a Government of Curaçao gaming licence.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🎁",
        "title": "Its 100% welcome match isn't on the promotions page",
        "body": "A 100% first-deposit match, capped on a $1,500 deposit, is set out on its bonus terms page, but the promotions page doesn't advertise it. You claim it by contacting support after depositing, and a $10 maximum bet applies while rollover is active.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "🔁",
        "title": "Rollover is 35x the deposit plus the bonus",
        "body": "Shock's standard wagering is 35× the deposit plus the bonus, unless an offer says otherwise.",
        "group": "Bonus terms",
        "label": "Wagering"
      },
      {
        "icon": "🎲",
        "title": "Bets count by house edge against a 4% base",
        "body": "Each bet counts toward rollover as wager × edge ÷ 0.04, so a game's house edge decides how much of the bet counts. Many individual games are blocked and marked in the app.",
        "group": "Bonus terms",
        "label": "Game contribution"
      },
      {
        "icon": "💰",
        "title": "Rakeback can be claimed every 30 minutes",
        "body": "Instant rakeback builds up in a separate rewards balance on every wager and can be claimed every 30 minutes. Rewards never expire, and no rank is needed to start earning.",
        "group": "Bonus terms",
        "label": "Rakeback"
      },
      {
        "icon": "👑",
        "title": "Its own pages disagree on where VIP starts",
        "body": "The wager-based ladder runs from Bronze at $10,000 to Elite at $500m and never resets. Its Rewards 3.0 blog (June 2026) says VIP begins at Platinum 4, while its help centre (March 2025) marks Platinum 2.",
        "group": "Bonus terms",
        "label": "VIP levels"
      },
      {
        "icon": "⚡",
        "title": "Crypto withdrawals mostly take 1 to 5 minutes",
        "body": "Shock says most withdrawals are processed within a few minutes, and crypto mostly within 1–5 minutes.",
        "group": "Payouts & fees",
        "label": "Stated withdrawal time"
      },
      {
        "icon": "🏦",
        "title": "You can only have one pending withdrawal per method",
        "body": "No maximum withdrawal is published. Its terms allow one pending withdrawal per method and, depending on the method, one request per 24 hours, with processing within two banking days.",
        "group": "Payouts & fees",
        "label": "Withdrawal limits"
      },
      {
        "icon": "🪪",
        "title": "You need to share your occupation to deposit",
        "body": "Email, name, address, occupation and date of birth are required to deposit or withdraw, and ID checks are at Shock's discretion.",
        "group": "Compliance",
        "label": "KYC policy"
      }
    ]
  },
  rollbit: {
    "intro": "Rollbit pays 5% rakeback on every bet and sits a crypto trading platform alongside its casino. Here are ten things worth knowing before you sign up, each checked against Rollbit's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Curaçao"
      },
      {
        "k": "Rakeback",
        "v": "5% on all bets"
      },
      {
        "k": "Daily race",
        "v": "$25,000"
      },
      {
        "k": "First withdrawal",
        "v": "$10 dep + wager"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "Rollbit is run by Bull Gaming N.V.",
        "body": "Its terms name Bull Gaming N.V., a Curaçao company with registration 157086.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "It holds Curaçao licence OGL/2024/1260/0494",
        "body": "Rollbit lists licence OGL/2024/1260/0494 from the Curaçao Gaming Authority.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "📈",
        "title": "Its crypto trading isn't covered by the gaming licence",
        "body": "Crypto trading and an NFT marketplace sit alongside the casino, and Rollbit says crypto trading isn't covered by its gaming licence.",
        "group": "Compliance",
        "label": "Licence scope"
      },
      {
        "icon": "💰",
        "title": "Rakeback is 5% on all bets",
        "body": "It can be claimed every 30 minutes. Each Rewards Calendar claim, available at midnight, 8am and 4pm UTC, also adds one hour of +15% Rakeboost.",
        "group": "Bonus terms",
        "label": "Rakeback"
      },
      {
        "icon": "⏳",
        "title": "Most rewards are paid out in instalments",
        "body": "Rakeback pays 50% now and 50% over 3 days. Daily and weekly bonuses pay 20% now and 80% over 7 days, rank-up bonuses 80% over 21 days and monthly bonuses 80% over 30 days.",
        "group": "Bonus terms",
        "label": "How rewards pay out"
      },
      {
        "icon": "🏁",
        "title": "Its Daily Race pays out $25,000",
        "body": "The race resets every 24 hours and pays from $10,000 for 1st down to $200 for 11th. Wagers on every Rollbit product count, including sports, casino and crypto futures.",
        "group": "Bonus terms",
        "label": "Leaderboards"
      },
      {
        "icon": "⚽",
        "title": "Football bets can pay out early at two goals up",
        "body": "Its 2 Up Early Payout settles pre-match 1x2 bets as winners once your team goes two goals up, in leagues including the Premier League, Champions League and La Liga. Free bets and cashed-out bets are excluded.",
        "group": "Sports bonus terms",
        "label": "Offer"
      },
      {
        "icon": "🏦",
        "title": "New accounts must deposit and wager $10 before withdrawing",
        "body": "After that first $10 deposit and $10 wagered, Rollbit says there are no limits on withdrawals.",
        "group": "Payouts & fees",
        "label": "Withdrawal requirements"
      },
      {
        "icon": "🪪",
        "title": "Verification can run to 5 levels",
        "body": "Rollbit uses full KYC, with up to 5 verification levels including ID and a camera check, depending on the account.",
        "group": "Compliance",
        "label": "KYC policy"
      },
      {
        "icon": "🤝",
        "title": "It's FaZe Clan's Counter-Strike partner",
        "body": "Rollbit is the official Counter-Strike gaming partner of FaZe Clan, with Rollbit or RLB on the collarbone of the team jersey during matches.",
        "group": "Compliance",
        "label": "Partners"
      }
    ]
  },
  degencity: {
    "intro": "Degencity lets most players withdraw without KYC and will match your VIP status from another casino. Here are ten things worth knowing before you sign up, each checked against Degencity's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Anjouan"
      },
      {
        "k": "KYC",
        "v": "Email to withdraw"
      },
      {
        "k": "New-player cashback",
        "v": "10% for 7 days"
      },
      {
        "k": "Withdrawals",
        "v": "Within 1 hour"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "Degencity is run by a Costa Rican company",
        "body": "Its terms name 3-102-939867 LIMITADA, registration 3-102-939867, based in Escazú, San José, Costa Rica.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "Its Anjouan licence showed as valid",
        "body": "Degencity holds Anjouan licence ALSI-202601025-FI1. The validator linked from its footer showed Operating status VALID on 16 Sep 2026, with degencity.com as the registered website.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🌍",
        "title": "The licence doesn't cover the UK, the USA or Australia",
        "body": "It also excludes Comoros, France, the Netherlands, Spain and FATF-blacklisted and sanctioned countries, and complaints from players there fall outside the regulator's scope.",
        "group": "Compliance",
        "label": "Licence exclusions"
      },
      {
        "icon": "🪪",
        "title": "You can usually withdraw without KYC",
        "body": "Degencity says you can generally deposit, play and withdraw without KYC, though a verified email address is required to withdraw.",
        "group": "Compliance",
        "label": "KYC policy"
      },
      {
        "icon": "🎁",
        "title": "New players get 10% of slot losses back for 7 days",
        "body": "The cashback covers net slot losses in your first 7 days after registering and is credited automatically once you've made at least one deposit. Instant rakeback starts from the first bet.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "🎰",
        "title": "Only slot losses count toward that cashback",
        "body": "Live casino, game shows and bonus buys are excluded, and wins on other games don't offset slot losses.",
        "group": "Bonus terms",
        "label": "Game contribution"
      },
      {
        "icon": "🔄",
        "title": "It will match your VIP status from another casino",
        "body": "Email a screen recording showing your tier, total wagered and account email, and it takes up to 48 hours to review. The tier granted is at its discretion.",
        "group": "Bonus terms",
        "label": "VIP transfer"
      },
      {
        "icon": "👑",
        "title": "A dedicated VIP host comes at 1,000,000 XP",
        "body": "VIP status starts automatically at Hustler (250,000 XP). Card Shark (1,000,000 XP) adds a bonus increase and a dedicated host, Pitboss (5,000,000 XP) bespoke rewards and exclusive access, and Ace (22,000,000 XP) event invitations.",
        "group": "Bonus terms",
        "label": "Perks by level"
      },
      {
        "icon": "⚡",
        "title": "Withdrawals should arrive within an hour",
        "body": "Degencity says withdrawals are usually processed instantly, with blockchain confirmations taking a few minutes and funds arriving within up to 1 hour.",
        "group": "Payouts & fees",
        "label": "Stated withdrawal time"
      },
      {
        "icon": "🪙",
        "title": "USDT on Tron needs a $20 deposit",
        "body": "Minimums run per coin and network: $5 for BTC, ETH, USDC and USDT on ERC-20, $20 for USDT on Tron and $1 for LTC and TRX. Its help centre says these can change.",
        "group": "Coins & deposit limits",
        "label": "Minimum deposit"
      }
    ]
  },
  acebet: {
    "intro": "Acebet's rakeback climbs to 25% of the house edge, but its own pages don't agree on the welcome bonus. Here are ten things worth knowing before you sign up, each checked against Acebet's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Anjouan"
      },
      {
        "k": "Rakeback",
        "v": "5–25% of edge"
      },
      {
        "k": "Daily win cap",
        "v": "EUR 100,000"
      },
      {
        "k": "Withdrawals",
        "v": "5–15 min (FAQ)"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "Acebet is run by Golden Frog Inc.",
        "body": "Its terms name Golden Frog Inc., registered in Anjouan under number 15831.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "Its licence number doubles as a company registration",
        "body": "Acebet's FAQ cites Anjouan Offshore Financial Authority licence no. 15831, while its footer calls the same number a company registration.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🎁",
        "title": "Its own pages give different welcome offers",
        "body": "The welcome page offers 20 free spins at sign-up with no deposit needed and a 100% match up to $1,000 on your first deposit. Its about page says a 1% deposit match, and a homepage tile advertises a free $10 plus 200% on deposits up to $10.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "🔒",
        "title": "The wagering multiplier is only shown at sign-up",
        "body": "Bonus funds must meet its standard playthrough before withdrawal, but the multiplier and game contribution rates appear only in the bonus terms at sign-up.",
        "group": "Bonus terms",
        "label": "Wagering rules"
      },
      {
        "icon": "💰",
        "title": "Rakeback rises from 5% to 25% of the house edge",
        "body": "The share grows with rank, from 5% at Bronze I to 25% at Apex. It's split into instant, daily, weekly and monthly pots, and the daily pot must be claimed within 24 hours.",
        "group": "Bonus terms",
        "label": "Rakeback"
      },
      {
        "icon": "👑",
        "title": "There are 27 ranks, topping out at $1B wagered",
        "body": "They run from Bronze I at $0 to Sapphire at $500M and Apex at $1B, raising the share of edge returned at each step.",
        "group": "Bonus terms",
        "label": "VIP ranks"
      },
      {
        "icon": "🎯",
        "title": "15 missions pay about $21 in total",
        "body": "Missions are completed in order for cash rewards of $0.10 to $5.00, such as depositing $10, wagering $200 or enabling 2FA. Two involve referring other players.",
        "group": "Bonus terms",
        "label": "Missions"
      },
      {
        "icon": "🏦",
        "title": "Daily winnings are capped at EUR 100,000",
        "body": "A customer's winnings can't exceed EUR 100,000 per day, counted from 00:00 to 23:59 GMT. A deposit must be wagered at least once before you can withdraw.",
        "group": "Payouts & fees",
        "label": "Withdrawal limits"
      },
      {
        "icon": "⏱️",
        "title": "Its FAQ and terms give different withdrawal times",
        "body": "The FAQ says withdrawals typically take 5–15 minutes, while the terms say within two banking days.",
        "group": "Payouts & fees",
        "label": "Stated withdrawal time"
      },
      {
        "icon": "💳",
        "title": "Payments go through a company in Cyprus",
        "body": "Acebet's payments are handled by 51 Plus One Ltd, based in Strovolos, Nicosia.",
        "group": "Compliance",
        "label": "Payment processor"
      }
    ]
  },
  mbit: {
    "intro": "mBit spreads a 325% welcome bonus over three deposits, but gives you a single day to clear it. Here are ten things worth knowing before you sign up, each checked against mBit's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Curaçao"
      },
      {
        "k": "Wagering",
        "v": "40× bonus"
      },
      {
        "k": "Min deposit",
        "v": "30 USDT"
      },
      {
        "k": "Weekly cap",
        "v": "3 BTC"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "mBit is run by Scores55 Tech B.V.",
        "body": "Its terms name Scores55 Tech B.V., a Curaçao company with registration 162990.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "It holds Curaçao licence OGL/2024/1307/0748",
        "body": "mBit lists licence OGL/2024/1307/0748 from the Curaçao Gaming Control Board.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🎁",
        "title": "The welcome bonus is 325% up to 4 BTC over three deposits",
        "body": "It splits into 100% up to 1 BTC plus 100 free spins, 100% up to 1.5 BTC plus 100 free spins, and 125% up to 1.5 BTC plus 125 free spins, each with a 30 USDT minimum deposit.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "🔁",
        "title": "Wagering is 40x the bonus",
        "body": "Your deposit, bonus and winnings stay locked until it's met, and free-spin winnings carry 40× too.",
        "group": "Bonus terms",
        "label": "Wagering"
      },
      {
        "icon": "⏳",
        "title": "Bonuses expire after 1 day",
        "body": "Deposit bonuses, free spins and their winnings are valid for 1 day unless a promotion says otherwise.",
        "group": "Bonus terms",
        "label": "Expiry"
      },
      {
        "icon": "🎰",
        "title": "Free-spin winnings are capped at 50 USDT",
        "body": "In any welcome package, free-spin winnings are capped at 50 USDT or 0.00048 BTC. No cap is stated on the match bonus.",
        "group": "Bonus terms",
        "label": "Max cashout"
      },
      {
        "icon": "🃏",
        "title": "Table games and live casino count 0%",
        "body": "Slots and other games count 100%, while video poker, table games and live blackjack, roulette and baccarat count 0%. Bonus funds work on slots only.",
        "group": "Bonus terms",
        "label": "Game contribution"
      },
      {
        "icon": "💸",
        "title": "Daily MoneyBack runs from 2% to 10%",
        "body": "It's paid by Stellar Club level on daily net deposit losses, and needs a qualifying deposit on the same day as the losses.",
        "group": "Bonus terms",
        "label": "Cashback"
      },
      {
        "icon": "🏦",
        "title": "Withdrawals are capped at 3 BTC a week",
        "body": "The limit is 3 BTC within 7 days and 10 BTC within 30 days, unless a promotion says otherwise. Wins of 10 BTC or more may be paid at 10% a month for 10 months.",
        "group": "Payouts & fees",
        "label": "Withdrawal limits"
      },
      {
        "icon": "🪪",
        "title": "Payouts above 1 BTC bring extra checks",
        "body": "mBit may check your identity before paying out, with extra checks above 1 BTC.",
        "group": "Compliance",
        "label": "KYC policy"
      }
    ]
  },
  "7bit": {
    "intro": "7Bit offers a 325% welcome pack over four deposits, with a weekly withdrawal cap to match. Here are ten things worth knowing before you sign up, each checked against 7Bit's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Curaçao"
      },
      {
        "k": "Welcome",
        "v": "325% to 5.25 BTC"
      },
      {
        "k": "Weekly cap",
        "v": "0.13 BTC"
      },
      {
        "k": "Max bet",
        "v": "13 μBTC"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "Its operator is Scores55 Tech B.V.",
        "body": "Its terms name Scores55 Tech B.V., a Curaçao company with registration 162990.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "It holds Curaçao licence OGL/2024/1307/0748",
        "body": "The casino lists licence OGL/2024/1307/0748 from the Curaçao Gaming Authority.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🎁",
        "title": "The welcome pack is 325% up to 5.25 BTC",
        "body": "It covers your first four deposits and adds 250 free spins. The first-deposit bonus needs no code, while deposits two to four are claimed with sign-up bonus codes.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "🔁",
        "title": "Its pages disagree on wagering",
        "body": "Its bonus terms say welcome-package bonuses and free-spin winnings must be wagered 35×, while its bonuses page says most bonuses need 40–45×. Both apply the multiplier to the bonus.",
        "group": "Bonus terms",
        "label": "Wagering"
      },
      {
        "icon": "🎯",
        "title": "The max bet is 13 μBTC per spin",
        "body": "That limit applies while you're wagering any welcome-package bonus.",
        "group": "Bonus terms",
        "label": "Max bet"
      },
      {
        "icon": "🃏",
        "title": "Live casino counts 0% toward wagering",
        "body": "Video slots count 100% and all other games 5%. Bonus money and free spins can't be used on progressive jackpot slots.",
        "group": "Bonus terms",
        "label": "Game contribution"
      },
      {
        "icon": "🏦",
        "title": "Withdrawals are capped at 0.13 BTC a week",
        "body": "The cap is 0.13 BTC per week and 0.52 BTC per month. A balance above 0.52 BTC may be paid in monthly instalments, though progressive jackpot wins are paid in full.",
        "group": "Payouts & fees",
        "label": "Withdrawal limits"
      },
      {
        "icon": "🔒",
        "title": "Every deposit carries 3x wagering",
        "body": "Deposited funds must be wagered 3x, or 10x on table and live games, before they can be withdrawn.",
        "group": "Coins & deposit limits",
        "label": "Deposit limits"
      },
      {
        "icon": "💸",
        "title": "Weekly cashback reaches 20% at Level 12",
        "body": "The rate is set by loyalty level, from 5% at Levels 1-5 with x35 cashback wagering up to 20% at Level 12 with x1.",
        "group": "Bonus terms",
        "label": "Cashback"
      },
      {
        "icon": "🪪",
        "title": "Withdrawals unlock after verification",
        "body": "You need to provide ID, address and payment proof before withdrawals unlock.",
        "group": "Compliance",
        "label": "KYC policy"
      }
    ]
  },
  bitstarz: {
    "intro": "BitStarz offers a 5 BTC welcome package, but its terms don't say exactly what the 40x wagering applies to. Here are ten things worth knowing before you sign up, each checked against BitStarz's own pages.",
    "published": "2026-11-04",
    "glance": [
      {
        "k": "Licence",
        "v": "Curaçao"
      },
      {
        "k": "Wagering",
        "v": "40×"
      },
      {
        "k": "Max bet",
        "v": "5 EUR/USD/USDT"
      },
      {
        "k": "BTC withdrawal",
        "v": "Max 1 BTC per tx"
      }
    ],
    "facts": [
      {
        "icon": "🏢",
        "title": "BitStarz is run by Gareton B.V.",
        "body": "Its terms name Gareton B.V., a Curaçao company with registration 160656.",
        "group": "Compliance",
        "label": "Company"
      },
      {
        "icon": "🏛️",
        "title": "It holds Curaçao licence OGL/2024/165/0185",
        "body": "BitStarz lists licence OGL/2024/165/0185 from the Curaçao Gaming Authority.",
        "group": "Compliance",
        "label": "Licence"
      },
      {
        "icon": "🎁",
        "title": "The welcome package is 5 BTC plus 180 free spins",
        "body": "It opens with 100% up to 1 BTC and 180 free spins on your first deposit, with further bonuses on deposits two to four.",
        "group": "Bonus terms",
        "label": "Standing offer"
      },
      {
        "icon": "🔁",
        "title": "Wagering is 40x, but the terms don't say on what",
        "body": "40× applies to all bonuses unless stated otherwise. For deposit bonuses, the terms don't say whether that means the bonus alone or the deposit plus the bonus.",
        "group": "Bonus terms",
        "label": "Wagering"
      },
      {
        "icon": "⏳",
        "title": "Welcome bonuses last 7 days",
        "body": "To get the welcome free spins you must wager the deposit once within 24 hours, and free spins must be opened within 1 day.",
        "group": "Bonus terms",
        "label": "Expiry"
      },
      {
        "icon": "🎯",
        "title": "Bets are capped at 5 EUR/USD/USDT while wagering",
        "body": "The limit, or 0.00006 BTC, applies per bet until wagering is complete, including double-ups and bonus buys.",
        "group": "Bonus terms",
        "label": "Max bet"
      },
      {
        "icon": "🎰",
        "title": "No-deposit winnings are capped at 100 EUR/USD/USDT",
        "body": "The cap is 150 in CAD, AUD or NZD, and anything above it is forfeited. No cap is stated for the deposit welcome bonus.",
        "group": "Bonus terms",
        "label": "Max cashout"
      },
      {
        "icon": "📅",
        "title": "Reloads need four prior deposits",
        "body": "Reload Monday pays 50% on the first deposit of the day, up to $300, and Wednesday gives up to 200 free spins. Both require four prior deposits to qualify.",
        "group": "Bonus terms",
        "label": "Reload bonuses"
      },
      {
        "icon": "🏦",
        "title": "Bitcoin withdrawals are capped at 1 BTC per transaction",
        "body": "They carry a 0% fee and process instantly. No daily, weekly or monthly payout cap is published.",
        "group": "Payouts & fees",
        "label": "Withdrawal limits"
      },
      {
        "icon": "🪪",
        "title": "You need KYC documents to get paid",
        "body": "BitStarz requires KYC documents to receive payments, and extra checks are possible at withdrawal.",
        "group": "Compliance",
        "label": "KYC policy"
      }
    ]
  },
};

export const hasFactArticle = (slug: string) => slug in FACT_ARTICLES;
