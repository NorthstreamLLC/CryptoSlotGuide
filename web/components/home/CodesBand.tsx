import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { inHouseOrder } from "@/lib/house-order";
import { brandFor } from "@/lib/casino-facts";
import { PROMO_HUB, PROMO_PAGES } from "@/lib/promo-pages";
import { VERSUS_ANALYSIS } from "@/lib/versus-analysis";
import { parsePair } from "@/lib/versus";
import { BrandMark } from "@/components/ui/BrandMark";
import { CodeChip } from "@/components/ui/CodeChip";

const MONO = "var(--font-jetbrains-mono), monospace";
const GOLD = "#FFC531";

/**
 * Homepage band: a handful of our codes (perks first, then welcome bonuses),
 * and the head-to-head pages that carry their own analysis.
 */
export function CodesBand() {
  const rank = { perk: 0, welcome: 1, rewards: 2 } as const;
  const codes = inHouseOrder(siteData.ops.filter((o) => PROMO_PAGES.includes(o.slug) && PROMO_HUB[o.slug] && o.promoCode && o.signupUrl))
    .sort((a, b) => rank[PROMO_HUB[a.slug].kind] - rank[PROMO_HUB[b.slug].kind])
    .slice(0, 6);
  // The hand-written pairs among the top codes come first; six fit the panel.
  const pairs = Object.keys(VERSUS_ANALYSIS).slice(0, 6).flatMap((k) => {
    const p = parsePair(k);
    return p ? [{ k, a: p[0], b: p[1] }] : [];
  });

  return (
    <section data-reveal style={{ maxWidth: 1180, margin: "0 auto", padding: "60px 24px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".09em", textTransform: "uppercase", color: GOLD, marginBottom: 10 }}>Codes & comparisons</div>
          <h2 style={{ margin: 0, fontSize: 30, letterSpacing: "-.025em", fontWeight: 800, color: "#fff" }}>Use a code, or pick between two</h2>
        </div>
        <Link href="/promo-codes" style={{ fontSize: 14.5, fontWeight: 700, color: GOLD }}>All {PROMO_PAGES.length} promo codes →</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr]" style={{ gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {codes.map((o) => {
            const tint = brandFor(o.slug);
            return (
              <div key={o.slug} className="csg-lift" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "12px 14px", borderRadius: 14, background: `radial-gradient(80% 140% at 0% 50%, ${tint}14, transparent 60%), #0C1013`, border: "1px solid rgba(255,255,255,.08)", borderLeft: `3px solid ${tint}` }}>
                <Link href={`/promo-codes/${o.slug}`} style={{ display: "flex", alignItems: "center", gap: 12, flex: "1 1 240px", minWidth: 0 }}>
                  <span style={{ width: 40, height: 40, flex: "none", borderRadius: 10, overflow: "hidden" }}>
                    <BrandMark slug={o.slug} mono={o.mono} tint={tint} radius={10} fontSize={12} />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 15.5, fontWeight: 800, color: "#fff" }}>{o.name}</span>
                    <span style={{ display: "block", fontSize: 13, lineHeight: 1.4, color: "#A8B6BE" }}>{o.codePerk?.short ?? PROMO_HUB[o.slug].line}</span>
                  </span>
                </Link>
                <CodeChip code={o.promoCode!} tint={GOLD} size="sm" />
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 18, borderRadius: 16, background: "radial-gradient(100% 80% at 100% 0%, rgba(95,227,232,.1), transparent 60%), #0C1013", border: "1px solid rgba(95,227,232,.22)" }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", color: "#5FE3E8" }}>HEAD TO HEAD</div>
          <div style={{ fontSize: 14, lineHeight: 1.5, color: "#A8B6BE", marginBottom: 4 }}>Torn between two? Each comparison ends in a verdict, with every claim sourced.</div>
          {pairs.map(({ k, a, b }) => (
            <Link key={k} href={`/compare/${k}`} className="csg-lift" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)" }}>
              <span aria-hidden style={{ display: "flex", flex: "none" }}>
                {[a, b].map((o, i) => (
                  <span key={o.slug} style={{ width: 28, height: 28, marginLeft: i ? -8 : 0, borderRadius: "50%", overflow: "hidden", border: "2px solid #0C1013", background: "#0C1013", zIndex: 2 - i }}>
                    <BrandMark slug={o.slug} mono={o.mono} tint={brandFor(o.slug)} radius={14} fontSize={9} />
                  </span>
                ))}
              </span>
              <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700, color: "#E8EDF0" }}>
                {a.name} <span style={{ color: "#5FE3E8", fontWeight: 600 }}>vs</span> {b.name}
              </span>
              <span aria-hidden style={{ color: "#5FE3E8" }}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
