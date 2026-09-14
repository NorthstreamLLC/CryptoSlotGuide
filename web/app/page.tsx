import Link from "next/link";
import { siteData, siteCounts } from "@/lib/site-data";
import { topScore } from "@/lib/derived";
import { tintFor } from "@/lib/logo";
import { CasinoIndexTable } from "@/components/home/CasinoIndexTable";
import { CryptoTicker } from "@/components/home/CryptoTicker";
import { SlotsPreviewTable } from "@/components/home/SlotsPreviewTable";
import { BrandMark } from "@/components/ui/BrandMark";
import { filterFns } from "@/lib/casino-index";

/**
 * A slug in the hero logo wall (wallCols, below) can be a casino, wallet,
 * exchange or provider — the only four data sources that carry a `mono`
 * field. Casinos/wallets/exchanges don't carry their own brand tint (see
 * lib/logo.ts's tintFor for why), so this falls back to that for them;
 * providers already have a real one.
 */
function brandFor(slug: string): { mono: string; tint: string } {
  const { ops, providers, walletRows, exchangeRows } = siteData;
  const p = providers.find((x) => x.slug === slug);
  if (p) return { mono: p.mono, tint: p.tint };
  const w = walletRows.find((x) => x.slug === slug);
  if (w) return { mono: w.mono, tint: "#9B8FC4" };
  const x = exchangeRows.find((x) => x.slug === slug);
  if (x) return { mono: x.mono, tint: "#5FE3E8" };
  const o = ops.find((x) => x.slug === slug);
  return { mono: o?.mono ?? slug.slice(0, 2).toUpperCase(), tint: tintFor(slug) };
}

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

/**
 * Featured cards. Every score and metric is read from siteData; the one-line
 * copy only states what those records (or published terms) show. No
 * per-card dates — nothing here has a real re-test date behind it.
 */
function buildFeatured() {
  const { ops, slots, providers, walletRows, exchangeRows, sbData, coinsBy, coinDefs } = siteData;
  const op = (s: string) => ops.find((x) => x.slug === s);
  const slot = (s: string) => slots.find((x) => x.slug === s);
  const prov = (s: string) => providers.find((x) => x.slug === s);
  const wal = (s: string) => walletRows.find((x) => x.slug === s);
  const exch = (s: string) => exchangeRows.find((x) => x.slug === s);
  const score = (n: number | undefined) => (n === undefined ? "—" : n.toFixed(1));

  const sb = slot("sweet-bonanza");
  const kr = exch("kraken");
  const st = op("stake");
  const fastest = [...ops].sort((a, b) => a.payout - b.payout)[0];
  const ph = wal("phantom");
  const hg = prov("hacksaw-gaming");
  const cb = op("cloudbet");
  const cbBook = sbData["cloudbet"];
  const lowestMargin = Math.min(...Object.values(sbData).map((b) => parseFloat(b.margin)));
  const lg = wal("ledger");
  const nc = prov("nolimit-city");

  return [
    { name: "Sweet Bonanza", mono: "SWB", slug: "sweet-bonanza", cat: "Slot", score: sb ? `${sb.rtp.toFixed(2)}%` : "—", line: `Published at ${sb ? `${sb.rtp.toFixed(2)}%` : "its studio RTP"}, but operators can licence a lower build. Check the RTP in the game's info screen before you spin.`, metric: `Max win ${sb?.maxWin ?? "—"}`, cta: "Slot review →", href: "/slots/sweet-bonanza" },
    { name: "Kraken", mono: "KR", slug: "kraken", cat: "Exchange", score: score(kr?.score), line: "Tightest listed spread of the exchanges on our index, and no daily withdrawal cap once the account is verified.", metric: `Listed spread ${kr?.m1 ?? "—"}`, cta: "Review →", href: "/exchanges/kraken" },
    { name: "Stake", mono: "ST", slug: "stake", cat: "Casino", score: score(st?.score), line: `${(coinsBy["stake"] ?? []).length} of the ${coinDefs.length} coins we track on the cashier and 1× rakeback, but its listed payout trails ${fastest?.name ?? "the fastest on our index"}.`, metric: `${st?.payoutLabel ?? "—"} listed payout`, cta: "Review →", href: "/casinos/stake" },
    { name: "Phantom", mono: "PH", slug: "phantom", cat: "Wallet", score: score(ph?.score), line: "Solana-first self-custody wallet with automatic priority fees. Chain coverage is narrower than MetaMask's.", metric: ph?.m2 ?? "—", cta: "Review →", href: "/wallets/phantom" },
    { name: "Hacksaw Gaming", mono: "HG", slug: "hacksaw-gaming", cat: "Provider", score: score(hg?.score), line: "Publishes one RTP per title, which is rarer than it should be. Volatility is not for everyone.", metric: `${hg?.titles ?? "—"} titles`, cta: "Studio profile →", href: "/providers/hacksaw-gaming" },
    { name: "Cloudbet", mono: "CB", slug: "cloudbet", cat: "Sportsbook", score: score(cb?.score), line: `${cbBook && parseFloat(cbBook.margin) === lowestMargin ? "Lowest listed margin of the sportsbooks on our index" : "Sportsbook and casino on one balance"}. The casino welcome offer carries ${cb?.wager ?? "—"}× wagering.`, metric: `${cbBook?.margin ?? "—"} listed margin`, cta: "Sportsbooks →", href: "/sportsbooks" },
    { name: "Ledger", mono: "LG", slug: "ledger", cat: "Wallet", score: score(lg?.score), line: "The reference hardware wallet for cold storage. Gas is set by hand per chain, which adds a step to every casino deposit.", metric: `${lg?.m2 ?? "—"}`, cta: "Review →", href: "/wallets/ledger" },
    { name: "Nolimit City", mono: "NC", slug: "nolimit-city", cat: "Provider", score: score(nc?.score), line: "Extreme volatility by design. The max-win ceilings are high and the base game will test your bankroll.", metric: `RTP ${nc?.rtp ?? "—"}`, cta: "Studio profile →", href: "/providers/nolimit-city" },
  ];
}

