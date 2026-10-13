"use client";

import { useEffect, useState } from "react";
import vip from "@/data/vip.json";
import { BrandMark } from "@/components/ui/BrandMark";

function TelegramIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff" aria-hidden>
      <path d="M21.9 4.3 18.6 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.2-8.3c.4-.4-.1-.6-.6-.2L6 13.5l-4.9-1.5c-1.1-.3-1.1-1.1.2-1.6L20.6 3c.9-.3 1.7.2 1.3 1.3z" />
    </svg>
  );
}

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
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 13, marginBottom: 12, background: "linear-gradient(140deg, #3FB6F0, #1B7FC0)", boxShadow: "0 10px 24px rgba(34,158,217,.35)" }}>
          {/* diamond */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" aria-hidden>
            <path d="M6 3h12l4 6-10 12L2 9z" />
            <path d="M2 9h20M9 3l3 18 3-18" strokeOpacity=".7" />
          </svg>
        </span>
        <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "#7CC8EE", marginBottom: 6 }}>{vip.name} · VIP</div>
        <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", lineHeight: 1.2, letterSpacing: "-.02em", marginBottom: 8 }}>Our exclusive VIP team</div>
        <p style={{ margin: "0 0 14px", fontSize: 13.5, lineHeight: 1.5, color: "#B7C4CB" }}>For players looking for exclusive rewards. Already VIP somewhere else? Our hosts can transfer your VIP status to Roobet. New to Roobet? Join with code {vip.code ?? "ELITE"}.</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginBottom: 14, borderRadius: 10, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
          <span style={{ width: 24, height: 24, flex: "none", borderRadius: 7, overflow: "hidden" }}>
            <BrandMark slug={vip.partner} mono="RB" tint="#FFC531" radius={7} fontSize={9} />
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#E8EDF0" }}>VIP transfers welcome</span>
        </div>
        <a href={telegram} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 10px", borderRadius: 11, background: "#229ED9", color: "#fff", fontSize: 13.5, fontWeight: 800, whiteSpace: "nowrap", boxShadow: "0 10px 24px rgba(34,158,217,.3)" }}>
          <TelegramIcon />
          Message on Telegram
        </a>
      </div>
      {/* Narrower screens: a small pill in the corner. */}
      <div className="csg-vip-pill">
        <a href={telegram} target="_blank" rel="noopener noreferrer">
          <span className="csg-vip-pill-ico"><TelegramIcon /></span>
          <span>
            <span style={{ display: "block", fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#7CC8EE" }}>{vip.name} · VIP</span>
            Exclusive VIP rewards →
          </span>
        </a>
        <button type="button" onClick={close} aria-label="Close">×</button>
      </div>
    </aside>
  );
}
