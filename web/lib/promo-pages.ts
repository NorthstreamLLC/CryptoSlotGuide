/**
 * Casinos with their own /promo-codes/<slug> page. Anything that links to a
 * casino's code (the menu's Promo codes panel, the bonuses hub, the next-step
 * blocks) goes through promoHref so a new page is picked up everywhere at once.
 */
export const PROMO_PAGES = ["roobet", "stake", "shuffle", "gamdom", "duelbits", "rainbet", "razed", "duel", "degen", "yeet", "goated", "betfury", "winna", "thrill"];

export const hasPromoPage = (slug: string) => PROMO_PAGES.includes(slug);

export const promoHref = (slug: string) => (hasPromoPage(slug) ? `/promo-codes/${slug}` : `/casinos/${slug}`);

/**
 * How the /promo-codes hub sorts each code, and the one line it shows: "perk"
 * when the code itself unlocks something, "welcome" when the casino runs a
 * welcome bonus, "rewards" when it pays rakeback and races instead. Each line
 * restates its promo page, where the sources are.
 */
export type PromoKind = "perk" | "welcome" | "rewards";

export const PROMO_HUB: Record<string, { kind: PromoKind; line: string }> = {
  roobet: { kind: "perk", line: "20% up to $500 + up to 600 free spins, claimed through CasinoPerks" },
  stake: { kind: "perk", line: "3.5% rakeback from your first bet, instead of after $10,000 wagered" },
  gamdom: { kind: "perk", line: "Instant rakeback boosted to 15% for your first 7 days" },
  razed: { kind: "welcome", line: "100% up to $300 + up to 150 free spins" },
  degen: { kind: "rewards", line: "3% rakeback boost for 24 hours, then 3-8% rakeback + a $25,000 weekly race" },
  yeet: { kind: "welcome", line: "100% up to $1,000 with no cashout cap" },
  betfury: { kind: "welcome", line: "Up to 590% + 225 free spins over 3 deposits" },
  rainbet: { kind: "welcome", line: "First deposit bonus (40x), plus a $1M monthly race" },
  shuffle: { kind: "rewards", line: "5% rakeback from Bronze + a $100,000 weekly race" },
  duelbits: { kind: "rewards", line: "25% rakeback, paid instant to monthly" },
  duel: { kind: "rewards", line: "50% instant rakeback on slots + a $3M monthly race" },
  goated: { kind: "welcome", line: "100% first deposit up to $1,000 + a $25,000 weekly race" },
  winna: { kind: "rewards", line: "Rakeback every 7 minutes + a $50,000 weekly race" },
  thrill: { kind: "rewards", line: "Instant rakeback from your first bet + a $50,000 weekly race" },
};
