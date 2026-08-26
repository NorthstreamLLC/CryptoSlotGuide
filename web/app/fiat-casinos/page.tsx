import { siteData } from "@/lib/site-data";

/**
 * Ported from the `isFiat` block in CryptoSlotGuide.dc.html (search for
 * `FIAT CASINOS`). Deliberately a separate list, never merged into the
 * crypto ranking — same rule the README states.
 */
export default function Page() {
  const { fiatCasinos } = siteData;

  return (
    <main>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "#0B0F12" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "48px 40px 36px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "6px 13px", border: "1px solid rgba(255,179,71,.30)", borderRadius: 100, background: "rgba(255,179,71,.08)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".07em", textTransform: "uppercase", color: "#FFC77A", marginBottom: 20 }}>
            Separate list · card and bank deposits
          </div>
          <h1 style={{ margin: "0 0 14px", fontSize: 48, lineHeight: 1.02, letterSpacing: "-.038em", fontWeight: 800, fontStretch: "116%", color: "#fff", textWrap: "balance" }}>
            Fiat casinos, scored on their own terms
          </h1>
          <p style={{ margin: 0, maxWidth: "74ch", fontSize: 16.5, lineHeight: 1.65, color: "#96A6AF", textWrap: "pretty" }}>
            These are licensed operators taking cards and bank transfers, not crypto. We keep them on a separate list because the comparison would be dishonest otherwise: a fiat payout is measured in days, KYC is mandatory before the first withdrawal, and the licence — not the chain — is what protects you.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "36px 40px 80px" }}>
        <div style={{ display: "grid", minWidth: 0, gridTemplateColumns: "repeat(auto-fit,minmax(292px,1fr))", gap: 12 }}>
          {fiatCasinos.map((o, i) => (
            <div key={o.slug} style={{ position: "relative", display: "flex", flexDirection: "column", padding: 20, borderRadius: 14, background: "rgba(12,16,19,.72)", border: "1px solid rgba(255,255,255,.07)", overflow: "hidden" }}>
              <span style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${o.tint},transparent)` }} />
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
                <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#4E5A62" }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-.02em", color: "#fff" }}>{o.name}</span>
                <span style={{ marginLeft: "auto", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 18, color: "#fff" }}>{o.score.toFixed(1)}</span>
              </div>
              <p style={{ margin: "0 0 16px", fontSize: 13, lineHeight: 1.55, color: "#8DA0AA", textWrap: "pretty" }}>{o.note}</p>
              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 9, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.07)" }}>
                <FiatRow label="Licence" value={o.licence} color={o.tint} />
                <FiatRow label="Deposit rails" value={o.rails} />
                <FiatRow label="Payout" value={o.payout} />
                <FiatRow label="Wagering · games" value={`${o.wager} · ${o.games}`} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 22, padding: "18px 22px", borderRadius: 13, background: "rgba(0,194,204,.06)", border: "1px solid rgba(0,194,204,.18)" }}>
          <span style={{ fontSize: 14, color: "#9FD9DD" }}>Crypto payouts on our index run four minutes to eight; the fastest fiat operator here takes a day.</span>
          <a href="/crypto-casinos" style={{ marginLeft: "auto", fontSize: 14, fontWeight: 600, color: "#00C2CC", whiteSpace: "nowrap" }}>See the crypto list →</a>
        </div>
      </section>
    </main>
  );
}

function FiatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
      <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, letterSpacing: ".07em", textTransform: "uppercase", color: "#4E5A62" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11.5, color: color ?? "#DCE5E9" }}>{value}</span>
    </div>
  );
}
