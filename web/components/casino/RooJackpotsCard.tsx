import Link from "next/link";
import { getSpecFact } from "@/lib/spec-sheet";

/**
 * "New at Roobet": Roo Jackpots, from the fact on Roobet's spec sheet, with
 * the guide that explains what the side bet costs. Renders nothing once the
 * fact is gone from the sheet, so it never outlives the promotion.
 */
export function RooJackpotsCard() {
  const f = getSpecFact("roobet", "Bonus terms", "Roo Jackpots");
  if (!f) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", padding: "18px 20px", borderRadius: 16, background: "radial-gradient(90% 140% at 0% 50%, rgba(178,132,255,.22), transparent 60%), radial-gradient(70% 140% at 100% 50%, rgba(255,197,49,.12), transparent 60%), #0F0D18", border: "1px solid rgba(178,132,255,.4)" }}>
      <span aria-hidden style={{ width: 52, height: 52, flex: "none", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(140deg,#FFD866,#C9921A)", fontSize: 26 }}>💰</span>
      <div style={{ flex: "1 1 300px", minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "#C9B0FF", marginBottom: 4 }}>New at Roobet</div>
        <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", marginBottom: 3 }}>Roo Jackpots: four jackpots, the top one over $1 million</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.5, color: "#B7C4CB" }}>Add $0.10 to $5 to each bet for a shot at the Mini, Minor, Major and Mega. Wins carry no wagering. Roobet says the side bet returns 80% on average.</div>
      </div>
      <Link href="/guides/roo-jackpots-explained" style={{ padding: "12px 16px", borderRadius: 11, background: "#B284FF", color: "#120A22", fontSize: 14, fontWeight: 800, whiteSpace: "nowrap" }}>
        How Roo Jackpots work →
      </Link>
    </div>
  );
}
