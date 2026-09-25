import Link from "next/link";
import { sportsFacts, booksForTitle } from "@/lib/sports";
import { rtpSortValue } from "@/lib/slot-facts";
import { siteData, siteCounts } from "@/lib/site-data";
import { allVersionsListedStudios, selfCustodyWallets } from "@/lib/derived";
import { tintFor } from "@/lib/logo";
import { CryptoTicker } from "@/components/home/CryptoTicker";
import { LogoColumns } from "@/components/home/LogoColumns";
import { SlotsPreviewTable } from "@/components/home/SlotsPreviewTable";
import { BrandMark } from "@/components/ui/BrandMark";
import { filterFns } from "@/lib/casino-index";
import { casinoFacts } from "@/lib/casino-facts";
import { CasinoCard } from "@/components/casino/CasinoCard";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

/**
 * The home page is the one page not built through pageMetadata(), so it was
 * the only page shipping without a canonical — the page most likely to be
 * reached as www, with a trailing slash, or on the deployment URL.
 */
export const metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    title: "CryptoSlotGuide — crypto casino, slot and wallet information",
    description:
      "Crypto casinos, sportsbooks, wallets and exchanges reviewed against their own terms, with every fact linked to its source.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website" as const,
  },
  twitter: { card: "summary" as const },
};
import { CasinoOfferList } from "@/components/casino/CasinoOfferList";
import { raceFor, raceSlugs } from "@/lib/races";
import { TopPicks } from "@/components/home/TopPicks";
import { topPicks } from "@/lib/top-picks";
import { CoinIcon } from "@/components/ui/CoinIcon";

/**
 * Ported from the HOME section of CryptoSlotGuide.dc.html (hero through
 * the featured-reviews grid — search that file for `<!-- HERO -->` and
 * `FEATURED REVIEWS`). Structure/spacing/colors are the real ones; the
 * casino index table below it is this app's own addition (the prototype
 * doesn't have one on the homepage), kept because it's genuinely useful.
 */

const quickChips = [
  { label: "Bitcoin casinos", href: "/crypto-casinos" },
  { label: "No-KYC", href: "/crypto-casinos/no-kyc" },
  { label: "Biggest races", href: "/races" },
  { label: "Provably fair games", href: "/house-games" },
  { label: "High RTP slots", href: "/slots" },
  { label: "Esports betting", href: "/sportsbooks?tab=2" },
  { label: "Hardware wallets", href: "/wallets" },
];

/**
 * Featured cards. Every metric is read from siteData; the one-line
 * copy only states what those records (or published terms) show. No
 * per-card dates — nothing here has a real re-test date behind it.
 */
