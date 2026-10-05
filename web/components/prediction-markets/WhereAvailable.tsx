import Link from "next/link";
import { flagSrc } from "@/lib/flags";
import { availabilityOf, openCount, predCountries, predCountryHref, venueHref, venuesInOrder, type PredictionTab } from "@/lib/prediction-markets";

/**
 * Under a venue list: where those venues can be used. On the crypto list,
 * every country with how many of the venues leave it off their restricted
 * lists; on the regulated list, who each venue serves — four are US-only,
 * and listing 44 countries with "0 of 5" would say less than one sentence.
 */
const MONO = "var(--font-jetbrains-mono), monospace";

export function WhereAvailable({ tab }: { tab: PredictionTab }) {
  const venues = venuesInOrder(tab);
  if (tab === "fiat") {
    return (
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px 56px" }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 26, letterSpacing: "-.025em", fontWeight: 800, color: "#fff" }}>Who can use them</h2>
        <p style={{ margin: "0 0 16px", maxWidth: "72ch", fontSize: 14.5, lineHeight: 1.6, color: "#8DA0AA" }}>From each venue&rsquo;s own eligibility pages.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
          {venues.map((v) => {
            const a = availabilityOf(v.slug);
            return (
              <Link key={v.slug} href={venueHref(v.slug)} className="csg-lift" style={{ display: "block", padding: "16px 18px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{v.name} →</div>
                <div style={{ fontSize: 13, lineHeight: 1.55, color: "#A8B6BE" }}>{a?.text ?? v.note}</div>
              </Link>
            );
          })}
        </div>
      </section>
    );
  }
  const countries = predCountries().map((c) => ({ ...c, n: openCount("crypto", c.code) }));
  return (
    <section id="by-country" style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px 56px", scrollMarginTop: 110 }}>
      <h2 style={{ margin: "0 0 6px", fontSize: 26, letterSpacing: "-.025em", fontWeight: 800, color: "#fff" }}>Which venues take you, country by country</h2>
      <p style={{ margin: "0 0 16px", maxWidth: "76ch", fontSize: 14.5, lineHeight: 1.6, color: "#8DA0AA" }}>
        How many of the {venues.length} crypto-settled venues leave each country off their own restricted list. Polymarket and Myriad also forbid using a VPN to
        get round theirs.
      </p>
      <div data-keep-grid style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 8 }}>
        {countries.map((c) => (
          <Link key={c.code} href={predCountryHref(c.code)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", borderRadius: 11, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)", minWidth: 0 }}>
            {flagSrc(c.code) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={flagSrc(c.code) as string} alt="" width={22} height={16} loading="lazy" style={{ width: 22, height: 16, flex: "none", borderRadius: 3, objectFit: "cover" }} />
            )}
            <span style={{ minWidth: 0, flex: 1, fontSize: 13, fontWeight: 600, color: "#E8EDF0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: c.n === 0 ? "#E5848A" : c.n === venues.length ? "#7BE0B8" : "#C9D4DA" }}>
              {c.n}/{venues.length}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
