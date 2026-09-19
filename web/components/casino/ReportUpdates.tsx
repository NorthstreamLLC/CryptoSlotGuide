import changelog from "@/data/changelog.json";

const MONO = "var(--font-jetbrains-mono), monospace";
type Entry = { date: string; group: string; label: string; from: string; to: string };

/** What we updated in this report and when, built from the history of our cited facts (scripts/build-changelog.mjs). */
export function ReportUpdates({ slug, name }: { slug: string; name: string }) {
  const list = ((changelog as Record<string, Entry[]>)[slug] ?? []).slice(0, 8);
  if (!list.length) return null;
  return (
    <section id="updates" style={{ scrollMarginTop: 90, marginBottom: 56 }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 8 }}>Kept current</div>
      <h2 style={{ margin: "0 0 6px", fontSize: 30, lineHeight: 1.1, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>Report updates</h2>
      <p style={{ margin: "0 0 16px", fontSize: 14.5, color: "#8DA0AA" }}>What we changed in the {name} report and when, as its terms and offers were re-checked.</p>
      <div style={{ padding: "6px 22px", borderRadius: 18, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
        {list.map((e, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "96px minmax(120px, 170px) 1fr", gap: 14, padding: "12px 0", borderTop: i ? "1px solid rgba(255,255,255,.06)" : undefined, alignItems: "start" }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: "#6E7F88" }}>{e.date}</span>
            <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".05em", textTransform: "uppercase", color: "#A8B6BE" }}>{e.label}</span>
            <span style={{ fontSize: 13.5, lineHeight: 1.5, color: "#C6D1D7" }}>
              <span style={{ color: "#6E7F88", textDecoration: "line-through" }}>{short(e.from)}</span>
              <br />
              {short(e.to)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

const short = (t: string) => (t.length > 150 ? t.slice(0, 149).replace(/\s+\S*$/, "") + "…" : t);
