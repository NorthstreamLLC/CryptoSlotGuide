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
const DUEL_TOS = "https://duel.com/policies/tos";
const DEGEN_BONUS = "https://help.degen.com/en/articles/15558569-unlock-up-to-1-500-on-your-first-deposit";
const YEET_BONUS = "https://help.yeet.com/en/articles/13464278-deposit-bonus-faqs";
const GOATED_LEVELS = "https://www.goated.com/help/article/9788115-goated-level-up-bonus";
const BETFURY_PACK = "https://betfury.com/promo/welcome-pack-bonus";
const BETFURY_TERMS = "https://docs.betfury.com/betfury/bonus-system/welcome-pack-terms-and-conditions";
const THRILL_REF = "https://intercom.help/thrill/en/articles/11736577-refer-a-friend-and-earn-as-they-play";
const THRILL_LEVELS = "https://intercom.help/thrill/en/articles/11882893-what-are-the-rewards-levels-and-benefits-at-thrill";

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

  duel: {
    title: (c) => `Duel promo code ${c}: a $3M monthly race and 50% instant rakeback on slots`,
    description: (c) => `Sign up at Duel with code ${c}. Duel runs no deposit bonuses by design; instead it pays 50% of the house edge back instantly on slots, runs zero-edge Originals and a $3,000,000 monthly race. All from Duel's own pages.`,
    lead: (c) => `Duel doesn't do deposit bonuses. Sign up with code ${c} and you get what it gives instead: half the house edge back instantly on third-party slots, zero-edge Originals within a daily allowance, and a $3M monthly race.`,
    perks: [
      { t: "$3,000,000 monthly race", d: "$1.5M to first, at least 50 places paid" },
      { t: "50% instant rakeback on slots", d: "Turns a 4% house edge into an effective 2%" },
      { t: "Zero-edge Originals", d: "Within a daily allowance that resets every day" },
    ],
    steps: (c) => [
      { t: "Open Duel through our link", d: `The sign-up button opens Duel with code ${c} attached.` },
      { t: "Check Duel takes your country", d: "Its terms exclude the UK, the USA, Australia, France, Germany, Spain, the Netherlands and others.", src: DUEL_TOS },
      { t: "Play: rakeback comes back instantly", d: "No VIP ladder or level-up bonuses; the value is returned on every bet instead.", src: "https://duel.com/zero-edge-faq" },
    ],
    rewardsTitle: "What Duel gives back instead of a bonus",
    rewards: [
      { group: "Bonus terms", label: "Rakeback", sub: "Instant rakeback and zero edge" },
      { group: "Bonus terms", label: "Leaderboards", sub: "$3M monthly and $25K daily races" },
      { group: "Bonus terms", label: "Leaderboard prizes" },
      { group: "Bonus terms", label: "Standing offer", sub: "Why there's no bonus" },
      { group: "Bonus terms", label: "VIP levels", sub: "No VIP ladder" },
      { group: "Bonus terms", label: "House edge claim", sub: "99.9% RTP house games" },
    ],
    termsTitle: "Terms worth knowing",
    terms: [
      { group: "Compliance", label: "Restricted countries" },
      { group: "Compliance", label: "KYC policy", sub: "ID checks" },
      { group: "Compliance", label: "Licence" },
    ],
    faqs: (c) => [
      { q: "What is the Duel promo code?", a: `${c}. Our sign-up link opens Duel with it attached.` },
      { q: "Does Duel have a welcome bonus?", a: "No, by design. Duel argues against deposit bonuses and returns value through instant rakeback and zero-edge house games instead, so there is no wagering lock on your deposit." },
      { q: "How does Duel's rakeback work?", a: "On third-party slots, 50% of the house edge comes back instantly, so a 4% edge becomes an effective 2%. Duel Originals carry a 0.1% edge that is refunded as rakeback within your daily zero-edge allowance." },
      { q: "Which countries can't play at Duel?", a: "Its terms list, among others, the UK, the USA and its territories, Australia, France, Germany, Spain, the Netherlands (including Curaçao), Lithuania, Slovakia and the UAE." },
      ours("Duel")(c),
    ],
    next: [
      { href: "/casinos/duel", label: "Full Duel review", hint: "Withdrawals, coins, licence and games, each linked to Duel's own pages." },
      { href: "/races", label: "Every casino race", hint: "Daily, weekly and monthly races and raffles, side by side." },
      BONUSES_NEXT,
    ],
  },

  degen: {
    title: (c) => `Degen promo code ${c}: 100% first deposit bonus up to $1,500`,
    description: (c) => `Sign up at Degen with code ${c} and claim its 100% first deposit match up to $1,500, with 30x wagering and no time limit. How to activate it, plus Degen's 3-8% rakeback and $25,000 weekly race, from its own pages.`,
    lead: (c) => `Sign up with code ${c}, activate the bonus in your Wallet, then deposit $20 or more: Degen matches your first deposit 100% up to $1,500. Wagering is 30x deposit plus bonus, with no time limit.`,
    perks: [
      { t: "100% match up to $1,500", d: "On your first deposit, from $20" },
      { t: "No time limit on the rollover", d: "30x deposit plus bonus" },
      { t: "$25,000 weekly race", d: "Top 20 paid, $10,000 to first" },
    ],
    steps: (c) => [
      { t: "Sign up through our link", d: `Degen's bonus needs the account registered under an eligible referral code; our link attaches ${c}.`, src: DEGEN_BONUS },
      { t: "Activate the bonus in your Wallet", d: "Switch it on before you deposit, then deposit at least $20.", src: DEGEN_BONUS },
      { t: "Clear 30x at up to $10 a bet", d: "No time limit. Challenges, accumulator games and slot bonus buys don't count.", src: DEGEN_BONUS },
    ],
    rewardsTitle: "What Degen pays back as you play",
    rewards: [
      { group: "Bonus terms", label: "Rakeback", sub: "3% to 8% rakeback" },
      { group: "Bonus terms", label: "Recurring bonuses", sub: "Weekly and monthly bonuses" },
      { group: "Bonus terms", label: "Perks by level", sub: "Level-up and rank-up bonuses" },
      { group: "Bonus terms", label: "Reload bonuses", sub: "Daily reloads from Platinum" },
      { group: "Bonus terms", label: "Leaderboards", sub: "$25,000 weekly race" },
      { group: "Bonus terms", label: "VIP levels" },
    ],
    termsTitle: "Welcome bonus terms",
    terms: [
      { group: "Bonus terms", label: "Wagering" },
      { group: "Bonus terms", label: "Max bet" },
      { group: "Bonus terms", label: "Game contribution", sub: "What counts toward wagering" },
      { group: "Bonus terms", label: "During rollover", sub: "While the rollover is active" },
      { group: "Bonus terms", label: "Expiry", sub: "Time limit" },
      { group: "Bonus terms", label: "Bonus eligibility", sub: "Who can claim it" },
    ],
    faqs: (c) => [
      { q: "What is the Degen promo code?", a: `${c}. Our sign-up link opens Degen with it attached.` },
      { q: "What is Degen's welcome bonus?", a: "A 100% match on your first deposit up to $1,500. The deposit must be at least $20, the bonus must be activated in your Wallet before you deposit, and the account must be registered under an eligible referral code." },
      { q: "What are the wagering terms?", a: "30x the deposit plus the bonus, so $100 + $100 needs $6,000 of wagering, with no time limit. Max bet is $10 while the rollover is active, and each bet counts by the game's house edge (wager x edge / 0.04)." },
      { q: "What if the bonus doesn't show up?", a: "Degen asks you to contact its support team as soon as possible after making your deposit." },
      ours("Degen")(c),
    ],
    next: [
      { href: "/casinos/degen", label: "Full Degen review", hint: "Withdrawals, coins, licence and games, each linked to Degen's own pages." },
      STAKE_NEXT,
      BONUSES_NEXT,
    ],
  },

  yeet: {
    title: (c) => `Yeet promo code ${c}: 100% up to $1,000 with no cashout cap`,
    description: (c) => `Sign up at Yeet with code ${c} and claim a 100% first deposit bonus up to $1,000: 35x wagering, 90 days to clear it and no maximum cashout. Plus instant rakeback and the $50K weekly Chairman's Cup, from Yeet's own pages.`,
    lead: (c) => `Sign up with code ${c} and Yeet matches your first deposit 100% up to $1,000. Wagering is 35x deposit plus bonus over 90 days, and Yeet sets no cap on what you can cash out.`,
    perks: [
      { t: "100% match up to $1,000", d: "On your first deposit" },
      { t: "No max cashout", d: "Only the $1,000 bonus limit" },
      { t: "5% instant rakeback", d: "From Bronze, 10% at Chairman" },
    ],
    steps: (c) => [
      { t: "Open Yeet through our link", d: `The sign-up button opens Yeet with code ${c} attached.` },
      { t: "Pass Level 1 KYC and deposit", d: "Yeet needs Level 1 KYC before you can deposit; each coin's minimum is shown on the deposit page.", src: "https://help.yeet.com/en/articles/12052341-deposits-withdrawals" },
      { t: "Clear 35x within 90 days", d: "Max $10 per bet or spin, sports bets don't count, and you can cancel the bonus at any time.", src: YEET_BONUS },
    ],
    rewardsTitle: "What Yeet pays back as you play",
    rewards: [
      { group: "Bonus terms", label: "Rakeback" },
      { group: "Bonus terms", label: "Reload bonuses", sub: "Daily, weekly and monthly bonuses" },
      { group: "Bonus terms", label: "Leaderboards", sub: "$50K weekly Chairman's Cup" },
      { group: "Bonus terms", label: "Perks by level", sub: "VIP tiers" },
      { group: "Bonus terms", label: "VIP levels", sub: "Level-up and tier-up bonuses" },
      { group: "Bonus terms", label: "VIP transfer", sub: "VIP Tier Match" },
    ],
    termsTitle: "Welcome bonus terms",
    terms: [
      { group: "Bonus terms", label: "Wagering" },
      { group: "Bonus terms", label: "Expiry" },
      { group: "Bonus terms", label: "Max bet" },
      { group: "Bonus terms", label: "Max cashout" },
      { group: "Bonus terms", label: "Game contribution", sub: "What counts toward wagering" },
      { group: "Compliance", label: "KYC policy", sub: "ID checks" },
    ],
    faqs: (c) => [
      { q: "What is the Yeet promo code?", a: `${c}. Our sign-up link opens Yeet with it attached.` },
      { q: "What is Yeet's welcome bonus?", a: "A 100% first deposit bonus up to $1,000. Deposit plus bonus must be wagered 35x within 90 days, so $100 + $100 needs $7,000 of wagering. Yeet says there is no maximum win or cashout on it." },
      { q: "Can I cancel the bonus?", a: "Yes. Yeet's bonus FAQ says the bonus can be cancelled at any time." },
      { q: "Do sports bets count toward the wagering?", a: "No. Sports bets don't count, and casino bets count by the game's edge (wager x edge / 0.04)." },
      ours("Yeet")(c),
    ],
    next: [
      { href: "/casinos/yeet", label: "Full Yeet review", hint: "Withdrawals, coins, licence and sportsbook, each linked to Yeet's own pages." },
      STAKE_NEXT,
      BONUSES_NEXT,
    ],
  },

  goated: {
    title: (c) => `Goated promo code ${c}: $25,000 weekly race and instant rakeback`,
    description: (c) => `Sign up at Goated with code ${c}. Goated runs no deposit bonus; it pays back through instant rakeback from Bronze, a $25,000 weekly race, a $2,500 daily race and level-up bonuses. From Goated's own pages.`,
    lead: (c) => `Goated doesn't run a welcome bonus. Sign up with code ${c} and you're in for what it pays instead: instant rakeback from Bronze ($1,000 wagered), a $25,000 weekly race and a bonus at every level.`,
    perks: [
      { t: "$25,000 weekly race", d: "Top 20 paid, $5,000 to first" },
      { t: "$2,500 daily race", d: "On Goated Originals, paid instantly" },
      { t: "Instant rakeback", d: "From Bronze, with no wagering strings" },
    ],
    steps: (c) => [
      { t: "Open Goated through our link", d: `The sign-up button opens Goated with code ${c} attached.` },
      { t: "Add your details to play", d: "Sign-up needs only an email or wallet; name, date of birth and address are needed to bet and withdraw.", src: "https://www.goated.com/" },
      { t: "Wager $1,000 to reach Bronze", d: "Instant rakeback, level-up bonuses and the weekly bonus start there.", src: GOATED_LEVELS },
    ],
    rewardsTitle: "What Goated pays you back",
    rewards: [
      { group: "Bonus terms", label: "Rakeback" },
      { group: "Bonus terms", label: "Leaderboards", sub: "Weekly and daily races" },
      { group: "Bonus terms", label: "Perks by level" },
      { group: "Bonus terms", label: "VIP levels", sub: "Level-up bonuses" },
      { group: "Bonus terms", label: "Reload bonuses", sub: "Weekly reloads" },
      { group: "Bonus terms", label: "Cashback", sub: "Lossback" },
    ],
    termsTitle: "Terms worth knowing",
    terms: [
      { group: "Bonus terms", label: "Standing offer", sub: "No welcome bonus" },
      { group: "Compliance", label: "KYC policy", sub: "Verification and deposits" },
      { group: "Compliance", label: "Licence" },
    ],
    faqs: (c) => [
      { q: "What is the Goated promo code?", a: `${c}. Our sign-up link opens Goated with it attached.` },
      { q: "Does Goated have a welcome bonus?", a: "No. Goated says it doesn't run a traditional welcome or deposit bonus, and rewards players through rakeback, races, VIP rewards and its token instead." },
      { q: "When does rakeback start?", a: "From Bronze 1, at $1,000 wagered. It is instant cashback on every bet with no wagering strings." },
      { q: "Do I have to wager my deposit before withdrawing?", a: "Yes. Goated requires 100% of each deposit to be wagered before withdrawal." },
      ours("Goated")(c),
    ],
    next: [
      { href: "/casinos/goated", label: "Full Goated review", hint: "Withdrawals, coins, licence and games, each linked to Goated's own pages." },
      { href: "/races", label: "Every casino race", hint: "Daily, weekly and monthly races and raffles, side by side." },
      BONUSES_NEXT,
    ],
  },

  betfury: {
    title: (c) => `BetFury promo code ${c}: up to 590% + 225 free spins over 3 deposits`,
    description: (c) => `Sign up at BetFury with code ${c} and claim its Welcome Pack: up to 590% in deposit bonuses plus 225 free spins across three deposits, from $5. The 40x terms, deadlines and caps, plus 10% rakeback, from BetFury's own pages.`,
    lead: (c) => `Sign up with code ${c} and BetFury's Welcome Pack spreads up to 590% in deposit bonuses and 225 free spins across your first three deposits, from $5. Each bonus has to be wagered within 14 days.`,
    perks: [
      { t: "Up to 590% + 225 free spins", d: "Across your first three deposits" },
      { t: "10% rakeback", d: "Of the house edge, for every player" },
      { t: "$20,000 Daily Battles", d: "1,000 winners every day" },
    ],
    steps: (c) => [
      { t: "Open BetFury through our link", d: `The sign-up button opens BetFury with code ${c} attached.` },
      { t: "Activate the first bonus within 7 days", d: "Each later bonus within 7 days of the previous one; deposits start at $5.", src: BETFURY_PACK },
      { t: "Wager each bonus within 14 days", d: "40x on slots and live games, BetFury Originals count 0.2, and bets are capped at $10.", src: BETFURY_TERMS },
    ],
    rewardsTitle: "What BetFury pays back as you play",
    rewards: [
      { group: "Bonus terms", label: "Rakeback" },
      { group: "Bonus terms", label: "Cashback" },
      { group: "Bonus terms", label: "Reload bonuses", sub: "Weekly and monthly bonuses" },
      { group: "Bonus terms", label: "Leaderboards", sub: "Daily Battles" },
      { group: "Bonus terms", label: "Perks by level", sub: "20 ranks" },
      { group: "Bonus terms", label: "VIP levels", sub: "VIP and Super VIP Club" },
    ],
    termsTitle: "Welcome Pack terms",
    terms: [
      { group: "Bonus terms", label: "Standing offer", sub: "The Welcome Pack" },
      { group: "Bonus terms", label: "Wagering" },
      { group: "Bonus terms", label: "Expiry" },
      { group: "Bonus terms", label: "Max bet" },
      { group: "Bonus terms", label: "Max cashout" },
      { group: "Bonus terms", label: "Game contribution", sub: "What counts toward wagering" },
    ],
    faqs: (c) => [
      { q: "What is the BetFury promo code?", a: `${c}. Our sign-up link opens BetFury with it attached.` },
      { q: "What is BetFury's Welcome Pack?", a: "Three welcome bonuses, each activated with its own deposit and each pairing a deposit match with free spins: up to 590% and 225 free spins in total. Deposits start at $5." },
      { q: "What are the wagering terms?", a: "40x on slots and live games, with BetFury Originals counting 0.2. Each bonus must be wagered within 14 days, bets are capped at $10, and free-spin winnings across the pack are capped at $550. BetFury's terms don't say whether the multiplier applies to the bonus alone or to deposit plus bonus." },
      { q: "How does the rakeback work?", a: "Every player gets 10% of the house edge back on each bet (wager x house edge x 10%), withdrawable once every 20 minutes. It expires if left unclaimed for 90 days." },
      ours("BetFury")(c),
    ],
    next: [
      { href: "/casinos/betfury", label: "Full BetFury review", hint: "Withdrawals, coins, licence and sportsbook, each linked to BetFury's own pages." },
      STAKE_NEXT,
      BONUSES_NEXT,
    ],
  },

  winna: {
    title: (c) => `Winna promo code ${c}: instant rakeback every 7 minutes and a $50K weekly race`,
    description: (c) => `Sign up at Winna with code ${c}. Winna runs no deposit bonus; it pays back through instant rakeback every 7 minutes, $10,000 daily and $50,000 weekly races, and VIP perks up to 25% lossback. From Winna's own pages.`,
    lead: (c) => `Winna has no deposit bonus to wager off. Sign up with code ${c} and its VIP rewards start at Bronze ($1,000 wagered) with instant rakeback every 7 minutes, while the daily and weekly races are open to everyone.`,
    perks: [
      { t: "Instant rakeback every 7 minutes", d: "Claimed from the VIP Center" },
      { t: "$50,000 weekly race", d: "Automatic entry, no opt-in" },
      { t: "$10,000 daily race", d: "Resets every day" },
    ],
    steps: (c) => [
      { t: "Open Winna through our link", d: `The sign-up button opens Winna with code ${c} attached.` },
      { t: "Deposit $5 or more", d: "Smaller transfers may not be credited.", src: "https://help.winna.com/en/articles/15960277-deposit-via-wallet-or-exchange" },
      { t: "Claim rakeback from the VIP Center", d: "Every 7 minutes; the percentage scales with your VIP level and wagering.", src: "https://help.winna.com/en/articles/10495172-what-is-instant-rakeback-and-how-do-i-claim-it" },
    ],
    rewardsTitle: "What Winna pays you back",
    rewards: [
      { group: "Bonus terms", label: "Rakeback" },
      { group: "Bonus terms", label: "Leaderboards", sub: "Daily and weekly races" },
      { group: "Bonus terms", label: "Perks by level" },
      { group: "Bonus terms", label: "Cashback", sub: "Lossback and the monthly bonus" },
      { group: "Bonus terms", label: "Reload bonuses", sub: "7-day reloads" },
      { group: "Bonus terms", label: "Missions", sub: "Challenges" },
    ],
    termsTitle: "Terms worth knowing",
    terms: [
      { group: "Bonus terms", label: "Deposit bonus", sub: "No deposit bonus" },
      { group: "Compliance", label: "KYC policy", sub: "Verification" },
      { group: "Compliance", label: "Licence" },
    ],
    faqs: (c) => [
      { q: "What is the Winna promo code?", a: `${c}. Our sign-up link opens Winna with it attached.` },
      { q: "Does Winna have a deposit bonus?", a: "No deposit bonus is listed: Winna's help centre covers only VIP rewards (rakeback, reloads, lossback, free spins, and monthly and quarterly bonuses)." },
      { q: "How often can I claim rakeback?", a: "Every 7 minutes, from the VIP Center. The percentage scales with your VIP level and wagering activity." },
      { q: "When does lossback start?", a: "Lossback of up to 25% of losses is available from Platinum VIP level, reviewed on request through support." },
      ours("Winna")(c),
    ],
    next: [
      { href: "/casinos/winna", label: "Full Winna review", hint: "Withdrawals, coins, licence and sportsbook, each linked to Winna's own pages." },
      { href: "/races", label: "Every casino race", hint: "Daily, weekly and monthly races and raffles, side by side." },
      BONUSES_NEXT,
    ],
  },

  thrill: {
    title: (c) => `Thrill promo code ${c}: a $50,000 weekly race and instant rakeback from day one`,
    description: (c) => `Sign up at Thrill with code ${c}: instant rakeback and weekly and monthly bonuses from the entry level, a $50,000 weekly race paying 350 places, and no deposit minimum. How to apply the code, from Thrill's own pages.`,
    lead: (c) => `Sign up with code ${c} and Thrill's rewards start at the entry Base level: instant rakeback plus weekly and monthly bonuses, and a $50,000 race every week. There's no deposit bonus, so nothing to wager off.`,
    perks: [
      { t: "Instant rakeback from Base", d: "No wagering threshold before it starts" },
      { t: "$50,000 weekly race", d: "350 places paid, $15,000 to first" },
      { t: "Weekly and monthly bonuses", d: "From the entry level" },
    ],
    steps: (c) => [
      { t: "Open Thrill through our link", d: `The sign-up button opens Thrill with code ${c} attached.` },
      { t: "Apply the code before your first deposit", d: `If it isn't on, open the account menu or page footer, choose Referral code and enter ${c}. It only works within 24 hours of signing up and before your first deposit or bet.`, src: THRILL_REF },
      { t: "Play: XP moves you up the levels", d: "Sports earns 3 XP per $1 wagered; casino games 0.5 to 1.5 XP per $1 depending on house edge.", src: THRILL_LEVELS },
    ],
    rewardsTitle: "What Thrill pays you back",
    rewards: [
      { group: "Bonus terms", label: "Rakeback" },
      { group: "Bonus terms", label: "Leaderboards", sub: "$50,000 weekly race" },
      { group: "Bonus terms", label: "VIP levels", sub: "Rewards levels" },
      { group: "Bonus terms", label: "Perks by level" },
      { group: "Bonus terms", label: "Reload bonuses", sub: "Level-up reloads" },
      { group: "Bonus terms", label: "Expiry", sub: "Weekly bonus timing" },
    ],
    termsTitle: "Terms worth knowing",
    terms: [
      { group: "Bonus terms", label: "Deposit bonus", sub: "No deposit bonus" },
      { group: "Coins & deposit limits", label: "Deposit limits" },
      { group: "Compliance", label: "Licence" },
    ],
    faqs: (c) => [
      { q: "What is the Thrill promo code?", a: `${c}. Our sign-up link opens Thrill with it attached.` },
      { q: `Where do I enter code ${c}?`, a: "Open the account menu or the page footer and choose Referral code. Thrill says a code can only be applied within 24 hours of signing up, and before your first deposit or real-money bet." },
      { q: "Does Thrill have a deposit bonus?", a: "No. Its rewards come from rakeback paid out as weekly, monthly and level-up bonuses, with no deposit bonus in its help centre." },
      { q: "When does rakeback start?", a: "From the entry Base level, so from your first bet." },
      ours("Thrill")(c),
    ],
    next: [
      { href: "/casinos/thrill", label: "Full Thrill review", hint: "Withdrawals, coins, licence and sportsbook, each linked to Thrill's own pages." },
      { href: "/races", label: "Every casino race", hint: "Daily, weekly and monthly races and raffles, side by side." },
      BONUSES_NEXT,
    ],
  },
};
