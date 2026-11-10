import type { FirstHandTest as Test } from "@/lib/first-hand-tests";

const fmt = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

/** "We tested it": our own account's screenshots and what they show, on a casino review. */
export function FirstHandTest({ t, name, brand }: { t: Test; name: string; brand: string }) {
  return (
    <section id="tested" style={{ scrollMarginTop: 156, marginBottom: 64 }}>
      <h2 style={{ margin: "0 0 8px", fontSize: 26, lineHeight: 1.15, letterSpacing: "-.025em", fontWeight: 700, color: "#F2F5F7" }}>We tested it: withdrawing from {name}</h2>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: "#8E9CA4" }}>
        Our own account. Account activity from {t.activity}; screenshots taken {fmt(t.checked)}.
      </p>

      <div style={{ padding: "20px 22px", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, background: "#0D1114", boxShadow: `inset 0 2px 0 ${brand}` }}>
        <p style={{ margin: "0 0 14px", fontSize: 16, lineHeight: 1.65, color: "#E2E8EB" }}>{t.summary}</p>
        <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, listStyle: "disc" }}>
          {t.findings.map((f) => (
            <li key={f} style={{ fontSize: 15, lineHeight: 1.6, color: "#C9D3D8" }}>{f}</li>
          ))}
        </ul>
        {t.recollection && (
          <p style={{ margin: "14px 0 0", fontSize: 14, lineHeight: 1.6, color: "#8E9CA4" }}>
            <b style={{ color: "#C9D3D8" }}>What we didn&apos;t measure:</b> {t.recollection}
          </p>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 16, marginTop: 16 }}>
        {t.shots.map((s) => (
          <figure key={s.src} style={{ margin: 0, border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, background: "#0D1114", overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} width={s.width} height={s.height} alt={s.alt} loading="lazy" decoding="async" style={{ display: "block", width: "100%", height: "auto" }} />
            <figcaption style={{ padding: "10px 14px", fontSize: 13, lineHeight: 1.5, color: "#98A6AE" }}>{s.caption}</figcaption>
          </figure>
        ))}
      </div>

      <h3 style={{ margin: "32px 0 12px", fontSize: 19, fontWeight: 700, color: "#F2F5F7" }}>How to withdraw from {name}, step by step</h3>
      <ol style={{ margin: 0, paddingLeft: 22, display: "grid", gap: 10, listStyle: "decimal" }}>
        {t.steps.map((s) => (
          <li key={s.title} style={{ fontSize: 15, lineHeight: 1.65, color: "#C9D3D8" }}>
            <b style={{ color: "#F2F5F7" }}>{s.title}.</b> {s.body}
          </li>
        ))}
      </ol>
      {t.next && <p style={{ margin: "16px 0 0", fontSize: 14, lineHeight: 1.6, color: "#8E9CA4" }}>{t.next}</p>}
    </section>
  );
}
