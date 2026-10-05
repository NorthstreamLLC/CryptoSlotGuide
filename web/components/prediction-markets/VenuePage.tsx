import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import { NextSteps } from "@/components/layout/NextSteps";
import { flagSrc } from "@/lib/flags";
import type { PredictionMarket } from "@/lib/types";
import {
  availabilityOf,
  countryNameOf,
  predCountry,
  predCountryHref,
  venueCta,
  venueHref,
  venuesInOrder,
  type PredictionTab,
} from "@/lib/prediction-markets";

/**
 * One prediction-market venue: what it settles in, what it costs, who it
 * lets in — with the venue's own restricted list laid out country by country
 * — and every fact with the venue page it came from.
 */
const MONO = "var(--font-jetbrains-mono), monospace";

function host(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

function Country({ code, note }: { code: string; note?: string }) {
  const name = countryNameOf(code);
  const flag = flagSrc(code);
  const inner = (
    <>
      {flag && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={flag} alt="" width={18} height={13} loading="lazy" style={{ width: 18, height: 13, flex: "none", borderRadius: 2, objectFit: "cover" }} />
      )}
      <span>{name}</span>
      {note && <span style={{ color: "#83919A" }}>· {note}</span>}
    </>
  );
  const style = { display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 10px", borderRadius: 9, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)", fontSize: 12.5, color: "#C6D1D7" } as const;
  return predCountry(code) ? (
    <Link href={predCountryHref(code)} style={style}>
      {inner}
    </Link>
  ) : (
    <span style={style}>{inner}</span>
  );
}

