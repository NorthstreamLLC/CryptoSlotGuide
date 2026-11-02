import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { NEWS, NEWS_KIND, newsPath } from "@/lib/news";
import { brandFor } from "@/lib/casino-facts";
import { siteData } from "@/lib/site-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandMark } from "@/components/ui/BrandMark";

const MONO = "var(--font-jetbrains-mono), monospace";

export const metadata = pageMetadata(
  "Crypto casino news: what changed this month",
  "New bonuses, changed terms, fees and licence updates at the crypto casinos we cover, found in our monthly re-check of each casino's own pages.",
  "/news"
);

export default function Page() {
  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={[breadcrumbSchema([{ name: "Home", path: "/" }, { name: "News", path: "/news" }]), itemListSchema("Crypto casino news", NEWS.map((n) => ({ name: n.title, path: newsPath(n.month) })))]} />
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(70% 120% at 85% 0%, rgba(255,126,182,.12), transparent 60%), #0A0D10" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "34px 24px 40px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 22 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <span style={{ color: "#A8B6BE" }}>News</span>
          </div>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(34px, 4.6vw, 54px)", lineHeight: 1.04, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>
            What changed at <span style={{ color: "#FF9CC6" }}>crypto casinos</span>
          </h1>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.65, color: "#B7C4CB" }}>
            Every month we re-read each casino&apos;s own terms, help pages and licence registers. New bonuses, changed rules, fees and licence updates land here, each with its source.
          </p>
        </div>
      </section>
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px 70px", display: "flex", flexDirection: "column", gap: 16 }}>
        {NEWS.map((n) => (
          <Link key={n.month} href={newsPath(n.month)} className="csg-lift" style={{ display: "flex", flexDirection: "column", gap: 12, padding: "22px 24px", borderRadius: 16, background: "radial-gradient(80% 120% at 0% 0%, rgba(255,126,182,.1), transparent 60%), #0C1013", border: "1px solid rgba(255,126,182,.3)" }}>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".08em", color: "#FF9CC6" }}>{n.items.length} CHANGES</span>
            <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>{n.title}</span>
            <span style={{ fontSize: 15, lineHeight: 1.6, color: "#A8B6BE" }}>{n.intro}</span>
            <span style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {n.items.slice(0, 4).map((it, i) => {
                const o = siteData.ops.find((x) => x.slug === it.slug);
                return (
                  <span key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#DCE5E9" }}>
                    {o && (
                      <span style={{ width: 22, height: 22, flex: "none", borderRadius: 6, overflow: "hidden" }}>
                        <BrandMark slug={o.slug} mono={o.mono} tint={brandFor(o.slug)} radius={6} fontSize={8} />
                      </span>
                    )}
                    <span style={{ fontFamily: MONO, fontSize: 9.5, color: NEWS_KIND[it.kind].tint, textTransform: "uppercase", width: 62, flex: "none" }}>{NEWS_KIND[it.kind].label}</span>
                    {it.headline}
                  </span>
                );
              })}
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#FF9CC6" }}>Read all {n.items.length} →</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
