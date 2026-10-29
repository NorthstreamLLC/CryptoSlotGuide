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
};

export const hasFactArticle = (slug: string) => slug in FACT_ARTICLES;
