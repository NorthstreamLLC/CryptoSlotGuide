import { siteData } from "@/lib/site-data";
import { TIER_LABEL, TIER_DESC, TIER_TINT, type ReviewTier } from "@/lib/review-tier";
import { isFieldTestedOperator } from "@/lib/field-tested";
import { SCORE_BRAND } from "@/lib/score-tier";
import { pageMetadata } from "@/lib/seo";

/**
 * A fourth kind of backing, alongside the three ReviewTier values in
 * lib/review-tier.ts — deliberately not added to that type, because it
 * never applies to a criteria.json row the way the other three do. It
 * backs supplementary figures (on-chain deposit volume, hot-wallet
 * balance — see lib/onchain-volume.ts) that this site has no
 * infrastructure to measure itself yet, so it cites a named platform
 * directly instead of presenting a number it can't back. Kept local to
 * this page rather than exported, since nothing else needs to switch on it.
 */
const ON_CHAIN_TINT = "#6BC7FF";

export const metadata = pageMetadata(
  `How the ${SCORE_BRAND} works`,
  "One weighted model for crypto casinos, built from six criteria with published weights. Everything else is reviewed against its own checklist, field-tested or editorially assessed — every review says which.",
  "/how-we-rate"
);

/**
 * Live casino, wallets and exchanges are categories a field test covers,
 * but the badge has to reflect what has actually happened: it only reads
 * "Field-tested" once every entity in that category is in
 * data/fieldTestedOperators.json, and "Field-test pending" until then.
 * Every other category is editorial by design.
 */
const FIELD_TEST_CATEGORY_SLUGS: Record<string, string[]> = {
  "Live casino": siteData.liveCasinos.map((o) => o.slug),
  Wallets: siteData.walletRows.map((o) => o.slug),
  Exchanges: siteData.exchangeRows.map((o) => o.slug),
};

function reviewBasisTier(name: string): ReviewTier {
  const slugs = FIELD_TEST_CATEGORY_SLUGS[name];
  if (!slugs) return "editorial";
  return slugs.length > 0 && slugs.every(isFieldTestedOperator) ? "field-tested" : "pending";
}

/**
 * Ported from the `isMethod` block in CryptoSlotGuide.dc.html (search
 * for `METHODOLOGY`). Static content — no interactivity, so this stays
 * a server component.
 */
