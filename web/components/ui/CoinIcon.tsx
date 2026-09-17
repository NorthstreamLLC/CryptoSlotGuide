/**
 * Coin symbols drawn in each coin's own brand colour (no external assets).
 */
const COINS: Record<string, { bg: string; fg?: string; glyph: string; name: string }> = {
  BTC: { bg: "#F7931A", glyph: "₿", name: "Bitcoin" },
  ETH: { bg: "#627EEA", glyph: "Ξ", name: "Ethereum" },
  USDT: { bg: "#26A17B", glyph: "₮", name: "Tether" },
  USDC: { bg: "#2775CA", glyph: "$", name: "USD Coin" },
  SOL: { bg: "linear-gradient(135deg,#9945FF,#14F195)", glyph: "◎", name: "Solana" },
  LTC: { bg: "#345D9D", glyph: "Ł", name: "Litecoin" },
  DOGE: { bg: "#C2A633", glyph: "Ð", name: "Dogecoin" },
  XRP: { bg: "#1B1F24", glyph: "✕", name: "XRP" },
  TRX: { bg: "#EB0029", glyph: "T", name: "Tron" },
  BNB: { bg: "#F3BA2F", fg: "#1B1F24", glyph: "◆", name: "BNB" },
  SUI: { bg: "#4DA2FF", glyph: "S", name: "Sui" },
  TON: { bg: "#0098EA", glyph: "◇", name: "Toncoin" },
  ADA: { bg: "#0033AD", glyph: "₳", name: "Cardano" },
  DAI: { bg: "#F5AC37", fg: "#1B1F24", glyph: "◈", name: "Dai" },
  MATIC: { bg: "#8247E5", glyph: "M", name: "Polygon" },
  POL: { bg: "#8247E5", glyph: "P", name: "Polygon" },
  SHIB: { bg: "#E42D04", glyph: "S", name: "Shiba Inu" },
  AVAX: { bg: "#E84142", glyph: "A", name: "Avalanche" },
  BCH: { bg: "#0AC18E", glyph: "₿", name: "Bitcoin Cash" },
  CASH: { bg: "#22C55E", glyph: "$", name: "Cash" },
};

export function coinName(t: string) {
  return COINS[t.toUpperCase()]?.name ?? t;
}

export function CoinIcon({ ticker, size = 22 }: { ticker: string; size?: number }) {
  const c = COINS[ticker.toUpperCase()] ?? { bg: "#3A454C", glyph: ticker.slice(0, 1), name: ticker };
  return (
    <span
      aria-hidden
      title={c.name}
      style={{
        width: size,
        height: size,
        flex: "none",
        borderRadius: "50%",
        background: c.bg,
        color: c.fg ?? "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.56,
        fontWeight: 800,
        lineHeight: 1,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,.18)",
      }}
    >
      {c.glyph}
    </span>
  );
}

/** Overlapping coin symbols with a "+N" tail. */
export function CoinStack({ tickers, max = 6, size = 22 }: { tickers: string[]; max?: number; size?: number }) {
  const shown = tickers.slice(0, max);
  const more = tickers.length - shown.length;
  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      {shown.map((t, i) => (
        <span key={t} style={{ marginLeft: i ? -size * 0.28 : 0, borderRadius: "50%", boxShadow: "0 0 0 2px #0C1013", display: "inline-flex" }}>
          <CoinIcon ticker={t} size={size} />
        </span>
      ))}
      {more > 0 && <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 700, color: "#8DA0AA" }}>+{more}</span>}
    </span>
  );
}

/** Coin pills: symbol + ticker. */
export function CoinList({ tickers }: { tickers: string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {tickers.map((t) => (
        <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 11px 5px 5px", borderRadius: 100, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", fontSize: 12.5, fontWeight: 600, color: "#DCE5E9" }}>
          <CoinIcon ticker={t} size={20} />
          {t}
        </span>
      ))}
    </div>
  );
}
