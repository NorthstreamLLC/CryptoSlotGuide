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
import { casinoCons, isStaleReading } from "./derived";
import { payoutView } from "./payout";
import { isFieldTestedOperator, isEditoriallyAudited } from "./field-tested";
import { SCORE_BRAND } from "./score-tier";
import { tintFor } from "./logo";
import { getSpecFact } from "./spec-sheet";
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
  mono: string;
  tint: string;
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
  /** Shown in place of the table when tableRows is empty — per type, since "no builds read" means different things for a slot vs a casino. */
  tableEmpty?: string;
  /** Shown in place of the chip row when chips is empty. */
  chipsEmpty?: string;
  tableNote: string;
  pros: string[];
  cons: string[];
  faqs: { q: string; a: string }[];
  /** Where the sidebar CTA points — only set for casinos with a real Operator.signupUrl on file. Absent means the CTA renders as plain, non-link text rather than a fabricated affiliate link. */
  signupUrl?: string;
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

function spec(k: string, v: string, state: "ok" | "watch" | "bad"): SpecRow {
  return { k, v, ...flag(state) };
}

/** Neutral flag for a method step that hasn't been run yet. */
const PENDING = { label: "Not yet run", color: "#8DA0AA", background: "rgba(255,255,255,.05)" };

/** A spec row we haven't confirmed — neutral grey, never a fair/watch verdict on a term we haven't read. */
function unconfirmed(k: string): SpecRow {
  return { k, v: "Not yet confirmed", label: "Unconfirmed", color: "#8DA0AA", background: "rgba(255,255,255,.05)" };
}

