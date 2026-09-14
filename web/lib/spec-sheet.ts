/**
 * The grouped, per-fact-sourced spec sheet shown on casino review pages
 * — see lib/types.ts's SpecFact/SpecGroup/CasinoSpecSheet and
 * components/entity/CasinoSpecSheet.tsx. Backed by
 * data/casinoSpecSheets.json, populated so far for roobet and stake only
 * (see data/README.md for why: most of "Compliance" turned out to still
 * need a FairGambling citation once actually checked, not the clean
 * editorial/FairGambling split the first mockup assumed).
 */
import { siteData } from "./site-data";
import type { SpecFact, SpecGroup } from "./types";

export function getCasinoSpecSheet(slug: string) {
  return siteData.casinoSpecSheets.find((e) => e.operatorSlug === slug);
}

/**
 * One fact by group + label — for callers that need a single value out
 * of the spec sheet (e.g. a sidebar summary) without duplicating it as
 * a second, independently-hardcoded literal that can silently drift
 * from the real, sourced figure. Prefer this over hand-typing a value
 * that's already in casinoSpecSheets.json anywhere else on the page.
 */
export function getSpecFact(slug: string, groupTitle: string, label: string) {
  const group = getCasinoSpecSheet(slug)?.groups.find((g) => g.title === groupTitle);
  return group?.facts.find((f) => f.label === label);
}

/**
 * A group's facts share one citation (shown once, in the group header)
 * only when every fact in it genuinely has the same sourcing+source —
 * true today for "Crypto & custody" (all FairGambling) but NOT for
 * "Compliance" (mixed: licence/company are editorial for roobet, the
 * rest stays FairGambling-cited). Returns null when the group is mixed,
 * meaning the caller should cite per-row instead of pretending otherwise.
 */
export function uniformGroupSourcing(group: SpecGroup): Pick<SpecFact, "sourcing" | "sourceUrl" | "asOf"> | null {
  if (group.facts.length === 0) return null;
  const [first, ...rest] = group.facts;
  const uniform = rest.every((f) => f.sourcing === first.sourcing && f.sourceUrl === first.sourceUrl && f.asOf === first.asOf);
  return uniform ? { sourcing: first.sourcing, sourceUrl: first.sourceUrl, asOf: first.asOf } : null;
}
