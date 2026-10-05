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
import { getCasinoBonuses } from "./casino-bonuses";

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
      href: `/sportsbooks/${slug}`,
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
  const add = (v: string | null | undefined) => {
    const t = (v ?? "").trim();
    if (t && !parts.some((p) => p.toLowerCase() === t.toLowerCase())) parts.push(t);
  };
  // The feature's name and what it does, cut before its conditions; a comma
  // inside a figure ("$10,000") is not a clause break.
  const tidy = (v: string) => firstClause(v).replace(/:.*$/, "").split(/,(?!\d)|\s(?:once|when|if|while)\s/)[0].trim();
  const race = getSpecFact(slug, "Sports bonus terms", "Sports race")?.value;
  if (race) add(tidy(String(race)));
  const other = getSpecFact(slug, "Sports bonus terms", "Other sports promotions")?.value;
  if (other) add(tidy(String(other)));
  // Standing features a sheet records inside the Offer fact after the
  // "rotating promotions" note — Rainbet's Early Payout, BC.Game's
  // Comboboost — rather than under their own label. The second sentence
  // carries them; the boilerplate "regularly runs and replaces" does not.
  const offer = String(getSpecFact(slug, "Sports bonus terms", "Offer")?.value ?? "");
  if (/^(rotating|no )/i.test(offer)) {
    const tail = offer.replace(/^[^.:]*[.:]\s*/, "");
    // The feature's name and what it does, cut before the conditions.
    const feature = tidy(tail.replace(/^(it runs a standing|plus a standing|plus)\s+/i, ""));
    if (feature && !/regularly runs|rather than one fixed|lists only|promotions page|^rotating|^no /i.test(feature) && feature.length < 120) add(feature);
  }
  // Sports promotions recorded on the bonuses sheet (Dustbit's Predict &
  // Win, Betfury's Weekly Sport Bonus), by title; the welcome offer itself
  // is already the row's headline.
  for (const b of getCasinoBonuses(slug)) {
    if (/sport/i.test(`${b.category} ${b.title}`) && !/new players|new users|welcome/i.test(`${b.category} ${b.title}`)) add(b.title);
  }
  return parts.length ? parts.slice(0, 3).join(" · ") : null;
}

/* ------------------------------------------------------------------ */
/* Sportsbook pages: races, boosts and one book's full sports profile  */
/* ------------------------------------------------------------------ */

export interface SportsHighlight {
  slug: string;
  name: string;
  mono: string;
  /** The prize or feature in a few words, e.g. "$10,000 Sports Race". */
  headline: string;
  /** What it is, in the operator's terms. */
  detail: string;
  /** "Sports bets only" or how sports bets take part. */
  tag: string;
  sourceUrl: string | null;
  /**
   * Races only: true when the race is for sports bets alone. Degen's and
   * Flush's races and Toshibet's raffle are casino-wide — sports bets count,
   * but so does everything else — and are shown as such, never as sports races.
   */
  sportsOnly?: boolean;
}

const sentenceWith = (text: string, re: RegExp): string | null => {
  const parts = text.split(/(?<=[.;])\s+/);
  return parts.find((p) => re.test(p))?.replace(/[.;]$/, "") ?? null;
};
const opBy = (slug: string) => sportsbookOps().find((o) => o.slug === slug);
const bonusBy = (slug: string, re: RegExp) => getCasinoBonuses(slug).find((b) => re.test(b.title));

/**
 * The races and raffles sports bets take part in, in the order we put them
 * forward. Editorial order; every line is read out of the book's own cited
 * facts or promotion entries, so nothing here is typed by hand.
 */
const SPORTS_RACE_READERS: Record<string, () => Omit<SportsHighlight, "slug" | "name" | "mono"> | null> = {
  razed: () => {
    const f = getSpecFact("razed", "Sports bonus terms", "Sports race");
    if (!f?.value) return null;
    return { headline: f.value.split(":")[0], detail: f.value.split(":").slice(1).join(":").trim(), tag: "Sports bets only", sourceUrl: f.sourceUrl ?? null };
  },
  rollbit: () => {
    const f = getSpecFact("rollbit", "Bonus terms", "Leaderboards");
    const s = f?.value ? sentenceWith(f.value, /sports betting tournament/i) : null;
    if (!s) return null;
    const amount = (s.match(/\$[\d,]+/) ?? [])[0];
    return {
      headline: `${amount ?? ""} weekly sports tournament`.trim(),
      // "A $25,000 weekly sports betting tournament also runs Monday to Sunday…"
      // reads as a continuation once lifted out of its paragraph.
      detail: s.replace(/^A\s+/, "").replace(/\s+also runs\b/, " runs"),
      tag: "Sports bets only",
      sourceUrl: f?.sourceUrl ?? null,
    };
  },
  degen: () => {
    const b = bonusBy("degen", /weekly race/i);
    if (!b || !/sport/i.test(b.subCopy)) return null;
    return { headline: b.title, detail: b.subCopy, tag: "Sports bets count", sourceUrl: b.sourceUrl };
  },
  toshibet: () => {
    const b = bonusBy("toshibet", /raffle/i);
    if (!b || !/sport/i.test(b.subCopy)) return null;
    return { headline: b.title, detail: b.subCopy, tag: "3× tickets on sports", sourceUrl: b.sourceUrl };
  },
  flush: () => {
    const f = getSpecFact("flush", "Sports bonus terms", "Offer");
    const s = f?.value ? sentenceWith(f.value, /race/i) : null;
    if (!s) return null;
    const amount = (s.match(/\$[\d,]+/) ?? [])[0];
    return { headline: `${amount ?? ""} weekly race`.trim(), detail: s, tag: "Sports bets count", sourceUrl: f?.sourceUrl ?? null };
  },
};

