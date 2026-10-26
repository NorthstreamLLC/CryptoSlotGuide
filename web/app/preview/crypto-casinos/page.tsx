import Link from "next/link";
import type { Metadata } from "next";
import { siteData, siteCounts } from "@/lib/site-data";
import { casinoFacts } from "@/lib/casino-facts";
import { inHouseOrder } from "@/lib/house-order";
import { filterFns } from "@/lib/casino-index";
import { raceFor } from "@/lib/races";
import { BrandMark } from "@/components/ui/BrandMark";
import { CodeChip } from "@/components/ui/CodeChip";
import { GeoBlockNote } from "@/components/geo/GeoBlockNote";
import { tintFor } from "@/lib/logo";

/**
 * Mock-up of the casinos hub in the four-path pattern: the answer first, a
 * short ranked list, ways to narrow it down, then one next step. Not linked
 * and not indexed.
 */
export const metadata: Metadata = { title: "Crypto casinos hub preview", robots: { index: false, follow: false } };

const MONO = "var(--font-jetbrains-mono), monospace";
const GOLD = "#FFC531";
const CYAN = "#00C2CC";

export default function PreviewCasinos() {
  const { ops } = siteData;
  const c = siteCounts;
  const ranked = inHouseOrder(ops).slice(0, 10);
  const top = ranked[0];
  const tf = top ? casinoFacts(top) : null;

  const needs = [
    { icon: "⚡", label: "Fastest payouts", href: "/fastest-payouts", n: ops.filter(filterFns.fast).length },
    { icon: "🕶️", label: "No KYC", href: "/crypto-casinos/no-kyc", n: ops.filter(filterFns.nokyc).length },
    { icon: "🎯", label: "Low wagering", href: "/lowest-wagering", n: ops.filter(filterFns.lowwager).length },
    { icon: "⚽", label: "Casino + sportsbook", href: "/casino-sportsbooks", n: ops.filter(filterFns.sports).length },
    { icon: "₿", label: "By coin", href: "/coins", n: null },
    { icon: "🌍", label: "By country", href: "/legal", n: null },
  ];

  return (
    <main style={{ background: "#07090B" }}>
      {/* 1. The answer first */}
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(70% 90% at 85% 0%, rgba(255,197,49,.10), transparent 60%), radial-gradient(60% 80% at 0% 0%, rgba(0,194,204,.10), transparent 60%), #090C0F" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 24px 44px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 18 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <span style={{ color: "#A8B6BE" }}>Crypto casinos</span>
          </div>
          <div style={{ display: "grid", gap: 36, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", alignItems: "center" }}>
            <div>
              <h1 style={{ margin: "0 0 14px", fontSize: "clamp(34px, 4.4vw, 52px)", lineHeight: 1.04, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>
                The best crypto casinos, <span style={{ color: GOLD }}>picked for you</span>
              </h1>
              <p style={{ margin: "0 0 22px", maxWidth: "52ch", fontSize: 17, lineHeight: 1.6, color: "#9AAAB3" }}>
                We track {c.casinos} crypto casinos and check every bonus, payout time and licence against the casino&apos;s own pages. Start with our pick, or narrow it down below.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a href="#top-10" style={{ padding: "13px 20px", borderRadius: 12, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.14)", color: "#fff", fontSize: 15, fontWeight: 700 }}>See the top 10 ↓</a>
                <Link href="/find-my-casino" style={{ padding: "13px 20px", borderRadius: 12, color: CYAN, fontSize: 15, fontWeight: 700 }}>Not sure? 3 questions →</Link>
              </div>
            </div>

            {top && tf && (
              <div style={{ padding: 24, borderRadius: 20, background: "radial-gradient(120% 90% at 50% 0%, rgba(255,197,49,.16), transparent 60%), #0F1418", border: "1px solid rgba(255,197,49,.42)", boxShadow: "0 30px 70px rgba(0,0,0,.45)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <span style={{ width: 56, height: 56, borderRadius: 14, overflow: "hidden", flex: "none" }}>
                    <BrandMark slug={top.slug} mono={top.mono} tint={GOLD} radius={14} fontSize={15} />
                  </span>
                  <span>
                    <span style={{ display: "block", fontFamily: MONO, fontSize: 11, color: GOLD }}>OUR #1 PICK</span>
                    <span style={{ display: "block", fontSize: 24, fontWeight: 800, color: "#fff" }}>{top.name}</span>
                    <span style={{ display: "block", fontFamily: MONO, fontSize: 11, color: "#83919A" }}>{[tf.licence && `${tf.licence} licence`, tf.kyc].filter(Boolean).join(" · ")}</span>
                  </span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: GOLD, marginBottom: 12 }}>{tf.headline}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: 14 }} data-keep-grid>
                  {[
                    { k: "Withdrawals", v: tf.withdrawals ?? "See terms" },
                    { k: "Min deposit", v: tf.minDeposit ?? "See terms" },
                    { k: "Race", v: raceFor(top.slug)?.label.replace(/ weekly raffle/, " raffle") ?? "—" },
                  ].map((x) => (
                    <span key={x.k} style={{ padding: "9px 10px", borderRadius: 10, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}>
                      <span style={{ display: "block", fontFamily: MONO, fontSize: 9.5, color: "#7F8D96", textTransform: "uppercase" }}>{x.k}</span>
                      <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: "#E8EDF0" }}>{x.v}</span>
                    </span>
                  ))}
                </div>
                {top.promoCode && (
                  <div style={{ marginBottom: 12 }}>
                    <CodeChip code={top.promoCode} tint={GOLD} />
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }} data-keep-grid>
                  {top.signupUrl && (
                    <a href={top.signupUrl} target="_blank" rel="nofollow sponsored noopener" data-copy-code={top.promoCode ?? undefined} style={{ textAlign: "center", padding: "14px 16px", borderRadius: 12, background: "linear-gradient(180deg,#FFD866,#FFC531)", color: "#141007", fontSize: 15.5, fontWeight: 800 }}>
                      Play at {top.name} ↗
                    </a>
                  )}
                  <Link href={`/casinos/${top.slug}`} style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,.16)", color: "#fff", fontSize: 15, fontWeight: 700 }}>Review</Link>
                </div>
                <GeoBlockNote slug={top.slug} name={top.name} compact />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Short ranked list */}
      <section id="top-10" style={{ maxWidth: 1180, margin: "0 auto", padding: "52px 24px 0", scrollMarginTop: 100 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 30, letterSpacing: "-.025em", fontWeight: 800, color: "#fff" }}>Our top 10</h2>
          <span style={{ fontSize: 13, color: "#7F8D96" }}>Placement order includes our commercial deals. <Link href="/how-we-rate" style={{ color: "#A8B6BE", textDecoration: "underline" }}>How we rate</Link></span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ranked.map((o, i) => {
            const f = casinoFacts(o);
            return (
              <div key={o.slug} style={{ padding: "14px 18px", borderRadius: 16, background: i === 0 ? "rgba(255,197,49,.05)" : "#0C1013", border: `1px solid ${i === 0 ? "rgba(255,197,49,.3)" : "rgba(255,255,255,.08)"}` }}>
                <div className="csg-hubrow" style={{ display: "grid", gridTemplateColumns: "28px 48px minmax(0,1.3fr) minmax(0,1.6fr) minmax(0,.9fr) auto", gap: 14, alignItems: "center" }} data-keep-grid>
                  <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: i === 0 ? GOLD : "#7F8D96" }}>{i + 1}</span>
                  <span style={{ width: 48, height: 48, borderRadius: 12, overflow: "hidden" }}>
                    <BrandMark slug={o.slug} mono={o.mono} tint={tintFor(o.slug)} radius={12} fontSize={13} />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 16.5, fontWeight: 800, color: "#fff" }}>{o.name}</span>
                    <span style={{ display: "block", fontFamily: MONO, fontSize: 10.5, color: "#7F8D96" }}>{[f.licence, f.kyc].filter(Boolean).join(" · ")}</span>
                  </span>
                  <span className="csg-hubrow-offer" style={{ fontSize: 14, fontWeight: 700, color: "#E8EDF0", lineHeight: 1.35 }}>{f.headline}</span>
                  <span className="csg-hubrow-wd" style={{ fontSize: 13, color: "#A8B6BE" }}>
                    <span style={{ display: "block", fontFamily: MONO, fontSize: 9.5, color: "#7F8D96", textTransform: "uppercase" }}>Withdrawals</span>
                    {f.withdrawals ?? "See terms"}
                  </span>
                  <span style={{ display: "flex", gap: 8 }}>
                    {o.signupUrl && o.affiliate ? (
                      <a href={o.signupUrl} target="_blank" rel="nofollow sponsored noopener" style={{ padding: "10px 16px", borderRadius: 10, background: "linear-gradient(180deg,#FFD866,#FFC531)", color: "#141007", fontSize: 14, fontWeight: 800, whiteSpace: "nowrap" }}>Play ↗</a>
                    ) : null}
                    <Link href={`/casinos/${o.slug}`} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.14)", color: "#E8EDF0", fontSize: 14, fontWeight: 700 }}>Review</Link>
                  </span>
                </div>
                <GeoBlockNote slug={o.slug} name={o.name} compact />
              </div>
            );
          })}
        </div>
        <p style={{ margin: "10px 0 0", fontFamily: MONO, fontSize: 10.5, color: "#7F8D96" }}>Play links are affiliate links: we may earn a commission, which never changes what a review says. 18+ · T&amp;Cs apply.</p>
      </section>

      {/* 3. Narrow it down */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "52px 24px 0" }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 26, letterSpacing: "-.02em", fontWeight: 800, color: "#fff" }}>What matters most to you?</h2>
        <p style={{ margin: "0 0 16px", fontSize: 15, color: "#8DA0AA" }}>Each list is built from the casinos&apos; own terms.</p>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
          {needs.map((n) => (
            <Link key={n.label} href={n.href} className="csg-lift" style={{ display: "flex", flexDirection: "column", gap: 6, padding: "16px 16px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.09)" }}>
              <span style={{ fontSize: 24 }} aria-hidden>{n.icon}</span>
              <span style={{ fontSize: 15.5, fontWeight: 800, color: "#fff" }}>{n.label}</span>
              <span style={{ fontSize: 12.5, color: CYAN }}>{n.n !== null ? `${n.n} casinos →` : "Browse →"}</span>
            </Link>
          ))}
        </div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 16, fontSize: 14.5 }}>
          <Link href="/crypto-casinos#all-casinos" style={{ fontWeight: 700, color: CYAN }}>See all {c.casinos} with filters →</Link>
          <Link href="/compare" style={{ fontWeight: 700, color: "#A8B6BE" }}>Compare two side by side →</Link>
        </div>
      </section>

      {/* 4. One next step */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 24px 80px" }}>
        <Link href="/bonuses" className="csg-lift" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "24px 28px", borderRadius: 18, background: "radial-gradient(80% 140% at 0% 50%, rgba(255,197,49,.14), transparent 60%), #0F1418", border: "1px solid rgba(255,197,49,.3)" }}>
          <span>
            <span style={{ display: "block", fontFamily: MONO, fontSize: 11, color: GOLD, marginBottom: 6 }}>NEXT STEP</span>
            <span style={{ display: "block", fontSize: 22, fontWeight: 800, color: "#fff" }}>Picked a casino? Get its best code first.</span>
            <span style={{ display: "block", fontSize: 14.5, color: "#A8B6BE", marginTop: 4 }}>Welcome offers and promo codes, with the wagering spelled out.</span>
          </span>
          <span style={{ padding: "13px 20px", borderRadius: 12, background: "linear-gradient(180deg,#FFD866,#FFC531)", color: "#141007", fontSize: 15, fontWeight: 800 }}>See the best bonuses →</span>
        </Link>
      </section>

      <style>{`@media (max-width: 760px){
        .csg-hubrow{grid-template-columns:24px 44px minmax(0,1fr) auto !important;row-gap:8px !important}
        .csg-hubrow-offer{grid-column:3 / -1;font-size:13.5px !important}
        .csg-hubrow-wd{display:none !important}
      }`}</style>
    </main>
  );
}
