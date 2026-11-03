"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getGeo, type GeoAnswer } from "@/lib/geo-client";

/**
 * GeoBlockNote for a whole list: one line naming the casinos in it whose own
 * terms refuse players from where the visitor appears to be, instead of the
 * same warning repeated under every row. Renders nothing for anyone else.
 */
export function GeoListNote({ casinos }: { casinos: { slug: string; name: string }[] }) {
  const [geo, setGeo] = useState<GeoAnswer | null>(null);

  useEffect(() => {
    let live = true;
    getGeo().then((g) => live && setGeo(g));
    return () => {
      live = false;
    };
  }, []);

  if (!geo?.detected) return null;
  const blocked = casinos.filter((c) => geo.casinos?.restrictedSlugs.includes(c.slug)).map((c) => c.name);
  if (blocked.length === 0) return null;
  const raw = geo.countryName ?? geo.country ?? "your country";
  const where = /^(United |Netherlands|Philippines|Czech Republic)/.test(raw) ? `the ${raw}` : raw;
  const names = blocked.length === casinos.length ? "None of these casinos accept" : blocked.length === 1 ? `${blocked[0]}'s terms don't accept` : `${blocked.slice(0, -1).join(", ")} and ${blocked[blocked.length - 1]} don't accept`;
  const isUS = geo.country === "US";
  const alt = isUS
    ? { href: "/sweepstakes-casinos", label: "Sweepstakes casinos open in the US" }
    : geo.casinos?.acceptsSlugs.length
    ? { href: `/crypto-casinos/in/${(geo.country ?? "").toLowerCase()}`, label: `Casinos that accept ${where}` }
    : { href: "/legal", label: `What's legal in ${where}` };

  return (
    <div role="note" className="csg-geo-list" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 12px", padding: "11px 16px", borderBottom: "1px solid rgba(255,255,255,.07)", background: "rgba(224,90,90,.07)", fontSize: 13.5, lineHeight: 1.45, color: "#E9C3C3" }}>
      <span>
        {names} players from {where}, where you appear to be.
      </span>
      <Link href={alt.href} style={{ color: "#fff", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>
        {alt.label} →
      </Link>
    </div>
  );
}
