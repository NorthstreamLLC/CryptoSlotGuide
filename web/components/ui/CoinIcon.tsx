/**
 * Coin symbols drawn in each coin's own brand colour (no external assets).
 *
 * The glyph is each coin's own logotype on its own brand colour — white on
 * Bitcoin orange measures 2.3:1, which WCAG exempts as a logotype and which
 * changing would make the chip wrong rather than more readable. The chip is
 * aria-hidden with a title, and the coin is named in text wherever the count
 * matters, so nothing here is the only carrier of information.
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

/**
 * Real brand marks where we hold a usable one, each fetched from the coin's own
 * project rather than an icon pack. The assets are not all the same KIND, which
 * is what the flags handle:
 *
 *   bleed — the file is already a finished icon with its own circle (Bitcoin's
 *           orange disc), so it fills the chip and no background shows.
 *   mono  — the file is a black silhouette, so it is inverted to white and sits
 *           on the coin's brand colour, which is the canonical coin chip.
 *   neither — a full-colour mark on transparency, centred on the brand colour.
 *
 * A ticker with no entry falls through to the glyph below. XRP is deliberately
 * absent: the only mark we could fetch was Ripple's, and Ripple is a company,
 * not the asset — using it here would be the exact conflation this site exists
 * to avoid.
 */
const ASSETS: Record<string, { file: string; mono?: boolean; bleed?: boolean }> = {
  BTC: { file: "btc.png", bleed: true },
  ETH: { file: "eth.svg" },
  SOL: { file: "sol.png" },
  USDT: { file: "usdt.svg", mono: true },
  LTC: { file: "ltc.svg", mono: true },
  // doge.svg was an inverted mask — a black field with the dog knocked out —
  // so inverting it to white filled the whole disc. Replaced with Dogecoin's
  // own app icon, which already carries its gold circle.
  DOGE: { file: "doge.png", bleed: true },
  TRX: { file: "trx.svg", mono: true },
};

export function CoinIcon({ ticker, size = 22 }: { ticker: string; size?: number }) {
  const t = ticker.toUpperCase();
  const c = COINS[t] ?? { bg: "#3A454C", glyph: ticker.slice(0, 1), name: ticker };
  const art = ASSETS[t];
  return (
    <span
      aria-hidden
      title={c.name}
      style={{
        width: size,
        height: size,
        flex: "none",
        borderRadius: "50%",
        background: art?.bleed ? "transparent" : c.bg,
        color: c.fg ?? "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        fontSize: size * 0.56,
        fontWeight: 800,
        lineHeight: 1,
        boxShadow: art?.bleed ? undefined : "inset 0 0 0 1px rgba(255,255,255,.18)",
      }}
    >
      {art ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/assets/coins/${art.file}`}
          alt=""
          width={art.bleed ? size : Math.round(size * 0.6)}
          height={art.bleed ? size : Math.round(size * 0.6)}
          style={{
            display: "block",
            // Black silhouettes become white so they read on the brand colour.
            filter: art.mono ? "brightness(0) invert(1)" : undefined,
          }}
        />
      ) : (
        c.glyph
      )}
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
