/**
 * Review-methodology tiering. Not part of the original prototype (which
 * makes one blanket "tested on a funded account" claim for every entity
 * type) — added because that claim isn't true at this catalogue's scale
 * for a small operation, and publishing it as if it were is a real
 * liability in this niche, not just imprecise copy.
 *
 * Three real tiers, not two — the original two-tier split (casinos/
 * wallets/exchanges = field-tested category, everything else =
 * editorial) turned out to be the wrong cut. The real split is per
 * *criterion*, not per entity type: a casino's bonus terms, coin
 * support and licence are all public documents (editorial, no account
 * needed), its payout speed and support responsiveness are best
 * sourced from aggregated public reviews unless we've personally timed
 * it (community-reported), and only the specific per-operator RTP
 * build is something no public source discloses at all (field-tested,
 * via RTP Watch). See data/criteria.json's `sourcing` field and
 * app/how-we-rate/page.tsx for the reader-facing breakdown per
 * criterion, not just per page.
 */
import type { EntityType } from "./entity-view";
import { isFieldTestedOperator } from "./field-tested";

/**
 * "pending" is a fourth state that matters for entity pages
 * specifically: casinos/wallets/exchanges belong to the field-tested
 * category, but a *specific* one (a slug not yet in
 * FIELD_TESTED_OPERATOR_SLUGS) hasn't actually been tested — showing
 * "Field-tested" on that page would contradict its own "field-test
 * pending" tags/byline right below it. Use reviewTierFor(type, slug) on
 * entity pages; reviewTier(type) alone is for category-level copy (How
 * We Rate) that isn't about one entity.
 */
export type ReviewTier = "field-tested" | "community-reported" | "editorial" | "pending";

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
  "community-reported": "Community-reported",
  editorial: "Editorially assessed",
  pending: "Field-test pending",
};

export const TIER_DESC: Record<ReviewTier, string> = {
  "field-tested": "Opened with real money on a funded account and measured by hand.",
  "community-reported": "Aggregated from public review sites (AskGamblers, Casino.Guru, Trustpilot) and cited — not personally measured.",
  editorial: "Read from the operator's own public pages and public registries — no account needed.",
  pending: "This category is field-tested by opening a real account, but this specific entity hasn't been checked yet — figures below are published, not verified.",
};

export const TIER_TINT: Record<ReviewTier, string> = {
  "field-tested": "#00C2CC",
  "community-reported": "#9B8FC4",
  editorial: "#C7A45C",
  pending: "#5C6A72",
};
