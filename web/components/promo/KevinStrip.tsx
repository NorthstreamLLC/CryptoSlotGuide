"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { getGeo } from "@/lib/geo-client";
import { kevinBlocked, kevinLive, KEVIN_PATH } from "@/lib/kevin-promo";

/**
 * The Kevin Hart promotion as a one-line homepage strip. Same rules as
 * KevinCard: removed where the promotion or Roobet isn't available and after
 * the campaign ends, with `fallback` in its place.
 */
export function KevinStrip({ fallback = null, className, style }: { fallback?: ReactNode; className?: string; style?: CSSProperties }) {
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

  if (hidden) return <>{fallback}</>;
  return (
    <Link href={KEVIN_PATH} className={className} style={style}>
      <span className="csg-strip-tag">Live until 7 Nov</span>
      <span className="csg-strip-text">
        <strong>Play with Kevin Hart</strong> — a $1.25M prize pool from Pragmatic Play at Roobet.
      </span>
      <span className="csg-strip-cta">How it works →</span>
    </Link>
  );
}
