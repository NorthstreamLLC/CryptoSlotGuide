import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AuthorBox, AuthorByline } from "@/components/ui/AuthorBox";
import { FeaturedPartner } from "@/components/ui/FeaturedPartner";
import { NextSteps } from "@/components/layout/NextSteps";

const PATH = "/how-to/blackjack";
const UPDATED = "2026-10-14";
const MONO = "var(--font-jetbrains-mono), monospace";
const EVOLUTION = "https://games.evolution.com/first-person/first-person-blackjack/";

export const metadata = pageMetadata(
  "How to play blackjack: rules and when to hit, stand, double or split",
  "Blackjack rules in plain English, the card values, and a basic strategy chart that shows when to hit, stand, double down or split against every dealer card. Plus the mistakes that cost the most.",
  PATH
);

/* Basic strategy for 4-8 decks, dealer stands on soft 17, double after split allowed, no surrender. */
type Move = "H" | "S" | "D" | "Ds" | "P";
const UP = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "A"];
const row = (s: string): Move[] => s.split(" ") as Move[];

const HARD: [string, Move[]][] = [
  ["8 or less", row("H H H H H H H H H H")],
  ["9", row("H D D D D H H H H H")],
  ["10", row("D D D D D D D D H H")],
  ["11", row("D D D D D D D D D H")],
  ["12", row("H H S S S H H H H H")],
  ["13", row("S S S S S H H H H H")],
  ["14", row("S S S S S H H H H H")],
  ["15", row("S S S S S H H H H H")],
  ["16", row("S S S S S H H H H H")],
  ["17 or more", row("S S S S S S S S S S")],
];
const SOFT: [string, Move[]][] = [
  ["A,2", row("H H H D D H H H H H")],
  ["A,3", row("H H H D D H H H H H")],
  ["A,4", row("H H D D D H H H H H")],
  ["A,5", row("H H D D D H H H H H")],
  ["A,6", row("H D D D D H H H H H")],
  ["A,7", row("S Ds Ds Ds Ds S S H H H")],
  ["A,8", row("S S S S S S S S S S")],
  ["A,9", row("S S S S S S S S S S")],
];
const PAIRS: [string, Move[]][] = [
  ["A,A", row("P P P P P P P P P P")],
  ["10,10", row("S S S S S S S S S S")],
  ["9,9", row("P P P P P S P P S S")],
  ["8,8", row("P P P P P P P P P P")],
  ["7,7", row("P P P P P P H H H H")],
  ["6,6", row("P P P P P H H H H H")],
  ["5,5", row("D D D D D D D D H H")],
  ["4,4", row("H H H P P H H H H H")],
  ["3,3", row("P P P P P P H H H H")],
  ["2,2", row("P P P P P P H H H H")],
];

const COLOR: Record<Move, { bg: string; fg: string; label: string }> = {
  H: { bg: "#E05A5A", fg: "#fff", label: "Hit" },
  S: { bg: "#3DBB7A", fg: "#06150D", label: "Stand" },
  D: { bg: "#F2C14E", fg: "#1A1404", label: "Double (else hit)" },
  Ds: { bg: "#F59E42", fg: "#1A0E02", label: "Double (else stand)" },
  P: { bg: "#4E8FF2", fg: "#fff", label: "Split" },
};

