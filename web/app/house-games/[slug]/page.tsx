import Link from "next/link";
import { notFound } from "next/navigation";
import { siteData } from "@/lib/site-data";
import { logoFor } from "@/lib/casino-index";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

/**
 * Ported from the `isHouseGame` block in CryptoSlotGuide.dc.html (search
 * for `HOUSE GAME (how to play)`). "Where to play it" uses our top-scored
 * casinos (the game is identical everywhere, so the source's own advice
 * is to pick on payout/wagering) rather than a per-game operator list our
 * data model doesn't carry.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const h = siteData.houseGames.find((g) => g.slug === slug);
  if (!h) return {};
  return pageMetadata(
    `${h.name}: the rules, the edge, and what you actually decide`,
    `${h.note} House edge ${h.edge}, return ${h.rtp}, provably fair: ${h.fair}.`,
    `/house-games/${slug}`
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { houseGames, ops } = siteData;
  const h = houseGames.find((g) => g.slug === slug);
  if (!h) notFound();

  const where = [...ops].sort((a, b) => b.score - a.score).slice(0, 6);
  const others = houseGames.filter((g) => g.slug !== h.slug).slice(0, 4);

  return (
    <main>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "House games", path: "/house-games" }, { name: h.name, path: `/house-games/${slug}` }])} />
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "#0B0F12" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 40px 44px" }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#5C6A72", marginBottom: 26 }}>
            <Link href="/" style={{ color: "#5C6A72" }}>Index</Link> / <Link href="/house-games" style={{ color: "#5C6A72" }}>House games</Link> / <span style={{ color: "#A8B6BE" }}>{h.name}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.25fr .75fr", gap: 56, alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                <span style={{ width: 38, height: 38, flex: "none", borderRadius: 9, background: h.tint, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, fontWeight: 700, color: "#0A0D0F" }}>{h.mono}</span>
                <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC" }}>How to play</span>
              </div>
              <h1 style={{ margin: "0 0 16px", fontSize: 44, lineHeight: 1.06, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "114%", color: "#fff" }}>
                {h.name}: the rules, the edge, and what you actually decide
              </h1>
              <p style={{ margin: "0 0 24px", maxWidth: "62ch", fontSize: 16.5, lineHeight: 1.65, color: "#93A3AC", textWrap: "pretty" }}>
                {h.note} The maths is published and the result is verifiable, so the only variable left is how you size and stop.
              </p>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11.5, color: "#5C6A72" }}>Written by the games desk · edge confirmed in-client · 24 Aug 2026</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,.09)", background: "rgba(255,255,255,.07)" }}>
              <StatTile label="House edge" value={h.edge} color="#5FE3E8" />
              <StatTile label="Return" value={h.rtp} />
              <StatTile label="Provably fair" value={h.fair} small />
              <StatTile label="Round length" value={h.speed} small />
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 40px 84px" }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 28, letterSpacing: "-.028em", fontWeight: 800, fontStretch: "112%", color: "#E8EDF0" }}>Playing a round</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,.07)", marginBottom: 38 }}>
          {h.steps.map((s, i) => (
            <div key={s} style={{ display: "grid", gridTemplateColumns: "66px 1fr", gap: 20, alignItems: "baseline", padding: "20px 24px", background: "#0C1013" }}>
              <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 13, color: "#00C2CC" }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontSize: 15.5, lineHeight: 1.65, color: "#B7C4CB", textWrap: "pretty" }}>{s}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 38 }}>
          <div style={{ padding: "26px 28px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 14 }}>Worth knowing</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {h.tips.map((t) => (
                <div key={t} style={{ display: "flex", gap: 11, fontSize: 14.5, lineHeight: 1.6, color: "#B7C4CB" }}>
                  <span style={{ color: "#00C2CC", fontFamily: "var(--font-jetbrains-mono), monospace", flex: "none" }}>→</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: "26px 28px", borderRadius: 14, background: "linear-gradient(150deg,#0E1417,#0A0E10)", border: "1px solid rgba(196,101,58,.20)" }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#DA9877", marginBottom: 14 }}>The part no strategy fixes</div>
            <p style={{ margin: "0 0 12px", fontSize: 14.5, lineHeight: 1.7, color: "#93A3AC", textWrap: "pretty" }}>
              At {h.edge} the house keeps that share of everything staked, over enough rounds. No bet-sizing pattern changes it, because each round is independent of the last.
            </p>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: "#93A3AC", textWrap: "pretty" }}>
              What you can control is exposure: session size, a stop, and whether you are staking an amount you would shrug at losing. Treat the rest as entertainment priced at {h.edge}.
            </p>
          </div>
        </div>

        <h2 style={{ margin: "0 0 8px", fontSize: 28, letterSpacing: "-.028em", fontWeight: 800, fontStretch: "112%", color: "#E8EDF0" }}>Where to play it</h2>
        <p style={{ margin: "0 0 20px", fontSize: 15, color: "#8DA0AA" }}>The game is identical everywhere, so pick on payout speed and wagering instead.</p>
        <div style={{ display: "grid", minWidth: 0, gridTemplateColumns: "repeat(auto-fit,minmax(258px,1fr))", gap: 12, marginBottom: 38 }}>
          {where.map((o) => (
            <Link key={o.slug} href={o.hasCustomReview ? "/casinos/roobet" : `/casinos/${o.slug}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: 18, borderRadius: 13, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
              <div style={{ width: 54, height: 26, flex: "none", display: "flex", alignItems: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoFor(o.slug)} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#E8EDF0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.name}</div>
                <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, color: "#5C6A72", marginTop: 2 }}>{o.payoutLabel} payout</div>
              </div>
              <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 14, color: "#fff" }}>{o.score.toFixed(1)}</span>
            </Link>
          ))}
        </div>

        <h2 style={{ margin: "0 0 20px", fontSize: 24, letterSpacing: "-.025em", fontWeight: 800, fontStretch: "112%", color: "#E8EDF0" }}>Other originals</h2>
        <div style={{ display: "grid", minWidth: 0, gridTemplateColumns: "repeat(auto-fit,minmax(232px,1fr))", gap: 12 }}>
          {others.map((g) => (
            <Link key={g.slug} href={`/house-games/${g.slug}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: 18, borderRadius: 13, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
              <span style={{ width: 30, height: 30, flex: "none", borderRadius: 8, background: g.tint, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, fontWeight: 700, color: "#0A0D0F" }}>{g.mono}</span>
              <span style={{ fontSize: 14.5, fontWeight: 600, color: "#E8EDF0" }}>{g.name}</span>
              <span style={{ marginLeft: "auto", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11.5, color: "#5FE3E8" }}>{g.edge}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

function StatTile({ label, value, color, small }: { label: string; value: string; color?: string; small?: boolean }) {
  return (
    <div style={{ padding: 20, background: "#12181C" }}>
      <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", color: "#5C6A72", marginBottom: 7 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: small ? 18 : 24, color: color ?? "#fff" }}>{value}</div>
    </div>
  );
}
