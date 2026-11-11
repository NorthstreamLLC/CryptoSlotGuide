"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getGeo } from "@/lib/geo-client";
import { wheelWarsLive, WHEEL_WARS_PATH } from "@/lib/stake-wheel-wars";

/**
 * Stake Wheel Wars as a one-line homepage strip. Hidden once the promotion
 * ends, and where Stake turns players away: its restricted countries and the
 * regions it names inside a country it otherwise takes (Ontario), via /api/geo.
 */
export function StakeWheelStrip({ className }: { className?: string }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let live = true;
    // After the end date the strip hides itself even before a rebuild drops it.
    Promise.resolve().then(() => {
      if (live && !wheelWarsLive()) setHidden(true);
    });
    getGeo().then((g) => {
      if (live && g?.detected && (g.casinos?.restrictedSlugs?.includes("stake") || g.regionBlocked?.some((r) => r.slug === "stake"))) setHidden(true);
    });
    return () => {
      live = false;
    };
  }, []);

  if (hidden) return null;
  return (
    <Link href={WHEEL_WARS_PATH} className={className}>
      <span className="csg-strip-tag">At Stake until 2 Jan</span>
      <span className="csg-strip-text">
        <strong>Stake Wheel Wars</strong> — $150,000 a month in Pragmatic Play prizes: wheel drops up to 2,000× and a Saturday tournament.
      </span>
      <span className="csg-strip-cta">How it works →</span>
    </Link>
  );
}
