import tiers from "@/data/kyc-tiers.json";
import { siteData } from "./site-data";
import { getSpecFact } from "./spec-sheet";

/**
 * What each operator's own KYC policy actually requires of you.
 *
 * Every crypto casino has a page about verification and almost all of them
 * read the same at a glance. They are not the same: one says it will never
 * ask, six publish a number that triggers a check, twelve make it a step you
 * complete before you can play or withdraw, and two contradict themselves
 * across their own pages. That spread is the guide.
 *
 * The tier is assigned by hand in data/kyc-tiers.json, with the reason
 * recorded per operator. A rule-based pass was tried and misfiled four
 * operators that say plainly KYC is not required, so it was thrown away — a
 * wrong compliance label on a named business is not a rounding error. The
 * policy wording and its source URL stay in the spec sheets; nothing here
 * restates them.
 */

export type KycTier = "never" | "discretionary" | "threshold" | "required" | "conflicting";

interface TierData {
  tiers: Record<string, string>;
  operators: Record<string, { tier: KycTier; why: string }>;
}
const DB = tiers as TierData;

export const KYC_TIER_LABEL: Record<KycTier, string> = {
  never: "Says it never asks",
  discretionary: "Only if asked",
  threshold: "At a published trigger",
  required: "Required to play or withdraw",
  conflicting: "Its own pages disagree",
};

/** Hardest first — the order a reader cares about, not alphabetical. */
export const KYC_TIER_ORDER: KycTier[] = ["required", "threshold", "conflicting", "discretionary", "never"];

export const kycTierOf = (slug: string): KycTier | undefined => DB.operators[slug]?.tier;
export const kycWhy = (slug: string): string | undefined => DB.operators[slug]?.why;
export const kycTierDescription = (t: KycTier): string => DB.tiers[t] ?? "";

export interface KycRow {
  slug: string;
  name: string;
  tier: KycTier;
  why: string;
  /** The operator's own wording, and the page it is on. */
  policy: string | null;
  sourceUrl: string | null;
}

export function kycRows(): KycRow[] {
  return siteData.ops
    .map((o) => {
      const t = DB.operators[o.slug];
      if (!t) return null;
      const f = getSpecFact(o.slug, "Compliance", "KYC policy");
      return {
        slug: o.slug,
        name: o.name,
        tier: t.tier,
        why: t.why,
        policy: f?.value ?? null,
        sourceUrl: f?.sourceUrl ?? null,
      };
    })
    .filter((r): r is KycRow => !!r);
}

export function kycCounts(): Record<KycTier, number> {
  const out = { never: 0, discretionary: 0, threshold: 0, required: 0, conflicting: 0 };
  for (const r of kycRows()) out[r.tier]++;
  return out;
}

/** Operators grouped by tier, in KYC_TIER_ORDER, each group name-sorted. */
export function kycByTier(): { tier: KycTier; rows: KycRow[] }[] {
  const rows = kycRows();
  return KYC_TIER_ORDER.map((tier) => ({
    tier,
    rows: rows.filter((r) => r.tier === tier).sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((g) => g.rows.length > 0);
}
