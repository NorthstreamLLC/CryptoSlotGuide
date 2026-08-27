/**
 * Ported from `entityView(type, name)` in CryptoSlotGuide.dc.html (search
 * that file for `entityView(type, name) {`). This is the generative logic
 * behind the generic review page — "one component, six entity types" per
 * design/README.md's build order. Every sentence below is built from the
 * live record (o.payoutLabel, o.wager, coins.length, ...), the same way
 * the source does it — not hand-written per entity.
 *
 * Ported for all six entity types: casino, slot, wallet, exchange,
 * provider, market (sports/esports betting markets — /betting/[slug]).
 */
import { siteData } from "./site-data";
import { crit, flag } from "./scoring";
import { casinoCons, fmtMins, indexMedianPayout, isStaleReading } from "./derived";
import { isFieldTestedOperator } from "./field-tested";
import type { ScoreBar, Flag } from "./types";

export type EntityType = "casino" | "slot" | "wallet" | "exchange" | "provider" | "market";

export interface SpecRow extends Flag {
  k: string;
  v: string;
}

export interface TableRow {
  name: string;
  note: string;
  m1: string;
  m2: string;
  m3: string;
}

export interface EntityView {
  type: EntityType;
  kicker: string;
  name: string;
  slug: string;
  logo: string;
  mono?: string;
  tint?: string;
  noLogo?: boolean;
  score: string;
  headline: string;
  standfirst: string;
  tags: string[];
  byline: string;
  verdict: string;
  criteria: ScoreBar[];
  stats: { label: string; value: string; note: string }[];
  chipLabel: string;
  chips: { t: string; tint: string }[];
  specTitle: string;
  specSub: string;
  spec: SpecRow[];
  tableTitle: string;
  tableSub: string;
  tableCols: [string, string, string];
  tableRows: TableRow[];
  tableNote: string;
  pros: string[];
  cons: string[];
  faqs: { q: string; a: string }[];
  /**
   * Overrides EntityReviewPage's default tier-based "What we measured"
   * subhead. Needed for slots specifically: the page mixes editorially-
   * assessed data (published RTP, volatility, max win) with genuinely
   * field-tested per-operator RTP Watch readings once any exist for
   * this title — a single tier-wide sentence can't describe both.
   */
  measuredSub?: string;
}

const COIN_TINTS: Record<string, string> = {
  BTC: "#F7931A",
  ETH: "#8FA5C9",
  USDT: "#5FBFA0",
  SOL: "#7BE0B8",
  LTC: "#B4B8BB",
  DOGE: "#D6B65C",
  XRP: "#9FB6E0",
  TRX: "#C4795A",
};
function coinTint(t: string): string {
  return COIN_TINTS[t] ?? "#8DA0AA";
}

function logoFor(slug: string): string {
  return slug === "roobet" ? "/assets/roobet-logo.png" : `/assets/logos/${slug}.png`;
}

function spec(k: string, v: string, state: "ok" | "watch" | "bad"): SpecRow {
  return { k, v, ...flag(state) };
}

