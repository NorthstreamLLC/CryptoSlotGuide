import Link from "next/link";
import type { Metadata } from "next";
import { siteData, siteCounts } from "@/lib/site-data";
import { casinoFacts } from "@/lib/casino-facts";
import { inHouseOrder } from "@/lib/house-order";
import { topSlotRows } from "@/lib/slot-page";
import { OfferCards } from "@/components/home/OfferCards";
import { SlotArtCards } from "@/components/home/SlotArtCards";
import { CodeChip } from "@/components/ui/CodeChip";
import { kevinLive, KEVIN_PATH } from "@/lib/kevin-promo";

/**
 * Mock-up of a simpler homepage: one question, four paths, then only what
 * helps a first visit decide. Not linked anywhere and not indexed; it exists
 * to be looked at before the real homepage changes.
 */
export const metadata: Metadata = { title: "Homepage preview", robots: { index: false, follow: false } };

const MONO = "var(--font-jetbrains-mono), monospace";
const GOLD = "#FFC531";

export default function PreviewHome() {
  const { ops } = siteData;
  const c = siteCounts;
  const offers = inHouseOrder(ops.filter((o) => !!casinoFacts(o).offer && !/^advertised/i.test(casinoFacts(o).headline))).slice(0, 4);
  const roobet = ops.find((o) => o.slug === "roobet");

  const paths = [
    { icon: "🎰", title: "Find a casino", line: `The best of ${c.casinos} crypto casinos, by payout speed, bonus and coins.`, href: "/crypto-casinos", cta: "Compare casinos", tint: "#00C2CC" },
    { icon: "🎁", title: "Get a bonus", line: "Promo codes and welcome offers, with the wagering spelled out.", href: "/bonuses", cta: "See the best offers", tint: GOLD },
    { icon: "🎮", title: "Find a slot", line: "Top slots with the studio's published RTP, and where to play them.", href: "/slots", cta: "Browse top slots", tint: "#FF7EB6" },
    { icon: "🌍", title: "Can I play here?", line: "What's legal in your country, and which casinos accept you.", href: "/legal", cta: "Check your country", tint: "#57E39A" },
  ];

  return (
    <main style={{ background: "#07090B" }}>
      {/* 1. One question, four paths */}
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(60% 80% at 15% 0%, rgba(0,194,204,.12), transparent 60%), radial-gradient(50% 70% at 90% 10%, rgba(255,197,49,.10), transparent 60%), #090C0F" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "64px 24px 56px", textAlign: "center" }}>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(36px, 5vw, 58px)", lineHeight: 1.04, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>
            Crypto casinos worth your deposit.
          </h1>
          <p style={{ margin: "0 auto 40px", maxWidth: "56ch", fontSize: 17.5, lineHeight: 1.6, color: "#9AAAB3" }}>
            Every bonus, payout time and RTP is checked against the casino&apos;s or studio&apos;s own page. What are you looking for?
          </p>
          <style>{`@media (max-width: 640px){.csg-paths{grid-template-columns:1fr 1fr !important;gap:10px !important}.csg-path{padding:16px 14px !important}.csg-path-line{display:none !important}.csg-path-title{font-size:17px !important}}`}</style>
          <div className="csg-paths" data-keep-grid style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(4, minmax(0, 1fr))", textAlign: "left" }}>
            {paths.map((p) => (
              <Link key={p.title} href={p.href} className="csg-lift csg-path" style={{ display: "flex", flexDirection: "column", gap: 10, padding: "24px 22px", borderRadius: 18, background: "#0F1418", border: `1px solid ${p.tint}55`, boxShadow: "0 18px 40px rgba(0,0,0,.35)" }}>
                <span style={{ fontSize: 34, lineHeight: 1 }} aria-hidden>{p.icon}</span>
                <span className="csg-path-title" style={{ fontSize: 21, fontWeight: 800, color: "#fff", letterSpacing: "-.01em" }}>{p.title}</span>
                <span className="csg-path-line" style={{ fontSize: 14.5, lineHeight: 1.5, color: "#A8B6BE", flex: 1 }}>{p.line}</span>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: p.tint }}>{p.cta} →</span>
              </Link>
            ))}
          </div>
          <p style={{ margin: "22px 0 0", fontSize: 13.5, color: "#7F8D96" }}>
            Also: <Link href="/sportsbooks" style={{ color: "#A8B6BE" }}>Sportsbooks</Link> · <Link href="/prediction-markets" style={{ color: "#A8B6BE" }}>Prediction markets</Link> · <Link href="/wallets" style={{ color: "#A8B6BE" }}>Wallets</Link> · <Link href="/guides" style={{ color: "#A8B6BE" }}>Guides</Link>
          </p>
        </div>
      </section>

      {/* 2. This week */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 24px 0" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".09em", textTransform: "uppercase", color: GOLD, marginBottom: 10 }}>This week</div>
        <h2 style={{ margin: "0 0 20px", fontSize: 30, letterSpacing: "-.025em", fontWeight: 800, color: "#fff" }}>The two offers worth your time</h2>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          {roobet?.promoCode && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 24, borderRadius: 18, background: "radial-gradient(120% 90% at 50% 0%, rgba(255,197,49,.14), transparent 60%), #0F1418", border: "1px solid rgba(255,197,49,.4)" }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: GOLD }}>OUR PICK · ROOBET</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>20% up to $500 + up to 600 free spins</span>
              <span style={{ fontSize: 14.5, lineHeight: 1.5, color: "#A8B6BE" }}>Sign up with the code, then claim the package through CasinoPerks on Telegram.</span>
              <CodeChip code={roobet.promoCode} tint={GOLD} />
              <Link href="/promo-codes/roobet" style={{ marginTop: 4, textAlign: "center", padding: "13px 16px", borderRadius: 12, background: "linear-gradient(180deg,#FFD866,#FFC531)", color: "#141007", fontSize: 15, fontWeight: 800 }}>
                Get the Roobet offer →
              </Link>
            </div>
          )}
          {kevinLive() && (
            <Link href={KEVIN_PATH} style={{ display: "flex", flexDirection: "column", borderRadius: 18, overflow: "hidden", background: "#0F1418", border: "1px solid rgba(255,255,255,.1)" }}>
              <picture>
                <source media="(max-width: 700px)" srcSet="/assets/promos/play-with-kevin-mobile.webp" />
                <img src="/assets/promos/play-with-kevin-1920x600.webp" alt="Pragmatic Play x Kevin Hart: $1,250,000 prize pool" width={1920} height={600} style={{ display: "block", width: "100%", height: "auto" }} />
              </picture>
              <span style={{ display: "flex", flexDirection: "column", gap: 8, padding: "18px 22px 22px" }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: GOLD }}>LIVE PROMO · UNTIL 7 NOV</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Play with Kevin Hart: $1.25M prize pool</span>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: GOLD }}>How it works →</span>
              </span>
            </Link>
          )}
        </div>
      </section>

      {/* 3. Top casinos */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "60px 24px 0" }}>
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
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "60px 24px 0" }}>
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
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "64px 24px 80px" }}>
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
  );
}
