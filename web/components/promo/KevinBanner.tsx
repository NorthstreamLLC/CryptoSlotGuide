"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getGeo } from "@/lib/geo-client";
import { kevinBlocked, kevinLive, KEVIN_PATH } from "@/lib/kevin-promo";

/**
 * Homepage banner for Pragmatic Play's Kevin Hart campaign. Rendered in the
 * page HTML for everyone, then removed in the browser where the promotion is
 * not offered, and after it ends, so a stale build never keeps it up.
 */
export function KevinBanner({ visit }: { visit: string }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!kevinLive()) return setHidden(true);
    let live = true;
    getGeo().then((g) => {
      const r = g as (typeof g & { region?: string | null }) | null;
      if (live && r?.detected && kevinBlocked(r.country, r.region, r.casinos?.restrictedSlugs)) setHidden(true);
    });
    return () => {
      live = false;
    };
  }, []);

  if (hidden) return null;
  return (
    <section style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 40px 0" }} className="csg-kevin">
      <Link href={KEVIN_PATH} aria-label="Play with Kevin: Pragmatic Play x Kevin Hart, $1,250,000 prize pool" style={{ display: "block", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,197,49,.35)", boxShadow: "0 24px 60px rgba(0,0,0,.45)" }}>
        <picture>
          <source media="(max-width: 700px)" srcSet="/assets/promos/play-with-kevin-mobile.webp" />
          <img src="/assets/promos/play-with-kevin-1920x600.webp" alt="Pragmatic Play x Kevin Hart: Play with Kevin, 19 October to 7 November 2026, $1,250,000" width={1920} height={600} style={{ display: "block", width: "100%", height: "auto" }} />
        </picture>
      </Link>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, justifyContent: "space-between", marginTop: 12 }}>
        <p style={{ margin: 0, fontSize: 14, color: "#B7C4CB", maxWidth: "70ch" }}>
          <strong style={{ color: "#fff" }}>$1.25M prize pool</strong> in Pragmatic Play games until 7 November. Nothing to opt into, and chip winnings are paid as cash with no wagering.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href={visit} target="_blank" rel="nofollow sponsored noopener" style={{ padding: "11px 18px", borderRadius: 11, background: "linear-gradient(180deg,#FFD866,#FFC531)", color: "#141007", fontSize: 14, fontWeight: 800 }}>
            Play at Roobet ↗
          </a>
          <Link href={KEVIN_PATH} style={{ padding: "11px 18px", borderRadius: 11, border: "1px solid rgba(255,255,255,.18)", color: "#fff", fontSize: 14, fontWeight: 700 }}>
            How it works
          </Link>
        </div>
      </div>
      <p style={{ margin: "8px 0 0", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, color: "#7F8D96" }}>
        Ad · Affiliate link: we may earn a commission. Not available in the UK, US, Ontario and other excluded markets. 18+ · T&amp;Cs apply.
      </p>
    </section>
  );
}
