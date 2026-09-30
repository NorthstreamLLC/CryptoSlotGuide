"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * "Here is what is open to you" — added after the page has rendered, never
 * baked into it.
 *
 * The page HTML is identical for every visitor and every crawler; this asks
 * /api/geo afterwards and draws a band on top. That keeps 949 pages
 * statically generated and keeps us out of cloaking territory, since Googlebot
 * reaches the site almost entirely from US addresses and would otherwise index
 * a version no British reader ever sees.
 *
 * It marks; it does not hide. A visitor sees the whole list either way — the
 * band just says how much of it will actually take them, which for a UK
 * address is one operator in forty-six.
 *
 * Dismissal is remembered per browser. IP geolocation is good at country and
 * unreliable at state or province, and a VPN defeats it outright, so the band
 * says "appears" and offers a way out rather than asserting where someone is.
 */

interface Geo {
  detected: boolean;
  country?: string;
  countryName?: string | null;
  region?: string | null;
  regionName?: string | null;
  casinos?: { total: number; accepts: number; restricted: number; unknown: number };
  regionBlocked?: { slug: string; name: string }[];
  alternatives?: { sweepstakes: number | null; regulatedBrands: number | null };
}

const DISMISS_KEY = "csg-geo-dismissed";
const MONO = "var(--font-jetbrains-mono), monospace";

export function GeoNotice() {
  const [geo, setGeo] = useState<Geo | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    let live = true;
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      // Private mode or blocked storage: show the band rather than fail shut.
    }
    setHidden(false);
    // Carry a ?geo= through from the page URL, so a reader the lookup got
    // wrong (or behind a VPN) can say where they actually are.
    const override = new URLSearchParams(window.location.search).get("geo");
    fetch(`/api/geo${override ? `?geo=${encodeURIComponent(override)}` : ""}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Geo | null) => {
        if (live && d?.detected) setGeo(d);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  if (hidden || !geo?.detected || !geo.casinos) return null;

  const { accepts, total, restricted, unknown } = geo.casinos;
  const where = geo.regionName ?? geo.countryName ?? geo.country;
  const blocked = geo.regionBlocked ?? [];
  const alt = geo.alternatives;

  function dismiss() {
    setHidden(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  }

  return (
    <aside
      style={{
        margin: "0 0 22px",
        padding: "14px 16px",
        borderRadius: 14,
        background: "rgba(95,227,232,.05)",
        border: "1px solid rgba(95,227,232,.22)",
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: "1 1 320px", minWidth: 0 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#5FE3E8", marginBottom: 6 }}>
          You appear to be in {where}
        </div>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, color: "#DCE5E9" }}>
          {accepts === 0 ? (
            <>
              <strong style={{ color: "#fff" }}>None</strong> of the {total} crypto casinos we track publish terms that accept {where}
              {restricted > 0 ? <> — {restricted} name it on their own restricted list</> : null}.
            </>
          ) : (
            <>
              <strong style={{ color: "#fff" }}>
                {accepts} of {total}
              </strong>{" "}
              crypto casinos accept {where}
              {restricted > 0 ? <>; {restricted} refuse it in their own terms</> : null}.
            </>
          )}
          {unknown > 0 && <span style={{ color: "#8DA0AA" }}> {unknown} publish no list we can treat as complete.</span>}
        </p>

        {blocked.length > 0 && (
          <p style={{ margin: "8px 0 0", fontSize: 13.5, lineHeight: 1.55, color: "#E0A98C" }}>
            {blocked.length} take the country but name {geo.regionName} specifically: {blocked.map((b) => b.name).join(", ")}.
          </p>
        )}

        {(alt?.sweepstakes || alt?.regulatedBrands) && (
          <p style={{ margin: "8px 0 0", fontSize: 13.5, lineHeight: 1.55, color: "#A8B6BE" }}>
            Open to you instead:{" "}
            {alt.sweepstakes ? (
              <Link href="/sweepstakes-casinos" style={{ color: "#5FE3E8" }}>
                {alt.sweepstakes} sweepstakes casinos
              </Link>
            ) : null}
            {alt.sweepstakes && alt.regulatedBrands ? ", and " : null}
            {alt.regulatedBrands ? (
              <Link href="/us-casinos" style={{ color: "#5FE3E8" }}>
                {alt.regulatedBrands} licensed {geo.regionName ? `in ${geo.regionName}` : "US"} brands
              </Link>
            ) : null}
            .
          </p>
        )}

        <p style={{ margin: "8px 0 0", fontSize: 12, lineHeight: 1.5, color: "#77858E" }}>
          Worked out from your connection, so a VPN or a mistaken lookup will get it wrong. Nothing is hidden either way — the full list is below.
        </p>
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss location notice"
        style={{
          flex: "0 0 auto",
          padding: "6px 10px",
          borderRadius: 8,
          background: "transparent",
          border: "1px solid rgba(255,255,255,.14)",
          color: "#8DA0AA",
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        Dismiss
      </button>
    </aside>
  );
}
