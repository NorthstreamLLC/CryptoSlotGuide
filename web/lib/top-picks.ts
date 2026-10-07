import { siteData } from "./site-data";
import { casinoFacts, brandFor } from "./casino-facts";
import { wagerView } from "./wager";
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
  /**
   * Three lines, strongest first. This is a card whose job is the click, so
   * the order is what a reader weighs, not what happens to be in the data:
   *
   *  1. Who vouches for them. A shirt deal with a Premier League club is the
   *     hardest trust signal an operator can buy, and it was sitting third.
   *  2. No wagering, where the operator's own terms say so. Dropped when the
   *     wagering COLUMN went, which was right for a table full of "None" and
   *     wrong for the one card where it is the selling point.
   *  3. Whatever else is concretely good — free withdrawals, recurring drops.
   *
   * The race is not here: it is a tile now, and saying it twice spends a line.
   */
  const notes: Pick["notes"] = [];
  const race = raceFor(o.slug);
  const drop = dropFor(o.slug);
  const partner = partnerFor(o.slug);
  const wv = wagerView(o);
  if (partner) notes.push({ icon: "handshake", text: `Official partner of ${partner}` });
  if (wv.kind === "cited" && wv.mult === 0) notes.push({ icon: "shield", text: "No wagering on rewards" });
  if (notes.length < 3 && c.fee === "Free") notes.push({ icon: "percent", text: "Free withdrawals" });
  if (notes.length < 3 && drop) notes.push({ icon: "clock", text: drop });
  if (notes.length < 3 && c.minWithdrawal && c.minWithdrawal !== "See terms") notes.push({ icon: "coins", text: `${c.minWithdrawal} minimum withdrawal` });

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
      /**
       * The prize pool, where there is one — the biggest number the card can
       * honestly show. It was already on the card as a small note under the
       * tiles; promoting it costs nothing and a $100K raffle deserves more
       * than a footnote.
       *
       * The LABEL is used, not races.ts's `monthly`. That figure is our own
       * arithmetic — weekly x4.3 — documented there as an estimate for
       * sorting. "$3.5M a month" would sell harder and would be a number no
       * operator published.
       *
       * The 11 operators with no race fall back to the withdrawal fee.
       */
      race ? { label: "Prize pool", value: race.label } : { label: "Withdrawal fee", value: c.fee ?? "—" },
    ],
    coins: COINS[o.slug] ?? [],
    notes,
    href: `/casinos/${o.slug}`,
    // Only a real affiliate link, so the sponsored CTA never appears on an
    // operator we have no commercial link with.
    signupUrl: o.affiliate && o.signupUrl ? o.signupUrl : undefined,
    featured: !!o.affiliate,
    cta,
    code: o.affiliate && o.signupUrl ? o.promoCode : undefined,
    offer: o.bonusShort ?? o.bonus,
    perk: o.affiliate && o.signupUrl && o.promoCode ? o.codePerk?.text : undefined,
  };
}

/** The prediction-market card, from data/predMarkets.json's cited facts. */
function predictionPick(name: string): Pick | null {
  const all = [...(predMarkets as Record<string, unknown[]>).crypto, ...(predMarkets as Record<string, unknown[]>).fiat] as {
    name: string;
    site: string;
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
      // A US restriction is the single most useful thing to know here, but it
      // belongs on the card as directions rather than as a warning: we track
      // the US sibling, so say where to go instead of only what is closed.
      ...(m.note
        ? [
            {
              icon: "shield" as const,
              // Names the sibling's actual domain, taken from its own record
              // rather than guessed — polymarket.us, not us.polymarket.com,
              // which does not resolve.
              text: (() => {
                const sib = all.find((v) => v.name === `${m.name} US`);
                if (!/not available in the us/i.test(m.note ?? "") || !sib) return m.note ?? "";
                const host = (() => {
                  try {
                    return new URL(sib.site).hostname.replace(/^www\./, "");
                  } catch {
                    return sib.name;
                  }
                })();
                return `${host} available for the US market`;
              })(),
            },
          ]
        : []),
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
