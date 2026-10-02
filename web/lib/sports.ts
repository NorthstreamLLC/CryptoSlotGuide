/**
 * Sportsbook facts per casino, read from the "Sportsbook" group of
 * data/casinoSpecSheets.json (each cited to the operator's own pages).
 * No margins, market counts or settlement times: we haven't measured any.
 */
import { siteData } from "./site-data";
import { getSpecFact } from "./spec-sheet";
import type { Operator } from "./types";
import { inHouseOrder } from "./house-order";
import { raceFor } from "./races";

const G = "Sportsbook";

export function sportsFacts(slug: string) {
  const f = (label: string) => getSpecFact(slug, G, label);
  return {
    sportsbook: f("Sportsbook"),
    esports: f("Esports"),
    titles: (f("Esports titles")?.chips ?? []) as string[],
    provider: f("Provider"),
    cashout: f("Cash-out"),
    betBuilder: f("Bet builder"),
    maxPayout: f("Max payout"),
    offer: getSpecFact(slug, "Sports bonus terms", "Offer"),
  };
}

/** Short table labels for the cited "Max payout" wording (full text is on each profile). */
const MAX_PAYOUT_SHORT: Record<string, string> = {
  roobet: "$500,000",
  stake: "Racing only",
  shuffle: "$500,000",
  cloudbet: "None stated",
  gamdom: "Set per market",
  "sportsbet-io": "By sport, up to €1M",
  "500-casino": "Case by case",
  fortunejack: "Sources disagree",
  betplay: "1 BTC a day",
  gamba: "Not stated",
  solcasino: "No daily limit",
  metawin: "$100,000 a day",
  acebet: "€100,000 a day",
  qzino: "$100,000 a day",
  housebets: "Set per market",
  bluff: "$1,000,000",
};

export function maxPayoutShort(slug: string): string {
  return sportsFacts(slug).maxPayout ? MAX_PAYOUT_SHORT[slug] ?? "See profile" : "Not found";
}

export function esportsLabel(slug: string): string {
  const s = sportsFacts(slug);
  if (s.titles.length) return `${s.titles.length} title${s.titles.length === 1 ? "" : "s"} named`;
  return s.esports ? "Offered" : "Not found";
}

export const sportsbookOps = (): Operator[] => inHouseOrder(siteData.ops.filter((o) => o.sports));

/** Casinos whose own pages name this esports title. */
export function booksForTitle(title: string): Operator[] {
  return sportsbookOps().filter((o) => sportsFacts(o.slug).titles.includes(title));
}

/**
 * The sportsbooks that publish a standing sports welcome offer, in the
 * order we put them forward. An editorial list, not a derived one: most
 * books run rotating promotions and no fixed welcome offer, which the
 * table says per row, and a reader who came to pick a book should see the
 * standing offers first rather than scroll past twenty rows of "rotating".
 *
 * Razed leads: a fixed $50 free-bet sports welcome offer and a $10K weekly
 * race alongside its $100K monthly, each cited on its profile.
 *
 * Every figure shown for an entry comes from the "Sports bonus terms" group
 * of the casino's spec sheet and the races file — nothing is typed here.
 */
export const SPORTS_OFFER_ORDER: string[] = ["razed", "sportsbet-io", "vave", "dicey", "500-casino", "fortunejack", "cloudbet"];

/** Sportsbooks in index order, with the standing-offer books lifted to the top in SPORTS_OFFER_ORDER. */
export function sportsbookOrder(): Operator[] {
  const all = sportsbookOps();
  const lead = SPORTS_OFFER_ORDER.map((slug) => all.find((o) => o.slug === slug)).filter((o): o is Operator => !!o);
  return [...lead, ...all.filter((o) => !SPORTS_OFFER_ORDER.includes(o.slug))];
}

export interface SportsOffer {
  slug: string;
  name: string;
  mono: string;
  /** The offer, as the operator words it, cut to its first clause. */
  headline: string;
  /** The wagering fact, where the operator publishes one. */
  wagering: string | null;
  /** Minimum odds / qualifying bet, where published. */
  minOdds: string | null;
  /** The casino's standing race or leaderboard, from lib/races.ts. */
  race: string | null;
  /** A race that only sports bets enter, where the book runs one. */
  sportsRace: string | null;
  /** Standing sports features beyond the welcome offer — early payout, combo boosts, free-bet contests. */
  promos: string | null;
  sourceUrl: string | null;
  href: string;
  signupUrl?: string;
}

const firstClause = (v: string) => v.split(/(?<=[a-z0-9)])[.;](?=\s|$)/i)[0].trim();

export function sportsOffers(): SportsOffer[] {
  const all = sportsbookOps();
  return SPORTS_OFFER_ORDER.map((slug): SportsOffer | null => {
    const o = all.find((x) => x.slug === slug);
    const offer = getSpecFact(slug, "Sports bonus terms", "Offer");
    if (!o || !offer?.value) return null;
    const wagering = getSpecFact(slug, "Sports bonus terms", "Wagering")?.value ?? null;
    const minOdds = getSpecFact(slug, "Sports bonus terms", "Minimum odds")?.value ?? null;
    return {
      slug,
      name: o.name,
      mono: o.mono,
      headline: firstClause(String(offer.value)),
      wagering: wagering ? firstClause(String(wagering)) : null,
      minOdds: minOdds ? String(minOdds) : null,
      race: raceFor(slug)?.label ?? null,
      sportsRace: (() => {
        const v = getSpecFact(slug, "Sports bonus terms", "Sports race")?.value;
        return v ? firstClause(String(v)) : null;
      })(),
      promos: (() => {
        const v = getSpecFact(slug, "Sports bonus terms", "Other sports promotions")?.value;
        return v ? firstClause(String(v)) : null;
      })(),
      sourceUrl: offer.sourceUrl ?? null,
      href: `/casinos/${slug}`,
      signupUrl: o.affiliate && o.signupUrl ? o.signupUrl : undefined,
    };
  }).filter((x): x is SportsOffer => !!x);
}

/**
 * One line of a book's standing sports promotions, for the table row: the
 * sports race if it runs one, then the other sports features its spec sheet
 * records (early payout, combo boosts, free-bet contests). Books with only
 * a rotating-promotion note get nothing here; the row already says so.
 */
export function sportsPromoLine(slug: string): string | null {
  const parts: string[] = [];
  const race = getSpecFact(slug, "Sports bonus terms", "Sports race")?.value;
  if (race) parts.push(firstClause(String(race)).replace(/:.*$/, ""));
  const other = getSpecFact(slug, "Sports bonus terms", "Other sports promotions")?.value;
  if (other) parts.push(firstClause(String(other)).replace(/:.*$/, ""));
  return parts.length ? parts.join(" · ") : null;
}
