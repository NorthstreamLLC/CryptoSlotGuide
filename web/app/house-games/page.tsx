import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { pageMetadata } from "@/lib/seo";

/**
 * Ported from the `isHouse` block in CryptoSlotGuide.dc.html (search
 * for `House games · crypto originals`).
 */
export const metadata = pageMetadata(
  "Originals, and how to play them",
  "The in-house games are the only titles on a crypto casino where the maths is published, provable and identical everywhere. Here is the edge on each one, what the game actually asks you to decide, and where the play is honest.",
  "/house-games"
);

export default function Page() {
  const { houseGames } = siteData;

  return (
    <main>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(110% 100% at 22% 0%, rgba(0,194,204,.09), transparent 58%), #090C0F" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "48px 40px 38px" }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 16 }}>
            House games · crypto originals
          </div>
          <h1 style={{ margin: "0 0 14px", fontSize: 50, lineHeight: 1.02, letterSpacing: "-.038em", fontWeight: 800, fontStretch: "116%", color: "#fff" }}>
            Originals, and how to play them
          </h1>
          <p style={{ margin: 0, maxWidth: "72ch", fontSize: 16.5, lineHeight: 1.65, color: "#93A3AC", textWrap: "pretty" }}>
            The in-house games are the only titles on a crypto casino where the maths is published, provable and identical everywhere. Here is the edge on each one, what the game actually asks you to decide, and where the play is honest.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 40px 0" }}>
        <div style={{ display: "grid", minWidth: 0, gridTemplateColumns: "repeat(auto-fit,minmax(232px,1fr))", gap: 12 }}>
          {houseGames.map((g) => (
            <Link key={g.slug} href={`/house-games/${g.slug}`} style={{ display: "flex", flexDirection: "column", padding: 22, borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{ width: 36, height: 36, flex: "none", borderRadius: 9, background: g.tint, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, fontWeight: 700, color: "#0A0D0F" }}>{g.mono}</span>
                <div>
                  <div style={{ fontSize: 16.5, fontWeight: 700, color: "#fff", letterSpacing: "-.02em" }}>{g.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, color: "#5C6A72", marginTop: 2 }}>{g.speed}</div>
                </div>
              </div>
              <p style={{ margin: "0 0 18px", fontSize: 12.5, lineHeight: 1.55, color: "#7B8A93", textWrap: "pretty" }}>{g.note}</p>
              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 1, borderRadius: 9, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, padding: "9px 11px", background: "#0F1417" }}>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#5C6A72" }}>House edge</span>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: "#5FE3E8" }}>{g.edge}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, padding: "9px 11px", background: "#0F1417" }}>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#5C6A72" }}>Provably fair</span>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: "#E8EDF0" }}>{g.fair}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 40px 84px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr .6fr", gap: 14 }}>
          <div style={{ padding: "28px 32px", borderRadius: 14, background: "linear-gradient(150deg,#0E1417,#0A0E10)", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 12 }}>
              What &quot;provably fair&quot; does and does not mean
            </div>
            <p style={{ margin: "0 0 12px", maxWidth: "80ch", fontSize: 15, lineHeight: 1.7, color: "#93A3AC", textWrap: "pretty" }}>
              It means you can verify after the fact that the result was fixed before you bet: a server seed, your client seed and a nonce, hashed. It is a real guarantee and worth having.
            </p>
            <p style={{ margin: 0, maxWidth: "80ch", fontSize: 15, lineHeight: 1.7, color: "#93A3AC", textWrap: "pretty" }}>
              It does not mean the game is beatable. A 1% house edge is still a 1% house edge whether or not you can prove the roll was clean. Verification protects you from manipulation, not from the maths.
            </p>
          </div>
          <Link href="/rtp-watch" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 20, padding: "28px 32px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-.015em" }}>Slots are the opposite story</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".05em", color: "#00C2CC" }}>RTP Watch →</div>
          </Link>
        </div>
      </section>
    </main>
  );
}
