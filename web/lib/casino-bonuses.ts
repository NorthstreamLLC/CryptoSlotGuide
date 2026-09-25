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
import type { Operator } from "./types";

export function getCasinoBonuses(slug: string) {
  return siteData.casinoBonuses.find((e) => e.operatorSlug === slug)?.bonuses ?? [];
}

/**
 * Whether an operator's headline offer is a welcome bonus — paid up front
 * against a deposit and wagered before it can be withdrawn — or an
 * earn-as-you-play reward like rakeback, cashback or a race.
 *
 * Lives here rather than in a component because two different surfaces need the
 * same answer, and they were disagreeing: /bonuses split its tables on this
 * test, while the offer list headed its column "Welcome offer" for every
 * operator, which labelled Roobet's rakeback, Goated's weekly race and
 * Housebets' lossback slider as welcome offers. None of them is one.
 */
export function isWelcomeOffer(o: Operator): boolean {
  // An operator whose headline needs no deposit cannot be offering a deposit match.
  if (o.noDepositBonus) return false;
  const b = o.bonusShort ?? o.bonus;
  return (
    /\d+%\s*(sports\s*)?(bonus|match|welcome|first|on|up to)|free spins|\d\s*deposits|first deposit|deposit bonus/i.test(b) &&
    !/^(instant )?rakeback|^up to \d+% cash/i.test(b)
  );
}

/** What to call an operator's headline offer in a list that mixes both kinds. */
export const offerKind = (o: Operator): "Welcome bonus" | "Ongoing reward" => (isWelcomeOffer(o) ? "Welcome bonus" : "Ongoing reward");
