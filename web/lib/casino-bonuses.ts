/**
 * The operator's own currently-live promotions, shown as a section on
 * casino review pages — see lib/types.ts's CasinoBonus/CasinoBonusSheet
 * and components/entity/CasinoBonuses.tsx. Backed by
 * data/casinoBonuses.json, populated so far for bc-game only. Same
 * "render nothing until real data exists" discipline as
 * lib/spec-sheet.ts — an operator with no bonuses on file gets no
 * section rather than a placeholder.
 */
import { siteData } from "./site-data";

export function getCasinoBonuses(slug: string) {
  return siteData.casinoBonuses.find((e) => e.operatorSlug === slug)?.bonuses ?? [];
}
