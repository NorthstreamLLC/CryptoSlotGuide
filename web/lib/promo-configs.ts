/**
 * Copy for the promo code pages served by app/promo-codes/[slug]. Every
 * claim here either is a spec-sheet fact (by group + label, so it stays in
 * step with data/casinoSpecSheets.json) or carries the URL it came from.
 * `code` in the text functions is the casino's current code from ops.json.
 */
export type PromoCard = { group: string; label: string; sub?: string } | { title: string; body: string; href: string };

export type PromoConfig = {
  title: (code: string) => string;
  description: (code: string) => string;
  lead: (code: string) => string;
  perks: { t: string; d: string }[];
  steps: (code: string) => { t: string; d: string; src?: string }[];
  rewardsTitle: string;
  rewards: PromoCard[];
  termsTitle: string;
  terms: PromoCard[];
  faqs: (code: string) => { q: string; a: string }[];
  next: { href: string; label: string; hint: string }[];
};

const STAKE_NEXT = { href: "/promo-codes/stake", label: "Stake code SLOTGUIDE", hint: "Unlocks Stake's 3.5% rakeback from your first bet." };
const BONUSES_NEXT = { href: "/bonuses", label: "Every bonus, side by side", hint: "Welcome offers and rewards with the wagering each carries." };
const ours = (name: string) => (code: string) => ({ q: `Who gives code ${code}?`, a: `It is our affiliate code. We earn a commission when you sign up with it, which never changes what our ${name} review reports.` });

const GAMDOM_CODE = "https://help.gamdom.com/en/articles/13334652-how-to-add-an-affiliate-code";
const DUELBITS_REF = "https://help.duelbits.com/en/articles/5351626-affiliates-explained";
const RAINBET_TERMS = "https://rainbet.com/deposit-promotion-terms";
const RAZED_PROMOS = "https://www.razed.com/promotions/";

