import legacy from "@/data/legacy.json";

/**
 * Articles carried over from the WordPress site at cryptoslotguide.com, kept at
 * their original URLs so nothing that ranks today is lost. Exported with
 * scripts/export-wordpress.mjs; images are local under /legacy.
 */
export interface LegacyItem {
  slug: string;
  type: "post" | "page";
  title: string;
  excerpt: string;
  date: string;
  modified: string;
  categories: { name: string; slug: string }[];
  image: string | null;
  html: string;
}

export interface LegacyCategory {
  slug: string;
  name: string;
  description: string;
  count: number;
}

const data = legacy as { items: LegacyItem[]; categories: LegacyCategory[] };

/** Slugs handled elsewhere on the new site, or not worth keeping. */
const SKIP = new Set(["home", "sample-page", "blog", "roobet-casino", "razed-casino"]);

export const LEGACY_ITEMS = data.items.filter((i) => !SKIP.has(i.slug));
export const LEGACY_CATEGORIES = data.categories.filter((c) => c.count > 0);

export const legacyBySlug = (slug: string) => LEGACY_ITEMS.find((i) => i.slug === slug) ?? null;

/** Newest first, optionally filtered to one category. */
export function legacyPosts(categorySlug?: string) {
  return LEGACY_ITEMS.filter((i) => (categorySlug ? i.categories.some((c) => c.slug === categorySlug) : true)).sort((a, b) => b.date.localeCompare(a.date));
}

export const legacyCategory = (slug: string) => LEGACY_CATEGORIES.find((c) => c.slug === slug) ?? null;

/** Rough reading time from the article HTML. */
export function readingMinutes(html: string) {
  const words = html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 220));
}
