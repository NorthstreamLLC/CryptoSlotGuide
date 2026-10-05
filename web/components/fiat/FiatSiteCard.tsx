import type { FiatSite } from "@/lib/fiat";

/**
 * One licensed site: its own icon, the brand, the company holding the
 * licence, what the licence covers, and a link to the site itself.
 *
 * The link is nofollow until we hold an affiliate link for the brand — it
 * is a reference to a site the regulator lists, not an endorsement.
 */
const MONO = "var(--font-jetbrains-mono), monospace";
const PRODUCT_LABEL = { casino: "Casino", sports: "Sportsbook" } as const;

function Mark({ site }: { site: FiatSite }) {
  if (site.logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={site.logo} alt="" width={44} height={44} loading="lazy" style={{ width: 44, height: 44, flex: "none", borderRadius: 11, background: "#EEF1F3", objectFit: "contain", padding: 4 }} />;
  }
  const letters = site.name.replace(/^www\./, "").replace(/[^A-Za-z0-9 ]/g, " ").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  return (
    <span style={{ width: 44, height: 44, flex: "none", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", fontFamily: MONO, fontSize: 13, fontWeight: 700, color: "#A8B6BE" }}>
      {letters}
    </span>
  );
}

export function FiatSiteCard({ site }: { site: FiatSite }) {
  const showDomain = site.name.toLowerCase() !== site.domain;
  return (
    <div id={site.domain} data-reveal style={{ scrollMarginTop: 110, display: "flex", flexDirection: "column", gap: 10, padding: "14px 16px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)", minWidth: 0 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
        <Mark site={site} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 800, color: "#fff", overflowWrap: "anywhere" }}>{site.name}</div>
          {showDomain && <div style={{ fontFamily: MONO, fontSize: 10.5, color: "#83919A", overflowWrap: "anywhere" }}>{site.domain}</div>}
        </div>
      </div>
      {site.holder && <div style={{ fontSize: 12, lineHeight: 1.4, color: "#8DA0AA", overflowWrap: "anywhere" }}>Licence held by {site.holder}</div>}
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginTop: "auto" }}>
        {site.products.map((p) => (
          <span key={p} style={{ padding: "3px 9px", borderRadius: 100, border: "1px solid rgba(255,255,255,.1)", fontFamily: MONO, fontSize: 10, letterSpacing: ".04em", color: p === "casino" ? "#5FE3E8" : "#BDE8D2" }}>
            {PRODUCT_LABEL[p]}
          </span>
        ))}
        <a href={`https://${site.domain}/`} target="_blank" rel="noopener noreferrer nofollow" className="hover:!text-accent" style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 11, color: "#5FE3E8", whiteSpace: "nowrap" }}>
          Visit site ↗
        </a>
      </div>
    </div>
  );
}
