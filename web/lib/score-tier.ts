/**
 * "Ledger score" — the site's branded name for the weighted 1-10
 * scoring model (casino/wallet/exchange/provider entity types; see
 * lib/scoring.ts's crit()). Not part of the original prototype, which
 * just called it "score" — added so the model reads as this site's
 * own product rather than a generic decimal, and so the primary
 * number a reader sees is a plain-language tier ("Excellent") instead
 * of a two-decimal figure that implies more precision than a 5.5-9.9
 * clamped score actually has. The real decimal stays as supporting
 * detail (and is still what index/vertical tables sort on) — this is
 * a display layer over the same data, not a new scoring model.
 *
 * Double meaning is deliberate for a crypto site: a ledger is both
 * "the record we keep" (this whole site's premise) and the literal
 * data structure behind every coin it covers.
 */
export const SCORE_BRAND = "Ledger score";

export type ScoreTier = "excellent" | "strong" | "good" | "fair" | "weak";

/** Score range is always 5.5-9.9 (lib/scoring.ts's crit() clamp) — five roughly-even bands across it. */
export function scoreTier(val: number): ScoreTier {
  if (val >= 9) return "excellent";
  if (val >= 8) return "strong";
  if (val >= 7) return "good";
  if (val >= 6) return "fair";
  return "weak";
}

export const SCORE_TIER_LABEL: Record<ScoreTier, string> = {
  excellent: "Excellent",
  strong: "Strong",
  good: "Good",
  fair: "Fair",
  weak: "Weak",
};

/** Reuses the site's existing traffic-light vocabulary (lib/scoring.ts's flag()) rather than inventing a new palette. */
export const SCORE_TIER_COLOR: Record<ScoreTier, string> = {
  excellent: "#00C2CC",
  strong: "#5FE3E8",
  good: "#7BE0B8",
  fair: "#D6B65C",
  weak: "#DA9877",
};
