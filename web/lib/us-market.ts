import data from "@/data/us-market.json";

/**
 * Who is licensed to take bets in each US state, and what the legislature is
 * doing about it — gathered from each state regulator's own licensee list and
 * each legislature's own bill pages, never from a review site.
 *
 * Kept apart from legal-us.json on purpose. That file holds legal status, which
 * changes rarely. This holds operator lists and live bills, which go stale fast:
 * books launch and withdraw per state constantly, and a bill's status can move
 * in a week. Separating them makes it obvious which half needs re-checking.
 */

export interface Operator {
  /** The consumer-facing name, as the regulator publishes it. */
  brand: string;
  /**
   * The entity the licence sits with. Worth knowing that this means different
   * things state to state — a sports franchise in Arizona, a casino property in
   * Colorado, a tribe or the lottery in Connecticut, a corporate entity in DC —
   * so it is shown as the state's own wording rather than normalised away.
   */
  licenseHolder: string | null;
}

export interface OperatorList {
  operators: Operator[];
  sourceUrl: string | null;
  asOf: string | null;
  note: string | null;
}

export interface Bill {
  topic: string;
  bill: string;
  /** The legislature's own status wording, not a paraphrase. */
  status: string;
  lastAction: string | null;
  sourceUrl: string | null;
  note: string | null;
}

export interface StateMarket {
  code: string;
  /** Why the state is the way it is — the constitutional article, compact or statute behind it. */
  why: string | null;
  sportsbooks: OperatorList | null;
  casinos: OperatorList | null;
  pending: Bill[];
}

const MARKET = data as StateMarket[];

export const marketFor = (code: string): StateMarket | null => MARKET.find((s) => s.code === code.toUpperCase()) ?? null;

/** Bills that would open a state up, newest action first. */
export function billsFor(code: string): Bill[] {
  return (marketFor(code)?.pending ?? []).slice().sort((a, b) => (b.lastAction ?? "").localeCompare(a.lastAction ?? ""));
}

/**
 * A bill's direction of travel, from the legislature's own status wording.
 * Deliberately conservative: anything that isn't clearly dead or clearly
 * advanced is "filed", because guessing momentum is how you end up publishing
 * a prediction as a fact.
 */
export function billTone(status: string): { label: string; tone: "dead" | "moving" | "filed" } {
  const s = status.toLowerCase();
  if (/died|lost|postponed|withdrawn|lapsed|study order|recommended for study|deferred to the 41st/.test(s)) return { label: "Dead", tone: "dead" };
  if (/passed|favorably reported|third reading|engrossed|under council review/.test(s)) return { label: "Advanced", tone: "moving" };
  return { label: "Filed", tone: "filed" };
}

export const TONE_COLOR: Record<"dead" | "moving" | "filed", string> = {
  dead: "#C4653A",
  moving: "#2FB67A",
  filed: "#C7A45C",
};

/** Totals for the US map page, so the copy never hardcodes a number that drifts. */
export function marketTotals() {
  const books = MARKET.reduce((n, s) => n + (s.sportsbooks?.operators.length ?? 0), 0);
  const casinos = MARKET.reduce((n, s) => n + (s.casinos?.operators.length ?? 0), 0);
  const bills = MARKET.reduce((n, s) => n + s.pending.length, 0);
  return {
    books,
    casinos,
    bills,
    statesWithBooks: MARKET.filter((s) => s.sportsbooks).length,
    statesWithCasinos: MARKET.filter((s) => s.casinos?.operators.length).length,
    statesWithBills: MARKET.filter((s) => s.pending.length).length,
  };
}
