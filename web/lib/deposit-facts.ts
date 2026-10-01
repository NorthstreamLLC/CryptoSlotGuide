import { siteData } from "./site-data";
import { getSpecFact } from "./spec-sheet";

/**
 * Deposit figures a guide can quote without a writer having to remember them.
 *
 * Counted from the operators' own cited "Minimum deposit" facts rather than
 * written into the copy, so re-reading a terms page updates the sentence
 * instead of leaving a stale number in it — the same reason the KYC counts
 * go through fill().
 */
export function depositCounts() {
  const stated = siteData.ops
    .map((o) => getSpecFact(o.slug, "Coins & deposit limits", "Minimum deposit")?.value ?? "")
    .filter(Boolean);
  return {
    /** Operators whose own terms state no crypto minimum at all. */
    noMinimum: stated.filter((v) => /no minimum|no min\b/i.test(v)).length,
    /** Operators that state a minimum either way. */
    minimumStated: stated.length,
  };
}
