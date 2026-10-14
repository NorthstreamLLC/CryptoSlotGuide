import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AuthorBox, AuthorByline } from "@/components/ui/AuthorBox";
import { FeaturedPartner } from "@/components/ui/FeaturedPartner";
import { NextSteps } from "@/components/layout/NextSteps";

const PATH = "/how-to/roulette";
const UPDATED = "2026-10-14";
const MONO = "var(--font-jetbrains-mono), monospace";

export const metadata = pageMetadata(
  "How to play roulette: bets, payouts and odds explained",
  "Roulette rules in plain English: every bet on the table, what it pays and how often it wins, why European roulette beats American, and the betting systems that don't work.",
  PATH
);

/** Every standard bet: numbers covered and payout. Win chance and edge are worked out from the wheel. */
const BETS: { name: string; how: string; n: number; pays: number }[] = [
  { name: "Straight up", how: "One number", n: 1, pays: 35 },
  { name: "Split", how: "Two numbers next to each other", n: 2, pays: 17 },
  { name: "Street", how: "A row of three", n: 3, pays: 11 },
  { name: "Corner", how: "Four numbers in a square", n: 4, pays: 8 },
  { name: "Six line", how: "Two rows, six numbers", n: 6, pays: 5 },
  { name: "Dozen or column", how: "12 numbers", n: 12, pays: 2 },
  { name: "Red / black, odd / even, 1–18 / 19–36", how: "18 numbers", n: 18, pays: 1 },
];
const pct = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`;

export default function Page() {
  const faqs = [
    { q: "What is the best bet in roulette?", a: "On a European wheel every standard bet carries the same house edge, 2.70%, because the single zero is the only pocket that beats you. So the best choice is the wheel, not the bet: play European (single zero) rather than American (double zero), and if you can find French rules with La Partage, even-money bets lose half as much." },
    { q: "Why is American roulette worse?", a: "It adds a second zero. 38 pockets instead of 37, with the same payouts, raises the house edge from 2.70% to 5.26%." },
    { q: "Do betting systems like Martingale work?", a: "No. Doubling after a loss changes the size of your bets, not the odds of each spin. Every spin has the same edge, and a losing run eventually hits your budget or the table limit." },
    { q: "What does the zero do?", a: "Zero is green and belongs to no outside bet: on zero, red, black, odd, even, high and low all lose. That single pocket is where the casino's edge comes from." },
  ];

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={[breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }, { name: "How to play roulette", path: PATH }]), faqSchema(faqs)]} />

      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(70% 120% at 85% 0%, rgba(224,90,90,.16), transparent 60%), #0A0D10" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "34px 24px 36px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 20 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/guides" style={{ color: "#83919A" }}>Guides</Link> / <span style={{ color: "#A8B6BE" }}>How to play roulette</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#E05A5A", marginBottom: 10 }}>How to · 5 min read</div>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(32px, 4.4vw, 52px)", lineHeight: 1.05, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>How to play roulette, and which wheel to pick</h1>
          <p style={{ margin: "0 0 22px", maxWidth: "62ch", fontSize: 17, lineHeight: 1.6, color: "#B7C4CB" }}>
            Every bet on the table, what it pays and how often it wins. The one decision that actually changes your odds is which wheel you sit at.
          </p>
          <AuthorByline updated={UPDATED} />
        </div>
      </section>

      <article style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px 0" }}>
        <div style={BOX}>
          <div style={KICK}>The short version</div>
          {[
            "Pick European roulette (one zero), never American (two zeros).",
            "Every standard bet on a European wheel has the same 2.70% house edge.",
            "French rules with La Partage halve the edge on even-money bets.",
            "No betting system changes the odds of a spin.",
          ].map((t) => (
            <div key={t} style={{ display: "flex", gap: 10, marginBottom: 9, fontSize: 15.5, color: "#E8EDF0" }}>
              <span style={{ color: "#E05A5A" }}>→</span>
              {t}
            </div>
          ))}
        </div>

        <h2 style={H2}>The rules</h2>
        <p style={P}>A European wheel has 37 pockets: the numbers 1 to 36, half red and half black, plus a green zero. You place chips on the table layout, the dealer (or the game) spins the wheel and a ball lands in one pocket. Every bet that covers that number wins; everything else loses.</p>
        <p style={P}>Bets on individual numbers or small groups are <strong style={{ color: "#fff" }}>inside bets</strong>: they pay more and win less often. Bets on big groups, red or black, odd or even, low or high, dozens and columns, are <strong style={{ color: "#fff" }}>outside bets</strong>: smaller payouts, more frequent wins. The zero belongs to no outside bet.</p>

        <h2 style={H2}>Every bet, what it pays and how often it wins</h2>
        <p style={P}>Win chances below are for a European wheel (37 pockets) and an American one (38). The payouts are the same on both, which is exactly why the second zero costs you.</p>
        <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid rgba(255,255,255,.08)", marginBottom: 14 }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 620, fontSize: 14 }}>
            <thead>
              <tr>
                {["Bet", "Covers", "Pays", "Wins (European)", "Wins (American)"].map((h, i) => (
                  <th key={h} style={{ ...TH, textAlign: i < 2 ? "left" : "right" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BETS.map((b) => (
                <tr key={b.name}>
                  <td style={{ ...TD, fontWeight: 700, color: "#fff" }}>{b.name}</td>
                  <td style={TD}>{b.how}</td>
                  <td style={{ ...TD, textAlign: "right", fontFamily: MONO, color: "#FFD36B" }}>{b.pays}:1</td>
                  <td style={{ ...TD, textAlign: "right", fontFamily: MONO, color: "#57E39A" }}>{pct(b.n / 37)}</td>
                  <td style={{ ...TD, textAlign: "right", fontFamily: MONO, color: "#E8A0A0" }}>{pct(b.n / 38)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={NOTE}>Win chance is numbers covered divided by pockets on the wheel.</p>

        <h2 style={H2}>European, American or French?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12, marginBottom: 14 }}>
          {[
            { t: "European", e: "2.70%", d: "37 pockets, one zero. The standard choice.", c: "#57E39A" },
            { t: "American", e: "5.26%", d: "38 pockets, zero and double zero. Same payouts, twice the edge.", c: "#E05A5A" },
            { t: "French", e: "1.35%", d: "One zero, and La Partage returns half of an even-money bet when zero lands. The 1.35% applies to even-money bets.", c: "#4E8FF2" },
          ].map((w) => (
            <div key={w.t} style={{ padding: "18px 18px", borderRadius: 14, background: "#0C1013", border: `1px solid ${w.c}55` }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>{w.t}</div>
              <div style={{ fontFamily: MONO, fontSize: 26, fontWeight: 800, color: w.c, margin: "6px 0 4px" }}>{w.e}</div>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#7F8D96", marginBottom: 8 }}>house edge</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "#A8B6BE" }}>{w.d}</div>
            </div>
          ))}
        </div>
        <p style={P}>The edge comes straight from the wheel. On a European table a straight-up bet pays 35:1 on a 1-in-37 chance, so for every 37 units staked you expect 36 back: 1 unit in 37 is 2.70%. The second zero on an American wheel makes it 2 in 38, 5.26%. The game&apos;s info screen names its variant and rules; check it before you play.</p>

        <h2 style={H2}>Mistakes that cost the most</h2>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12, marginBottom: 18 }}>
          {[
            ["Playing American when European is there", "The same bets at nearly twice the house edge."],
            ["Betting systems", "Martingale, Fibonacci and the rest change your stake sizes, not the odds. A losing streak still ends at your budget or the table limit."],
            ["The five-number bet on American tables", "0, 00, 1, 2 and 3 pays 6:1. It is the one bet with a worse edge than the rest of that table: 7.89%."],
            ["Chasing patterns", "The wheel has no memory. Ten reds in a row don't make black more likely on the next spin."],
          ].map(([t, d]) => (
            <div key={t} style={MISTAKE}>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{t}</div>
              <div style={{ fontSize: 14, lineHeight: 1.55, color: "#A8B6BE" }}>{d}</div>
            </div>
          ))}
        </div>

        <h2 style={H2}>Where to play roulette with crypto</h2>
        <p style={P}>These are the casinos we recommend; each lists its roulette tables in its own lobby. Look for European or French in the table name, and check the game&apos;s info screen before you bet.</p>
      </article>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
        <FeaturedPartner context={{ kind: "general" }} heading="Where we play" />
      </div>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "20px 24px 60px" }}>
        <h2 style={H2}>Questions</h2>
        {faqs.map((f) => (
          <details key={f.q} style={{ padding: "16px 0", borderTop: "1px solid rgba(255,255,255,.08)" }}>
            <summary style={{ cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#fff" }}>{f.q}</summary>
            <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.65, color: "#A8B6BE" }}>{f.a}</p>
          </details>
        ))}
        <p style={{ margin: "22px 0 0", fontSize: 13, lineHeight: 1.6, color: "#77858E" }}>Roulette is a game of chance: no bet or system beats the house edge over time. Set a budget before you play. 18+.</p>
        <div style={{ margin: "30px 0" }}>
          <AuthorBox />
        </div>
        <NextSteps
          steps={[
            { href: "/how-to/blackjack", label: "How to play blackjack", hint: "The rules and when to hit, stand, double or split." },
            { href: "/how-to/baccarat", label: "How to play baccarat", hint: "Banker, player or tie, and the bet to avoid." },
            { href: "/house-games", label: "Provably fair originals", hint: "Dice, crash, plinko and how to check a result." },
          ]}
        />
      </section>
    </main>
  );
}

const H2: React.CSSProperties = { margin: "40px 0 14px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" };
const P: React.CSSProperties = { margin: "0 0 14px", fontSize: 15.5, lineHeight: 1.7, color: "#C3CFD5" };
const NOTE: React.CSSProperties = { margin: "0 0 14px", fontFamily: MONO, fontSize: 11, color: "#77858E" };
const BOX: React.CSSProperties = { padding: "22px 24px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)", marginBottom: 36 };
const KICK: React.CSSProperties = { fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 12 };
const TH: React.CSSProperties = { padding: "10px 14px", background: "#151C21", color: "#E8EDF0", fontWeight: 800, fontSize: 13 };
const TD: React.CSSProperties = { padding: "11px 14px", background: "#0C1013", color: "#C3CFD5", borderTop: "1px solid rgba(255,255,255,.06)" };
const MISTAKE: React.CSSProperties = { padding: "16px 18px", borderRadius: 12, background: "#0C1013", border: "1px solid rgba(224,90,90,.25)" };
