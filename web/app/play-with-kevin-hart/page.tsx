import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandMark } from "@/components/ui/BrandMark";
import { CodeChip } from "@/components/ui/CodeChip";
import { AuthorByline } from "@/components/ui/AuthorBox";
import { GeoBlockNote } from "@/components/geo/GeoBlockNote";
import { KEVIN_CASINOS, KEVIN_GAMES, KEVIN_PATH, kevinLive } from "@/lib/kevin-promo";

// Rebuilt hourly so the casino cards and CTAs come down when the campaign ends.
export const revalidate = 3600;

const MONO = "var(--font-jetbrains-mono), monospace";
const GOLD = "#FFC531";
const PRAGMATIC = "https://www.pragmaticplay.com/en/";

export function generateMetadata() {
  return pageMetadata(
    "Play with Kevin Hart: Pragmatic Play's $1.25M Free Chips promo",
    "Pragmatic Play x Kevin Hart, 19 October to 7 November 2026: collect PLAY or KEVIN for Free Chips, then bet with Kevin live on 6-7 November. How it works, the prizes, and where to play.",
    KEVIN_PATH
  );
}

const STAGES = [
  {
    name: "Play with Kevin",
    dates: "19 Oct – 2 Nov",
    how: "Letters drop at random as you play: spell P-L-A-Y in the six Kevin's Picks live games, or K-E-V-I-N in any Pragmatic slot. A full word opens a chest of Free Chips.",
    prizes: ["400,000 chests of 10 × $0.20 Free Chips", "25,000 chests of 50 × $0.20 Free Chips"],
  },
  {
    name: "Bet with Kevin",
    dates: "2 – 5 Nov",
    how: "Any real-money bet on a Kevin's Picks live game can drop Free Chips, played from 6 November for 48 hours. Up to 2 prizes per player.",
    prizes: ["60,000 × 5 chips of $0.50 (win up to $25)", "15,000 × 5 chips of $1 (win up to $50)"],
  },
  {
    name: "Kevin Makes It Rain",
    dates: "6 – 7 Nov",
    how: "Kevin Hart co-hosts the live tables. Chips won now are played straight away, within 48 hours. 1 prize per player.",
    prizes: ["500 × 5 chips of $0.20 (win up to $20)"],
  },
];

const faqs = [
  { q: "How do I join Play with Kevin?", a: "Play Pragmatic Play games at a participating casino. There is no opt-in and no code: letters and Free Chips drop at random inside the games while you play, at any stake." },
  { q: "What are the Free Chips worth?", a: "Chips are $0.20, $0.50 or $1 each depending on the stage, played on the six Kevin's Picks live games. Winnings are capped per prize ($20 to $50 in Bet with Kevin) and paid as cash with no wagering." },
  { q: "Which games count?", a: `Live casino: ${KEVIN_GAMES.join(", ")}. During Play with Kevin, any Pragmatic Play slot also drops K-E-V-I-N letters where the casino runs the slot side.` },
  { q: "Where is it not available?", a: "Pragmatic excludes the UK, Ontario, Alberta, Germany, the Netherlands, Spain, Italy, Denmark, Norway, Sweden, Switzerland, Austria, Belgium, Portugal, Greece, the Czech Republic, Slovakia, Croatia, Bulgaria, Romania, Latvia, Lithuania, Ukraine, the Bahamas, Venezuela and Buenos Aires City. Each casino's own country rules apply on top." },
  { q: "Does it change a game's RTP?", a: "No. Pragmatic's terms say the promotion does not alter any game's RTP or chance of winning." },
];

