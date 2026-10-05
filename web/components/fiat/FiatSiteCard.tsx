import type { FiatBrand } from "@/lib/fiat";

/**
 * One licensed brand: its own icon, the name, every web address the register
 * lists for it, the company holding the licence, what the licence covers,
 * and a link to the site itself.
 *
 * The link is nofollow until we hold an affiliate link for the brand — it
 * is a reference to a site the regulator lists, not an endorsement.
 */
const MONO = "var(--font-jetbrains-mono), monospace";
const PRODUCT_LABEL = { casino: "Casino", sports: "Sportsbook" } as const;

function Mark({ brand, size }: { brand: FiatBrand; size: number }) {
  if (brand.logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={brand.logo} alt="" width={size} height={size} loading="lazy" style={{ width: size, height: size, flex: "none", borderRadius: size / 4, background: "#EEF1F3", objectFit: "contain", padding: size / 11 }} />;
  }
  const letters = brand.name.replace(/[^A-Za-z0-9 ]/g, " ").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  return (
    <span style={{ width: size, height: size, flex: "none", borderRadius: size / 4, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", fontFamily: MONO, fontSize: size * 0.3, fontWeight: 700, color: "#A8B6BE" }}>
      {letters}
    </span>
  );
}

export function FiatBrandCard({ brand, compact = false }: { brand: FiatBrand; compact?: boolean }) {
  const [main, ...more] = brand.domains;
  return (
    <div id={brand.id} style={{ scrollMarginTop: 110, display: "flex", flexDirection: "column", gap: compact ? 8 : 10, padding: compact ? "12px 14px" : "14px 16px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)", minWidth: 0 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
        <Mark brand={brand} size={compact ? 36 : 44} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: compact ? 14 : 15, fontWeight: 800, color: "#fff", overflowWrap: "anywhere" }}>{brand.name}</div>
          <div style={{ fontFamily: MONO, fontSize: 10.5, lineHeight: 1.5, color: "#83919A", overflowWrap: "anywhere" }}>
            {main}
            {more.length > 0 && <span title={more.join(", ")}> +{more.length} more</span>}
          </div>
        </div>
      </div>
      {brand.holders.length > 0 && (
        <div style={{ fontSize: 12, lineHeight: 1.4, color: "#8DA0AA", overflowWrap: "anywhere" }}>Licence held by {brand.holders.join(", ")}</div>
      )}
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginTop: "auto" }}>
        {brand.products.map((p) => (
          <span key={p} style={{ padding: "3px 9px", borderRadius: 100, border: "1px solid rgba(255,255,255,.1)", fontFamily: MONO, fontSize: 10, letterSpacing: ".04em", color: p === "casino" ? "#5FE3E8" : "#BDE8D2" }}>
            {PRODUCT_LABEL[p]}
          </span>
        ))}
        <a href={`https://${main}/`} target="_blank" rel="noopener noreferrer nofollow" className="hover:!text-accent" style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 11, color: "#5FE3E8", whiteSpace: "nowrap" }}>
          Visit site ↗
        </a>
      </div>
    </div>
  );
}
