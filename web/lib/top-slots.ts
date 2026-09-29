/**
 * The site's top slots, in the order we stand behind them.
 *
 * Hand-picked, not derived. The menu used to fill its "slots worth reading"
 * column by sorting the review set on published RTP, which is a factual sort
 * and a terrible recommendation — it surfaced a 2017 game nobody plays. This
 * list is an editorial call, so it lives in one place, ordered, and every
 * surface that shows "our top slots" reads it from here.
 *
 * Order is the order given. It is not RTP, release date or max win, and
 * nothing re-sorts it.
 *
 * Every entry gets a page: six already had hand-written reviews, one had a
 * catalogue page, and the remaining six are published through the editorial
 * route in lib/slot-page.ts. A top list that links a third of itself nowhere
 * is worse than no list.
 */
export const TOP_SLOTS: string[] = [
  "wanted-dead-or-a-wild",
  "gates-of-olympus-2500",
  "big-bass-bonanza-1000",
  "dork-unit",
  "retro-sweets",
  "sweet-bonanza-1000",
  "le-bandit",
  "5-lions-megaways",
  "big-bamboo",
  "duck-hunters-2",
  "sugar-rush-1000",
  "outsourced",
  "duel-at-dawn",
];

const RANK = new Map(TOP_SLOTS.map((slug, i) => [slug, i]));

export const isTopSlot = (slug: string): boolean => RANK.has(slug);

/** Position in the list, or Infinity — so a non-pick sorts after every pick. */
export const topSlotRank = (slug: string): number => RANK.get(slug) ?? Infinity;
