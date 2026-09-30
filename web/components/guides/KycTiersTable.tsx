import Link from "next/link";
import { kycByTier, kycCounts, kycTierDescription, KYC_TIER_LABEL } from "@/lib/kyc";

const MONO = "var(--font-jetbrains-mono), monospace";
const TINT: Record<string, string> = {
  required: "#C4653A",
  threshold: "#C7A45C",
  conflicting: "#A07CC7",
  discretionary: "#2FA8B0",
  never: "#2FB67A",
};

/**
 * Every operator's KYC shape, grouped. The guide's prose makes claims about
 * counts; this is the working. Each row carries the operator's own wording
 * and a link to the page it is on, so nothing rests on our summary.
 */
export function KycTiersTable() {
  const groups = kycByTier();
  const counts = kycCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <section style={{ marginTop: 36 }}>
      <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, letterSpacing: "-.025em", color: "#fff" }}>Every operator, by what its policy does</h2>
      <p style={{ margin: "0 0 20px", maxWidth: "70ch", fontSize: 14, lineHeight: 1.6, color: "#8DA0AA" }}>
        Read from each casino&rsquo;s own verification page or terms. Where an operator&rsquo;s marketing and its policy disagree, the policy is what is
        recorded here.
      </p>
      {groups.map((g) => (
        <div key={g.tier} style={{ marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: TINT[g.tier], flex: "none" }} />
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#fff" }}>{KYC_TIER_LABEL[g.tier]}</h3>
            <span style={{ fontFamily: MONO, fontSize: 11, color: "#8E9CA5" }}>
              {counts[g.tier]} of {total}
            </span>
          </div>
          <p style={{ margin: "0 0 10px 18px", maxWidth: "68ch", fontSize: 13, lineHeight: 1.55, color: "#8DA0AA" }}>{kycTierDescription(g.tier)}</p>
          <div style={{ marginLeft: 18, borderRadius: 12, border: "1px solid rgba(255,255,255,.07)", background: "#0C1013", overflow: "hidden" }}>
            {g.rows.map((r, i) => (
              <div
                key={r.slug}
                className="grid grid-cols-1 md:grid-cols-[minmax(110px,1fr)_minmax(220px,3fr)_auto]"
                style={{ gap: 12, padding: "11px 15px", alignItems: "baseline", borderTop: i ? "1px solid rgba(255,255,255,.05)" : undefined }}
              >
                <Link href={`/casinos/${r.slug}`} style={{ fontSize: 14, fontWeight: 700, color: "#E8EDF0" }}>
                  {r.name}
                </Link>
                <span style={{ fontSize: 13, lineHeight: 1.5, color: "#8DA0AA" }}>{r.policy ?? r.why}</span>
                {r.sourceUrl && (
                  <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10, color: "#5FE3E8", whiteSpace: "nowrap" }}>
                    source ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