function Chart({ title, sub, rows }: { title: string; sub: string; rows: [string, Move[]][] }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <h3 style={{ margin: "0 0 4px", fontSize: 19, fontWeight: 800, color: "#fff" }}>{title}</h3>
      <p style={{ margin: "0 0 10px", fontSize: 13.5, color: "#8DA0AA" }}>{sub}</p>
      <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid rgba(255,255,255,.08)" }}>
        <table style={{ borderCollapse: "collapse", tableLayout: "fixed", width: "100%", minWidth: 560, fontFamily: MONO, fontSize: 12.5 }}>
          <thead>
            <tr>
              <th style={{ ...TH, textAlign: "left", width: 110 }}>You have</th>
              {UP.map((u) => (
                <th key={u} style={TH}>{u}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([hand, moves]) => (
              <tr key={hand}>
                <td style={{ padding: "8px 12px", background: "#0E1317", color: "#E8EDF0", fontWeight: 700, borderTop: "1px solid rgba(255,255,255,.06)", whiteSpace: "nowrap" }}>{hand}</td>
                {moves.map((m, i) => (
                  <td key={i} title={`${hand} vs ${UP[i]}: ${COLOR[m].label}`} style={{ padding: "8px 0", textAlign: "center", fontWeight: 800, background: COLOR[m].bg, color: COLOR[m].fg, borderTop: "1px solid rgba(0,0,0,.25)", borderLeft: "1px solid rgba(0,0,0,.25)" }}>
                    {m}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Page() {
  const faqs = [
    { q: "When should you hit in blackjack?", a: "Always hit 8 or less. Hit 12 against a dealer 2, 3 or 7 and higher, and hit 13 to 16 against a dealer 7 or higher. Against a dealer 2 to 6, stand on 13 to 16 and let the dealer risk busting." },
    { q: "When should you double down?", a: "Double 11 against every dealer card except an ace, 10 against 2 to 9, and 9 against 3 to 6. Soft hands such as A,6 and A,7 double against a weak dealer card too; see the chart." },
    { q: "What pairs should you always split?", a: "Always split aces and eights. Never split tens or fives: 20 is already a strong hand, and a pair of fives plays as a 10." },
    { q: "Should I take insurance?", a: "Basic strategy never takes insurance. It is a separate side bet that the dealer has blackjack, and it costs more over time than it saves." },
    { q: "Does basic strategy guarantee a win?", a: "No. It is the mathematically best play for each hand under the rules shown, which keeps the house edge as low as the table allows. The casino still keeps an edge." },
  ];

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={[breadcrumbSchema([{ name: "Home", path: "/" }, { name: "How to", path: "/guides" }, { name: "How to play blackjack", path: PATH }]), faqSchema(faqs)]} />

      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(70% 120% at 85% 0%, rgba(61,187,122,.14), transparent 60%), #0A0D10" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "34px 24px 36px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 20 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/guides" style={{ color: "#83919A" }}>Guides</Link> / <span style={{ color: "#A8B6BE" }}>How to play blackjack</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#3DBB7A", marginBottom: 10 }}>How to · 6 min read</div>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(32px, 4.4vw, 52px)", lineHeight: 1.05, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>How to play blackjack, and when to hit</h1>
          <p style={{ margin: "0 0 22px", maxWidth: "62ch", fontSize: 17, lineHeight: 1.6, color: "#B7C4CB" }}>
            The rules in two minutes, then the chart that tells you exactly what to do with every hand against every dealer card.
          </p>
          <AuthorByline updated={UPDATED} />
        </div>
      </section>

      <article style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px 0" }}>
        <div style={{ padding: "22px 24px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)", marginBottom: 36 }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 12 }}>The short version</div>
          {[
            "Get closer to 21 than the dealer without going over.",
            "Stand on 17 or more. Stand on 13 to 16 when the dealer shows 2 to 6.",
            "Double 11 against anything but an ace. Always split aces and eights.",
            "Never take insurance.",
          ].map((t) => (
            <div key={t} style={{ display: "flex", gap: 10, marginBottom: 9, fontSize: 15.5, color: "#E8EDF0" }}>
              <span style={{ color: "#3DBB7A" }}>→</span>
              {t}
            </div>
          ))}
        </div>

        <h2 style={H2}>The rules</h2>
        <p style={P}>You play against the dealer, not the other players. Both of you get two cards; one of the dealer&apos;s is face up. The aim is a total closer to 21 than the dealer&apos;s without going over, which is called busting.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 10, margin: "4px 0 18px" }}>
          {[
            ["2 to 10", "Face value"],
            ["J, Q, K", "Worth 10"],
            ["Ace", "1 or 11, whichever helps"],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: "14px 16px", borderRadius: 12, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{k}</div>
              <div style={{ fontSize: 13.5, color: "#A8B6BE" }}>{v}</div>
            </div>
          ))}
        </div>
        <p style={P}>An ace with any 10-value card as your first two cards is a <strong style={{ color: "#fff" }}>blackjack</strong>, the best hand. A hand with an ace counted as 11 is a <strong style={{ color: "#fff" }}>soft</strong> hand (A,6 is soft 17): it can&apos;t bust on the next card, because the ace drops to 1. Every other hand is <strong style={{ color: "#fff" }}>hard</strong>.</p>
        <p style={P}>On your turn you choose:</p>
        <ul style={{ margin: "0 0 18px", paddingLeft: 20, fontSize: 15.5, lineHeight: 1.7, color: "#C3CFD5" }}>
          <li><strong style={{ color: "#fff" }}>Hit:</strong> take another card.</li>
          <li><strong style={{ color: "#fff" }}>Stand:</strong> keep your total and end your turn.</li>
          <li><strong style={{ color: "#fff" }}>Double down:</strong> double your bet, take exactly one more card, then stand.</li>
          <li><strong style={{ color: "#fff" }}>Split:</strong> with two cards of the same value, split them into two hands, each with its own bet.</li>
        </ul>
        <p style={P}>When every player is done, the dealer reveals the hidden card and draws by a fixed rule, usually hitting until 17 or more. If the dealer busts, every hand still in play wins. The exact table rules, how many decks, whether the dealer hits soft 17 and what a blackjack pays, are in each game&apos;s rules screen; read them before you play.</p>

        <h2 style={H2}>When to hit, stand, double or split</h2>
        <p style={P}>This is basic strategy: the mathematically best move for every hand against every dealer up-card. Find your hand on the left and the dealer&apos;s card along the top. It is for the most common online rules, four to eight decks with the dealer standing on soft 17 and doubling allowed after a split; a table with different rules shifts a few cells.</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "0 0 18px" }}>
          {(Object.keys(COLOR) as Move[]).map((m) => (
            <span key={m} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 8, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)", fontSize: 12.5, color: "#E8EDF0" }}>
              <span style={{ width: 22, height: 18, borderRadius: 4, display: "inline-flex", alignItems: "center", justifyContent: "center", background: COLOR[m].bg, color: COLOR[m].fg, fontFamily: MONO, fontSize: 11, fontWeight: 800 }}>{m}</span>
              {COLOR[m].label}
            </span>
          ))}
        </div>
        <Chart title="Hard totals" sub="No ace, or an ace that has to count as 1." rows={HARD} />
        <Chart title="Soft totals" sub="An ace counted as 11." rows={SOFT} />
        <Chart title="Pairs" sub="Your first two cards are the same value." rows={PAIRS} />

        <h2 style={H2}>The mistakes that cost the most</h2>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12, marginBottom: 18 }}>
          {[
            ["Taking insurance", "It is a side bet that the dealer has blackjack. Basic strategy never takes it."],
            ["Standing on 12 to 16 against a 7 or higher", "It feels safe, but the dealer will usually beat it. Hit."],
            ["Not doubling 11", "Against anything but an ace, 11 is the best double in the game."],
            ["Splitting tens", "20 already wins most of the time. Keep it."],
            ["Hitting soft 18 against a weak card", "Against 3 to 6, double it; against 2, 7 or 8, stand."],
            ["Tables that pay 6:5 for blackjack", "The usual payout is 3:2. A 6:5 table quietly takes more on every blackjack you hit; check the rules screen."],
          ].map(([t, d]) => (
            <div key={t} style={{ padding: "16px 18px", borderRadius: 12, background: "#0C1013", border: "1px solid rgba(224,90,90,.25)" }}>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{t}</div>
              <div style={{ fontSize: 14, lineHeight: 1.55, color: "#A8B6BE" }}>{d}</div>
            </div>
          ))}
        </div>

        <h2 style={H2}>Side bets</h2>
        <p style={P}>
          Many online tables add optional side bets. Evolution&apos;s First Person Blackjack, for example, offers{" "}
          <strong style={{ color: "#fff" }}>Perfect Pairs</strong> (your first two cards make a pair) and <strong style={{ color: "#fff" }}>21+3</strong> (your two cards plus the dealer&apos;s up-card make a poker hand), and lets you play up to five hands at once{" "}
          <a href={EVOLUTION} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 11, color: "#5FE3E8" }}>evolution.com ↗</a>. Side bets pay big but rarely, and basic strategy doesn&apos;t cover them; treat them as an extra bet, not part of the hand.
        </p>

        <h2 style={H2}>Where to play blackjack with crypto</h2>
        <p style={P}>These are the casinos we recommend; each lists its blackjack tables in its own lobby. Before you sit down, open the table&apos;s rules screen and check the payout for a blackjack (3:2 is standard) and whether the dealer hits soft 17.</p>
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
        <p style={{ margin: "22px 0 0", fontSize: 13, lineHeight: 1.6, color: "#77858E" }}>Blackjack is still gambling: basic strategy lowers the house edge, it doesn&apos;t remove it. Set a budget before you play. 18+.</p>
        <div style={{ margin: "30px 0" }}>
          <AuthorBox />
        </div>
        <NextSteps
          steps={[
            { href: "/house-games", label: "Provably fair originals", hint: "Dice, crash, plinko and the rest, and how to check a result." },
            { href: "/slots/best-crypto-slot-sites", label: "Best crypto slot sites", hint: "Where to play, compared on withdrawals and fees." },
            { href: "/guides", label: "All guides", hint: "The operational detail behind the reviews." },
          ]}
        />
      </section>
    </main>
  );
}

const H2: React.CSSProperties = { margin: "40px 0 14px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" };
const P: React.CSSProperties = { margin: "0 0 14px", fontSize: 15.5, lineHeight: 1.7, color: "#C3CFD5" };
const TH: React.CSSProperties = { padding: "9px 0", background: "#151C21", color: "#E8EDF0", fontWeight: 800, textAlign: "center" };
