import Link from "next/link";
import { ogCardPath } from "@/lib/og";
import { siteData, siteCounts } from "@/lib/site-data";
import { casinoFacts } from "@/lib/casino-facts";
import { inHouseOrder } from "@/lib/house-order";
import { topSlotRows } from "@/lib/slot-page";
import { raceFor, raceSlugs } from "@/lib/races";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { itemListSchema } from "@/lib/schema";
import { OfferCards } from "@/components/home/OfferCards";
import { SlotArtCards } from "@/components/home/SlotArtCards";
import { CodeChip } from "@/components/ui/CodeChip";
import { GeoBlockNote } from "@/components/geo/GeoBlockNote";
import { KevinCard } from "@/components/promo/KevinCard";
import { kevinLive } from "@/lib/kevin-promo";
import { BrandMark } from "@/components/ui/BrandMark";
import { getSpecFact } from "@/lib/spec-sheet";

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
    images: [{ url: ogCardPath("Crypto casinos, slots and sportsbooks — every figure sourced", "/"), width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" as const },
};

const MONO = "var(--font-jetbrains-mono), monospace";
const GOLD = "#FFC531";

/**
 * Homepage motion. Everything here is decoration on top of a page that reads
 * the same without it, and the sitewide prefers-reduced-motion rule in
 * globals.css stops all of it for anyone who has asked for less motion.
 */
const MOTION = `
.csg-path { animation: csg-rise .6s cubic-bezier(.2,.7,.2,1) both; position: relative; overflow: hidden; }
.csg-path::after { content: ""; position: absolute; inset: 0; background: linear-gradient(115deg, transparent 35%, rgba(255,255,255,.07) 50%, transparent 65%); transform: translateX(-120%); transition: transform .7s ease; pointer-events: none; }
.csg-path:hover::after { transform: translateX(120%); }
.csg-path-icon { display: inline-block; transition: transform .35s cubic-bezier(.3,1.6,.5,1); }
.csg-path:hover .csg-path-icon { transform: translateY(-5px) rotate(-8deg) scale(1.08); }
.csg-path:hover { border-color: var(--tint) !important; box-shadow: 0 22px 50px rgba(0,0,0,.45), 0 0 0 1px var(--tint), 0 0 34px -8px var(--tint) !important; }
.csg-home-card .csg-zoom { transition: transform .6s ease; }
.csg-home-card:hover .csg-zoom { transform: scale(1.04); }
.csg-shine { position: relative; overflow: hidden; }
.csg-shine::after { content: ""; position: absolute; top: 0; bottom: 0; width: 40%; left: -60%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.55), transparent); animation: csg-shine 3.8s ease-in-out infinite; }
@keyframes csg-shine { 0%, 55% { left: -60%; } 100% { left: 130%; } }
@media (max-width: 640px) {
  .csg-paths { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
  .csg-path { padding: 16px 14px !important; }
  .csg-path-line { display: none !important; }
  .csg-path-title { font-size: 17px !important; }
}
`;

export default function HomePage() {
  const { ops } = siteData;
  const c = siteCounts;
  const offers = inHouseOrder(ops.filter((o) => !!casinoFacts(o).offer && !/^advertised/i.test(casinoFacts(o).headline))).slice(0, 4);
  const roobet = ops.find((o) => o.slug === "roobet");
  // Our pick's race first, then the biggest by prize money.
  const races = ["roobet", ...raceSlugs().filter((s) => s !== "roobet")]
    .map((s) => ({ s, r: raceFor(s), o: ops.find((o) => o.slug === s) }))
    .filter((x) => x.r && x.o)
    .slice(0, 4);

  // Roobet's Roo Jackpots, while the fact is on its sheet: the card that stands in for a live promo.
  const rooJackpots = !!getSpecFact("roobet", "Bonus terms", "Roo Jackpots");
  const jackpotCard = rooJackpots ? (
    <Link href="/guides/roo-jackpots-explained" className="csg-lift" style={{ display: "flex", flexDirection: "column", gap: 12, padding: 24, borderRadius: 18, background: "radial-gradient(120% 90% at 100% 0%, rgba(178,132,255,.18), transparent 60%), radial-gradient(90% 70% at 0% 100%, rgba(255,197,49,.10), transparent 60%), #0F1418", border: "1px solid rgba(178,132,255,.35)" }}>
      <span style={{ fontFamily: MONO, fontSize: 11, color: "#C9A8FF" }}>NEW AT ROOBET · ROO JACKPOTS</span>
      <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>Four jackpots that grow from $250,000 at the top</span>
      <span style={{ fontSize: 14.5, lineHeight: 1.5, color: "#A8B6BE" }}>Add $0.10, $1 or $5 to a bet for a shot at four jackpots, with no wagering on wins. Here is how it works and what it costs.</span>
      <span style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }} data-keep-grid>
        {[
          { n: "Mini", v: "$200", c: "#57E39A" },
          { n: "Minor", v: "$5K", c: "#00C2CC" },
          { n: "Major", v: "$75K", c: "#FF7EB6" },
          { n: "Mega", v: "$250K", c: GOLD },
        ].map((j) => (
          <span key={j.n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "10px 4px", borderRadius: 12, background: "rgba(255,255,255,.04)", border: `1px solid ${j.c}55` }}>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", color: j.c }}>{j.n}</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{j.v}</span>
            <span style={{ fontSize: 10.5, color: "#7F8D96" }}>starts at</span>
          </span>
        ))}
      </span>
      <span style={{ fontSize: 14.5, fontWeight: 700, color: "#C9A8FF" }}>How Roo Jackpots work →</span>
    </Link>
  ) : null;

  const paths = [
    { icon: "🎰", title: "Find a casino", line: `The best of ${c.casinos} crypto casinos, by payout speed, bonus and coins.`, href: "/crypto-casinos", cta: "Compare casinos", tint: "#00C2CC" },
    { icon: "🎁", title: "Get a bonus", line: "Promo codes and welcome offers, with the wagering spelled out.", href: "/bonuses", cta: "See the best offers", tint: GOLD },
    { icon: "🎮", title: "Find a slot", line: "Top slots with the studio's published RTP, and where to play them.", href: "/slots", cta: "Browse top slots", tint: "#FF7EB6" },
    { icon: "🌍", title: "Can I play here?", line: "What's legal in your country, and which casinos accept you.", href: "/legal", cta: "Check your country", tint: "#57E39A" },
  ];

  return (
    <>
      {/* Organization and WebSite are sitewide in layout.tsx; the home page
          adds the casino list it leads with, in the same order. */}
      <JsonLd data={[itemListSchema("Crypto casinos we recommend", offers.map((o) => ({ name: o.name, path: `/casinos/${o.slug}` })))]} />
      <style>{MOTION}</style>
      <main style={{ background: "#07090B" }}>
        {/* 1. One question, four paths */}
        <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,.07)", background: "#090C0F" }}>
          <div style={{ position: "absolute", inset: "-25% -12% -10% -12%", pointerEvents: "none" }} aria-hidden>
            <span style={{ position: "absolute", top: "2%", left: "4%", width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,194,204,.30),transparent 66%)", animation: "csg-drift 18s ease-in-out infinite" }} />
            <span style={{ position: "absolute", top: "35%", left: "42%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(178,132,255,.22),transparent 66%)", animation: "csg-drift 23s ease-in-out infinite reverse" }} />
            <span style={{ position: "absolute", top: 0, right: 0, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,179,71,.18),transparent 66%)", animation: "csg-drift2 26s ease-in-out infinite" }} />
            <span style={{ position: "absolute", bottom: "-10%", right: "28%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,126,182,.16),transparent 66%)", animation: "csg-drift 30s ease-in-out infinite" }} />
          </div>
          <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto", padding: "64px 24px 56px", textAlign: "center" }}>
            <h1 style={{ margin: "0 0 14px", fontSize: "clamp(36px, 5vw, 60px)", lineHeight: 1.04, letterSpacing: "-.035em", fontWeight: 800, color: "#fff", textWrap: "balance" }}>
              Crypto casinos{" "}
              <span style={{ backgroundImage: "linear-gradient(96deg,#00C2CC,#7BE0B8,#FFB347,#FF7EB6,#B284FF,#00C2CC)", backgroundSize: "280% 100%", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent", animation: "csg-sweep 11s linear infinite" }}>
                worth your deposit.
              </span>
            </h1>
            <p style={{ margin: "0 auto 40px", maxWidth: "56ch", fontSize: 17.5, lineHeight: 1.6, color: "#9AAAB3" }}>
              Every bonus, payout time and RTP is checked against the casino&apos;s or studio&apos;s own page. What are you looking for?
            </p>
            <div className="csg-paths" data-keep-grid style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(4, minmax(0, 1fr))", textAlign: "left" }}>
              {paths.map((p, i) => (
                <Link key={p.title} href={p.href} className="csg-lift csg-path" style={{ ["--tint" as string]: p.tint, animationDelay: `${120 + i * 90}ms`, display: "flex", flexDirection: "column", gap: 10, padding: "24px 22px", borderRadius: 18, background: "rgba(15,20,24,.85)", backdropFilter: "blur(6px)", border: `1px solid ${p.tint}55`, boxShadow: "0 18px 40px rgba(0,0,0,.35)", transition: "border-color .25s, box-shadow .25s, transform .25s" }}>
                  <span className="csg-path-icon" style={{ fontSize: 34, lineHeight: 1 }} aria-hidden>{p.icon}</span>
                  <span className="csg-path-title" style={{ fontSize: 21, fontWeight: 800, color: "#fff", letterSpacing: "-.01em" }}>{p.title}</span>
                  <span className="csg-path-line" style={{ fontSize: 14.5, lineHeight: 1.5, color: "#A8B6BE", flex: 1 }}>{p.line}</span>
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: p.tint }}>{p.cta} →</span>
                </Link>
              ))}
            </div>
            <div className="csg-more-paths" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 20 }}>
              {[
                { icon: "⚽", label: "Sportsbooks", href: "/sportsbooks" },
                { icon: "📈", label: "Prediction markets", href: "/prediction-markets" },
                { icon: "👛", label: "Wallets", href: "/wallets" },
                { icon: "🏁", label: "Races & raffles", href: "/races" },
                { icon: "📘", label: "Guides", href: "/guides" },
              ].map((x) => (
                <Link key={x.label} href={x.href} className="csg-lift" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 100, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.14)", color: "#E8EDF0", fontSize: 14.5, fontWeight: 700 }}>
                  <span aria-hidden>{x.icon}</span>
                  {x.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 2. This week */}
        <section data-reveal style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 24px 0" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".09em", textTransform: "uppercase", color: GOLD, marginBottom: 10 }}>This week</div>
          <h2 style={{ margin: "0 0 20px", fontSize: 30, letterSpacing: "-.025em", fontWeight: 800, color: "#fff" }}>The offers worth your time</h2>
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
            {roobet?.promoCode && (
              <div className="csg-lift" style={{ display: "flex", flexDirection: "column", gap: 12, padding: 24, borderRadius: 18, background: "radial-gradient(120% 90% at 50% 0%, rgba(255,197,49,.14), transparent 60%), #0F1418", border: "1px solid rgba(255,197,49,.4)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 44, height: 44, borderRadius: 12, overflow: "hidden", flex: "none" }}>
                    <BrandMark slug="roobet" mono={roobet.mono} tint={GOLD} radius={12} fontSize={13} />
                  </span>
                  <span>
                    <span style={{ display: "block", fontFamily: MONO, fontSize: 11, color: GOLD }}>OUR PICK · ROOBET</span>
                    <span style={{ display: "block", fontSize: 13, color: "#A8B6BE" }}>Welcome package with code {roobet.promoCode}</span>
                  </span>
                </span>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>20% up to $500 + up to 600 free spins</span>
                <span style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }} data-keep-grid>
                  {[
                    { t: "20%", d: "deposit match up to $500" },
                    { t: "100 spins", d: "at $10,000 wagered" },
                    { t: "500 spins", d: "at $50,000 wagered" },
                  ].map((x) => (
                    <span key={x.t} style={{ display: "flex", flexDirection: "column", gap: 2, padding: "10px 10px", borderRadius: 12, background: "rgba(255,197,49,.06)", border: "1px solid rgba(255,197,49,.22)" }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: GOLD }}>{x.t}</span>
                      <span style={{ fontSize: 11.5, lineHeight: 1.35, color: "#A8B6BE" }}>{x.d}</span>
                    </span>
                  ))}
                </span>
                <span style={{ fontSize: 14.5, lineHeight: 1.5, color: "#A8B6BE" }}>Sign up with the code, then claim the package through CasinoPerks, the exclusive casino VIP team, on Telegram.</span>
                <CodeChip code={roobet.promoCode} tint={GOLD} />
                <Link href="/promo-codes/roobet" className="csg-shine" style={{ marginTop: 4, textAlign: "center", padding: "13px 16px", borderRadius: 12, background: "linear-gradient(180deg,#FFD866,#FFC531)", color: "#141007", fontSize: 15, fontWeight: 800 }}>
                  Get the Roobet offer →
                </Link>
                <GeoBlockNote slug="roobet" name={roobet.name} compact />
              </div>
            )}
            {kevinLive() ? <KevinCard fallback={jackpotCard} /> : jackpotCard}
          </div>

          {/* Races line */}
          {races.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 14px", marginTop: 16, padding: "14px 18px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)", fontSize: 14 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 800, color: "#fff" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#57E39A", animation: "csg-pulse 2.4s ease-in-out infinite" }} aria-hidden />
                🏁 Races &amp; raffles
              </span>
              {races.map(({ s, r, o }) => (
                <Link key={s} href={`/casinos/${s}`} style={{ color: "#A8B6BE" }}>
                  <strong style={{ color: "#E8EDF0" }}>{o!.name}</strong> {r!.label}
                </Link>
              ))}
              <Link href="/races" style={{ marginLeft: "auto", fontWeight: 700, color: "#57E39A" }}>All races →</Link>
            </div>
          )}
        </section>

        {/* 3. Top casinos */}
        <section data-reveal id="top-offers" style={{ maxWidth: 1180, margin: "0 auto", padding: "60px 24px 0", scrollMarginTop: 120 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 10 }}>Casinos</div>
              <h2 style={{ margin: 0, fontSize: 30, letterSpacing: "-.025em", fontWeight: 800, color: "#fff" }}>Our top 4 crypto casinos</h2>
            </div>
            <Link href="/crypto-casinos" style={{ fontSize: 15, fontWeight: 700, color: "#00C2CC" }}>Compare all {c.casinos} →</Link>
          </div>
          <OfferCards ops={offers} />
        </section>

        {/* 4. Top slots */}
        <section data-reveal style={{ maxWidth: 1180, margin: "0 auto", padding: "60px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".09em", textTransform: "uppercase", color: "#FF7EB6", marginBottom: 10 }}>Slots</div>
              <h2 style={{ margin: 0, fontSize: 30, letterSpacing: "-.025em", fontWeight: 800, color: "#fff" }}>Top slots right now</h2>
            </div>
            <Link href="/slots" style={{ fontSize: 15, fontWeight: 700, color: "#FF7EB6" }}>All top slots →</Link>
          </div>
          <SlotArtCards rows={topSlotRows().slice(0, 4)} />
        </section>

        {/* 5. Why trust us */}
        <section data-reveal style={{ maxWidth: 1180, margin: "0 auto", padding: "64px 24px 80px" }}>
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", padding: "26px 28px", borderRadius: 18, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
            {[
              { t: "Sourced, not copied", d: "Every fact links to the casino's, studio's or regulator's own page." },
              { t: "Re-checked on a schedule", d: "Bonuses and payout terms are re-read, and changes are logged." },
              { t: "Paid links, clearly marked", d: "We earn from some links. It never changes what a review says." },
            ].map((x) => (
              <div key={x.t}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 6 }}>✓ {x.t}</div>
                <div style={{ fontSize: 14, lineHeight: 1.5, color: "#A8B6BE" }}>{x.d}</div>
              </div>
            ))}
            <Link href="/how-we-rate" style={{ alignSelf: "center", fontSize: 14.5, fontWeight: 700, color: "#00C2CC" }}>How we rate →</Link>
          </div>
        </section>
      </main>
    </>
  );
}
