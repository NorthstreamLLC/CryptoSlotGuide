/**
 * Ported from `vertPages()` in CryptoSlotGuide.dc.html (search that file
 * for `vertPages() {`) plus the `vp`/`vRows`/`vCols` wiring in
 * renderVals() around `const pages = this.vertPages();`. This is the
 * shared vertical-index page — "one component, six data sources" per
 * design/README.md's build order.
 *
 * The exchanges award cards (`vHasAwards` block, source lines 2033-2058
 * and 3982-3992) are ported below — the five awards (source lines
 * 2894-2900) are all exchanges now present in exchangeRows.json.
 */
import { siteData } from "./site-data";
import {
  bestSpread,
  fill,
  largestCatalogue,
  medianReadMins,
  medianRtp,
  rangeRtpStudios,
  selfCustodyWallets,
  singleRtpStudios,
  splitBuilds,
  topScore,
} from "./derived";

export type VerticalKind = "slots" | "providers" | "sportsbooks" | "wallets" | "exchanges" | "guides";

export interface VerticalRow {
  slug: string;
  name: string;
  mono: string;
  tint: string;
  hasLogo: boolean;
  logo?: string;
  note: string;
  m1: string;
  m2: string;
  m3: string;
  score: string;
  cta: string;
  href: string;
}

export interface VerticalAward {
  slug: string;
  name: string;
  award: string;
  why: string;
  metrics: [string, string][];
  accent: string;
  awardBg: string;
  awardBorder: string;
  logo: string;
  href: string;
}

export interface VerticalPage {
  kicker: string;
  title: string;
  sub: string;
  stats: [string, string][];
  cols: [string, string, string];
  scoreLabel: string;
  note: string;
  tabs?: string[];
  rows: VerticalRow[];
  awardTitle?: string;
  awardSub?: string;
  awards?: VerticalAward[];
}

function logoFor(slug: string): string {
  return slug === "roobet" ? "/assets/roobet-logo.png" : `/assets/logos/${slug}.png`;
}

