import Link from "next/link";
import { siteData, siteCounts } from "@/lib/site-data";
import { topScore } from "@/lib/derived";
import { CasinoIndexTable } from "@/components/home/CasinoIndexTable";

/**
 * Ported from the HOME section of CryptoSlotGuide.dc.html (hero through
 * the featured-reviews grid — search that file for `<!-- HERO -->` and
 * `FEATURED REVIEWS`). Structure/spacing/colors are the real ones; the
 * casino index table below it is this app's own addition (the prototype
 * doesn't have one on the homepage), kept because it's genuinely useful.
 */

const wallCols: string[][] = [
  ["stake", "bc-game", "shuffle", "rollbit", "gamdom", "duelbits", "kraken", "ledger"],
  ["cloudbet", "bitstarz", "rainbet", "vave", "mbit", "500-casino", "okx", "metamask"],
  ["hacksaw-gaming", "pragmatic-play", "nolimit-city", "push-gaming", "relax-gaming", "print-studios", "phantom", "bybit"],
];
const wallAnims = ["csg-up 34s linear infinite", "csg-down 43s linear infinite", "csg-up 39s linear infinite"];
const wallTints = ["#00C2CC", "#FF7EB6", "#B284FF"];

const quickChips = [
  { label: "Bitcoin casinos", href: "/crypto-casinos" },
  { label: "No-KYC", href: "/crypto-casinos/no-kyc" },
  { label: "Live blackjack", href: "/live-casino" },
  { label: "High RTP slots", href: "/slots" },
  { label: "Esports betting", href: "/sportsbooks?tab=2" },
  { label: "Hardware wallets", href: "/wallets" },
];

const featured = [
  { name: "Sweet Bonanza", mono: "SWB", slug: "sweet-bonanza", cat: "Slot", score: "8.7", line: "Ships at 96.51% but three casinos on our index carry a 94.5% build. Check before you spin.", metric: "RTP 96.51%", date: "22 Aug", href: "/slots/sweet-bonanza" },
  { name: "Kraken", mono: "KR", slug: "kraken", cat: "Exchange", score: "8.9", line: "Tightest real spreads of the fiat-onramp exchanges we tested, and withdrawals cleared same-day.", metric: "Spread 0.09%", date: "20 Aug", href: "/exchanges/kraken" },
  { name: "Stake", mono: "ST", slug: "stake", cat: "Casino", score: "9.1", line: "Deep coin support and a genuine 1× rakeback, but payouts trail our leader.", metric: "6m 24s payout", date: "19 Aug", href: "/casinos/stake" },
  { name: "Phantom", mono: "PH", slug: "phantom", cat: "Wallet", score: "8.6", line: "Best Solana experience for casino deposits; multi-chain support is still catching up to MetaMask.", metric: "4 chains", date: "18 Aug", href: "/wallets/phantom" },
  { name: "Hacksaw Gaming", mono: "HG", slug: "hacksaw-gaming", cat: "Provider", score: "9.0", line: "Consistently ships one RTP version, which is rarer than it should be. Volatility is not for everyone.", metric: "180 titles", date: "17 Aug", href: "/providers/hacksaw-gaming" },
  { name: "Cloudbet", mono: "CB", slug: "cloudbet", cat: "Sportsbook", score: "8.4", line: "Lowest margin we measured on football and the deepest crypto racebook. Casino side is average.", metric: "2.1% margin", date: "16 Aug", href: "/sportsbooks" },
  { name: "Ledger", mono: "LG", slug: "ledger", cat: "Wallet", score: "9.1", line: "Still the reference for cold storage. Bridge software remains the weak point of the experience.", metric: "5,500+ assets", date: "15 Aug", href: "/wallets/ledger" },
  { name: "Nolimit City", mono: "NC", slug: "nolimit-city", cat: "Provider", score: "8.8", line: "Extreme volatility done deliberately. Max wins are real but the base game will test your bankroll.", metric: "RTP 96.0–96.1%", date: "14 Aug", href: "/providers/nolimit-city" },
];

