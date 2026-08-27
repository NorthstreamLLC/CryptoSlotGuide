/**
 * Review-methodology tiering. Not part of the original prototype (which
 * makes one blanket "tested on a funded account" claim for every entity
 * type) — added because that claim isn't true at this catalogue's scale
 * for a small operation, and publishing it as if it were is a real
 * liability in this niche, not just imprecise copy.
 *
 * Casinos, wallets and exchanges are entities we can actually fund and
 * operate by hand (a wallet is just software; an exchange account and a
 * casino account are both things one operator can realistically open and
 * test). Slots, providers and markets (sportsbooks/esports) are assessed
 * from public sources instead — published paytables, provider RTP
 * certificates, posted odds — which is a real and disclosable basis, just
 * a different one. See app/how-we-rate/page.tsx for the reader-facing
 * explanation this badge links back to.
 */
import type { EntityType } from "./entity-view";
import { isFieldTestedOperator } from "./field-tested";

/**
 * "field-tested" and "editorial" describe the category's methodology.
 * "pending" is a third state that matters for entity pages specifically:
 * casinos/wallets/exchanges belong to the field-tested category, but a
 * *specific* one (a slug not yet in FIELD_TESTED_OPERATOR_SLUGS) hasn't
 * actually been tested — showing "Field-tested" on that page would
 * contradict its own "field-test pending" tags/byline right below it.
 * Use reviewTierFor(type, slug) on entity pages; reviewTier(type) alone
 * is for category-level copy (How We Rate) that isn't about one entity.
 */
export type ReviewTier = "field-tested" | "editorial" | "pending";

const FIELD_TESTED_TYPES: EntityType[] = ["casino", "wallet", "exchange"];

export function reviewTier(type: EntityType): "field-tested" | "editorial" {
  return FIELD_TESTED_TYPES.includes(type) ? "field-tested" : "editorial";
}

/** Per-entity tier, aware of whether this specific slug has real testing behind it yet. */
export function reviewTierFor(type: EntityType, slug: string): ReviewTier {
  const categoryTier = reviewTier(type);
  if (categoryTier === "field-tested" && !isFieldTestedOperator(slug)) return "pending";
  return categoryTier;
}

export const TIER_LABEL: Record<ReviewTier, string> = {
  "field-tested": "Field-tested",
  editorial: "Editorially assessed",
  pending: "Field-test pending",
};

export const TIER_DESC: Record<ReviewTier, string> = {
  "field-tested": "Opened with real money on a funded account and measured by hand.",
  editorial: "Assessed from public sources — published paytables, RTP certificates and posted odds — not a funded account.",
  pending: "This category is field-tested by opening a real account, but this specific entity hasn't been checked yet — figures below are published, not verified.",
};

export const TIER_TINT: Record<ReviewTier, string> = {
  "field-tested": "#00C2CC",
  editorial: "#C7A45C",
  pending: "#5C6A72",
};
