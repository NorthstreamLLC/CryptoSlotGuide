import { VERSUS_ANALYSIS } from "@/lib/versus-analysis";
import { NEWS } from "@/lib/news";
import { watchEntries } from "@/lib/casino-changewatch";
import { coinSlug } from "@/lib/coins";
import { fiatMarkets } from "@/lib/fiat";
import { allVenues } from "@/lib/prediction-markets";
import { sportsbookOps } from "@/lib/sports";
import { catalogueStudios } from "@/lib/studio-pages";
import { siteData } from "@/lib/site-data";
import { getCasinoSpecSheet } from "@/lib/spec-sheet";
import { FACT_ARTICLES } from "@/lib/fact-articles";
import { sweepsSorted } from "@/lib/sweeps";
import { US_STATES, COUNTRIES } from "@/lib/legal";
import { STUDIOS } from "@/lib/studios";
import { countryPages, COIN_PAGES, casinosForCoin } from "@/lib/landing";
import { LEGACY_ITEMS, LEGACY_CATEGORIES } from "@/lib/legacy";
import { cataloguePageSlugs } from "@/lib/slot-page";
import { rankedBrands } from "@/lib/us-brands";

/**
 * Not part of the original prototype — it's a design mockup with one
 * hardcoded page state, never a set of crawlable URLs. Every entry here
 * has a real page/route: same discipline as the rest of this codebase,
 * no invented paths.
 */
const STATIC_ROUTES = [
  "/",
  "/crypto-casinos",
  "/crypto-casinos/no-kyc",
  "/fastest-payouts",
  "/lowest-wagering",
  "/races",
  "/vip-calculator",
  "/bonus-terms-decoder",
  ...(watchEntries.length ? ["/casino-changewatch"] : []),
  "/find-my-casino",
  "/blog",
  "/sweepstakes-casinos",
  "/legal",
  "/legal/us",
  "/legal/canada",
  "/us-casinos",
  "/us-sportsbooks",
  "/casino-sportsbooks",
  "/esports-casinos",
  "/slots",
  "/slots/database",
  "/slots/bonus-buy",
  "/slots/megaways",
  "/slots/jackpot",
  "/slots/cluster-pays",
  "/slots/high-volatility",
  "/slots/hold-and-win",
  "/providers",
  "/providers/licences",
  "/legal/europe",
  "/sportsbooks",
  "/prediction-markets",
  "/prediction-markets/regulated",
  "/wallets",
  "/exchanges",
  "/coins",
  ...siteData.coinDefs.map((c) => `/coins/${coinSlug(c)}`),
  "/guides",
  "/rtp-watch",
  "/compare",
  "/bonuses",
  "/house-games",
  "/how-we-rate",
  "/privacy",
  "/terms",
  "/editorial-standards",
  "/contact",
  "/authors/lars-p",
  "/promo-codes",
  "/casinos/facts",
  "/news",
  "/rakeback-casinos",
  "/casinos/stake/facts",
  "/casinos/roobet/facts",
  "/casinos/shuffle/facts",
  "/casinos/gamdom/facts",
  "/casinos/duel/facts",
  "/casinos/duelbits/facts",
  "/casinos/rainbet/facts",
  "/casinos/razed/facts",
  "/casinos/goated/facts",
  "/casinos/yeet/facts",
  "/casinos/degen/facts",
  "/casinos/betfury/facts",
  "/casinos/winna/facts",
  "/casinos/thrill/facts",
  "/promo-codes/roobet",
  "/promo-codes/stake",
  "/promo-codes/shuffle",
  "/promo-codes/gamdom",
  "/promo-codes/duelbits",
  "/promo-codes/rainbet",
  "/promo-codes/razed",
  "/promo-codes/duel",
  "/promo-codes/degen",
  "/promo-codes/yeet",
  "/promo-codes/goated",
  "/promo-codes/betfury",
  "/promo-codes/winna",
  "/promo-codes/thrill",
  "/play-with-kevin-hart",
  "/slots/best-crypto-slot-sites",
  "/how-to/blackjack",
  "/how-to/roulette",
  "/how-to/baccarat",
];

function slugPath(base: string, slug: string): string {
  return `${base}/${slug}`;
}

