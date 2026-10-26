"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getGeo, type GeoAnswer } from "@/lib/geo-client";

/**
 * Under an offer: if the casino's own terms refuse players from where the
 * visitor appears to be, say so before they click, and point to what is open
 * to them instead. Nothing is hidden and nothing renders for anyone else, so
 * the page reads the same to crawlers and to visitors the casino accepts.
 */
export function GeoBlockNote({ slug, name, compact = false }: { slug: string; name: string; compact?: boolean }) {
  const [geo, setGeo] = useState<GeoAnswer | null>(null);

  useEffect(() => {
    let live = true;
    getGeo().then((g) => live && setGeo(g));
    return () => {
      live = false;
    };
  }, []);

  if (!geo?.detected || !geo.casinos?.restrictedSlugs.includes(slug)) return null;
  const raw = geo.countryName ?? geo.country ?? "your country";
  const where = /^(United |Netherlands|Philippines|Czech Republic)/.test(raw) ? `the ${raw}` : raw;
  const isUS = geo.country === "US";
  const sweeps = geo.alternatives?.sweepstakes;
  const region = (geo as GeoAnswer & { region?: string | null; regionName?: string | null }).region;
  const regionName = (geo as GeoAnswer & { regionName?: string | null }).regionName;
  // A state that bars sweepstakes casinos too gets its own law page, not "0 sweepstakes casinos".
  const alt = isUS
    ? sweeps === 0
      ? { href: region ? `/legal/us/${region.toLowerCase()}` : "/legal", label: `See what's legal in ${regionName ?? "your state"}` }
      : { href: "/sweepstakes-casinos", label: sweeps ? `See the ${sweeps} sweepstakes casinos open in the US` : "See the sweepstakes casinos open in the US" }
    : geo.casinos.acceptsSlugs.length
    ? { href: `/crypto-casinos/in/${(geo.country ?? "").toLowerCase()}`, label: geo.casinos.acceptsSlugs.length === 1 ? `See the one crypto casino that accepts ${where}` : `See the ${geo.casinos.acceptsSlugs.length} crypto casinos that accept ${where}` }
    : { href: "/legal", label: `See what's legal in ${where}` };

  return (
    <div
      role="note"
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        marginTop: compact ? 8 : 10,
        padding: compact ? "8px 10px" : "10px 12px",
        borderRadius: 10,
        background: "rgba(224,90,90,.1)",
        border: "1px solid rgba(224,90,90,.35)",
        fontSize: compact ? 12 : 13,
        lineHeight: 1.45,
        color: "#F1C9C9",
        textAlign: "left",
      }}
    >
      <span aria-hidden>⚠</span>
      <span>
        {name}&apos;s terms don&apos;t accept players from {where}, where you appear to be.{" "}
        <Link href={alt.href} style={{ color: "#fff", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 2 }}>
          {alt.label} →
        </Link>
      </span>
    </div>
  );
}
