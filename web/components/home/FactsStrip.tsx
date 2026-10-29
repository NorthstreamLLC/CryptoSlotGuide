import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { brandFor } from "@/lib/casino-facts";
import { getSpecFact } from "@/lib/spec-sheet";
import { FACT_ARTICLES } from "@/lib/fact-articles";
import { BrandMark } from "@/components/ui/BrandMark";

const MONO = "var(--font-jetbrains-mono), monospace";

/** The facts the homepage teases: one striking fact from three articles, by slug and fact title. */
const PICKS: [string, string][] = [
  ["duel", "Its operator used to run CSGOEmpire"],
  ["razed", "The first players to reach its top ranks win a car"],
  ["roobet", "An affiliate code boosts your rakeback by 20% for 72 hours"],
];

export function FactsStrip() {
  const cards = PICKS.flatMap(([slug, title]) => {
    const o = siteData.ops.find((x) => x.slug === slug);
    const f = FACT_ARTICLES[slug]?.facts.find((x) => x.title === title);
    // A teaser only shows while its fact and source are still on the article.
    return o && f && getSpecFact(slug, f.group, f.label)?.sourceUrl ? [{ o, f, n: FACT_ARTICLES[slug].facts.findIndex((x) => x.title === title) + 1 }] : [];
  });
  if (cards.length === 0) return null;
  const total = Object.values(FACT_ARTICLES).reduce((n, a) => n + a.facts.length, 0);

  return (
    <section data-reveal style={{ maxWidth: 1180, margin: "0 auto", padding: "60px 24px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".09em", textTransform: "uppercase", color: "#5FE3E8", marginBottom: 10 }}>Know the casino</div>
          <h2 style={{ margin: 0, fontSize: 30, letterSpacing: "-.025em", fontWeight: 800, color: "#fff" }}>Things most players don&apos;t know</h2>
        </div>
        <Link href="/casinos/facts" style={{ fontSize: 14.5, fontWeight: 700, color: "#5FE3E8" }}>{total} facts on {Object.keys(FACT_ARTICLES).length} casinos →</Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        {cards.map(({ o, f, n }) => {
          const tint = brandFor(o.slug);
          return (
            <Link key={o.slug} href={`/casinos/${o.slug}/facts#fact-${n}`} className="csg-more-tile" style={{ ["--tint" as string]: tint, display: "flex", flexDirection: "column", gap: 12, padding: "20px 20px 18px", borderRadius: 16, background: `radial-gradient(110% 80% at 0% 0%, ${tint}1f, transparent 60%), #0C1013`, border: `1px solid ${tint}40`, borderTop: `2px solid ${tint}`, transition: "transform .2s, border-color .2s, box-shadow .2s" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 34, height: 34, flex: "none", borderRadius: 9, overflow: "hidden" }}>
                  <BrandMark slug={o.slug} mono={o.mono} tint={tint} radius={9} fontSize={11} />
                </span>
                <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: tint }}>
                  {o.name} · fact {String(n).padStart(2, "0")}
                </span>
                <span aria-hidden style={{ marginLeft: "auto", fontSize: 22 }}>{f.icon}</span>
              </span>
              <span style={{ fontSize: 19, lineHeight: 1.3, fontWeight: 800, letterSpacing: "-.01em", color: "#fff" }}>{f.title}</span>
              <span style={{ marginTop: "auto", fontSize: 13.5, fontWeight: 700, color: tint }}>All 10 facts about {o.name} →</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
