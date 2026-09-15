/**
 * The one place that decides what withdrawal time a casino shows.
 *
 * ops.json's `payout`/`payoutLabel` ("5m 06s") came from the design
 * prototype and have no source — they must never be displayed or ranked
 * on unless we've timed that operator ourselves. Otherwise the figure is
 * the operator's own stated time, cited in casinoSpecSheets.json
 * ("Payouts & fees" → "Stated withdrawal time") and summarised on the
 * operator record as `payoutStated` / `payoutStatedMaxMins`. An operator
 * that states nothing we could find shows "Not stated" and sorts last,
 * rather than borrowing a number.
 */
import type { Operator } from "./types";
import { isFieldTestedOperator } from "./field-tested";

export interface PayoutView {
  kind: "timed" | "stated" | "none";
  /** Short display label: "4m 12s", "Instant", "5–15 min", "Not stated". */
  label: string;
  /** Minutes used for sorting/filtering — worst case of a stated range; null when nothing is known. */
  mins: number | null;
  /** Small caption explaining where the label comes from. */
  caption: string;
}

export function payoutView(o: Operator): PayoutView {
  if (isFieldTestedOperator(o.slug)) {
    return { kind: "timed", label: o.payoutLabel, mins: o.payout, caption: "timed by us" };
  }
  if (o.payoutStated) {
    return { kind: "stated", label: o.payoutStated, mins: o.payoutStatedMaxMins ?? null, caption: "operator-stated" };
  }
  return { kind: "none", label: "Not stated", mins: null, caption: "none published" };
}

/** Ascending by known minutes; operators with no stated time go last, ties broken by name. */
export function comparePayout(a: Operator, b: Operator): number {
  const pa = payoutView(a).mins;
  const pb = payoutView(b).mins;
  if (pa === null && pb === null) return a.name.localeCompare(b.name);
  if (pa === null) return 1;
  if (pb === null) return -1;
  return pa - pb || a.name.localeCompare(b.name);
}
