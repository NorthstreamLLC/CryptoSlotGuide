/**
 * How a casino's bonus wagering is shown anywhere on the site. The
 * multiplier in ops.json is only displayed when the operator's own bonus
 * terms are cited in the spec sheet ("Bonus terms" › "Wagering"). Casinos
 * that confirm they run no deposit bonus say so instead, and bonuses that
 * unlock gradually show the operator's own unlock rule (ops.wagerNote).
 */
import { getSpecFact } from "./spec-sheet";
import type { Operator } from "./types";

export type WagerView =
  | { kind: "cited"; mult: number; label: string }
  | { kind: "none" | "note" | "unknown"; mult: null; label: string };

export function wagerView(o: Operator): WagerView {
  if (o.noDepositBonus) {
    // An operator with no deposit BONUS can still require a playthrough on the
    // deposit itself, usually as an anti-money-laundering rule. Roobet's own
    // terms: "No multiplier stated for rakeback; deposits must be wagered 100%
    // before withdrawal." Returning "No wagering" there hid a condition the
    // player actually hits, so a cited multiplier that names deposits is shown
    // with what it applies to.
    const f = getSpecFact(o.slug, "Bonus terms", "Wagering");
    // A 1x playthrough on the DEPOSIT is an anti-money-laundering rule, not a
    // bonus condition: 11 of the 33 operators whose wagering term we cite have
    // one, so it is a category norm rather than a catch specific to this
    // operator. The figure that decides whether an offer is worth taking is the
    // multiple on the BONUS, and where the cited term says there is none, that
    // is what the card shows. The full sentence, AML rule included, is on the
    // profile — this shortens the summary, it does not drop the term.
    const depositOnly = f?.value && /no multiplier stated|no wagering/i.test(f.value);
    if (depositOnly) return { kind: "cited", mult: 0, label: "None on rewards" };
    if (f?.value && typeof o.wager === "number" && o.wager > 1 && /deposit/i.test(f.value)) {
      return { kind: "cited", mult: o.wager, label: `${o.wager}× on deposits` };
    }
    return { kind: "none", mult: null, label: "No deposit bonus" };
  }
  if (o.wagerNote) return { kind: "note", mult: null, label: o.wagerNote };
  if (getSpecFact(o.slug, "Bonus terms", "Wagering")) return { kind: "cited", mult: o.wager, label: o.wager === 0 ? "No wagering" : `${o.wager}×${o.wagerBasis ? ` ${o.wagerBasis}` : ""}` };
  return { kind: "unknown", mult: null, label: "Not stated" };
}

/** The headline bonus with its wagering alongside, e.g. "100% deposit bonus (30×)". */
export function bonusWithWager(o: Operator): string {
  const w = wagerView(o);
  if (w.kind === "none") return "No deposit bonus";
  const tail = w.kind === "cited" ? (w.mult === 0 ? "no wagering" : w.label) : w.kind === "note" ? w.label : "wagering not stated";
  if (!o.bonusShort) return w.kind === "cited" ? `${w.label} wagering` : w.kind === "note" ? w.label : "Not stated";
  return `${o.bonusShort} (${tail})`;
}

/** Sorts cited multipliers low to high; everything else goes last, by name. */
export function compareWager(a: Operator, b: Operator): number {
  const x = wagerView(a).mult, y = wagerView(b).mult;
  if (x === null && y === null) return a.name.localeCompare(b.name);
  if (x === null) return 1;
  if (y === null) return -1;
  return x - y || a.name.localeCompare(b.name);
}
