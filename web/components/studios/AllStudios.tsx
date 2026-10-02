import Link from "next/link";
import { catalogueStudios } from "@/lib/studio-pages";
import { slotEssentialsStudio } from "@/lib/slotessentials";

/**
 * Every studio in the slot catalogue, on the providers index: the 24 written
 * up above are a fraction of the 69 the database holds, and each of the rest
 * now has a page of its own. Biggest first, with the slot count — the one
 * figure every studio has.
 */
const MONO = "var(--font-jetbrains-mono), monospace";

export function AllStudios() {
  const all = catalogueStudios();
  const total = all.reduce((n, s) => n + s.titles, 0);
  return (
    <section id="every-studio" style={{ maxWidth: 1280, margin: "0 auto", padding: "8px 24px 40px", scrollMarginTop: 110 }}>
      <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, letterSpacing: "-.025em", color: "#fff" }}>Every studio in the slot database ({all.length})</h2>
      <p style={{ margin: "0 0 16px", maxWidth: "80ch", fontSize: 14, lineHeight: 1.6, color: "#8DA0AA" }}>
        {total.toLocaleString("en-GB")} slots across {all.length} studios. Each has a page with every title we hold, its return, volatility and max win.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 8 }}>
        {all.map((s) => {
          const se = slotEssentialsStudio(s.name);
          return (
            <div key={s.slug} style={{ display: "flex", flexDirection: "column", gap: 4, padding: "12px 14px", borderRadius: 11, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)", minWidth: 0 }}>
              <Link href={`/providers/${s.slug}`} className="hover:!text-accent" style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", color: "#E8EDF0" }}>
                <span style={{ fontSize: 14, fontWeight: 700, overflowWrap: "anywhere" }}>{s.name}</span>
                <span style={{ fontFamily: MONO, fontSize: 11.5, color: "#8E9CA5", whiteSpace: "nowrap" }}>{s.titles.toLocaleString("en-GB")}</span>
              </Link>
              {se && (
                <a href={se} target="_blank" rel="noopener" className="hover:!text-accent" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".04em", color: "#5FE3E8" }}>
                  on SlotEssentials ↗
                </a>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