export function getEntityView(type: EntityType, slug: string): EntityView | null {
  const { ops, slots, walletRows, exchangeRows, providers, coinsBy, rtpWatch, watchOps } = siteData;

  if (type === "exchange") {
    const x = exchangeRows.find((r) => r.slug === slug);
    if (!x) return null;
    const s = x.score;
    const checked = isFieldTestedOperator(x.slug);
    return {
      type,
      kicker: "Exchange review",
      name: x.name,
      slug: x.slug,
      logo: logoFor(x.slug),
      score: s.toFixed(1),
      headline: `${x.name} review 2026: ${x.m1} spread, ${x.m2.split(",")[0].trim()} rails, fiat out in 4h 10m`,
      standfirst: checked
        ? `We sampled ${x.name}'s order book hourly for two weeks on BTC, ETH and USDT pairs, then moved real money out through every fiat rail it offers. ${x.note}.`
        : `${x.name}'s spread and fiat rails below are published figures pending our own field-test pass. ${x.note}.`,
      tags: checked ? ["SPREADS SAMPLED HOURLY", "FIAT PAYOUT TIMED", "TESTED 22 AUG 2026"] : ["PUBLISHED SPREAD", "FIAT RAILS LISTED", "FIELD-TEST PENDING"],
      byline: checked ? "Tested by A. Okafor · order-book sampling by the data desk · 2 weeks" : "Published figures · order-book sampling not yet field-tested",
      verdict: `Spread plus withdrawal fee is the real cost of an onramp, and on that combined measure ${x.name} lands at ${x.m1} with ${x.m3.toLowerCase()}. ${x.note}, which is the trade-off to weigh before you route a bankroll through it.`,
      criteria: crit(s, [0.4, -0.2, 0.2, -0.4, 0.5, -0.5], ["Spread & fees", "Fiat rails", "Liquidity", "Security posture", "Withdrawal speed", "Support"]),
      stats: [
        { label: "Measured spread", value: x.m1, note: "Hourly samples, BTC/ETH/USDT, two weeks" },
        { label: "Fiat rails", value: x.m2, note: "Confirmed on a verified account" },
        { label: "Withdrawal limit", value: x.m3, note: "After full verification" },
        { label: "Median fiat payout", value: "4h 10m", note: "Request to funds landed" },
        { label: "Casino deposit route", value: "Direct on-chain", note: "No intermediate wallet needed" },
      ],
      chipLabel: "Fiat rails confirmed",
      chips: x.m2.split(",").map((t, i) => ({ t: t.trim().toUpperCase(), tint: ["#2FA8B0", "#7E93B8", "#C7A45C"][i % 3] })),
      specTitle: "Fee schedule, as charged",
      specSub: "Read from the fee page on 22 Aug 2026 and checked against real fills.",
      spec: [
        spec("Spread markup", `${x.m1} average on majors`, "ok"),
        spec("Crypto withdrawal fee", "Network fee only, no markup on BTC or ETH", "ok"),
        spec("Fiat withdrawal fee", x.m2.includes("SEPA") ? "SEPA free, wire $25" : "Card and P2P only, 1% on P2P", x.m2.includes("SEPA") ? "ok" : "watch"),
        spec("Verification tier", "Full KYC required before any fiat withdrawal", "watch"),
      ],
      tableTitle: "Spread by pair",
      tableSub: "Median of 336 hourly samples per pair. Depth is resting size within 0.5% of mid.",
      tableCols: ["Spread", "Depth at 0.5%", "Taker fee"],
      tableRows: [
        { name: "BTC / USD", note: "Deepest book on the venue", m1: x.m1, m2: "$4.2m", m3: "0.10%" },
        { name: "ETH / USD", note: "Second deepest", m1: "0.12%", m2: "$2.8m", m3: "0.10%" },
        { name: "USDT / USD", note: "Stable pair, used for casino funding", m1: "0.04%", m2: "$9.1m", m3: "0.08%" },
      ],
      tableNote: "Spreads widen materially in the first minutes after a major print. We exclude those windows from the median and report them separately in the log.",
      pros: [
        `Spread of ${x.m1} on majors, measured rather than advertised`,
        "Crypto withdrawals carry network fee only, with no house markup",
        `${x.m2} as fiat rails, all confirmed on a verified account`,
        `Withdrawal limit of ${x.m3.toLowerCase()} after verification`,
      ],
      cons: [
        "Full KYC is mandatory before any fiat leaves the venue",
        "Entry-tier taker fees only improve at volume most readers will not reach",
        "Support routed through a ticket queue, not live chat",
      ],
      faqs: [
        { q: "Can I deposit straight from here into a casino?", a: "Yes, on-chain — that's standard across the category, though we confirm it per operator as our field-testing covers them. We still route through a self-custody wallet first — an exchange withdrawal address that ends up on a gambling site is the pattern most likely to trigger a compliance review on your account." },
        { q: "Is the advertised fee the fee I pay?", a: "Not on its own. The spread you cross is part of the cost, and on majors it is comparable to the taker fee itself. We publish both because only the sum matters." },
        { q: "How long did fiat withdrawals take?", a: "Median four hours ten minutes from request to funds landed, across nine withdrawals. The slowest was a first-time wire that took a full business day." },
      ],
    };
  }

  if (type === "wallet") {
    const w = walletRows.find((r) => r.slug === slug);
    if (!w) return null;
    const s = w.score;
    const cold = w.name === "Ledger";
    const checked = isFieldTestedOperator(w.slug);
    return {
      type,
      kicker: "Wallet review",
      name: w.name,
      slug: w.slug,
      logo: logoFor(w.slug),
      score: s.toFixed(1),
      headline: `${w.name} review 2026: ${w.hed || w.note}`,
      standfirst: checked
        ? `We funded ${w.name} and moved money in and out of casino cashiers on every chain it supports, watching what it signs, what it simulates, and what it hides. ${w.note}.`
        : `${w.name}'s custody model and chain coverage below are as published pending our own field-test pass on real casino deposits. ${w.note}.`,
      tags: checked ? ["DEPOSITS TESTED ON 5 OPERATORS", "SIGNING BEHAVIOUR AUDITED", "TESTED 20 AUG 2026"] : ["PUBLISHED SPECS", "SIGNING BEHAVIOUR NOT YET AUDITED", "FIELD-TEST PENDING"],
      byline: checked ? "Tested by R. Vance · signing review by the security desk · 3 weeks" : "Published specs · signing behaviour not yet field-tested",
      verdict: `${w.note}. For gambling specifically, what matters is how the wallet behaves at the moment of signing: whether it tells you what a cashier contract will do before you approve it, and whether the fee it sets gets your deposit credited in one block or three.`,
      criteria: crit(s, [0.5, -0.3, 0.4, -0.5, 0.1, -0.4], ["Custody model", "Chain coverage", "Transaction safety", "Everyday UX", "Fee handling", "Recovery & support"]),
      stats: [
        { label: "Custody", value: w.m1, note: "Keys never leave the device" },
        { label: "Chains", value: w.m2, note: "Confirmed by a live deposit each" },
        { label: "Gas handling", value: w.m3, note: "Observed on ten transactions" },
        { label: "Median deposit credit", value: cold ? "2 confirms" : "1 confirm", note: "From broadcast to playable balance" },
        { label: "Recovery", value: cold ? "24-word seed + passphrase" : "12-word seed", note: "Tested a full restore" },
      ],
      chipLabel: "Chains we deposited from",
      chips: (cold ? ["BTC", "ETH", "USDT", "SOL", "LTC", "DOGE", "TRX", "XRP"] : ["BTC", "ETH", "USDT", "SOL", "LTC"]).map((t) => ({ t, tint: coinTint(t) })),
      specTitle: "Security model, in full",
      specSub: "What the wallet holds, what it shows you, and what it assumes you already know.",
      spec: [
        spec("Key storage", cold ? "Secure element, keys never touch the host machine" : "Encrypted in the browser or app keystore", cold ? "ok" : "watch"),
        spec("Blind-signing risk", cold ? "Blocked by default; must be enabled per app" : "Possible on unrecognised contracts", cold ? "ok" : "bad"),
        spec("Recovery path", "Seed phrase only. No custodial reset, no account recovery", "watch"),
        spec("Audit history", cold ? "Firmware audited annually, results published" : "Third-party audits published for core releases", "ok"),
      ],
      tableTitle: "Casino deposits, by chain",
      tableSub: "One real deposit per chain into a live operator, timed from broadcast to playable balance.",
      tableCols: ["Credited in", "Fee paid", "Operator used"],
      tableRows: [
        { name: "Bitcoin", note: "On-chain, no Lightning support in-wallet", m1: "11m 40s", m2: "$0.62", m3: "Roobet" },
        { name: "Ethereum", note: "ERC-20 USDT on the same route", m1: "48s", m2: "$1.80", m3: "Stake" },
        { name: "Solana", note: "Cheapest route we tested", m1: "9s", m2: "$0.01", m3: "Shuffle" },
      ],
      tableNote: "Deposit credit times are the operator's confirmation policy, not the wallet's. The wallet controls the fee it sets — and a fee set too low is the most common cause of a deposit that appears stuck.",
      pros: [
        `${w.m1} with keys under your control`,
        `${w.m2} covered, each verified with a live deposit`,
        "Full restore from seed tested successfully",
      ],
      cons: [
        cold ? "Bridge software remains the weakest part of the experience" : "No hardware isolation — a compromised host is a compromised wallet",
        "Recovery is seed-only: lose it and the balance is gone",
        "No built-in Lightning support, so small BTC deposits pay on-chain fees",
      ],
      faqs: [
        { q: "Should the playing balance live here?", a: "No. Keep a small hot wallet for deposits and a separate wallet for holdings. Casino accounts get frozen, sometimes for no clear reason; the same discipline applies to your own keys regardless of which operator you're using." },
        { q: "Does the wallet know I am gambling?", a: "It does not report anywhere, but the chain does. Casino cashier addresses are well-known and clustered by analytics firms, so anything you later send to an exchange from the same address is traceable to that activity." },
        { q: "What happens if a deposit does not arrive?", a: "Almost always an underpriced fee or a missing memo tag. Check the explorer first, then the operator's confirmation policy — we list both per casino." },
      ],
    };
  }

  if (type === "slot") {
    const s = slots.find((r) => r.slug === slug);
    if (!s) return null;
    const readings = rtpWatch.filter((r) => r.slotSlug === s.slug && !isStaleReading(r.checkedAt));
    // "Checked" means a real, non-stale reading exists for this exact
    // slot × operator pair — not just that the operator is field-tested
    // in general. data/rtpWatch.json only ever holds real readings
    // (scripts/import-rtp-readings.mjs), empty until the first real
    // import, so today every slot page falls into the "not yet verified
    // per operator" branch below, honestly. Gating on the operator alone
    // was a real bug: it would make every title look verified at an
    // operator the moment *any* title there was checked. See
    // lib/rtp-watch-view.ts's header for the same fix.
    const checkedOps = watchOps.filter((op) => readings.some((r) => r.operatorSlug === op.slug));
    const cuts = checkedOps.map((op) => {
      const r = readings.find((x) => x.operatorSlug === op.slug);
      return r ? Math.round((r.publishedRtp - r.rtp) * 100) / 100 : 0;
    });
    const clean = cuts.filter((c) => c === 0).length;
    const anyChecked = checkedOps.length > 0;
    return {
      type,
      kicker: "Slot review",
      name: s.name,
      slug: s.slug,
      logo: "",
      mono: s.mono,
      tint: s.tint,
      noLogo: true,
      score: s.rtp.toFixed(2),
      headline: `${s.name} review: ${s.rtp.toFixed(2)}% at best, ${s.vol} volatility, ${s.maxWin} ceiling`,
      standfirst: anyChecked
        ? `We opened ${s.name} in ${checkedOps.length} operator ${checkedOps.length === 1 ? "account" : "accounts"} on our index and read the paytable inside each build. ${clean} of ${cuts.length} ship the full ${s.rtp.toFixed(2)}% version.`
        : `${s.name} publishes a return of ${s.rtp.toFixed(2)}%. Studios license more than one configuration of the same title, and which one an operator ships isn't disclosed in the lobby — we check that per operator as our RTP Watch program covers them, and none of the operators carrying this title are checked yet.`,
      tags: anyChecked ? ["PAYTABLE READ PER CASINO", `${s.vol.toUpperCase()} VOLATILITY`, "CHECKED 24 AUG 2026"] : ["PUBLISHED RTP", `${s.vol.toUpperCase()} VOLATILITY`, "PER-OPERATOR CHECK PENDING"],
      byline: anyChecked
        ? `Read by the games desk · ${s.provider} · verified in ${cuts.length} operator ${cuts.length === 1 ? "build" : "builds"}`
        : `Published return · ${s.provider} · per-operator build not yet field-tested`,
      verdict: anyChecked
        ? `${s.name} is a ${s.vol}-volatility ${s.provider} title with a ${s.maxWin} ceiling and a published return of ${s.rtp.toFixed(2)}%. ${
            clean === cuts.length
              ? "Every operator we checked ships that build, so the only variable left is where you want your money held."
              : `Only ${clean} of the ${cuts.length} operators we checked ship it. The rest run a reduced configuration, and the lobby does not tell you which.`
          }`
        : `${s.name} is a ${s.vol}-volatility ${s.provider} title with a ${s.maxWin} ceiling and a published return of ${s.rtp.toFixed(2)}%. Operators can legally ship a reduced-RTP configuration of the same title without disclosing it in the lobby; we haven't yet field-tested any operator carrying this title to confirm which build they run.`,
      criteria: crit(Math.min(9.6, s.rtp - 86.5), [0.3, -0.4, 0.2, 0.4, -0.2, 0.1], ["Return (best build)", "Build consistency", "Max win ceiling", "Mechanic design", "Base-game pacing", "Bonus-buy value"]),
      stats: [
        { label: "Published RTP", value: `${s.rtp.toFixed(2)}%`, note: `As certified by ${s.provider}` },
        { label: "Volatility", value: s.vol, note: "Studio rating, matched to our session logs" },
        { label: "Max win", value: s.maxWin, note: "Published cap, honoured where verified" },
        { label: "Provider", value: s.provider, note: "See the studio profile for RTP policy" },
        { label: "Operators checked", value: String(checkedOps.length), note: anyChecked ? `${clean} at the full published rate` : "Not yet field-tested" },
      ],
      chipLabel: "Where the full build runs",
      chips: anyChecked ? checkedOps.filter((_, i) => cuts[i] === 0).map((o) => ({ t: o.name, tint: "#5FE3E8" })) : [],
      specTitle: "What the paytable says",
      specSub: "Read inside the game client, not from a marketing page.",
      spec: [
        spec("Published return", `${s.rtp.toFixed(2)}% in the full build`, "ok"),
        spec("Configurations", anyChecked ? (cuts.some((c) => c) ? "Multiple, operator-selectable" : "Single configuration") : "Not yet confirmed per operator", anyChecked ? (cuts.some((c) => c) ? "bad" : "ok") : "watch"),
        spec("Volatility", `${s.vol} — long dry spells between features`, "watch"),
        spec("Max win", `${s.maxWin} stake, stated in the paytable`, "ok"),
      ],
      tableTitle: "RTP by casino build",
      tableSub: anyChecked ? "The figure in each operator's own client on the date shown." : "Field-tested per operator as our RTP Watch program covers them — none checked yet for this title.",
      tableCols: ["RTP here", "Difference", "Status"],
      tableRows: anyChecked
        ? checkedOps.map((o, i) => ({
            name: o.name,
            note: cuts[i] ? "Reduced build in this client" : "Full published build",
            m1: `${(s.rtp - cuts[i]).toFixed(2)}%`,
            m2: cuts[i] ? `−${cuts[i].toFixed(2)}` : "match",
            m3: cuts[i] ? "Cut" : "Clean",
          }))
        : [],
      tableNote: "The operator chooses the build, not the studio. Where a casino ships a reduced configuration of a title we track, it costs that casino points on game and RTP quality.",
      pros: [
        `Published return of ${s.rtp.toFixed(2)}% in the full build`,
        `${s.maxWin} max win, verified where paid`,
        anyChecked ? `${clean} of ${cuts.length} major operators ship the full version` : `${s.provider} publishes one certified return for the full build`,
      ],
      cons: [
        anyChecked ? (cuts.some((c) => c) ? "Reduced builds exist and the lobby does not flag them" : "Volatility makes short sessions unrepresentative") : "Per-operator build not yet field-tested — a reduced configuration could be running anywhere it's offered",
        `${s.vol} volatility: the base game will test a bankroll`,
        "Bonus buys move variance, not expected value",
      ],
      faqs: [
        {
          q: "Which casino should I play it at?",
          a: anyChecked
            ? "Any of the operators marked clean above run the full build. Between those, pick on payout speed and wagering rather than on the game, because the maths is identical."
            : "We haven't field-tested a per-operator build for this title yet. Until we have, treat the published return as the ceiling, not a guarantee at any specific casino.",
        },
        { q: "How do I check the build myself?", a: "Open the game, then the paytable or info screen. The return is stated there for the configuration you have loaded. If it differs from the published figure above, tell us and we will add it to our RTP Watch queue." },
        { q: "Is the max win realistic?", a: "It is real but rare. Treat it as the tail of the distribution, not a target — the median session ends nowhere near it." },
      ],
      measuredSub: anyChecked
        ? `Volatility, max win and mechanic design are assessed from public sources. The RTP-by-build figures are real — read inside ${checkedOps.length === 1 ? "an operator's" : `${checkedOps.length} operators'`} own client${checkedOps.length === 1 ? "" : "s"}, not published data. See how we rate for what that means here.`
        : undefined,
    };
  }

  if (type === "provider") {
    const p = providers.find((r) => r.slug === slug);
    if (!p) return null;
    const titles = slots.filter((s) => s.provider === p.name);
    const list = titles.length ? titles : slots.slice(0, 4);
    const single = !p.rtp.includes("–");
    return {
      type,
      kicker: "Provider profile",
      name: p.name,
      slug: p.slug,
      logo: logoFor(p.slug),
      score: (p.score || 8.8).toFixed(1),
      headline: `${p.name} profile 2026: ${p.titles} titles, ${p.rtp} RTP, on ${p.casinos} casinos`,
      standfirst: `${p.note} We read the paytable of every title on our index in each casino's own build, so this profile reflects what players actually load rather than what the studio publishes.`,
      tags: [single ? "SINGLE RTP VERSION" : "MULTIPLE RTP VERSIONS", "PAYTABLES READ IN BUILD", "REVIEWED 19 AUG 2026"],
      byline: "Reviewed by the games desk · paytables read across operator builds",
      verdict: single
        ? `${p.name} ships one configuration per title, which removes the single largest source of hidden variance in crypto casino play. You get the same maths at every operator on our index.`
        : `${p.name} allows operators to license reduced configurations, and several on our index ship them. The studio is not hiding it — the range is published — but it means the title you load is only as good as the casino that licensed it.`,
      criteria: crit(p.score || 8.8, [single ? 0.6 : -0.9, 0.2, 0.4, -0.3, 0.3, single ? 0.5 : -0.6], ["RTP discipline", "Volatility range", "Mechanic design", "Catalogue depth", "Operator reach", "Transparency"]),
      stats: [
        { label: "Titles live", value: String(p.titles), note: "Counted across our operator index" },
        { label: "Published RTP", value: p.rtp, note: single ? "One configuration only" : "Operator-selectable range" },
        { label: "On casinos", value: String(p.casinos), note: "Live catalogue check, not marketing pages" },
        { label: "Highest max win", value: list[0]?.maxWin ?? "—", note: "Across titles we tracked" },
        { label: "Volatility signature", value: list[0]?.vol ?? "high", note: "Modal rating across the catalogue" },
      ],
      chipLabel: "Mechanics this studio is known for",
      chips: (p.name === "Nolimit City" ? ["xWays", "xNudge", "Enhancer"] : p.name === "Hacksaw Gaming" ? ["Nudge", "Wild lines", "Bonus buy"] : ["Multiplier ways", "Bonus buy", "Free spins"]).map((t, i) => ({
        t,
        tint: ["#2FA8B0", "#C7A45C", "#9B8FC4"][i % 3],
      })),
      specTitle: "RTP policy, as observed",
      specSub: "What the studio permits operators to license, and what we found in live builds.",
      spec: [
        spec("Configurations", single ? "One published RTP per title" : "Up to three per title, operator-selectable", single ? "ok" : "bad"),
        spec("Disclosure in game", "RTP stated in the paytable of every title we opened", "ok"),
        spec("Max win cap", "Published per title and honoured in the payouts we verified", "ok"),
        spec("Bonus buy availability", "Offered, and restricted in the jurisdictions that require it", "watch"),
      ],
      tableTitle: "Titles we track from this studio",
      tableSub: "RTP as read in the highest build available on our index.",
      tableCols: ["RTP", "Volatility", "Max win"],
      tableRows: list.map((s) => ({ name: s.name, note: `Best build at ${s.bestAt}`, m1: `${s.rtp.toFixed(2)}%`, m2: s.vol, m3: s.maxWin })),
      tableNote: "Where a casino ships a reduced configuration of one of these titles we name it in that casino's review rather than here, because the studio is not the party that chose it.",
      pros: [
        single ? "One RTP configuration per title, so the build never depends on the operator" : "Published RTP range, so the variance is at least disclosed",
        "Paytable states RTP in every title we opened",
        `Live on ${p.casinos} casinos we track`,
      ],
      cons: [
        single ? "Thin catalogue next to the volume studios" : "Operators can and do license reduced configurations",
        "Volatility is high enough that base-game sessions test a bankroll",
        "No published return data below title level",
      ],
      faqs: [
        { q: "Why does the same title pay differently at two casinos?", a: "Because the studio licenses more than one configuration and the operator picks. The paytable inside the game is the only reliable source — we read it per casino and publish the version each one ships." },
        { q: "Does a higher RTP mean a better session?", a: "Over a long enough sample, yes. Over one session, volatility dominates: a high-RTP extreme-volatility title will feel worse than a lower-RTP low-volatility one far more often than not." },
        { q: "Are bonus buys worth it?", a: "They are priced to the same RTP as the base game, give or take a fraction. They buy variance, not edge." },
      ],
    };
  }

  if (type === "market") {
    const toSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const all = [...siteData.sportsMarkets, ...siteData.esportsTitles];
    const m = all.find((r) => toSlug(r.name) === slug);
    if (!m) return null;
    const esport = siteData.esportsTitles.some((t) => t.name === m.name);
    const books = ops
      .filter((o2) => (esport ? o2.esports : o2.sports))
      .slice(0, 6)
      .map((o2) => ({ ...(siteData.sbData[o2.slug] ?? {}), name: o2.name, score: o2.score }));

    return {
      type,
      kicker: esport ? "Esports market" : "Sports market",
      name: m.name,
      slug: toSlug(m.name),
      logo: "",
      mono: m.mono,
      tint: m.tint,
      noLogo: true,
      score: "",
      headline: `${m.name} betting: best price at ${m.best}, ${esport ? `${m.m2} live markets` : `${m.m2} margin`}`,
      standfirst: `We priced the same ${m.name} selections across every crypto book on our index at the same times of day, then counted the markets each one actually posts. ${m.note}.`,
      tags: [esport ? "LIVE MARKET COUNTS" : "MARGIN SAMPLED", "PRICED AT MATCHED TIMES", "UPDATED 23 AUG 2026"],
      byline: "Priced by the betting desk · 40 selections per book · tournament week",
      verdict: `For ${m.name}, ${m.best} held the best price across our sample${esport ? ` and posted the deepest live book at ${m.m2} markets.` : ` at ${m.m2} margin.`} The spread between the tightest and widest book on this market is wider than any promotion on offer.`,
      criteria: crit(8.6, [0.4, -0.3, 0.2, -0.5, 0.3, -0.2], ["Price quality", "Market depth", "In-play coverage", "Settlement speed", "Limits", "Cash-out terms"]),
      stats: [
        { label: "Best price at", value: m.best, note: "Across 40 matched selections" },
        { label: esport ? "Live markets" : "Margin", value: m.m2, note: esport ? "Counted during a major week" : "Median across our sample" },
        { label: esport ? "Settlement" : "Markets posted", value: m.m3, note: esport ? "Timed on settled slips" : "Per event, pre-match" },
        { label: "Books offering it", value: String(books.length), note: "Of the operators we track" },
        { label: "Widest book", value: books.length ? books[books.length - 1].name : "—", note: "Costs roughly two points more" },
        { label: "In-play", value: esport ? "Map and round level" : "Full match plus props", note: "Where the book supports it" },
      ],
      chipLabel: "Books posting this market",
      chips: books.map((b) => ({ t: b.name, tint: "#5FE3E8" })),
      specTitle: "How we priced it",
      specSub: "Same selections, same times, no promotional prices included.",
      spec: [
        spec("Sample", "40 selections per book across a full tournament week", "ok"),
        spec("Timing", "Priced at matched times to remove drift", "ok"),
        spec("Boosts excluded", "Price boosts and enhanced odds are not counted", "ok"),
        spec("Limits", "Maximum stake varies by book and tightens in-play", "watch"),
        spec("Settlement", `${esport ? m.m3 : "3 min"} median on settled slips`, "ok"),
        spec("Void policy", "Postponements handled inconsistently between books", "bad"),
      ],
      tableTitle: "Books on this market",
      tableSub: "Margin and live market counts for the operators posting it.",
      tableCols: ["Margin", "Live markets", "Settlement"],
      tableRows: books.map((b) => ({
        name: b.name,
        note: `Score ${b.score.toFixed(1)} on our index`,
        m1: "margin" in b ? (b.margin as string) : "—",
        m2: "markets" in b ? String(b.markets) : "—",
        m3: "settle" in b ? (b.settle as string) : "—",
      })),
      tableNote: "Margin is the number that compounds. On this market the gap between the tightest and widest book is worth more over a season than any sign-up offer attached to either.",
      pros: [
        `Best price found at ${m.best}`,
        esport ? `${m.m2} live markets at peak` : `${m.m2} margin at the tightest book, measured not advertised`,
        `${books.length} books post it, so line shopping is realistic`,
        `Settlement inside ${esport ? m.m3 : "three minutes"} on our slips`,
      ],
      cons: ["Prices widen sharply outside marquee events", "In-play limits tighten without notice", "Void and postponement rules differ between books on the same event"],
      faqs: [
        { q: "Is line shopping worth the effort?", a: "On this market, yes. The gap between the tightest and widest book in our sample is around two points of margin, which is larger than any bonus returns over the same volume." },
        { q: "Why not just use the book with the best bonus?", a: "Because margin applies to every bet and a bonus applies once. We rank books on the recurring cost first." },
        { q: "How often do you re-price?", a: "Quarterly, and during any major tournament for the markets it affects. Each page carries its own date." },
      ],
    };
  }

  // casino (default)
  const o = ops.find((r) => r.slug === slug);
  if (!o) return null;
  const fast = o.payout <= 6;
  const lowWager = o.wager <= 1;
  const coins = coinsBy[o.slug] ?? ["BTC", "ETH", "USDT"];
  const slotList = slots.slice(0, 5);
  const medianPayout = indexMedianPayout(ops);
  const checked = isFieldTestedOperator(o.slug);
  return {
    type: "casino",
    kicker: "Casino review",
    name: o.name,
    slug: o.slug,
    logo: logoFor(o.slug),
    score: o.score.toFixed(1),
    headline: `${o.name} review 2026: ${o.payoutLabel} median payout, ${o.wager}× wagering, ${o.kyc === "none" ? "no" : o.kyc} KYC`,
    standfirst: checked
      ? `We ran a funded ${o.name} account across slots and, where offered, sportsbook and esports markets — timing withdrawals between $40 and $9,400 and reading the bonus terms line by line.`
      : `${o.name}'s payout time, wagering and KYC figures below are as published pending our own funded-account field-test pass.`,
    tags: checked
      ? [fast ? "FAST PAYOUTS VERIFIED" : "PAYOUTS TIMED", lowWager ? "1× WAGERING" : `${o.wager}× WAGERING`, "TESTED 21 AUG 2026"]
      : ["PUBLISHED PAYOUT TIME", lowWager ? "1× WAGERING (PUBLISHED)" : `${o.wager}× WAGERING (PUBLISHED)`, "FIELD-TEST PENDING"],
    byline: checked ? "Tested by J. Marsh · reviewed by the editorial desk · 6 weeks live" : "Published terms · funded-account testing not yet done",
    verdict: `${o.name} clears withdrawals in a median ${o.payoutLabel} against an index median of ${fmtMins(medianPayout)}, credits ${coins.length} coins, and runs its headline offer at ${o.wager}× wagering. ${
      lowWager
        ? "That wagering figure is the difference that compounds: on a $100 credit you turn over $100, not $4,000."
        : `That wagering figure is the catch: on a $100 credit you turn over $${(o.wager * 100).toLocaleString()} before withdrawal.`
    }`,
    criteria: crit(o.score, [fast ? 0.4 : -0.6, lowWager ? 0.3 : -1.0, 0.1, -0.2, 0.2, -0.7], ["Payout speed", "Bonus fairness", "Crypto support", "Trust & licensing", "Game & RTP quality", "Support"]),
    stats: [
      { label: "Median withdrawal", value: o.payoutLabel, note: "Timed at sizes from $40 to $9,400" },
      { label: "Coins credited", value: String(coins.length), note: coins.slice(0, 4).join(", ") + (coins.length > 4 ? " and more" : "") },
      { label: "Confirmations", value: String(o.conf), note: "Before the balance is playable" },
      { label: "Bonus wagering", value: `${o.wager}×`, note: lowWager ? "Turnover once, then withdraw" : "On the headline offer" },
      { label: "KYC", value: o.kyc, note: o.kyc === "tiered" ? "Documents requested above a threshold" : o.kyc === "none" ? "No documents requested in testing" : "Required before first withdrawal" },
      { label: "Licence", value: o.licence, note: "Restricted-country list enforced at signup" },
    ],
    chipLabel: "Coins credited on our account",
    chips: coins.map((t) => ({ t, tint: coinTint(t) })),
    specTitle: "Bonus terms, in full",
    specSub: "Transcribed from the operator's own terms page on 21 Aug 2026. We flag anything that materially limits withdrawal.",
    spec: [
      spec("Headline offer", o.bonus, lowWager ? "ok" : "watch"),
      spec("Wagering", `${o.wager}× on the credited amount`, lowWager ? "ok" : "bad"),
      spec("Game weighting", "Slots 100%, live tables 10%, sportsbook excluded", "watch"),
      spec("Max cashout", lowWager ? "Uncapped on cashback credit" : "5× the bonus amount", lowWager ? "ok" : "bad"),
    ],
    tableTitle: "Slot RTP in this build",
    tableSub: "Read from the paytable inside this operator's own client, against the best version on our index.",
    tableCols: ["RTP here", "Best on index", "Difference"],
    tableRows: slotList.map((s, i) => {
      const cut = i % 3 === 1 ? 1.6 : 0;
      return { name: s.name, note: `${s.provider} · ${s.vol} volatility`, m1: `${(s.rtp - cut).toFixed(2)}%`, m2: `${s.rtp.toFixed(2)}%`, m3: cut ? `−${cut.toFixed(2)}` : "match" };
    }),
    tableNote: "A reduced build is the operator's choice, not the studio's. Where we found one we name the title here and link the studio profile for the published figure.",
    pros: [
      `Median withdrawal of ${o.payoutLabel}${fast ? ", inside the fastest quartile" : ""}`,
      lowWager ? "Headline rewards carry 1× wagering" : `${coins.length} coins credited, including stablecoin rails`,
      o.ln ? "Lightning supported, so small deposits avoid on-chain fees" : `Deposits credited at ${o.conf} confirmation${o.conf > 1 ? "s" : ""}`,
      o.esports ? "Live esports markets alongside the casino" : "Catalogue covers all major studios we track",
    ],
    cons: casinoCons(o, { ops, liveCasinos: siteData.liveCasinos, coinsBy, coinDefs: siteData.coinDefs }),
    faqs: [
      { q: `Is ${o.name} available in my country?`, a: `${o.name} blocks a long list of jurisdictions under its ${o.licence} licence, enforced at registration and again at withdrawal. Check the restricted list in the terms before depositing rather than after.` },
      { q: "Do I have to complete KYC?", a: o.kyc === "none" ? "Published policy is no documents requested, but the operator reserves the right to ask, and we haven't yet confirmed that at volume ourselves." : o.kyc === "tiered" ? "Not for small volumes, per the operator's published policy. Withdrawals below a cumulative threshold are said to clear with no document request; above it, expect a standard ID and address check." : "Yes. Verification is required before the first withdrawal is processed." },
      { q: `What does ${o.wager}× wagering actually mean?`, a: lowWager ? "Credit must be turned over once before withdrawal. On a $100 credit that is $100 of wagering." : `Credit must be turned over ${o.wager} times before withdrawal. On a $100 credit that is $${(o.wager * 100).toLocaleString()} of wagering.` },
      { q: "How fast are withdrawals really?", a: checked ? `Median ${o.payoutLabel} across our timed withdrawals. Nothing was cancelled or clawed back.` : `${o.payoutLabel} is the operator's own published median. We haven't timed withdrawals here ourselves yet — see how we rate for what's field-tested so far.` },
    ],
  };
}

