import Link from "next/link";
import type { CountryMarket, WorldOperatorList, UnreadableRegister } from "@/lib/world-market";

const MONO = "var(--font-jetbrains-mono), monospace";

function Source({ url, asOf }: { url: string; asOf: string | null }) {
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8", whiteSpace: "nowrap" }}>
      {host} ↗{asOf ? ` · ${asOf}` : ""}
    </a>
  );
}

/**
 * One licensed-operator list from a country's register. The heading names
 * the product because the lists come from different licence classes; a
 * register that does not split by product gets the neutral heading.
 */
/**
 * A law page shows the first 24 of a list; the licensed-casinos page has the
 * rest, with logos and filters. Germany's 136 rows and the UK's 1,400 made the
 * law page a directory, which is the other page's job.
 */
const CAP = 24;

function Operators({ title, list, id, more }: { title: string; list: WorldOperatorList; id: string; more?: string | null }) {
  if (!list.operators.length) return null;
  const shown = more ? list.operators.slice(0, CAP) : list.operators;
  return (
    <div id={id} style={{ marginTop: 22, scrollMarginTop: 110 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>
          {title} <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 400, color: "#8E9CA5" }}>({list.operators.length})</span>
        </h2>
        <Source url={list.sourceUrl} asOf={list.asOf} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 8 }}>
        {shown.map((o, i) => (
          <div key={o.brand + i} data-reveal style={{ ["--reveal-delay" as string]: `${Math.min(i, 12) * 30}ms`, padding: "11px 14px", borderRadius: 11, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)", minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#E8EDF0", overflowWrap: "anywhere" }}>{o.brand}</div>
            {o.licenseHolder && o.licenseHolder.toLowerCase() !== o.brand.toLowerCase() && (
              <div style={{ fontSize: 12, lineHeight: 1.4, color: "#83919A", marginTop: 2, overflowWrap: "anywhere" }}>under {o.licenseHolder}</div>
            )}
            {o.domains && o.domains.length > 0 && o.domains[0] !== o.brand.toLowerCase() && (
              <div style={{ fontFamily: MONO, fontSize: 10.5, color: "#6E7A82", marginTop: 4, overflowWrap: "anywhere" }}>{o.domains.slice(0, 4).join(" · ")}{o.domains.length > 4 ? ` +${o.domains.length - 4}` : ""}</div>
            )}
            {o.concession && <div style={{ fontFamily: MONO, fontSize: 10, color: "#6E7A82", marginTop: 3 }}>concession {o.concession}</div>}
          </div>
        ))}
      </div>
      {more && list.operators.length > CAP && (
        <Link href={more} style={{ display: "inline-block", marginTop: 10, fontFamily: MONO, fontSize: 12, color: "#5FE3E8" }}>
          See all {list.operators.length} →
        </Link>
      )}
      {list.domains && list.domains.length > 0 && (
        <details style={{ marginTop: 10 }}>
          <summary style={{ cursor: "pointer", fontFamily: MONO, fontSize: 11, color: "#8DA0AA" }}>
            The {list.domains.length} web addresses the register lists under this licence type
          </summary>
          <p style={{ margin: "8px 0 0", fontFamily: MONO, fontSize: 11, lineHeight: 1.8, color: "#8E9CA5", overflowWrap: "anywhere" }}>{list.domains.join(" · ")}</p>
        </details>
      )}
      {list.note && <p style={{ margin: "10px 0 0", maxWidth: "88ch", fontSize: 12.5, lineHeight: 1.6, color: "#8E9CA5" }}>{list.note}</p>}
    </div>
  );
}

/**
 * The regulated-market block on a country page: who the regulator licenses
 * for online casino and betting, and the law behind it — or, where the
 * regulator publishes nothing a script can read, the page to check.
 */
export function CountryMarketBlock({
  market,
  unreadable,
  countryName,
  fiat,
}: {
  market: CountryMarket | null;
  unreadable: UnreadableRegister | null;
  countryName: string;
  /** The country's page in the licensed (fiat) section, where it has one. */
  fiat?: { href: string; sites: number } | null;
}) {
  if (!market && !unreadable) return null;
  return (
    <section style={{ marginTop: 34 }}>
      {market && (
        <>
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 6 }}>Regulated market</div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-.025em", color: "#fff" }}>Who is licensed in {countryName}</h2>
            <p style={{ margin: "6px 0 0", maxWidth: "80ch", fontSize: 14, lineHeight: 1.6, color: "#8DA0AA" }}>
              Read from {market.regulator}&rsquo;s own register. These hold a {countryName} licence; the crypto casinos above do not, and most of them say so on their own restricted lists.
            </p>
            {fiat && (
              <Link
                href={fiat.href}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 12, padding: "11px 17px", borderRadius: 10, background: "#00C2CC", color: "#04191B", fontSize: 14, fontWeight: 800 }}
              >
                All {fiat.sites} licensed sites, with logos and links →
              </Link>
            )}
          </div>
          {market.casinos && <Operators id="licensed-casinos" title="Licensed online casinos" list={market.casinos} more={fiat ? `${fiat.href}?type=casino` : null} />}
          {market.sportsbooks && <Operators id="licensed-sportsbooks" title="Licensed online sportsbooks" list={market.sportsbooks} more={fiat ? `${fiat.href}?type=sports` : null} />}
          {market.operators && <Operators id="licensed-operators" title="Licensed online operators" list={market.operators} more={fiat?.href ?? null} />}
          <div style={{ marginTop: 22, padding: "20px 24px", borderRadius: 16, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 8 }}>How it works here</div>
            <p style={{ margin: 0, maxWidth: "80ch", fontSize: 14.5, lineHeight: 1.7, color: "#C6D1D7", textWrap: "pretty" }}>{market.why}</p>
          </div>
        </>
      )}
      {!market && unreadable && (
        <div style={{ padding: "20px 24px", borderRadius: 16, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 8 }}>Licensed operators</div>
          <p style={{ margin: 0, maxWidth: "80ch", fontSize: 14.5, lineHeight: 1.7, color: "#C6D1D7", textWrap: "pretty" }}>
            {unreadable.note}{" "}
            <a href={unreadable.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#5FE3E8" }}>
              {unreadable.regulator} ↗
            </a>
          </p>
        </div>
      )}
    </section>
  );
}
