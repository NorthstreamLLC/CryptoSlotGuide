import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandMark } from "@/components/ui/BrandMark";
import { CodeChip } from "@/components/ui/CodeChip";
import { AuthorByline } from "@/components/ui/AuthorBox";
import { GeoBlockNote } from "@/components/geo/GeoBlockNote";
import { KEVIN_CASINOS, KEVIN_GAMES, KEVIN_PATH } from "@/lib/kevin-promo";

const MONO = "var(--font-jetbrains-mono), monospace";
const GOLD = "#FFC531";
const NEWS = "https://www.pragmaticplay.com/en/news/";
const RELEASES = [
  { label: "Pragmatic Play partners with Kevin Hart (2 Sep 2026)", url: `${NEWS}pragmatic-play-partners-with-kevin-hart-for-unforgettable-live-casino-experience/` },
  { label: "Pragmatic Play builds up to Kevin Hart Live (29 Sep 2026)", url: `${NEWS}pragmatic-play-builds-up-to-kevin-hart-live-with-massive-promotion/` },
  { label: "Pragmatic Play counts down to Kevin Hart (19 Oct 2026)", url: `${NEWS}pragmatic-play-counts-down-to-kevin-hart/` },
];


const STAGES = [
  {
    name: "Play with Kevin",
    dates: "19 Oct – 2 Nov",
    how: "Earn: letters drop at random as you play. Spell P-L-A-Y in a Kevin's Picks live game, or K-E-V-I-N in any Pragmatic slot, and pick a chest. The chips are ready straight away, on a countdown timer (24 hours in Pragmatic's example).",
    prizes: ["400,000 chests of 10 × $0.20 Free Chips", "25,000 chests of 50 × $0.20 Free Chips"],
  },
  {
    name: "Bet with Kevin",
    dates: "2 – 5 Nov",
    how: "Earn for the show: any real-money bet on a Kevin's Picks game can drop Free Chips. The game saves them for Kevin's live event: they unlock on 6 November and must be used within 48 hours. Up to 2 prizes per player.",
    prizes: ["60,000 × 5 chips of $0.50 (win up to $25)", "15,000 × 5 chips of $1 (win up to $50)"],
  },
  {
    name: "Kevin Makes It Rain",
    dates: "6 – 7 Nov",
    how: "Redeem: Kevin Hart hosts Pragmatic's live tables across four sessions, and saved chips are played then. Pragmatic says more than 30,000 more prizes drop during the shows, including random cash prizes.",
    prizes: ["30,000+ prizes, Pragmatic says", "Including 500 × 5 chips of $0.20 (win up to $20)"],
  },
];

const LIVE_FAQS = [
  { q: "How do I join Play with Kevin?", a: "Play Pragmatic Play games at a participating casino. There is no opt-in and no code: letters and Free Chips drop at random inside the games while you play, at any stake." },
  { q: "What are the Free Chips worth?", a: "Chips are $0.20, $0.50 or $1 each depending on the stage, played on the six Kevin's Picks live games. Winnings are capped per prize ($20 to $50 in Bet with Kevin) and paid as cash with no wagering." },
  { q: "Where can I use my Free Chips?", a: `Only on the six Kevin's Picks live games: ${KEVIN_GAMES.join(", ")}. That holds even for chips earned on a slot. Chips from Play with Kevin can be used straight away; chips from Bet with Kevin are saved until Kevin's live event and unlock on 6 November. Unused chips expire when the in-game timer ends.` },
  { q: "Which games count?", a: `Live casino: ${KEVIN_GAMES.join(", ")}. During Play with Kevin, any Pragmatic Play slot also drops K-E-V-I-N letters where the casino runs the slot side.` },
  { q: "Where is it not available?", a: "Pragmatic excludes the UK, Ontario, Alberta, Germany, the Netherlands, Spain, Italy, Denmark, Norway, Sweden, Switzerland, Austria, Belgium, Portugal, Greece, the Czech Republic, Slovakia, Croatia, Bulgaria, Romania, Latvia, Lithuania, Ukraine, the Bahamas, Venezuela and Buenos Aires City. Online casinos are also banned in Brazil, and each casino's own restricted list applies on top: Roobet, for example, refuses the US, Australia, Malta, Cyprus, the Netherlands and the UK." },
  { q: "When is Kevin Hart live?", a: "On 6 and 7 November 2026, across four sessions in Pragmatic Play's live casino studio. Pragmatic reveals which games he hosts on each day and posts the broadcast schedule on its official channels." },
  { q: "Does it change a game's RTP?", a: "No. Pragmatic's terms say the promotion does not alter any game's RTP or chance of winning." },
];

