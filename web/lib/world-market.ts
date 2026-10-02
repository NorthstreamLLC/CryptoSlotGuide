import data from "@/data/world-market.json";

/**
 * Who is licensed to take bets online in each country outside the US, read
 * from each regulator's own register by scripts/fetch-world-licences.mjs.
 *
 * The US has us-market.json; this is the same idea for everyone else, and it
 * is kept to the same rule: the regulator's wording, the register's URL, the
 * date it was read. Where a register does not say which product a licence
 * covers (Spain, Italy, Latvia) the rows sit in one `operators` list rather
 * than being guessed into casino and sportsbook.
 *
 * Countries whose regulator publishes no list a script can read are in
 * `unreadable`, with the page to check instead — so a country page can say
 * "we looked" rather than show nothing.
 */
export interface WorldOperator {
  /** The brand, domain or company as the register lists it. */
  brand: string;
  /** The licence holder as the register names it, where it names one. */
  licenseHolder: string | null;
  /** Domains the register ties to this row, bare hostnames. */
  domains?: string[];
  /** Italy's ADM concession code. */
  concession?: string;
}

export interface WorldOperatorList {
  operators: WorldOperator[];
  sourceUrl: string;
  asOf: string;
  note: string | null;
  /** Sweden: the web addresses the register lists under the licence type, which it does not tie to holders. */
  domains?: string[];
}

export interface CountryMarket {
  regulator: string;
  why: string;
  casinos?: WorldOperatorList;
  sportsbooks?: WorldOperatorList;
  operators?: WorldOperatorList;
}

export interface UnreadableRegister {
  regulator: string;
  sourceUrl: string;
  note: string;
}

const DB = data as unknown as {
  read: string;
  countries: Record<string, CountryMarket>;
  unreadable: Record<string, UnreadableRegister>;
};

export const worldMarket = (code: string): CountryMarket | null => DB.countries[code.toUpperCase()] ?? null;
export const unreadableRegister = (code: string): UnreadableRegister | null => DB.unreadable[code.toUpperCase()] ?? null;

/** Countries with a readable register, with the number of distinct brands across their lists. */
export function marketsWithLists(): { code: string; brands: number; casinos: number; sportsbooks: number }[] {
  return Object.entries(DB.countries).map(([code, m]) => {
    const all = new Set<string>();
    for (const l of [m.casinos, m.sportsbooks, m.operators]) for (const o of l?.operators ?? []) all.add(o.brand.toLowerCase());
    return { code, brands: all.size, casinos: m.casinos?.operators.length ?? 0, sportsbooks: m.sportsbooks?.operators.length ?? 0 };
  });
}
