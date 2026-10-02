import catalogue from "@/data/gameCatalogue.json";
import { siteData } from "./site-data";
import { STUDIOS } from "./studios";

/**
 * Every studio's page on this site, resolved from its name.
 *
 * Three kinds of studio page share /providers/[slug]: the 24 written-up
 * profiles (providers.json), the licence-map entries (studios.json), and —
 * for the other studios in the slot catalogue — a profile built from the
 * catalogue alone. Before this, a studio name linked to its page only where
 * the catalogue row happened to carry a providerSlug, which six studios did:
 * 7,283 of 8,721 slots named a studio that went nowhere, Play'n GO's 480
 * among them although its written-up profile existed.
 *
 * Matched on a normalised name, so "Play'n GO" and "Play’n GO" are one
 * studio. A written-up or licence-map page wins; a catalogue studio gets a
 * slug of its own, kept clear of any existing one.
 */
const key = (s: string) => s.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]/g, "");
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Name keys of studios with a written-up or licence-map page, to that page's slug. */
const PROFILED = new Map<string, string>();
for (const p of siteData.providers) PROFILED.set(key(p.name), p.slug);
for (const s of STUDIOS) if (!PROFILED.has(key(s.name))) PROFILED.set(key(s.name), s.slug);
// Names that differ between the catalogue and our profiles.
const ALIASES: Record<string, string> = { evolutiongaming: "evolution" };
for (const [from, to] of Object.entries(ALIASES)) if (!PROFILED.has(from) && PROFILED.has(to)) PROFILED.set(from, PROFILED.get(to) as string);

export interface CatalogueStudio {
  name: string;
  slug: string;
  titles: number;
}

/** Catalogue studios, each with the slug its page lives at, biggest first. */
const CATALOGUE_STUDIOS: CatalogueStudio[] = (() => {
  const count = new Map<string, { name: string; n: number }>();
  for (const g of (catalogue as { games: { kind: string; provider: string | null }[] }).games) {
    if (g.kind !== "slot" || !g.provider) continue;
    const k = key(g.provider);
    const cur = count.get(k);
    if (cur) cur.n++;
    else count.set(k, { name: g.provider, n: 1 });
  }
  const taken = new Set(PROFILED.values());
  const out: CatalogueStudio[] = [];
  for (const [k, { name, n }] of count) {
    let slug = PROFILED.get(k);
    if (!slug) {
      slug = slugify(name);
      if (taken.has(slug)) slug = `${slug}-studio`;
      taken.add(slug);
    }
    out.push({ name, slug, titles: n });
  }
  return out.sort((a, b) => b.titles - a.titles || a.name.localeCompare(b.name));
})();

const BY_KEY = new Map(CATALOGUE_STUDIOS.map((s) => [key(s.name), s]));
const BY_SLUG = new Map(CATALOGUE_STUDIOS.map((s) => [s.slug, s]));

/** The page for a studio name, or null for a name nothing on the site covers. */
export function studioHref(name: string | null | undefined): string | null {
  if (!name) return null;
  const k = key(name);
  const slug = PROFILED.get(k) ?? BY_KEY.get(k)?.slug;
  return slug ? `/providers/${slug}` : null;
}

/** Every studio in the catalogue, with its page and slot count. */
export const catalogueStudios = (): CatalogueStudio[] => CATALOGUE_STUDIOS;

/**
 * The catalogue studio behind a slug that has no written-up or licence-map
 * page — the studios this route renders from the catalogue alone.
 */
export function catalogueOnlyStudio(slug: string): CatalogueStudio | null {
  const s = BY_SLUG.get(slug);
  if (!s) return null;
  return PROFILED.get(key(s.name)) ? null : s;
}
