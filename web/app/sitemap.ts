import type { MetadataRoute } from "next";
import { siteData } from "@/lib/site-data";
import { SITE_URL } from "@/lib/seo";

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
  "/casino-sportsbooks",
  "/esports-casinos",
  "/fiat-casinos",
  "/live-casino",
  "/slots",
  "/slots/bonus-buy",
  "/slots/megaways",
  "/slots/jackpot",
  "/slots/cluster-pays",
  "/slots/high-volatility",
  "/providers",
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
];

function slugPath(base: string, slug: string): string {
  return `${base}/${slug}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const { ops, slots, providers, walletRows, exchangeRows, sportsMarkets, esportsTitles, guideRows, houseGames, liveGames } = siteData;

  const dynamicPaths = [
    ...ops.map((o) => slugPath("/casinos", o.slug)),
    ...slots.map((s) => slugPath("/slots", s.slug)),
    ...providers.map((p) => slugPath("/providers", p.slug)),
    ...walletRows.map((w) => slugPath("/wallets", w.slug)),
    ...exchangeRows.map((x) => slugPath("/exchanges", x.slug)),
    ...sportsMarkets.map((m) => slugPath("/betting", slug(m.name))),
    ...esportsTitles.map((t) => slugPath("/betting", slug(t.name))),
    ...guideRows.map((g) => slugPath("/guides", g.slug)),
    ...houseGames.map((h) => slugPath("/house-games", h.slug)),
    ...liveGames.map((l) => slugPath("/live-casino", l.slug)),
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
