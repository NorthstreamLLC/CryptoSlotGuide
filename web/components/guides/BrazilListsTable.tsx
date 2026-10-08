import Link from "next/link";
import data from "@/data/brazil-lists-2026-10.json";
import { reviewPath } from "@/lib/outbound";

const MONO = "var(--font-jetbrains-mono), monospace";

const BRAZIL_CSV = "/data/brazil-crypto-casino-restricted-lists-2026-10.csv";

const STATUS: Record<string, { label: string; color: string }> = {
  blocks: { label: "Names Brazil as restricted", color: "#7BE0B8" },
  allows: { label: "Says Brazil is welcome", color: "#F0A77F" },
  "not-listed": { label: "Full list, Brazil not on it", color: "#FFC531" },
  incomplete: { label: "List not complete", color: "#8DA0AA" },
};

type Row = { slug: string; name: string; status: string; checked: string | null; url: string; note: string | null };

/**
 * Every tracked crypto casino's restricted list, read for Brazil after
 * Provisional Measure 1.394. A row is dated only where its page was re-read
 * on that day; the rest carry our earlier reading and say so. Sources are the
 * casinos' own terms or help pages, linked per row; the same table is a CSV.
 */
export function BrazilListsTable() {
  const rows = data.rows as Row[];
  return (
    <section style={{ margin: "8px 0 36px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>All {rows.length} casinos, and what each list says</h2>
        <a href={BRAZIL_CSV} download style={{ fontFamily: MONO, fontSize: 12, color: "#5FE3E8" }}>
          Download CSV ↓
        </a>
      </div>
      <div style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 13, overflow: "hidden" }}>
        {rows.map((r, i) => {
          const st = STATUS[r.status];
          return (
            <div key={r.slug} className="csg-br-row" style={{ display: "grid", gap: 10, alignItems: "center", padding: "10px 14px", fontSize: 13.5, background: i % 2 ? "rgba(255,255,255,.015)" : undefined, borderTop: i ? "1px solid rgba(255,255,255,.05)" : undefined }}>
              <Link href={reviewPath(r.slug)} style={{ fontWeight: 700, color: "#E8EDF0" }}>
                {r.name}
              </Link>
              <span style={{ color: st.color }} title={r.note ?? undefined}>
                {st.label}
                {r.note && <span style={{ display: "block", fontSize: 11.5, color: "#7F8D96" }}>{r.note}</span>}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 11, color: r.checked ? "#B7C4CB" : "#6F7E87" }}>{r.checked ? "Re-read 8 Oct" : "Earlier reading"}</span>
              <a href={r.url} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 11, color: "#5FE3E8" }}>
                Source ↗
              </a>
            </div>
          );
        })}
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 12.5, lineHeight: 1.6, color: "#7F8D96" }}>
        &ldquo;Re-read 8 Oct&rdquo;: we loaded the casino&apos;s own page on 8 October 2026. &ldquo;Earlier reading&rdquo;: the page sits behind a bot check or did not load that day, so the row shows our last reading of it. &ldquo;List not complete&rdquo;: the casino points to a list it does not publish in full, so Brazil&apos;s absence proves nothing.
      </p>
    </section>
  );
}
