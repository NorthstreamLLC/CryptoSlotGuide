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
import { flag } from "./scoring";
import { isStaleReading } from "./derived";
import { payoutView } from "./payout";
import { hasMaxWin, hasVol, maxWinLabel, rtpLabel, hasRtp, rtpSortValue, volLabel } from "./slot-facts";
import { isFieldTestedOperator, isEditoriallyAudited } from "./field-tested";
import { tintFor } from "./logo";
import { getCasinoSpecSheet, getSpecFact } from "./spec-sheet";
import type { Flag } from "./types";

export type EntityType = "casino" | "slot" | "wallet" | "exchange" | "provider" | "market";

/** Where an at-a-glance fact came from. */
export type GlanceSource = "cited" | "timed" | "third-party" | "index" | "unchecked";

export interface GlanceRow {
  label: string;
  value: string;
  source: GlanceSource;
  /** Overrides the source label, e.g. the third-party platform's name. */
  sourceName?: string;
}

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
  headline: string;
  standfirst: string;
  tags: string[];
  byline: string;
  verdict: string;
  /** The hero fact panel — see components/entity/GlanceCard.tsx. */
  glance: GlanceRow[];
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

const KYC_LABEL: Record<"none" | "tiered" | "required", string> = { none: "Not required", tiered: "At a threshold", required: "Before withdrawal" };

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
    const checked = isFieldTestedOperator(x.slug);
    // Fees, rails, limits, verification, regulation and proof of reserves
    // are cited from the exchange's own pages in casinoSpecSheets.json
    // (rendered below as the spec sheet); exchangeRows holds short
    // summaries of those same facts. Spreads aren't published anywhere,
    // so they only appear once we sample an order book ourselves.
    const fact = (group: string, label: string) => getSpecFact(x.slug, group, label)?.value;
    const por = fact("Compliance", "Proof of reserves");
    const reg = fact("Compliance", "Regulation");
    return {
      type,
      kicker: "Exchange profile",
      name: x.name,
      slug: x.slug,
      mono: x.mono,
      tint: "#5FE3E8",
      headline: `${x.name}: ${x.hed}`,
      standfirst: checked
        ? `We sampled ${x.name}'s order book and moved real money out through the fiat rails it offers. ${x.note}.`
        : `${x.note}. Fees, limits and licensing below are from ${x.name}'s own pages; we haven't moved money through an account here yet.`,
      tags: checked ? ["SPREADS SAMPLED", "FIAT PAYOUT TIMED", "FIELD-TESTED"] : ["FEES FROM ITS OWN SCHEDULE", por?.startsWith("Yes") ? "PROOF OF RESERVES PUBLISHED" : "NO PROOF OF RESERVES FOUND"],
      byline: checked ? "Field-tested on our own verified account" : `${x.name}'s own fee schedule and help centre · not yet field-tested`,
      verdict: `The fee schedule is only part of an onramp's cost — the spread you cross and the withdrawal fee matter too. ${x.name}'s entry-tier taker fee is ${x.m1}, its fiat rails are ${x.m2}, and its stated withdrawal limit is ${x.m3}.${reg ? ` Regulation: ${reg}.` : ""}`,
      glance: [
        { label: "Entry taker fee", value: x.m1, source: fact("Fees", "Spot trading fees") ? "cited" : "unchecked" },
        { label: "Fiat rails", value: x.m2, source: fact("Fiat & limits", "Fiat rails") ? "cited" : "unchecked" },
        { label: "Withdrawal limit", value: x.m3, source: fact("Fiat & limits", "Withdrawal limits") ? "cited" : "unchecked" },
        { label: "Proof of reserves", value: por ? (por.startsWith("Yes") ? "Published" : "Not found") : "Not checked", source: por ? "cited" : "unchecked" },
      ],
      stats: [
        { label: "Entry taker fee", value: x.m1, note: "Entry tier, from its fee schedule" },
        { label: "Fiat rails", value: x.m2, note: "Per its help centre; varies by region" },
        { label: "Withdrawal limit", value: x.m3, note: "Entry verified tier, as stated" },
      ],
      chipLabel: "Fiat rails",
      chips: x.m2.split(",").map((t, i) => ({ t: t.trim().toUpperCase(), tint: ["#2FA8B0", "#7E93B8", "#C7A45C", "#9B8FC4"][i % 4] })),
      specTitle: "",
      specSub: "",
      spec: [],
      tableTitle: "Spread by pair",
      tableSub: "Median spread and resting depth per pair, from our own order-book sampling.",
      tableCols: ["Spread", "Depth at 0.5%", "Taker fee"],
      tableRows: [],
      tableEmpty: "Exchanges don't publish spreads, and we haven't sampled this order book yet — none are shown rather than estimated.",
      tableNote: "Spreads widen materially in the first minutes after a major print, so a single quote is never representative. Once we sample a venue we report those windows separately from the median.",
      pros: [
        `${x.m1} entry-tier taker fee`,
        `Fiat rails: ${x.m2}`,
        ...(por?.startsWith("Yes") ? ["Publishes proof of reserves"] : []),
      ],
      cons: [
        ...(por && !por.startsWith("Yes") ? ["No exchange-wide proof of reserves found"] : []),
        "Exchange withdrawals that land on a gambling site can trigger a compliance review",
        "Fees and rails vary by region and account tier — check the live schedule before moving a bankroll",
      ],
      faqs: [
        { q: "Can I deposit straight from here into a casino?", a: "Usually yes, on-chain — but route through a self-custody wallet first. An exchange withdrawal address that ends up on a gambling site is the pattern most likely to trigger a compliance review on your account." },
        { q: "Is the advertised fee the fee I pay?", a: "Not on its own. The spread you cross is part of the cost, and on majors it can be comparable to the taker fee itself. Only the sum of the two matters." },
        { q: "How long do fiat withdrawals take?", a: checked ? "See the timed figure above — measured request-to-funds on our own verified account." : `We haven't timed fiat withdrawals at ${x.name} ourselves yet. First withdrawals on any exchange tend to be slower while the account is reviewed.` },
      ],
    };
  }

  if (type === "wallet") {
    const w = walletRows.find((r) => r.slug === slug);
    if (!w) return null;
    const checked = isFieldTestedOperator(w.slug);
    // Custody, protection, recovery, audits, chains and swap fee are cited
    // from the wallet maker's own docs in casinoSpecSheets.json (rendered
    // below as the spec sheet). Casino deposit timings only appear once we
    // make real test deposits.
    const fact = (group: string, label: string) => getSpecFact(w.slug, group, label)?.value;
    const protection = fact("Custody & security", "Transaction protection");
    const recovery = fact("Custody & security", "Recovery");
    const audits = fact("Custody & security", "Security audits");
    return {
      type,
      kicker: "Wallet profile",
      name: w.name,
      slug: w.slug,
      mono: w.mono,
      tint: "#9B8FC4",
      headline: `${w.name}: ${w.hed}`,
      standfirst: checked
        ? `We funded ${w.name} and moved money in and out of casino cashiers on the chains it supports, watching what it signs, what it simulates, and what it hides. ${w.note}.`
        : `${w.note}. Everything below is from ${w.name}'s own docs; we haven't made test casino deposits from it yet.`,
      tags: checked ? ["DEPOSITS TESTED", "SIGNING BEHAVIOUR AUDITED", "FIELD-TESTED"] : ["FROM ITS OWN DOCS", audits?.startsWith("Yes") ? "AUDITS PUBLISHED" : "NO AUDITS FOUND"],
      byline: checked ? "Field-tested on real casino deposits" : `${w.name}'s own docs · casino deposits not yet field-tested`,
      verdict: `For gambling specifically, what matters is how a wallet behaves at the moment of signing: whether it tells you what a cashier contract will do before you approve it.${protection ? ` ${w.name}: ${protection.charAt(0).toLowerCase()}${protection.slice(1)}.` : ""}`,
      glance: [
        { label: "Key storage", value: w.m1, source: fact("Custody & security", "Custody model") ? "cited" : "unchecked" },
        { label: "Chains", value: w.m2, source: fact("Coverage & fees", "Supported chains") ? "cited" : "unchecked" },
        { label: "Swap fee", value: w.m3, source: fact("Coverage & fees", "Swap fee") ? "cited" : "unchecked" },
        { label: "Pre-sign warnings", value: protection ? "Yes" : "Not stated", source: protection ? "cited" : "unchecked" },
        { label: "Security audits", value: audits?.startsWith("Yes") ? "Published" : "Not found", source: audits ? "cited" : "unchecked" },
      ],
      stats: [
        { label: "Key storage", value: w.m1, note: "Per its own docs" },
        { label: "Chains", value: w.m2, note: checked ? "Confirmed by a live deposit each" : "As stated, not yet deposit-tested" },
        { label: "Swap fee", value: w.m3, note: w.m3 === "Not stated" ? "No fee published" : "Its own published fee" },
      ],
      chipLabel: "Chains we deposited from",
      chips: [],
      chipsEmpty: "No test deposits made from this wallet yet.",
      specTitle: "",
      specSub: "",
      spec: [],
      tableTitle: "Casino deposits, by chain",
      tableSub: "One real deposit per chain into a live operator, timed from broadcast to playable balance.",
      tableCols: ["Credited in", "Fee paid", "Operator used"],
      tableRows: [],
      tableEmpty: "We haven't made test deposits from this wallet yet — no timings are shown rather than estimated.",
      tableNote: "Deposit credit times are the operator's confirmation policy, not the wallet's. The wallet controls the fee it sets — and a fee set too low is the most common cause of a deposit that appears stuck.",
      pros: [
        `Keys: ${w.m1.toLowerCase()}`,
        `Covers ${w.m2}`,
        ...(protection ? ["Warns or simulates before you sign"] : []),
        ...(audits?.startsWith("Yes") ? ["Publishes security audits"] : []),
      ],
      cons: [
        ...(w.m3 !== "Not stated" ? [`${w.m3} swap fee on in-wallet swaps`] : []),
        recovery ? `Recovery: ${recovery.charAt(0).toLowerCase()}${recovery.slice(1)} — lose it and the balance is gone` : "Recovery is seed-only: lose it and the balance is gone",
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
    // in general. See lib/rtp-watch-view.ts's header for the same rule.
    const checkedOps = watchOps.filter((op) => readings.some((r) => r.operatorSlug === op.slug));
    const cuts = checkedOps.map((op) => {
      const r = readings.find((x) => x.operatorSlug === op.slug);
      return r ? Math.round((r.publishedRtp - r.rtp) * 100) / 100 : 0;
    });
    const clean = cuts.filter((c) => c === 0).length;
    const anyChecked = checkedOps.length > 0;
    // Studio-published figures only (lib/slot-facts.ts); anything the studio
    // doesn't publish reads "Not published" rather than a database number.
    const rtpTxt = rtpLabel(s);
    const facts = [
      hasRtp(s) ? `${rtpTxt} published RTP` : null,
      hasVol(s) ? `${s.vol} volatility` : null,
      hasMaxWin(s) ? `${s.maxWin} max win` : null,
    ].filter(Boolean) as string[];
    const describe = `${s.name} is ${hasVol(s) ? `a ${s.vol}-volatility` : "a"} ${s.provider} title${hasMaxWin(s) ? ` with a ${s.maxWin} max win` : ""}${hasRtp(s) ? ` and a published return of ${rtpTxt}` : ""}.`;
    const versionsNote = s.rtpVersions ? ` ${s.provider} publishes ${s.rtpVersions.split("/").length} configurations: ${s.rtpVersions}%.` : "";
    return {
      type,
      kicker: "Slot profile",
      name: s.name,
      slug: s.slug,
      mono: s.mono,
      tint: s.tint,
      headline: `${s.name}: ${facts.length ? facts.join(", ") : `${s.provider} slot`}`,
      standfirst: anyChecked
        ? `We opened ${s.name} in ${checkedOps.length} operator ${checkedOps.length === 1 ? "account" : "accounts"} on our index and read the paytable inside each build. ${clean} of ${cuts.length} ship the full ${rtpTxt} version.`
        : `${hasRtp(s) ? `${s.provider} publishes a return of ${rtpTxt} for ${s.name}.` : `${s.provider} doesn't publish an RTP for ${s.name} on its game page.`}${versionsNote} Which configuration an operator ships isn't disclosed in the lobby — RTP Watch checks that per operator, and none carrying this title are checked yet.`,
      tags: [
        anyChecked ? "PAYTABLE READ PER CASINO" : "STUDIO-PUBLISHED FIGURES",
        hasVol(s) ? `${s.vol.toUpperCase()} VOLATILITY` : "VOLATILITY NOT PUBLISHED",
        anyChecked ? "CHECKED IN-CLIENT" : "PER-OPERATOR CHECK PENDING",
      ],
      byline: anyChecked
        ? `Read by the games desk · ${s.provider} · verified in ${cuts.length} operator ${cuts.length === 1 ? "build" : "builds"}`
        : `${s.provider}'s own game page · per-operator build not yet field-tested`,
      verdict: anyChecked
        ? `${describe} ${
            clean === cuts.length
              ? "Every operator we checked ships that build, so the only variable left is where you want your money held."
              : `Only ${clean} of the ${cuts.length} operators we checked ship it. The rest run a reduced configuration, and the lobby does not tell you which.`
          }`
        : `${describe} Operators can legally ship a reduced-RTP configuration of the same title without disclosing it in the lobby; we haven't yet field-tested any operator carrying this title to confirm which build they run.`,
      glance: [
        { label: "Published RTP", value: rtpLabel(s), source: hasRtp(s) && s.sourceUrl ? "cited" : "unchecked" },
        { label: "RTP versions", value: !hasRtp(s) ? "Not published" : s.rtpVersions ? `${s.rtpVersions.split("/").length} listed` : "One listed", source: s.sourceUrl && hasRtp(s) ? "cited" : "unchecked" },
        { label: "Volatility", value: volLabel(s), source: hasVol(s) && s.sourceUrl ? "cited" : "unchecked" },
        { label: "Max win", value: maxWinLabel(s), source: hasMaxWin(s) && s.sourceUrl ? "cited" : "unchecked" },
        { label: "Casino builds read", value: anyChecked ? `${clean} of ${cuts.length} full` : "None yet", source: anyChecked ? "timed" : "unchecked" },
      ],
      stats: [
        { label: "Published RTP", value: rtpTxt, note: s.rtpVersions ? `Highest of ${s.rtpVersions.split("/").length} published versions` : hasRtp(s) ? `Per ${s.provider}'s game page` : `${s.provider} doesn't publish one` },
        { label: "Volatility", value: volLabel(s), note: hasVol(s) ? "Studio's published rating" : `${s.provider} doesn't publish one` },
        { label: "Max win", value: maxWinLabel(s), note: hasMaxWin(s) ? "Studio's published cap" : `${s.provider} doesn't publish one` },
        { label: "Provider", value: s.provider, note: "See the studio profile for RTP policy" },
        { label: "Operators checked", value: String(checkedOps.length), note: anyChecked ? `${clean} at the full published rate` : "Not yet field-tested" },
      ],
      chipLabel: "Where the full build runs",
      chips: anyChecked ? checkedOps.filter((_, i) => cuts[i] === 0).map((o) => ({ t: o.name, tint: "#5FE3E8" })) : [],
      specTitle: anyChecked ? "What the paytable says" : "Published figures",
      specSub: s.sourceUrl ? `From ${s.provider}'s own game page, checked 15 Sep 2026. Per-operator builds fill in as RTP Watch reads them.` : "The studio's published figures. Per-operator builds fill in as RTP Watch reads them.",
      spec: [
        hasRtp(s) ? spec("Published return", `${rtpTxt} in the full build`, "ok") : unconfirmed("Published return"),
        s.rtpVersions
          ? spec("Configurations", `${s.rtpVersions}% — operator-selectable`, "bad")
          : spec("Configurations", anyChecked ? (cuts.some((c) => c) ? "Multiple, operator-selectable" : "Single configuration") : "Not published on the game page", anyChecked ? (cuts.some((c) => c) ? "bad" : "ok") : "watch"),
        hasVol(s) ? spec("Volatility", s.vol, "watch") : unconfirmed("Volatility"),
        hasMaxWin(s) ? spec("Max win", `${s.maxWin} stake`, "ok") : unconfirmed("Max win"),
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
        hasRtp(s) ? `Published return of ${rtpTxt} in the full build` : `${s.provider} title on our slot index`,
        hasMaxWin(s) ? `${s.maxWin} published max win` : null,
        anyChecked ? `${clean} of ${cuts.length} major operators ship the full version` : s.rtpVersions ? `${s.provider} discloses every RTP version it licenses` : null,
      ].filter(Boolean) as string[],
      cons: [
        s.rtpVersions ? `Lower-RTP versions exist (${s.rtpVersions}%), and the lobby doesn't say which one is loaded` : "Per-operator build not yet field-tested — a reduced configuration could be running anywhere it's offered",
        hasVol(s) ? `${s.vol} volatility: the base game will test a bankroll` : `${s.provider} doesn't publish a volatility rating for it`,
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
        ? `Volatility, max win and mechanic design are from ${s.provider}'s own game page. The RTP-by-build figures are real — read inside ${checkedOps.length === 1 ? "an operator's" : `${checkedOps.length} operators'`} own client${checkedOps.length === 1 ? "" : "s"}. See how we source information for what that means here.`
        : undefined,
    };
  }

  if (type === "provider") {
    const p = providers.find((r) => r.slug === slug);
    if (!p) return null;
    // Everything here comes from the studio's own site (providers.json
    // sourceUrl, checked 15 Sep 2026) or from its titles on our slot index.
    // The prototype's title counts, casino counts and "RTP range" had no
    // source and are gone.
    const titles = slots.filter((s) => s.provider === p.name);
    const topMaxWin = titles.filter(hasMaxWin)[0]?.maxWin;
    const volCounts = titles.filter(hasVol).reduce<Record<string, number>>((acc, s) => ({ ...acc, [s.vol]: (acc[s.vol] ?? 0) + 1 }), {});
    const modalVol = Object.entries(volCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const readAny = rtpWatch.some((r) => titles.some((t) => t.slug === r.slotSlug) && !isStaleReading(r.checkedAt));
    const policy = p.rtpPolicy;
    const policyVerdict: Record<typeof policy, string> = {
      multiple: `${p.name} lists every RTP configuration it licenses on each game page. That doesn't stop an operator shipping a lower one, but it means you can check exactly how far below the headline figure a build could be.`,
      single: `${p.name}'s game pages show a single RTP per title. They don't say whether lower configurations are licensed, so the paytable inside the game is still the only confirmation of the build you're playing.`,
      unpublished: `${p.name}'s game pages don't publish an RTP at all, so the only place to find a title's return is the paytable inside the game — and that's the figure worth checking before you play.`,
      "bonus-buy": `${p.name} lists a base RTP and a separate bonus-buy RTP per game. Whether lower configurations exist isn't stated, so check the paytable in-game.`,
    };
    return {
      type,
      kicker: "Studio profile",
      name: p.name,
      slug: p.slug,
      mono: p.mono,
      tint: p.tint,
      headline: `${p.name}: ${p.rtp.toLowerCase()}, ${titles.length} title${titles.length === 1 ? "" : "s"} on our index`,
      standfirst: `${p.note} Figures below are from ${p.name}'s own site; ${readAny ? "some of its titles have also been read inside casino builds." : "we haven't read any of its titles inside a casino's own build yet."}`,
      tags: [policy === "multiple" ? "EVERY RTP VERSION LISTED" : policy === "unpublished" ? "RTP NOT PUBLISHED" : policy === "bonus-buy" ? "BASE + BONUS-BUY RTP" : "ONE RTP PER GAME PAGE", "STUDIO'S OWN SITE", readAny ? "BUILDS READ IN-CLIENT" : "PER-BUILD CHECKS PENDING"],
      byline: readAny ? `${p.name}'s own site · some builds read in-client` : `${p.name}'s own site · per-build paytable checks pending`,
      verdict: policyVerdict[policy],
      glance: [
        { label: "RTP disclosure", value: p.rtp, source: "cited" },
        { label: "Licensing", value: p.licences, source: "cited" },
        { label: "Catalogue", value: p.titlesStated ?? "Not stated", source: p.titlesStated ? "cited" : "unchecked" },
        { label: "Titles on our index", value: String(titles.length), source: "index" },
      ],
      stats: [
        { label: "RTP disclosure", value: p.rtp, note: "On its own game pages" },
        { label: "Licensing", value: p.licences, note: "As stated on its site" },
        { label: "Catalogue", value: p.titlesStated ?? "Not stated", note: p.titlesStated ? "Its own figure" : "No count on its site" },
        ...(topMaxWin ? [{ label: "Highest max win", value: topMaxWin, note: "Published cap, titles on our index" }] : []),
        ...(modalVol ? [{ label: "Typical volatility", value: modalVol, note: "Most common across titles on our index" }] : []),
      ],
      chipLabel: "Mechanics this studio is known for",
      chips: p.name === "Nolimit City" ? ["xWays", "xNudge", "xBomb"].map((t, i) => ({ t, tint: ["#2FA8B0", "#C7A45C", "#9B8FC4"][i] })) : [],
      chipsEmpty: "Not catalogued for this studio yet.",
      specTitle: "RTP policy",
      specSub: `What ${p.name} publishes on its own site. Rows marked unconfirmed haven't been checked in live casino builds.`,
      spec: [
        spec("Configurations", p.rtp, policy === "multiple" ? "ok" : policy === "unpublished" ? "bad" : "watch"),
        spec("Licensing", p.licences, "ok"),
        unconfirmed("RTP shown in-game"),
        unconfirmed("Max win honoured"),
      ],
      tableTitle: "Titles we track from this studio",
      tableSub: `Published RTP, volatility and max win from ${p.name}'s own game pages.`,
      tableCols: ["RTP", "Volatility", "Max win"],
      tableRows: [...titles].sort((a, b) => rtpSortValue(b) - rtpSortValue(a)).map((s) => ({ name: s.name, note: s.rtpVersions ? `${s.rtpVersions.split("/").length} published RTP versions` : `${s.provider} game page`, m1: rtpLabel(s), m2: hasVol(s) ? s.vol : "Not published", m3: maxWinLabel(s) })),
      tableEmpty: "None of this studio's titles are on our slot index yet.",
      tableNote: "Where a casino ships a reduced configuration of one of these titles we name it in that casino's review rather than here, because the studio is not the party that chose it.",
      pros: [
        policy === "multiple" ? "Lists every RTP version it licenses, so builds can be checked against the full set" : policy === "single" ? "One RTP shown per game page" : policy === "bonus-buy" ? "Separate bonus-buy RTP disclosed" : `${titles.length} title${titles.length === 1 ? "" : "s"} on our slot index`,
        `Licensing: ${p.licences}`,
      ],
      cons: [
        policy === "multiple" ? "Lower-RTP versions exist, and the lobby doesn't say which one is loaded" : policy === "unpublished" ? "No RTP published on its game pages" : "Doesn't say whether lower-RTP configurations are licensed",
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
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 6)
      .map((o2) => ({ ...(siteData.sbData[o2.slug] ?? {}), name: o2.name }));
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
      headline: `${m.name} betting: ${books.length} crypto books, ${esport ? `${m.m2} listed live markets` : `${m.m2} listed margin`}`,
      standfirst: `${m.note}. Margins and market counts below are listed figures — we haven't yet priced ${m.name} selections across these books ourselves.`,
      tags: [esport ? "LISTED MARKET COUNTS" : "LISTED MARGIN", "NOT YET PRICED BY US", `${books.length} BOOKS`],
      byline: "Listed figures · matched-time pricing not yet done",
      verdict: `For ${m.name}, ${m.best} is listed with the ${esport ? `deepest live book at ${m.m2} markets` : `tightest margin at ${m.m2}`}. Margin is the cost that compounds, so it's worth checking the live price across books before you place anything — the gap usually matters more than any promotion.`,
      glance: [
        { label: "Books offering it", value: String(books.length), source: "index" },
        { label: "Listed top book", value: m.best, source: "unchecked" },
        { label: esport ? "Live markets" : "Margin", value: m.m2, source: "unchecked" },
        { label: esport ? "Settlement" : "Markets posted", value: m.m3, source: "unchecked" },
      ],
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
        note: "Listed figures, not yet priced by us",
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
  const lowWager = o.wager <= 1;
  const offerFact = getSpecFact(o.slug, "Bonus terms", "Standing offer");
  const coins = coinsBy[o.slug] ?? ["BTC", "ETH", "USDT"];
  const checked = isFieldTestedOperator(o.slug);
  const audited = isEditoriallyAudited(o.slug);
  // Only real, non-stale RTP Watch readings for this operator — never a
  // generated "cut". The prototype filled this table with a modulo
  // formula presented as paytable reads; see data/README.md.
  const readings = rtpWatch.filter((r) => r.operatorSlug === o.slug && !isStaleReading(r.checkedAt));
  const licenceFact = getSpecFact(o.slug, "Compliance", "Licence");
  // A regulator register check that came back empty outranks the operator naming its own licence body.
  const notOnRegister = /not found/i.test(getSpecFact(o.slug, "Compliance", "Register check")?.value ?? "");
  const licenceShown = notOnRegister ? "Not on register" : o.licence;
  // The operator's own stated processing time, cited — preferred over the
  // prototype's precise payoutLabel, which has no source. See data/README.md.
  const statedPayout = getSpecFact(o.slug, "Payouts & fees", "Stated withdrawal time");
  const wagerFact = getSpecFact(o.slug, "Bonus terms", "Wagering");
  const sheet = getCasinoSpecSheet(o.slug);
  const sheetFactCount = sheet?.groups.reduce((n, g) => n + g.facts.filter((f) => f.sourcing === "editorial").length, 0) ?? 0;
  const hasSheet = sheetFactCount > 0;
  const coinsFact = getSpecFact(o.slug, "Coins & deposit limits", "Coins accepted");
  // The operator's own full coin list when cited (can include coins beyond the 8 we track), else our tracked list.
  const coinCount = coinsFact?.chips?.length ?? coins.length;
  const kycFact = getSpecFact(o.slug, "Compliance", "KYC policy");
  const onChain =
    siteData.onChainVolume.find((e) => e.operatorSlug === o.slug)?.sources.find((x) => x.source === "FairGambling" && x.metric === "30-day deposit volume") ??
    siteData.onChainVolume.find((e) => e.operatorSlug === o.slug)?.sources.find((x) => x.metric === "30-day deposit volume");
  const statedHost = statedPayout?.sourceUrl ? new URL(statedPayout.sourceUrl).hostname.replace(/^www./, "") : "";
  return {
    type: "casino",
    kicker: "Casino profile",
    name: o.name,
    slug: o.slug,
    mono: o.mono,
    tint: tintFor(o.slug),
    // The exact payout figure only leads the headline once we've timed it ourselves.
    headline: checked
      ? `${o.name}: ${o.payoutLabel} median withdrawal, ${o.licence} licence, ${coinCount} coins`
      : `${o.name}: ${pv.kind === "none" ? "" : `${pv.label.toLowerCase()} withdrawals, `}${licenceFact ? (notOnRegister ? "licence not on regulator register" : /^not stated$/i.test(o.licence) ? "no licence stated" : `${o.licence} licence`) : ""}${licenceFact && coinsFact ? ", " : ""}${coinsFact ? `${coinCount} coins accepted` : ""}`.replace(/, $/, "").replace(/: $/, ": casino profile"),
    standfirst: checked
      ? `We ran a funded ${o.name} account — timing real withdrawals and reading the bonus terms line by line.`
      : hasSheet
      ? `Facts below are from ${o.name}'s own terms, help centre and licence pages, each cited in the fact table. Nothing here has been timed on our own funded account yet.`
      : `We couldn't reach ${o.name}'s own terms or help pages, so nothing on this page is confirmed yet — figures shown are unsourced listings.`,
    tags: checked
      ? ["FIELD-TESTED", "WITHDRAWALS TIMED"]
      : [pv.kind === "stated" ? "WITHDRAWAL TIME STATED" : "WITHDRAWAL TIME NOT STATED", hasSheet ? "FACTS FROM ITS OWN PAGES" : "OWN PAGES UNREACHABLE"],
    byline: checked
      ? "Field-tested on our own funded account"
      : hasSheet
      ? `${sheetFactCount} facts cited from ${o.name}'s own pages · not yet field-tested`
      : "No facts confirmed yet · operator's pages couldn't be reached",
    verdict: [
      checked
        ? `${o.name} cleared our withdrawals in a median ${o.payoutLabel}.`
        : statedPayout
        ? `${o.name} states its withdrawal time as "${statedPayout.value}".`
        : `${o.name} doesn't state a withdrawal time we could find.`,
      wagerFact ? `Bonus wagering: ${wagerFact.value}.` : null,
      licenceFact ? `Licence: ${licenceFact.value}.` : null,
      coinsFact ? `Accepts ${coinCount} coins.` : null,
    ]
      .filter(Boolean)
      .join(" "),
    glance: [
      { label: "Withdrawal time", value: pv.label, source: pv.kind === "timed" ? "timed" : pv.kind === "stated" ? "cited" : "unchecked" },
      { label: "Bonus wagering", value: wagerFact ? `${o.wager}×` : "Not stated", source: wagerFact ? "cited" : "unchecked" },
      { label: "Coins accepted", value: coinsFact ? String(coinCount) : "Not confirmed", source: coinsFact?.sourcing === "editorial" ? "cited" : "unchecked" },
      { label: "Licence", value: licenceFact ? licenceShown : "Not confirmed", source: licenceFact ? "cited" : "unchecked" },
      { label: "KYC", value: kycFact ? KYC_LABEL[o.kyc] : "Not confirmed", source: kycFact ? "cited" : "unchecked" },
      onChain
        ? { label: "30-day deposits", value: onChain.value, source: "third-party", sourceName: onChain.source }
        : { label: "30-day deposits", value: "Not tracked", source: "unchecked" },
    ],
    stats: [
      checked
        ? { label: "Median withdrawal", value: o.payoutLabel, note: "Timed on our own funded account" }
        : statedPayout
        ? { label: "Stated withdrawal time", value: statedPayout.value ?? "", note: `Operator's own figure · ${statedHost}` }
        : { label: "Stated withdrawal time", value: "Not stated", note: "None found on the operator's own pages" },
      coinsFact
        ? { label: "Coins accepted", value: String(coinCount), note: (coinsFact.chips ?? coins).slice(0, 4).join(", ") + (coinCount > 4 ? " and more" : "") }
        : { label: "Coins accepted", value: "Not confirmed", note: "No coin list found on its own pages yet" },
      { label: "Bonus wagering", value: wagerFact ? `${o.wager}×` : "Not stated", note: wagerFact?.value ?? "Not found for its headline offer" },
      { label: "KYC", value: kycFact ? KYC_LABEL[o.kyc] : "Not confirmed", note: kycFact?.value ?? "No KYC policy found on its own pages" },
      { label: "Licence", value: licenceFact ? licenceShown : "Not confirmed", note: licenceFact?.value ?? "No licence details found on its own pages" },
    ],
    chipLabel: checked ? "Coins credited on our account" : "Coins accepted",
    chips: coins.map((t) => ({ t, tint: coinTint(t) })),
    specTitle: "Bonus terms",
    specSub: audited
      ? "Checked against the operator's own terms page. We flag anything that materially limits withdrawal."
      : "The headline offer as listed. Expiry and cashout cap show only once confirmed against the operator's own terms.",
    spec: [
      offerFact ? spec("Headline offer", offerFact.value ?? o.bonus, "watch") : unconfirmed("Headline offer"),
      wagerFact ? spec("Wagering", wagerFact.value ?? `${o.wager}×`, lowWager ? "ok" : "bad") : unconfirmed("Wagering"),
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
        : null,
      wagerFact && lowWager ? `Bonus wagering: ${wagerFact.value}` : coinsFact ? `${coinCount} coins accepted` : null,
      ...(licenceFact ? [`Licence: ${licenceFact.value}`] : []),
    ].filter((x, i, a): x is string => x !== null && a.indexOf(x) === i),
    // Only cons built from cited facts — confirmations, Lightning and fee absorption are prototype listings and aren't shown.
    cons: [
      ...(wagerFact && !lowWager ? [`${o.wager}× wagering on the headline offer`] : []),
      ...(pv.kind === "none" ? ["No withdrawal time stated on its own pages"] : pv.mins !== null && pv.mins >= 1440 ? [`Stated withdrawal time runs up to ${pv.label.split("–").pop()}`] : []),
      ...(coinsFact && coins.length < siteData.coinDefs.length ? [`Accepts ${coins.length} of the ${siteData.coinDefs.length} coins we track`] : []),
      ...(notOnRegister ? ["Not found on the regulator's licence register"] : []),
      ...(!licenceFact ? ["No licence details found on its own pages"] : /no gaming licence/i.test(licenceFact.value ?? "") ? ["No gaming licence stated on its own site"] : /no licence number/i.test(licenceFact.value ?? "") ? ["No licence number shown on its own site"] : []),
    ],
    faqs: [
      { q: `Is ${o.name} available in my country?`, a: `${o.name} restricts a list of jurisdictions under its ${o.licence} licence. Check the restricted list in its terms before depositing rather than after — we haven't independently tested where it blocks access.` },
      { q: "Do I have to complete KYC?", a: kycFact ? `Per ${o.name}'s own pages: ${kycFact.value}. We haven't tested that at volume ourselves.` : `We couldn't find a KYC policy on ${o.name}'s own pages, so check its terms before depositing.` },
      { q: "What does wagering actually mean?", a: wagerFact ? `${o.name}'s bonus terms say: ${wagerFact.value}. A 40× requirement on a $100 credit means $4,000 of bets before withdrawal; 1× means $100.` : "Wagering is how many times a bonus must be bet before it can be withdrawn — 40× on a $100 credit means $4,000 of bets. We couldn't find this operator's figure in its own terms." },
      { q: "How fast are withdrawals really?", a: checked
          ? `Median ${o.payoutLabel} across the withdrawals we timed on our own account.`
          : statedPayout
          ? `${o.name}'s own help pages say "${statedPayout.value}". We haven't timed withdrawals there ourselves yet — see how we source information for what's field-tested so far.`
          : `${o.name} doesn't publish a withdrawal time we could find, and we haven't timed withdrawals there ourselves yet.` },
    ],
    signupUrl: o.signupUrl,
    measuredSub: checked
      ? undefined
      : hasSheet
      ? "Each figure below is the operator's own stated number, cited in the fact table further down. None are timed on our own funded account yet."
      : "We couldn't reach this operator's own pages, so nothing below is confirmed — figures are unsourced listings until they're checked.",
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
export function editorialTake(type: EntityType, slug: string): string | undefined {
  return siteData.editorial[`${type}:${slug}`];
}
