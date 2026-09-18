import sweeps from "@/data/sweeps.json";

/**
 * US sweepstakes (social) casinos: play with Gold Coins for fun and Sweeps
 * Coins that can be redeemed for prizes. Each fact is taken from the
 * casino's own site (promotions page, sweepstakes rules, terms or help
 * centre), with the link stored beside it.
 */
export interface SweepsFact {
  label: string;
  value: string;
  url: string;
}

export interface SweepsCasino {
  slug: string;
  name: string;
  domain: string;
  /** Short welcome-offer headline, e.g. "Get 250,000 GC + $25 SC free". */
  offer: string;
  facts: SweepsFact[];
  signupUrl?: string;
  affiliate?: boolean;
  promoCode?: string;
  featured?: boolean;
  asOf?: string;
}

export const SWEEPS = sweeps as SweepsCasino[];

export const sweepsBySlug = (slug: string) => SWEEPS.find((s) => s.slug === slug) ?? null;

export const sweepsFact = (s: SweepsCasino, label: string) => s.facts.find((f) => f.label === label) ?? null;

/** Casinos in display order: featured first, then those with an affiliate link, then A-Z. */
export function sweepsSorted(): SweepsCasino[] {
  return [...SWEEPS]
    .filter((s) => s.facts.length > 0)
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || Number(!!b.affiliate) - Number(!!a.affiliate) || a.name.localeCompare(b.name));
}

/** A short cell value from a longer fact: the first dollar or SC amount, else the first clause. */
export function shortFact(f: SweepsFact | null, max = 48): string | null {
  if (!f) return null;
  const amt = f.value.match(/(?:\$\s?\d[\d,.]*|\d[\d,.]*\s?(?:SC|Sweeps Coins))/i);
  if (amt && /redemption|minimum/i.test(f.label)) return amt[0].replace(/\s+/g, " ");
  const first = f.value.split(/[.;]\s/)[0];
  return first.length > max ? first.slice(0, max - 1).replace(/\s+\S*$/, "") + "…" : first;
}
