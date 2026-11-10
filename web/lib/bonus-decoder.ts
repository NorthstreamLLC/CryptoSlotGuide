export type Basis = "unknown" | "bonus" | "deposit-bonus" | "deposit";
export function amount(value: string): number | null {
  if (!value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}
export function decode(input: { bonus: string; deposit: string; multiplier: string; contribution: string; basis: Basis; rtp?: string; edgeBase?: number | null }) {
  const bonus = amount(input.bonus), deposit = amount(input.deposit), multiplier = amount(input.multiplier), contribution = amount(input.contribution);
  const base = input.basis === "bonus" ? bonus : input.basis === "deposit" ? deposit : input.basis === "deposit-bonus" && bonus !== null && deposit !== null ? bonus + deposit : null;
  const raw = base !== null && multiplier !== null ? base * multiplier : null;
  const required = raw !== null && Number.isFinite(raw) ? raw : null;
  const adjusted = required !== null && contribution !== null && contribution > 0 && contribution <= 100 ? required / (contribution / 100) : null;
  const stakes = adjusted !== null && Number.isFinite(adjusted) ? adjusted : null;
  // Average cost of finishing the wagering. Where the terms count bets by house
  // edge against a baseline, that baseline sets the cost whatever the game;
  // otherwise it's the stakes times the game's house edge (100% minus RTP).
  const rtp = amount(input.rtp ?? "");
  const edge = input.edgeBase ? input.edgeBase : rtp !== null && rtp <= 100 ? 1 - rtp / 100 : null;
  const cost = input.edgeBase ? (required !== null ? required * input.edgeBase : null) : stakes !== null && edge !== null ? stakes * edge : null;
  const net = cost !== null && bonus !== null ? bonus - cost : null;
  const breakEven = !input.edgeBase && stakes && bonus !== null ? 1 - bonus / stakes : null;
  return { base, required, adjusted: stakes, cost, net, breakEven };
}

/** Preserve visibility of positive crypto amounts below eight decimal places. */
export function formatAmount(value: number | null, currency: string): string {
  if (value === null) return "Unknown";
  const displayed = value > 0 && value < 0.00000001
    ? value.toExponential(6)
    : value.toLocaleString("en-US", { maximumFractionDigits: 8 });
  return `${displayed} ${currency}`;
}
