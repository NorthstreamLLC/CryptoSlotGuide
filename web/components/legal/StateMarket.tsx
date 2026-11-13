import Link from "next/link";
import { billTone, TONE_COLOR, type StateMarket, type OperatorList } from "@/lib/us-market";
import { usBrandFor, hasUsBrandPage, US_BRAND_TINT } from "@/lib/us-brands";
import { BrandMark } from "@/components/ui/BrandMark";
import { tintFor } from "@/lib/logo";


function Source({ url, asOf }: { url: string | null; asOf: string | null }) {
  if (!url) return null;
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer nofollow" style={{ fontSize: 10.5, color: "#5FE3E8", whiteSpace: "nowrap" }}>
      {host} ↗{asOf ? ` · ${asOf}` : ""}
    </a>
  );
}

/**
 * One licensed-operator list. The heading names the product rather than saying
 * "operators", because a state's sportsbook list and its online casino list are
 * different licences from different pages.
 */
function Operators({ title, list }: { title: string; list: OperatorList }) {
  // Several regulators publish only the licence holder, or only a site URL, so
  // the second line is shown when it exists and simply omitted when it does not.
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-.02em", color: "#fff" }}>
          {title} <span style={{ fontSize: 13, fontWeight: 400, color: "#8E9CA5" }}>({list.operators.length})</span>
        </h2>
        <Source url={list.sourceUrl} asOf={list.asOf} />
      </div>
      <div className="sm-ops">
        {list.operators.map((o, i) => {
          // The brand behind the listing, where we can tell: its logo, colour and our page on it.
          const brand = usBrandFor(o.brand);
          const slug = brand?.slug ?? o.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const tint = (brand && US_BRAND_TINT[brand.slug]) ?? tintFor(slug);
          const name = brand?.name ?? o.brand;
          const mono = name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase();
          const page = brand && hasUsBrandPage(brand.slug) ? `/us-casinos/${brand.slug}` : null;
          const body = (
            <>
              <span className="sm-op-mark">
                <BrandMark slug={slug} mono={mono} tint={tint} radius={11} fontSize={14} />
              </span>
              <span className="sm-op-text">
                <b>{name}</b>
                {o.licenseHolder ? <small>under {o.licenseHolder}</small> : brand && name !== o.brand ? <small>listed as {o.brand}</small> : null}
              </span>
              {page && <i aria-hidden>→</i>}
            </>
          );
          return page ? (
            <Link key={o.brand + i} href={page} className="sm-op" style={{ ["--tint" as string]: tint }}>{body}</Link>
          ) : (
            <div key={o.brand + i} className="sm-op" style={{ ["--tint" as string]: tint }}>{body}</div>
          );
        })}
      </div>
      <style>{OPS_CSS}</style>
      {list.note && <p style={{ margin: "10px 0 0", maxWidth: "88ch", fontSize: 12.5, lineHeight: 1.6, color: "#8E9CA5" }}>{list.note}</p>}
    </div>
  );
}

const OPS_CSS = `
.sm-ops { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr)); gap: 10px; }
.sm-op { position: relative; display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 14px; min-width: 0;
  background: radial-gradient(120% 140% at 0% 0%, color-mix(in srgb, var(--tint) 16%, transparent), transparent 60%), #0C1013;
  border: 1px solid color-mix(in srgb, var(--tint) 38%, rgba(255,255,255,.06)); box-shadow: inset 0 2px 0 var(--tint); transition: transform .15s, border-color .15s; }
a.sm-op:hover { transform: translateY(-2px); border-color: var(--tint); }
.sm-op-mark { width: 44px; height: 44px; flex: none; border-radius: 11px; overflow: hidden; box-shadow: 0 6px 18px rgba(0,0,0,.35); }
.sm-op-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.sm-op-text b { font-size: 15px; font-weight: 700; color: #F2F5F7; overflow-wrap: anywhere; }
.sm-op-text small { font-size: 12px; line-height: 1.4; color: #8E9CA5; overflow-wrap: anywhere; }
.sm-op i { font-style: normal; color: var(--tint); transition: transform .15s; }
a.sm-op:hover i { transform: translateX(3px); }
`;

