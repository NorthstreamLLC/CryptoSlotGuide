import world from "@/data/world-market.json";
import logoSources from "@/data/fiat-logo-sources.json";
import siteNames from "@/data/fiat-site-names.json";
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

/**
 * One brand in a market: the register's web addresses that share a name,
 * shown as one card. Sweden lists mrgreen.com, .de, .dk and .se under the same
 * licence; a reader is looking for "Mr Green", not four rows.
 */
export interface FiatBrand {
  /** Anchor id on the market page. */
  id: string;
  name: string;
  /** Every web address the register lists for the brand, main one first. */
  domains: string[];
  holders: string[];
  products: FiatProduct[];
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
  /** The same sites grouped by brand name, alphabetical. */
  brands: FiatBrand[];
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

const NAMES = (siteNames as { names: Record<string, { name: string }> }).names;

/** The naming label of a domain: "spela.svenskaspel.se" → "svenskaspel". */
const labelOf = (d: string) => {
  const parts = d.split(".");
  const tld2 = parts.length > 2 && /^(co|com|org|net|bet|gov)$/.test(parts[parts.length - 2]);
  return parts[parts.length - (tld2 ? 3 : 2)] ?? d;
};
/** A name the site gave itself on any domain with this label ("Mr Green" from mrgreen.com, for mrgreen.se). */
const NAME_BY_LABEL = new Map<string, string>();
for (const [d, v] of Object.entries(NAMES)) if (!NAME_BY_LABEL.has(labelOf(d))) NAME_BY_LABEL.set(labelOf(d), v.name);

/**
 * What a site is called on the page: the register's own brand where it names
 * one, else the name the site gives itself (data/fiat-site-names.json), else
 * a sibling domain's name, else the domain's label set as a word.
 */
function displayName(domain: string, registerBrand: string | null): string {
  if (registerBrand && !isDomain(registerBrand)) return registerBrand;
  const own = NAMES[domain]?.name ?? NAME_BY_LABEL.get(labelOf(domain));
  if (own) return own;
  const l = labelOf(domain);
  return l.length <= 3 ? l.toUpperCase() : l.charAt(0).toUpperCase() + l.slice(1);
}

export const fiatLogo = (domain: string): string | null => (LOGOS[domain]?.file ? `/assets/logos/fiat/${LOGOS[domain].file}` : null);

/** Whether a register's "brand" is really just a domain (Germany, Spain, Italy…). */
const isDomain = (s: string) => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(s.trim());

/** Sub-national markets, named for the place the register covers. */
const MARKET_NAMES: Record<string, string> = { "CA-ON": "Ontario", AR: "Buenos Aires province", "AR-C": "City of Buenos Aires" };

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
  // Where a register row names a brand and one domain, that brand is the
  // register's word for the site; otherwise the row's name is a company.
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
  for (const site of bySite.values()) site.name = displayName(site.domain, isDomain(site.name) || site.name === site.holder ? null : site.name);
  const c = countryBy(code);
  const sources = [m.casinos, m.sportsbooks, m.operators]
    .filter((l): l is WorldOperatorList => !!l)
    .map((l) => ({ label: m.regulator, url: l.sourceUrl, asOf: l.asOf }))
    .filter((s, i, a) => a.findIndex((x) => x.url === s.url) === i);
  return {
    code,
    slug: code.toLowerCase(),
    name: MARKET_NAMES[code] ?? c?.name ?? code,
    flag: flagSrc(code.split("-")[0]),
    regulator: m.regulator,
    why: m.why,
    sources,
    sites: [...bySite.values()].sort((a, b) => a.name.localeCompare(b.name)),
    brands: brandsOf([...bySite.values()], code),
    holdersWithoutSite: [...new Set(holdersWithoutSite)].sort(),
  };
}

const letters = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");

function brandsOf(sites: FiatSite[], code: string): FiatBrand[] {
  const tld = code.split("-")[0].toLowerCase().replace(/^gb$/, "uk");
  const groups = new Map<string, FiatSite[]>();
  for (const s of sites) {
    const k = letters(s.name) || s.domain;
    groups.set(k, [...(groups.get(k) ?? []), s]);
  }
  return [...groups.entries()]
    .map(([k, g]) => {
      // The market's own country domain first, then the shortest.
      const main = [...g].sort((a, b) => Number(b.domain.endsWith("." + tld)) - Number(a.domain.endsWith("." + tld)) || a.domain.length - b.domain.length);
      return {
        id: k,
        name: main[0].name,
        domains: main.map((s) => s.domain),
        holders: [...new Set(g.map((s) => s.holder).filter((h): h is string => !!h))],
        products: (["casino", "sports"] as const).filter((p) => g.some((s) => s.products.includes(p))),
        logo: main.find((s) => s.logo)?.logo ?? null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
}

const MARKETS: FiatMarket[] = Object.entries(DATA.countries)
  .map(([code, m]) => marketOf(code, m))
  .sort((a, b) => b.sites.length - a.sites.length);

export const fiatMarkets = (): FiatMarket[] => MARKETS;
export const fiatMarket = (slug: string): FiatMarket | null => MARKETS.find((m) => m.slug === slug.toLowerCase()) ?? null;
export const fiatMarketFor = (code: string): FiatMarket | null => MARKETS.find((m) => m.code === code.toUpperCase()) ?? null;

/**
 * Regions for the hub and the menu, each market in the order it is listed.
 * A code with no register on file is skipped, so a market appears here the
 * day its adapter lands.
 */
export const FIAT_REGIONS: { key: string; title: string; sub: string; codes: string[] }[] = [
  {
    key: "north-america",
    title: "North America",
    sub: "US states license their own casinos and sportsbooks; sweepstakes casinos run under a different model; in Canada each province runs or licenses its own online gambling.",
    codes: ["CA-ON", "CA-BC", "CA-AB", "CA-QC", "CA-MB", "CA-SK", "CA-NB", "CA-NS", "CA-PE", "CA-NL"],
  },
  { key: "uk", title: "United Kingdom", sub: "Every site on the Gambling Commission's register held by an operator with a remote casino or betting licence.", codes: ["GB"] },
  {
    key: "europe",
    title: "Europe",
    sub: "Each country's licensed sites, read from its regulator's own register.",
    codes: ["DE", "ES", "SE", "IT", "DK", "NL", "EE", "GR", "FR", "BE", "SK", "PT", "CZ", "PL", "HR", "LV", "CY", "HU", "SI", "AT", "CH", "NO", "FI"],
  },
  { key: "latin-america", title: "Latin America", sub: "Each country's or province's own list of authorised online operators.", codes: ["PE", "CO", "AR", "AR-C"] },
  { key: "asia-pacific", title: "Asia-Pacific", sub: "Australia licenses online bookmakers state by state, most of them in the Northern Territory; online casinos are prohibited nationally.", codes: ["AU-NT"] },
];
export const regionMarkets = (key: string): FiatMarket[] =>
  (FIAT_REGIONS.find((r) => r.key === key)?.codes ?? []).map((c) => fiatMarketFor(c)).filter((m): m is FiatMarket => !!m);
/** Kept for the menu: the European markets on file, in region order. */
export const EUROPE_FIAT = FIAT_REGIONS.find((r) => r.key === "europe")!.codes;
export const fiatHref = (code: string) => `/licensed-casinos/${code.toLowerCase()}`;
