import type { MetadataRoute } from "next";
import { siteData } from "@/lib/site-data";
import { SITE_URL } from "@/lib/seo";
import { sweepsSorted } from "@/lib/sweeps";
import { US_STATES, COUNTRIES } from "@/lib/legal";
import { STUDIOS } from "@/lib/studios";
import { versusPairs, pairSlug } from "@/lib/versus";
import { countryPages, COIN_PAGES, casinosForCoin } from "@/lib/landing";

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
  "/find-my-casino",
  "/sweepstakes-casinos",
  "/legal",
  "/legal/us",
  "/casino-sportsbooks",
  "/esports-casinos",
  "/slots",
  "/slots/bonus-buy",
  "/slots/megaways",
  "/slots/jackpot",
  "/slots/cluster-pays",
  "/slots/high-volatility",
  "/providers",
  "/providers/licences",
  "/legal/europe",
  "/sportsbooks",
  "/prediction-markets",
  "/wallets",
  "/exchanges",
  "/coins",
  "/guides",
  "/rtp-watch",
  "/compare",
  "/bonuses",
  "/house-games",
  "/how-we-rate",
  "/search",
  "/privacy",
  "/terms",
  "/editorial-standards",
  "/contact",
];

function slugPath(base: string, slug: string): string {
  return `${base}/${slug}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const { ops, slots, providers, walletRows, exchangeRows, esportsTitles, guideRows, houseGames } = siteData;

  const dynamicPaths = [
    ...ops.map((o) => slugPath("/casinos", o.slug)),
    ...slots.map((s) => slugPath("/slots", s.slug)),
    ...[...new Set([...providers.map((p) => p.slug), ...STUDIOS.map((st) => st.slug)])].map((sl) => slugPath("/providers", sl)),
    ...walletRows.map((w) => slugPath("/wallets", w.slug)),
    ...exchangeRows.map((x) => slugPath("/exchanges", x.slug)),
    ...esportsTitles.map((t) => slugPath("/betting", slug(t.name))),
    ...guideRows.map((g) => slugPath("/guides", g.slug)),
    ...houseGames.map((h) => slugPath("/house-games", h.slug)),
    ...countryPages().map(({ c }) => slugPath("/crypto-casinos/in", c.code.toLowerCase())),
    ...COIN_PAGES.filter((c) => casinosForCoin(c.ticker).length >= 3).map((c) => slugPath("/crypto-casinos/accepting", c.slug)),
    ...versusPairs().map(([a, b]) => slugPath("/compare", pairSlug(a, b))),
    ...sweepsSorted().map((w) => slugPath("/sweepstakes-casinos", w.slug)),
    ...US_STATES.map((st) => slugPath("/legal/us", st.code.toLowerCase())),
    ...COUNTRIES.filter((c) => c.code !== "US").map((c) => slugPath("/legal", c.code.toLowerCase())),
  ];

  const allPaths = [...STATIC_ROUTES, ...dynamicPaths];

  return allPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? ("daily" as const) : ("weekly" as const),
    priority: path === "/" ? 1 : STATIC_ROUTES.includes(path) ? 0.7 : 0.6,
  }));
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
