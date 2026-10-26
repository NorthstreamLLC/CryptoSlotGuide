"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getGeo } from "@/lib/geo-client";
import { kevinBlocked, kevinLive, KEVIN_PATH } from "@/lib/kevin-promo";

/**
 * The Kevin Hart promotion as a homepage card. Same rules as KevinBanner:
 * in the HTML for everyone, then removed where the promotion or Roobet is
 * not available, and after the campaign ends.
 */
export function KevinCard() {
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
    <Link href={KEVIN_PATH} className="csg-lift csg-home-card" style={{ display: "flex", flexDirection: "column", borderRadius: 18, overflow: "hidden", background: "#0F1418", border: "1px solid rgba(255,255,255,.1)" }}>
      <span style={{ display: "block", overflow: "hidden" }}>
        <picture>
          <source media="(max-width: 700px)" srcSet="/assets/promos/play-with-kevin-mobile.webp" />
          <img className="csg-zoom" src="/assets/promos/play-with-kevin-1920x600.webp" alt="Pragmatic Play x Kevin Hart: $1,250,000 prize pool" width={1920} height={600} style={{ display: "block", width: "100%", height: "auto" }} />
        </picture>
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 8, padding: "18px 22px 22px" }}>
        <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#FFC531" }}>LIVE PROMO · UNTIL 7 NOV</span>
        <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Play with Kevin Hart: $1.25M prize pool</span>
        <span style={{ fontSize: 14.5, lineHeight: 1.5, color: "#A8B6BE" }}>Earn Free Chips as you play, then use them on Kevin&apos;s Picks. Kevin goes live 6–7 November.</span>
        <span style={{ fontSize: 14.5, fontWeight: 700, color: "#FFC531" }}>How it works →</span>
      </span>
    </Link>
  );
}
