import Link from "next/link";
import type { topSlotRows } from "@/lib/slot-page";

type Row = ReturnType<typeof topSlotRows>[number];
const MONO = "var(--font-jetbrains-mono), monospace";

/** Slots as art cards: the tile, our rank, and the studio's published figures. */
export function SlotArtCards({ rows, showRank = true }: { rows: Row[]; showRank?: boolean }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4" style={{ minWidth: 0, gap: 12 }}>
      {rows.map((r) => (
        <Link key={r.slug} href={`/slots/${r.slug}`} className="csg-lift group" style={{ display: "flex", flexDirection: "column", borderRadius: 14, overflow: "hidden", background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
          <span style={{ position: "relative", display: "block", aspectRatio: "16 / 10", background: "#11161A", overflow: "hidden" }}>
            {r.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.image} alt={r.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .4s ease" }} className="group-hover:scale-[1.04]" />
            )}
            {showRank && (
              <span style={{ position: "absolute", top: 10, right: 10, padding: "4px 8px", borderRadius: 7, background: "rgba(7,9,11,.78)", fontFamily: MONO, fontSize: 11, fontWeight: 700, color: r.rank <= 3 ? "#FFC531" : "#DCE5E9" }}>#{r.rank}</span>
            )}
          </span>
          <span style={{ display: "flex", flexDirection: "column", gap: 4, padding: "14px 16px 16px" }}>
            <span style={{ fontSize: 15.5, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</span>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: "#83919A" }}>{r.provider}</span>
            <span style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8, fontFamily: MONO, fontSize: 11 }}>
              <span style={{ padding: "3px 7px", borderRadius: 6, background: "rgba(87,227,154,.1)", color: "#57E39A" }}>{r.rtp} RTP</span>
              <span style={{ padding: "3px 7px", borderRadius: 6, background: "rgba(255,255,255,.05)", color: "#C3CFD5" }}>{r.maxWin} max</span>
              <span style={{ padding: "3px 7px", borderRadius: 6, background: "rgba(255,255,255,.05)", color: "#C3CFD5" }}>{r.volatility}</span>
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
