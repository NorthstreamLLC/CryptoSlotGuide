import Link from "next/link";
import type { ReactNode } from "react";

const MONO = "var(--font-jetbrains-mono), monospace";

/** Shared frame for the generated landing pages (by country, by coin). */
export function LandingShell({ crumbs, eyebrow, title, intro, chips, children }: { crumbs: { label: string; href?: string }[]; eyebrow: string; title: string; intro: ReactNode; chips?: string[]; children: ReactNode }) {
  return (
    <main style={{ background: "#07090B" }}>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(80% 120% at 85% 0%, rgba(0,194,204,.10), transparent 55%), radial-gradient(60% 80% at 0% 100%, rgba(214,182,92,.07), transparent 60%), #0A0D10" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "36px 24px 36px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#5C6A72", marginBottom: 20 }}>
            {crumbs.map((c, i) => (
              <span key={i}>
                {i > 0 && " / "}
                {c.href ? <Link href={c.href} style={{ color: "#5C6A72" }}>{c.label}</Link> : <span style={{ color: "#A8B6BE" }}>{c.label}</span>}
              </span>
            ))}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 12 }}>{eyebrow}</div>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(34px, 4.4vw, 52px)", lineHeight: 1.03, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "114%", color: "#fff", textWrap: "balance" }}>{title}</h1>
          <p style={{ margin: 0, maxWidth: "66ch", fontSize: 16.5, lineHeight: 1.6, color: "#A8B6BE" }}>{intro}</p>
          {chips && chips.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
              {chips.map((c) => (
                <span key={c} style={{ padding: "8px 13px", borderRadius: 100, background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)", fontSize: 13, fontWeight: 600, color: "#E8EDF0" }}>{c}</span>
              ))}
            </div>
          )}
        </div>
      </section>
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 24px 72px" }}>{children}</section>
    </main>
  );
}

export function LinkCloud({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <>
      <h2 style={{ margin: "36px 0 12px", fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>{title}</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.map((i) => (
          <Link key={i.href} href={i.href} style={{ padding: "8px 13px", borderRadius: 100, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)", fontSize: 13, fontWeight: 600, color: "#C6D1D7" }}>{i.label}</Link>
        ))}
      </div>
    </>
  );
}
