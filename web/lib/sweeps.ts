import sweeps from "@/data/sweeps.json";
import { inHouseOrder } from "./house-order";

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

/** Casinos in the site-wide house placement order (see lib/house-order.ts). */
export function sweepsSorted(): SweepsCasino[] {
  return inHouseOrder(SWEEPS.filter((s) => s.facts.length > 0));
}

/** A short cell value from a longer fact: the first dollar or SC amount, else the first clause. */
export function shortFact(f: SweepsFact | null, max = 48): string | null {
  if (!f) return null;
  const amt = f.value.match(/(?:\$\s?\d[\d,.]*|\d[\d,.]*\s?(?:SC|Sweeps Coins))/i);
  if (amt && /redemption|minimum/i.test(f.label)) return amt[0].replace(/\s+/g, " ");
  const first = f.value.split(/[.;]\s/)[0];
  return first.length > max ? first.slice(0, max - 1).replace(/\s+\S*$/, "") + "…" : first;
}

/**
 * The headline value for a tile: a figure a reader can take in at a glance
 * ("Every 24 hours", "1–2 business days", "1×"), not the first 44 characters
 * of a sentence cut mid-word. The full sentence is in the table below it,
 * so a fact that has no short form is left to the tile's caller to skip.
 */
export function tileValue(f: SweepsFact | null): string | null {
  if (!f) return null;
  const v = f.value;
  const L = f.label.toLowerCase();

  if (L.includes("playthrough")) {
    const x = v.match(/(\d+(?:\.\d+)?)\s*x\b/i);
    return x ? `${x[1]}×` : /no (?:playthrough|wagering)/i.test(v) ? "None" : null;
  }
  if (L.includes("redemption time") || L.includes("payout")) {
    const d = v.match(/(\d+\s*[–-]\s*\d+|\d+)\s*(business days?|days?|hours?|minutes?)/i);
    if (!d) return /instant/i.test(v) ? "Instant" : null;
    const span = d[1].replace(/\s*[–-]\s*/, "–");
    // "1-2 business days" stays plural: only a bare "1" is singular.
    const unit = d[2].toLowerCase().replace(/s$/, "");
    // "Up to 60 days" is a cap, not a typical wait — keep the qualifier.
    const qual = /\b(up to|within)\s*$/i.exec(v.slice(0, d.index))?.[1].toLowerCase();
    return `${qual ? qual[0].toUpperCase() + qual.slice(1) + " " : ""}${span} ${unit}${span === "1" ? "" : "s"}`;
  }
  if (L.includes("minimum redemption") || L.includes("minimum")) {
    const a = v.match(/\d[\d,.]*\s?(?:SC\b|Sweeps Coins|Prize Tickets|Coins\b)|\$\s?\d[\d,.]*/i);
    return a ? a[0].replace(/\s+/g, " ").replace(/Sweeps Coins/i, "SC") : null;
  }
  if (L.includes("daily bonus") || L.includes("daily")) {
    if (/every\s+(\d+)\s*hours?/i.test(v)) return `Every ${v.match(/every\s+(\d+)\s*hours?/i)![1]} hours`;
    if (/dail(?:y|ies)/i.test(v)) return "Daily";
    return null;
  }
  if (L.includes("minimum age")) {
    const a = v.match(/\d{2}\+?/);
    return a ? a[0].replace(/\+?$/, "+") : null;
  }
  const first = v.split(/[.;]\s/)[0];
  return first.length <= 30 ? first : null;
}
