import Link from "next/link";
import { notFound } from "next/navigation";
import { siteData } from "@/lib/site-data";
import { fill } from "@/lib/derived";

/**
 * Ported from the `isGuide` block in CryptoSlotGuide.dc.html (search for
 * `GUIDE ARTICLE`). {token} placeholders in body copy resolve through
 * fill() so a claim like "{fee} of {casinos} operators" can't drift out
 * of step with the live data.
 */
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { guideRows, guideBodies } = siteData;
  const g = guideRows.find((r) => r.slug === slug);
  const body = guideBodies[slug];
  if (!g || !body) notFound();

  const related = guideRows.filter((r) => r.slug !== g.slug).slice(0, 4);

  return (
    <main>
      <article style={{ maxWidth: 820, margin: "0 auto", padding: "52px 40px 40px" }}>
        <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#5C6A72", marginBottom: 26 }}>
          <Link href="/" style={{ color: "#5C6A72" }}>Index</Link> / <Link href="/guides" style={{ color: "#5C6A72" }}>Guides</Link> / <span style={{ color: "#A8B6BE" }}>{g.category}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <span style={{ width: 32, height: 32, flex: "none", borderRadius: 8, background: g.tint, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, fontWeight: 700, color: "#0A0D0F" }}>{g.mono}</span>
          <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC" }}>{g.category} · {g.readMins} min read</span>
        </div>
        <h1 style={{ margin: "0 0 18px", fontSize: 44, lineHeight: 1.06, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "114%", color: "#fff", textWrap: "balance" }}>{g.title}</h1>
        <p style={{ margin: "0 0 26px", fontSize: 19, lineHeight: 1.6, color: "#B7C4CB", textWrap: "pretty" }}>{fill(g.standfirst, siteData)}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: "1px solid rgba(255,255,255,.07)", borderBottom: "1px solid rgba(255,255,255,.07)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#5C6A72", marginBottom: 32 }}>
          <span style={{ width: 26, height: 26, flex: "none", borderRadius: "50%", background: "#1B2226", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#8DA0AA" }}>CS</span>
          <span>CryptoSlotGuide editorial desk</span>
          <span>·</span>
          <span>last full pass {g.updated} 2026</span>
        </div>

        <div style={{ padding: "24px 28px", borderRadius: 13, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)", marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 14 }}>The short version</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {body.key.map((k) => (
              <div key={k} style={{ display: "flex", gap: 12, fontSize: 15, lineHeight: 1.55, color: "#DCE5E9" }}>
                <span style={{ color: "#00C2CC", fontFamily: "var(--font-jetbrains-mono), monospace", flex: "none" }}>→</span>
                <span>{fill(k, siteData)}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22, marginBottom: 38 }}>
          {body.body.map((p) => (
            <p key={p.slice(0, 40)} style={{ margin: 0, fontSize: 17, lineHeight: 1.75, color: "#B0BEC5", textWrap: "pretty" }}>{fill(p, siteData)}</p>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {related.map((r) => (
            <Link key={r.slug} href={`/guides/${r.slug}`} style={{ display: "flex", flexDirection: "column", gap: 10, padding: 20, borderRadius: 13, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
              <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".07em", textTransform: "uppercase", color: "#5C6A72" }}>{r.category} · {r.readMins} min</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#E8EDF0", lineHeight: 1.35, textWrap: "pretty" }}>{r.title}</span>
            </Link>
          ))}
        </div>
      </article>
    </main>
  );
}
