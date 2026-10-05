import world from "@/data/world-market.json";
import logoSources from "@/data/fiat-logo-sources.json";
import { countryBy } from "./legal";
import { flagSrc } from "./flags";
import type { CountryMarket, WorldOperatorList } from "./world-market";

/**
 * The licensed (fiat) side of the site: every site a regulator lists, per
 * market, with its logo and a link to the site itself.
 *
 * Built from data/world-market.json, which holds each regulator's register
 * as read (scripts/fetch-world-licences.mjs). Registers name things
 * differently — Germany and Spain list domains, Ontario and Portugal list
 * brands, Denmark lists a company with its domains, Sweden lists holders and,
 * separately, the web addresses under each licence type — so this flattens
 * them to one shape: one row per site, keyed by its domain, carrying the
 * licence holder and the products it is licensed for where the register says.
 *
 * Nothing here is ranked. The order is alphabetical; a ranked list would need
 * terms we have not sourced for these brands.
 */
export type FiatProduct = "casino" | "sports";

export interface FiatSite {
  /** Bare hostname, e.g. "betsson.dk". The site's identity here. */
  domain: string;
  /** The brand as the register gives it, or the domain where the register lists only domains. */
  name: string;
  /** The company holding the licence, as the register names it. */
  holder: string | null;
  /** What the register says the licence covers; empty when it does not say. */
  products: FiatProduct[];
  /** The site's own icon, fetched from its own pages, or null. */
  logo: string | null;
}

export interface FiatMarket {
  /** Our country code, e.g. "DE", "CA-ON". */
  code: string;
  /** URL slug, e.g. "de", "ca-on". */
  slug: string;
  name: string;
  flag: string | null;
  regulator: string;
  why: string;
  /** The register page(s) the lists were read from. */
  sources: { label: string; url: string; asOf: string }[];
  sites: FiatSite[];
  /** Register rows that name no web address (a holder with no site on the register). */
  holdersWithoutSite: string[];
}

const DATA = world as unknown as { countries: Record<string, CountryMarket> };
const LOGOS = (logoSources as { logos: Record<string, { file: string }> }).logos;

const host = (d: string) =>
  d
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");

export const fiatLogo = (domain: string): string | null => (LOGOS[domain]?.file ? `/assets/logos/fiat/${LOGOS[domain].file}` : null);

/** Whether a register's "brand" is really just a domain (Germany, Spain, Italy…). */
const isDomain = (s: string) => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(s.trim());

function marketOf(code: string, m: CountryMarket): FiatMarket {
  const bySite = new Map<string, FiatSite>();
  const holdersWithoutSite: string[] = [];
  const add = (domain: string, name: string, holder: string | null, product: FiatProduct | null) => {
    const d = host(domain);
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(d)) return;
    const cur = bySite.get(d);
    if (cur) {
      if (product && !cur.products.includes(product)) cur.products.push(product);
      if (!cur.holder && holder) cur.holder = holder;
      if (isDomain(cur.name) && !isDomain(name)) cur.name = name;
      return;
    }
    bySite.set(d, { domain: d, name, holder, products: product ? [product] : [], logo: fiatLogo(d) });
  };
  const lists: [WorldOperatorList | undefined, FiatProduct | null][] = [
    [m.casinos, "casino"],
    [m.sportsbooks, "sports"],
    [m.operators, null],
  ];
  for (const [l, product] of lists) {
    if (!l) continue;
    for (const o of l.operators) {
      const doms = o.domains ?? [];
      if (!doms.length) {
        holdersWithoutSite.push(o.licenseHolder ?? o.brand);
        continue;
      }
      // One domain: the register's brand names it. Several: each domain is
      // its own site and the row's name is the company behind them.
      if (doms.length === 1) add(doms[0], isDomain(o.brand) ? host(o.brand) : o.brand, o.licenseHolder ?? null, product);
      else for (const d of doms) add(d, host(d), o.licenseHolder ?? o.brand, product);
    }
    // Sweden: the web addresses under the licence type, not tied to a holder.
    for (const d of l.domains ?? []) add(d, host(d), null, product);
  }
  const c = countryBy(code);
  const sources = [m.casinos, m.sportsbooks, m.operators]
    .filter((l): l is WorldOperatorList => !!l)
    .map((l) => ({ label: m.regulator, url: l.sourceUrl, asOf: l.asOf }))
    .filter((s, i, a) => a.findIndex((x) => x.url === s.url) === i);
  return {
    code,
    slug: code.toLowerCase(),
    name: code === "CA-ON" ? "Ontario" : code === "AR" ? "Buenos Aires province" : c?.name ?? code,
    flag: flagSrc(code.split("-")[0]),
    regulator: m.regulator,
    why: m.why,
    sources,
    sites: [...bySite.values()].sort((a, b) => a.name.localeCompare(b.name)),
    holdersWithoutSite: [...new Set(holdersWithoutSite)].sort(),
  };
}

const MARKETS: FiatMarket[] = Object.entries(DATA.countries)
  .map(([code, m]) => marketOf(code, m))
  .sort((a, b) => b.sites.length - a.sites.length);

export const fiatMarkets = (): FiatMarket[] => MARKETS;
export const fiatMarket = (slug: string): FiatMarket | null => MARKETS.find((m) => m.slug === slug.toLowerCase()) ?? null;
export const fiatMarketFor = (code: string): FiatMarket | null => MARKETS.find((m) => m.code === code.toUpperCase()) ?? null;

/** Regions for the hub and the menu. */
export const EUROPE_FIAT = ["DE", "ES", "SE", "DK", "NL", "BE", "CZ", "FR", "IT", "PT", "LV", "CY"];
export const fiatHref = (code: string) => `/licensed-casinos/${code.toLowerCase()}`;
