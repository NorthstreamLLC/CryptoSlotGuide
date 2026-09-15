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
import { hasRtp, hasVol, maxWinLabel, rtpLabel } from "./slot-facts";
import {
  lowestTakerFee,
  fill,
  medianReadMins,
  medianRtp,
  unpublishedRtpStudios,
  selfCustodyWallets,
  allVersionsListedStudios,
  splitBuilds,
} from "./derived";

/** Neutral display order — no list on these pages is ranked. */
const byName = <T extends { name: string }>(a: T, b: T) => a.name.localeCompare(b.name);

export type VerticalKind = "slots" | "providers" | "sportsbooks" | "wallets" | "exchanges" | "guides";

export interface VerticalRow {
  slug: string;
  name: string;
  mono: string;
  tint: string;
  note: string;
  m1: string;
  m2: string;
  m3: string;
  /** Optional fourth fact column (slots: RTP). "—" when the page has no such column. */
  stat: string;
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
  mono: string;
  href: string;
}

export interface VerticalPage {
  kicker: string;
  title: string;
  sub: string;
  stats: [string, string][];
  cols: [string, string, string];
  /** Header for the optional fourth fact column; "" hides the column. */
  statLabel: string;
  note: string;
  tabs?: string[];
  rows: VerticalRow[];
  awardTitle?: string;
  awardSub?: string;
  awards?: VerticalAward[];
}

