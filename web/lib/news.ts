/**
 * Monthly "what changed" issues at /news/<yyyy-mm>, written from the monthly
 * fact re-check when its report is applied. Each item points at the
 * spec-sheet fact it changed (group + label), which supplies the source link
 * and date, so an item can't cite something the records don't hold.
 *
 * After adding an issue, build its newsletter email with
 * `npx tsx --tsconfig tsconfig.json scripts/news-email.ts <yyyy-mm>`
 * (writes docs/email-news-<yyyy-mm>.html, ready for a SendGrid single send).
 */
export type NewsKind = "offer" | "terms" | "fees" | "licence" | "security";

export type NewsItem = {
  slug: string;
  kind: NewsKind;
  headline: string;
  /** What our records said before, where there was something to compare. */
  before?: string;
  after: string;
  group: string;
  label: string;
};

export type NewsIssue = {
  month: string; // yyyy-mm
  title: string;
  intro: string;
  published: string;
  items: NewsItem[];
};

export const NEWS_KIND: Record<NewsKind, { label: string; tint: string }> = {
  offer: { label: "Offer", tint: "#FFC531" },
  terms: { label: "Terms", tint: "#5FE3E8" },
  fees: { label: "Fees", tint: "#FF7EB6" },
  licence: { label: "Licence", tint: "#9AAE5E" },
  security: { label: "Security", tint: "#FF6B6B" },
};

export const NEWS: NewsIssue[] = [
  {
    month: "2026-11",
    title: "What changed at crypto casinos: November 2026",
    intro: "A new welcome bonus at Goated, a security scare at Gamdom, fiat fees in Roobet's terms and a fresh Curaçao licence register. Everything our end-of-October and 1 November checks found, each with the casino's own source.",
    published: "2026-11-02",
    items: [
      {
        slug: "goated",
        kind: "offer",
        headline: "Goated launches a 100% first deposit bonus up to $1,000",
        before: "Goated said it didn't run a traditional welcome or deposit bonus, rewarding players through rakeback, races and VIP perks instead.",
        after: "New players get a 100% match on the first deposit up to $1,000, from $20, with 35x wagering on deposit plus bonus and a $10 max bet. VIP rewards and affiliate commission are halved while it's active.",
        group: "Bonus terms",
        label: "Standing offer",
      },
      {
        slug: "gamdom",
        kind: "security",
        headline: "Gamdom went offline after a security scare",
        after: "In October Gamdom took all of its systems offline after finding an unauthorised connection on one of its automation servers. It said user funds were safe and has since announced it is back online.",
        group: "Compliance",
        label: "Security incident",
      },
      {
        slug: "roobet",
        kind: "fees",
        headline: "Roobet's terms charge 1% on fiat deposits and 2% from the 10th fiat withdrawal",
        before: "Roobet's help centre says it charges no withdrawal fees beyond network fees, and our records cited a $15 minimum for card withdrawals.",
        after: "Its Terms of Service now set a 1% fee on all fiat deposits, and a 2% fee on each fiat withdrawal from the 10th in a rolling 30 days. The $15 card-withdrawal clause is gone. Crypto withdrawals still carry network fees only.",
        group: "Payouts & fees",
        label: "Withdrawal limits",
      },
      {
        slug: "stake",
        kind: "terms",
        headline: "Stake moved where you enter a referral code",
        before: "The code was entered from the account settings page.",
        after: "The code is now entered on the offers page under your account, still within 24 hours of opening it. Doing so switches on Stake's 3.5% rakeback straight away.",
        group: "Bonus terms",
        label: "Welcome offer",
      },
      {
        slug: "gamdom",
        kind: "terms",
        headline: "Gamdom now promises \"high\" withdrawal limits, not no limits",
        before: "Gamdom's getting-started guide said there were no withdrawal limits on fiat or crypto.",
        after: "The same guide now describes \"high withdrawal limits\" on fiat and crypto, without publishing a figure.",
        group: "Payouts & fees",
        label: "Withdrawal limits",
      },
      {
        slug: "gamdom",
        kind: "terms",
        headline: "Gamdom's 25% reload moved to weekly and monthly rewards",
        before: "Instant rakeback could be converted into a 7-day reload that added 25%.",
        after: "Weekly and monthly rewards can be taken as a 7-day reload that adds 25%, paid in daily portions. Instant rakeback is claimed as it is.",
        group: "Bonus terms",
        label: "Rakeback reload",
      },
      {
        slug: "rainbet",
        kind: "licence",
        headline: "Rainbet's licence now names Rain Group Ltd",
        before: "The Anjouan validator listed RBGAMING N.V. as the holder.",
        after: "The validator linked from Rainbet's footer still shows licence ALSI-152406029-FI2 as VALID, but now names the holder as Rain Group Ltd. Rainbet's terms still name RBGAMING N.V.",
        group: "Compliance",
        label: "Licence",
      },
      {
        slug: "stake",
        kind: "licence",
        headline: "Curaçao's latest register: 298 licences still \"assessment in progress\"",
        before: "The register of 20 October listed 299 of 666 licences as \"Assessment in progress\".",
        after: "On the register of 30 October it's 298. Stake, Duelbits and BetFury are among them, each past its listed expiry date, while Roobet's and Shuffle's licences are listed as \"Indefinite\", with no expiry.",
        group: "Compliance",
        label: "Register check",
      },
      {
        slug: "goated",
        kind: "terms",
        headline: "Goated takes VIP transfers from 15 casinos",
        before: "Transfers were accepted from 11 casinos, including Stake, Roobet and Shuffle.",
        after: "Chips.gg, Razed, Yeet and 500 Casino have been added, making 15. The wager targets and 30-day window are unchanged.",
        group: "Bonus terms",
        label: "VIP transfer",
      },
      {
        slug: "betfury",
        kind: "offer",
        headline: "BetFury's Sports Battles now go up to $30,000",
        before: "Sports Battles ran up to $10,000.",
        after: "Sports Battles now go up to $30,000, and VIP & High Rollers Battles up to $100,000, alongside the $20,000 Daily Battles.",
        group: "Bonus terms",
        label: "Leaderboards",
      },
    ],
  },
];

export const newsPath = (month: string) => `/news/${month}`;

/** The newest issue's items about one casino, for the note on its pages. */
export function latestNewsFor(slug: string): { issue: NewsIssue; items: NewsItem[] } | null {
  const issue = NEWS[0];
  const items = issue?.items.filter((i) => i.slug === slug) ?? [];
  return items.length ? { issue, items } : null;
}