export function sportsRaces(): SportsHighlight[] {
  return Object.entries(SPORTS_RACE_READERS)
    .map(([slug, read]): SportsHighlight | null => {
      const o = opBy(slug);
      const r = read();
      return o && r ? { slug, name: o.name, mono: o.mono, ...r, sportsOnly: r.tag === "Sports bets only" } : null;
    })
    .filter((x): x is SportsHighlight => !!x);
}

/** Races for sports bets alone. */
export const sportsOnlyRaces = (): SportsHighlight[] => sportsRaces().filter((r) => r.sportsOnly);

/** Casino-wide races and raffles that sports bets count toward. */
export const sharedRaces = (): SportsHighlight[] => sportsRaces().filter((r) => !r.sportsOnly);

/**
 * Standing sportsbook features worth choosing a book for: early payout and
 * multiples boosts. Same rule — read from each book's cited facts.
 */
const BOOST_READERS: Record<string, () => Omit<SportsHighlight, "slug" | "name" | "mono"> | null> = {
  razed: () => {
    const f = getSpecFact("razed", "Sports bonus terms", "Other sports promotions");
    if (!f?.value) return null;
    return { headline: "Early Payout", detail: f.value.replace(/^Early Payout:\s*/i, ""), tag: "Early payout", sourceUrl: f.sourceUrl ?? null };
  },
  rollbit: () => {
    const f = getSpecFact("rollbit", "Sports bonus terms", "Offer");
    if (!f?.value) return null;
    return { headline: f.value.split(":")[0], detail: f.value.split(":").slice(1).join(":").trim() || f.value, tag: "Early payout", sourceUrl: f.sourceUrl ?? null };
  },
  rainbet: () => {
    const f = getSpecFact("rainbet", "Sports bonus terms", "Offer");
    const s = f?.value ? sentenceWith(f.value, /early payout/i) : null;
    if (!s) return null;
    return { headline: "Early Payout", detail: s.replace(/^.*?Early Payout\s*/i, "Settles ").replace(/^Settles settles/i, "Settles"), tag: "Early payout", sourceUrl: f?.sourceUrl ?? null };
  },
  dustbit: () => {
    const b = bonusBy("dustbit", /early payout/i);
    if (!b) return null;
    return { headline: b.title, detail: b.subCopy, tag: "Early payout", sourceUrl: b.sourceUrl };
  },
  "bc-game": () => {
    const f = getSpecFact("bc-game", "Sports bonus terms", "Offer");
    const s = f?.value ? sentenceWith(f.value, /comboboost/i) : null;
    if (!s) return null;
    return { headline: "Comboboost", detail: s, tag: "Multiples boost", sourceUrl: f?.sourceUrl ?? null };
  },
  bluff: () => {
    const f = getSpecFact("bluff", "Sports bonus terms", "Other sports promotions");
    if (!f?.value) return null;
    // The card carries what it is; the 19-step table stays on the book's page.
    const s = sentenceWith(f.value, /combo boost/i) ?? f.value;
    return { headline: "Combo Boost", detail: s.split(":")[0], tag: "Multiples boost", sourceUrl: f.sourceUrl ?? null };
  },
  coincasino: () => {
    const f = getSpecFact("coincasino", "Sports bonus terms", "Offer");
    if (!f?.value) return null;
    const [head, ...rest] = f.value.split(":");
    return { headline: head.trim(), detail: rest.join(":").trim() || f.value, tag: "Multiples boost", sourceUrl: f.sourceUrl ?? null };
  },
};

export function sportsBoosts(): SportsHighlight[] {
  return Object.entries(BOOST_READERS)
    .map(([slug, read]) => {
      const o = opBy(slug);
      const r = read();
      return o && r ? { slug, name: o.name, mono: o.mono, ...r } : null;
    })
    .filter((x): x is SportsHighlight => !!x);
}

/** Where a book's own sportsbook lives — the page its "Sportsbook" fact was read from. */
export function sportsbookUrl(slug: string): string | null {
  const u = getSpecFact(slug, "Sportsbook", "Sportsbook")?.sourceUrl ?? null;
  return u && /^https?:\/\//.test(u) ? u : null;
}

/** The sportsbook page on this site for a book. */
export const sportsbookHref = (slug: string) => `/sportsbooks/${slug}`;