export function getVerticalPage(kind: VerticalKind, tabIdx = 0): VerticalPage {
  const { slots, providers, walletRows, exchangeRows, guideRows, ops, sportsMarkets, esportsTitles, rtpWatch, sbData } = siteData;

  if (kind === "slots") {
    return {
      kicker: "Slots",
      title: "Slot RTP index",
      sub: "Every RTP below was read from the live paytable inside a funded account, casino by casino. Where a title ships in more than one configuration we name the operator that cut it.",
      stats: [
        [String(slots.length), "Slots tracked"],
        [`${medianRtp(slots).toFixed(2)}%`, "Median RTP"],
        [String(splitBuilds(rtpWatch)), "Titles with split builds"],
      ],
      cols: ["Provider", "RTP", "Max win"],
      scoreLabel: "RTP",
      note: "A slot is only as good as the build your casino licensed. Where an operator ships a cut version we name it in the slot review rather than in this table.",
      rows: slots.map((s) => ({
        slug: s.slug,
        name: s.name,
        mono: s.mono,
        tint: s.tint,
        hasLogo: false,
        note: `${s.vol} volatility · ${s.provider}`,
        m1: s.provider,
        m2: `${s.rtp.toFixed(2)}%`,
        m3: s.maxWin,
        score: s.rtp.toFixed(2),
        cta: "Best build",
        href: `/slots/${s.slug}`,
      })),
    };
  }

  if (kind === "providers") {
    return {
      kicker: "Providers",
      title: "Game studios, profiled",
      sub: "Studios are scored on RTP discipline — whether they let operators ship a cut version of a title — well ahead of catalogue size.",
      stats: [
        [String(providers.length), "Studios profiled"],
        [String(singleRtpStudios(providers)), "Ship one RTP only"],
        [largestCatalogue(providers).toLocaleString(), "Largest catalogue"],
      ],
      cols: ["Titles", "RTP range", "On casinos"],
      scoreLabel: "Score",
      note: `A single published RTP is the strongest signal a studio can send. ${rangeRtpStudios(providers)} of the studios we track publish a range wide enough to change the maths entirely.`,
      rows: providers.map((p) => ({
        slug: p.slug,
        name: p.name,
        mono: p.mono,
        tint: p.tint,
        hasLogo: true,
        logo: logoFor(p.slug),
        note: p.note,
        m1: String(p.titles),
        m2: p.rtp,
        m3: String(p.casinos),
        score: p.score.toFixed(1),
        cta: "Studio profile",
        href: `/providers/${p.slug}`,
      })),
    };
  }

  if (kind === "sportsbooks") {
    const tab = Math.min(tabIdx, 2);
    const cols: [string, string, string][] = [
      ["Margin", "Live markets", "Settlement"],
      ["Best price at", "Margin", "Markets"],
      ["Best price at", "Live markets", "Settlement"],
    ];
    const base = {
      kicker: "Sportsbooks",
      title: "Betting with crypto",
      sub: "Margin measured across forty markets per book, live market counts taken during a major tournament week, settlement timed on real slips.",
      stats: [
        [String(ops.filter((o) => o.sports).length), "Books tested"],
        ["2.1%", "Lowest margin measured"],
        ["84", "Peak live esports markets"],
      ] as [string, string][],
      cols: cols[tab],
      scoreLabel: "Score",
      note: "Margin is the number that compounds. A book a point tighter on football costs you less over a season than any welcome offer returns.",
      tabs: ["Sportsbooks", "Sports", "Esports"],
    };
    if (tab === 1) {
      return {
        ...base,
        rows: sportsMarkets.map((m) => ({
          slug: m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          name: m.name,
          mono: m.mono,
          tint: m.tint,
          hasLogo: false,
          note: m.note,
          m1: m.best,
          m2: m.m2,
          m3: m.m3,
          score: "—",
          cta: "Market page",
          href: "/betting/" + m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        })),
      };
    }
    if (tab === 2) {
      return {
        ...base,
        rows: esportsTitles.map((m) => ({
          slug: m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          name: m.name,
          mono: m.name.slice(0, 2).toUpperCase(),
          tint: "#C4795A",
          hasLogo: false,
          note: m.note,
          m1: "—",
          m2: "—",
          m3: "—",
          score: "—",
          cta: "Title page",
          href: "/betting/" + m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        })),
      };
    }
    return {
      ...base,
      rows: ops
        .filter((o) => o.sports)
        .map((o) => {
          const sb = sbData[o.slug];
          return {
            slug: o.slug,
            name: o.name,
            mono: o.mono,
            tint: "#57B98C",
            hasLogo: true,
            logo: logoFor(o.slug),
            note: o.bonus,
            m1: sb?.margin ?? "—",
            m2: sb ? String(sb.markets) : "—",
            m3: sb?.settle ?? "—",
            score: o.score.toFixed(1),
            cta: "Read review",
            href: `/casinos/${o.slug}`,
          };
        }),
    };
  }

  if (kind === "wallets") {
    return {
      kicker: "Wallets",
      title: "Where the bankroll lives",
      sub: "Custody model, chain coverage and gas handling, tested by moving real funds in and out of casino cashiers.",
      stats: [
        [String(walletRows.length), "Wallets tested"],
        [String(selfCustodyWallets(walletRows)), "Self-custody"],
        [(topScore(walletRows)?.score ?? 0).toFixed(1), "Top score"],
      ],
      cols: ["Custody", "Chains", "Gas handling"],
      scoreLabel: "Score",
      note: "Keep the playing balance and the holding balance in different wallets. Every operator on our index has, at some point, frozen an account mid-review.",
      rows: walletRows.map((w) => ({
        slug: w.slug,
        name: w.name,
        mono: w.mono,
        tint: "#9B8FC4",
        hasLogo: true,
        logo: logoFor(w.slug),
        note: w.note,
        m1: w.m1,
        m2: w.m2,
        m3: w.m3,
        score: w.score.toFixed(1),
        cta: "Wallet review",
        href: `/wallets/${w.slug}`,
      })),
    };
  }

  if (kind === "exchanges") {
    const rawAwards: { award: string; name: string; why: string; m: [string, string][] }[] = [
      { award: "Best overall", name: "Kraken", why: "Tightest measured spread of the five and the only venue with no daily withdrawal cap after verification.", m: [["Spread", "0.09%"], ["Fiat payout", "4h 10m"], ["Score", "8.9"]] },
      { award: "Best for beginners", name: "Coinbase", why: "The shortest path from card to on-chain balance. You pay 0.35% in spread for that, every time.", m: [["Spread", "0.35%"], ["Rails", "ACH, SEPA, card"], ["Score", "8.1"]] },
      { award: "Best for low fees", name: "OKX", why: "Entry-tier taker fee of 0.10% with book depth close to Kraken on majors.", m: [["Spread", "0.11%"], ["Depth 0.5%", "$3.1m"], ["Score", "8.6"]] },
      { award: "Best for fast withdrawals", name: "Bybit", why: "Crypto out in under two minutes on every request we timed, at a $2m daily ceiling.", m: [["Withdrawal", "< 2 min"], ["Limit", "$2m / day"], ["Score", "8.0"]] },
      { award: "Best for altcoin range", name: "KuCoin", why: "Widest listing by a distance. Books thin out fast past the top fifty pairs.", m: [["Pairs", "740+"], ["Spread", "0.22%"], ["Score", "7.6"]] },
    ];
    return {
      kicker: "Exchanges",
      title: "Getting on and off chain",
      sub: "Spreads sampled hourly for two weeks on BTC, ETH and USDT pairs, with fiat rails and real withdrawal limits confirmed on verified accounts.",
      stats: [
        [String(exchangeRows.length), "Exchanges tested"],
        [bestSpread(exchangeRows), "Tightest spread"],
        [(topScore(exchangeRows)?.score ?? 0).toFixed(1), "Top score"],
      ],
      cols: ["Spread", "Fiat rails", "Withdrawal limit"],
      scoreLabel: "Score",
      note: "Spread plus withdrawal fee is the true cost of an onramp. The cheapest headline maker fee on this list is not the cheapest way to fund an account.",
      awardTitle: "Best crypto exchanges for August 2026",
      awardSub: "One superlative per venue, awarded on the measurement that earned it. No venue holds two.",
      awards: rawAwards.map((a, i) => {
        const slug = exchangeRows.find((x) => x.name === a.name)?.slug ?? a.name.toLowerCase();
        return {
          slug,
          name: a.name,
          award: a.award,
          why: a.why,
          metrics: a.m,
          accent: i === 0 ? "#FFCC00" : "#00C2CC",
          awardBg: i === 0 ? "rgba(255,204,0,.10)" : "rgba(0,194,204,.10)",
          awardBorder: i === 0 ? "rgba(255,204,0,.32)" : "rgba(0,194,204,.28)",
          logo: logoFor(slug),
          href: `/exchanges/${slug}`,
        };
      }),
      rows: exchangeRows.map((x) => ({
        slug: x.slug,
        name: x.name,
        mono: x.mono,
        tint: "#5FE3E8",
        hasLogo: true,
        logo: logoFor(x.slug),
        note: x.note,
        m1: x.m1,
        m2: x.m2,
        m3: x.m3,
        score: x.score.toFixed(1),
        cta: "Exchange review",
        href: `/exchanges/${x.slug}`,
      })),
    };
  }

  // guides
  return {
    kicker: "Guides",
    title: "How any of this actually works",
    sub: "The operational detail behind the scores — written once, kept current, and linked from every review that depends on it.",
    stats: [
      [String(guideRows.length), "Guides published"],
      [`${medianReadMins(guideRows)} min`, "Median read"],
      ["Aug 2026", "Last review pass"],
    ],
    cols: ["Category", "Read time", "Updated"],
    scoreLabel: "",
    note: "If a guide contradicts a review, the review is newer. Every guide carries the date of its last full pass at the top.",
    rows: guideRows.map((g) => ({
      slug: g.slug,
      name: g.title,
      mono: g.mono,
      tint: g.tint,
      hasLogo: false,
      note: fill(g.standfirst, siteData),
      m1: g.category,
      m2: `${g.readMins} min`,
      m3: `${g.updated} 2026`,
      score: "—",
      cta: "Read guide",
      href: `/guides/${g.slug}`,
    })),
  };
}
