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

/**
 * Count of distinct slot titles with at least one cut reading (rtp below
 * the studio's published figure) somewhere in RTP Watch. NOTE: the
 * prototype's `splitBuilds()` counts against a per-title `cuts[]` array,
 * a shape design/README.md explicitly says not to carry into production
 * ("one row per cell, not per title" — see the RTP Watch section). This
 * is the per-cell equivalent against our real `rtp_reading` schema.
 */
export function splitBuilds(readings: RtpReading[]): number {
  return new Set(readings.filter((r) => r.rtp < r.publishedRtp).map((r) => r.slotSlug)).size;
}

export function medianReadMins(guides: GuideRow[]): number {
  return median(guides.map((g) => g.readMins));
}

/** Tightest exchange spread — same sort-and-take-first the source uses (m1 is a "%" string). */
export function bestSpread(exchangeRows: WalletOrExchangeRow[]): string {
  return [...exchangeRows].map((x) => x.m1).sort()[0] ?? "—";
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

/** A studio "ships one RTP" when it publishes a single figure, not a range. */
export function singleRtpStudios(providers: Provider[]): number {
  return providers.filter((p) => !p.rtp.includes("–")).length;
}

export function rangeRtpStudios(providers: Provider[]): number {
  return providers.length - singleRtpStudios(providers);
}

export function selfCustodyWallets(rows: WalletOrExchangeRow[]): number {
  return rows.filter((r) => /self/i.test(r.m1)).length;
}

export function largestCatalogue(providers: Provider[]): number {
  return Math.max(0, ...providers.map((p) => p.titles || 0));
}

/** Resolves {casinos}/{fee}/{ln}/{coins}/{slots}/{studios} tokens in prose so copy can't drift from data. */
export function fill(
  template: string,
  data: { ops: Operator[]; slots: Slot[]; providers: Provider[]; coinDefs: CoinDef[] }
): string {
  const tokens: Record<string, string | number> = {
    casinos: data.ops.length,
    fee: feeAbsorbers(data.ops),
    ln: lightningOps(data.ops),
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

/**
 * Walks an operator's own record in priority order, same as the source's
 * `casinoCons(o)`: wagering, confirmations, payout vs. median, the live
 * criticism (if it runs a live casino), fee absorption, missing coins,
 * Lightning, KYC/manual-review risk, sportsbook/esports gaps, then a
 * catch-all — so there are always at least four candidates and the first
 * four that genuinely apply are used.
 */
export function casinoCons(
  o: Operator,
  ctx: { ops: Operator[]; liveCasinos: LiveCasino[]; coinsBy: CoinsByOperator; coinDefs: CoinDef[] }
): string[] {
  const missing = missingCoins(ctx.coinsBy, ctx.coinDefs, o.slug);
  const med = indexMedianPayout(ctx.ops);
  const out: (string | null)[] = [];
  if (o.wager > 1) out.push(`${o.wager}× wagering makes the headline offer far less valuable than it reads`);
  if (o.conf > 1) out.push(`${o.conf} confirmations before the balance is playable, so a busy block costs you real time`);
  if (o.payout > med) out.push(`Median withdrawal of ${o.payoutLabel} sits above the index median of ${fmtMins(med)}`);
  if (ctx.liveCasinos.some((l) => l.slug === o.slug)) out.push(liveCon(ctx.liveCasinos, o.slug));
  if (!o.absorbsFee) out.push("Network fee is deducted from the withdrawal rather than absorbed");
  if (missing.length) out.push(`No ${missing.slice(0, 2).join(" or ")} support on the cashier`);
  if (!o.ln) out.push("No Lightning, so small deposits still pay an on-chain fee");
  if (o.kyc === "required") out.push("Documents required before the first withdrawal clears");
  else out.push("A large withdrawal can still trigger a manual review");
  if (!o.sports) out.push("No sportsbook, so a single balance cannot cover both");
  else if (!o.esports) out.push("Sportsbook carries no esports markets");
  out.push("Restricted-country list is long and enforced at withdrawal as well as signup");
  return out.filter((x): x is string => Boolean(x)).slice(0, 4);
}

/**
 * The category leader has nothing to answer for on breadth — the only
 * honest live criticism there is latency, and only if someone beats it.
 */
export function liveCon(liveCasinos: LiveCasino[], slug: string): string | null {
  const ranked = [...liveCasinos].sort((a, b) => b.tables - a.tables);
  const me = ranked.find((c) => c.slug === slug);
  const best = ranked[0];
  if (!me || !best) return null;
  if (me.slug === best.slug) {
    const quick = [...ranked].sort((a, b) => parseInt(a.latency, 10) - parseInt(b.latency, 10))[0];
    return quick && quick.slug !== me.slug ? `Live stream runs ${me.latency} against ${quick.name}'s ${quick.latency}` : null;
  }
  return `Live catalogue trails ${best.name} — ${me.tables} tables against ${best.tables}`;
}
