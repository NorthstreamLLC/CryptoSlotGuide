/**
 * Per-operator sourcing for each casino criterion row on a review page.
 *
 * data/criteria.json says how a criterion is sourced *when it has been
 * checked*. Showing that label on every casino regardless was a real
 * overclaim: all 47 pages read "Editorially assessed" for licensing and
 * bonus terms though only a handful had been desk-checked, and "Community-
 * reported" for payout speed though no community citations exist. This
 * resolves the label from what's actually on file for that operator, and
 * falls back to "unchecked" rather than borrowing the category's method.
 */
import { siteData } from "./site-data";
import { isEditoriallyAudited, isFieldTestedOperator } from "./field-tested";
import { getSpecFact } from "./spec-sheet";
import { isStaleReading } from "./derived";
import type { ReviewTier } from "./review-tier";

const CRITERION_BASE = new Map(siteData.criteria.map((c) => [c.name, c.sourcing]));

function hasFact(slug: string, group: string, label: string) {
  return Boolean(getSpecFact(slug, group, label));
}

export function criterionSourcing(name: string, slug: string): ReviewTier | undefined {
  const base = CRITERION_BASE.get(name);
  if (!base) return undefined;
  const fieldTested = isFieldTestedOperator(slug);
  const audited = isEditoriallyAudited(slug);

  switch (name) {
    case "Payout speed":
      if (fieldTested) return "field-tested";
      return hasFact(slug, "Payouts & fees", "Stated withdrawal time") ? "editorial" : "unchecked";
    case "Bonus fairness":
      return audited || hasFact(slug, "Bonus terms", "Wagering") ? "editorial" : "unchecked";
    case "Crypto support":
      return audited || hasFact(slug, "Payouts & fees", "Withdrawal fees") ? "editorial" : "unchecked";
    case "Trust & licensing":
      return audited || hasFact(slug, "Compliance", "Licence") ? "editorial" : "unchecked";
    case "Game & RTP quality":
      return siteData.rtpWatch.some((r) => r.operatorSlug === slug && !isStaleReading(r.checkedAt)) ? "field-tested" : "unchecked";
    case "Support":
      return fieldTested ? "field-tested" : "unchecked";
    default:
      return base;
  }
}
