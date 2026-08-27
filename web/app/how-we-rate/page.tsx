import { siteData } from "@/lib/site-data";
import { TIER_LABEL, TIER_DESC, TIER_TINT } from "@/lib/review-tier";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "How we rate, in full",
  "One weighted model for crypto casinos, built from six criteria with published weights. Everything else is reviewed against its own checklist, field-tested or editorially assessed — every review says which.",
  "/how-we-rate"
);

const REVIEW_BASIS_TIER: Record<string, "field-tested" | "editorial"> = {
  "Live casino": "field-tested",
  Slots: "editorial",
  "Game providers": "editorial",
  Sportsbooks: "editorial",
  "Prediction markets": "editorial",
  Wallets: "field-tested",
  Exchanges: "field-tested",
  "Fiat casinos": "editorial",
};

/**
 * Ported from the `isMethod` block in CryptoSlotGuide.dc.html (search
 * for `METHODOLOGY`). Static content — no interactivity, so this stays
 * a server component.
 */
export default function Page() {
  const { methodSteps, criteria, reviewBasis } = siteData;

  return (
    <main>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(100% 100% at 50% 0%, rgba(0,194,204,.09), transparent 60%), #090C0F" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "56px 40px 44px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 18 }}>
            Methodology
          </div>
          <h1 style={{ margin: "0 0 16px", fontSize: 50, lineHeight: 1.03, letterSpacing: "-.038em", fontWeight: 800, fontStretch: "116%", color: "#fff", textWrap: "balance" }}>
            How we rate, in full
          </h1>
          <p style={{ margin: "0 auto 14px", maxWidth: "66ch", fontSize: 16.5, lineHeight: 1.65, color: "#93A3AC", textWrap: "pretty" }}>
            One weighted model, applied to one category. Crypto casinos carry a headline score built from six criteria with fixed weights, published so any number on this site can be re-derived. Commission is not one of the inputs, and the people assigning scores cannot see the commercial terms.
          </p>
          <p style={{ margin: "0 auto", maxWidth: "66ch", fontSize: 15, lineHeight: 1.65, color: "#7B8A93", textWrap: "pretty" }}>
            Everything else — live tables, slots, providers, sportsbooks, prediction markets, wallets, exchanges — is reviewed against its own checklist rather than forced into the casino model. Those checklists are below.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "44px 40px 0" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 28, letterSpacing: "-.028em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>Two ways we back a figure</h2>
        <p style={{ margin: "0 0 20px", maxWidth: "80ch", fontSize: 15, lineHeight: 1.65, color: "#8DA0AA", textWrap: "pretty" }}>
          Not every category gets the same kind of check, and we&apos;d rather say so than blur it. Every review on this site carries one of two labels, and every number traces back to whichever one applies.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden" }}>
          {(["field-tested", "editorial"] as const).map((tier) => (
            <div key={tier} style={{ padding: 24, background: "#0C1013" }}>
              <span
                style={{
                  display: "inline-block",
                  marginBottom: 12,
                  padding: "4px 9px",
                  borderRadius: 4,
                  border: `1px solid ${TIER_TINT[tier]}55`,
                  background: `${TIER_TINT[tier]}18`,
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  color: TIER_TINT[tier],
                }}
              >
                {TIER_LABEL[tier]}
              </span>
              <p style={{ margin: "0 0 10px", fontSize: 14, lineHeight: 1.65, color: "#93A3AC", textWrap: "pretty" }}>{TIER_DESC[tier]}</p>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#7B8A93" }}>
                {tier === "field-tested"
                  ? "Applies to: crypto casinos, live casino tables, wallets, exchanges."
                  : "Applies to: slots, game providers, sportsbooks, prediction markets, fiat casinos."}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "44px 40px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ padding: "5px 11px", borderRadius: 100, border: "1px solid rgba(0,194,204,.32)", background: "rgba(0,194,204,.09)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".07em", textTransform: "uppercase", color: "#00C2CC" }}>
            Crypto casinos only
          </span>
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 28, letterSpacing: "-.028em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>The six criteria and their weights</h2>
        <p style={{ margin: "0 0 20px", maxWidth: "74ch", fontSize: 15, lineHeight: 1.65, color: "#8DA0AA", textWrap: "pretty" }}>
          These weights produce the score on every crypto casino review and the order of the casino index. They are not applied to any other category.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden" }}>
          {criteria.map((c) => (
            <div key={c.name} style={{ padding: 24, background: "#0C1013" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-.015em" }}>{c.name}</span>
                <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 16, color: "#00C2CC" }}>{c.weight}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "#8DA0AA", textWrap: "pretty" }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "44px 40px 0" }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 28, letterSpacing: "-.028em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>The test protocol</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,.07)" }}>
          {methodSteps.map((s) => (
            <div key={s.n} style={{ display: "grid", gridTemplateColumns: "72px minmax(200px,1fr) 2fr", gap: 20, alignItems: "baseline", padding: "20px 24px", background: "#0C1013" }}>
              <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 13, color: "#00C2CC" }}>{s.n}</span>
              <span style={{ fontSize: 15.5, fontWeight: 700, color: "#fff", letterSpacing: "-.015em" }}>{s.t}</span>
              <span style={{ fontSize: 14, lineHeight: 1.65, color: "#8DA0AA", textWrap: "pretty" }}>{s.d}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "44px 40px 0" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 28, letterSpacing: "-.028em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>Everything else: reviewed, not weighted</h2>
        <p style={{ margin: "0 0 22px", maxWidth: "80ch", fontSize: 15, lineHeight: 1.65, color: "#8DA0AA", textWrap: "pretty" }}>
          A slot and a hardware wallet have nothing in common, so scoring them on one scale would be theatre. Each category is reviewed against the things that actually decide whether it is any good, and each review shows you those checks with the reading behind them.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden" }}>
          {reviewBasis.map((r) => {
            const tier = REVIEW_BASIS_TIER[r.name] ?? "editorial";
            return (
              <div key={r.name} style={{ display: "flex", flexDirection: "column", gap: 10, padding: "22px 24px", background: "#0C1013" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 17, lineHeight: 1 }}>{r.icon}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-.018em", color: "#fff" }}>{r.name}</span>
                  <span
                    style={{
                      marginLeft: "auto",
                      padding: "3px 8px",
                      borderRadius: 4,
                      border: `1px solid ${TIER_TINT[tier]}55`,
                      background: `${TIER_TINT[tier]}18`,
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: ".05em",
                      textTransform: "uppercase",
                      color: TIER_TINT[tier],
                    }}
                  >
                    {TIER_LABEL[tier]}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "#8DA0AA", textWrap: "pretty" }}>{r.checks}</p>
                <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.06)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".05em", color: r.tint }}>
                  {r.measured}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "44px 40px 84px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ padding: "28px 32px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 19, letterSpacing: "-.02em", fontWeight: 700, color: "#fff" }}>How we&apos;re funded</h3>
            <p style={{ margin: "0 0 12px", fontSize: 14.5, lineHeight: 1.7, color: "#93A3AC", textWrap: "pretty" }}>
              We earn commission when a reader signs up through our links, including at operators we rank first. Rates differ between operators, which is exactly why they are kept away from scoring.
            </p>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: "#93A3AC", textWrap: "pretty" }}>
              No operator has ever been given sight of a score before publication, and no operator can pay for placement on any table on this site.
            </p>
          </div>
          <div style={{ padding: "28px 32px", borderRadius: 14, background: "linear-gradient(150deg,#0E1417,#0A0E10)", border: "1px solid rgba(255,255,255,.07)" }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 19, letterSpacing: "-.02em", fontWeight: 700, color: "#fff" }}>Corrections</h3>
            <p style={{ margin: "0 0 12px", fontSize: 14.5, lineHeight: 1.7, color: "#93A3AC", textWrap: "pretty" }}>
              If a figure here is wrong, we want to know. Reader reports that we can reproduce trigger an immediate re-test, and the page carries the new date rather than a silent edit.
            </p>
            <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11.5, letterSpacing: ".05em", color: "#00C2CC" }}>Report an inaccuracy →</span>
          </div>
        </div>
      </section>
    </main>
  );
}
