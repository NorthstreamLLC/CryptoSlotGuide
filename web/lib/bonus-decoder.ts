export type Basis = "unknown" | "bonus" | "deposit-bonus";
export function amount(value: string): number | null {
  if (!value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}
export function decode(input: { bonus: string; deposit: string; multiplier: string; contribution: string; basis: Basis }) {
  const bonus = amount(input.bonus), deposit = amount(input.deposit), multiplier = amount(input.multiplier), contribution = amount(input.contribution);
  const base = input.basis === "bonus" ? bonus : input.basis === "deposit-bonus" && bonus !== null && deposit !== null ? bonus + deposit : null;
  const raw = base !== null && multiplier !== null ? base * multiplier : null;
  const required = raw !== null && Number.isFinite(raw) ? raw : null;
  const adjusted = required !== null && contribution !== null && contribution > 0 && contribution <= 100 ? required / (contribution / 100) : null;
  return { base, required, adjusted: adjusted !== null && Number.isFinite(adjusted) ? adjusted : null };
}

/** Preserve visibility of positive crypto amounts below eight decimal places. */
export function formatAmount(value: number | null, currency: string): string {
  if (value === null) return "Unknown";
  const displayed = value > 0 && value < 0.00000001
    ? value.toExponential(6)
    : value.toLocaleString("en-US", { maximumFractionDigits: 8 });
  return `${displayed} ${currency}`;
}