export default function HomePage() {
  const { ops, slots, liveCasinos, providers, walletRows } = siteData;
  const c = siteCounts;

  const topCasino = topScore(ops);
  const topLive = topScore(liveCasinos);
  const topSlot = [...slots].sort((a, b) => b.rtp - a.rtp)[0];
  const topProvider = topScore(providers);
  const topBook = topScore(ops.filter((o) => o.sports));
  const topWallet = topScore(walletRows);

  const verticals = [
    { icon: "♠️", title: "Crypto casinos", tint: "#00C2CC", count: c.casinos, top: topCasino?.name ?? "—", topScore: topCasino?.score.toFixed(1) ?? "—", href: "/crypto-casinos" },
    { icon: "🃏", title: "Live casino", tint: "#FF7EB6", count: c.live, top: topLive?.name ?? "—", topScore: topLive?.score.toFixed(1) ?? "—", href: "/live-casino" },
    { icon: "🎰", title: "Slots & RTP", tint: "#FFB347", count: c.slots, top: topSlot?.name ?? "—", topScore: topSlot ? `${topSlot.rtp.toFixed(1)}%` : "—", href: "/slots" },
    { icon: "🎮", title: "Game studios", tint: "#B284FF", count: c.providers, top: topProvider?.name ?? "—", topScore: topProvider?.score.toFixed(1) ?? "—", href: "/providers" },
    { icon: "⚽", title: "Sportsbooks", tint: "#57E39A", count: c.books, top: topBook?.name ?? "—", topScore: topBook?.score.toFixed(1) ?? "—", href: "/sportsbooks" },
    { icon: "👛", title: "Wallets", tint: "#6BC7FF", count: c.wallets, top: topWallet?.name ?? "—", topScore: topWallet?.score.toFixed(1) ?? "—", href: "/wallets" },
  ];

  const tickerRun = [...siteData.tickerFacts, ...siteData.tickerFacts];

  return (
    <main
      style={{
        backgroundColor: "#07090B",
        backgroundImage:
          "radial-gradient(62% 32% at 90% 11%, rgba(178,132,255,.20), transparent 64%), radial-gradient(56% 28% at 2% 27%, rgba(0,194,204,.19), transparent 66%), radial-gradient(58% 30% at 98% 45%, rgba(255,179,71,.15), transparent 66%), radial-gradient(56% 28% at 0% 61%, rgba(255,126,182,.17), transparent 66%), radial-gradient(64% 32% at 82% 79%, rgba(87,227,154,.14), transparent 66%), radial-gradient(54% 26% at 8% 94%, rgba(107,199,255,.14), transparent 66%)",
      }}
    >
      {/* HERO */}
      <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,.07)", background: "#090C0F" }}>
        <div style={{ position: "absolute", inset: "-25% -12% -10% -12%", pointerEvents: "none" }} aria-hidden>
          <span style={{ position: "absolute", top: "2%", left: "4%", width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,194,204,.34),transparent 66%)", animation: "csg-drift 18s ease-in-out infinite" }} />
          <span style={{ position: "absolute", top: "30%", left: "40%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(178,132,255,.26),transparent 66%)", animation: "csg-drift 23s ease-in-out infinite reverse" }} />
          <span style={{ position: "absolute", top: 0, right: 0, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,179,71,.20),transparent 66%)", animation: "csg-drift2 26s ease-in-out infinite" }} />
          <span style={{ position: "absolute", bottom: "-10%", right: "28%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,126,182,.18),transparent 66%)", animation: "csg-drift 30s ease-in-out infinite" }} />
        </div>

        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1.02fr .98fr", gap: 64, alignItems: "center", maxWidth: 1400, margin: "0 auto", padding: "78px 40px 30px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "6px 13px", border: "1px solid rgba(0,194,204,.32)", borderRadius: 100, background: "rgba(0,194,204,.09)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 26 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00C2CC", animation: "csg-pulse 2.4s ease-in-out infinite" }} />
              {c.total} products tested · index rebuilt weekly
            </div>
            <h1 style={{ margin: "0 0 22px", fontSize: 62, lineHeight: 1.02, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "118%", color: "#fff", textWrap: "balance" }}>
              Measured, not
              <br />
              <span
                style={{
                  backgroundImage: "linear-gradient(96deg,#00C2CC,#7BE0B8,#FFB347,#FF7EB6,#B284FF,#00C2CC)",
                  backgroundSize: "280% 100%",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                  animation: "csg-sweep 11s linear infinite",
                }}
              >
                marketed.
              </span>
            </h1>
            <p style={{ margin: "0 0 30px", maxWidth: 530, fontSize: 17.5, lineHeight: 1.6, color: "#9AAAB3", textWrap: "pretty" }}>
              Crypto casinos, live tables, slots, sportsbooks, wallets and exchanges — opened with real money, timed,
              and scored on published criteria. Start with a number, not a banner.
            </p>

            <Link
              href="/search"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "7px 7px 7px 18px",
                borderRadius: 11,
                background: "rgba(14,18,21,.92)",
                border: "1px solid rgba(255,255,255,.12)",
                boxShadow: "0 14px 40px rgba(0,0,0,.45)",
                maxWidth: 520,
                marginBottom: 16,
              }}
            >
              <span style={{ color: "#3D4A52", fontFamily: "var(--font-jetbrains-mono), monospace" }}>⌕</span>
              <span style={{ flex: 1, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 13, color: "#5C6A72", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                casinos, live tables, slots, wallets, coins…
              </span>
              <span style={{ padding: "11px 18px", borderRadius: 8, border: 0, background: "#00C2CC", color: "#04191B", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                Search
              </span>
            </Link>

            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 26 }}>
              {quickChips.map((chip) => (
                <Link
                  key={chip.label}
                  href={chip.href}
                  className="hover:!border-accent hover:!text-accent hover:!bg-accent-wash"
                  style={{
                    padding: "7px 13px",
                    borderRadius: 100,
                    border: "1px solid rgba(255,255,255,.12)",
                    background: "rgba(255,255,255,.03)",
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 11,
                    color: "#A8B6BE",
                  }}
                >
                  {chip.label}
                </Link>
              ))}
            </div>

            <div style={{ display: "flex", gap: 32, flexWrap: "wrap", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, color: "#5C6A72" }}>
              <span><strong style={{ color: "#DCE5E9", fontWeight: 500 }}>412</strong> withdrawals timed</span>
              <span><strong style={{ color: "#DCE5E9", fontWeight: 500 }}>{c.slots}</strong> slot RTPs verified</span>
              <span><strong style={{ color: "#DCE5E9", fontWeight: 500 }}>{c.live}</strong> live tables clocked</span>
            </div>
          </div>

          {/* Animated logo wall */}
          <div style={{ position: "relative", height: 462, overflow: "hidden", animation: "csg-rise .5s ease both" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, height: "100%" }}>
              {wallCols.map((col, ci) => {
                const doubled = [...col, ...col];
                return (
                  <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 12, animation: wallAnims[ci] }}>
                    {doubled.map((slug, i) => (
                      <div
                        key={`${slug}-${i}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          aspectRatio: "1.55",
                          flex: "none",
                          borderRadius: 14,
                          background: i % 3 === 0 ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.03)",
                          border: "1px solid rgba(255,255,255,.07)",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/assets/logos/${slug}.png`}
                          alt=""
                          loading="lazy"
                          style={{ width: "88%", height: "66%", objectFit: "contain", opacity: 0.92 }}
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(180deg,#090C0F 0%,rgba(9,12,15,0) 22%,rgba(9,12,15,0) 78%,#090C0F 100%)" }} />
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(90deg,#090C0F 0%,rgba(9,12,15,0) 14%)" }} />
          </div>
        </div>

        {/* Vertical strip */}
        <div style={{ position: "relative", maxWidth: 1400, margin: "0 auto", padding: "0 40px 8px" }}>
          <div style={{ display: "grid", minWidth: 0, gridTemplateColumns: "repeat(auto-fit,minmax(206px,1fr))", gap: 12 }}>
            {verticals.map((v) => (
              <Link
                key={v.title}
                href={v.href}
                className="group"
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  gap: 11,
                  padding: "20px 22px",
                  borderRadius: 15,
                  background: "rgba(255,255,255,.025)",
                  border: "1px solid rgba(255,255,255,.08)",
                  overflow: "hidden",
                  transition: "transform .18s ease, border-color .18s ease, background .18s ease",
                }}
              >
                <span style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${v.tint},transparent)` }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 19, lineHeight: 1 }}>{v.icon}</span>
                  <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-.022em", color: "#fff" }}>{v.title}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, letterSpacing: ".05em", color: "#5C6A72" }}>
                  <span style={{ color: v.tint }}>{v.count}</span>
                  <span>tested</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 7, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, letterSpacing: ".04em", color: "#9AAAB3", minWidth: 0 }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.top}</span>
                  <span style={{ color: "#fff" }}>{v.topScore}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Ticker */}
        <div style={{ position: "relative", maxWidth: 1400, margin: "0 auto", padding: "0 40px 26px" }}>
          <div style={{ overflow: "hidden", padding: "12px 0", borderTop: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ display: "flex", gap: 30, width: "max-content", animation: "csg-slide 46s linear infinite" }}>
              {tickerRun.map((t, i) => (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11.5, color: "#7B8A93", whiteSpace: "nowrap" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", flex: "none", background: t.tint }} />
                  {t.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured reviews */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "68px 40px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32, flexWrap: "wrap", marginBottom: 22 }}>
          <div>
            <h2 style={{ margin: "0 0 8px", fontSize: 32, letterSpacing: "-.03em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>
              Latest reviews
            </h2>
            <p style={{ margin: 0, fontSize: 15, color: "#8DA0AA" }}>
              Across every vertical we cover. Each one carries the date it was last re-tested.
            </p>
          </div>
          <Link href="/search" style={{ fontSize: 14, fontWeight: 600, color: "#00C2CC", whiteSpace: "nowrap" }}>
            All {c.total} reviews →
          </Link>
        </div>
        <div style={{ display: "grid", minWidth: 0, gridTemplateColumns: "repeat(auto-fit,minmax(232px,1fr))", gap: 12 }}>
          {featured.map((f) => (
            <Link
              key={f.slug}
              href={f.href}
              className="hover:!border-white/18 hover:!bg-[#0F1417]"
              style={{ display: "flex", flexDirection: "column", padding: 20, borderRadius: 13, background: "rgba(12,16,19,.66)", border: "1px solid rgba(255,255,255,.06)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 54, height: 40, flex: "none", borderRadius: 7, background: "rgba(255,255,255,.04)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/assets/logos/${f.slug}.png`} alt="" loading="lazy" style={{ width: "80%", height: "80%", objectFit: "contain" }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: "#E8EDF0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", color: "#00C2CC", marginTop: 2 }}>{f.cat}</div>
                </div>
                <span style={{ marginLeft: "auto", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 17, fontWeight: 500, color: "#fff" }}>{f.score}</span>
              </div>
              <p style={{ margin: "0 0 16px", fontSize: 13, lineHeight: 1.55, color: "#8DA0AA", textWrap: "pretty" }}>{f.line}</p>
              <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", justifyContent: "space-between", gap: 10, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, color: "#4E5A62" }}>
                <span>{f.metric}</span>
                <span>{f.date}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Casino index — this app's own addition, not in the prototype */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "68px 40px 96px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32, flexWrap: "wrap", marginBottom: 22 }}>
          <div>
            <h2 style={{ margin: "0 0 8px", fontSize: 32, letterSpacing: "-.03em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>
              Crypto casino index
            </h2>
            <p style={{ margin: 0, fontSize: 15, color: "#8DA0AA" }}>Ranked by measured score — click a column to re-sort.</p>
          </div>
          <Link href="/crypto-casinos" style={{ fontSize: 14, fontWeight: 600, color: "#00C2CC", whiteSpace: "nowrap" }}>
            See all {c.casinos} casinos →
          </Link>
        </div>
        <CasinoIndexTable operators={ops} />
      </section>
    </main>
  );
}
