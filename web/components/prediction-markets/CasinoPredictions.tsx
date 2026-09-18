import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { getSpecFact } from "@/lib/spec-sheet";
import { brandFor } from "@/lib/casino-facts";
import { BrandMark } from "@/components/ui/BrandMark";
import { Icon } from "@/components/ui/Icon";

const MONO = "var(--font-jetbrains-mono), monospace";

/** Crypto casinos that run their own prediction markets, each from the casino's own cited "Prediction markets" fact. */
export function CasinoPredictions() {
  const rows = siteData.ops
    .map((o) => ({ o, f: getSpecFact(o.slug, "Sportsbook", "Prediction markets") }))
    .filter((r) => r.f?.value)
    .sort((a, b) => Number(!!b.o.featured) - Number(!!a.o.featured) || a.o.name.localeCompare(b.o.name));
  if (!rows.length) return null;

  return (
    <section style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px 84px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 10 }}>Inside crypto casinos</div>
      <h2 style={{ margin: "0 0 8px", fontSize: 32, lineHeight: 1.1, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>Crypto casinos with prediction markets</h2>
      <p style={{ margin: "0 0 20px", maxWidth: "70ch", fontSize: 15, lineHeight: 1.6, color: "#93A3AC" }}>
        {rows.length} casinos let you trade on elections, crypto prices, sport and culture from the same balance you play with. Some run Yes/No share markets (Roobet&apos;s is powered by Polymarket); others price outcomes as fixed odds. Each line comes from the casino&apos;s own pages.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
        {rows.map(({ o, f }) => {
          const brand = brandFor(o.slug);
          const text = f!.value!.replace(/^Yes\.\s*/, "");
          return (
            <Link key={o.slug} href={`/casinos/${o.slug}#sportsbook`} style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20, borderRadius: 16, background: o.featured ? `radial-gradient(120% 90% at 100% 0%, ${brand}1a, transparent 60%), #0C1013` : "#0C1013", border: `1px solid ${o.featured ? `${brand}40` : "rgba(255,255,255,.07)"}` }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 34, height: 34, flex: "none", borderRadius: 9, overflow: "hidden" }}>
                  <BrandMark slug={o.slug} mono={o.mono} tint={brand} radius={9} fontSize={11} />
                </span>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{o.name}</span>
                {o.featured && <span style={{ marginLeft: "auto", padding: "2px 8px", borderRadius: 100, background: `${brand}1f`, fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: ".06em", color: brand }}>FEATURED</span>}
              </span>
              <span style={{ fontSize: 13.5, lineHeight: 1.55, color: "#A8B6BE", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{text}</span>
              <span style={{ marginTop: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#00C2CC" }}>
                View offer <Icon name="arrow" size={14} />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
