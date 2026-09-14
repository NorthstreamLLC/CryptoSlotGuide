import { getCasinoBonuses } from "@/lib/casino-bonuses";
import { siteData } from "@/lib/site-data";
import type { CasinoBonus } from "@/lib/types";

/**
 * The operator's own currently-live promotions — see lib/casino-bonuses.ts.
 * Casino-only, renders nothing for an operator with no bonuses on file yet.
 * Deliberately restrained (small dot-category labels, neutral-colored
 * headline figures, no boxed pill badges) rather than the colored-tile
 * "movers" dashboard look this was first modeled on — see
 * data/README.md's bonus-page notes for why. Each card cites where the
 * figure was checked and carries its own sign-up link when the operator
 * has one on file (lib/types.ts's Operator.signupUrl) — never a fabricated
 * affiliate link when that field is absent.
 */
export function CasinoBonuses({ slug }: { slug: string }) {
  const bonuses = getCasinoBonuses(slug);
  if (bonuses.length === 0) return null;
  const op = siteData.ops.find((o) => o.slug === slug);
  const name = op?.name ?? slug;

  return (
    <div style={{ marginBottom: 38 }}>
      <h2 style={{ margin: "0 0 8px", fontSize: 28, letterSpacing: "-.028em", fontWeight: 800, fontStretch: "112%", color: "#E8EDF0" }}>
        Current bonuses
      </h2>
      <p style={{ margin: "0 0 20px", maxWidth: "84ch", fontSize: 15, color: "#8DA0AA", textWrap: "pretty" }}>
        {name}&apos;s own live promotions, checked against its site on the date shown for each. These rotate and
        expire — treat every figure below as dated, not a standing offer.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {bonuses.map((b) => (
          <BonusCard key={b.title} bonus={b} name={name} signupUrl={op?.signupUrl} />
        ))}
      </div>
    </div>
  );
}

function BonusCard({ bonus, name, signupUrl }: { bonus: CasinoBonus; name: string; signupUrl?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: 24, borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00C2CC", flex: "none" }} />
        <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".07em", textTransform: "uppercase", color: "#5C6A72" }}>
          {bonus.category}
        </span>
      </div>

      <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-.015em", color: "#fff", marginBottom: 18 }}>{bonus.title}</div>

      <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 36, fontWeight: 700, letterSpacing: "-.03em", color: "#E8EDF0", marginBottom: 4 }}>
        {bonus.headline}
      </div>
      <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "#7B8A93", marginBottom: bonus.stats ? 20 : 16 }}>{bonus.subCopy}</div>

      {bonus.stats && (
        <div data-keep-grid style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
          {bonus.stats.map((s) => (
            <div key={s.label} style={{ padding: "12px 14px", background: "#101519", borderRadius: 9 }}>
              <div style={{ fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", color: "#5C6A72", marginBottom: 5 }}>{s.label}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#E8EDF0" }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: signupUrl ? 12 : 0, fontSize: 11.5, color: "#7B8A93" }}>
          <span>
            Source:{" "}
            <a href={bonus.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#5FE3E8" }}>
              {citeLabel(bonus.sourceUrl)} ↗
            </a>{" "}
            · {bonus.asOf}
          </span>
          {bonus.endsLabel && <span style={{ whiteSpace: "nowrap" }}>{bonus.endsLabel}</span>}
        </div>
        {signupUrl && (
          <a
            href={signupUrl}
            target="_blank"
            rel="nofollow sponsored noopener"
            style={{ display: "block", textAlign: "center", padding: 10, borderRadius: 8, background: "rgba(0,194,204,.12)", border: "1px solid rgba(0,194,204,.3)", color: "#5FE3E8", fontSize: 12.5, fontWeight: 700 }}
          >
            Go to {name} ↗
          </a>
        )}
      </div>
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
