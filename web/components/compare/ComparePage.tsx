"use client";

import Link from "next/link";
import { useState } from "react";
import { siteData } from "@/lib/site-data";
import { getCompareRows } from "@/lib/compare-view";
import { logoFor } from "@/lib/casino-index";

/**
 * Ported from the `isCompare` block in CryptoSlotGuide.dc.html (search
 * for `COMPARE BUILDER`). Chips toggle selection, capped at 4, floored
 * at 2, exactly matching the source's state logic.
 */
export function ComparePage() {
  const { ops, coinsBy } = siteData;
  const [picked, setPicked] = useState<string[]>(["roobet", "stake"]);

  const cmpOps = picked.map((slug) => ops.find((o) => o.slug === slug)).filter((o): o is (typeof ops)[number] => Boolean(o));
  const rows = getCompareRows(cmpOps, coinsBy);

  function toggle(slug: string) {
    setPicked((cur) => {
      if (cur.includes(slug)) return cur.filter((s) => s !== slug);
      if (cur.length >= 4) return cur;
      return [...cur, slug];
    });
  }

  return (
    <main>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(110% 100% at 20% 0%, rgba(0,194,204,.09), transparent 58%), #090C0F" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "48px 40px 36px" }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 16 }}>
            Compare builder
          </div>
          <h1 style={{ margin: "0 0 14px", fontSize: 50, lineHeight: 1.02, letterSpacing: "-.038em", fontWeight: 800, fontStretch: "116%", color: "#fff" }}>
            Build your own head to head
          </h1>
          <p style={{ margin: "0 0 26px", maxWidth: "70ch", fontSize: 16.5, lineHeight: 1.65, color: "#93A3AC", textWrap: "pretty" }}>
            Pick up to four operators and we&apos;ll generate the comparison from the same measurements every review uses. Winners are marked per row; ties are marked as ties rather than resolved.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
            <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#5C6A72" }}>{picked.length} of 4 selected</span>
            <button
              type="button"
              onClick={() => setPicked(["roobet", "stake"])}
              className="hover:!border-white/30 hover:!text-white"
              style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,.12)", background: "transparent", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".05em", textTransform: "uppercase", color: "#A8B6BE" }}
            >
              reset
            </button>
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {ops.map((o) => {
              const on = picked.includes(o.slug);
              return (
                <button
                  key={o.slug}
                  type="button"
                  onClick={() => toggle(o.slug)}
                  style={{ padding: "8px 14px", borderRadius: 100, border: `1px solid ${on ? "rgba(0,194,204,.5)" : "rgba(255,255,255,.12)"}`, background: on ? "rgba(0,194,204,.12)" : "rgba(255,255,255,.02)", fontSize: 12.5, fontWeight: 600, color: on ? "#5FE3E8" : "#A8B6BE", whiteSpace: "nowrap" }}
                >
                  {o.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 40px 84px" }}>
        {cmpOps.length < 2 ? (
          <div style={{ padding: 40, borderRadius: 14, background: "#0C1013", border: "1px dashed rgba(255,255,255,.14)", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#DCE5E9", marginBottom: 6 }}>Pick at least two operators</div>
            <div style={{ fontSize: 14, color: "#7B8A93" }}>Select any two above and the comparison builds itself.</div>
          </div>
        ) : (
          <>
            <div style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflowX: "auto", background: "#0C1013", boxShadow: "0 12px 40px rgba(0,0,0,.35)" }}>
              <div style={{ display: "flex", minWidth: 760, borderBottom: "1px solid rgba(255,255,255,.07)", background: "#101519" }}>
                <div style={{ width: 230, flex: "none", padding: "16px 18px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".07em", textTransform: "uppercase", color: "#5C6A72" }}>
                  Criterion
                </div>
                {cmpOps.map((o) => (
                  <div key={o.slug} style={{ flex: 1, minWidth: 150, padding: "14px 18px", borderLeft: "1px solid rgba(255,255,255,.06)" }}>
                    <div style={{ width: 64, height: 26, marginBottom: 8, display: "flex", alignItems: "center" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoFor(o.slug)} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                    </div>
                    <Link href={o.hasCustomReview ? "/casinos/roobet" : `/casinos/${o.slug}`} className="hover:!text-accent" style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#fff" }}>
                      {o.name}
                    </Link>
                    <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#5C6A72", marginTop: 2 }}>score {o.score.toFixed(1)}</div>
                  </div>
                ))}
              </div>
              {rows.map((r) => (
                <div key={r.label} style={{ display: "flex", minWidth: 760, borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                  <div style={{ width: 230, flex: "none", padding: "15px 18px", fontSize: 13.5, fontWeight: 600, color: "#B7C4CB" }}>{r.label}</div>
                  {r.cells.map((c, i) => (
                    <div key={i} style={{ flex: 1, minWidth: 150, padding: "15px 18px", borderLeft: "1px solid rgba(255,255,255,.05)", background: c.bg, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: c.color, fontWeight: Number(c.weight) }}>
                      {c.v}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <p style={{ margin: "18px 0 0", maxWidth: "88ch", fontSize: 13.5, lineHeight: 1.65, color: "#6E7F88", textWrap: "pretty" }}>
              Lower is better on withdrawal time, wagering and confirmations; higher is better on score and coin count. Licence and headline offer are stated without a winner because neither is comparable on a single axis.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
