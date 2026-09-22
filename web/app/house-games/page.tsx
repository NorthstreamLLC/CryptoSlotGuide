import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps } from "@/components/layout/NextSteps";

/**
 * Ported from the `isHouse` block in CryptoSlotGuide.dc.html (search
 * for `House games · crypto originals`).
 */
export const metadata = pageMetadata(
  "Originals, and how to play them",
  "Dice, crash, plinko and the other in-house games that crypto casinos build themselves. Each casino publishes its own house edge for its version, so here is what each one says, what the game asks you to decide, and how provably fair results work.",
  "/house-games"
);

export default function Page() {
  const { houseGames, houseCasinoWide, ops } = siteData;
  const nameOf = (slug: string) => ops.find((o) => o.slug === slug)?.name ?? slug;

  return (
    <main>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "House games", path: "/house-games" }])} />
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(110% 100% at 22% 0%, rgba(0,194,204,.09), transparent 58%), #090C0F" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "48px 40px 38px" }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 16 }}>
            House games · crypto originals
          </div>
          <h1 style={{ margin: "0 0 14px", fontSize: 50, lineHeight: 1.02, letterSpacing: "-.038em", fontWeight: 800, fontStretch: "116%", color: "#fff" }}>
            Originals, and how to play them
          </h1>
          <p style={{ margin: 0, maxWidth: "72ch", fontSize: 16.5, lineHeight: 1.65, color: "#93A3AC", textWrap: "pretty" }}>
            Dice, crash, plinko and the other in-house games that crypto casinos build themselves. Each casino publishes its own house edge for its version, so here is what each one says, what the game asks you to decide, and how provably fair results work.
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
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#5C6A72" }}>Published edges</span>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: "#5FE3E8" }}>{g.edgeRange} <span style={{ color: "#5C6A72", fontSize: 10.5 }}>· {g.edges.length} casinos</span></span>
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

      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 40px 0" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 24, letterSpacing: "-.025em", fontWeight: 800, fontStretch: "112%", color: "#E8EDF0" }}>Casino-wide policies</h2>
        <p style={{ margin: "0 0 16px", maxWidth: "80ch", fontSize: 14.5, lineHeight: 1.6, color: "#8DA0AA" }}>Some casinos state an edge for all their originals rather than per game.</p>
        <div style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 13, overflow: "hidden", background: "#0C1013" }}>
          {houseCasinoWide.map((c) => (
            <div key={c.casino} style={{ display: "grid", gridTemplateColumns: "160px 1fr", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
              <Link href={`/casinos/${c.casino}`} style={{ padding: "14px 18px", fontSize: 14, fontWeight: 600, color: "#E8EDF0" }}>{nameOf(c.casino)}</Link>
              <div style={{ padding: "14px 18px", fontSize: 13.5, lineHeight: 1.55, color: "#B7C4CB" }}>
                {c.text}{" "}
                <a href={c.url} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#5FE3E8", whiteSpace: "nowrap" }}>{new URL(c.url).hostname.replace(/^www\./, "")} ↗</a>
              </div>
            </div>
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
              It does not mean the game is beatable. A house edge is still a house edge whether or not you can prove the roll was clean. Verification protects you from manipulation, not from the maths.
            </p>
          </div>
          <Link href="/rtp-watch" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 20, padding: "28px 32px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-.015em" }}>Slots are the opposite story</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".05em", color: "#00C2CC" }}>RTP Watch →</div>
          </Link>
        </div>
        <NextSteps
          steps={[
            { href: "/crypto-casinos", label: "Where to play them", hint: "The casinos running their own originals, with terms cited." },
            { href: "/slots", label: "Slot RTP index", hint: "The other side: studio games and their published return." },
            { href: "/how-we-rate", label: "How we source every fact", hint: "Every edge here comes from the operator's own game rules." },
          ]}
        />
      </section>
    </main>
  );
}
