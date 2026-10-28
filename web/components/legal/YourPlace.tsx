"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getGeo, type GeoAnswer } from "@/lib/geo-client";

export interface PlaceInfo {
  name: string;
  casino: string;
  sports: string;
  minAge?: string;
  regulator?: string;
  href: string;
  tone: "legal" | "partial" | "grey" | "banned" | "none";
  flag?: string | null;
}

const TONE: Record<PlaceInfo["tone"], { c: string; label: string }> = {
  legal: { c: "#57E39A", label: "Licensed market" },
  partial: { c: "#FFC531", label: "Restricted" },
  grey: { c: "#9FB4C9", label: "Grey area" },
  banned: { c: "#F07A7A", label: "Not legal" },
  none: { c: "#9FB4C9", label: "Not covered yet" },
};

/**
 * The legal hub's answer card: where the visitor appears to be, what the law
 * there says, and how many crypto casinos accept them. Built in the browser
 * from /api/geo so the page HTML is the same for everyone; until the answer
 * arrives (and for anyone it cannot place) it is a country picker.
 */
export function YourPlace({ countries, states, picker, inPages }: { countries: Record<string, PlaceInfo>; states: Record<string, PlaceInfo>; picker: { code: string; name: string }[]; inPages: string[] }) {
  const [geo, setGeo] = useState<(GeoAnswer & { region?: string | null }) | null>(null);
  const [pick, setPick] = useState<string>("");

  useEffect(() => {
    let live = true;
    getGeo().then((g) => live && setGeo(g as GeoAnswer & { region?: string | null }));
    return () => {
      live = false;
    };
  }, []);

  const cc = (pick || (geo?.detected ? geo.country : "") || "").toUpperCase();
  const region = !pick && geo?.region ? geo.region.toUpperCase() : null;
  const place = cc === "US" && region && states[region] ? states[region] : countries[cc];
  const tone = place ? TONE[place.tone] : null;
  const accepts = !pick && geo?.detected && geo.casinos ? geo.casinos.acceptsSlugs.length : null;

  return (
    <div style={{ padding: 24, borderRadius: 20, background: "radial-gradient(120% 90% at 50% 0%, rgba(87,227,154,.12), transparent 60%), #0F1418", border: "1px solid rgba(87,227,154,.38)", boxShadow: "0 30px 70px rgba(0,0,0,.45)" }}>
      {place && tone ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            {place.flag && <img src={place.flag} alt="" width={44} height={30} style={{ borderRadius: 5, objectFit: "cover" }} />}
            <span>
              <span style={{ display: "block", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#57E39A" }}>{pick ? "YOU PICKED" : "YOU APPEAR TO BE IN"}</span>
              <span style={{ display: "block", fontSize: 24, fontWeight: 800, color: "#fff" }}>{place.name}</span>
            </span>
            <span style={{ marginLeft: "auto", padding: "5px 11px", borderRadius: 100, background: `${tone.c}22`, border: `1px solid ${tone.c}66`, color: tone.c, fontSize: 12.5, fontWeight: 800, whiteSpace: "nowrap" }}>{tone.label}</span>
          </div>
          <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
            {[
              ["Online casinos", place.casino],
              ["Sports betting", place.sports],
              ["Minimum age", place.minAge],
              ["Regulator", place.regulator],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "9px 12px", borderRadius: 10, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)" }}>
                  <span style={{ fontSize: 13, color: "#8DA0AA" }}>{k}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#E8EDF0", textAlign: "right" }}>{v}</span>
                </div>
              ))}
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <Link href={place.href} style={{ textAlign: "center", padding: "13px 16px", borderRadius: 12, background: "#57E39A", color: "#04170D", fontSize: 15, fontWeight: 800 }}>
              The full {place.name} guide →
            </Link>
            {accepts !== null && place.tone !== "banned" && (
              <Link href={accepts > 0 && inPages.includes(cc) ? `/crypto-casinos/in/${cc.toLowerCase()}` : "/crypto-casinos"} style={{ textAlign: "center", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,.16)", color: "#fff", fontSize: 14.5, fontWeight: 700 }}>
                {accepts > 0 ? `${accepts} crypto casinos accept ${place.name} →` : "See every crypto casino's restrictions →"}
              </Link>
            )}
          </div>
        </>
      ) : (
        <div style={{ marginBottom: 14 }}>
          <span style={{ display: "block", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#57E39A" }}>CHECK YOUR COUNTRY</span>
          <span style={{ display: "block", fontSize: 22, fontWeight: 800, color: "#fff" }}>{geo === null ? "Finding where you are…" : "Pick your country"}</span>
        </div>
      )}
      <label style={{ display: "block", marginTop: 14, fontSize: 12.5, color: "#8DA0AA" }}>
        {place ? "Somewhere else?" : "Country"}
        <select value={pick} onChange={(e) => setPick(e.target.value)} style={{ display: "block", width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, background: "#0B0F12", border: "1px solid rgba(255,255,255,.14)", color: "#E8EDF0", fontSize: 14 }}>
          <option value="">Choose a country…</option>
          {picker.map((p) => (
            <option key={p.code} value={p.code}>{p.name}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