export default function Page() {
  const live = kevinLive();
  const cards = KEVIN_CASINOS.map((c) => ({ ...c, o: siteData.ops.find((o) => o.slug === c.slug) })).filter((c) => c.o);
  const lead = cards[0]?.o;

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={[breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Play with Kevin Hart", path: KEVIN_PATH }]), faqSchema(faqs)]} />

      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(70% 120% at 85% 0%, rgba(255,197,49,.14), transparent 60%), #0A0D10" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 24px 40px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 20 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/providers/pragmatic-play" style={{ color: "#83919A" }}>Pragmatic Play</Link> / <span style={{ color: "#A8B6BE" }}>Play with Kevin Hart</span>
          </div>
          <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,197,49,.35)", marginBottom: 26 }}>
            <picture>
              <source media="(max-width: 700px)" srcSet="/assets/promos/play-with-kevin-mobile.webp" />
              <img src="/assets/promos/play-with-kevin-1920x600.webp" alt="Pragmatic Play x Kevin Hart: Play with Kevin, 19 October to 7 November 2026, $1,250,000" width={1920} height={600} style={{ display: "block", width: "100%", height: "auto" }} />
            </picture>
          </div>
          <h1 style={{ margin: "0 0 12px", fontSize: "clamp(32px, 4.2vw, 50px)", lineHeight: 1.04, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>
            Play with Kevin Hart: <span style={{ color: GOLD }}>500,000+ Free Chip prizes</span>
          </h1>
          <p style={{ margin: "0 0 18px", maxWidth: "64ch", fontSize: 17, lineHeight: 1.6, color: "#B7C4CB" }}>
            {live
              ? "Pragmatic Play's $1.25 million campaign with Kevin Hart runs inside its games at participating casinos until 7 November 2026. There is nothing to opt into: play, collect, and Free Chip winnings are paid as cash with no wagering."
              : "Pragmatic Play's $1.25 million campaign with Kevin Hart ran from 19 October to 7 November 2026 and has now ended."}
          </p>
          <AuthorByline updated="2026-10-23" />
        </div>
      </section>

      {live && lead && (
        <section style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 24px 0" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 28, letterSpacing: "-.02em", fontWeight: 800, color: "#fff" }}>Where to play it</h2>
          <p style={{ margin: "0 0 18px", fontSize: 14.5, color: "#8DA0AA" }}>Casinos whose own promotions page shows the campaign. Sign up with our code and you are in automatically.</p>
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {cards.map(({ slug, sourceUrl, o }, i) => (
              <div key={slug} style={{ padding: 20, borderRadius: 16, background: i === 0 ? "radial-gradient(120% 90% at 50% 0%, rgba(255,197,49,.14), transparent 60%), #0F1418" : "#0C1013", border: `1px solid ${i === 0 ? "rgba(255,197,49,.4)" : "rgba(255,255,255,.08)"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span style={{ width: 44, height: 44, borderRadius: 12, overflow: "hidden" }}>
                    <BrandMark slug={slug} mono={o!.mono} tint={GOLD} radius={12} fontSize={13} />
                  </span>
                  <span>
                    <span style={{ display: "block", fontSize: 18, fontWeight: 800, color: "#fff" }}>{o!.name}</span>
                    {i === 0 && <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: GOLD }}>Our pick</span>}
                  </span>
                </div>
                {o!.promoCode && (
                  <div style={{ marginBottom: 12 }}>
                    <CodeChip code={o!.promoCode} tint={GOLD} />
                  </div>
                )}
                {o!.signupUrl && (
                  <a href={o!.signupUrl} target="_blank" rel="nofollow sponsored noopener" data-copy-code={o!.promoCode ?? undefined} style={{ display: "block", textAlign: "center", padding: "13px 16px", borderRadius: 12, background: i === 0 ? "linear-gradient(180deg,#FFD866,#FFC531)" : "rgba(255,255,255,.08)", color: i === 0 ? "#141007" : "#fff", fontSize: 15, fontWeight: 800 }}>
                    Play at {o!.name} ↗
                  </a>
                )}
                <GeoBlockNote slug={slug} name={o!.name} compact />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12.5 }}>
                  <Link href={`/casinos/${slug}`} style={{ color: "#A8B6BE" }}>Full review</Link>
                  <a href={sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8" }}>
                    Its promo page ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
          <p style={{ margin: "12px 0 0", fontFamily: MONO, fontSize: 10.5, lineHeight: 1.6, color: "#7F8D96" }}>
            Affiliate links: we may earn a commission when you sign up, which never changes what we report. 18+ · T&amp;Cs apply · Play responsibly.
          </p>
        </section>
      )}

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "44px 24px 0" }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 28, letterSpacing: "-.02em", fontWeight: 800, color: "#fff" }}>How it works</h2>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          {STAGES.map((s) => (
            <div key={s.name} style={{ padding: 20, borderRadius: 16, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, marginBottom: 6 }}>{s.dates}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{s.name}</div>
              <p style={{ margin: "0 0 12px", fontSize: 14, lineHeight: 1.55, color: "#A8B6BE" }}>{s.how}</p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.6, color: "#E8EDF0" }}>
                {s.prizes.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18, padding: "16px 18px", borderRadius: 14, background: "rgba(87,227,154,.06)", border: "1px solid rgba(87,227,154,.25)", fontSize: 14, lineHeight: 1.6, color: "#CFE9DB" }}>
          <strong style={{ color: "#fff" }}>The small print, in short:</strong> any stake counts, there is no cost to take part, Free Chip winnings are paid as cash with no wagering, and the promotion does not change any game&apos;s RTP. Free Chips are played on the Kevin&apos;s Picks games: {KEVIN_GAMES.join(", ")}. Prizes are set in euros and paid 1:1 in USD and USDT.
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "44px 24px 0" }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 28, letterSpacing: "-.02em", fontWeight: 800, color: "#fff" }}>Questions</h2>
        {faqs.map((f) => (
          <details key={f.q} style={{ padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
            <summary style={{ cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#fff" }}>{f.q}</summary>
            <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.6, color: "#A8B6BE" }}>{f.a}</p>
          </details>
        ))}
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 24px 70px" }}>
        <p style={{ margin: 0, fontFamily: MONO, fontSize: 11, lineHeight: 1.7, color: "#7F8D96" }}>
          Sources: Pragmatic Play&apos;s promotion terms for Play with Kevin and Bet with Kevin (shown in its games), and each casino&apos;s own promotions page linked above.{" "}
          <a href={PRAGMATIC} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#5FE3E8" }}>pragmaticplay.com ↗</a>
        </p>
      </section>
    </main>
  );
}
