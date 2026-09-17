/**
 * Sportsbook facts per casino, read from the "Sportsbook" group of
 * data/casinoSpecSheets.json (each cited to the operator's own pages).
 * No margins, market counts or settlement times: we haven't measured any.
 */
import { siteData } from "./site-data";
import { getSpecFact } from "./spec-sheet";
import type { Operator } from "./types";

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

export const sportsbookOps = (): Operator[] => siteData.ops.filter((o) => o.sports).sort((a, b) => a.name.localeCompare(b.name));

/** Casinos whose own pages name this esports title. */
export function booksForTitle(title: string): Operator[] {
  return sportsbookOps().filter((o) => sportsFacts(o.slug).titles.includes(title));
}
