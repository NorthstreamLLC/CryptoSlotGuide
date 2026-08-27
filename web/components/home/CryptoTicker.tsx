"use client";

import { useEffect, useState } from "react";
import { fetchCoinPrices, type CoinPriceMap } from "@/lib/coingecko";
import type { CoinDef } from "@/lib/types";

/**
 * Live price strip for the 8 coins in data/coinDefs.json — not part of
 * the original prototype (its ticker, tickerFacts, is static hand-authored
 * copy). Polls CoinGecko's free public API (no key needed) every 60s.
 * Renders the same way whether data is live or still loading/failed, so a
 * slow network never shows a broken row.
 */
const REFRESH_MS = 60_000;

function fmtPrice(usd: number): string {
  if (usd >= 100) return usd.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (usd >= 1) return usd.toFixed(2);
  return usd.toFixed(4);
}

export function CryptoTicker({ coins }: { coins: CoinDef[] }) {
  const [prices, setPrices] = useState<CoinPriceMap | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const tickers = coins.map((c) => c.ticker);

    async function load() {
      try {
        const p = await fetchCoinPrices(tickers);
        if (!cancelled && Object.keys(p).length > 0) {
          setPrices(p);
          setFailed(false);
        } else if (!cancelled) {
          setFailed(true);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // coins is a static, module-level array — safe to depend on identity only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed || !prices) return null;

  const row = coins.filter((c) => prices[c.ticker]);
  if (row.length === 0) return null;
  const doubled = [...row, ...row];

  return (
    <div style={{ overflow: "hidden", padding: "10px 0", borderTop: "1px solid rgba(255,255,255,.07)" }}>
      <div style={{ display: "flex", gap: 30, width: "max-content", animation: "csg-slide 38s linear infinite" }}>
        {doubled.map((c, i) => {
          const p = prices[c.ticker];
          const up = p.usd_24h_change >= 0;
          return (
            <span key={`${c.ticker}-${i}`} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11.5, whiteSpace: "nowrap" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", flex: "none", background: c.tint }} />
              <span style={{ color: "#DCE5E9", fontWeight: 500 }}>{c.ticker}</span>
              <span style={{ color: "#7B8A93" }}>${fmtPrice(p.usd)}</span>
              <span style={{ color: up ? "#00C2CC" : "#DA9877" }}>
                {up ? "▲" : "▼"} {Math.abs(p.usd_24h_change).toFixed(1)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
