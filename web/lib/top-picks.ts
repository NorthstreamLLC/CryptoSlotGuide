import { siteData } from "./site-data";
import { casinoFacts, brandFor } from "./casino-facts";
import { raceFor, dropFor, partnerFor } from "./races";
import type { Pick } from "@/components/home/TopPicks";
import coinsBy from "@/data/coinsBy.json";
import predMarkets from "@/data/predMarkets.json";
import exchangeRows from "@/data/exchangeRows.json";

/**
 * The four cards the homepage hero rotates through, one per vertical.
 *
 * Assembled here rather than in the page so the card component stays a pure
 * renderer and the whole data layer stays on the server — a client component
 * importing predMarkets.json would ship every cited fact in it to the browser.
 *
 * Nothing here invents a claim. Each card's figures are the same cited values
 * the entity's own page shows, and an entry is skipped entirely if its source
 * data is missing rather than rendered with gaps.
 */

const COINS = coinsBy as Record<string, string[]>;

/** A casino or sportsbook card, from the operator's own cited facts. */
function operatorPick(slug: string, category: string, cta: string): Pick | null {
  const o = siteData.ops.find((x) => x.slug === slug);
  if (!o) return null;
  const c = casinoFacts(o);
  const notes: Pick["notes"] = [];
  const race = raceFor(o.slug);
  const drop = dropFor(o.slug);
  const partner = partnerFor(o.slug);
  if (race) notes.push({ icon: "trophy", text: race.label });
  if (drop) notes.push({ icon: "clock", text: drop });
  if (partner) notes.push({ icon: "handshake", text: `Official partner of ${partner}` });
  if (notes.length < 3 && c.fee === "Free") notes.push({ icon: "percent", text: "Free withdrawals" });

  return {
    slug: o.slug,
    name: o.name,
    mono: o.mono,
    tint: brandFor(o.slug),
    category,
    // casinoFacts already formats this as "Curacao licence" — appending the
    // word again produced "Curacao licence licence".
    sub: [c.licence, c.kyc].filter(Boolean).join(" · "),
    headline: c.headline,
    stats: [
      { label: "Withdrawals", value: c.withdrawals ?? "—" },
      { label: "Min deposit", value: c.minDeposit ?? "—" },
      { label: "Wagering", value: c.wagering ?? "—" },
    ],
    coins: COINS[o.slug] ?? [],
    notes,
    href: `/casinos/${o.slug}`,
    // Only a real affiliate link, so the sponsored CTA never appears on an
    // operator we have no commercial link with.
    signupUrl: o.affiliate && o.signupUrl ? o.signupUrl : undefined,
    featured: !!o.affiliate,
    cta,
  };
}

/** The prediction-market card, from data/predMarkets.json's cited facts. */
function predictionPick(name: string): Pick | null {
  const all = [...(predMarkets as Record<string, unknown[]>).crypto, ...(predMarkets as Record<string, unknown[]>).fiat] as {
    name: string;
    settle: string;
    fee: string;
    kyc: string;
    payout: string;
    note?: string;
    tint?: string;
    facts?: { label: string; text: string }[];
  }[];
  const m = all.find((x) => x.name.toLowerCase() === name.toLowerCase());
  if (!m) return null;

  // The operating entity, where the venue's own pages name one.
  const operator = m.facts?.find((f) => f.label === "Operator")?.text ?? null;

  return {
    slug: name.toLowerCase(),
    name: m.name,
    mono: m.name.slice(0, 2).toUpperCase(),
    tint: m.tint ?? "#00C2CC",
    category: "Prediction market",
    sub: operator ? operator.split("(")[0].trim() : "Prediction market",
    headline: "Trade real-world events, settled on chain",
    stats: [
      { label: "Settles in", value: m.settle.split("·")[0].trim() },
      { label: "Fees", value: /takers only/i.test(m.fee) ? "Takers only" : m.fee.split(";")[0].trim() },
      { label: "Sign-up", value: m.kyc },
    ],
    notes: [
      { icon: "coins", text: m.payout },
      // The US restriction is the single most useful thing to know about it,
      // so it rides on the card rather than waiting for the profile page.
      ...(m.note ? [{ icon: "shield" as const, text: m.note }] : []),
    ],
    href: "/prediction-markets",
    cta: "Compare markets",
  };
}

/** The exchange card, from data/exchangeRows.json. */
function exchangePick(slug: string): Pick | null {
  const x = (exchangeRows as { slug: string; name: string; mono: string; hed: string; note: string; m1: string; m2: string; m3: string }[]).find(
    (e) => e.slug === slug
  );
  if (!x) return null;
  return {
    slug: x.slug,
    name: x.name,
    mono: x.mono,
    tint: brandFor(x.slug),
    category: "Exchange",
    sub: "Where the bankroll starts",
    // The row's own headline, trimmed to a sentence that stands alone.
    headline: x.hed.charAt(0).toUpperCase() + x.hed.slice(1),
    stats: [
      { label: "Taker fee", value: x.m1 },
      { label: "Fiat rails", value: x.m2 },
      { label: "Withdrawal cap", value: x.m3 },
    ],
    notes: [{ icon: "id", text: x.note }],
    href: `/exchanges/${x.slug}`,
    cta: "See the fees",
  };
}

/**
 * Order matters: the casino is index 0 so every first visit lands on it before
 * the rotation starts, and the rest run in funnel order — where you bet, what
 * you bet on, where the money comes from.
 */
export function topPicks(): Pick[] {
  return [
    operatorPick("roobet", "Crypto casino", "Visit Roobet"),
    operatorPick("sportsbet-io", "Sportsbook", "See the offer"),
    predictionPick("Polymarket"),
    exchangePick("coinbase"),
  ].filter((p): p is Pick => p !== null);
}