export function getEntityView(type: EntityType, slug: string): EntityView | null {
  const { ops, slots, walletRows, exchangeRows, providers, coinsBy, rtpWatch, watchOps } = siteData;

  if (type === "exchange") {
    const x = exchangeRows.find((r) => r.slug === slug);
    if (!x) return null;
    const s = x.score;
    const checked = isFieldTestedOperator(x.slug);
    // Spread, rails and limit come from exchangeRows.json (prototype data,
    // not yet sampled or confirmed by us). Everything here is framed as
    // listed until a real field test exists — the prototype's "336 hourly
    // samples", "4h 10m fiat payout" and per-pair depth figures were
    // invented and have been removed rather than gated. See data/README.md.
    return {
      type,
      kicker: "Exchange review",
      name: x.name,
      slug: x.slug,
      mono: x.mono,
      tint: "#5FE3E8",
      score: s.toFixed(1),
      headline: `${x.name} review 2026: ${x.m1} ${checked ? "measured" : "listed"} spread, ${x.m2} rails`,
      standfirst: checked
        ? `We sampled ${x.name}'s order book and moved real money out through the fiat rails it offers. ${x.note}.`
        : `${x.name}'s spread, fiat rails and limits below are listed figures, not yet sampled or confirmed on our own account. ${x.note}.`,
      tags: checked ? ["SPREADS SAMPLED", "FIAT PAYOUT TIMED", "FIELD-TESTED"] : ["LISTED SPREAD", "FIAT RAILS LISTED"],
      byline: checked ? "Field-tested on our own verified account" : "Listed figures · order book and fiat payouts not yet field-tested",
      verdict: `Spread plus withdrawal fee is the real cost of an onramp. ${x.name} ${checked ? "came in at" : "lists"} a ${x.m1} spread on majors (withdrawal limit: ${x.m3}). ${x.note}, which is the trade-off to weigh before you route a bankroll through it.`,
      criteria: crit(s, [0.4, -0.2, 0.2, -0.4, 0.5, -0.5], ["Spread & fees", "Fiat rails", "Liquidity", "Security posture", "Withdrawal speed", "Support"]),
      stats: [
        { label: checked ? "Measured spread" : "Listed spread", value: x.m1, note: checked ? "Sampled on BTC/ETH/USDT pairs" : "Not yet sampled by us" },
        { label: "Fiat rails", value: x.m2, note: checked ? "Confirmed on a verified account" : "As listed, not yet confirmed" },
        { label: "Withdrawal limit", value: x.m3, note: checked ? "After full verification" : "As listed, not yet confirmed" },
      ],
      chipLabel: checked ? "Fiat rails confirmed" : "Fiat rails listed",
      chips: x.m2.split(",").map((t, i) => ({ t: t.trim().toUpperCase(), tint: ["#2FA8B0", "#7E93B8", "#C7A45C"][i % 3] })),
      specTitle: "Fees and limits",
      specSub: "Listed figures first; rows marked unconfirmed haven't been checked against the exchange's own fee page yet.",
      spec: [
        spec("Spread", `${x.m1} on majors`, "watch"),
        spec("Withdrawal limit", x.m3, "watch"),
        unconfirmed("Crypto withdrawal fee"),
        unconfirmed("Fiat withdrawal fee"),
        unconfirmed("Verification tier"),
      ],
      tableTitle: "Spread by pair",
      tableSub: "Median spread and resting depth per pair, from our own order-book sampling.",
      tableCols: ["Spread", "Depth at 0.5%", "Taker fee"],
      tableRows: [],
      tableEmpty: "We haven't sampled this exchange's order book yet — no per-pair spreads are shown rather than estimated.",
      tableNote: "Spreads widen materially in the first minutes after a major print, so a single quote is never representative. Once we sample a venue we report those windows separately from the median.",
      pros: [
        `${checked ? "Measured" : "Listed"} spread of ${x.m1} on majors`,
        `${x.m2} as fiat rails`,
        `Withdrawal limit: ${x.m3}`,
      ],
      cons: [
        checked ? "Entry-tier fees only improve at volume most readers will not reach" : "Spread, fees and fiat payout time not yet checked on our own account",
        "Exchange withdrawals that land on a gambling site can trigger a compliance review",
        "Fees vary by account tier — check the live fee page before moving a bankroll",
      ],
      faqs: [
        { q: "Can I deposit straight from here into a casino?", a: "Usually yes, on-chain — but we route through a self-custody wallet first. An exchange withdrawal address that ends up on a gambling site is the pattern most likely to trigger a compliance review on your account." },
        { q: "Is the advertised fee the fee I pay?", a: "Not on its own. The spread you cross is part of the cost, and on majors it can be comparable to the taker fee itself. Only the sum of the two matters." },
        {
          q: "How long do fiat withdrawals take?",
          a: checked
            ? "See the timed figure above — measured request-to-funds on our own verified account."
            : `We haven't timed fiat withdrawals at ${x.name} ourselves yet. First withdrawals on any exchange tend to be slower while the account is reviewed.`,
        },
      ],
    };
  }

  if (type === "wallet") {
    const w = walletRows.find((r) => r.slug === slug);
    if (!w) return null;
    const s = w.score;
    const cold = w.name === "Ledger";
    const checked = isFieldTestedOperator(w.slug);
    // The prototype's per-chain deposit timings (Roobet/Stake/Shuffle),
    // "tested a full restore", audit-history claims and hardcoded chain
    // chips were invented — removed rather than gated. See data/README.md.
    return {
      type,
      kicker: "Wallet review",
      name: w.name,
      slug: w.slug,
      mono: w.mono,
      tint: "#9B8FC4",
      score: s.toFixed(1),
      headline: `${w.name} review 2026: ${w.hed || w.note}`,
      standfirst: checked
        ? `We funded ${w.name} and moved money in and out of casino cashiers on the chains it supports, watching what it signs, what it simulates, and what it hides. ${w.note}.`
        : `${w.name}'s custody model and chain coverage below are as published, pending our own field test on real casino deposits. ${w.note}.`,
      tags: checked ? ["DEPOSITS TESTED", "SIGNING BEHAVIOUR AUDITED", "FIELD-TESTED"] : ["PUBLISHED SPECS", "SIGNING BEHAVIOUR NOT YET AUDITED"],
      byline: checked ? "Field-tested on real casino deposits" : "Published specs · signing behaviour not yet field-tested",
      verdict: `${w.note}. For gambling specifically, what matters is how the wallet behaves at the moment of signing: whether it tells you what a cashier contract will do before you approve it, and whether the fee it sets gets your deposit credited in one block or three.`,
      criteria: crit(s, [0.5, -0.3, 0.4, -0.5, 0.1, -0.4], ["Custody model", "Chain coverage", "Transaction safety", "Everyday UX", "Fee handling", "Recovery & support"]),
      stats: [
        { label: "Custody", value: w.m1, note: cold ? "Keys held on the hardware device" : "Keys held by you, on this device" },
        { label: "Chains", value: w.m2, note: checked ? "Confirmed by a live deposit each" : "As published, not yet deposit-tested" },
        { label: "Gas handling", value: w.m3, note: checked ? "Observed on real transactions" : "As published" },
      ],
      chipLabel: "Chains we deposited from",
      chips: [],
      chipsEmpty: "No test deposits made from this wallet yet.",
      specTitle: "Security model",
      specSub: "What the wallet holds and how you recover it. Rows marked unconfirmed haven't been checked by us yet.",
      spec: [
        spec("Key storage", cold ? "Secure element, keys never touch the host machine" : "Encrypted in the browser or app keystore", cold ? "ok" : "watch"),
        spec("Recovery path", "Seed phrase only. No custodial reset, no account recovery", "watch"),
        unconfirmed("Blind-signing protection"),
        unconfirmed("Audit history"),
      ],
      tableTitle: "Casino deposits, by chain",
      tableSub: "One real deposit per chain into a live operator, timed from broadcast to playable balance.",
      tableCols: ["Credited in", "Fee paid", "Operator used"],
      tableRows: [],
      tableEmpty: "We haven't made test deposits from this wallet yet — no timings are shown rather than estimated.",
      tableNote: "Deposit credit times are the operator's confirmation policy, not the wallet's. The wallet controls the fee it sets — and a fee set too low is the most common cause of a deposit that appears stuck.",
      pros: [`${w.m1} with keys under your control`, `Covers ${w.m2}`, `Gas handling: ${w.m3.toLowerCase()}`],
      cons: [
        cold ? "Slower to use for frequent small deposits than a hot wallet" : "No hardware isolation — a compromised host is a compromised wallet",
        "Recovery is seed-only: lose it and the balance is gone",
        ...(checked ? [] : ["Not yet field-tested on real casino deposits"]),
      ],
      faqs: [
        { q: "Should the playing balance live here?", a: "No. Keep a small hot wallet for deposits and a separate wallet for holdings. Casino accounts get frozen, sometimes for no clear reason; the same discipline applies to your own keys regardless of which operator you're using." },
        { q: "Does the wallet know I am gambling?", a: "It does not report anywhere, but the chain does. Casino cashier addresses are well-known and clustered by analytics firms, so anything you later send to an exchange from the same address is traceable to that activity." },
        { q: "What happens if a deposit does not arrive?", a: "Almost always an underpriced fee or a missing memo tag. Check the explorer first, then the operator's confirmation policy — each casino review lists it." },
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
      mono: s.mono,
      tint: s.tint,
      score: s.rtp.toFixed(2),
      headline: `${s.name} review: ${s.rtp.toFixed(2)}% at best, ${s.vol} volatility, ${s.maxWin} ceiling`,
      standfirst: anyChecked
        ? `We opened ${s.name} in ${checkedOps.length} operator ${checkedOps.length === 1 ? "account" : "accounts"} on our index and read the paytable inside each build. ${clean} of ${cuts.length} ship the full ${s.rtp.toFixed(2)}% version.`
        : `${s.name} publishes a return of ${s.rtp.toFixed(2)}%. Studios license more than one configuration of the same title, and which one an operator ships isn't disclosed in the lobby — we check that per operator as our RTP Watch program covers them, and none of the operators carrying this title are checked yet.`,
      tags: anyChecked ? ["PAYTABLE READ PER CASINO", `${s.vol.toUpperCase()} VOLATILITY`, "CHECKED IN-CLIENT"] : ["PUBLISHED RTP", `${s.vol.toUpperCase()} VOLATILITY`, "PER-OPERATOR CHECK PENDING"],
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
        { label: "Volatility", value: s.vol, note: "Studio's published rating" },
        { label: "Max win", value: s.maxWin, note: "Published cap" },
        { label: "Provider", value: s.provider, note: "See the studio profile for RTP policy" },
        { label: "Operators checked", value: String(checkedOps.length), note: anyChecked ? `${clean} at the full published rate` : "Not yet field-tested" },
      ],
      chipLabel: "Where the full build runs",
      chips: anyChecked ? checkedOps.filter((_, i) => cuts[i] === 0).map((o) => ({ t: o.name, tint: "#5FE3E8" })) : [],
      specTitle: anyChecked ? "What the paytable says" : "Published figures",
      specSub: anyChecked ? "Read inside the game client, not from a marketing page." : "The studio's published figures. Per-operator builds fill in as RTP Watch reads them.",
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
        `${s.maxWin} published max win`,
        anyChecked ? `${clean} of ${cuts.length} major operators ship the full version` : `${s.provider} publishes the return for the full build`,
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
    // Only this studio's own titles — the prototype fell back to
    // slots.slice(0, 4) (other studios' games) when none matched, and
    // described paytables "read in every operator build" that were never
    // read. Titles/RTP/casino counts are providers.json listing data.
    const titles = slots.filter((s) => s.provider === p.name);
    const single = !p.rtp.includes("–");
    const topMaxWin = titles[0]?.maxWin;
    const volCounts = titles.reduce<Record<string, number>>((acc, s) => ({ ...acc, [s.vol]: (acc[s.vol] ?? 0) + 1 }), {});
    const modalVol = Object.entries(volCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const readAny = rtpWatch.some((r) => titles.some((t) => t.slug === r.slotSlug) && !isStaleReading(r.checkedAt));
    return {
      type,
      kicker: "Provider profile",
      name: p.name,
      slug: p.slug,
      mono: p.mono,
      tint: p.tint,
      score: (p.score || 8.8).toFixed(1),
      headline: `${p.name} profile 2026: ${p.titles} titles, ${p.rtp} RTP, on ${p.casinos} casinos`,
      standfirst: readAny
        ? `${p.note} Where RTP Watch has read one of this studio's titles inside a casino's own client, that per-build figure is shown on the title's page.`
        : `${p.note} Figures below are the studio's published data — we haven't read any of its titles inside a casino's own build yet.`,
      tags: [single ? "SINGLE RTP VERSION" : "MULTIPLE RTP VERSIONS", "PUBLISHED RTP DATA", readAny ? "BUILDS READ IN-CLIENT" : "PER-BUILD CHECKS PENDING"],
      byline: readAny ? "Published studio data · some builds read in-client" : "Published studio data · per-build paytable checks pending",
      verdict: single
        ? `${p.name} publishes one configuration per title, which removes the single largest source of hidden variance in crypto casino play: the maths should be the same wherever its games are offered.`
        : `${p.name} publishes an RTP range, which means operators can license reduced configurations. The studio isn't hiding it — the range is public — but the title you load is only as good as the casino that licensed it.`,
      criteria: crit(p.score || 8.8, [single ? 0.6 : -0.9, 0.2, 0.4, -0.3, 0.3, single ? 0.5 : -0.6], ["RTP discipline", "Volatility range", "Mechanic design", "Catalogue depth", "Operator reach", "Transparency"]),
      stats: [
        { label: "Titles", value: String(p.titles), note: "As listed" },
        { label: "Published RTP", value: p.rtp, note: single ? "One configuration only" : "Operator-selectable range" },
        { label: "Listed on", value: `${p.casinos} casinos`, note: "As listed" },
        ...(topMaxWin ? [{ label: "Highest max win", value: topMaxWin, note: "Published cap, titles on our slot index" }] : []),
        ...(modalVol ? [{ label: "Typical volatility", value: modalVol, note: "Most common across titles on our index" }] : []),
      ],
      chipLabel: "Mechanics this studio is known for",
      chips: p.name === "Nolimit City" ? ["xWays", "xNudge", "xBomb"].map((t, i) => ({ t, tint: ["#2FA8B0", "#C7A45C", "#9B8FC4"][i] })) : [],
      chipsEmpty: "Not catalogued for this studio yet.",
      specTitle: "RTP policy",
      specSub: "What the studio publishes. Rows marked unconfirmed haven't been checked in live casino builds yet.",
      spec: [
        spec("Configurations", single ? "One published RTP per title" : "Published as a range, operator-selectable", single ? "ok" : "bad"),
        unconfirmed("RTP shown in-game"),
        unconfirmed("Max win honoured"),
        unconfirmed("Bonus buy availability"),
      ],
      tableTitle: "Titles we track from this studio",
      tableSub: "Published RTP, volatility and max win for this studio's titles on our slot index.",
      tableCols: ["RTP", "Volatility", "Max win"],
      tableRows: titles.map((s) => ({ name: s.name, note: `${s.vol} volatility`, m1: `${s.rtp.toFixed(2)}%`, m2: s.vol, m3: s.maxWin })),
      tableEmpty: "None of this studio's titles are on our slot index yet.",
      tableNote: "Where a casino ships a reduced configuration of one of these titles we name it in that casino's review rather than here, because the studio is not the party that chose it.",
      pros: [
        single ? "One RTP configuration per title, so the build shouldn't depend on the operator" : "Published RTP range, so the variance is at least disclosed",
        `Listed on ${p.casinos} casinos`,
        `${p.titles} titles in the catalogue`,
      ],
      cons: [
        single ? "Thinner catalogue than the volume studios" : "Operators can license reduced configurations",
        "High-volatility titles test a bankroll in the base game",
        readAny ? "Per-build checks cover only some titles so far" : "No per-build paytable reads yet for this studio's titles",
      ],
      faqs: [
        { q: "Why does the same title pay differently at two casinos?", a: "Because some studios license more than one configuration and the operator picks. The paytable inside the game is the only reliable source — RTP Watch reads it per casino as coverage grows." },
        { q: "Does a higher RTP mean a better session?", a: "Over a long enough sample, yes. Over one session, volatility dominates: a high-RTP extreme-volatility title will feel worse than a lower-RTP low-volatility one far more often than not." },
        { q: "Are bonus buys worth it?", a: "They are generally priced to roughly the same RTP as the base game. They buy variance, not edge." },
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
    // Margin, market counts, settlement times and "best" book come from
    // sportsMarkets/esportsTitles/sbData.json — listing data we haven't
    // priced ourselves. The prototype's "40 selections per book, priced
    // at matched times, tournament week" method never happened, so it's
    // described here as how pricing will work, not as done.

    return {
      type,
      kicker: esport ? "Esports market" : "Sports market",
      name: m.name,
      slug: toSlug(m.name),
      mono: m.mono,
      tint: m.tint,
      score: "",
      headline: `${m.name} betting: ${books.length} crypto books, ${esport ? `${m.m2} listed live markets` : `${m.m2} listed margin`}`,
      standfirst: `${m.note}. Margins and market counts below are listed figures — we haven't yet priced ${m.name} selections across these books ourselves.`,
      tags: [esport ? "LISTED MARKET COUNTS" : "LISTED MARGIN", "NOT YET PRICED BY US", `${books.length} BOOKS`],
      byline: "Listed figures · matched-time pricing not yet done",
      verdict: `For ${m.name}, ${m.best} is listed with the ${esport ? `deepest live book at ${m.m2} markets` : `tightest margin at ${m.m2}`}. Margin is the cost that compounds, so it's worth checking the live price across books before you place anything — the gap usually matters more than any promotion.`,
      criteria: crit(8.6, [0.4, -0.3, 0.2, -0.5, 0.3, -0.2], ["Price quality", "Market depth", "In-play coverage", "Settlement speed", "Limits", "Cash-out terms"]),
      stats: [
        { label: "Listed top book", value: m.best, note: "Not yet priced by us" },
        { label: esport ? "Live markets" : "Margin", value: m.m2, note: "As listed" },
        { label: esport ? "Settlement" : "Markets posted", value: m.m3, note: "As listed" },
        { label: "Books offering it", value: String(books.length), note: "Of the operators we list" },
      ],
      chipLabel: "Books posting this market",
      chips: books.map((b) => ({ t: b.name, tint: "#5FE3E8" })),
      specTitle: "How pricing will work",
      specSub: "The method a price check on this market follows. None has been run yet, so the figures above stay labelled as listed.",
      spec: [
        { k: "Sample", v: "The same selections priced at every book", ...PENDING },
        { k: "Timing", v: "Priced at matched times to remove drift", ...PENDING },
        { k: "Boosts", v: "Price boosts and enhanced odds excluded", ...PENDING },
        spec("Limits", "Maximum stake varies by book and usually tightens in-play", "watch"),
      ],
      tableTitle: "Books on this market",
      tableSub: "Listed margin, live market counts and settlement for the operators posting it — not yet priced by us.",
      tableCols: ["Margin", "Live markets", "Settlement"],
      tableRows: books.map((b) => ({
        name: b.name,
        note: `Score ${b.score.toFixed(1)} on our index`,
        m1: "margin" in b ? (b.margin as string) : "—",
        m2: "markets" in b ? String(b.markets) : "—",
        m3: "settle" in b ? (b.settle as string) : "—",
      })),
      tableEmpty: "No crypto books on our index list this market yet.",
      tableNote: "Margin is the number that compounds. Over a season, the gap between the tightest and widest book on a market is usually worth more than any sign-up offer attached to either.",
      pros: [
        `${m.best} listed as the top book`,
        esport ? `${m.m2} live markets listed` : `${m.m2} listed margin at the top book`,
        `${books.length} books post it, so line shopping is realistic`,
      ],
      cons: ["Prices widen sharply outside marquee events", "In-play limits tighten without notice", "Void and postponement rules differ between books on the same event"],
      faqs: [
        { q: "Is line shopping worth the effort?", a: "Usually, yes. A point or two of margin between books is larger than what most bonuses return over the same betting volume." },
        { q: "Why not just use the book with the best bonus?", a: "Because margin applies to every bet and a bonus applies once. Rank books on the recurring cost first." },
        { q: "Have you priced this market yourselves?", a: "Not yet. The figures here are listed, and this page will say so until a real matched-time price check has been run." },
      ],
    };
  }

  // casino (default)
  const o = ops.find((r) => r.slug === slug);
  if (!o) return null;
  const pv = payoutView(o);
  const fast = pv.mins !== null && pv.mins <= 15;
  const lowWager = o.wager <= 1;
  const coins = coinsBy[o.slug] ?? ["BTC", "ETH", "USDT"];
  const checked = isFieldTestedOperator(o.slug);
  const audited = isEditoriallyAudited(o.slug);
  // Only real, non-stale RTP Watch readings for this operator — never a
  // generated "cut". The prototype filled this table with a modulo
  // formula presented as paytable reads; see data/README.md.
  const readings = rtpWatch.filter((r) => r.operatorSlug === o.slug && !isStaleReading(r.checkedAt));
  const licenceFact = getSpecFact(o.slug, "Compliance", "Licence");
  // The operator's own stated processing time, cited — preferred over the
  // prototype's precise payoutLabel, which has no source. See data/README.md.
  const statedPayout = getSpecFact(o.slug, "Payouts & fees", "Stated withdrawal time");
  const statedHost = statedPayout?.sourceUrl ? new URL(statedPayout.sourceUrl).hostname.replace(/^www./, "") : "";
  return {
    type: "casino",
    kicker: "Casino review",
    name: o.name,
    slug: o.slug,
    mono: o.mono,
    tint: tintFor(o.slug),
    score: o.score.toFixed(1),
    // The exact payout figure only leads the headline once we've timed it ourselves.
    headline: checked
      ? `${o.name} review 2026: ${o.payoutLabel} median payout, ${o.wager}× wagering, ${o.kyc === "none" ? "no" : o.kyc} KYC`
      : `${o.name} review 2026: ${o.wager}× wagering, ${o.kyc === "none" ? "no" : o.kyc} KYC, ${coins.length} coins`,
    standfirst: checked
      ? `We ran a funded ${o.name} account across slots and, where offered, sportsbook and esports markets — timing real withdrawals and reading the bonus terms line by line.`
      : audited
      ? `${o.name}'s bonus terms, coin support and licence below are checked against its own pages and public registries. Payout speed is not yet timed on our own funded account — see how we rate.`
      : `${o.name}'s payout time, wagering, KYC and licence figures below are not yet independently checked — pending our own desk-research and funded-account passes. See how we rate for what's checked so far.`,
    tags: checked
      ? [fast ? "FAST PAYOUTS VERIFIED" : "PAYOUTS TIMED", lowWager ? "1× WAGERING" : `${o.wager}× WAGERING`, "FIELD-TESTED"]
      : audited
      ? [lowWager ? "1× WAGERING (VERIFIED)" : `${o.wager}× WAGERING (VERIFIED)`, "LICENCE CHECKED", "PAYOUT TIME NOT YET TIMED"]
      : ["PAYOUT TIME NOT YET TIMED", lowWager ? "1× WAGERING (UNCHECKED)" : `${o.wager}× WAGERING (UNCHECKED)`],
    byline: checked
      ? "Field-tested on our own funded account · reviewed by the editorial desk"
      : audited
      ? "Desk-audited against public terms and registries · payout timing not yet field-tested"
      : "Unchecked listing · desk audit and funded-account testing not yet done",
    verdict: `${
      checked
        ? `${o.name} cleared our withdrawals in a median ${o.payoutLabel}`
        : statedPayout
        ? `${o.name} states its withdrawal time as "${statedPayout.value}"`
        : `${o.name} doesn't state a withdrawal time we could find`
    }, accepts ${coins.length} coins, and runs its headline offer at ${o.wager}× wagering. ${
      lowWager
        ? "That wagering figure is the difference that compounds: on a $100 credit you turn over $100, not $4,000."
        : `That wagering figure is the catch: on a $100 credit you turn over $${(o.wager * 100).toLocaleString()} before withdrawal.`
    }`,
    criteria: crit(o.score, [fast ? 0.4 : -0.6, lowWager ? 0.3 : -1.0, 0.1, -0.2, 0.2, -0.7], ["Payout speed", "Bonus fairness", "Crypto support", "Trust & licensing", "Game & RTP quality", "Support"]),
    stats: [
      checked
        ? { label: "Median withdrawal", value: o.payoutLabel, note: "Timed on our own funded account" }
        : statedPayout
        ? { label: "Stated withdrawal time", value: statedPayout.value ?? "", note: `Operator's own figure · ${statedHost}` }
        : { label: "Stated withdrawal time", value: "Not stated", note: "None found on the operator's own pages" },
      { label: "Coins accepted", value: String(coins.length), note: coins.slice(0, 4).join(", ") + (coins.length > 4 ? " and more" : "") },
      { label: "Confirmations", value: String(o.conf), note: "Before the balance is playable" },
      { label: "Bonus wagering", value: `${o.wager}×`, note: lowWager ? "Turnover once, then withdraw" : "On the headline offer" },
      { label: "KYC", value: o.kyc, note: o.kyc === "tiered" ? "Documents requested above a threshold" : o.kyc === "none" ? "Per the operator's stated policy" : "Required before first withdrawal" },
      { label: "Licence", value: o.licence, note: licenceFact ? "Licence number in the spec sheet below" : "Not yet checked against the regulator" },
    ],
    chipLabel: checked ? "Coins credited on our account" : "Coins accepted",
    chips: coins.map((t) => ({ t, tint: coinTint(t) })),
    specTitle: "Bonus terms",
    specSub: audited
      ? "Checked against the operator's own terms page. We flag anything that materially limits withdrawal."
      : "The headline offer as listed. Expiry and cashout cap show only once confirmed against the operator's own terms.",
    spec: [
      spec("Headline offer", o.bonus, lowWager ? "ok" : "watch"),
      spec("Wagering", `${o.wager}× on the credited amount`, lowWager ? "ok" : "bad"),
      o.bonusExpiry ? spec("Bonus expiry", o.bonusExpiry, "ok") : unconfirmed("Bonus expiry"),
      o.cashoutCap ? spec("Max cashout", o.cashoutCap, "ok") : unconfirmed("Max cashout"),
    ],
    tableTitle: "Slot RTP in this build",
    tableSub: readings.length
      ? "Read from the paytable inside this operator's own client, against the studio's published figure."
      : "Fills in as our RTP Watch program reads slot paytables inside this operator's client.",
    tableCols: ["RTP here", "Published", "Difference"],
    tableRows: readings.map((r) => {
      const s = slots.find((x) => x.slug === r.slotSlug);
      const diff = Math.round((r.publishedRtp - r.rtp) * 100) / 100;
      return {
        name: s?.name ?? r.slotSlug,
        note: s ? `${s.provider} · checked ${r.checkedAt}` : `Checked ${r.checkedAt}`,
        m1: `${r.rtp.toFixed(2)}%`,
        m2: `${r.publishedRtp.toFixed(2)}%`,
        m3: diff > 0 ? `−${diff.toFixed(2)}` : "match",
      };
    }),
    tableEmpty: "No slot builds read at this operator yet — none are shown rather than guessed.",
    tableNote: "A reduced build is the operator's choice, not the studio's. Where we find one we name the title here and link the studio profile for the published figure.",
    pros: [
      checked
        ? `Median withdrawal of ${o.payoutLabel} on our own account`
        : statedPayout
        ? `States withdrawals as "${statedPayout.value}"`
        : `Licensed in ${o.licence}`,
      lowWager ? "Headline rewards carry 1× wagering" : `${coins.length} coins accepted, including stablecoin rails`,
      o.ln ? "Lightning supported, so small deposits avoid on-chain fees" : `Deposits credited at ${o.conf} confirmation${o.conf > 1 ? "s" : ""}`,
      o.esports ? "Esports markets alongside the casino" : o.sports ? "Sportsbook and casino on one balance" : "Casino-only, no sportsbook distractions",
    ],
    cons: casinoCons(o, { ops, liveCasinos: siteData.liveCasinos, coinsBy, coinDefs: siteData.coinDefs }),
    faqs: [
      { q: `Is ${o.name} available in my country?`, a: `${o.name} restricts a list of jurisdictions under its ${o.licence} licence. Check the restricted list in its terms before depositing rather than after — we haven't independently tested where it blocks access.` },
      { q: "Do I have to complete KYC?", a: o.kyc === "none" ? "Published policy is no documents requested, but the operator reserves the right to ask, and we haven't yet confirmed that at volume ourselves." : o.kyc === "tiered" ? "Not for small volumes, per the operator's published policy. Withdrawals below a cumulative threshold are said to clear with no document request; above it, expect a standard ID and address check." : "Yes. Verification is required before the first withdrawal is processed." },
      { q: `What does ${o.wager}× wagering actually mean?`, a: lowWager ? "Credit must be turned over once before withdrawal. On a $100 credit that is $100 of wagering." : `Credit must be turned over ${o.wager} times before withdrawal. On a $100 credit that is $${(o.wager * 100).toLocaleString()} of wagering.` },
      { q: "How fast are withdrawals really?", a: checked
          ? `Median ${o.payoutLabel} across the withdrawals we timed on our own account.`
          : statedPayout
          ? `${o.name}'s own help pages say "${statedPayout.value}". We haven't timed withdrawals there ourselves yet — see how we rate for what's field-tested so far.`
          : `${o.name} doesn't publish a withdrawal time we could find, and we haven't timed withdrawals there ourselves yet.` },
    ],
    signupUrl: o.signupUrl,
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
  return { label: SCORE_BRAND, unit: "/ 10" };
}
export function editorialTake(type: EntityType, slug: string): string | undefined {
  return siteData.editorial[`${type}:${slug}`];
}
