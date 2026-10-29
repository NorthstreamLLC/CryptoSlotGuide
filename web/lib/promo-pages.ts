/**
 * Casinos with their own /promo-codes/<slug> page. Anything that links to a
 * casino's code (the menu's Promo codes panel, the bonuses hub, the next-step
 * blocks) goes through promoHref so a new page is picked up everywhere at once.
 */
export const PROMO_PAGES = ["roobet", "stake", "shuffle"];

export const hasPromoPage = (slug: string) => PROMO_PAGES.includes(slug);

export const promoHref = (slug: string) => (hasPromoPage(slug) ? `/promo-codes/${slug}` : `/casinos/${slug}`);