export default function HomePage() {
  const { ops, slots, liveCasinos, providers, walletRows, exchangeRows, coinDefs, coinsBy, sportsMarkets, esportsTitles, criteria } = siteData;
  const c = siteCounts;
  const featured = buildFeatured();

  const topCasino = topScore(ops);
  const topLive = topScore(liveCasinos);
  const topSlot = [...slots].sort((a, b) => b.rtp - a.rtp)[0];
  const topProvider = topScore(providers);
  const topBook = topScore(ops.filter((o) => o.sports));
  const topWallet = topScore(walletRows);

  // "Best operator" lookups for the sportsbook/esports hub items below —
  // sportsMarkets/esportsTitles name a `best` operator by name but not
  // its score, so pull it from ops the same way every other "top" figure
  // on this page is derived rather than hardcoded.
  const scoreFor = (opName: string) => ops.find((o) => o.name === opName)?.score.toFixed(1);

  const categoryHub = {
    kicker: "By category",
    title: "How you want to play",
    blurb: "Filtered by the operational detail that actually differs — verification, payout speed, and bonus terms.",
    items: [
      { label: "No-KYC casinos", href: "/crypto-casinos/no-kyc", filter: "nokyc" as const },
      { label: "Fastest payouts", href: "/fastest-payouts", filter: "fast" as const },
      { label: "Lowest wagering", href: "/lowest-wagering", filter: "lowwager" as const },
      { label: "Casino + sportsbook", href: "/casino-sportsbooks", filter: "sports" as const },
    ].map((it, i) => {
      const top = topScore(ops.filter(filterFns[it.filter]));
      return { n: String(i + 1).padStart(2, "0"), label: it.label, href: it.href, top: top ? `${top.name} ${top.score.toFixed(1)}` : "—", topColor: top?.name === "Roobet" ? "#FFCC00" : "#5C6A72" };
    }),
  };
  const sportsHub = {
    kicker: "Sportsbooks",
    title: "Betting with crypto",
    blurb: "Margin, market depth and settlement speed on the events readers bet most.",
    items: sportsMarkets.slice(0, 4).map((m, i) => ({
      n: String(i + 1).padStart(2, "0"),
      label: m.name,
      href: `/betting/${slug(m.name)}`,
      top: `${m.best} ${scoreFor(m.best) ?? ""}`.trim(),
      topColor: m.best === "Roobet" ? "#FFCC00" : "#5C6A72",
    })),
  };
  const esportsHub = {
    kicker: "Esports",
    title: "Where the markets are",
    blurb: "Listed live market counts per title, and the operator carrying the most.",
    items: esportsTitles.slice(0, 4).map((t, i) => ({
      n: String(i + 1).padStart(2, "0"),
      label: t.name,
      href: `/betting/${slug(t.name)}`,
      top: `${t.best} ${scoreFor(t.best) ?? ""}`.trim(),
      topColor: t.best === "Roobet" ? "#FFCC00" : "#5C6A72",
    })),
  };
  const hubs = [categoryHub, sportsHub, esportsHub];

  const toolLists = [
    { kicker: "Wallets", title: "Where the bankroll lives", blurb: "Custody model, chain coverage, and how each handles gas.", href: "/wallets", items: walletRows },
    { kicker: "Exchanges", title: "Getting on and off chain", blurb: "Listed spreads, fiat rails and withdrawal limits.", href: "/exchanges", items: exchangeRows },
  ];

  const coinTiles = coinDefs.map((coin) => ({
    ...coin,
    count: ops.filter((o) => (coinsBy[o.slug] ?? []).map(String).includes(coin.ticker)).length,
  }));

  const verticals = [
    { icon: "♠️", title: "Crypto casinos", tint: "#00C2CC", count: c.casinos, top: topCasino?.name ?? "—", topScore: topCasino?.score.toFixed(1) ?? "—", href: "/crypto-casinos" },
    { icon: "🃏", title: "Live casino", tint: "#FF7EB6", count: c.live, top: topLive?.name ?? "—", topScore: topLive?.score.toFixed(1) ?? "—", href: "/live-casino" },
    { icon: "🎰", title: "Slots & RTP", tint: "#FFB347", count: c.slots, top: topSlot?.name ?? "—", topScore: topSlot ? `${topSlot.rtp.toFixed(1)}%` : "—", href: "/slots" },
    { icon: "🎮", title: "Game studios", tint: "#B284FF", count: c.providers, top: topProvider?.name ?? "—", topScore: topProvider?.score.toFixed(1) ?? "—", href: "/providers" },
    { icon: "⚽", title: "Sportsbooks", tint: "#57E39A", count: c.books, top: topBook?.name ?? "—", topScore: topBook?.score.toFixed(1) ?? "—", href: "/sportsbooks" },
    { icon: "👛", title: "Wallets", tint: "#6BC7FF", count: c.wallets, top: topWallet?.name ?? "—", topScore: topWallet?.score.toFixed(1) ?? "—", href: "/wallets" },
  ];

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
              {c.total} products indexed · {c.casinos} crypto casinos
            </div>
            <h1 style={{ margin: "0 0 22px", fontSize: 62, lineHeight: 1.02, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "118%", color: "#fff", textWrap: "balance" }}>
              Sourced, not
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
              Crypto casinos, wallets and exchanges scored against their published terms and public records; a figure
              only says tested when a funded account backs it. Slots, providers and sportsbooks assessed from public
              paytables and posted odds. Every review says which is which — start with a number, not a banner.
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
              <span><strong style={{ color: "#DCE5E9", fontWeight: 500 }}>{c.casinos}</strong> crypto casinos listed</span>
              <span><strong style={{ color: "#DCE5E9", fontWeight: 500 }}>{c.slots}</strong> published slot RTPs</span>
              <span><strong style={{ color: "#DCE5E9", fontWeight: 500 }}>{c.live}</strong> live table types listed</span>
            </div>
          </div>

          {/* Animated logo wall */}
          <div style={{ position: "relative", height: 462, overflow: "hidden", animation: "csg-rise .5s ease both" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, height: "100%" }}>
              {wallCols.map((col, ci) => {
                const doubled = [...col, ...col];
                return (
                  <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 12, animation: wallAnims[ci] }}>
                    {doubled.map((slug, i) => {
                      const b = brandFor(slug);
                      return (
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
                          <span
                            style={{
                              fontFamily: "var(--font-jetbrains-mono), monospace",
                              fontSize: 22,
                              fontWeight: 700,
                              letterSpacing: ".02em",
                              color: b.tint,
                              opacity: 0.92,
                            }}
                          >
                            {b.mono}
                          </span>
                        </div>
                      );
                    })}
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
                  <span>listed</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 7, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, letterSpacing: ".04em", color: "#9AAAB3", minWidth: 0 }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.top}</span>
                  <span style={{ color: "#fff" }}>{v.topScore}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Live crypto price ticker — replaced the tickerFacts strip (static
            hand-authored copy claiming specific measured events like "Roobet
            withdrawal cleared in 3m 58s") that read as fabricated activity
            logging once nothing behind it was real. */}
        <div style={{ position: "relative", maxWidth: 1400, margin: "0 auto", padding: "0 40px 26px" }}>
          <CryptoTicker coins={siteData.coinDefs} />
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
              Across every vertical we cover. Scores and figures come from the index; each review says what was checked and how.
            </p>
          </div>
          <Link href="/search" style={{ fontSize: 14, fontWeight: 600, color: "#00C2CC", whiteSpace: "nowrap" }}>
            All {c.total} listings →
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
                <div style={{ width: 54, height: 40, flex: "none", borderRadius: 7, overflow: "hidden" }}>
                  <BrandMark slug={f.slug} mono={f.mono} tint={tintFor(f.slug)} radius={7} fontSize={12} />
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
                <span style={{ color: "#00C2CC" }}>{f.cta}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Casino index — this app's own addition, not in the prototype */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "68px 40px 62px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32, flexWrap: "wrap", marginBottom: 22 }}>
          <div>
            <h2 style={{ margin: "0 0 8px", fontSize: 32, letterSpacing: "-.03em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>
              Crypto casino index
            </h2>
            <p style={{ margin: 0, fontSize: 15, color: "#8DA0AA" }}>Ranked by score — click a column to re-sort.</p>
          </div>
          <Link href="/crypto-casinos" style={{ fontSize: 14, fontWeight: 600, color: "#00C2CC", whiteSpace: "nowrap" }}>
            See all {c.casinos} casinos →
          </Link>
        </div>
        <CasinoIndexTable operators={ops} />
      </section>

      {/* Slots */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "58px 40px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32, flexWrap: "wrap", marginBottom: 22 }}>
          <div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 12 }}>Slots</div>
            <h2 style={{ margin: "0 0 9px", fontSize: 32, letterSpacing: "-.03em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>Slots worth the volatility</h2>
            <p style={{ margin: 0, fontSize: 15, color: "#8DA0AA", maxWidth: "70ch", textWrap: "pretty" }}>
              RTP is configurable — operators can ship the same game at 96.5% or 94%. Published return shown below; once we field-test a build in a specific operator&apos;s account, the slot&apos;s own review names the operator that cut it.
            </p>
          </div>
          <Link href="/slots" style={{ fontSize: 14, fontWeight: 600, color: "#00C2CC", whiteSpace: "nowrap" }}>
            All {c.slots} slots →
          </Link>
        </div>
        <SlotsPreviewTable slots={slots} />
      </section>

      {/* Providers */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "58px 40px 0" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 12 }}>Providers</div>
          <h2 style={{ margin: "0 0 9px", fontSize: 32, letterSpacing: "-.03em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>Who actually makes the games</h2>
          <p style={{ margin: 0, fontSize: 15, color: "#8DA0AA", maxWidth: "70ch" }}>Studio profiles with the RTP range each one ships, their volatility signature, and how many crypto casinos carry them.</p>
        </div>
        <div style={{ display: "grid", minWidth: 0, gridTemplateColumns: "repeat(auto-fit,minmax(178px,1fr))", gap: 12 }}>
          {providers.map((p) => (
            <Link key={p.slug} href={`/providers/${p.slug}`} className="hover:!border-accent hover:!bg-[#111619]" style={{ display: "block", padding: 20, borderRadius: 13, background: "rgba(14,18,21,.72)", border: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ width: 40, height: 40, marginBottom: 16 }}>
                <BrandMark slug={p.slug} mono={p.mono} tint={p.tint} fontSize={12} />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: "#E8EDF0", marginBottom: 5 }}>{p.name}</div>
              <div style={{ fontSize: 12, lineHeight: 1.5, color: "#7B8A93", marginBottom: 14 }}>{p.note}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.07)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, color: "#5C6A72" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span>titles</span><span style={{ color: "#C3CFD5" }}>{p.titles}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span>rtp</span><span style={{ color: "#C3CFD5" }}>{p.rtp}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span>casinos</span><span style={{ color: "#C3CFD5" }}>{p.casinos}</span></div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* By coin */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "58px 40px 0" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 26, letterSpacing: "-.025em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>Casinos by coin</h2>
        <p style={{ margin: "0 0 20px", fontSize: 15, color: "#8DA0AA" }}>Deposit rails differ per chain. These pages compare confirmation counts, minimums, and who pays the network fee.</p>
        <div style={{ display: "grid", minWidth: 0, gridTemplateColumns: "repeat(auto-fit,minmax(178px,1fr))", gap: 12 }}>
          {coinTiles.map((coin) => (
            <Link key={coin.ticker} href="/coins" className="hover:!border-accent hover:!bg-[#111619]" style={{ display: "block", padding: 20, borderRadius: 13, background: "rgba(14,18,21,.72)", border: "1px solid rgba(255,255,255,.06)" }}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: "50%", background: coin.tint, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, fontWeight: 700, color: "#0A0D0F", marginBottom: 14 }}>
                {coin.ticker}
              </span>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#E8EDF0", marginBottom: 4 }}>{coin.name} casinos</div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, color: "#5C6A72" }}>{coin.count} operators</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Category / sports / esports hubs */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "56px 40px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
          {hubs.map((h) => (
            <div key={h.kicker} style={{ padding: 26, borderRadius: 14, background: "rgba(12,16,19,.66)", border: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 16 }}>{h.kicker}</div>
              <h3 style={{ margin: "0 0 6px", fontSize: 20, letterSpacing: "-.02em", fontWeight: 700, color: "#fff" }}>{h.title}</h3>
              <p style={{ margin: "0 0 20px", fontSize: 13.5, lineHeight: 1.55, color: "#8DA0AA" }}>{h.blurb}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "rgba(255,255,255,.06)", borderRadius: 9, overflow: "hidden" }}>
                {h.items.map((it) => (
                  <Link key={it.label} href={it.href} className="hover:!bg-[#141A1E] hover:!text-white" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "#0F1417", fontSize: 13, color: "#C3CFD5" }}>
                    <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, color: "#4E5A62", width: 14 }}>{it.n}</span>
                    <span style={{ flex: 1 }}>{it.label}</span>
                    <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, color: it.topColor, whiteSpace: "nowrap" }}>{it.top}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Wallets & exchanges */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "56px 40px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 14 }}>
          {toolLists.map((t) => (
            <div key={t.kicker} style={{ padding: 26, borderRadius: 14, background: "rgba(12,16,19,.66)", border: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 10 }}>{t.kicker}</div>
                  <h3 style={{ margin: "0 0 5px", fontSize: 21, letterSpacing: "-.02em", fontWeight: 700, color: "#fff" }}>{t.title}</h3>
                  <p style={{ margin: 0, fontSize: 13.5, color: "#8DA0AA" }}>{t.blurb}</p>
                </div>
                <Link href={t.href} style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#00C2CC", whiteSpace: "nowrap" }}>
                  view all →
                </Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "rgba(255,255,255,.06)", borderRadius: 10, overflow: "hidden" }}>
                {t.items.map((it) => (
                  <Link
                    key={it.slug}
                    href={`${t.href}/${it.slug}`}
                    className="hover:!bg-[#141A1E]"
                    style={{ display: "grid", gridTemplateColumns: "56px minmax(90px,1fr) minmax(110px,1.4fr) 52px", alignItems: "center", gap: 12, padding: "12px 14px", background: "#0F1417" }}
                  >
                    <div style={{ width: 30, height: 30 }}>
                      <BrandMark slug={it.slug} mono={it.mono} tint={t.kicker === "Wallets" ? "#9B8FC4" : "#5FE3E8"} fontSize={10} />
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#E8EDF0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</span>
                    <span style={{ fontSize: 12, color: "#7B8A93", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.note}</span>
                    <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 13, color: "#fff", textAlign: "right" }}>{it.score.toFixed(1)}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Methodology teaser */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "60px 40px 80px" }}>
        <div style={{ padding: 44, borderRadius: 16, background: "linear-gradient(150deg,#0E1417,#0A0E10)", border: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(260px,.85fr) minmax(300px,1.15fr)", gap: 56, alignItems: "start" }}>
            <div>
              <h2 style={{ margin: "0 0 14px", fontSize: 30, letterSpacing: "-.03em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>Six criteria. No paid placement inside a score.</h2>
              <p style={{ margin: "0 0 22px", fontSize: 15, lineHeight: 1.65, color: "#8DA0AA", textWrap: "pretty" }}>
                Crypto casinos, wallets and exchanges are scored against their own published terms. A funded-account field test is added to a review only when one has actually been run, and the review says so. Slots and providers are assessed from published paytables and the studios&apos; stated RTPs. Commercial relationships are disclosed on every page and excluded from scoring inputs.
              </p>
              <Link href="/how-we-rate" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#00C2CC" }}>
                Read the full methodology <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>→</span>
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 1, background: "rgba(255,255,255,.07)", borderRadius: 12, overflow: "hidden" }}>
              {criteria.map((cr) => (
                <div key={cr.name} style={{ padding: "18px 20px", background: "rgba(12,16,19,.66)" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#E8EDF0" }}>{cr.name}</span>
                    <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#5C6A72" }}>{cr.weight}</span>
                  </div>
                  <div style={{ fontSize: 12, lineHeight: 1.5, color: "#75858E" }}>{cr.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
