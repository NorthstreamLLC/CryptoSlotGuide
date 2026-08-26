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
  /** 5.5–9.9, see lib/scoring.ts `crit`. */
  score: number;
  /** Median withdrawal time in minutes. */
  payout: number;
  payoutLabel: string;
  licence: string;
  kyc: "none" | "tiered" | "required";
  bonus: string;
  /** Wagering requirement multiplier, e.g. 30 = 30x. */
  wager: number;
  /** Confirmations required before a deposit/withdrawal clears. */
  conf: number;
  absorbsFee: boolean;
  /** Supports Lightning Network. */
  ln: boolean;
  sports: boolean;
  esports: boolean;
  /** True only for Roobet — routes to the hand-written review. */
  hasCustomReview: boolean;
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
  bestAt: string;
  tint: string;
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
  score: number;
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
  score: number;
  /** Settlement asset/chain description, e.g. "USDC · Polygon" — not an enum. */
  settle: string;
  fee: string;
  kyc: string;
  payout: string;
  /** Monthly volume, e.g. "$1.2b / mo". */
  vol: string;
  note: string;
  tint: string;
}

export interface PredictionMarkets {
  crypto: PredictionMarket[];
  fiat: PredictionMarket[];
}

export interface FiatCasino {
  slug: string;
  name: string;
  score: number;
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
  score: number;
  note: string;
  titles: number;
  rtp: string;
  casinos: number;
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
  score: number;
}

export interface HouseGame {
  slug: string;
  name: string;
  mono: string;
  tint: string;
  edge: string;
  rtp: string;
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
  creditTime: string;
  /** Range string, e.g. "1–3" — confirmation requirements vary by operator. */
  confirms: string;
  fee: string;
  note: string;
  /** Drives the bar spark on the coin page. */
  distribution: number[];
}

export interface SportsbookRow {
  margin: string;
  markets: number;
  /** Bet-settlement time, e.g. "< 2 min" — not a crypto/fiat distinction. */
  settle: string;
}

/** Keyed by operator slug. */
export type SportsbookData = Record<string, SportsbookRow>;

export interface SportsMarket {
  name: string;
  mono: string;
  tint: string;
  note: string;
  /** Operator with the best price/coverage for this market. */
  best: string;
  m2: string;
  m3: string;
}

export interface EsportsTitle {
  name: string;
  mono: string;
  tint: string;
  note: string;
  best: string;
  m2: string;
  m3: string;
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

/** Six scored criteria + six measured stats, per README "Derived, never stored". */
export interface ScoreBar {
  name: string;
  val: number;
  pct: number;
  color: string;
}

export interface Flag {
  label: string;
  background: string;
  color: string;
}
