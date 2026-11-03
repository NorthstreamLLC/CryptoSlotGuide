import changelog from "@/data/changelog.json";

type Entry = { date: string; group: string; label: string; from: string; to: string };

const brief = (t: string) => {
  const first = t.split(/(?<=\.)\s+(?=[A-Z])/)[0].replace(/[.;]$/, "");
  return first.length > 110 ? first.slice(0, 110).replace(/[\s,;:–-]+\S*$/, "") + "…" : first;
};

/** What we updated in this report and when, built from the history of our cited facts (scripts/build-changelog.mjs). */
export function ReportUpdates({ slug, name }: { slug: string; name: string }) {
  const list = ((changelog as Record<string, Entry[]>)[slug] ?? []).slice(0, 5);
  if (!list.length) return null;
  return (
    <section id="updates" style={{ scrollMarginTop: 156, marginBottom: 64 }}>
      <h2 style={{ margin: "0 0 6px", fontSize: 26, lineHeight: 1.15, letterSpacing: "-.025em", fontWeight: 700, color: "#F2F5F7" }}>Recent updates</h2>
      <p style={{ margin: "0 0 16px", fontSize: 14.5, color: "#8DA0AA" }}>The latest changes to the {name} report as its terms and offers were re-checked.</p>
      <div style={{ padding: "4px 20px", borderRadius: 16, background: "#0D1114", border: "1px solid rgba(255,255,255,.08)" }}>
        {list.map((e, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "92px minmax(0,1fr)", gap: 14, padding: "12px 0", borderTop: i ? "1px solid rgba(255,255,255,.06)" : undefined }}>
            <span style={{ fontSize: 13, color: "#75828A", paddingTop: 1 }}>{e.date}</span>
            <span style={{ fontSize: 13.5, lineHeight: 1.5, color: "#C6D1D7" }}>
              <strong style={{ color: "#fff" }}>{e.label}</strong> · {brief(e.to)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
