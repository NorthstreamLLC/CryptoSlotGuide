"use client";

import { useMemo, useState } from "react";
import type { FiatBrand } from "@/lib/fiat";
import { FiatBrandCard } from "@/components/fiat/FiatSiteCard";

/**
 * A market's brands with a search box. The UK register alone is 900 sites;
 * a reader looking for one name should type it, not scroll. Every card is in
 * the server-rendered HTML, so search engines and no-JS readers see the full
 * list; the box only hides what doesn't match.
 */
const MONO = "var(--font-jetbrains-mono), monospace";
const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");

export function FiatBrandGrid({ brands, marketName }: { brands: FiatBrand[]; marketName: string }) {
  const [q, setQ] = useState("");
  const index = useMemo(() => brands.map((b) => norm([b.name, ...b.domains, ...b.holders].join(" "))), [brands]);
  const needle = norm(q);
  const visible = needle ? brands.filter((_, i) => index[i].includes(needle)) : brands;
  const shown = new Set(visible);

  return (
    <>
      {/* A search box over a handful of cards is noise. */}
      {brands.length >= 8 && (
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <label htmlFor="fiat-search" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          Search licensed sites in {marketName}
        </label>
        <input
          id="fiat-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${brands.length} brands — name, web address or company`}
          autoComplete="off"
          style={{ flex: "1 1 320px", maxWidth: 520, padding: "11px 14px", borderRadius: 10, background: "#0C1013", border: "1px solid rgba(255,255,255,.14)", color: "#E8EDF0", fontSize: 14.5, outlineColor: "#00C2CC" }}
        />
        {needle && (
          <span style={{ fontFamily: MONO, fontSize: 11.5, color: "#83919A" }} aria-live="polite">
            {visible.length} of {brands.length}
          </span>
        )}
      </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 10 }}>
        {brands.map((b) => (
          <div key={b.id} style={{ display: shown.has(b) ? "contents" : "none" }}>
            <FiatBrandCard brand={b} />
          </div>
        ))}
      </div>
      {needle && visible.length === 0 && (
        <p style={{ margin: "14px 0 0", fontSize: 14, color: "#8DA0AA" }}>
          No licensed site in {marketName} matches &ldquo;{q}&rdquo;. A brand missing here does not hold a licence on this register.
        </p>
      )}
    </>
  );
}