function buildFeatured() {
  const { ops, slots, providers, walletRows, exchangeRows, coinsBy, coinDefs } = siteData;
  const op = (s: string) => ops.find((x) => x.slug === s);
  const slot = (s: string) => slots.find((x) => x.slug === s);
  const prov = (s: string) => providers.find((x) => x.slug === s);
  const wal = (s: string) => walletRows.find((x) => x.slug === s);
  const exch = (s: string) => exchangeRows.find((x) => x.slug === s);

  const sb = slot("sweet-bonanza");
  const kr = exch("kraken");
  const ph = wal("phantom");
  const hg = prov("hacksaw-gaming");
  const books = ops.filter((o) => o.sports).length;
  const lg = wal("ledger");

  const rb = op("roobet");
  return [
    { name: "Roobet", mono: "RB", slug: "roobet", cat: "Featured", line: "Roobet says withdrawals are sent instantly on request, charges no fee on crypto withdrawals, and pays rakeback with no wagering multiplier.", metric: rb ? `${casinoFacts(rb).coins.length} coins accepted` : "—", cta: "Profile →", href: "/casinos/roobet" },
    { name: "Sweet Bonanza", mono: "SWB", slug: "sweet-bonanza", cat: "Slot", line: `Published at ${sb ? `${sb.rtp.toFixed(2)}%` : "its studio RTP"}, but operators can licence a lower build. Check the RTP in the game's info screen before you spin.`, metric: sb ? `${sb.provider} game page` : "—", cta: "Slot review →", href: "/slots/sweet-bonanza" },
    { name: "Kraken", mono: "KR", slug: "kraken", cat: "Exchange", line: "MiCA-licensed, FCA-registered and publishes proof of reserves — its entry-tier Pro fees are the highest of the five.", metric: `${kr?.m1 ?? "—"} entry taker fee`, cta: "Review →", href: "/exchanges/kraken" },
    { name: "Stake", mono: "ST", slug: "stake", cat: "Casino", line: `Stake says crypto withdrawals are processed immediately, with no maximum withdrawal. It lists ${casinoFacts(op("stake")!).coins.length} coins on its cashier.`, metric: `${casinoFacts(op("stake")!).coins.length} coins accepted`, cta: "Review →", href: "/casinos/stake" },
    { name: "Phantom", mono: "PH", slug: "phantom", cat: "Wallet", line: "Solana-first self-custody wallet with transaction previews before you approve, audited by Kudelski and Least Authority.", metric: ph?.m2 ?? "—", cta: "Review →", href: "/wallets/phantom" },
    { name: "Hacksaw Gaming", mono: "HG", slug: "hacksaw-gaming", cat: "Provider", line: "Lists every RTP version it licenses on each game page, so you can see how low a casino's build could go. Volatility is not for everyone.", metric: hg?.rtp ?? "—", cta: "Studio profile →", href: "/providers/hacksaw-gaming" },
    { name: "Cloudbet", mono: "CB", slug: "cloudbet", cat: "Sportsbook", line: "Sportsbook and casino on one balance. Its welcome package covers both, paid as cash drops and rakeback over the first 30 days.", metric: `${books} sportsbooks listed`, cta: "Sportsbooks →", href: "/sportsbooks" },
    { name: "Ledger", mono: "LG", slug: "ledger", cat: "Wallet", line: "Hardware wallet with keys in a Secure Element and a Transaction Check before you sign.", metric: `${lg?.m2 ?? "—"}`, cta: "Review →", href: "/wallets/ledger" },
  ];
}

