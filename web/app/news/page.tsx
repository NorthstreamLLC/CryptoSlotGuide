import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { NEWS, NEWS_KIND, newsPath } from "@/lib/news";
import { brandFor } from "@/lib/casino-facts";
import { siteData } from "@/lib/site-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandMark } from "@/components/ui/BrandMark";
import { newsArticles } from "@/lib/news-articles";
import { guideLabel } from "@/lib/guide-dates";
import { fill } from "@/lib/derived";

const MONO = "var(--font-jetbrains-mono), monospace";

export const metadata = pageMetadata(
  "Crypto casino news: what changed this month",
  "Crypto casino news from regulators' and casinos' own documents, plus our monthly roundup of new bonuses, changed terms, fees and licence updates at every casino we cover.",
  "/news"
);

const TYPE = { news: "News", analysis: "Analysis", opinion: "Opinion" } as const;

export default function Page() {
  const articles = newsArticles();
  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={[breadcrumbSchema([{ name: "Home", path: "/" }, { name: "News", path: "/news" }]), itemListSchema("Crypto casino news", [...articles.map((g) => ({ name: g.title, path: `/guides/${g.slug}` })), ...NEWS.map((n) => ({ name: n.title, path: newsPath(n.month) }))])]} />
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(70% 120% at 85% 0%, rgba(255,126,182,.12), transparent 60%), #0A0D10" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "34px 24px 40px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 22 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <span style={{ color: "#A8B6BE" }}>News</span>
          </div>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(34px, 4.6vw, 54px)", lineHeight: 1.04, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>
            Crypto casino <span style={{ color: "#FF9CC6" }}>news</span>
          </h1>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.65, color: "#B7C4CB" }}>
            Stories from regulators&apos; and casinos&apos; own documents, and every month a roundup of what changed: new bonuses, changed rules, fees and licence updates, each with its source.
          </p>
        </div>
      </section>
      {articles.length > 0 && (
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px 0" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 22, letterSpacing: "-.02em", fontWeight: 700, color: "#F2F5F7" }}>Latest news</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {articles.map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`} className="csg-lift" style={{ display: "flex", flexDirection: "column", gap: 8, padding: "18px 22px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".06em", color: "#8E9CA4" }}>
                  <span style={{ color: g.contentType && g.contentType !== "news" ? "#FFC531" : "#5FE3E8" }}>{(g.contentType ? TYPE[g.contentType] : g.category).toUpperCase()}</span> · {guideLabel(g.updated)} · {g.readMins} MIN READ
                </span>
                <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-.015em", lineHeight: 1.3, color: "#fff" }}>{g.title}</span>
                <span style={{ fontSize: 14.5, lineHeight: 1.6, color: "#A8B6BE" }}>{fill(g.standfirst, siteData)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px 70px", display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={{ margin: 0, fontSize: 22, letterSpacing: "-.02em", fontWeight: 700, color: "#F2F5F7" }}>What changed each month</h2>
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
