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

export type ReviewTier = "field-tested" | "editorial";

const FIELD_TESTED_TYPES: EntityType[] = ["casino", "wallet", "exchange"];

export function reviewTier(type: EntityType): ReviewTier {
  return FIELD_TESTED_TYPES.includes(type) ? "field-tested" : "editorial";
}

export const TIER_LABEL: Record<ReviewTier, string> = {
  "field-tested": "Field-tested",
  editorial: "Editorially assessed",
};

export const TIER_DESC: Record<ReviewTier, string> = {
  "field-tested": "Opened with real money on a funded account and measured by hand.",
  editorial: "Assessed from public sources — published paytables, RTP certificates and posted odds — not a funded account.",
};

export const TIER_TINT: Record<ReviewTier, string> = {
  "field-tested": "#00C2CC",
  editorial: "#C7A45C",
};
