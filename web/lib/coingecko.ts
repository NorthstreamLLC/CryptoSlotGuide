/**
 * Maps the site's 8 tracked coins (see data/coinDefs.json) to CoinGecko
 * ids for the live price ticker (components/home/CryptoTicker.tsx).
 * CoinGecko's public /simple/price endpoint needs no API key.
 */
export const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  SOL: "solana",
  LTC: "litecoin",
  DOGE: "dogecoin",
  XRP: "ripple",
  TRX: "tron",
};

export interface CoinPrice {
  usd: number;
  usd_24h_change: number;
}

export type CoinPriceMap = Record<string, CoinPrice>;

const ENDPOINT = "https://api.coingecko.com/api/v3/simple/price";

export async function fetchCoinPrices(tickers: string[]): Promise<CoinPriceMap> {
  const ids = tickers.map((t) => COINGECKO_IDS[t]).filter(Boolean);
  const url = `${ENDPOINT}?ids=${ids.join(",")}&vs_currencies=usd&include_24hr_change=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko request failed: ${res.status}`);
  const byId: Record<string, { usd: number; usd_24h_change: number }> = await res.json();

  const out: CoinPriceMap = {};
  for (const t of tickers) {
    const id = COINGECKO_IDS[t];
    const p = id ? byId[id] : undefined;
    if (p) out[t] = { usd: p.usd, usd_24h_change: p.usd_24h_change };
  }
  return out;
}
