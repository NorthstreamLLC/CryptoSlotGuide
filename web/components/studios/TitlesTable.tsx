import Link from "next/link";
import { thumbOf } from "@/lib/thumb";
import type { TableRow } from "@/lib/entity-view";

const MONO = "var(--font-jetbrains-mono), monospace";

/** A studio's titles as table rows: the shared body of the studio page and its numbered title pages. */
export function TitlesTable({ rows, cols = ["Slot", "RTP", "Volatility", "Max win"] }: { rows: TableRow[]; cols?: string[] }) {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 13, overflowX: "auto", background: "#0C1013" }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(260px,1.6fr) 150px 130px 120px", minWidth: 680, background: "#101519", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
        {cols.map((h) => (
          <div key={h} style={{ padding: "12px 18px", fontFamily: MONO, fontSize: 10.5, letterSpacing: ".07em", textTransform: "uppercase", color: "#83919A" }}>{h}</div>
        ))}
      </div>
      {rows.map((r, i) => (
        <div key={`${r.name}-${i}`} className="csg-trow csg-trow-c">
          <div className="csg-tc-main">
            {r.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbOf(r.image)} alt="" width={52} height={31} loading="lazy" className="csg-tc-img" />
            )}
            <div className="csg-tc-text">
              <div className="csg-tc-name">
                {r.href ? (
                  /^https?:\/\//.test(r.href) ? (
                    <a href={r.href} target="_blank" rel="noopener">{r.name}</a>
                  ) : (
                    <Link href={r.href}>{r.name}</Link>
                  )
                ) : (
                  r.name
                )}
                {r.href && r.hrefLabel && (
                  <span className="csg-tc-tag">
                    {r.hrefLabel}{/^https?:\/\//.test(r.href) ? " ↗" : " →"}
                  </span>
                )}
              </div>
              <div className="csg-tc-note">{r.note}</div>
            </div>
          </div>
          <div className="csg-tc-num">{r.m1}</div>
          <div className="csg-tc-num">{r.m2}</div>
          <div className="csg-tc-num">{r.m3}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * Page numbers under a studio's titles. Page 1 is the studio page itself;
 * pages 2 onwards are /providers/<slug>/titles/<n>, each a light page of its
 * own, so nobody scrolls (or downloads) six hundred rows to reach one.
 */
export function TitlesPager({ slug, total, page, perPage }: { slug: string; total: number; page: number; perPage: number }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  const href = (n: number) => (n === 1 ? `/providers/${slug}#titles` : `/providers/${slug}/titles/${n}`);
  const near = new Set([1, pages, page - 2, page - 1, page, page + 1, page + 2].filter((n) => n >= 1 && n <= pages));
  const list = [...near].sort((a, b) => a - b);
  const from = (page - 1) * perPage + 1;
  const to = Math.min(total, page * perPage);
  const btn = (active: boolean) => ({
    minWidth: 38,
    padding: "8px 11px",
    borderRadius: 9,
    textAlign: "center" as const,
    fontFamily: MONO,
    fontSize: 12.5,
    border: `1px solid ${active ? "rgba(0,194,204,.5)" : "rgba(255,255,255,.12)"}`,
    background: active ? "rgba(0,194,204,.12)" : "transparent",
    color: active ? "#5FE3E8" : "#C3CFD5",
  });
  return (
    <nav aria-label="Title pages" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", margin: "14px 0 0" }}>
      <span style={{ fontFamily: MONO, fontSize: 11.5, color: "#83919A", marginRight: 6 }}>
        {from}–{to} of {total.toLocaleString("en-GB")}
      </span>
      {page > 1 && (
        <Link href={href(page - 1)} style={btn(false)}>
          ← Prev
        </Link>
      )}
      {list.map((n, i) => (
        <span key={n} style={{ display: "contents" }}>
          {i > 0 && n - list[i - 1] > 1 && <span style={{ color: "#5D6B73" }}>…</span>}
          <Link href={href(n)} aria-current={n === page ? "page" : undefined} style={btn(n === page)}>
            {n}
          </Link>
        </span>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} style={btn(false)}>
          Next →
        </Link>
      )}
    </nav>
  );
}