/**
 * The market block on a state page: who is licensed, why the state is the way it
 * is, and what its legislature is actually doing about it.
 */
export function StateMarketBlock({ market, stateName }: { market: StateMarket; stateName: string }) {
  const { why, legalToday, wouldRequire, sources, pendingNote, sportsbooks, casinos, pending } = market;
  if (!why && !sportsbooks && !casinos && !pending.length) return null;

  return (
    <section style={{ marginTop: 34 }}>
      {sportsbooks && <Operators title="Licensed online sportsbooks" list={sportsbooks} />}
      {casinos?.operators.length ? <Operators title="Licensed online casinos" list={casinos} /> : null}

      {why && (
        <div style={{ marginTop: 22, padding: "20px 24px", borderRadius: 16, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#00C2CC", marginBottom: 8 }}>
            {sportsbooks ? "How it works here" : `Why you can't bet online in ${stateName}`}
          </div>
          <p style={{ margin: 0, maxWidth: "80ch", fontSize: 14.5, lineHeight: 1.7, color: "#C6D1D7", textWrap: "pretty" }}>{why}</p>

          {legalToday && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.07)" }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#8E9CA5", marginBottom: 5 }}>What is legal today</div>
              <p style={{ margin: 0, maxWidth: "80ch", fontSize: 14, lineHeight: 1.65, color: "#C6D1D7", textWrap: "pretty" }}>{legalToday}</p>
            </div>
          )}

          {wouldRequire && (
            <div style={{ marginTop: 14 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "#8E9CA5" }}>To change it </span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "#E8EDF0" }}>{wouldRequire}</span>
            </div>
          )}

          {sources && sources.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.07)" }}>
              {sources.map((src) => (
                <a key={src.url} href={src.url} target="_blank" rel="noopener noreferrer nofollow" style={{ padding: "5px 10px", borderRadius: 100, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", fontSize: 12, color: "#9FD9DD" }}>
                  {src.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {pending.length === 0 && pendingNote && (
        <p style={{ margin: "16px 0 0", maxWidth: "80ch", fontSize: 13, lineHeight: 1.6, color: "#8E9CA5" }}>{pendingNote}</p>
      )}

      {pending.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, letterSpacing: "-.02em", color: "#fff" }}>What the legislature is doing</h2>
          <p style={{ margin: "0 0 12px", maxWidth: "80ch", fontSize: 13.5, color: "#8E9CA5" }}>
            {/* Not "legalise or expand": Hawaii's HB 2198 would pull prediction
                markets INTO the definition of gambling, and this list now
                carries bills that run both ways. Saying they all loosen the
                law would misdescribe them. */}
            Bills that would change what is legal online in {stateName} — loosening or tightening — with the status each legislature publishes. A bill that
            died still tells you something about the direction of travel.
          </p>
          <div style={{ padding: "4px 20px", borderRadius: 16, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
            {pending.map((b, i) => {
              const t = billTone(b.status);
              return (
                <div key={b.bill + i} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, padding: "14px 0", borderTop: i ? "1px solid rgba(255,255,255,.06)" : undefined }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14.5, fontWeight: 700, color: "#fff" }}>{b.bill}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "#8E9CA5" }}>{b.topic}</span>
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: "#C6D1D7", marginTop: 3 }}>{b.status}</div>
                    {b.note && <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "#8E9CA5", marginTop: 4 }}>{b.note}</div>}
                    <div style={{ marginTop: 5 }}>
                      <Source url={b.sourceUrl} asOf={b.lastAction} />
                    </div>
                  </div>
                  <span style={{ alignSelf: "start", padding: "4px 10px", borderRadius: 100, background: `${TONE_COLOR[t.tone]}1f`, border: `1px solid ${TONE_COLOR[t.tone]}55`, fontSize: 10.5, fontWeight: 700, color: TONE_COLOR[t.tone], whiteSpace: "nowrap" }}>
                    {t.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