export default function Page() {
  const { methodSteps, criteria, reviewBasis, ops, fieldTestedOperators, editoriallyAuditedOperators, casinoSpecSheets, onChainVolume } = siteData;
  const coverage = [
    { label: "Field-tested casinos", value: fieldTestedOperators.length, total: ops.length },
    { label: "Editorially audited", value: editoriallyAuditedOperators.length, total: ops.length },
    { label: "Full spec sheet on file", value: casinoSpecSheets.length, total: ops.length },
    { label: "On-chain tracked", value: onChainVolume.length, total: ops.length },
  ];

  return (
    <main>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(100% 100% at 50% 0%, rgba(0,194,204,.09), transparent 60%), #090C0F" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "56px 40px 44px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 18 }}>
            Methodology
          </div>
          <h1 style={{ margin: "0 0 16px", fontSize: 50, lineHeight: 1.03, letterSpacing: "-.038em", fontWeight: 800, fontStretch: "116%", color: "#fff", textWrap: "balance" }}>
            How the {SCORE_BRAND} works
          </h1>
          <p style={{ margin: "0 auto 14px", maxWidth: "66ch", fontSize: 16.5, lineHeight: 1.65, color: "#93A3AC", textWrap: "pretty" }}>
            One weighted model, applied to one category. Crypto casinos carry a {SCORE_BRAND.toLowerCase()} built from six criteria with fixed weights, published so any number on this site can be re-derived. Commission is not one of the inputs, and the people assigning scores cannot see the commercial terms.
          </p>
          <p style={{ margin: "0 auto", maxWidth: "66ch", fontSize: 15, lineHeight: 1.65, color: "#7B8A93", textWrap: "pretty" }}>
            Everything else — live tables, slots, providers, sportsbooks, prediction markets, wallets, exchanges — is reviewed against its own checklist rather than forced into the casino model. Those checklists are below.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 40px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden" }}>
          {coverage.map((c) => (
            <div key={c.label} style={{ padding: "18px 20px", background: "#0C1013" }}>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 22, fontWeight: 700, color: c.value > 0 ? "#5FE3E8" : "#5C6A72", letterSpacing: "-.02em" }}>
                {c.value} <span style={{ fontSize: 14, color: "#5C6A72", fontWeight: 500 }}>/ {c.total}</span>
              </div>
              <div style={{ fontSize: 11.5, color: "#7B8A93", marginTop: 4 }}>{c.label}</div>
            </div>
          ))}
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 12, color: "#5C6A72" }}>
          Real coverage across the index, not a completion rate we&apos;re hiding — most of this site is still &quot;published, pending our own check.&quot;
        </p>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "44px 40px 0" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 28, letterSpacing: "-.028em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>How we back a figure</h2>
        <p style={{ margin: "0 0 20px", maxWidth: "80ch", fontSize: 15, lineHeight: 1.65, color: "#8DA0AA", textWrap: "pretty" }}>
          Not every figure gets the same kind of check, and we&apos;d rather say so than blur it. The first three apply criterion by criterion within a single casino review (see the weights below); the fourth backs a small set of figures — on-chain deposit flow, hot-wallet balances — that need infrastructure this site doesn&apos;t have yet. Every number traces back to whichever one applies.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 1, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden" }}>
          {(["field-tested", "community-reported", "editorial"] as const).map((tier) => (
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
            </div>
          ))}
          <div style={{ padding: 24, background: "#0C1013" }}>
            <span
              style={{
                display: "inline-block",
                marginBottom: 12,
                padding: "4px 9px",
                borderRadius: 4,
                border: `1px solid ${ON_CHAIN_TINT}55`,
                background: `${ON_CHAIN_TINT}18`,
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".06em",
                textTransform: "uppercase",
                color: ON_CHAIN_TINT,
              }}
            >
              On-chain cited
            </span>
            <p style={{ margin: "0 0 10px", fontSize: 14, lineHeight: 1.65, color: "#93A3AC", textWrap: "pretty" }}>
              Deposit flow and hot-wallet balances are public on a blockchain, but tracing them to a specific operator needs wallet-clustering infrastructure we don&apos;t have yet. Where we cite one of these figures, the source and date are named right on the row — not folded into our own claim.
            </p>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "44px 40px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ padding: "5px 11px", borderRadius: 100, border: "1px solid rgba(0,194,204,.32)", background: "rgba(0,194,204,.09)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".07em", textTransform: "uppercase", color: "#00C2CC" }}>
            Crypto casinos only
          </span>
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 28, letterSpacing: "-.028em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>The six criteria, their weights, and how each is sourced</h2>
        <p style={{ margin: "0 0 20px", maxWidth: "74ch", fontSize: 15, lineHeight: 1.65, color: "#8DA0AA", textWrap: "pretty" }}>
          These weights produce the score on every crypto casino review and the order of the casino index. They are not applied to any other category. Four of the six start from the operator&apos;s own public pages. Support responsiveness and the RTP build an operator ships can only be checked from a funded account, and payout speed moves from the operator&apos;s stated time to our own timings once field-tested. Each review marks any criterion that hasn&apos;t been checked for that operator yet.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden" }}>
          {criteria.map((c) => (
            <div key={c.name} style={{ padding: 24, background: "#0C1013" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-.015em" }}>{c.name}</span>
                <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 16, color: "#00C2CC" }}>{c.weight}</span>
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 13.5, lineHeight: 1.6, color: "#8DA0AA", textWrap: "pretty" }}>{c.desc}</p>
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 8px",
                  borderRadius: 4,
                  border: `1px solid ${TIER_TINT[c.sourcing]}55`,
                  background: `${TIER_TINT[c.sourcing]}18`,
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: ".05em",
                  textTransform: "uppercase",
                  color: TIER_TINT[c.sourcing],
                }}
              >
                {TIER_LABEL[c.sourcing]}
              </span>
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
        <h2 style={{ margin: "0 0 8px", fontSize: 28, letterSpacing: "-.028em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>The full spec sheet</h2>
        <p style={{ margin: "0 0 20px", maxWidth: "74ch", fontSize: 15, lineHeight: 1.65, color: "#8DA0AA", textWrap: "pretty" }}>
          Below the six weighted criteria, most casino reviews also carry a grouped fact table — coins accepted, withdrawal fees, licence and company registration, geo-blocking — that doesn&apos;t feed the score at all. Every fact on it is either drawn from data already established elsewhere on this site, or checked by us directly against the operator&apos;s own page, with the exact source and date shown per row. It only ever grows by real, individual research — an operator with no facts checked yet simply has no spec sheet, not a filled-in placeholder.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <div style={{ padding: "10px 16px", borderRadius: 10, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)", fontSize: 13, color: "#8DA0AA" }}>
            <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", color: "#5FE3E8", fontWeight: 700 }}>{casinoSpecSheets.length}</span> of {ops.length} casinos have one so far
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "44px 40px 0" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 28, letterSpacing: "-.028em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>The field-test protocol</h2>
        <p style={{ margin: "0 0 20px", maxWidth: "80ch", fontSize: 15, lineHeight: 1.65, color: "#8DA0AA", textWrap: "pretty" }}>
          The steps a field test follows. A figure is only labelled field-tested once its operator has been through them —{" "}
          {fieldTestedOperators.length === 0
            ? "none has yet."
            : `${fieldTestedOperators.length} so far.`}
        </p>
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
          A slot and a hardware wallet have nothing in common, so scoring them on one scale would be theatre. Each category is reviewed against the things that actually decide whether it is any good, and each review shows you those checks and where each figure came from.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden" }}>
          {reviewBasis.map((r) => {
            const tier = reviewBasisTier(r.name);
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
              If a figure here is wrong, we want to know. Reader reports go to the front of the queue. When we correct a figure, the page says what changed and where the new figure came from rather than making a silent edit.
            </p>
            <a href="mailto:corrections@cryptoslotguide.com" style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11.5, letterSpacing: ".05em", color: "#00C2CC" }}>Report an inaccuracy →</a>
          </div>
        </div>
      </section>
    </main>
  );
}
