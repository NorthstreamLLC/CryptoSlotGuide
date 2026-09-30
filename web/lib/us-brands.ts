import brandsData from "@/data/us-brands.json";
import usMarket from "@/data/us-market.json";
import legalUs from "@/data/legal-us.json";

/**
 * US-regulated betting brands, and which state regulators list them.
 *
 * Built by inverting data/us-market.json, which already holds each state's
 * licensed-operator list with the regulator page it was read from. Nothing
 * here is a new claim: a brand is shown in a state because that state's own
 * regulator names it, and every row keeps the source URL and the date read.
 *
 * MATCHING IS BY DOMAIN FIRST. The listings are not written the same way
 * twice — Connecticut publishes plain brand names, Michigan and Pennsylvania
 * publish "Brand (domain)", and New Jersey publishes bare domains with no
 * brand name at all. Matching on names alone returns zero for every New
 * Jersey casino, which is how BetMGM first came back as licensed for casino
 * in no states when it holds three.
 */

export interface UsBrand {
  slug: string;
  name: string;
  site: string;
  aliases: string[];
  domains: string[];
  /** Where the regulator record is genuinely ambiguous, said plainly. */
  caveat?: string;
}

interface StateBlock {
  operators?: { brand?: string | null; licenseHolder?: string | null }[];
  sourceUrl?: string;
  asOf?: string;
  note?: string;
}
interface StateRow {
  code: string;
  sportsbooks?: StateBlock | null;
  casinos?: StateBlock | null;
}

export const US_BRANDS: UsBrand[] = (brandsData as { brands: UsBrand[] }).brands;
const STATES = usMarket as unknown as StateRow[];

const BY_SLUG = new Map(US_BRANDS.map((b) => [b.slug, b]));
export const usBrand = (slug: string): UsBrand | undefined => BY_SLUG.get(slug);

/** Registrable domain from anywhere in a listing string, lowercased. */
function domainsIn(text: string): string[] {
  return [...text.toLowerCase().matchAll(/([a-z0-9-]+(?:\.[a-z0-9-]+)+)/g)].map((m) => m[1]);
}

const ALIAS = new Map<string, string>();
for (const b of US_BRANDS) for (const a of b.aliases) ALIAS.set(a.trim().toLowerCase(), b.slug);

/** Which brand a regulator's listing refers to, or null to leave it alone. */
function match(listing: string): string | null {
  const found = domainsIn(listing);
  for (const b of US_BRANDS) {
    for (const d of b.domains) {
      // Suffix match on a dot boundary, so "nj.betmgm.com" hits betmgm.com
      // but "notbetmgm.com" does not.
      if (found.some((f) => f === d || f.endsWith(`.${d}`))) return b.slug;
    }
  }
  const name = listing.trim().toLowerCase();
  if (ALIAS.has(name)) return ALIAS.get(name)!;
  // "Brand (domain)" and "Brand - note": try the part before the bracket.
  const head = name.split(/\s*[(\-–]/)[0].trim();
  return ALIAS.get(head) ?? null;
}

export interface BrandStateRow {
  code: string;
  kind: "sportsbook" | "casino";
  licenseHolder: string | null;
  sourceUrl: string | null;
  asOf: string | null;
}

/** Every state listing that resolves to this brand, sportsbook and casino. */
export function statesFor(slug: string): BrandStateRow[] {
  const out: BrandStateRow[] = [];
  for (const st of STATES) {
    for (const [key, kind] of [
      ["sportsbooks", "sportsbook"],
      ["casinos", "casino"],
    ] as const) {
      const blk = st[key];
      if (!blk?.operators) continue;
      for (const op of blk.operators) {
        const listing = (op.brand ?? "").trim();
        if (!listing || match(listing) !== slug) continue;
        out.push({
          code: st.code,
          kind,
          licenseHolder: op.licenseHolder ?? null,
          sourceUrl: blk.sourceUrl ?? null,
          asOf: blk.asOf ?? null,
        });
        break; // One row per state per product, even if a brand is listed twice.
      }
    }
  }
  return out.sort((a, b) => a.kind.localeCompare(b.kind) || a.code.localeCompare(b.code));
}

export interface BrandCounts {
  sportsbook: string[];
  casino: string[];
}
export function countsFor(slug: string): BrandCounts {
  const rows = statesFor(slug);
  return {
    sportsbook: rows.filter((r) => r.kind === "sportsbook").map((r) => r.code),
    casino: rows.filter((r) => r.kind === "casino").map((r) => r.code),
  };
}

/** Brands with at least one state, widest reach first — the index order. */
export function rankedBrands(): { brand: UsBrand; counts: BrandCounts }[] {
  return US_BRANDS.map((brand) => ({ brand, counts: countsFor(brand.slug) }))
    .filter(({ counts }) => counts.sportsbook.length + counts.casino.length > 0)
    .sort(
      (a, b) =>
        b.counts.sportsbook.length + b.counts.casino.length - (a.counts.sportsbook.length + a.counts.casino.length) ||
        a.brand.name.localeCompare(b.brand.name)
    );
}

/** Listings we could not attribute — kept visible so the gap is not silent. */
export function unmatchedListings(): { listing: string; code: string; kind: string }[] {
  const out: { listing: string; code: string; kind: string }[] = [];
  for (const st of STATES) {
    for (const [key, kind] of [
      ["sportsbooks", "sportsbook"],
      ["casinos", "casino"],
    ] as const) {
      for (const op of st[key]?.operators ?? []) {
        const listing = (op.brand ?? "").trim();
        if (listing && !match(listing)) out.push({ listing, code: st.code, kind });
      }
    }
  }
  return out;
}

/**
 * States where the product is legal but no regulator publishes an operator
 * list, so no brand can be shown there however widely it operates.
 *
 * This is not a hole in our reading — it is a hole in what exists to read.
 * Nevada licenses mobile sports betting through its casino licensees but the
 * Gaming Control Board publishes no list of who runs it; Florida does not
 * licence online sportsbooks at all, because betting runs through the
 * Seminole compact; Arkansas and Wisconsin are tribal. Every brand's sports
 * count is therefore a floor, not a total, and the pages say so rather than
 * letting a number read as complete.
 *
 * Online casino has no such gap: all seven states that permit it publish a
 * list, so those counts are whole.
 */
interface LegalRow {
  code: string;
  name: string;
  sportsBetting?: string | null;
  onlineCasino?: string | null;
}
const LEGAL = legalUs as unknown as LegalRow[];

export function statesWithoutList(kind: "sportsbook" | "casino"): { code: string; name: string }[] {
  const field = kind === "sportsbook" ? "sportsBetting" : "onlineCasino";
  const want = kind === "sportsbook" ? "online" : "legal";
  const held = new Set(
    STATES.filter((s) => (kind === "sportsbook" ? s.sportsbooks : s.casinos)?.operators?.length).map((s) => s.code)
  );
  return LEGAL.filter((l) => l[field] === want && !held.has(l.code)).map((l) => ({ code: l.code, name: l.name }));
}
