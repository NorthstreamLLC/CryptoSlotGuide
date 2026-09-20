import { siteData } from "@/lib/site-data";
import { casinoFacts } from "@/lib/casino-facts";
import { getSpecFact } from "@/lib/spec-sheet";
import { raceFor } from "@/lib/races";
import { COUNTRIES, accessIn } from "@/lib/legal";
import { logoFor } from "@/lib/logo";
import { COIN_PAGES } from "@/lib/landing";

/** One casino, flattened to what the quiz needs to match and explain a pick. */
export interface QuizCasino {
  slug: string;
  name: string;
  logo: string | null;
  featured: boolean;
  offer: string;
  url: string;
  affiliate: boolean;
  code: string | null;
  coins: string[];
  /** Stated withdrawal time in minutes, lower is faster. */
  payoutMins: number | null;
  payoutLabel: string | null;
  kyc: string;
  wager: number | null;
  wagerLabel: string | null;
  rakeback: boolean;
  cashback: boolean;
  raceLabel: string | null;
  raceMonthly: number;
  sports: boolean;
  predictions: boolean;
  /** Countries this casino restricts, and whether its list is complete. */
  restricted: string[];
  listComplete: boolean;
}

export function quizCasinos(): QuizCasino[] {
  return siteData.ops.map((o) => {
    const f = casinoFacts(o);
    const has = (l: string) => !!getSpecFact(o.slug, "Bonus terms", l);
    const race = raceFor(o.slug);
    const restricted: string[] = [];
    let complete = false;
    for (const c of COUNTRIES) {
      const a = accessIn(o.slug, c.code);
      if (a === "restricted") restricted.push(c.code);
      if (a) complete = complete || a === "accepts";
    }
    return {
      slug: o.slug,
      name: o.name,
      logo: logoFor(o.slug),
      featured: !!o.featured,
      offer: o.bonusShort ?? o.bonus,
      url: o.signupUrl ?? `/casinos/${o.slug}`,
      affiliate: !!o.affiliate,
      code: o.promoCode ?? null,
      coins: f.coins,
      payoutMins: o.payoutStatedMaxMins ?? null,
      payoutLabel: f.withdrawals,
      kyc: o.kyc,
      wager: f.wagering === "No wagering" ? 0 : o.wager ?? null,
      wagerLabel: f.wagering,
      rakeback: has("Rakeback"),
      cashback: has("Cashback"),
      raceLabel: race?.label ?? null,
      raceMonthly: race?.monthly ?? 0,
      sports: !!o.sports,
      predictions: !!getSpecFact(o.slug, "Sportsbook", "Prediction markets"),
      restricted,
      listComplete: complete,
    };
  });
}

/** Countries offered in the quiz: those we have law pages for, plus a "somewhere else" option. */
export const quizCountries = () => COUNTRIES.filter((c) => !c.code.includes("-")).map((c) => ({ code: c.code, name: c.name })).sort((a, b) => a.name.localeCompare(b.name));

export const quizCoins = () => COIN_PAGES.map((c) => ({ ticker: c.ticker, name: c.name }));
