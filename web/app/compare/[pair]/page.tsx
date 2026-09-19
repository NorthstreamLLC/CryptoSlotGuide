import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { versusPairs, pairSlug, parsePair, versusRows } from "@/lib/versus";
import { brandFor } from "@/lib/casino-facts";
import { BrandMark } from "@/components/ui/BrandMark";
import { Icon } from "@/components/ui/Icon";
import type { Operator } from "@/lib/types";
import { siteData } from "@/lib/site-data";

const MONO = "var(--font-jetbrains-mono), monospace";

export function generateStaticParams() {
  return versusPairs().map(([a, b]) => ({ pair: pairSlug(a, b) }));
}

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const p = parsePair(pair);
  if (!p) return {};
  const [a, b] = p;
  return pageMetadata(`${a.name} vs ${b.name}: bonuses, withdrawals and rewards compared`, `${a.name} or ${b.name}? Welcome offers, wagering, withdrawal speed, races, rakeback, coins, sportsbook and licence side by side, from each casino's own terms.`, `/compare/${pair}`);
}

export default async function Page({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const p = parsePair(pair);
  if (!p) notFound();
  const [a, b] = p;
  const rows = versusRows(a, b);
  const wins = { a: rows.filter((r) => r.edge === "a").map((r) => r.label), b: rows.filter((r) => r.edge === "b").map((r) => r.label) };
  const others = versusPairs().filter(([x, y]) => (x === a.slug || y === a.slug || x === b.slug || y === b.slug) && pairSlug(x, y) !== pair).slice(0, 12);

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Compare", path: "/compare" }, { name: `${a.name} vs ${b.name}`, path: `/compare/${pair}` }])} />
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: `radial-gradient(60% 120% at 0% 0%, ${brandFor(a.slug)}22, transparent 60%), radial-gradient(60% 120% at 100% 0%, ${brandFor(b.slug)}22, transparent 60%), #0A0D10` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "34px 24px 36px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#5C6A72", marginBottom: 20 }}>
            <Link href="/" style={{ color: "#5C6A72" }}>Home</Link> / <Link href="/compare" style={{ color: "#5C6A72" }}>Compare</Link> / <span style={{ color: "#A8B6BE" }}>{a.name} vs {b.name}</span>
          </div>
          <h1 style={{ margin: "0 0 12px", fontSize: "clamp(32px, 4.4vw, 52px)", lineHeight: 1.04, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "114%", color: "#fff", textWrap: "balance" }}>
            {a.name} vs {b.name}
          </h1>
          <p style={{ margin: 0, maxWidth: "64ch", fontSize: 16.5, lineHeight: 1.6, color: "#A8B6BE" }}>
            Bonuses, wagering, withdrawal speed, races, coins, sportsbook and licence side by side. Every figure comes from each casino&apos;s own terms; where the numbers settle it, the stronger side is marked.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
          {([["a", a], ["b", b]] as const).map(([k, o]) => (
            <Side key={k} o={o} wins={wins[k]} />
          ))}
        </div>

        <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,.08)", background: "#0C1013", overflow: "hidden" }}>
          <div className="grid grid-cols-[minmax(110px,.8fr)_1fr_1fr]" style={{ padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,.07)", fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#6E7F88", gap: 14 }}>
            <span />
            <span>{a.name}</span>
            <span>{b.name}</span>
          </div>
          {rows.map((r, i) => (
            <div key={r.label} className="grid grid-cols-[minmax(110px,.8fr)_1fr_1fr]" style={{ gap: 14, padding: "13px 18px", borderTop: i ? "1px solid rgba(255,255,255,.05)" : undefined, alignItems: "center" }}>
              <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".05em", textTransform: "uppercase", color: "#8DA0AA" }}>{r.label}</span>
              {(["a", "b"] as const).map((k) => (
                <span key={k} style={{ fontSize: 14, lineHeight: 1.4, fontWeight: r.edge === k ? 800 : 600, color: r[k] ? (r.edge === k ? "#7BE0B8" : "#E8EDF0") : "#4E5A62" }}>
                  {r[k] ?? "—"}
                  {r.edge === k && <span style={{ marginLeft: 6, fontFamily: MONO, fontSize: 9.5, color: "#2FB67A" }}>BETTER</span>}
                </span>
              ))}
            </div>
          ))}
        </div>

        {others.length > 0 && (
          <>
            <h2 style={{ margin: "34px 0 12px", fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>More comparisons</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {others.map(([x, y]) => (
                <Link key={pairSlug(x, y)} href={`/compare/${pairSlug(x, y)}`} style={{ padding: "8px 13px", borderRadius: 100, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)", fontSize: 13, fontWeight: 600, color: "#C6D1D7" }}>
                  {nameOf(x)} vs {nameOf(y)}
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

const nameOf = (slug: string) => siteData.ops.find((o) => o.slug === slug)?.name ?? slug;

function Side({ o, wins }: { o: Operator; wins: string[] }) {
  const brand = brandFor(o.slug);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20, borderRadius: 16, background: `radial-gradient(120% 90% at 100% 0%, ${brand}1a, transparent 60%), #0C1013`, border: `1px solid ${brand}40` }}>
      <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 40, height: 40, flex: "none", borderRadius: 10, overflow: "hidden" }}>
          <BrandMark slug={o.slug} mono={o.mono} tint={brand} radius={10} fontSize={12} />
        </span>
        <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{o.name}</span>
      </span>
      <span style={{ fontSize: 15.5, lineHeight: 1.3, fontWeight: 800, color: "#fff" }}>{o.bonusShort ?? o.bonus}</span>
      <span style={{ fontSize: 13, color: "#8DA0AA" }}>{wins.length ? `Better on: ${wins.join(", ").toLowerCase()}` : "Level on the measurable rows"}</span>
      <Link href={`/casinos/${o.slug}`} style={{ marginTop: "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px 14px", borderRadius: 10, background: o.featured ? brand : "#00C2CC", color: "#0A0D0F", fontSize: 13.5, fontWeight: 800 }}>
        View {o.name} offer <Icon name="arrow" size={14} />
      </Link>
    </div>
  );
}
