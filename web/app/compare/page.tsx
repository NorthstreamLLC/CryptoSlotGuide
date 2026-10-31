import { ComparePage } from "@/components/compare/ComparePage";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import { versusPairs, pairSlug, parsePair } from "@/lib/versus";
import { VERSUS_ANALYSIS } from "@/lib/versus-analysis";
import { brandFor } from "@/lib/casino-facts";
import { BrandMark } from "@/components/ui/BrandMark";
import { NextSteps } from "@/components/layout/NextSteps";
import { siteData } from "@/lib/site-data";

export const metadata = pageMetadata(
  "Compare operators side by side",
  "Pick any two or three operators — casinos, wallets, exchanges, sportsbooks — and compare their listed figures column by column.",
  "/compare"
);

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Compare", path: "/compare" }])} />
      <ComparePage />
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px 80px" }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>Head-to-head verdicts</h2>
        <p style={{ margin: "0 0 16px", fontSize: 14.5, color: "#8DA0AA" }}>Two casinos, one verdict, every claim linked to its source.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12, marginBottom: 40 }}>
          {Object.entries(VERSUS_ANALYSIS).flatMap(([k, an]) => {
            const p = parsePair(k);
            return p ? [{ k, an, a: p[0], b: p[1] }] : [];
          }).map(({ k, an, a, b }) => (
            <Link key={k} href={`/compare/${k}`} className="csg-lift" style={{ display: "flex", flexDirection: "column", gap: 10, padding: "16px 18px", borderRadius: 14, background: `radial-gradient(70% 120% at 0% 0%, ${brandFor(a.slug)}18, transparent 60%), radial-gradient(70% 120% at 100% 0%, ${brandFor(b.slug)}18, transparent 60%), #0C1013`, border: "1px solid rgba(255,255,255,.09)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "flex" }}>
                  {[a, b].map((o, i) => (
                    <span key={o.slug} style={{ width: 30, height: 30, marginLeft: i ? -8 : 0, borderRadius: "50%", overflow: "hidden", border: "2px solid #0C1013", zIndex: 2 - i }}>
                      <BrandMark slug={o.slug} mono={o.mono} tint={brandFor(o.slug)} radius={15} fontSize={10} />
                    </span>
                  ))}
                </span>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{a.name} <span style={{ color: "#5FE3E8" }}>vs</span> {b.name}</span>
              </span>
              <span style={{ fontSize: 13.5, lineHeight: 1.5, color: "#A8B6BE" }}>{an.verdict}</span>
            </Link>
          ))}
        </div>
        <h2 style={{ margin: "0 0 14px", fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>All head-to-heads</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {versusPairs().map(([a, b]) => (
            <Link key={pairSlug(a, b)} href={`/compare/${pairSlug(a, b)}`} style={{ padding: "8px 13px", borderRadius: 100, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)", fontSize: 13, fontWeight: 600, color: "#C6D1D7" }}>
              {siteData.ops.find((o) => o.slug === a)?.name} vs {siteData.ops.find((o) => o.slug === b)?.name}
            </Link>
          ))}
        </div>
        <NextSteps
          steps={[
            { href: "/crypto-casinos", label: "All crypto casinos", hint: "The full index, filterable by payout speed, KYC and wagering." },
            { href: "/bonuses", label: "Every bonus", hint: "Welcome offers and rewards with the wagering each one carries." },
            { href: "/find-my-casino", label: "Find my casino", hint: "Three questions instead of reading every comparison." },
          ]}
        />
      </section>
    </>
  );
}
