import Link from "next/link";
import { notFound } from "next/navigation";
import { siteData } from "@/lib/site-data";
import { tintFor } from "@/lib/logo";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandMark } from "@/components/ui/BrandMark";
import { NextSteps } from "@/components/layout/NextSteps";
import { FeaturedPartner } from "@/components/ui/FeaturedPartner";

/**
 * How-to page for one originals game. Edges are each casino's own published
 * figure (data/houseGames.json `edges`), never one number for everywhere.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const h = siteData.houseGames.find((g) => g.slug === slug);
  if (!h) return {};
  return pageMetadata(
    `${h.name}: the rules, the edge, and what you actually decide`,
    `${h.note} Casinos publish house edges of ${h.edgeRange} for their versions; here is what each one says.`,
    `/house-games/${slug}`
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { houseGames, ops } = siteData;
  const h = houseGames.find((g) => g.slug === slug);
  if (!h) notFound();

  const nameOf = (s: string) => ops.find((o) => o.slug === s)?.name ?? s;
  const others = houseGames.filter((g) => g.slug !== h.slug).slice(0, 4);

  return (
    <main>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "House games", path: "/house-games" }, { name: h.name, path: `/house-games/${slug}` }])} />
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "#0B0F12" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 40px 44px" }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#83919A", marginBottom: 26 }}>
            <Link href="/" style={{ color: "#83919A" }}>Index</Link> / <Link href="/house-games" style={{ color: "#83919A" }}>House games</Link> / <span style={{ color: "#A8B6BE" }}>{h.name}</span>
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
                {h.note} Each casino publishes the edge for its own version, and results are verifiable, so what's left to decide is where you play and how you size and stop.
              </p>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11.5, color: "#83919A" }}>Edges as each casino publishes them · {h.edges.length} casinos</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,.09)", background: "rgba(255,255,255,.07)" }}>
              <StatTile label="Published edges" value={h.edgeRange} color="#5FE3E8" />
              <StatTile label="Casinos listed" value={String(h.edges.length)} />
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
              Whatever edge your casino publishes, the house keeps that share of everything staked, over enough rounds. No bet-sizing pattern changes it, because each round is independent of the last.
            </p>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: "#93A3AC", textWrap: "pretty" }}>
              What you can control is exposure: session size, a stop, and whether you are staking an amount you would shrug at losing. Treat the rest as entertainment priced at that edge.
            </p>
          </div>
        </div>

        <h2 style={{ margin: "0 0 8px", fontSize: 28, letterSpacing: "-.028em", fontWeight: 800, fontStretch: "112%", color: "#E8EDF0" }}>House edge by casino</h2>
        <p style={{ margin: "0 0 20px", maxWidth: "80ch", fontSize: 15, lineHeight: 1.6, color: "#8DA0AA" }}>What each casino publishes for its own {h.name}, with the page it comes from. Where a casino&apos;s pages disagree, both figures are shown. We haven&apos;t checked these inside the games ourselves.</p>
        <div style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 13, overflow: "hidden", background: "#0C1013", marginBottom: 38 }}>
          {h.edges.map((e, i) => (
            <div key={e.url + i} style={{ display: "grid", gridTemplateColumns: "44px 160px 220px 1fr", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
              <div style={{ padding: "12px 0 12px 16px", width: 44 }}>
                {h.edges[i - 1]?.casino !== e.casino && (
                  <div style={{ width: 24, height: 22 }}>
                    <BrandMark slug={e.casino} mono={nameOf(e.casino).slice(0, 2).toUpperCase()} tint={tintFor(e.casino)} fontSize={9} />
                  </div>
                )}
              </div>
              <div style={{ padding: "12px 14px" }}>
                {h.edges[i - 1]?.casino !== e.casino && (
                  <Link href={`/casinos/${e.casino}`} className="hover:!text-accent" style={{ fontSize: 14, fontWeight: 600, color: "#E8EDF0" }}>{nameOf(e.casino)}</Link>
                )}
              </div>
              <div style={{ padding: "12px 14px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 13, color: "#fff" }}>{e.value}</div>
              <div style={{ padding: "12px 18px", fontSize: 12.5, lineHeight: 1.5, color: "#7B8A93" }}>
                {e.note ? `${e.note} · ` : ""}
                <a href={e.url} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#5FE3E8", whiteSpace: "nowrap" }}>{new URL(e.url).hostname.replace(/^www\./, "")} ↗</a>
              </div>
            </div>
          ))}
        </div>

        <h2 style={{ margin: "0 0 20px", fontSize: 24, letterSpacing: "-.025em", fontWeight: 800, fontStretch: "112%", color: "#E8EDF0" }}>Other originals</h2>
        <div style={{ display: "grid", minWidth: 0, gridTemplateColumns: "repeat(auto-fit,minmax(232px,1fr))", gap: 12 }}>
          {others.map((g) => (
            <Link key={g.slug} href={`/house-games/${g.slug}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: 18, borderRadius: 13, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
              <span style={{ width: 30, height: 30, flex: "none", borderRadius: 8, background: g.tint, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, fontWeight: 700, color: "#0A0D0F" }}>{g.mono}</span>
              <span style={{ fontSize: 14.5, fontWeight: 600, color: "#E8EDF0" }}>{g.name}</span>
              <span style={{ marginLeft: "auto", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11.5, color: "#5FE3E8" }}>{g.edgeRange}</span>
            </Link>
          ))}
        </div>
        <FeaturedPartner context={{ kind: "house" }} />
        <NextSteps
          steps={[
            { href: "/house-games", label: "Every house game", hint: "The originals each casino runs, with the edge it publishes." },
            { href: "/crypto-casinos", label: "Where to play them", hint: "The casinos running their own originals, with terms cited." },
            { href: "/rtp-watch", label: "RTP Watch", hint: "The slot side: which casinos ship a cut build." },
          ]}
        />
      </div>
    </main>
  );
}

function StatTile({ label, value, color, small }: { label: string; value: string; color?: string; small?: boolean }) {
  return (
    <div style={{ padding: 20, background: "#12181C" }}>
      <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", color: "#83919A", marginBottom: 7 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: small ? 18 : 24, color: color ?? "#fff" }}>{value}</div>
    </div>
  );
}