/** After the deadline: the same answers in the past tense, minus the how-to-join ones. */
const ENDED_FAQS = [
  { q: "Is Play with Kevin still running?", a: "No. Pragmatic Play's Kevin Hart promotion ran from 19 October to 7 November 2026 and closed at 17:30 UTC on 7 November. Free Chips that weren't used before their in-game timer ran out have expired." },
  ...LIVE_FAQS.filter((f) => !["How do I join Play with Kevin?", "When is Kevin Hart live?", "Where is it not available?"].includes(f.q)),
];


/** The page body; `live` is false after the deadline (and on the hidden preview of that state). */
export function KevinPage({ live }: { live: boolean }) {
  const faqs = live ? LIVE_FAQS : ENDED_FAQS;
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
            Play with Kevin Hart: <span style={{ color: GOLD }}>$1.25M prize pool</span>
          </h1>
          {!live && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "5px 12px", borderRadius: 100, background: "rgba(255,126,182,.12)", border: "1px solid rgba(255,126,182,.4)", fontFamily: MONO, fontSize: 11, letterSpacing: ".08em", color: "#FF9CC6" }}>
              ENDED · 7 NOVEMBER 2026
            </div>
          )}
          <p style={{ margin: "0 0 18px", maxWidth: "64ch", fontSize: 17, lineHeight: 1.6, color: "#B7C4CB" }}>
            {live
              ? "Pragmatic Play's $1.25 million campaign with Kevin Hart runs inside its games at participating casinos until 7 November 2026. It works in two steps: you earn Free Chips while you play, then use them on six \"Kevin's Picks\" live games, and what they win is paid as cash with no wagering. There is nothing to opt into."
              : "Pragmatic Play's $1.25 million campaign with Kevin Hart ran from 19 October to 7 November 2026 and has now ended. Players earned Free Chips in Pragmatic's games, played them on six \"Kevin's Picks\" live games, and kept what they won as cash. Here's how it worked, and what's running now instead."}
          </p>
          <AuthorByline updated="2026-10-23" />
        </div>
      </section>

      {!live && (
        <section style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 24px 0" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 28, letterSpacing: "-.02em", fontWeight: 800, color: "#fff" }}>Running now instead</h2>
          <p style={{ margin: "0 0 18px", fontSize: 14.5, color: "#8DA0AA" }}>Standing offers that don&apos;t end on a date.</p>
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {[
              { icon: "🏷️", t: "Every promo code", d: "What each casino's code gets you, from rakeback boosts to welcome packages.", href: "/promo-codes", tint: GOLD },
              { icon: "🏁", t: "Races & raffles", d: "Daily, weekly and monthly prize pools that reset and run again.", href: "/races", tint: "#57E39A" },
              { icon: "🎰", t: "Top slots right now", d: "The studios' published RTP and max win, and where to play them.", href: "/slots", tint: "#FF7EB6" },
            ].map((x) => (
              <Link key={x.href} href={x.href} className="csg-lift" style={{ display: "flex", flexDirection: "column", gap: 8, padding: "18px 20px", borderRadius: 16, background: `radial-gradient(100% 90% at 0% 0%, ${x.tint}1a, transparent 60%), #0C1013`, border: `1px solid ${x.tint}44` }}>
                <span aria-hidden style={{ fontSize: 26 }}>{x.icon}</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{x.t}</span>
                <span style={{ fontSize: 14, lineHeight: 1.5, color: "#A8B6BE" }}>{x.d}</span>
                <span style={{ marginTop: "auto", fontSize: 14, fontWeight: 700, color: x.tint }}>Open →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

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
        <h2 style={{ margin: "0 0 16px", fontSize: 28, letterSpacing: "-.02em", fontWeight: 800, color: "#fff" }}>{live ? "How it works" : "How it worked"}</h2>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginBottom: 18 }}>
          {[
            { n: "1", t: "Earn Free Chips", d: "Play Pragmatic slots or Kevin's Picks live games. Letters and chips drop at random, at any stake." },
            { n: "2", t: "Use them on Kevin's Picks", d: "Chips only play on the six Kevin's Picks live games, before the in-game timer ends." },
            { n: "3", t: "Keep the winnings", d: "What your chips win is paid as cash, with no wagering, up to each prize's cap." },
          ].map((x) => (
            <div key={x.n} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px", borderRadius: 14, background: "rgba(255,197,49,.06)", border: "1px solid rgba(255,197,49,.25)" }}>
              <span style={{ width: 28, height: 28, flex: "none", borderRadius: "50%", background: GOLD, color: "#141007", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{x.n}</span>
              <span>
                <span style={{ display: "block", fontSize: 15.5, fontWeight: 800, color: "#fff" }}>{x.t}</span>
                <span style={{ display: "block", fontSize: 13.5, lineHeight: 1.5, color: "#A8B6BE" }}>{x.d}</span>
              </span>
            </div>
          ))}
        </div>
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
        <h2 style={{ margin: "0 0 10px", fontSize: 28, letterSpacing: "-.02em", fontWeight: 800, color: "#fff" }}>{live ? "The live event: Kevin Hart takes over the studio" : "The live event: Kevin Hart in the studio"}</h2>
        <p style={{ margin: "0 0 14px", maxWidth: "75ch", fontSize: 15.5, lineHeight: 1.65, color: "#B7C4CB" }}>
          {live
            ? "On 6 and 7 November, Kevin Hart steps onto Pragmatic Play's live casino studio floor to host some of its most popular live games across four sessions. Pragmatic is keeping the exact tables secret until each day. The Free Chips from the build-up promotions are played in those games, and Pragmatic says random cash prizes will drop while Hart is hosting."
            : "On 6 and 7 November, Kevin Hart was scheduled to host some of Pragmatic Play's live casino games across four sessions, where the Free Chips saved from Bet with Kevin were played. Pragmatic said random cash prizes would drop while Hart was hosting."}
        </p>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          <blockquote style={{ margin: 0, padding: "16px 18px", borderRadius: 14, background: "#0C1013", borderLeft: `3px solid ${GOLD}`, fontSize: 14.5, lineHeight: 1.6, color: "#E8EDF0" }}>
            &ldquo;I&apos;ve seen what they&apos;ve got planned and let me tell you; they don&apos;t do things small. I&apos;m bringing the Kevin energy to Pragmatic Play.&rdquo;
            <footer style={{ marginTop: 8, fontSize: 12.5, color: "#8DA0AA" }}>Kevin Hart, in Pragmatic Play&apos;s announcement</footer>
          </blockquote>
          <blockquote style={{ margin: 0, padding: "16px 18px", borderRadius: 14, background: "#0C1013", borderLeft: `3px solid ${GOLD}`, fontSize: 14.5, lineHeight: 1.6, color: "#E8EDF0" }}>
            &ldquo;A total prize pool of €1,250,000 can be unlocked by both live casino and slots players as we prepare for an unmissable two days of live action with Kevin.&rdquo;
            <footer style={{ marginTop: 8, fontSize: 12.5, color: "#8DA0AA" }}>Irina Cornides, COO, Pragmatic Play</footer>
          </blockquote>
        </div>
        {live && <p style={{ margin: "12px 0 0", fontSize: 13, color: "#8DA0AA" }}>Pragmatic says the event is not available in the UK or the US, and may be restricted elsewhere. The broadcast schedule goes up on its official channels on the day.</p>}
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
          Sources: Pragmatic Play&apos;s announcements, its promotion terms for Play with Kevin and Bet with Kevin (shown in its games), and each casino&apos;s own promotions page linked above.
          {RELEASES.map((x) => (
            <span key={x.url} style={{ display: "block" }}>
              <a href={x.url} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#5FE3E8" }}>{x.label} ↗</a>
            </span>
          ))}
        </p>
      </section>
    </main>
  );
}
