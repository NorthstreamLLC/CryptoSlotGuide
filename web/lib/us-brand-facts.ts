import data from "@/data/us-brand-facts.json";

export interface BrandFact {
  label: string;
  value: string;
  sourceUrl: string;
}
export interface BrandFactGroup {
  title: string;
  facts: BrandFact[];
}
export interface BrandFacts {
  read: string;
  /** One line for the hero: the standing new-player offer in plain words. Absent where the brand's pages state none we can read. */
  offer?: string;
  groups: BrandFactGroup[];
}

/**
 * What a brand says about itself on its own pages — the offer, who can play,
 * how to sign up, the library — read on the date given. Null for a brand we
 * have not read yet; its profile then shows the regulators' lists alone,
 * which is still a page, just a thinner one.
 */
export function brandFactsFor(slug: string): BrandFacts | null {
  return (data as { brands: Record<string, BrandFacts> }).brands[slug] ?? null;
}
