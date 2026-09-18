/**
 * Shared, display-ready casino facts (report hero, casino cards, homepage).
 * Every value comes from a cited fact in data/casinoSpecSheets.json.
 */
import { getSpecFact } from "./spec-sheet";
import { payoutView } from "./payout";
import { wagerView } from "./wager";
import { tintFor } from "./logo";
import type { Operator, SpecFact } from "./types";

export const BRAND: Record<string, string> = { roobet: "#FFCC00", stake: "#1FFF20", "bc-game": "#24EE89", shuffle: "#896CFF" };
export const brandFor = (slug: string) => BRAND[slug] ?? tintFor(slug);

type Fact = SpecFact | undefined;

/** A short headline from a long cited sentence: the first amount, or a plain word. */
export function shortAmount(f: Fact): string | null {
  const v = f?.value;
  if (!v) return null;
  if (/^(no|there is no|there isn't)\b[^.]*\b(minimum|maximum|limit|fee)/i.test(v) || /\bno (minimum|maximum|max|limit)s?\b/i.test(v.slice(0, 60))) return "None";
  if (/^(no fee|free|none\b|fee-free|no withdrawal fee)/i.test(v)) return "Free";
  const m = v.match(/(?:(?:USD|EUR|USDT)\s?\d[\d.,]*(?:\s?(?:k|K|m|M|million))?|[$€£]\s?\d[\d.,]*(?:\s?(?:k|K|m|M|million))?|\d[\d.,]*\s?(?:USDT|USDC|USD|EUR|BTC|ETH|LTC|TRX|SOL|DOGE|mBTC)\b)/);
  if (m) return m[0].replace(/\s+/g, " ").replace(/[.,]+$/, "");
  if (/varies|depends|per coin|each coin|by coin|per currency/i.test(v)) return "Per coin";
  return null;
}

export function casinoFacts(o: Operator) {
  const f = (g: string, l: string) => getSpecFact(o.slug, g, l);
  const pv = payoutView(o);
  const wv = wagerView(o);
  const wdTime = f("Payouts & fees", "Stated withdrawal time");
  const wdFee = f("Payouts & fees", "Withdrawal fees");
  const minDep = f("Coins & deposit limits", "Minimum deposit") ?? f("Bonus terms", "Minimum deposit");
  const minWd = f("Payouts & fees", "Minimum withdrawal");
  const coins = f("Coins & deposit limits", "Coins accepted");
  const fee = shortAmount(wdFee);
  return {
    headline: o.bonusShort ?? o.bonus,
    offer: f("Bonus terms", "Standing offer"),
    coins: coins?.chips ?? [],
    withdrawals: wdTime && pv.label !== "Not stated" ? pv.label.replace(/\s*\(.*\)\s*/, "").replace("Varies, up to hours", "Up to hours") : null,
    fee: wdFee ? (fee === "None" ? "Free" : fee ?? "Network fee") : null,
    minDeposit: minDep ? (shortAmount(minDep) === "None" ? "No minimum" : shortAmount(minDep) ?? "See terms") : null,
    minWithdrawal: minWd ? (shortAmount(minWd) === "None" ? "No minimum" : shortAmount(minWd) ?? "See terms") : null,
    wagering: wv.kind === "none" ? "No wagering" : wv.kind === "cited" ? (wv.mult === 0 ? "No wagering" : `${wv.mult}×`) : wv.kind === "note" ? "See terms" : null,
    kyc: f("Compliance", "KYC policy") ? ({ none: "No KYC", tiered: "KYC at threshold", required: "KYC required" } as const)[o.kyc] : null,
    licence: f("Compliance", "Licence") ? licenceLabel(o.licence) : null,
    expiry: shortDuration(f("Bonus terms", "Expiry")),
    maxCashout: shortCap(f("Bonus terms", "Max cashout")),
    maxBet: shortAmount(f("Bonus terms", "Max bet")),
  };
}

/** "30 days", "7 days", "48 hours" from a cited time-limit sentence. */
export function shortDuration(f: Fact): string | null {
  const v = f?.value;
  if (!v) return null;
  if (/never expire|no time limit|don't expire|do not expire/i.test(v.slice(0, 80)) || /bonus terms give no time limit/i.test(v)) return "No limit";
  const m = v.match(/(\d+)\s*(day|hour|week|month)s?/i);
  if (m) return `${m[1]} ${m[2].toLowerCase()}${m[1] === "1" ? "" : "s"}`;
  return "See terms";
}

function shortCap(f: Fact): string | null {
  const v = f?.value;
  if (!v) return null;
  if (/^no (cap|max|maximum|limit)|no cap\b|uncapped/i.test(v.slice(0, 60))) return "No cap";
  const x = v.match(/(\d+)\s?[x×]\s?(the )?(bonus|deposit)/i);
  if (x) return `${x[1]}× ${x[3].toLowerCase()}`;
  return shortAmount(f) ?? "See terms";
}

export function licenceLabel(l: string): string {
  if (/^not stated$/i.test(l)) return "No licence stated";
  if (/^unconfirmed$/i.test(l)) return "Licence unconfirmed";
  if (/N\.V\.|B\.V\.|Ltd|LLC/.test(l)) return `Licensed via ${l}`;
  return `${l} licence`;
}

/**
 * Short labels for each casino's cited maximum withdrawal and deposit
 * ([withdrawal, deposit]); the full wording is shown underneath on the report.
 */
const MAX_LIMITS: Record<string, [string | null, string | null]> = {
  shock: ["No max stated", "No max stated"],
  qzino: ["$300,000 max win", "No max"],
  betfury: ["$300,000 max win", "No max"],
  yeet: ["No max", "No max stated"],
  thrill: ["No max", "No max"],
  stake: ["No max", "No max"],
  bitstarz: ["1 BTC per withdrawal", "No max"],
  cloudbet: ["No max once verified", "No max once verified"],
  gamdom: [null, "No max stated"],
  duelbits: ["No max stated", null],
  rainbet: ["No max stated", "$700 on the bonus deposit"],
  "bitcasino-io": ["No max (crypto)", "No max stated"],
  "sportsbet-io": ["No max stated", "No max stated"],
  "500-casino": ["No max stated", "No max stated"],
  vave: ["No max", "Varies by method"],
  fortunejack: ["EUR 2,000 per withdrawal", "EUR 2,000 per deposit"],
  mbit: ["3 BTC a week, 10 BTC a month", "No max"],
  "7bit": ["0.13 BTC a week, 0.52 BTC a month", "Varies by method"],
  betplay: ["$8,000 a day", null],
  razed: ["No max (crypto)", "$10,000 CAD per card deposit"],
  gamba: ["No max", "No max stated"],
  solcasino: ["No max stated", "Varies by method"],
  "whale-io": ["No max stated", "No max"],
  acebet: ["EUR 100,000 a day", "No max stated"],
  jackpotbet: ["No max", "No max"],
  degen: ["About $1,000,000", "About $1,000,000 (USDT)"],
  cybet: ["$100,000 per win", "No max"],
  housebets: ["Set per coin", "Set per coin"],
  dicey: ["No max stated", "No max stated"],
  spartans: ["6,000 BRL a day", "No max stated"],
  toshibet: ["No max", "No max"],
  flush: ["$2,500 a day, $10,000 a month", "No max stated"],
  degencity: ["No max stated", "No max stated"],
  dustbit: ["No max stated", "No max stated"],
  "wager-com": ["EUR 10,000 a month", "No max stated"],
  coincasino: ["EUR 150,000 a month (crypto), higher for VIPs", "No max on crypto for VIPs"],
  bluff: ["$250,000 a month", "No max stated"],
  "1win": ["Daily limit above $50,000", "No max"],
  metawin: ["From $10,000 a day, by tier", "No max"],
};

export function maxWithdrawal(slug: string): string | null {
  return MAX_LIMITS[slug]?.[0] ?? null;
}
export function maxDeposit(slug: string): string | null {
  return MAX_LIMITS[slug]?.[1] ?? null;
}
