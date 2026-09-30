import { siteData } from "./site-data";
import { accessIn, exceptIn, COUNTRIES, US_STATES } from "./legal";
import { caProvince, operatorsBlocking } from "./legal-canada";
import { countsFor, US_BRANDS } from "./us-brands";
import { sweepsSorted } from "./sweeps";

/**
 * What is actually open to a visitor, given where they appear to be.
 *
 * Computed on the server and returned as a summary, so the browser never
 * receives the restriction tables and the page HTML never varies by IP —
 * Googlebot and a reader in London are served identical markup, and the
 * personalisation arrives afterwards. That is deliberate: 949 pages are
 * statically generated, and geo-varying the body would both break that and
 * put us in cloaking territory.
 *
 * The premise worth stating, because it is the opposite of the intuition:
 * crypto casinos are NOT open everywhere. 41 of the 46 publish a restricted
 * list, and they name 244 countries between them. 41 refuse the United
 * States, 39 refuse the United Kingdom. For most visitors the useful answer
 * is not "here is the list" but "here is the part of the list that will have
 * you, and here is what else you can use".
 */

export interface GeoAvailability {
  country: string;
  countryName: string | null;
  /** State or province code where we recognise one, e.g. "ON", "NJ". */
  region: string | null;
  regionName: string | null;
  casinos: {
    total: number;
    accepts: number;
    restricted: number;
    /** Operators whose restricted list we cannot treat as exhaustive. */
    unknown: number;
    acceptsSlugs: string[];
    restrictedSlugs: string[];
  };
  /** Operators that take the country but name this region, e.g. Ontario. */
  regionBlocked: { slug: string; name: string }[];
  alternatives: {
    sweepstakes: number | null;
    regulatedBrands: number | null;
  };
}

const COUNTRY_NAME = new Map(COUNTRIES.map((c) => [c.code, c.name]));

/**
 * legal-world.json covers the 44 countries we have written up, and handles
 * the US through legal-us.json instead — so a US visitor came back with no
 * country name at all. Intl fills the rest: the restricted lists name 244
 * countries and we are not going to have a page for each.
 */
const REGION_NAMES = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return null;
  }
})();
function countryName(code: string): string | null {
  const ours = COUNTRY_NAME.get(code);
  if (ours) return ours;
  try {
    const n = REGION_NAMES?.of(code);
    // Intl answers an unrecognised code with the literal "Unknown Region",
    // which would render as a place name on the page.
    return n && n !== code && n !== "Unknown Region" ? n : null;
  } catch {
    return null;
  }
}
const US_NAME = new Map(US_STATES.map((s) => [s.code, s.name]));

export function availabilityFor(countryRaw: string, regionRaw?: string | null): GeoAvailability {
  const country = countryRaw.toUpperCase();
  const region = regionRaw ? regionRaw.toUpperCase() : null;
  const ops = siteData.ops;

  const accepts: string[] = [];
  const restricted: string[] = [];
  let unknown = 0;
  for (const o of ops) {
    const a = accessIn(o.slug, country);
    if (a === "restricted") restricted.push(o.slug);
    else if (a === "accepts") accepts.push(o.slug);
    else {
      // "partial" or null: the operator publishes no list, or one we cannot
      // treat as exhaustive. Counted apart rather than folded into "accepts",
      // which would tell a reader they are welcome somewhere we do not know.
      unknown++;
    }
  }

  // Region-level refusals: an operator that takes the country but names the
  // province or state. Canada is where this bites — seven operators name
  // Ontario in their own terms.
  const names = new Map(ops.map((o) => [o.slug, o.name]));
  let regionBlocked: { slug: string; name: string }[] = [];
  if (country === "CA" && region && caProvince(region)) {
    regionBlocked = operatorsBlocking(region).map((o) => ({ slug: o.slug, name: o.name }));
  } else if (region) {
    regionBlocked = ops
      .filter((o) => exceptIn(o.slug, country).some((r) => r.toUpperCase() === region || r.toUpperCase() === (US_NAME.get(region) ?? "").toUpperCase()))
      .map((o) => ({ slug: o.slug, name: names.get(o.slug) ?? o.slug }));
  }

  // What to offer instead, and only where it is genuinely an option.
  let sweepstakes: number | null = null;
  let regulatedBrands: number | null = null;
  if (country === "US") {
    const st = region ? US_STATES.find((s) => s.code === region) : undefined;
    const sweepsAllowed = !st || /allowed/i.test(st.sweepstakes ?? "");
    sweepstakes = sweepsAllowed ? sweepsSorted().length : 0;
    regulatedBrands = region
      ? US_BRANDS.filter((b) => {
          const c = countsFor(b.slug);
          return c.sportsbook.includes(region) || c.casino.includes(region);
        }).length
      : US_BRANDS.length;
  }

  return {
    country,
    countryName: countryName(country),
    region,
    regionName: region ? (country === "US" ? US_NAME.get(region) ?? null : caProvince(region)?.name ?? null) : null,
    casinos: {
      total: ops.length,
      accepts: accepts.length,
      restricted: restricted.length,
      unknown,
      acceptsSlugs: accepts,
      restrictedSlugs: restricted,
    },
    regionBlocked,
    alternatives: { sweepstakes, regulatedBrands },
  };
}
