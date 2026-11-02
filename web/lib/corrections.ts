/**
 * The public log at /corrections: what was wrong on the site, what it says now,
 * and when it was fixed. Newest first. Add an entry whenever a fix changes a
 * claim a reader could have acted on, not for typos or styling.
 */
export type Correction = { date: string; page: string; href: string; wrong: string; fixed: string };

export const CORRECTIONS: Correction[] = [
  {
    date: "2026-11-02",
    page: "Three older guides",
    href: "/blog",
    wrong: "Three articles carried betting copy about a Call of Duty league under unrelated casino titles: \"Anonymous Crypto Gambling\", \"Crypto Casino Withdrawal Times\" and \"Best Crypto Casino Welcome Bonuses in 2026: What to Actually Look For\".",
    fixed: "The articles were removed, and their addresses now redirect to our no-KYC casino list, our crypto withdrawals guide and our 2026 welcome bonuses guide.",
  },
  {
    date: "2026-11-02",
    page: "Roobet review and fees",
    href: "/casinos/roobet",
    wrong: "On 29 October we removed Roobet's 2% fee on fiat withdrawals after its help centre said it charged no withdrawal fees.",
    fixed: "Roobet's Terms of Service still set a 1% fee on fiat deposits and a 2% fee from the 10th fiat withdrawal in 30 days. Both are back on the page, with the terms as the source.",
  },
  {
    date: "2026-10-29",
    page: "Stake review: licence register",
    href: "/casinos/stake",
    wrong: "We said Stake's company number on the Curaçao licence register didn't match the one in its footer. We had read the row below Stake's operator on the register.",
    fixed: "Medium Rare N.V. holds licence OGL/2024/1451/0918 with company number 145353, the same as Stake's footer. The licence status, \"Assessment in progress\", is unchanged.",
  },
  {
    date: "2026-10-29",
    page: "Degen promo code",
    href: "/promo-codes/degen",
    wrong: "We said signing up with code SLOTGUIDE unlocked Degen's 100% first deposit bonus up to $1,500.",
    fixed: "Degen ties that bonus to eligible referral codes, and an account we opened with SLOTGUIDE wasn't offered it. The page now leads with the 3% rakeback boost that account did get, and says the bonus needs a different code.",
  },
];
