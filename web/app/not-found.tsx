import Link from "next/link";
import type { Metadata } from "next";
import { FeaturedPartner } from "@/components/ui/FeaturedPartner";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

/**
 * The 404 for every unmatched address and every notFound(): a mistyped link,
 * an old bookmark, a slot that lost its page. Instead of a dead end, it
 * offers search, the main sections and the partners panel, so the visit can
 * still go somewhere.
 */
const LINKS = [
  { href: "/bonuses", label: "Best bonuses", hint: "Every casino's offer, with codes" },
  { href: "/crypto-casinos", label: "Crypto casinos", hint: "All 46, ranked and compared" },
  { href: "/slots", label: "Slots", hint: "2,400+ slots with published RTPs" },
  { href: "/legal", label: "Countries", hint: "Where crypto casinos accept you" },
];

export default function NotFound() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 24px 80px" }}>
      <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, letterSpacing: ".12em", color: "#00C2CC", marginBottom: 14 }}>ERROR 404</div>
      <h1 style={{ margin: "0 0 12px", fontSize: "clamp(34px, 5vw, 56px)", lineHeight: 1.02, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>
        This page isn&apos;t here.
      </h1>
      <p style={{ margin: "0 0 26px", maxWidth: "60ch", fontSize: 16.5, lineHeight: 1.6, color: "#A8B6BE" }}>
        The link may be old or mistyped. Search for what you were after, or pick up from one of the main sections.
      </p>

      <form action="/search" method="get" role="search" style={{ display: "flex", gap: 8, maxWidth: 560, marginBottom: 32 }}>
        <input
          name="q"
          type="search"
          placeholder="casinos, slots, sportsbooks, coins…"
          aria-label="Search the site"
          style={{ flex: 1, minWidth: 0, padding: "13px 16px", borderRadius: 11, border: "1px solid rgba(255,255,255,.12)", background: "#0C1013", color: "#fff", fontSize: 15 }}
        />
        <button type="submit" style={{ padding: "13px 20px", borderRadius: 11, border: 0, background: "#00C2CC", color: "#04191B", fontSize: 14.5, fontWeight: 800, cursor: "pointer" }}>
          Search
        </button>
      </form>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="csg-lift" style={{ display: "block", padding: "18px 20px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
            <span style={{ display: "block", fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{l.label} →</span>
            <span style={{ display: "block", fontSize: 13, color: "#8DA0AA" }}>{l.hint}</span>
          </Link>
        ))}
      </div>

      <FeaturedPartner context={{ kind: "general" }} />
    </section>
  );
}
