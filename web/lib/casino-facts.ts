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
  const m = v.match(/(?:(?:USD|EUR|USDT)\s?[\d.,]+(?:\s?(?:k|K|m|M|million))?|[$€£]\s?[\d.,]+(?:\s?(?:k|K|m|M|million))?|[\d.,]+\s?(?:USDT|USDC|USD|EUR|BTC|ETH|LTC|TRX|SOL|DOGE|mBTC)\b)/);
  if (m) return m[0].replace(/\s+/g, " ");
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
    minDeposit: minDep ? shortAmount(minDep) ?? "See terms" : null,
    minWithdrawal: minWd ? shortAmount(minWd) ?? "See terms" : null,
    wagering: wv.kind === "none" ? "No wagering" : wv.kind === "cited" ? (wv.mult === 0 ? "No wagering" : `${wv.mult}×`) : wv.kind === "note" ? "See terms" : null,
    kyc: f("Compliance", "KYC policy") ? ({ none: "No KYC", tiered: "KYC at threshold", required: "KYC required" } as const)[o.kyc] : null,
    licence: f("Compliance", "Licence") ? licenceLabel(o.licence) : null,
  };
}

export function licenceLabel(l: string): string {
  if (/^not stated$/i.test(l)) return "No licence stated";
  if (/^unconfirmed$/i.test(l)) return "Licence unconfirmed";
  if (/N\.V\.|B\.V\.|Ltd|LLC/.test(l)) return `Licensed via ${l}`;
  return `${l} licence`;
}