export default function HomePage() {
  const { ops, slots, houseGames, providers, walletRows, exchangeRows, coinDefs, coinsBy, esportsTitles, criteria } = siteData;
  const c = siteCounts;
  const featured = buildFeatured();
  const featuredOp = ops.find((o) => o.featured);
  const picks = topPicks();
  // Featured placements first, then the fastest stated withdrawals among casinos with a cited offer.
  const topOffers = [...ops]
    .filter((o) => o.featured || (o.payoutStatedMaxMins !== undefined && !!casinoFacts(o).offer && !!casinoFacts(o).wagering && casinoFacts(o).wagering !== "See terms" && !/^advertised/i.test(casinoFacts(o).headline)))
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || (a.payoutStatedMaxMins ?? 9e9) - (b.payoutStatedMaxMins ?? 9e9) || a.name.localeCompare(b.name))
    .slice(0, 10);

  // Highest studio-published RTP — a factual sort, not a rating.
  const topSlot = [...slots].sort((a, b) => rtpSortValue(b) - rtpSortValue(a))[0];

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
      const n = ops.filter(filterFns[it.filter]).length;
      return { n: String(i + 1).padStart(2, "0"), label: it.label, href: it.href, top: `${n} casinos`, topColor: "#83919A" };
    }),
  };
  const sportsHub = {
    kicker: "Sportsbooks",
    title: "Betting with crypto",
    blurb: "Cash-out, bet builder and payout caps, from each book's own betting rules.",
    items: [
      { label: "All sportsbooks", href: "/sportsbooks", n: ops.filter((o) => o.sports).length },
      { label: "Casinos with esports", href: "/esports-casinos", n: ops.filter((o) => o.esports).length },
      { label: "State a payout cap", href: "/sportsbooks", n: ops.filter((o) => sportsFacts(o.slug).maxPayout).length },
      { label: "Offer cash-out", href: "/sportsbooks", n: ops.filter((o) => sportsFacts(o.slug).cashout).length },
    ].map((it, i) => ({ n: String(i + 1).padStart(2, "0"), label: it.label, href: it.href, top: `${it.n} casinos`, topColor: "#83919A" })),
  };
  const esportsHub = {
    kicker: "Esports",
    title: "Which books take which titles",
    blurb: "The casinos that name each title on their own sportsbook pages.",
    items: esportsTitles.slice(0, 4).map((t, i) => ({
      n: String(i + 1).padStart(2, "0"),
      label: t.name,
      href: `/betting/${slug(t.name)}`,
      top: `${booksForTitle(t.name).length} books`,
      topColor: "#83919A",
    })),
  };
  const hubs = [categoryHub, sportsHub, esportsHub];

  const toolLists = [
    { kicker: "Wallets", title: "Where the bankroll lives", blurb: "Custody model, chain coverage, and how each handles gas.", href: "/wallets", items: [...walletRows].sort((a, b) => a.name.localeCompare(b.name)) },
    { kicker: "Exchanges", title: "Getting on and off chain", blurb: "Entry fees, fiat rails and withdrawal limits, from each exchange's own pages.", href: "/exchanges", items: [...exchangeRows].sort((a, b) => a.name.localeCompare(b.name)) },
  ];

  const coinTiles = coinDefs.map((coin) => ({
    ...coin,
    count: ops.filter((o) => (coinsBy[o.slug] ?? []).map(String).includes(coin.ticker)).length,
  }));

  const verticals = [
    { icon: "♠️", title: "Crypto casinos", tint: "#00C2CC", count: c.casinos, factLabel: "No-KYC", factValue: String(ops.filter((o) => o.kyc === "none").length), href: "/crypto-casinos" },
    { icon: "🎲", title: "House games", tint: "#FF7EB6", count: houseGames.length, factLabel: "Game types", factValue: String(houseGames.length), href: "/house-games" },
    { icon: "🎰", title: "Slots & RTP", tint: "#FFB347", count: c.slots, factLabel: topSlot?.name ?? "—", factValue: topSlot ? `${topSlot.rtp.toFixed(1)}%` : "—", href: "/slots" },
    { icon: "🎮", title: "Game studios", tint: "#B284FF", count: c.providers, factLabel: "All RTPs listed", factValue: String(allVersionsListedStudios(providers)), href: "/providers" },
    { icon: "⚽", title: "Sportsbooks", tint: "#57E39A", count: c.books, factLabel: "With esports", factValue: String(ops.filter((o) => o.esports).length), href: "/sportsbooks" },
    { icon: "👛", title: "Wallets", tint: "#6BC7FF", count: c.wallets, factLabel: "Self-custody", factValue: String(selfCustodyWallets(walletRows)), href: "/wallets" },
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
        <LogoColumns />
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
              Crypto casinos, sportsbooks, wallets and exchanges reviewed against their own terms and public records,
              with every fact linked to its source. Slots and studios from their published paytables. Start with a
              number, not a banner.
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
              <span style={{ color: "#77858E", fontFamily: "var(--font-jetbrains-mono), monospace" }}>⌕</span>
              <span style={{ flex: 1, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 13, color: "#83919A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                casinos, slots, sportsbooks, wallets, coins…
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

            <div style={{ display: "flex", gap: 32, flexWrap: "wrap", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, color: "#83919A" }}>
              <span><strong style={{ color: "#DCE5E9", fontWeight: 500 }}>{c.casinos}</strong> crypto casinos listed</span>
              <span><strong style={{ color: "#DCE5E9", fontWeight: 500 }}>{c.slots}</strong> published slot RTPs</span>
              <span><strong style={{ color: "#DCE5E9", fontWeight: 500 }}>{c.providers}</strong> game studios profiled</span>
            </div>
          </div>

          {/* Featured pick, rotating one per vertical. The casino is first on
              load, so the card a first visit sees is unchanged. */}
          {picks.length > 0 && (
            <div style={{ alignSelf: "center", width: "100%", maxWidth: 460, justifySelf: "end", animation: "csg-rise .5s ease both" }}>
              <TopPicks picks={picks} />
            </div>
          )}
        </div>

        {/* Vertical strip */}
        <div style={{ position: "relative", maxWidth: 1400, margin: "0 auto", padding: "0 40px 8px" }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6" style={{ minWidth: 0, gap: 12 }}>
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
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, letterSpacing: ".05em", color: "#83919A" }}>
                  <span style={{ color: v.tint }}>{v.count}</span>
                  <span>listed</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 7, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, letterSpacing: ".04em", color: "#9AAAB3", minWidth: 0 }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.factLabel}</span>
                  <span style={{ color: "#fff" }}>{v.factValue}</span>
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

      {/* Top offers */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "68px 40px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32, flexWrap: "wrap", marginBottom: 22 }}>
          <div>
            <h2 style={{ margin: "0 0 8px", fontSize: 32, letterSpacing: "-.03em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>Top casino offers</h2>
            <p style={{ margin: 0, fontSize: 15, color: "#8DA0AA" }}>Welcome offers, withdrawal speed and coins at a glance, each backed by the casino&apos;s own terms.</p>
          </div>
          <Link href="/crypto-casinos" style={{ fontSize: 14, fontWeight: 600, color: "#00C2CC", whiteSpace: "nowrap" }}>
            All {c.casinos} casinos →
          </Link>
        </div>
        <CasinoOfferList ops={topOffers} />
      </section>

      {/* Start here — the tools and maps, which otherwise only live in the menu. */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "56px 40px 0" }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 32, letterSpacing: "-.03em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>Start here</h2>
          <p style={{ margin: 0, fontSize: 15, color: "#8DA0AA" }}>Answer the question you actually came with — where you can play, what an offer is worth, and which build of a slot a casino ships.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 12 }}>
          {[
            { href: "/find-my-casino", label: "Find my casino", hint: "Three questions, matched against each casino's own terms." },
            { href: "/bonuses", label: "Every bonus", hint: "Welcome offers and rewards with the wagering each carries." },
            { href: "/vip-calculator", label: "VIP calculator", hint: "What rank your wager reaches at each published ladder." },
            { href: "/rtp-watch", label: "RTP Watch", hint: "Which casinos ship a cut build of the same slot." },
            { href: "/legal", label: "Gambling laws", hint: "45 countries and all 50 US states, from their regulators." },
            { href: "/sweepstakes-casinos", label: "US sweepstakes", hint: "The legal US route, with each casino's excluded states." },
            { href: "/compare", label: "Head to head", hint: "Two casinos, the same rows, the better figure marked." },
            { href: "/fastest-payouts", label: "Fastest payouts", hint: "Ranked on the withdrawal time each operator states." },
          ].map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="transition-colors hover:border-white/20 hover:bg-white/[0.04]"
              style={{ display: "flex", flexDirection: "column", gap: 7, padding: "18px 20px", borderRadius: 15, background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.08)" }}
            >
              <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-.018em", color: "#fff" }}>
                {t.label} <span aria-hidden style={{ color: "#00C2CC" }}>→</span>
              </span>
              <span style={{ fontSize: 13, lineHeight: 1.5, color: "#8DA0AA" }}>{t.hint}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Biggest races */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "56px 40px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32, flexWrap: "wrap", marginBottom: 18 }}>
          <div>
            <h2 style={{ margin: "0 0 8px", fontSize: 32, letterSpacing: "-.03em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>Biggest races & raffles</h2>
            <p style={{ margin: 0, fontSize: 15, color: "#8DA0AA" }}>Daily, weekly and monthly prize pools you enter just by playing.</p>
          </div>
          <Link href="/races" style={{ fontSize: 14, fontWeight: 600, color: "#00C2CC", whiteSpace: "nowrap" }}>
            All races →
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
          {raceSlugs().slice(0, 4).map((s) => {
            const op = ops.find((x) => x.slug === s)!;
            return (
              <Link key={s} href={`/casinos/${s}`} style={{ display: "flex", flexDirection: "column", gap: 10, padding: 18, borderRadius: 16, background: "radial-gradient(120% 90% at 100% 0%, rgba(214,182,92,.12), transparent 60%), #0C1013", border: "1px solid rgba(214,182,92,.2)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 30, height: 30, flex: "none", borderRadius: 8, overflow: "hidden" }}>
                    <BrandMark slug={s} mono={op.mono} tint={tintFor(s)} radius={8} fontSize={10} />
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{op.name}</span>
                </span>
                <span style={{ fontSize: 17, lineHeight: 1.25, fontWeight: 800, color: "#fff" }}>{raceFor(s)!.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#D6B65C" }}>View offer →</span>
              </Link>
            );
          })}
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
              Across every vertical we cover. Figures come from the index; each review says what was checked and how.
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
              </div>
              <p style={{ margin: "0 0 16px", fontSize: 13, lineHeight: 1.55, color: "#8DA0AA", textWrap: "pretty" }}>{f.line}</p>
              <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", justifyContent: "space-between", gap: 10, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, color: "#77858E" }}>
                <span>{f.metric}</span>
                <span style={{ color: "#00C2CC" }}>{f.cta}</span>
              </div>
            </Link>
          ))}
        </div>
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
        <SlotsPreviewTable slots={slots.slice(0, 8)} />
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
              <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.07)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, color: "#83919A" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span>rtp</span><span style={{ color: "#C3CFD5", textAlign: "right" }}>{p.rtp}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span>catalogue</span><span style={{ color: "#C3CFD5", textAlign: "right" }}>{p.titlesStated ?? "not stated"}</span></div>
                
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
              {/* The coin's own mark, not its ticker set in type — CoinIcon
                  carries the brand assets and falls back to the glyph. */}
              <span style={{ display: "block", marginBottom: 14 }}>
                <CoinIcon ticker={coin.ticker} size={34} />
              </span>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#E8EDF0", marginBottom: 4 }}>{coin.name} casinos</div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, color: "#83919A" }}>{coin.count} operators</div>
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
                    <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, color: "#77858E", width: 14 }}>{it.n}</span>
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
                    style={{ display: "grid", gridTemplateColumns: "56px minmax(90px,1fr) minmax(110px,1.4fr)", alignItems: "center", gap: 12, padding: "12px 14px", background: "#0F1417" }}
                  >
                    <div style={{ width: 30, height: 30 }}>
                      <BrandMark slug={it.slug} mono={it.mono} tint={t.kicker === "Wallets" ? "#9B8FC4" : "#5FE3E8"} fontSize={10} />
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#E8EDF0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</span>
                    <span style={{ fontSize: 12, color: "#7B8A93", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.note}</span>
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
              <h2 style={{ margin: "0 0 14px", fontSize: 30, letterSpacing: "-.03em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>Six criteria. No paid placement in a review.</h2>
              <p style={{ margin: "0 0 22px", fontSize: 15, lineHeight: 1.65, color: "#8DA0AA", textWrap: "pretty" }}>
                Crypto casinos, wallets and exchanges are reviewed against their own published terms, and every fact in a review is cited. Slots and providers are assessed from published paytables and the studios&apos; stated RTPs. Commercial relationships are disclosed on every page and never change what a review says.
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