export const PROMO_CONFIGS: Record<string, PromoConfig> = {
  gamdom: {
    title: (c) => `Gamdom promo code ${c}: 15% instant rakeback for your first week`,
    description: (c) => `Add code ${c} within 6 hours of signing up at Gamdom and your instant rakeback is boosted to 15% for your first 7 days. How to activate it, plus King of the Hill leaderboards and Gamdom's rewards, from its own pages.`,
    lead: (c) => `Add code ${c} within 6 hours of registering and Gamdom boosts your instant rakeback to 15% for your first 7 days. After that you keep Gamdom's standard rewards: real-time rakeback, King of the Hill leaderboards and rank-up rewards.`,
    perks: [
      { t: "15% instant rakeback for 7 days", d: "When the code is added within 6 hours of sign-up" },
      { t: "$30,000 daily leaderboard", d: "King of the Hill, top 200 paid every day" },
      { t: "$500,000 twice a month", d: "Bi-weekly leaderboard, top 1,000 paid" },
    ],
    steps: (c) => [
      { t: "Open Gamdom through our link", d: `The sign-up button opens Gamdom with code ${c} attached.` },
      { t: "Activate the code within 6 hours", d: `If it isn't on your account, go to Rewards, open Special Rewards, click Activate and enter ${c}. Once added it can't be changed.`, src: GAMDOM_CODE },
      { t: "Play: rakeback is paid in real time", d: "Claim from $0.10 and it never expires, or turn it into a Reload that adds 25%, paid over seven days.", src: "https://help.gamdom.com/en/articles/9595436-what-is-rakeback-how-it-works-and-how-to-get-it" },
    ],
    rewardsTitle: "What the code unlocks, and what runs for everyone",
    rewards: [
      { title: "The code boost: 15% for 7 days", body: "Gamdom's help centre says using any affiliate code boosts your Instant Rakeback to 15% for your first 7 days. Codes can only be added within 6 hours of registering, from Special Rewards on the Rewards page, and can't be changed once added.", href: GAMDOM_CODE },
      { group: "Bonus terms", label: "Rakeback" },
      { group: "Bonus terms", label: "Rakeback reload", sub: "Turn rakeback into a 25% reload" },
      { group: "Bonus terms", label: "Leaderboards", sub: "King of the Hill leaderboards" },
      { group: "Bonus terms", label: "Perks by level", sub: "Royalty Up levels and VIP" },
      { group: "Bonus terms", label: "Reload bonuses", sub: "Weekly promotions" },
    ],
    termsTitle: "Terms worth knowing",
    terms: [
      { group: "Bonus terms", label: "Wagering rules", sub: "Wagering" },
      { group: "Compliance", label: "KYC policy", sub: "ID checks" },
      { group: "Compliance", label: "Licence" },
    ],
    faqs: (c) => [
      { q: "What is the Gamdom promo code?", a: `${c}. Add it within 6 hours of registering and Gamdom boosts your instant rakeback to 15% for your first 7 days.` },
      { q: `Where do I enter code ${c}?`, a: "Our link attaches it. To add it yourself, go to the Rewards page, open Special Rewards, click Activate and type the code. Gamdom says codes can only be added within 6 hours of registering and can't be changed once added." },
      { q: "How long does the 15% boost last?", a: "Gamdom's rewards article says the boost stays valid for 7 days once activated. After that, rakeback carries on at Gamdom's standard real-time rate." },
      { q: "Does Gamdom have a deposit bonus?", a: "Gamdom's own help pages disagree: its deposit bonus guide describes offers sized per player, while its FAQ says it doesn't offer traditional bonuses. The welcome offer it promotes is the boosted instant rakeback." },
      ours("Gamdom")(c),
    ],
    next: [
      { href: "/casinos/gamdom", label: "Full Gamdom review", hint: "Withdrawals, coins, licence and sportsbook, each linked to Gamdom's own pages." },
      STAKE_NEXT,
      BONUSES_NEXT,
    ],
  },

  duelbits: {
    title: (c) => `Duelbits promo code ${c}: 25% rakeback, paid instant to monthly`,
    description: (c) => `Sign up at Duelbits with code ${c}. Duelbits pays 25% of the house edge back as rakeback, split across instant, daily, weekly and monthly, with no deposit bonus to wager off. How to set the code, and its daily and weekly leaderboards, from Duelbits' own pages.`,
    lead: (c) => `Sign up with code ${c} and Duelbits' Ace's Rewards start with your first bet: 25% of the house edge back, 10% of it instantly. No deposit bonus means nothing to wager off before you withdraw.`,
    perks: [
      { t: "25% rakeback", d: "Of the house edge: 10% instant, 5% daily, weekly and monthly" },
      { t: "$10,000 daily leaderboard", d: "Top 100 paid every day" },
      { t: "$30,000 weekly leaderboard", d: "Top 250 paid every week" },
    ],
    steps: (c) => [
      { t: "Open Duelbits through our link", d: `The sign-up button opens Duelbits with code ${c} attached.` },
      { t: "The code has to be on within 24 hours", d: "Duelbits' affiliate terms say a referral code must be set within 24 hours of registering and can't be changed afterwards.", src: DUELBITS_REF },
      { t: "Claim rakeback before it resets", d: "Instant rakeback any time; daily resets at 00:00 UTC, weekly every Monday and monthly on the 1st.", src: "https://help.duelbits.com/en/articles/12547694-rakeback-bits-at-duelbits" },
    ],
    rewardsTitle: "What Duelbits pays you back",
    rewards: [
      { group: "Bonus terms", label: "Rakeback", sub: "25% rakeback, split four ways" },
      { group: "Bonus terms", label: "Leaderboards", sub: "Daily and weekly leaderboards" },
      { group: "Bonus terms", label: "VIP levels", sub: "Ace's Lounge levels" },
      { group: "Bonus terms", label: "Reload bonuses", sub: "Weekly VIP perks and promos" },
      { group: "Bonus terms", label: "VIP Club" },
      { group: "Bonus terms", label: "Expiry", sub: "When unclaimed rakeback resets" },
    ],
    termsTitle: "Terms worth knowing",
    terms: [
      { group: "Bonus terms", label: "Deposit bonus" },
      { group: "Coins & deposit limits", label: "Minimum deposit" },
      { group: "Compliance", label: "Licence" },
    ],
    faqs: (c) => [
      { q: "What is the Duelbits promo code?", a: `${c}. Our link attaches it; Duelbits says a referral code must be set within 24 hours of registering and can't be changed afterwards.` },
      { q: `Does code ${c} come with its own bonus?`, a: "Duelbits' help centre lists no extra bonus tied to a referral code. Every player gets Ace's Rewards: 25% of the house edge back as rakeback (10% instant, 5% daily, 5% weekly, 5% monthly), with up to 12.5% more from level-ups." },
      { q: "Does Duelbits have a deposit bonus?", a: "No. Its help centre lists weekly promos, VIP rakeback, giveaways and Ace's Rewards, with no deposit bonus, so there is no wagering lock on your deposit." },
      { q: "Do sports bets earn rakeback?", a: "Yes. Duelbits counts sports wagers at a 1% house edge with the same 25% split, so $10,000 wagered on sports pays $25 in rakeback over time." },
      ours("Duelbits")(c),
    ],
    next: [
      { href: "/casinos/duelbits", label: "Full Duelbits review", hint: "Withdrawals, coins, licence and sportsbook, each linked to Duelbits' own pages." },
      STAKE_NEXT,
      BONUSES_NEXT,
    ],
  },

  rainbet: {
    title: (c) => `Rainbet promo code ${c}: a $1M monthly race and a first deposit bonus`,
    description: (c) => `Sign up at Rainbet with code ${c}: its first deposit bonus and the 40x terms that come with it, rakeback claimable every 15 minutes, a $20,000 weekly raffle and daily, weekly and $1M monthly races, from Rainbet's own pages.`,
    lead: (c) => `Sign up with code ${c} and you're in Rainbet's races from your first bet: daily, weekly and a $1M monthly race, plus rakeback you can claim every 15 minutes. The first deposit bonus is optional, and it comes with 40x wagering.`,
    perks: [
      { t: "$1M monthly race", d: "$100,000 to first, still paying at 100th" },
      { t: "Rakeback every 15 minutes", d: "Based on your total wagered" },
      { t: "$20,000 weekly raffle", d: "A free ticket each week, plus one per $500 wagered" },
    ],
    steps: (c) => [
      { t: "Open Rainbet through our link", d: `The sign-up button opens Rainbet with code ${c} attached.` },
      { t: "Decide on the first deposit bonus", d: "It takes a $30 to $700 deposit, and deposit plus bonus must be wagered 40x. Skip it if you want your deposit free to withdraw.", src: RAINBET_TERMS },
      { t: "Play the races", d: "Daily, weekly and monthly races pay out automatically, and sportsbook bets count 3x toward your rank.", src: "https://rainbet.com/monthly-race" },
    ],
    rewardsTitle: "What Rainbet pays you back",
    rewards: [
      { group: "Bonus terms", label: "Leaderboards", sub: "Daily, weekly and $1M monthly races" },
      { group: "Bonus terms", label: "Weekly raffle", sub: "$20,000 weekly raffle" },
      { group: "Bonus terms", label: "Rakeback" },
      { group: "Bonus terms", label: "Reload bonuses", sub: "Daily, weekly and monthly rewards" },
      { group: "Bonus terms", label: "Perks by level", sub: "25 ranks and the VIP Program" },
      { group: "Bonus terms", label: "Missions", sub: "Casino Challenges" },
    ],
    termsTitle: "If you take the first deposit bonus",
    terms: [
      { group: "Bonus terms", label: "Standing offer", sub: "The first deposit bonus" },
      { group: "Bonus terms", label: "Wagering" },
      { group: "Coins & deposit limits", label: "Deposit limits", sub: "Deposit size" },
      { group: "Bonus terms", label: "Max bet", sub: "Max bet while wagering" },
      { group: "Bonus terms", label: "Game contribution", sub: "Games you can't use" },
      { group: "Bonus terms", label: "Max cashout" },
    ],
    faqs: (c) => [
      { q: "What is the Rainbet promo code?", a: `${c}. Our sign-up link opens Rainbet with it attached.` },
      { q: "What is Rainbet's welcome bonus?", a: "A first deposit bonus. Rainbet's help centre says deposit and bonus go into a promotional balance that has to be turned over 40x, so a $100 deposit becomes $200 in play and needs $8,000 of wagering. The deposit must be between $30 and $700. Rainbet's terms page also lists a No Wager Lock variant." },
      { q: "What is the max bet with the bonus?", a: "1% of your deposit per bet while the rollover is active, unless the offer says otherwise." },
      { q: "Which games can't I play with the bonus?", a: "Games above 97.4% RTP are disabled while the promotion is active." },
      ours("Rainbet")(c),
    ],
    next: [
      { href: "/casinos/rainbet", label: "Full Rainbet review", hint: "Withdrawals, coins, licence and sportsbook, each linked to Rainbet's own pages." },
      { href: "/races", label: "Every casino race", hint: "Daily, weekly and monthly races and raffles, side by side." },
      BONUSES_NEXT,
    ],
  },

  razed: {
    title: (c) => `Razed promo code ${c}: 100% up to $300 + up to 150 free spins`,
    description: (c) => `Sign up at Razed with code ${c} and claim its welcome bonus: a 100% first deposit match up to $300 plus up to 150 free spins on Sugar Rush 1000. The 40x terms, the $3,000 cap and Razed's races and VIP rewards, from its own pages.`,
    lead: (c) => `Sign up with code ${c}, opt in on the deposit screen and Razed matches your first deposit 100% up to $300, plus 100 free spins on Sugar Rush 1000 for a $100 deposit, or 150 for $200 and up.`,
    perks: [
      { t: "100% match up to $300", d: "On your first deposit, from $100" },
      { t: "Up to 150 free spins", d: "On Sugar Rush 1000, spread over 5 days" },
      { t: "$100,000 monthly race", d: "$30,000 top prize, plus a $10,000 weekly race" },
    ],
    steps: (c) => [
      { t: "Open Razed through our link", d: `The sign-up button opens Razed with code ${c} attached.` },
      { t: "Opt in before you deposit", d: "Choose the welcome bonus on the deposit screen, then deposit at least $100 ($200 for the full 150 spins).", src: RAZED_PROMOS },
      { t: "Clear 40x within 7 days", d: "Deposit and bonus sit in one bonus balance, max bet $50; up to $3,000 can be withdrawn once wagering is done.", src: RAZED_PROMOS },
    ],
    rewardsTitle: "What Razed pays you back after the bonus",
    rewards: [
      { group: "Bonus terms", label: "Rakeback" },
      { group: "Bonus terms", label: "Reload bonuses", sub: "Daily, weekly and monthly bonuses" },
      { group: "Bonus terms", label: "Cashback", sub: "Lossback" },
      { group: "Bonus terms", label: "Rank-up rewards" },
      { group: "Bonus terms", label: "Leaderboards", sub: "Monthly and weekly races" },
      { group: "Bonus terms", label: "Milestone prizes" },
    ],
    termsTitle: "Welcome bonus terms",
    terms: [
      { group: "Bonus terms", label: "Wagering" },
      { group: "Bonus terms", label: "Expiry" },
      { group: "Bonus terms", label: "Max cashout" },
      { group: "Bonus terms", label: "Max bet" },
      { group: "Bonus terms", label: "Game contribution", sub: "What counts toward wagering" },
      { group: "Bonus terms", label: "Bonus play rules", sub: "Who can claim it" },
    ],
    faqs: (c) => [
      { q: "What is the Razed promo code?", a: `${c}. Our sign-up link opens Razed with it attached.` },
      { q: "What is Razed's welcome bonus?", a: "A 100% match on your first deposit up to $300, plus 100 free spins on Sugar Rush 1000 for a $100 to $199 deposit, or 150 for $200 and up, spread over 5 days. Opt in on the deposit screen before you deposit." },
      { q: "What are the wagering terms?", a: "40x on one bonus balance holding both your deposit and the bonus, completed within 7 days. Max bet is $50 while clearing it, and up to $3,000 can be withdrawn from the bonus once wagering is done." },
      { q: "Do sports bets count toward the wagering?", a: "No. Sports bets don't count, and Razed's Originals, Unoriginals and most live casino count 20%." },
      ours("Razed")(c),
    ],
    next: [
      { href: "/casinos/razed", label: "Full Razed review", hint: "Withdrawals, coins, licence and sportsbook, each linked to Razed's own pages." },
      { href: "/sportsbooks", label: "Crypto sportsbooks", hint: "Razed is our sportsbook pick; see how it compares." },
      BONUSES_NEXT,
    ],
  },
};
