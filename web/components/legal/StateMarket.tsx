import { billTone, TONE_COLOR, type StateMarket, type OperatorList } from "@/lib/us-market";

const MONO = "var(--font-jetbrains-mono), monospace";

function Source({ url, asOf }: { url: string | null; asOf: string | null }) {
  if (!url) return null;
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
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>
          {title} <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 400, color: "#8E9CA5" }}>({list.operators.length})</span>
        </h2>
        <Source url={list.sourceUrl} asOf={list.asOf} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 8 }}>
        {list.operators.map((o, i) => (
          <div key={o.brand + i} style={{ padding: "11px 14px", borderRadius: 11, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#E8EDF0", overflowWrap: "anywhere" }}>{o.brand}</div>
            {o.licenseHolder && <div style={{ fontSize: 12, lineHeight: 1.4, color: "#83919A", marginTop: 2 }}>under {o.licenseHolder}</div>}
          </div>
        ))}
      </div>
      {list.note && <p style={{ margin: "10px 0 0", maxWidth: "88ch", fontSize: 12.5, lineHeight: 1.6, color: "#8E9CA5" }}>{list.note}</p>}
    </div>
  );
}

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
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 8 }}>
            {sportsbooks ? "How it works here" : `Why you can't bet online in ${stateName}`}
          </div>
          <p style={{ margin: 0, maxWidth: "80ch", fontSize: 14.5, lineHeight: 1.7, color: "#C6D1D7", textWrap: "pretty" }}>{why}</p>

          {legalToday && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.07)" }}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".07em", textTransform: "uppercase", color: "#8E9CA5", marginBottom: 5 }}>What is legal today</div>
              <p style={{ margin: 0, maxWidth: "80ch", fontSize: 14, lineHeight: 1.65, color: "#C6D1D7", textWrap: "pretty" }}>{legalToday}</p>
            </div>
          )}

          {wouldRequire && (
            <div style={{ marginTop: 14 }}>
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".07em", textTransform: "uppercase", color: "#8E9CA5" }}>To change it </span>
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
          <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>What the legislature is doing</h2>
          <p style={{ margin: "0 0 12px", maxWidth: "80ch", fontSize: 13.5, color: "#8E9CA5" }}>
            Bills that would legalise or expand online gambling in {stateName}, with the status each legislature publishes. A bill that died still tells you
            something about the direction of travel.
          </p>
          <div style={{ padding: "4px 20px", borderRadius: 16, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
            {pending.map((b, i) => {
              const t = billTone(b.status);
              return (
                <div key={b.bill + i} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, padding: "14px 0", borderTop: i ? "1px solid rgba(255,255,255,.06)" : undefined }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14.5, fontWeight: 800, color: "#fff" }}>{b.bill}</span>
                      <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".05em", textTransform: "uppercase", color: "#8E9CA5" }}>{b.topic}</span>
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: "#C6D1D7", marginTop: 3 }}>{b.status}</div>
                    {b.note && <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "#8E9CA5", marginTop: 4 }}>{b.note}</div>}
                    <div style={{ marginTop: 5 }}>
                      <Source url={b.sourceUrl} asOf={b.lastAction} />
                    </div>
                  </div>
                  <span style={{ alignSelf: "start", padding: "4px 10px", borderRadius: 100, background: `${TONE_COLOR[t.tone]}1f`, border: `1px solid ${TONE_COLOR[t.tone]}55`, fontFamily: MONO, fontSize: 10.5, fontWeight: 700, color: TONE_COLOR[t.tone], whiteSpace: "nowrap" }}>
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
