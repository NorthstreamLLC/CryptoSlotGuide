import type { GlanceRow, GlanceSource } from "@/lib/entity-view";

/**
 * The hero fact panel on every review page. Replaced the "Proof score"
 * card: the site no longer scores anything, because every score came
 * from the design prototype with no method behind it. Each row is a
 * fact with a small marker saying where it came from — so a reader sees
 * what's cited, what's third-party, and what nobody has checked yet.
 */
const SOURCE_STYLE: Record<GlanceSource, { label: string; color: string }> = {
  cited: { label: "Cited", color: "#C7A45C" },
  timed: { label: "Field-tested", color: "#00C2CC" },
  "third-party": { label: "Third-party", color: "#9B8FC4" },
  index: { label: "Our index", color: "#8DA0AA" },
  unchecked: { label: "Not yet checked", color: "#5C6A72" },
};

export function GlanceCard({ rows }: { rows: GlanceRow[] }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#5C6A72", marginBottom: 10 }}>
        At a glance
      </div>
      <dl style={{ margin: 0, display: "flex", flexDirection: "column" }}>
        {rows.map((r) => {
          const s = SOURCE_STYLE[r.source];
          return (
            <div key={r.label} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "2px 12px", padding: "10px 0", borderTop: "1px solid rgba(255,255,255,.06)" }} data-keep-grid>
              <dt style={{ fontSize: 12.5, color: "#A8B6BE" }}>{r.label}</dt>
              <dd style={{ margin: 0, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 13, fontWeight: 500, color: r.source === "unchecked" ? "#7B8A93" : "#E8EDF0", textAlign: "right", overflowWrap: "anywhere" }}>
                {r.value}
              </dd>
              <span style={{ gridColumn: "2", justifySelf: "end", display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 8.5, letterSpacing: ".04em", textTransform: "uppercase", color: s.color, whiteSpace: "nowrap" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, flex: "none" }} />
                {r.sourceName ?? s.label}
              </span>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
