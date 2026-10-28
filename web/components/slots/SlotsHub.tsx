import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { topSlotRows, slotArtBySlug } from "@/lib/slot-page";
import { catalogueTotals } from "@/lib/slot-db";
import { topSlotRank } from "@/lib/top-slots";
import { SlotArtCards } from "@/components/home/SlotArtCards";
import { FoldedList } from "@/components/casino-index/FoldedList";
import { BrandMark } from "@/components/ui/BrandMark";
import { GeoBlockNote } from "@/components/geo/GeoBlockNote";

/**
 * The slots hub in the four-path pattern: our #1 slot first, the top picks as
 * art, every reviewed slot folded (whole in the HTML), ways to narrow it
 * down, then one next step.
 */

const MONO = "var(--font-jetbrains-mono), monospace";
const PINK = "#FF7EB6";
const GOLD = "#FFC531";
const VOL: Record<string, string> = { low: "Low", medium: "Medium", high: "High", "very-high": "Very high", extreme: "Extreme" };

export function SlotsHub() {
  const rows = topSlotRows();
  const top = rows[0];
  const art = top ? slotArtBySlug(top.slug) : null;
  const roobet = siteData.ops.find((o) => o.slug === "roobet");
  const totals = catalogueTotals();
  const reviewed = [...siteData.slots].sort((a, b) => topSlotRank(a.slug) - topSlotRank(b.slug) || a.name.localeCompare(b.name));

  const ways = [
    { icon: "💥", label: "Bonus buy", href: "/slots/bonus-buy" },
    { icon: "🔀", label: "Megaways", href: "/slots/megaways" },
    { icon: "🌋", label: "High volatility", href: "/slots/high-volatility" },
    { icon: "💰", label: "Jackpot slots", href: "/slots/jackpot" },
    { icon: "🧩", label: "Cluster pays", href: "/slots/cluster-pays" },
    { icon: "🔒", label: "Hold & Win", href: "/slots/hold-and-win" },
    { icon: "🏢", label: "By studio", href: "/providers" },
    { icon: "🔎", label: `All ${totals.slots.toLocaleString()} slots`, href: "/slots/database" },
  ];

  return (
    <main style={{ background: "#07090B", color: "#E8EDF0" }}>
      {/* 1. Our #1 slot first */}
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(70% 90% at 85% 0%, rgba(255,126,182,.12), transparent 60%), radial-gradient(60% 80% at 0% 100%, rgba(178,132,255,.10), transparent 60%), #090C0F" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 24px 44px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 18 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <span style={{ color: "#A8B6BE" }}>Slots</span>
          </div>
          <div style={{ display: "grid", gap: 36, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", alignItems: "center" }}>
            <div>
              <h1 style={{ margin: "0 0 14px", fontSize: "clamp(34px, 4.4vw, 52px)", lineHeight: 1.04, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>
                The best slots to play, <span style={{ color: PINK }}>with the real RTP</span>
              </h1>
              <p style={{ margin: "0 0 22px", maxWidth: "52ch", fontSize: 17, lineHeight: 1.6, color: "#9AAAB3" }}>
                Our {rows.length} top slots, each with a full review and the return the studio publishes. Casinos can run a lower build of the same game, so we show you how to check before you spin.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a href="#top-slots" style={{ padding: "13px 20px", borderRadius: 12, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.14)", color: "#fff", fontSize: 15, fontWeight: 700 }}>See our top slots ↓</a>
                <Link href="/guides/how-casino-rtp-versions-work" style={{ padding: "13px 20px", borderRadius: 12, color: PINK, fontSize: 15, fontWeight: 700 }}>What is RTP? →</Link>
              </div>
            </div>

            {top && (
              <div style={{ borderRadius: 20, overflow: "hidden", background: "#0F1418", border: `1px solid ${PINK}66`, boxShadow: "0 30px 70px rgba(0,0,0,.45)" }}>
                {art && (
                  <Link href={`/slots/${top.slug}`} style={{ display: "block", aspectRatio: "16 / 8", background: "#11161A", overflow: "hidden" }}>
                    <img src={art} alt={top.name} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
                  </Link>
                )}
                <div style={{ padding: 22 }}>
                  <span style={{ display: "block", fontFamily: MONO, fontSize: 11, color: PINK }}>OUR #1 SLOT</span>
                  <span style={{ display: "block", fontSize: 24, fontWeight: 800, color: "#fff" }}>{top.name}</span>
                  <span style={{ display: "block", fontSize: 13.5, color: "#A8B6BE", marginBottom: 14 }}>{top.provider}</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: 14 }} data-keep-grid>
                    {[
                      { k: "RTP", v: top.rtp },
                      { k: "Max win", v: top.maxWin },
                      { k: "Volatility", v: top.volatility },
                    ].map((x) => (
                      <span key={x.k} style={{ padding: "9px 10px", borderRadius: 10, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}>
                        <span style={{ display: "block", fontFamily: MONO, fontSize: 9.5, color: "#7F8D96", textTransform: "uppercase" }}>{x.k}</span>
                        <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#E8EDF0" }}>{x.v}</span>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} data-keep-grid>
                    <Link href={`/slots/${top.slug}`} style={{ textAlign: "center", padding: "13px 14px", borderRadius: 12, background: PINK, color: "#2A0716", fontSize: 15, fontWeight: 800 }}>Read the review</Link>
                    {roobet?.signupUrl && (
                      <a href={roobet.signupUrl} target="_blank" rel="nofollow sponsored noopener" style={{ textAlign: "center", padding: "13px 14px", borderRadius: 12, background: "linear-gradient(180deg,#FFD866,#FFC531)", color: "#141007", fontSize: 15, fontWeight: 800 }}>Play slots at Roobet ↗</a>
                    )}
                  </div>
                  {roobet && <GeoBlockNote slug="roobet" name={roobet.name} compact />}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Top picks */}
      <section id="top-slots" style={{ maxWidth: 1180, margin: "0 auto", padding: "52px 24px 0", scrollMarginTop: 100 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 30, letterSpacing: "-.025em", fontWeight: 800, color: "#fff" }}>Our top {Math.min(8, rows.length)} slots right now</h2>
          <span style={{ fontSize: 13, color: "#7F8D96" }}>RTPs are the studio&apos;s published figures.</span>
        </div>
        <SlotArtCards rows={rows.slice(0, 8)} />
        <div style={{ marginTop: 18 }}>
          <FoldedList hashes={["all-slots"]} summary={<>Show every slot we&apos;ve reviewed ({reviewed.length}), with RTP and max win <span aria-hidden>↓</span></>}>
            <div style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,.08)", overflow: "hidden" }}>
              {reviewed.map((s, i) => {
                const img = slotArtBySlug(s.slug);
                const un = (k: "rtp" | "vol" | "maxWin") => !!s.unpublished?.includes(k);
                return (
                  <Link key={s.slug} href={`/slots/${s.slug}`} className="csg-slotrow" style={{ display: "grid", gridTemplateColumns: "56px minmax(0,1.6fr) minmax(0,.7fr) minmax(0,.8fr) minmax(0,.8fr) auto", gap: 14, alignItems: "center", padding: "10px 14px", background: i % 2 ? "#0A0E11" : "#0C1013", borderTop: i ? "1px solid rgba(255,255,255,.05)" : 0 }} data-keep-grid>
                    <span style={{ width: 56, height: 36, borderRadius: 8, overflow: "hidden", background: "#11161A" }}>
                      {img ? <img src={img} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <BrandMark slug={s.slug} mono={s.mono} tint={s.tint} radius={8} fontSize={10} />}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: "#fff" }}>{s.name}</span>
                      <span style={{ display: "block", fontSize: 12, color: "#7F8D96" }}>{s.provider}</span>
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 12.5, color: "#57E39A" }}>{un("rtp") ? "Not published" : `${s.rtp.toFixed(2)}%`}</span>
                    <span className="csg-slotrow-x" style={{ fontSize: 13, color: "#A8B6BE" }}>{un("maxWin") ? "Not published" : s.maxWin}</span>
                    <span className="csg-slotrow-x" style={{ fontSize: 13, color: "#A8B6BE" }}>{un("vol") ? "Not published" : VOL[s.vol] ?? s.vol}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: PINK }}>Review →</span>
                  </Link>
                );
              })}
            </div>
          </FoldedList>
        </div>
      </section>

      {/* 3. How do you like to play */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "52px 24px 0" }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 26, letterSpacing: "-.02em", fontWeight: 800, color: "#fff" }}>How do you like to play?</h2>
        <p style={{ margin: "0 0 16px", fontSize: 15, color: "#8DA0AA" }}>Every list is built from the studios&apos; own game pages.</p>
        <div className="csg-ways" data-keep-grid style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
          {ways.map((w) => (
            <Link key={w.label} href={w.href} className="csg-lift" style={{ display: "flex", flexDirection: "column", gap: 6, padding: "16px 16px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.09)" }}>
              <span style={{ fontSize: 24 }} aria-hidden>{w.icon}</span>
              <span style={{ fontSize: 15.5, fontWeight: 800, color: "#fff" }}>{w.label}</span>
              <span style={{ fontSize: 12.5, color: PINK }}>Browse →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. One next step */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 24px 80px" }}>
        <Link href="/slots/best-crypto-slot-sites" className="csg-lift" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "24px 28px", borderRadius: 18, background: "radial-gradient(80% 140% at 0% 50%, rgba(255,197,49,.14), transparent 60%), #0F1418", border: "1px solid rgba(255,197,49,.3)" }}>
          <span>
            <span style={{ display: "block", fontFamily: MONO, fontSize: 11, color: GOLD, marginBottom: 6 }}>NEXT STEP</span>
            <span style={{ display: "block", fontSize: 22, fontWeight: 800, color: "#fff" }}>Found a slot? Play it at a top crypto slot site.</span>
            <span style={{ display: "block", fontSize: 14.5, color: "#A8B6BE", marginTop: 4 }}>The best crypto slot sites: big game libraries, fast withdrawals, and the bonus that fits slots.</span>
          </span>
          <span style={{ padding: "13px 20px", borderRadius: 12, background: "linear-gradient(180deg,#FFD866,#FFC531)", color: "#141007", fontSize: 15, fontWeight: 800 }}>Best crypto slot sites →</span>
        </Link>
      </section>

      <style>{`@media (max-width: 760px){
        .csg-slotrow{grid-template-columns:48px minmax(0,1fr) auto !important}
        .csg-slotrow-x{display:none !important}
        .csg-slotrow > span:last-child{display:none !important}
        .csg-ways{grid-template-columns:1fr 1fr !important}
      }`}</style>
    </main>
  );
}
