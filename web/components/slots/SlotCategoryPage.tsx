import Link from "next/link";
import { siteData, siteCounts } from "@/lib/site-data";
import type { SlotMechanicTag } from "@/lib/types";

/**
 * Ported from the `isSlotCat` block in CryptoSlotGuide.dc.html (search
 * for `SLOT CATEGORY`). Wires /slots/bonus-buy, /slots/megaways,
 * /slots/jackpot, /slots/cluster-pays, /slots/high-volatility.
 */
export function SlotCategoryPage({ tag }: { tag: SlotMechanicTag }) {
  const { slots, slotTags, slotCatDefs } = siteData;
  const cat = slotCatDefs.find((c) => c.tag === tag) ?? slotCatDefs[0];
  const rows = slots
    .filter((s) => (slotTags[s.slug] ?? []).includes(tag))
    .sort((a, b) => b.rtp - a.rtp);

  return (
    <main>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "#0B0F12" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "48px 40px 34px" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 30 }}>
            {slotCatDefs.map((c) => {
              const active = c.tag === tag;
              const count = slots.filter((s) => (slotTags[s.slug] ?? []).includes(c.tag)).length;
              return (
                <Link
                  key={c.tag}
                  href={`/slots/${c.tag}`}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 15px", borderRadius: 100, border: `1px solid ${active ? "rgba(0,194,204,.5)" : "rgba(255,255,255,.12)"}`, background: active ? "rgba(0,194,204,.12)" : "rgba(255,255,255,.02)", fontSize: 13, fontWeight: 600, color: active ? "#5FE3E8" : "#A8B6BE" }}
                >
                  {c.label}
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, color: "#5C6A72" }}>{count}</span>
                </Link>
              );
            })}
          </div>
          <h1 style={{ margin: "0 0 14px", fontSize: 46, lineHeight: 1.03, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "116%", color: "#fff" }}>{cat.label} slots</h1>
          <p style={{ margin: 0, maxWidth: "74ch", fontSize: 16.5, lineHeight: 1.65, color: "#96A6AF", textWrap: "pretty" }}>{cat.standfirst}</p>
        </div>
      </section>

      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "36px 40px 80px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 24, marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: "#5C6A72" }}>
            {rows.length} titles · sorted by published RTP
          </div>
          <Link href="/slots" style={{ fontSize: 14, fontWeight: 600, color: "#00C2CC" }}>All {siteCounts.slots} slots →</Link>
        </div>
        <div style={{ display: "grid", minWidth: 0, gridTemplateColumns: "repeat(auto-fit,minmax(292px,1fr))", gap: 12 }}>
          {rows.map((s) => {
            const otherTags = (slotTags[s.slug] ?? []).filter((t) => t !== tag);
            return (
              <Link
                key={s.slug}
                href={`/slots/${s.slug}`}
                style={{ position: "relative", display: "flex", flexDirection: "column", padding: 20, borderRadius: 14, background: "rgba(12,16,19,.7)", border: "1px solid rgba(255,255,255,.07)", overflow: "hidden" }}
              >
                <span style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${s.tint},transparent)` }} />
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, flex: "none", borderRadius: 9, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: s.tint }}>
                    {s.mono}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-.02em", color: "#fff" }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: "#7B8A93", marginTop: 2 }}>{s.provider}</div>
                  </div>
                  <span style={{ marginLeft: "auto", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 15, color: "#fff" }}>{s.rtp.toFixed(2)}%</span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                  {otherTags.map((t) => (
                    <span key={t} style={{ padding: "4px 9px", borderRadius: 100, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, letterSpacing: ".05em", color: "#8DA0AA" }}>
                      {t}
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: "auto", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, paddingTop: 13, borderTop: "1px solid rgba(255,255,255,.07)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#5C6A72" }}>
                  <span>{s.vol} · {s.maxWin}</span>
                  <span style={{ color: "#9AAAB3" }}>best at {s.bestAt}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
