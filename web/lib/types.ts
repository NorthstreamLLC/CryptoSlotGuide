/**
 * Data model — ported from design/README.md "Data model" and "RTP Watch"
 * sections. Each interface backs one JSON file under /data.
 *
 * Per the handoff doc: "Port each to a typed model plus a data source
 * (CMS, database or committed JSON)." This app starts with committed JSON;
 * these types are the contract the rest of the app (pages, derived helpers,
 * scoring) is written against, so swapping the source later doesn't ripple.
 */

export type CoinTicker =
  | "BTC"
  | "ETH"
  | "USDT"
  | "SOL"
  | "LTC"
  | "DOGE"
  | "XRP"
  | "TRX";

export type FlagState = "ok" | "watch" | "bad";

/** A crypto casino operator. */
export interface Operator {
  slug: string;
  name: string;
  /** Short monogram/wordmark fallback when a logo asset isn't set. */
  mono: string;
  /**
   * Prototype median withdrawal time in minutes, and its label. UNSOURCED —
   * never display or rank on these directly; go through lib/payout.ts,
   * which only uses them for operators we've field-tested.
   */
  payout: number;
  payoutLabel: string;
  /** Short form of the operator's own stated withdrawal time, cited in casinoSpecSheets.json ("Stated withdrawal time"), e.g. "Instant", "5–15 min". */
  payoutStated?: string;
  /** Worst case of that stated time in minutes (0 = instant), for sorting and the fastest-payouts filter. */
  payoutStatedMaxMins?: number;
  licence: string;
  kyc: "none" | "tiered" | "required";
  /** The operator's standard, published welcome bonus or leaderboard/rakeback program — never a streamer deal or promo code, which aren't standing public terms and can't be verified the same way. */
  bonus: string;
  /**
   * How long the bonus credit itself has to be used before it expires —
   * real, per-operator, from the operator's own terms page. Optional
   * because most operators don't have this checked yet; BonusesPage.tsx
   * shows "—" rather than a guessed or uniform figure when absent. See
   * data/README.md's "Bonus page" section for why this used to be a
   * fabricated "expires 30 days" on every row.
   */
  bonusExpiry?: string;
  /** How winnings from the bonus are capped, e.g. "No cap on cashback winnings" — same real/optional rule as bonusExpiry. */
  cashoutCap?: string;
  /** Wagering requirement multiplier, e.g. 30 = 30x. */
  wager: number;
  /** Short headline bonus, e.g. "100% deposit bonus" — shown with the cited multiplier beside it. */
  bonusShort?: string;
  /** The operator confirms it runs no deposit bonus (rakeback or VIP rewards only). */
  noDepositBonus?: boolean;
  /** The operator's own unlock rule where the bonus has no plain multiplier, e.g. "$1 unlocked per $250 wagered". */
  wagerNote?: string;
  /** What the cited multiplier applies to, e.g. "deposit + bonus". */
  wagerBasis?: string;
  /**
   * Where the site's own sign-up CTA points. Starts as the operator's
   * plain public homepage (real, not fabricated — same as any other URL
   * already cited elsewhere in this codebase); swap it for a real
   * affiliate-tracking link once one exists rather than inventing a
   * tracking parameter in the meantime. Optional and only set for
   * operators actually confirmed this way — see EntityReviewPage.tsx and
   * CasinoBonuses.tsx for how the CTA degrades to plain, non-affiliate
   * text when this is absent instead of claiming a link that isn't one.
   */
  signupUrl?: string;
  /** Confirmations required before a deposit/withdrawal clears. */
  conf: number;
  absorbsFee: boolean;
  /** Supports Lightning Network. */
  ln: boolean;
  sports: boolean;
  esports: boolean;
  /** Legacy flag from the retired hand-written Roobet page; always false now. */
  hasCustomReview: boolean;
  /** Commercial featured placement (casino list spotlight, homepage card). Always labelled "Featured"; never changes profile facts. */
  featured?: boolean;
}

/** Coin support is derived, never a numeric field on Operator — see coinsBy. */
export type CoinsByOperator = Record<string, CoinTicker[]>;

export interface Slot {
  slug: string;
  name: string;
  mono: string;
  provider: string;
  /** Published (full-build) RTP, e.g. 96.51. Per-operator cuts live in RtpReading. */
  rtp: number;
  vol: "low" | "medium" | "high" | "very-high" | "extreme";
  maxWin: string;
  /** Prototype "best casino" claim — unsourced, not displayed anywhere. */
  bestAt: string;
  tint: string;
  /** All RTP configurations the studio publishes, highest first, e.g. "96.38 / 94.55 / 92.33 / 88.42". */
  rtpVersions?: string;
  /** The studio's own game page these figures were checked against. */
  sourceUrl?: string;
  /** Figures the studio doesn't publish — shown as "Not published", never filled from a slot database. */
  unpublished?: ("rtp" | "vol" | "maxWin")[];
}

