import Link from "next/link";

const MONO = "var(--font-jetbrains-mono), monospace";

export interface NextStep {
  href: string;
  label: string;
  hint: string;
}

/**
 * The band every page ends on, so no page is a dead end: three or four
 * links to the obvious next thing, each with one line saying what is there.
 * Pages pass their own steps — nothing here is generated, so a link only
 * ships where the page it points at really covers the next question.
 */
export function NextSteps({ steps, title = "Where to next" }: { steps: NextStep[]; title?: string }) {
  const list = steps.filter((s) => s.href && s.label);
  if (list.length === 0) return null;
  return (
    <section style={{ marginTop: 44 }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 12 }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        {list.map((s) => (
          <Link
            key={s.href + s.label}
            href={s.href}
            className="transition-colors hover:border-white/20 hover:bg-white/[0.03]"
            style={{ display: "flex", flexDirection: "column", gap: 6, padding: "18px 20px", borderRadius: 16, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}
          >
            <span style={{ fontSize: 15.5, fontWeight: 800, letterSpacing: "-.015em", color: "#fff" }}>
              {s.label} <span aria-hidden style={{ color: "#00C2CC" }}>→</span>
            </span>
            <span style={{ fontSize: 13, lineHeight: 1.5, color: "#8DA0AA" }}>{s.hint}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
