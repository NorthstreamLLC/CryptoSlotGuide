import { siteData } from "@/lib/site-data";
import { casinoFacts } from "@/lib/casino-facts";
import { COUNTRIES, casinosByAccess } from "@/lib/legal";
import type { Operator } from "@/lib/types";

/** Coins with enough casinos to deserve their own page, with display names. */
export const COIN_PAGES: { ticker: string; name: string; slug: string }[] = [
  { ticker: "BTC", name: "Bitcoin", slug: "bitcoin" },
  { ticker: "ETH", name: "Ethereum", slug: "ethereum" },
  { ticker: "USDT", name: "Tether (USDT)", slug: "usdt" },
  { ticker: "LTC", name: "Litecoin", slug: "litecoin" },
  { ticker: "SOL", name: "Solana", slug: "solana" },
  { ticker: "TRX", name: "Tron", slug: "tron" },
  { ticker: "XRP", name: "XRP", slug: "xrp" },
  { ticker: "DOGE", name: "Dogecoin", slug: "dogecoin" },
  { ticker: "USDC", name: "USD Coin (USDC)", slug: "usdc" },
  { ticker: "BNB", name: "BNB", slug: "bnb" },
  { ticker: "BCH", name: "Bitcoin Cash", slug: "bitcoin-cash" },
  { ticker: "ADA", name: "Cardano", slug: "cardano" },
  { ticker: "TON", name: "Toncoin", slug: "toncoin" },
  { ticker: "SHIB", name: "Shiba Inu", slug: "shiba-inu" },
];

/** Featured first, then fastest stated payout, then name. */
const rank = (list: Operator[]) =>
  [...list].sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || (a.payoutStatedMaxMins ?? 1e9) - (b.payoutStatedMaxMins ?? 1e9) || a.name.localeCompare(b.name));

export const coinPage = (slug: string) => COIN_PAGES.find((c) => c.slug === slug) ?? null;

export function casinosForCoin(ticker: string): Operator[] {
  return rank(siteData.ops.filter((o) => casinoFacts(o).coins.includes(ticker)));
}

/**
 * Countries with a law page and at least one casino that accepts them.
 *
 * The threshold used to be three, which excluded exactly two countries: the
 * United Kingdom, where one operator of 46 accepts you, and the Netherlands,
 * where two do. Those are the two readers most in need of the page — someone
 * in London browsing our casino list is looking at 39 operators that will
 * turn them away, and we were answering by having no page at all.
 *
 * A page with one accepting casino is not thin as long as it leads with the
 * real finding, which is the refusal count. The country page does.
 */
export function countryPages() {
  return COUNTRIES.filter((c) => !c.code.includes("-") && c.code !== "US")
    .map((c) => ({ c, accepts: casinosByAccess(c.code).accepts }))
    .filter((x) => x.accepts.length >= 1);
}

export function casinosForCountry(code: string) {
  const by = casinosByAccess(code);
  // restricted has always been computed and never surfaced. On a country
  // where almost nothing accepts you it is the headline, not a footnote.
  const opsFor = (slugs: string[]) => rank(siteData.ops.filter((o) => slugs.includes(o.slug)));
  const except = Object.fromEntries(by.accepts.filter((x) => x.except.length).map((x) => [x.slug, x.except]));
  return {
    accepts: opsFor(by.accepts.map((x) => x.slug)),
    partial: opsFor(by.partial.map((x) => x.slug)),
    restricted: by.restricted.length,
    total: siteData.ops.length,
    except,
  };
}
