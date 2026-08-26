import type {
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

export function indexMedianPayout(ops: Operator[]): number {
  return median(ops.map((o) => o.payout));
}

/** 1 = fastest payout. */
export function payoutRank(ops: Operator[], slug: string): number {
  const sorted = [...ops].sort((a, b) => a.payout - b.payout);
  const idx = sorted.findIndex((o) => o.slug === slug);
  return idx === -1 ? -1 : idx + 1;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}

/** e.g. "third fastest of 47 operators" */
export function payoutClaim(ops: Operator[], slug: string): string {
  const rank = payoutRank(ops, slug);
  if (rank === -1) return "";
  return `${ordinal(rank)} fastest of ${ops.length} operators`;
}

export function medianRtp(slots: Slot[]): number {
  return median(slots.map((s) => s.rtp));
}

/** Share (0–1) of RTP Watch readings that come in below the studio's full-build figure. */
export function splitBuilds(readings: RtpReading[]): number {
  if (readings.length === 0) return 0;
  const cut = readings.filter((r) => r.rtp < r.publishedRtp).length;
  return cut / readings.length;
}

export function medianReadMins(guides: GuideRow[]): number {
  return median(guides.map((g) => g.readMins));
}

/** Widest gap between an operator's cut RTP and the studio's published figure. */
export function bestSpread(readings: RtpReading[]): number {
  if (readings.length === 0) return 0;
  return Math.max(...readings.map((r) => Math.round((r.publishedRtp - r.rtp) * 100) / 100));
}

export function topScore<T extends { score: number }>(list: T[]): T | undefined {
  return [...list].sort((a, b) => b.score - a.score)[0];
}

export function feeAbsorbers(ops: Operator[]): number {
  return ops.filter((o) => o.absorbsFee).length;
}

export function lightningOps(ops: Operator[]): number {
  return ops.filter((o) => o.ln).length;
}

/** Studios with no per-operator RTP Watch readings — i.e. only one configuration is in the wild. */
export function singleRtpStudios(slots: Slot[], readings: RtpReading[]): string[] {
  const checkedProviders = new Set(
    readings
      .map((r) => slots.find((s) => s.slug === r.slotSlug)?.provider)
      .filter((p): p is string => Boolean(p))
  );
  const allProviders = new Set(slots.map((s) => s.provider));
  return [...allProviders].filter((p) => !checkedProviders.has(p));
}

export function selfCustodyWallets(rows: { slug: string; custody?: "self" | "custodial" }[]): number {
  return rows.filter((r) => r.custody === "self").length;
}

export function largestCatalogue(providers: Provider[]): Provider | undefined {
  return [...providers].sort((a, b) => b.titles - a.titles)[0];
}

/** Resolves {casinos}/{fee}/{ln}/{coins} tokens in prose so copy can't drift from data. */
export function fill(template: string, tokens: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in tokens ? String(tokens[key]) : match
  );
}

/**
 * Walks an operator's own record in priority order and returns the first
 * four cons that genuinely apply: wagering above 1x, confirmations above 1,
 * payout above the index median, fee absorption, missing coins, Lightning,
 * KYC posture, then sportsbook gaps.
 */
export function casinoCons(
  o: Operator,
  ctx: { medianPayout: number; coinsBy: CoinsByOperator; allCoinsCount: number }
): string[] {
  const cons: string[] = [];
  if (o.wager > 1) cons.push(`${o.wager}x wagering requirement`);
  if (o.conf > 1) cons.push(`${o.conf} confirmations required`);
  if (o.payout > ctx.medianPayout) cons.push("Payout time above the index median");
  if (!o.absorbsFee) cons.push("Does not absorb network fees");
  const coinCount = (ctx.coinsBy[o.slug] ?? []).length;
  if (coinCount < ctx.allCoinsCount) cons.push(`Missing ${ctx.allCoinsCount - coinCount} supported coins`);
  if (!o.ln) cons.push("No Lightning Network support");
  if (o.kyc === "required") cons.push("Mandatory KYC");
  if (!o.sports) cons.push("No sportsbook");
  return cons.slice(0, 4);
}

/** Returns null rather than inventing a fault for the category leader. */
export function liveCon(liveCasinos: LiveCasino[], slug: string): string | null {
  const leader = topScore(liveCasinos);
  if (leader?.slug === slug) return null;
  const casino = liveCasinos.find((c) => c.slug === slug);
  if (!casino || !leader) return null;
  if (casino.tables < leader.tables) return "Smaller table count than the category leader";
  return null;
}
