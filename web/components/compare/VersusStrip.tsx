import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { brandFor } from "@/lib/casino-facts";
import { analysedRivals } from "@/lib/versus";
import { BrandMark } from "@/components/ui/BrandMark";


/** "Compare Stake with…": the casino's analysed head-to-heads as logo chips. Nothing renders without one. */
export function VersusStrip({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const o = siteData.ops.find((x) => x.slug === slug);
  const rivals = analysedRivals(slug);
  if (!o || rivals.length === 0) return null;
  return (
    <section aria-label={`Compare ${o.name}`} style={{ margin: compact ? "12px 0 0" : "36px 0 0" }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: "#5FE3E8", marginBottom: 10 }}>Compare {o.name} with</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {rivals.map(({ rival, href }) => (
          <Link key={href} href={href} className="csg-lift" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: compact ? "6px 12px 6px 6px" : "8px 14px 8px 8px", borderRadius: 100, background: "#0C1013", border: `1px solid ${brandFor(rival.slug)}44`, fontSize: compact ? 13 : 13.5, fontWeight: 700, color: "#E8EDF0" }}>
            <span style={{ width: compact ? 22 : 26, height: compact ? 22 : 26, flex: "none", borderRadius: "50%", overflow: "hidden" }}>
              <BrandMark slug={rival.slug} mono={rival.mono} tint={brandFor(rival.slug)} radius={13} fontSize={9} />
            </span>
            vs {rival.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