export type SlotMechanicTag =
  | "bonus-buy"
  | "megaways"
  | "jackpot"
  | "cluster-pays"
  | "high-volatility";

export type SlotTags = Record<string, SlotMechanicTag[]>;

export interface SlotCategoryDef {
  tag: SlotMechanicTag;
  label: string;
  standfirst: string;
}

export interface LiveCasino {
  slug: string;
  name: string;
  tables: number;
  studios: string[];
  stakes: string;
  latency: string;
  note: string;
  tint: string;
}

export type LiveGameType =
  | "Blackjack"
  | "Roulette"
  | "Baccarat"
  | "Game show"
  | "Card"
  | "Dice";

export interface LiveGame {
  slug: string;
  name: string;
  type: LiveGameType;
  studio: string;
  rtp: number;
  stake: string;
  max: string;
  edge: string;
  best: string;
  tint: string;
  how: string[];
  /** Returns-by-bet panel: [betName, returnValue][] */
  side: [string, string][];
  why: string;
}

export interface PredictionMarket {
  name: string;
  /** Settlement asset/chain description, e.g. "USDC · Polygon" — not an enum. */
  settle: string;
  fee: string;
  kyc: string;
  payout: string;
  note: string;
  tint: string;
  site: string;
  /** Each from the venue's own pages. */
  facts: { label: string; text: string; url: string }[];
}

export interface PredictionMarkets {
  crypto: PredictionMarket[];
  fiat: PredictionMarket[];
}

export interface FiatCasino {
  slug: string;
  name: string;
  licence: string;
  rails: string;
  payout: string;
  wager: string;
  games: string;
  note: string;
  tint: string;
}

export interface TickerFact {
  text: string;
  tint: string;
}

export interface Provider {
  slug: string;
  name: string;
  mono: string;
  tint: string;
  note: string;
  /** How the studio publishes RTP on its own game pages (checked on its site, see sourceUrl). */
  rtpPolicy: "multiple" | "single" | "unpublished" | "bonus-buy";
  /** Short display label for rtpPolicy, e.g. "Every RTP version listed". */
  rtp: string;
  /** Licensing as stated on the studio's own site. */
  licences: string;
  /** Catalogue size — only when the studio itself states one. */
  titlesStated?: string;
  sourceUrl: string;
}

export interface WalletOrExchangeRow {
  slug: string;
  name: string;
  mono: string;
  hed: string;
  note: string;
  m1: string;
  m2: string;
  m3: string;
}

export interface HouseGame {
  slug: string;
  name: string;
  mono: string;
  tint: string;
  /** Span of the edges casinos publish for this game, e.g. "0–4%". */
  edgeRange: string;
  /** Each casino's own published figure for this game. */
  edges: { casino: string; value: string; url: string; note?: string }[];
  fair: string;
  speed: string;
  note: string;
  steps: string[];
  tips: string[];
}

export interface CoinDef {
  ticker: CoinTicker;
  tint: string;
  name: string;
  note: string;
  /** Short forms of the cited facts below, for the table. */
  blockTime: string;
  finality: string;
  feeModel: string;
  /** Each from the network's or issuer's own documentation. */
  facts: { label: string; text: string; url: string }[];
}

export interface EsportsTitle {
  name: string;
  mono: string;
  tint: string;
  note: string;
}

export interface GuideRow {
  slug: string;
  title: string;
  mono: string;
  tint: string;
  standfirst: string;
  category: string;
  readMins: number;
  updated: string;
}

export interface GuideBody {
  key: string[];
  body: string[];
}
/** Keyed by guide slug. */
export type GuideBodies = Record<string, GuideBody>;

/**
 * One row per operator/slot cell — never a single field on Slot.
 * See README "RTP Watch — the data pipeline that matters most".
 */
export interface RtpReading {
  id: string;
  slotSlug: string;
  operatorSlug: string;
  rtp: number;
  publishedRtp: number;
  checkedAt: string; // ISO date
  checkedBy: string;
  source: "in_client_paytable" | "operator_support" | "reader_report";
  screenshotUrl?: string;
  notes?: string;
}

export interface WatchOperator {
  slug: string;
  name: string;
}

/** Keyed 'type:name', e.g. 'casino:roobet'. One hand-written paragraph per entity. */
export type Editorial = Record<string, string>;

export interface MethodStep {
  n: string;
  t: string;
  d: string;
}

export interface Criterion {
  name: string;
  /** e.g. "25%" — kept as the source's display string, not a fraction. */
  weight: string;
  desc: string;
  /**
   * How this criterion's figures are actually sourced — see
   * lib/review-tier.ts. Not part of the original prototype, which made
   * one blanket "funded account" claim for every criterion regardless
   * of whether that was true. "editorial": read from the operator's own
   * public pages/registries, no account needed. "community-reported":
   * aggregated from public review sites (AskGamblers, Casino.Guru,
   * Trustpilot), cited, not personally measured. "field-tested": from
   * our own funded account once one exists for that operator.
   */
  sourcing: "field-tested" | "community-reported" | "editorial";
}

