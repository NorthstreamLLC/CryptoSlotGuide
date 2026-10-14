import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AuthorBox, AuthorByline } from "@/components/ui/AuthorBox";
import { FeaturedPartner } from "@/components/ui/FeaturedPartner";
import { NextSteps } from "@/components/layout/NextSteps";

const PATH = "/how-to/baccarat";
const UPDATED = "2026-10-14";
const MONO = "var(--font-jetbrains-mono), monospace";

export const metadata = pageMetadata(
  "How to play baccarat: rules, payouts and the best bet",
  "Baccarat rules in plain English: card values, when a third card is drawn, what Banker, Player and Tie pay, and why the Banker bet is the best one on the table and the Tie the worst.",
  PATH
);

/** The banker's third-card rule, by the banker's total and the player's third card. */
const BANKER: [string, string][] = [
  ["0, 1 or 2", "Always draws"],
  ["3", "Draws unless the player's third card is an 8"],
  ["4", "Draws if the player's third card is 2 to 7"],
  ["5", "Draws if the player's third card is 4 to 7"],
  ["6", "Draws if the player's third card is 6 or 7"],
  ["7", "Stands"],
];

export default function Page() {
  const faqs = [
    { q: "What is the best bet in baccarat?", a: "Banker. Even after the 5% commission on Banker wins, its house edge (about 1.06% with eight decks) is the lowest on the table, a little under Player at about 1.24%." },
    { q: "Why is the Tie bet bad?", a: "It pays 8:1 but lands far less often than that payout implies. At 8:1 with eight decks its house edge is about 14.4%, more than ten times the Banker bet's." },
    { q: "Do I have to decide when to draw a card?", a: "No. Every draw follows fixed rules, for the Player hand and the Banker hand alike. Your only decision is what to bet on and how much." },
    { q: "What is no-commission baccarat?", a: "A version that pays Banker wins at even money with no 5% commission, but pays only half when Banker wins with a total of 6. That raises the Banker edge to about 1.46%, so standard baccarat with commission is the better deal on Banker bets." },
  ];

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={[breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }, { name: "How to play baccarat", path: PATH }]), faqSchema(faqs)]} />

      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(70% 120% at 85% 0%, rgba(78,143,242,.16), transparent 60%), #0A0D10" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "34px 24px 36px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 20 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/guides" style={{ color: "#83919A" }}>Guides</Link> / <span style={{ color: "#A8B6BE" }}>How to play baccarat</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#4E8FF2", marginBottom: 10 }}>How to · 5 min read</div>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(32px, 4.4vw, 52px)", lineHeight: 1.05, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>How to play baccarat, and the bet to make</h1>
          <p style={{ margin: "0 0 22px", maxWidth: "62ch", fontSize: 17, lineHeight: 1.6, color: "#B7C4CB" }}>
            Baccarat looks complicated and isn&apos;t: the cards are drawn by fixed rules, and your only choice is Banker, Player or Tie. One of those is clearly the best.
          </p>
          <AuthorByline updated={UPDATED} />
        </div>
      </section>

      <article style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px 0" }}>
        <div style={BOX}>
          <div style={KICK}>The short version</div>
          {[
            "Bet on which hand finishes closer to 9: Banker or Player.",
            "Banker is the best bet on the table, even after the 5% commission.",
            "Skip the Tie: it pays 8:1 but carries a house edge over ten times Banker's.",
            "You never decide whether to draw. The rules do it for you.",
          ].map((t) => (
            <div key={t} style={{ display: "flex", gap: 10, marginBottom: 9, fontSize: 15.5, color: "#E8EDF0" }}>
              <span style={{ color: "#4E8FF2" }}>→</span>
              {t}
            </div>
          ))}
        </div>

        <h2 style={H2}>The rules</h2>
        <p style={P}>Two hands are dealt, Player and Banker, two cards each. You don&apos;t play either hand: you bet on which one will finish closer to 9, or on a tie. Despite the names, betting on Banker doesn&apos;t make you the house.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 10, margin: "4px 0 18px" }}>
          {[
            ["Ace", "Worth 1"],
            ["2 to 9", "Face value"],
            ["10, J, Q, K", "Worth 0"],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: "14px 16px", borderRadius: 12, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{k}</div>
              <div style={{ fontSize: 13.5, color: "#A8B6BE" }}>{v}</div>
            </div>
          ))}
        </div>
        <p style={P}>A hand&apos;s total is the last digit of its card values added up: a 7 and an 8 make 15, which counts as <strong style={{ color: "#fff" }}>5</strong>. Nine is the best total. If either hand has 8 or 9 from its first two cards, that is a <strong style={{ color: "#fff" }}>natural</strong>, and both hands stand.</p>

        <h2 style={H2}>When a third card is drawn</h2>
        <p style={P}>Without a natural, the <strong style={{ color: "#fff" }}>Player</strong> hand draws a third card on a total of 0 to 5 and stands on 6 or 7. The <strong style={{ color: "#fff" }}>Banker</strong> hand then follows this table. If the Player stood, the Banker simply draws on 0 to 5 and stands on 6 or 7.</p>
        <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)", marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", background: "#151C21", fontSize: 13, fontWeight: 800, color: "#E8EDF0" }}>
            <span style={{ padding: "10px 14px" }}>Banker has</span>
            <span style={{ padding: "10px 14px" }}>Banker&apos;s move</span>
          </div>
          {BANKER.map(([t, m]) => (
            <div key={t} style={{ display: "grid", gridTemplateColumns: "140px 1fr", borderTop: "1px solid rgba(255,255,255,.06)", background: "#0C1013", fontSize: 14.5 }}>
              <span style={{ padding: "11px 14px", fontFamily: MONO, fontWeight: 700, color: "#fff" }}>{t}</span>
              <span style={{ padding: "11px 14px", color: "#C3CFD5" }}>{m}</span>
            </div>
          ))}
        </div>
        <p style={P}>You don&apos;t need to remember any of this: the dealer or the game applies it. It is here so a result never looks like a mystery.</p>

        <h2 style={H2}>The bets: what they pay and what they cost</h2>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12, marginBottom: 14 }}>
          {[
            { t: "Banker", pay: "1:1, minus 5% commission", e: "1.06%", d: "The best bet on the table. It wins slightly more often than Player, which is why the commission exists.", c: "#57E39A" },
            { t: "Player", pay: "1:1", e: "1.24%", d: "A close second, with no commission to work out.", c: "#4E8FF2" },
            { t: "Tie", pay: "8:1", e: "14.36%", d: "Pays big, lands rarely. The worst bet in the game.", c: "#E05A5A" },
          ].map((b) => (
            <div key={b.t} style={{ padding: 18, borderRadius: 14, background: "#0C1013", border: `1px solid ${b.c}55` }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>{b.t}</div>
              <div style={{ fontSize: 13.5, color: "#FFD36B", margin: "4px 0 8px" }}>Pays {b.pay}</div>
              <div style={{ fontFamily: MONO, fontSize: 26, fontWeight: 800, color: b.c }}>{b.e}</div>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#7F8D96", marginBottom: 8 }}>house edge</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "#A8B6BE" }}>{b.d}</div>
            </div>
          ))}
        </div>
        <p style={NOTE}>House edges worked out for the standard eight-deck game with a 5% Banker commission and Tie paying 8:1. A table paying 9:1 on Tie, or with fewer decks, moves these slightly; the game&apos;s info screen gives its rules.</p>

        <h2 style={H2}>Mistakes that cost the most</h2>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12, marginBottom: 18 }}>
          {[
            ["Betting the Tie", "The 8:1 payout looks generous, but its edge is more than ten times Banker's."],
            ["Avoiding Banker because of the commission", "Even after the 5%, Banker is still the cheapest bet on the table."],
            ["Reading the scoreboard", "The roads and bead plates show past hands. They don't change the next one."],
            ["Side bets", "Pairs and other side bets pay well and rarely. Treat them as an extra bet, not a strategy."],
          ].map(([t, d]) => (
            <div key={t} style={MISTAKE}>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{t}</div>
              <div style={{ fontSize: 14, lineHeight: 1.55, color: "#A8B6BE" }}>{d}</div>
            </div>
          ))}
        </div>

        <h2 style={H2}>Where to play baccarat with crypto</h2>
        <p style={P}>These are the casinos we recommend; each lists its baccarat tables in its own lobby. Open the table&apos;s info screen first to see the commission and what a Tie pays.</p>
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
        <p style={{ margin: "22px 0 0", fontSize: 13, lineHeight: 1.6, color: "#77858E" }}>Baccarat is a game of chance: picking the Banker bet lowers what you lose over time, it doesn&apos;t remove it. Set a budget before you play. 18+.</p>
        <div style={{ margin: "30px 0" }}>
          <AuthorBox />
        </div>
        <NextSteps
          steps={[
            { href: "/how-to/blackjack", label: "How to play blackjack", hint: "The rules and when to hit, stand, double or split." },
            { href: "/how-to/roulette", label: "How to play roulette", hint: "Every bet, what it pays, and which wheel to pick." },
            { href: "/house-games", label: "Provably fair originals", hint: "Dice, crash, plinko and how to check a result." },
          ]}
        />
      </section>
    </main>
  );
}

const H2: React.CSSProperties = { margin: "40px 0 14px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" };
const P: React.CSSProperties = { margin: "0 0 14px", fontSize: 15.5, lineHeight: 1.7, color: "#C3CFD5" };
const NOTE: React.CSSProperties = { margin: "0 0 14px", fontFamily: MONO, fontSize: 11, lineHeight: 1.6, color: "#77858E" };
const BOX: React.CSSProperties = { padding: "22px 24px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)", marginBottom: 36 };
const KICK: React.CSSProperties = { fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 12 };
const MISTAKE: React.CSSProperties = { padding: "16px 18px", borderRadius: 12, background: "#0C1013", border: "1px solid rgba(224,90,90,.25)" };