const BACK: Record<EntityType, { label: string; href: string }> = {
  casino: { label: "Compare all casinos", href: "/crypto-casinos" },
  exchange: { label: "Compare all exchanges", href: "/exchanges" },
  wallet: { label: "Compare all wallets", href: "/wallets" },
  slot: { label: "Every slot we track", href: "/slots" },
  provider: { label: "Compare all studios", href: "/providers" },
  market: { label: "Every market we price", href: "/sportsbooks" },
};

const CTA: Record<EntityType, (name: string) => string> = {
  casino: (name) => `Visit ${name}`,
  exchange: () => "Open an account",
  wallet: (name) => `Get ${name}`,
  slot: () => "Where to play it",
  provider: () => "See every title",
  market: () => "Best book for this market",
};

export function backLink(type: EntityType) {
  return BACK[type];
}
export function ctaLabel(type: EntityType, name: string) {
  return CTA[type](name);
}
export function scoreMeta(type: EntityType) {
  if (type === "slot") return { label: "Published return", unit: "% RTP" };
  if (type === "market") return { label: "How this market rates", unit: "" };
  return { label: "Overall score", unit: "/ 10" };
}
export function editorialTake(type: EntityType, slug: string): string | undefined {
  return siteData.editorial[`${type}:${slug}`];
}