export function getVerticalPage(kind: VerticalKind, tabIdx = 0): VerticalPage {
  const { slots, providers, walletRows, exchangeRows, guideRows, ops, sportsMarkets, esportsTitles, rtpWatch, sbData } = siteData;

  if (kind === "slots") {
    // rtpWatch only ever holds real readings (empty until the first real
    // import via scripts/import-rtp-readings.mjs — see data/README.md),
    // and splitBuilds() itself excludes stale ones, so this stat is
    // honest without any extra filtering here.
    return {
      kicker: "Slots",
      title: "Slot RTP index",
      sub: "Every RTP below is the studio's published return. Once we field-test a title's build in a specific operator's account, the slot's own review names the operator that cut it — see how we source information for what's checked so far.",
      stats: [
        [String(slots.length), "Slots tracked"],
        [`${medianRtp(slots).toFixed(2)}%`, "Median RTP"],
        [String(splitBuilds(rtpWatch)), "Titles with split builds"],
      ],
      cols: ["Provider", "RTP", "Max win"],
      statLabel: "RTP",
      note: "A slot is only as good as the build your casino licensed. Where an operator ships a cut version we name it in the slot review rather than in this table.",
      rows: slots.map((s) => ({
        slug: s.slug,
        name: s.name,
        mono: s.mono,
        tint: s.tint,
        note: `${hasVol(s) ? `${s.vol} volatility` : "volatility not published"} · ${s.provider}`,
        m1: s.provider,
        m2: rtpLabel(s),
        m3: maxWinLabel(s),
        stat: hasRtp(s) ? s.rtp.toFixed(2) : "—",
        cta: "Slot profile",
        href: `/slots/${s.slug}`,
      })),
    };
  }

  if (kind === "providers") {
    return {
      kicker: "Providers",
      title: "Game studios, profiled",
      sub: "Studios are profiled on RTP disclosure — whether they tell you which versions of a title exist — rather than catalogue size. Every figure is from the studio's own site.",
      stats: [
        [String(providers.length), "Studios profiled"],
        [String(allVersionsListedStudios(providers)), "List every RTP version"],
        [String(unpublishedRtpStudios(providers)), "Publish no RTP"],
      ],
      cols: ["RTP disclosure", "Licensing", "Catalogue"],
      statLabel: "",
      note: `A studio that lists every RTP version it licenses lets you check how far below the headline a casino's build could sit. ${allVersionsListedStudios(providers)} of the studios we track do; ${unpublishedRtpStudios(providers)} publish no RTP on their game pages at all.`,
      rows: [...providers].sort(byName).map((p) => ({
        slug: p.slug,
        name: p.name,
        mono: p.mono,
        tint: p.tint,
        note: p.note,
        m1: p.rtp,
        m2: p.licences,
        m3: p.titlesStated ?? "Not stated",
        stat: "—",
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
    // Margin, market and settlement figures are listed values carried over
    // from the prototype dataset (data/sbData.json, data/esportsTitles.json),
    // not first-hand measurements — label them that way.
    const margins = Object.values(sbData).map((b) => parseFloat(b.margin)).filter((n) => !Number.isNaN(n));
    const esportsMarkets = esportsTitles.map((t) => parseInt(t.m2, 10)).filter((n) => !Number.isNaN(n));
    const base = {
      kicker: "Sportsbooks",
      title: "Betting with crypto",
      sub: "Margin, live market depth and settlement time as listed for each book, side by side. A book's review says which figures have been checked and how.",
      stats: [
        [String(ops.filter((o) => o.sports).length), "Books listed"],
        [margins.length ? `${Math.min(...margins).toFixed(1)}%` : "—", "Lowest listed margin"],
        [esportsMarkets.length ? String(Math.max(...esportsMarkets)) : "—", "Most listed esports markets"],
      ] as [string, string][],
      cols: cols[tab],
      statLabel: "",
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
          note: m.note,
          m1: m.best,
          m2: m.m2,
          m3: m.m3,
          stat: "—",
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
          note: m.note,
          m1: "—",
          m2: "—",
          m3: "—",
          stat: "—",
          cta: "Title page",
          href: "/betting/" + m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        })),
      };
    }
    return {
      ...base,
      rows: ops
        .filter((o) => o.sports)
        .sort(byName)
        .map((o) => {
          const sb = sbData[o.slug];
          return {
            slug: o.slug,
            name: o.name,
            mono: o.mono,
            tint: "#57B98C",
            note: o.bonus,
            m1: sb?.margin ?? "—",
            m2: sb ? String(sb.markets) : "—",
            m3: sb?.settle ?? "—",
            stat: "—",
            cta: "View profile",
            href: `/casinos/${o.slug}`,
          };
        }),
    };
  }

  if (kind === "wallets") {
    return {
      kicker: "Wallets",
      title: "Where the bankroll lives",
      sub: "Where keys live, which chains are covered and what in-wallet swaps cost — each from the wallet maker's own docs.",
      stats: [
        [String(walletRows.length), "Wallets listed"],
        [String(selfCustodyWallets(walletRows)), "Self-custody"],
        [String(walletRows.filter((w) => !/not stated/i.test(w.m3)).length), "Publish a swap fee"],
      ],
      cols: ["Key storage", "Chains", "Swap fee"],
      statLabel: "",
      note: "Keep the playing balance and the holding balance in different wallets. Any operator can freeze an account pending a manual review, and whatever is held there waits with it.",
      rows: [...walletRows].sort(byName).map((w) => ({
        slug: w.slug,
        name: w.name,
        mono: w.mono,
        tint: "#9B8FC4",
        note: w.note,
        m1: w.m1,
        m2: w.m2,
        m3: w.m3,
        stat: "—",
        cta: "Wallet profile",
        href: `/wallets/${w.slug}`,
      })),
    };
  }

  if (kind === "exchanges") {
    // Editorial picks, not measurement results. Every metric shown on a
    // card is read from that venue's exchangeRows record (m1 = entry taker
    // fee, m2 = fiat rails, m3 = withdrawal limit — each cited on its review).
    type ExField = "m1" | "m2" | "m3";
    const rawAwards: { award: string; name: string; why: string; m: [string, ExField][] }[] = [
      { award: "Pick for low fees", name: "Bybit", why: "0.10% maker and taker at the entry tier, and 1M USDT a day in crypto withdrawals on standard KYC.", m: [["Taker fee", "m1"], ["Limit", "m3"]] },
      { award: "Pick for US fiat", name: "Coinbase", why: "The widest US fiat rails of the five — ACH, wire, card and PayPal. No exchange-wide proof of reserves found.", m: [["Rails", "m2"], ["Taker fee", "m1"]] },
      { award: "Pick for regulation", name: "Kraken", why: "MiCA-licensed, FCA-registered and publishes proof of reserves. Its entry-tier Pro fees are the highest of the five.", m: [["Taker fee", "m1"], ["Fiat rails", "m2"]] },
      { award: "Pick for EUR deposits", name: "KuCoin", why: "SEPA and SEPA Instant, plus card and P2P for verified users, at 0.10% on major pairs.", m: [["Rails", "m2"], ["Taker fee", "m1"]] },
      { award: "Pick for reserves reporting", name: "OKX", why: "46 proof-of-reserves reports published, and a $10M daily crypto withdrawal limit on its US pages.", m: [["Limit", "m3"], ["Taker fee", "m1"]] },
    ];
    const highestTakerFee = [...exchangeRows].sort((a, b) => parseFloat(b.m1) - parseFloat(a.m1))[0]?.m1 ?? "—";
    return {
      kicker: "Exchanges",
      title: "Getting on and off chain",
      sub: "Entry-tier fees, fiat rails and withdrawal limits for each venue, side by side — each from the exchange's own fee schedule and help centre.",
      stats: [
        [String(exchangeRows.length), "Exchanges listed"],
        [lowestTakerFee(exchangeRows), "Lowest entry taker fee"],
        [highestTakerFee, "Highest entry taker fee"],
      ],
      cols: ["Entry taker fee", "Fiat rails", "Withdrawal limit"],
      statLabel: "",
      note: "The fee schedule is only part of the cost of an onramp — the spread you cross and the withdrawal fee matter as much. Exchanges don't publish spreads, so compare the live price before moving a bankroll.",
      awardTitle: "Editor's picks: crypto exchanges",
      awardSub: "One editorial pick per venue, each for the cited figure named on the card. No venue holds two, and the order is alphabetical.",
      awards: rawAwards.map((a) => {
        const match = exchangeRows.find((x) => x.name === a.name);
        const slug = match?.slug ?? a.name.toLowerCase();
        return {
          slug,
          name: a.name,
          award: a.award,
          why: a.why,
          metrics: a.m.map(([label, field]): [string, string] => [label, match ? match[field] : "—"]),
          accent: "#00C2CC",
          awardBg: "rgba(0,194,204,.10)",
          awardBorder: "rgba(0,194,204,.28)",
          mono: match?.mono ?? a.name.slice(0, 2).toUpperCase(),
          href: `/exchanges/${slug}`,
        };
      }),
      rows: [...exchangeRows].sort(byName).map((x) => ({
        slug: x.slug,
        name: x.name,
        mono: x.mono,
        tint: "#5FE3E8",
        note: x.note,
        m1: x.m1,
        m2: x.m2,
        m3: x.m3,
        stat: "—",
        cta: "Exchange profile",
        href: `/exchanges/${x.slug}`,
      })),
    };
  }

  // guides
  return {
    kicker: "Guides",
    title: "How any of this actually works",
    sub: "The operational detail behind the reviews — written once, kept current, and linked from every review that depends on it.",
    stats: [
      [String(guideRows.length), "Guides published"],
      [`${medianReadMins(guideRows)} min`, "Median read"],
      [String(new Set(guideRows.map((g) => g.category)).size), "Categories"],
    ],
    cols: ["Category", "Read time", "Updated"],
    statLabel: "",
    note: "If a guide contradicts a review, the review is newer. Every guide carries the date of its last full pass at the top.",
    rows: guideRows.map((g) => ({
      slug: g.slug,
      name: g.title,
      mono: g.mono,
      tint: g.tint,
      note: fill(g.standfirst, siteData),
      m1: g.category,
      m2: `${g.readMins} min`,
      m3: `${g.updated} 2026`,
      stat: "—",
      cta: "Read guide",
      href: `/guides/${g.slug}`,
    })),
  };
}
