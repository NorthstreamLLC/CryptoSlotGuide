"use client";

import { useRef, useState, type ReactNode } from "react";

export interface HoverInfo {
  name: string;
  rows: { label: string; value: string; color: string }[];
  /** Casinos available here, shown as logo chips. */
  casinos?: { name: string; logo: string | null }[];
  casinosTitle?: string;
  casinosNote?: string;
  /** Hide the click-through line where regions do not link anywhere. */
  noLink?: boolean;
}

const MONO = "var(--font-jetbrains-mono), monospace";

/**
 * Wraps a server-rendered map and shows a hover card for whichever region
 * (an element with data-code) is under the pointer. The map itself stays
 * plain links, so it still works without JavaScript and by keyboard.
 */
export function MapHover({ info, children }: { info: Record<string, HoverInfo>; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ code: string; x: number; y: number } | null>(null);

  function move(e: React.PointerEvent) {
    if (e.pointerType === "touch") return;
    const el = (e.target as Element).closest("[data-code]");
    const code = el?.getAttribute("data-code");
    if (!code || !info[code] || !box.current) return setHover(null);
    const r = box.current.getBoundingClientRect();
    setHover({ code, x: e.clientX - r.left, y: e.clientY - r.top });
  }

  /** Clear only when the pointer is really outside the map; re-renders can fire a spurious leave. */
  function leave(e: React.PointerEvent) {
    const r = box.current?.getBoundingClientRect();
    if (r && e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) return;
    setHover(null);
  }

  const it = hover ? info[hover.code] : null;
  const w = box.current?.clientWidth ?? 800;
  const left = hover ? Math.min(Math.max(hover.x + 16, 8), w - 290) : 0;

  return (
    <div ref={box} onPointerMove={move} onPointerLeave={leave} style={{ position: "relative" }}>
      {children}
      {it && hover && (
        <div role="status" style={{ position: "absolute", left, top: hover.y + 16, width: 280, zIndex: 20, pointerEvents: "none", padding: "14px 16px", borderRadius: 14, background: "rgba(10,13,16,.97)", border: "1px solid rgba(255,255,255,.14)", boxShadow: "0 18px 40px rgba(0,0,0,.55)" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{it.name}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {it.rows.map((r) => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12.5 }}>
                <span style={{ color: "#8DA0AA" }}>{r.label}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, color: "#E8EDF0", textAlign: "right", textTransform: "capitalize" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 100, background: r.color, flex: "none" }} />
                  {r.value}
                </span>
              </div>
            ))}
          </div>
          {it.casinosTitle && (
            <div style={{ marginTop: 11, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".07em", textTransform: "uppercase", color: "#6E7F88", marginBottom: 7 }}>{it.casinosTitle}</div>
              {it.casinos && it.casinos.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {it.casinos.slice(0, 12).map((c) => (
                    <span key={c.name} title={c.name} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 7px 3px 3px", borderRadius: 100, background: "rgba(255,255,255,.05)", fontSize: 11, color: "#C6D1D7" }}>
                      {c.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.logo} alt="" width={16} height={16} style={{ borderRadius: 4 }} />
                      ) : (
                        <span style={{ width: 16, height: 16, borderRadius: 4, background: "#2A3439" }} />
                      )}
                      {c.name}
                    </span>
                  ))}
                  {it.casinos.length > 12 && <span style={{ fontSize: 11, color: "#8DA0AA", alignSelf: "center" }}>+{it.casinos.length - 12} more</span>}
                </div>
              ) : (
                <div style={{ fontSize: 12.5, color: "#DA9877" }}>{it.casinosNote ?? "None available"}</div>
              )}
            </div>
          )}
          {!it.noLink && <div style={{ marginTop: 10, fontSize: 11.5, fontWeight: 700, color: "#00C2CC" }}>Click for the full picture →</div>}
        </div>
      )}
    </div>
  );
}
