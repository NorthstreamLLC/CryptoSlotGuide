import Link from "next/link";
import type { ReactNode } from "react";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

const MONO = "var(--font-jetbrains-mono), monospace";

export type InfoSection = { title: string; body: ReactNode };

/** The plain layout the site's trust pages share: About, Responsible gambling, Affiliate disclosure, Corrections. */
export function InfoPage({ kicker, title, intro, path, sections, tint = "#5FE3E8", children }: { kicker: string; title: string; intro: ReactNode; path: string; sections: InfoSection[]; tint?: string; children?: ReactNode }) {
  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: title, path }])} />
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: `radial-gradient(100% 100% at 50% 0%, ${tint}17, transparent 60%), #090C0F` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 44px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 20 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <span style={{ color: "#A8B6BE" }}>{title}</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: tint, marginBottom: 14 }}>{kicker}</div>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(34px, 4.4vw, 46px)", lineHeight: 1.05, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>{title}</h1>
          <div style={{ maxWidth: "68ch", fontSize: 16.5, lineHeight: 1.65, color: "#B7C4CB" }}>{intro}</div>
        </div>
      </section>
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 70px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
          {sections.map((s) => (
            <div key={s.title}>
              <h2 style={{ margin: "0 0 12px", fontSize: 23, letterSpacing: "-.015em", fontWeight: 800, color: "#fff" }}>{s.title}</h2>
              <div className="csg-info-body" style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 15.5, lineHeight: 1.7, color: "#B7C4CB" }}>{s.body}</div>
            </div>
          ))}
        </div>
        {children}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 44, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,.08)", fontSize: 14, fontWeight: 700 }}>
          {[
            ["/about", "About"],
            ["/editorial-standards", "Editorial standards"],
            ["/how-we-rate", "How we source information"],
            ["/affiliate-disclosure", "Affiliate disclosure"],
            ["/corrections", "Corrections"],
            ["/responsible-gambling", "Responsible gambling"],
            ["/contact", "Contact"],
          ]
            .filter(([href]) => href !== path)
            .map(([href, label]) => (
              <Link key={href} href={href} style={{ color: "#5FE3E8" }}>{label} →</Link>
            ))}
        </div>
      </section>
    </main>
  );
}

/** A link styled for body copy on these pages. */
export function A({ href, children }: { href: string; children: ReactNode }) {
  const external = /^https?:/.test(href) || href.startsWith("mailto:");
  return external ? (
    <a href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer" style={{ color: "#5FE3E8", fontWeight: 600 }}>{children}</a>
  ) : (
    <Link href={href} style={{ color: "#5FE3E8", fontWeight: 600 }}>{children}</Link>
  );
}