/** Every indexable path. */
export function sitemapPaths(): string[] {
  const { ops, slots, providers, walletRows, exchangeRows, esportsTitles, guideRows, houseGames } = siteData;

  const dynamicPaths = [
    ...ops.map((o) => slugPath("/casinos", o.slug)),
    ...slots.map((s) => slugPath("/slots", s.slug)),
    // The catalogue titles that earn their own page — see lib/slot-page.ts for
    // the bar. Separate from `slots`, which is the hand-written reviews.
    ...cataloguePageSlugs().map((sl) => slugPath("/slots", sl)),
    // US-regulated brands — only those a regulator actually lists, matching
    // the route's own generateStaticParams.
    ...rankedBrands().map(({ brand }) => slugPath("/us-casinos", brand.slug)),
    // Each book's sportsbook page.
    ...sportsbookOps().map((o) => slugPath("/sportsbooks", o.slug)),
    // The licensed (fiat) section: the hub and each market's site list.
    "/licensed-casinos",
    ...fiatMarkets().map((m) => slugPath("/licensed-casinos", m.slug)),
    ...allVenues().map(({ v }) => slugPath("/prediction-markets", v.slug)),
    // Other countries' pages are noindex (see their generateMetadata).
    slugPath("/prediction-markets/in", "us"),
    ...[...new Set([...providers.map((p) => p.slug), ...STUDIOS.map((st) => st.slug), ...catalogueStudios().map((c) => c.slug)])].map((sl) => slugPath("/providers", sl)),
    ...walletRows.map((w) => slugPath("/wallets", w.slug)),
    ...exchangeRows.map((x) => slugPath("/exchanges", x.slug)),
    ...esportsTitles.map((t) => slugPath("/betting", slug(t.name))),
    ...guideRows.map((g) => slugPath("/guides", g.slug)),
    ...houseGames.map((h) => slugPath("/house-games", h.slug)),
    // Old posts that next.config.ts now redirects stay out: a sitemap lists final addresses only.
    ...LEGACY_ITEMS.filter((i) => !["top-crypto-casinos", "casino-sign-up-bonuses", "the-best-crypto-slots-to-play-in-2025"].includes(i.slug)).map((i) => slugPath("", i.slug)),
    ...LEGACY_CATEGORIES.map((c) => slugPath("/category", c.slug)),
    ...countryPages().map(({ c }) => slugPath("/crypto-casinos/in", c.code.toLowerCase())),
    ...US_STATES.map((st) => slugPath("/us-casinos/in", st.code.toLowerCase())),
    ...COIN_PAGES.filter((c) => casinosForCoin(c.ticker).length >= 3).map((c) => slugPath("/crypto-casinos/accepting", c.slug)),
    // Casino-vs-casino pages are noindex until they carry their own analysis; these have it.
    ...Object.keys(VERSUS_ANALYSIS).map((pair) => `/compare/${pair}`),
    ...NEWS.map((n) => `/news/${n.month}`),
    ...sweepsSorted().map((w) => slugPath("/sweepstakes-casinos", w.slug)),
    ...US_STATES.map((st) => slugPath("/legal/us", st.code.toLowerCase())),
    ...COUNTRIES.filter((c) => c.code !== "US").map((c) => slugPath("/legal", c.code.toLowerCase())),
  ];

  return [...new Set([...STATIC_ROUTES, ...dynamicPaths])];
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * The sitemap sections, each served as /sitemaps/<id>.xml and listed in the
 * /sitemap.xml index. First match wins, so the jurisdiction pages under
 * /crypto-casinos/in and /us-casinos/in land in "legal", not "casinos".
 */
export const SITEMAP_SECTIONS = ["core", "casinos", "slots", "providers", "comparisons", "legal"] as const;
export type SitemapSection = (typeof SITEMAP_SECTIONS)[number];

const RULES: [SitemapSection, RegExp][] = [
  ["comparisons", /^\/compare\//],
  ["legal", /^\/(legal|licensed-casinos)(\/|$)|^\/(crypto-casinos|us-casinos|prediction-markets)\/in\//],
  ["slots", /^\/slots(\/|$)/],
  ["providers", /^\/providers\//],
  ["casinos", /^\/(casinos|promo-codes|sportsbooks|us-casinos|sweepstakes-casinos|wallets|exchanges|prediction-markets)\/|^\/crypto-casinos\/accepting\//],
];

export const sectionOf = (path: string): SitemapSection => RULES.find(([, re]) => re.test(path))?.[0] ?? "core";

/**
 * The date a page's content was last checked or edited, where a record holds
 * one; undefined otherwise. Never the deploy time: a lastmod that changes on
 * every deploy tells crawlers nothing.
 */
export function lastModifiedOf(path: string): string | undefined {
  const newest = (dates: (string | undefined)[]) => dates.filter((d): d is string => !!d && /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().pop();
  const sheetDate = (slug: string) => newest(getCasinoSpecSheet(slug)?.groups.flatMap((g) => g.facts.map((f) => f.asOf)) ?? []);
  let m: RegExpMatchArray | null;
  if ((m = path.match(/^\/casinos\/([^/]+)\/facts$/))) {
    const a = FACT_ARTICLES[m[1]];
    return a ? newest([a.published, ...a.facts.map((f) => getCasinoSpecSheet(m![1])?.groups.find((g) => g.title === f.group)?.facts.find((x) => x.label === f.label)?.asOf)]) : undefined;
  }
  if ((m = path.match(/^\/(?:casinos|promo-codes)\/([^/]+)$/))) return sheetDate(m[1]);
  if ((m = path.match(/^\/compare\/(.+)$/))) {
    // A pair page changes when the facts it cites do, not only when it was written.
    const an = VERSUS_ANALYSIS[m[1]];
    const factDate = (c: { slug: string; group: string; label: string }) => getCasinoSpecSheet(c.slug)?.groups.find((g) => g.title === c.group)?.facts.find((f) => f.label === c.label)?.asOf;
    return an ? newest([an.published, ...an.sections.flatMap((x) => x.cite.map(factDate))]) : undefined;
  }
  if ((m = path.match(/^\/news\/(.+)$/))) return NEWS.find((n) => n.month === m![1])?.published;
  if (path === "/news") return NEWS[0]?.published;
  const legacy = LEGACY_ITEMS.find((i) => `/${i.slug}` === path);
  if (legacy) return newest([legacy.modified, legacy.date]);
  return undefined;
}