export function VenuePage({ v, tab }: { v: PredictionMarket; tab: PredictionTab }) {
  const a = availabilityOf(v.slug);
  const cta = venueCta(v);
  const others = venuesInOrder(tab).filter((x) => x.slug !== v.slug);
  const listHref = tab === "crypto" ? "/prediction-markets" : "/prediction-markets/regulated";
  const listName = tab === "crypto" ? "Crypto prediction markets" : "Regulated prediction markets";
  const blocked = a?.mode === "blocklist" ? a.codes.filter((c) => !a.closeOnly?.includes(c)) : [];

  return (
    <main style={{ background: "#07090B", color: "#E8EDF0" }}>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: `radial-gradient(80% 120% at 85% 0%, ${v.tint}1c, transparent 55%), #0A0D10` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 24px 36px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 22 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href={listHref} style={{ color: "#83919A" }}>{listName}</Link> / <span style={{ color: "#A8B6BE" }}>{v.name}</span>
          </div>
          <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
            <span style={{ width: 64, height: 64, flex: "none", borderRadius: 16, overflow: "hidden" }}>
              <BrandMark slug={v.slug} mono={v.name.slice(0, 2).toUpperCase()} tint={v.tint} radius={16} fontSize={18} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: v.tint, marginBottom: 4 }}>
                {tab === "crypto" ? "Crypto-settled prediction market" : "Regulated prediction market"}
              </div>
              <h1 style={{ margin: 0, fontSize: "clamp(32px, 4.4vw, 48px)", lineHeight: 1.04, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>{v.name}</h1>
            </div>
            <a
              href={cta.href}
              target="_blank"
              rel={cta.sponsored ? "noopener sponsored nofollow" : "noopener noreferrer nofollow"}
              style={{ marginLeft: "auto", padding: "12px 20px", borderRadius: 11, background: cta.sponsored ? "#FFC531" : "#00C2CC", color: "#06181A", fontSize: 14.5, fontWeight: 800, whiteSpace: "nowrap" }}
            >
              Visit {v.name} ↗
            </a>
          </div>
          <p style={{ margin: "0 0 22px", maxWidth: "72ch", fontSize: 16, lineHeight: 1.6, color: "#A8B6BE" }}>{v.note}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 1, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,.09)", background: "rgba(255,255,255,.07)" }}>
            {[
              ["Settles in", v.settle],
              ["Cost to trade", v.fee],
              ["Account", v.kyc],
              ["Payout", v.payout],
            ].map(([l, val]) => (
              <div key={l} style={{ padding: "16px 18px", background: "#10161A" }}>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".07em", textTransform: "uppercase", color: "#83919A", marginBottom: 6 }}>{l}</div>
                <div style={{ fontSize: 14, lineHeight: 1.45, color: "#fff" }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 24px 70px" }}>
        {a && (
          <section id="availability" style={{ marginBottom: 38, scrollMarginTop: 110 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 26, letterSpacing: "-.025em", fontWeight: 800, color: "#fff" }}>Where you can use {v.name}</h2>
            <p style={{ margin: "0 0 14px", maxWidth: "78ch", fontSize: 15, lineHeight: 1.65, color: "#B7C4CB" }}>
              {a.text}{" "}
              <a href={a.url} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 11, color: "#5FE3E8", whiteSpace: "nowrap" }}>
                {host(a.url)} ↗ · {a.asOf}
              </a>
            </p>
            {a.mode === "blocklist" && (
              <>
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#E5848A", margin: "18px 0 8px" }}>Restricted · {blocked.length} countries</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {[...blocked].sort((x, y) => countryNameOf(x).localeCompare(countryNameOf(y))).map((c) => (
                    <Country key={c} code={c} />
                  ))}
                </div>
                {(a.closeOnly?.length ?? 0) > 0 && (
                  <>
                    <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#E8C37A", margin: "18px 0 8px" }}>Close-only</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {a.closeOnly!.map((c) => (
                        <Country key={c} code={c} note="close existing positions only" />
                      ))}
                    </div>
                  </>
                )}
                {(a.regions?.length ?? 0) > 0 && (
                  <>
                    <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#E8C37A", margin: "18px 0 8px" }}>Restricted regions</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {a.regions!.map((r) => (
                        <Country key={r.country + r.name} code={r.country} note={r.name} />
                      ))}
                    </div>
                  </>
                )}
                {(a.unclear?.length ?? 0) > 0 && (
                  <p style={{ margin: "14px 0 0", maxWidth: "78ch", fontSize: 13, lineHeight: 1.6, color: "#8DA0AA" }}>
                    The terms also restrict {a.unclear!.map((u) => `"${u.quote}"`).join(", ")}, written that way. That is the official name of Taiwan; the terms do not say
                    whether they mean Taiwan or mainland China.
                  </p>
                )}
                <p style={{ margin: "14px 0 0", maxWidth: "78ch", fontSize: 13, lineHeight: 1.6, color: "#8DA0AA" }}>
                  Every country not named here is open under {v.name}&rsquo;s terms.{a.vpnBanned ? ` Using a VPN to get round the list breaks those terms.` : ""} Local law is a separate question; each country page links to it.
                </p>
              </>
            )}
            {a.mode === "allowlist" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: "#7BE0B8", alignSelf: "center", marginRight: 4 }}>Only:</span>
                {a.codes.map((c) => (
                  <Country key={c} code={c} />
                ))}
              </div>
            )}
            {a.mode === "agreement" && a.helpUrl && (
              <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#8DA0AA" }}>
                The help article:{" "}
                <a href={a.helpUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#5FE3E8" }}>
                  {host(a.helpUrl)} ↗
                </a>
              </p>
            )}
          </section>
        )}

        <h2 style={{ margin: "0 0 14px", fontSize: 26, letterSpacing: "-.025em", fontWeight: 800, color: "#fff" }}>The details, with sources</h2>
        <div style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden", background: "#0C1013", marginBottom: 38 }}>
          {v.facts.map((f) => (
            <div key={f.label} style={{ display: "grid", gridTemplateColumns: "minmax(110px, 160px) 1fr", gap: 16, padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#83919A", paddingTop: 2 }}>{f.label}</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: "#C6D1D7" }}>
                {f.text}{" "}
                <a href={f.url} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 11, color: "#5FE3E8", whiteSpace: "nowrap" }}>
                  {host(f.url)} ↗
                </a>
              </div>
            </div>
          ))}
        </div>

        <h2 style={{ margin: "0 0 14px", fontSize: 22, letterSpacing: "-.02em", fontWeight: 800, color: "#fff" }}>Other {tab === "crypto" ? "crypto-settled" : "regulated"} venues</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          {others.map((o) => (
            <Link key={o.slug} href={venueHref(o.slug)} className="csg-lift" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 13, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)", minWidth: 0 }}>
              <span style={{ width: 34, height: 34, flex: "none", borderRadius: 9, overflow: "hidden" }}>
                <BrandMark slug={o.slug} mono={o.name.slice(0, 2).toUpperCase()} tint={o.tint} radius={9} fontSize={11} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: "#fff" }}>{o.name}</span>
                <span style={{ display: "block", fontFamily: MONO, fontSize: 10.5, color: "#83919A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.settle}</span>
              </span>
            </Link>
          ))}
        </div>

        <NextSteps
          steps={[
            { href: listHref, label: listName, hint: "Every venue on this list, side by side." },
            { href: tab === "crypto" ? "/prediction-markets/regulated" : "/prediction-markets", label: tab === "crypto" ? "Regulated prediction markets" : "Crypto prediction markets", hint: tab === "crypto" ? "US-dollar venues the CFTC oversees." : "Stablecoin venues with wallet or email login." },
            { href: "/sportsbooks", label: "Crypto sportsbooks", hint: "Fixed odds instead of traded contracts." },
          ]}
        />
      </div>
    </main>
  );
}
