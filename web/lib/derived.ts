import type {
  CoinDef,
  CoinsByOperator,
  EsportsTitle,
  FiatCasino,
  GuideRow,
  HouseGame,
  LiveCasino,
  LiveGame,
  Operator,
  Provider,
  RtpReading,
  Slot,
  SportsMarket,
  WalletOrExchangeRow,
} from "./types";

/**
 * "Every published figure is derived — keep it that way." Per README:
 * no count, median, superlative or comparison is ever a literal — every
 * one of these is computed from the current data arrays. Port these
 * helpers, not the sentences they produce.
 *
 * Shape matches `C` in CryptoSlotGuide.dc.html's renderVals() exactly —
 * note `live` counts live *table types* (liveGames), not live-casino
 * operators (that's `liveOps`). Keep that distinction; it's load-bearing
 * for copy like "12 live tables" vs "3 live casinos".
 */
export interface SiteCounts {
  casinos: number;
  live: number;
  liveOps: number;
  slots: number;
  providers: number;
  wallets: number;
  exchanges: number;
  books: number;
  markets: number;
  guides: number;
  house: number;
  fiat: number;
  predict: number;
  total: number;
}

export function counts(data: {
  ops: Operator[];
  liveGames: LiveGame[];
  liveCasinos: LiveCasino[];
  slots: Slot[];
  providers: Provider[];
  walletRows: WalletOrExchangeRow[];
  exchangeRows: WalletOrExchangeRow[];
  sportsMarkets: SportsMarket[];
  esportsTitles: EsportsTitle[];
  guideRows: GuideRow[];
  houseGames: HouseGame[];
  fiatCasinos: FiatCasino[];
  predMarkets: { crypto: unknown[]; fiat: unknown[] };
}): SiteCounts {
  const c: Omit<SiteCounts, "total"> = {
    casinos: data.ops.length,
    live: data.liveGames.length,
    liveOps: data.liveCasinos.length,
    slots: data.slots.length,
    providers: data.providers.length,
    wallets: data.walletRows.length,
    exchanges: data.exchangeRows.length,
    books: data.ops.filter((o) => o.sports).length,
    markets: data.sportsMarkets.length + data.esportsTitles.length,
    guides: data.guideRows.length,
    house: data.houseGames.length,
    fiat: data.fiatCasinos.length,
    predict: data.predMarkets.crypto.length + data.predMarkets.fiat.length,
  };
  return {
    ...c,
    total: c.casinos + c.live + c.slots + c.providers + c.wallets + c.exchanges + c.markets + c.guides,
  };
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/*
 * indexMedianPayout / payoutRank / payoutClaim used to live here, computed
 * from ops.json's unsourced prototype payout figures. Removed rather than
 * kept around — withdrawal times now go through lib/payout.ts only.
 */

export function medianRtp(slots: Slot[]): number {
  // Only studio-published RTPs — see lib/slot-facts.ts.
  return median(slots.filter((s) => !s.unpublished?.includes("rtp")).map((s) => s.rtp));
}

/**
 * Count of distinct slot titles with at least one cut reading (rtp below
 * the studio's published figure) somewhere in RTP Watch. NOTE: the
 * prototype's `splitBuilds()` counts against a per-title `cuts[]` array,
 * a shape design/README.md explicitly says not to carry into production
 * ("one row per cell, not per title" — see the RTP Watch section). This
 * is the per-cell equivalent against our real `rtp_reading` schema.
 */
export function splitBuilds(readings: RtpReading[]): number {
  return new Set(readings.filter((r) => r.rtp < r.publishedRtp && !isStaleReading(r.checkedAt)).map((r) => r.slotSlug)).size;
}

/**
 * Root README's RTP Watch section: "surface stale cells explicitly, and
 * prefer hiding a stale cell to showing an unverified one." A reading
 * older than 30 days is treated as unchecked everywhere it's used —
 * lib/rtp-watch-view.ts's matrix, lib/entity-view.ts's slot branch, and
 * splitBuilds above.
 */
export const STALE_READING_DAYS = 30;

export function isStaleReading(checkedAt: string): boolean {
  const checked = new Date(checkedAt).getTime();
  if (Number.isNaN(checked)) return true;
  const ageDays = (Date.now() - checked) / (1000 * 60 * 60 * 24);
  return ageDays > STALE_READING_DAYS;
}

export function medianReadMins(guides: GuideRow[]): number {
  return median(guides.map((g) => g.readMins));
}

/** Lowest entry-tier taker fee (m1, e.g. "0.10%"), from each exchange's own fee schedule. */
export function lowestTakerFee(exchangeRows: WalletOrExchangeRow[]): string {
  return [...exchangeRows].sort((a, b) => parseFloat(a.m1) - parseFloat(b.m1))[0]?.m1 ?? "—";
}

/** A studio "ships one RTP" when it publishes a single figure, not a range. */
/** Studios whose own game pages list every RTP version they license. */
export function allVersionsListedStudios(providers: Provider[]): number {
  return providers.filter((p) => p.rtpPolicy === "multiple").length;
}

/** Studios whose game pages publish no RTP at all. */
export function unpublishedRtpStudios(providers: Provider[]): number {
  return providers.filter((p) => p.rtpPolicy === "unpublished").length;
}

export function selfCustodyWallets(rows: WalletOrExchangeRow[]): number {
  return rows.filter((r) => /self/i.test(r.m1)).length;
}



/** Resolves {casinos}/{coins}/{slots}/{studios} tokens in prose so copy can't drift from data. */
export function fill(
  template: string,
  data: { ops: Operator[]; slots: Slot[]; providers: Provider[]; coinDefs: CoinDef[] }
): string {
  const tokens: Record<string, string | number> = {
    casinos: data.ops.length,
    coins: data.coinDefs.length,
    slots: data.slots.length,
    studios: data.providers.length,
  };
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in tokens ? String(tokens[key]) : match));
}

export function fmtMins(v: number): string {
  const m = Math.floor(v);
  const s = Math.round((v - m) * 60);
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

/** Coin tickers the operator does NOT credit, per coinsBy. */
export function missingCoins(coinsBy: CoinsByOperator, coinDefs: CoinDef[], slug: string): string[] {
  const has = coinsBy[slug] ?? [];
  return coinDefs.map((c) => c.ticker).filter((t) => !has.includes(t));
}


