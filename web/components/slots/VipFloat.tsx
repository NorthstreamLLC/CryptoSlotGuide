"use client";

import { useEffect, useState } from "react";
import vip from "@/data/vip.json";

const KEY = "csg-vip-float-closed";

/**
 * Our VIP team, CasinoPerks, as a small card at the side of slot pages.
 * Renders only once data/vip.json holds the team's Telegram link. Closing it
 * keeps it closed for that reader (localStorage, best effort); it appears a
 * moment after load so it never covers the hero as the page paints.
 */
export function VipFloat() {
  const telegram = vip.telegram as string | null;
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!telegram) return;
    let closed = false;
    try {
      closed = localStorage.getItem(KEY) === "1";
    } catch {
      /* storage blocked */
    }
    if (closed) return;
    const t = setTimeout(() => setShow(true), 2500);
    return () => clearTimeout(t);
  }, [telegram]);

  if (!telegram || !show) return null;

  const close = () => {
    setShow(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* storage blocked */
    }
  };

  return (
    <aside aria-label={`${vip.name} VIP team`} className="csg-vip">
      {/* Wide screens: a slim card in the page's right margin, clear of the content. */}
      <div className="csg-vip-rail">
        <button type="button" onClick={close} aria-label="Close" className="csg-vip-x">×</button>
        <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9, letterSpacing: ".08em", textTransform: "uppercase", color: "#7CC8EE", marginBottom: 6 }}>{vip.name}</div>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: 6 }}>Looking for an exclusive VIP host?</div>
        <p style={{ margin: "0 0 10px", fontSize: 11.5, lineHeight: 1.45, color: "#A8B6BE" }}>Our own VIP team, for players who join Roobet through us.</p>
        <a href={telegram} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", padding: "8px 10px", borderRadius: 9, background: "#229ED9", color: "#fff", fontSize: 12.5, fontWeight: 800 }}>
          Telegram →
        </a>
      </div>
      {/* Narrower screens: a small pill in the corner. */}
      <div className="csg-vip-pill">
        <a href={telegram} target="_blank" rel="noopener noreferrer">
          <span style={{ color: "#7CC8EE" }}>VIP host?</span> Message {vip.name} →
        </a>
        <button type="button" onClick={close} aria-label="Close">×</button>
      </div>
    </aside>
  );
}
