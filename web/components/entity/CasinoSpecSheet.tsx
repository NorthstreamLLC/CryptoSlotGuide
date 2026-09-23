import { getCasinoSpecSheet, uniformGroupSourcing } from "@/lib/spec-sheet";
import type { SpecFact, SpecGroup } from "@/lib/types";

/**
 * The grouped spec sheet — see lib/spec-sheet.ts. Casino-only, renders
 * nothing for an operator with no sheet on file yet. Structurally its
 * own thing, not a reskin of any competitor's per-dimension score-card
 * layout: one continuous bordered table, grouped sections, no numeric
 * third-party scores shown anywhere. Sourcing is cited once per group
 * when every fact in it genuinely shares one source, and per-row when
 * it doesn't — see uniformGroupSourcing's comment for why that split is
 * real, not cosmetic.
 */
export function CasinoSpecSheet({ slug, kind = "casino" }: { slug: string; kind?: "casino" | "wallet" | "exchange" }) {
  const sheet = getCasinoSpecSheet(slug);
  if (!sheet || sheet.groups.length === 0) return null;
  const owner = kind === "wallet" ? "wallet maker" : kind === "exchange" ? "exchange" : "operator";

  return (
    <div style={{ marginBottom: 38 }}>
      <h2 style={{ margin: "0 0 8px", fontSize: 28, letterSpacing: "-.028em", fontWeight: 800, fontStretch: "112%", color: "#E8EDF0" }}>
        The full spec sheet
      </h2>
      <p style={{ margin: "0 0 20px", maxWidth: "84ch", fontSize: 15, color: "#8DA0AA", textWrap: "pretty" }}>
        Every fact below is checked directly against the {owner}&apos;s own pages
        {kind === "casino" ? ", or drawn from data already established elsewhere on this site" : ""} — see each row for where it
        came from.
        {kind === "casino" && " On-chain deposit and custody figures, cited separately above, are the one part sourced from a third party rather than verified by us."}
      </p>

      <div style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 13, background: "#0C1013", overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,.35)" }}>
        {sheet.groups.map((group, i) => (
          <Group key={group.title} group={group} first={i === 0} />
        ))}
      </div>
    </div>
  );
}

function Group({ group, first }: { group: SpecGroup; first: boolean }) {
  const uniform = uniformGroupSourcing(group);
  const isRtpGrid = group.title.startsWith("House games");

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          padding: "12px 20px",
          background: "#101519",
          borderTop: first ? "none" : "1px solid rgba(255,255,255,.07)",
          borderBottom: "1px solid rgba(255,255,255,.07)",
        }}
      >
        <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC" }}>
          {group.title}
        </span>
        {uniform && <GroupCitation fact={uniform} />}
      </div>

      {isRtpGrid ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 1, background: "rgba(255,255,255,.05)" }}>
          {group.facts.map((f) => (
            <div key={f.label} style={{ padding: "13px 20px", background: "#0C1013", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
              <FactLabel fact={f} showCite={!uniform} rtpStyle />
              <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 13, color: "#5FE3E8" }}>{f.value}</span>
            </div>
          ))}
        </div>
      ) : (
        group.facts.map((f, j) => <FactRow key={f.label} fact={f} first={j === 0} showCite={!uniform} />)
      )}
    </>
  );
}

function GroupCitation({ fact }: { fact: Pick<SpecFact, "sourcing" | "sourceUrl" | "asOf"> }) {
  if (fact.sourcing === "site-data") return null;
  return (
    <span style={{ fontSize: 11.5, color: "#7B8A93", whiteSpace: "nowrap" }}>
      Source: <a href={fact.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#5FE3E8" }}>{citeLabel(fact.sourceUrl)} ↗</a> · {fact.asOf}
    </span>
  );
}

function FactRow({ fact, first, showCite }: { fact: SpecFact; first: boolean; showCite: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "220px 1fr 160px",
        alignItems: "baseline",
        borderTop: first ? "none" : "1px solid rgba(255,255,255,.05)",
      }}
    >
      <div style={{ padding: "13px 20px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".04em", textTransform: "uppercase", color: "#83919A" }}>
        {fact.label}
      </div>
      <div style={{ padding: "13px 20px" }}>
        {fact.chips ? (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {fact.chips.map((c) => (
              <span key={c} style={{ display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 100, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.10)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, color: "#B7C4CB" }}>
                {c}
              </span>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: 13.5, color: "#B7C4CB" }}>
            {fact.value}
            {showCite && fact.sourcing !== "site-data" && (
              <span style={{ marginLeft: 8, fontSize: 11.5, color: "#7B8A93" }}>
                · <a href={fact.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#5FE3E8" }}>{citeLabel(fact.sourceUrl)} ↗</a>
              </span>
            )}
          </span>
        )}
      </div>
      <div style={{ padding: "13px 20px", display: "flex", alignItems: "center" }}>
        {fact.flag && (
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 10,
              letterSpacing: ".05em",
              padding: "3px 8px",
              borderRadius: 4,
              background: fact.flag.background,
              color: fact.flag.color,
              whiteSpace: "nowrap",
            }}
          >
            {fact.flag.label}
          </span>
        )}
      </div>
    </div>
  );
}

function FactLabel({ fact, showCite }: { fact: SpecFact; showCite: boolean; rtpStyle?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 13.5, color: "#B7C4CB" }}>{fact.label}</div>
      {showCite && fact.sourcing !== "site-data" && (
        <div style={{ fontSize: 9.5, color: "#77858E", marginTop: 2 }}>
          <a href={fact.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#5FE3E8" }}>{citeLabel(fact.sourceUrl)} ↗</a>
        </div>
      )}
    </div>
  );
}

function citeLabel(sourceUrl?: string): string {
  if (!sourceUrl) return "source";
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}
