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
  if (o.noDepositBonus) return { kind: "none", mult: null, label: "No deposit bonus" };
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