export interface ReviewBasis {
  name: string;
  icon: string;
  tint: string;
  checks: string;
  measured: string;
}

/** Entity types the generic review page and search can resolve. */
export type EntityType =
  | "casino"
  | "slot"
  | "provider"
  | "wallet"
  | "exchange"
  | "betting";

export interface Flag {
  label: string;
  background: string;
  color: string;
}

/**
 * A single cited figure from a third-party on-chain analytics platform —
 * see lib/onchain-volume.ts. Deliberately its own thing, not folded into
 * Criterion's "field-tested"/"community-reported"/"editorial" sourcing:
 * this is neither our own testing nor an aggregate of player reports, it's
 * a named platform's own attribution of wallet activity to an operator,
 * which can be wrong (address clustering is a heuristic, not a certainty).
 * Always carries a working sourceUrl and the date it was checked so a
 * reader can verify or refute it themselves.
 */
export interface OnChainVolumeSource {
  /** Platform name, e.g. "Tanzanite", "FairGambling" — kept as a plain string, not an enum, since new sources may be added. */
  source: string;
  /** What was actually measured, e.g. "30-day deposit volume", "Hot wallet balance (all chains)". */
  metric: string;
  /** Display-ready figure, e.g. "$2.25B", "$137.4M" — a string like every other stat on the site, not re-derived. */
  value: string;
  /** Optional secondary figure shown alongside value, e.g. "+13.8% vs prior month". */
  note?: string;
  /** ISO date this was checked/transcribed, or the platform's own "last updated" date where it publishes one. */
  asOf: string;
  sourceUrl: string;
}

export interface OnChainVolumeEntry {
  operatorSlug: string;
  sources: OnChainVolumeSource[];
}

/**
 * One grouped, sourced fact table for a casino review page — see
 * lib/spec-sheet.ts and components/entity/CasinoSpecSheet.tsx. Built
 * after realizing (see data/README.md) that most facts in it turned out
 * to still require a FairGambling citation rather than our own
 * "editorial" audit once actually checked — sourcing is per-FACT, not
 * per-group, because that turned out to be the true shape of the data,
 * not a simplification we chose.
 */
export interface SpecFact {
  label: string;
  /** Plain-text value. Mutually exclusive with `chips` in practice, not enforced by the type. */
  value?: string;
  /** Chip-list rendering (e.g. coins accepted) instead of a plain value. */
  chips?: string[];
  flag?: { label: string; color: string; background: string };
  /**
   * "site-data": drawn from data already established elsewhere on the
   * site (e.g. coinsBy.json) — no citation shown, same as how wallet
   * pages already show coin chips with no footnote.
   * "editorial": independently confirmed on the operator's OWN public
   * page by us — sourceUrl/asOf point at that page, never a third
   * party's. No third-party-citation option exists for spec-sheet
   * facts on purpose — see data/README.md's "Casino spec sheet"
   * section for why FairGambling specifically was removed from here
   * (it stays cited only in OnChainVolumeSource, above, where the data
   * genuinely can't be gathered any other way).
   */
  sourcing: "site-data" | "editorial";
  sourceUrl?: string;
  asOf?: string;
}

export interface SpecGroup {
  title: string;
  facts: SpecFact[];
}

export interface CasinoSpecSheet {
  operatorSlug: string;
  groups: SpecGroup[];
}

/**
 * One currently-live promotion, transcribed from the operator's own
 * promotions page/in-account dashboard — see data/casinoBonuses.json and
 * components/entity/CasinoBonuses.tsx. Never a streamer deal or promo
 * code, same rule as Operator.bonus above: these are the standing,
 * publicly-listed campaigns anyone can find on the operator's own site,
 * dated rather than treated as evergreen since they rotate and expire.
 */
export interface CasinoBonusStat {
  label: string;
  value: string;
}

export interface CasinoBonus {
  title: string;
  /** Small category label above the title, e.g. "Deposit bonus · new users". */
  category: string;
  /** The headline figure, e.g. "500%", "$20,000". */
  headline: string;
  subCopy: string;
  /** Optional 2-tile stat grid — omitted when only the headline figure is confirmed. */
  stats?: CasinoBonusStat[];
  /** ISO date this was checked/observed. */
  asOf: string;
  /** Human-readable end date/window, e.g. "Ends 30 Sep 2026" — omitted for a bonus with no stated end. */
  endsLabel?: string;
  sourceUrl: string;
  /** Where this was actually observed, when it isn't reachable at sourceUrl by a simple fetch — e.g. an in-account view confirmed by the operator's own screenshots. */
  sourceNote?: string;
}

export interface CasinoBonusSheet {
  operatorSlug: string;
  bonuses: CasinoBonus[];
}
