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
import { brandFor } from "./casino-facts";
import { sportsFacts, sportsbookOps, booksForTitle, esportsLabel, maxPayoutShort } from "./sports";
import { hasVol, maxWinLabel, rtpLabel } from "./slot-facts";
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
  /**
   * Set only where the row is an operator we hold a real affiliate link for.
   * The table's button then goes to the operator rather than to our own review,
   * which is what the label promises. Absent everywhere else, so slots, wallets
   * and exchanges keep their internal link.
   */
  signupUrl?: string;
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
  /** Sibling pages worth a pill above the table — filters, maps, related indexes. */
  links?: { label: string; href: string }[];
  tabs?: string[];
  rows: VerticalRow[];
  awardTitle?: string;
  awardSub?: string;
  awards?: VerticalAward[];
}

export function getVerticalPage(kind: VerticalKind, tabIdx = 0): VerticalPage {
  const { slots, providers, walletRows, exchangeRows, guideRows, ops, esportsTitles, rtpWatch } = siteData;
  const toSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

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
      cols: ["Provider", "RTP", "Volatility"],
      statLabel: "Max win",
      note: "A slot is only as good as the build your casino licensed. Where an operator ships a cut version we name it in the slot review rather than in this table.",
      links: [
        { label: "Highest RTP", href: "/slots" },
        { label: "Bonus buy", href: "/slots/bonus-buy" },
        { label: "Megaways", href: "/slots/megaways" },
        { label: "Jackpot", href: "/slots/jackpot" },
        { label: "Cluster pays", href: "/slots/cluster-pays" },
        { label: "High volatility", href: "/slots/high-volatility" },
        { label: "RTP Watch", href: "/rtp-watch" },
      ],
      rows: slots.map((s) => ({
        slug: s.slug,
        name: s.name,
        mono: s.mono,
        tint: s.tint,
        note: "",
        m1: s.provider,
        m2: rtpLabel(s),
        m3: hasVol(s) ? `${s.vol[0].toUpperCase()}${s.vol.slice(1)}` : "Not published",
        stat: maxWinLabel(s),
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
      cols: ["RTP disclosure", "Licensing", "Slots we track"],
      statLabel: "",
      note: `A studio that lists every RTP version it licenses lets you check how far below the headline a casino's build could sit. ${allVersionsListedStudios(providers)} of the studios we track do; ${unpublishedRtpStudios(providers)} publish no RTP on their game pages at all.`,
      links: [
        { label: "Studio licence map", href: "/providers/licences" },
        { label: "Slot RTP index", href: "/slots" },
        { label: "RTP Watch", href: "/rtp-watch" },
      ],
      rows: [...providers].sort(byName).map((p) => ({
        slug: p.slug,
        name: p.name,
        mono: p.mono,
        tint: p.tint,
        note: p.note,
        m1: p.rtp,
        m2: p.licences,
        m3: (() => {
          const n = slots.filter((s) => s.provider === p.name).length;
          return n ? `${n} ${n === 1 ? "slot" : "slots"}` : p.titlesStated ?? "Not stated";
        })(),
        stat: "—",
        cta: "Studio profile",
        href: `/providers/${p.slug}`,
      })),
    };
  }

  if (kind === "sportsbooks") {
    const tab = Math.min(tabIdx, 1);
    const books = sportsbookOps();
    const base = {
      kicker: "Sportsbooks",
      title: "Betting with crypto",
      sub: "The crypto casinos on our index that run a sportsbook: esports coverage, cash-out, bet builder and the payout caps in their own betting rules, each cited on the casino's profile.",
      stats: [
        [String(books.length), "Sportsbooks listed"],
        [String(books.filter((o) => sportsFacts(o.slug).titles.length).length), "Name their esports titles"],
        [String(books.filter((o) => sportsFacts(o.slug).maxPayout).length), "State a payout cap"],
      ] as [string, string][],
      cols: (tab === 0 ? ["Esports", "Cash-out", "Bet builder"] : ["Books", "Includes", "Also at"]) as [string, string, string],
      statLabel: tab === 0 ? "Max payout" : "",
      note: "Books quote tighter on marquee events and wider elsewhere. Compare the live price at two or three books before you bet; the gap is usually worth more than any promotion.",
      tabs: ["Sportsbooks", "Esports"],
    };
    if (tab === 1) {
      return {
        ...base,
        rows: esportsTitles.map((m) => {
          const bks = booksForTitle(m.name);
          return {
            slug: toSlug(m.name),
            name: m.name,
            mono: m.mono,
            tint: m.tint,
            note: m.note,
            m1: `${bks.length} sportsbooks`,
            m2: bks.slice(0, 2).map((b) => b.name).join(", ") || "—",
            m3: bks.slice(2, 4).map((b) => b.name).join(", ") || "—",
            stat: "—",
            cta: "See books",
            href: "/betting/" + toSlug(m.name),
          };
        }),
      };
    }
    return {
      ...base,
      rows: books.map((o) => {
        const s = sportsFacts(o.slug);
        const yes = (f: unknown) => (f ? "Yes" : "—");
        const offer = s.offer?.value ?? "";
        const offerNote = /^rotating/i.test(offer) ? "Rotating sports promotions" : /^no /i.test(offer) ? "No sports welcome offer" : offer ? offer.split(/[.:;]/)[0].replace(/^(Sports Welcome Bonus|Champions Welcome Bonus, sports version)s*/i, "").trim() : "";
        const provider = s.provider?.value?.split(/[.(]/)[0].trim();
        return {
          slug: o.slug,
          name: o.name,
          mono: o.mono,
          tint: brandFor(o.slug),
          note: [offerNote, provider ? `Powered by ${provider}` : ""].filter(Boolean).join(" · "),
          m1: esportsLabel(o.slug).replace("Not found", "—"),
          m2: yes(s.cashout),
          m3: yes(s.betBuilder),
          stat: maxPayoutShort(o.slug).replace("Not found", "—"),
          cta: o.affiliate && o.signupUrl ? `Visit ${o.name}` : "Read review",
          href: `/casinos/${o.slug}`,
          signupUrl: o.affiliate && o.signupUrl ? o.signupUrl : undefined,
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
      links: [
        { label: "Coins we track", href: "/coins" },
        { label: "Exchanges", href: "/exchanges" },
        { label: "No-KYC casinos", href: "/crypto-casinos/no-kyc" },
      ],
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
      links: [
        { label: "Wallets", href: "/wallets" },
        { label: "Coins we track", href: "/coins" },
        { label: "Fastest payouts", href: "/fastest-payouts" },
      ],
      note: "The fee schedule is only part of the cost of an onramp — the spread you cross and the withdrawal fee matter as much. Exchanges don't publish spreads, so compare the live price before moving a bankroll.",
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
    links: [
      { label: "How we source information", href: "/how-we-rate" },
      { label: "Gambling laws", href: "/legal" },
      { label: "Find my casino", href: "/find-my-casino" },
    ],
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
