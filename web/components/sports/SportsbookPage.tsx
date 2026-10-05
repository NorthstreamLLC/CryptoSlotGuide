import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import { NextSteps } from "@/components/layout/NextSteps";
import { ReportIssue } from "@/components/ui/ReportIssue";
import { SportsAura } from "@/components/sports/SportsAura";
import { tintFor } from "@/lib/logo";
import { getCasinoSpecSheet } from "@/lib/spec-sheet";
import { getCasinoBonuses } from "@/lib/casino-bonuses";
import { raceFor } from "@/lib/races";
import { sportsFacts, sportsRaces, sportsBoosts, sportsOffers, sportsbookUrl, sportsbookHref } from "@/lib/sports";
import type { Operator, SpecFact } from "@/lib/types";

/**
 * One book's sportsbook, on its own: the sports welcome offer and its terms,
 * the races sports bets enter, the boosts and early payouts it runs, and what
 * you can bet on — every line read from the operator's own pages and cited.
 *
 * The casino review covers the whole operator; this page is for the reader
 * who came to bet on sports, so it leads with the sports offer and ends on
 * the sportsbook itself, not the casino lobby.
 */
const MONO = "var(--font-jetbrains-mono), monospace";
const GREEN = "#57B98C";

const host = (u?: string | null) => {
  if (!u) return null;
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};
const cap = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);
const firstClause = (v: string) => v.split(/(?<=[a-z0-9)])[.;](?=\s|$)/i)[0].trim();

function FactRow({ f }: { f: SpecFact }) {
  const h = host(f.sourceUrl);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(130px, 200px) 1fr", gap: 16, padding: "14px 0", borderTop: "1px solid rgba(255,255,255,.06)" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#8E9CA5", paddingTop: 2 }}>{f.label}</div>
      <div style={{ minWidth: 0 }}>
        {f.chips?.length ? (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {f.chips.map((c) => (
              <span key={c} style={{ padding: "4px 10px", borderRadius: 100, border: "1px solid rgba(87,185,140,.3)", background: "rgba(87,185,140,.08)", fontSize: 12.5, color: "#BDE8D2" }}>{c}</span>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 14.5, lineHeight: 1.6, color: "#DCE5E9", textWrap: "pretty" }}>{f.value}</div>
        )}
        {h && (
          <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ display: "inline-block", marginTop: 5, fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8" }}>
            {h} ↗
          </a>
        )}
      </div>
    </div>
  );
}

function Cta({ o, big = false }: { o: Operator; big?: boolean }) {
  const aff = o.affiliate && o.signupUrl ? o.signupUrl : null;
  const sports = sportsbookUrl(o.slug);
  const href = aff ?? sports;
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel={aff ? "noopener noreferrer sponsored" : "noopener noreferrer nofollow"}
      className="transition-transform hover:-translate-y-px"
      style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: big ? "15px 24px" : "12px 18px", borderRadius: 11, background: "#FFC531", color: "#141007", fontSize: big ? 15.5 : 14, fontWeight: 800, whiteSpace: "nowrap", boxShadow: "0 10px 28px rgba(255,197,49,.18)" }}
    >
      Bet at {o.name} →
    </a>
  );
}

export function SportsbookPage({ o }: { o: Operator }) {
  const sheet = getCasinoSpecSheet(o.slug);
  const book = sheet?.groups.find((g) => g.title === "Sportsbook")?.facts ?? [];
  const terms = sheet?.groups.find((g) => g.title === "Sports bonus terms")?.facts ?? [];
  const s = sportsFacts(o.slug);
  const offer = s.offer?.value ? firstClause(String(s.offer.value)) : null;
  const rotating = !!offer && /^(rotating|no )/i.test(offer);
  const race = sportsRaces().find((r) => r.slug === o.slug);
  const boosts = sportsBoosts().filter((b) => b.slug === o.slug);
  const races = raceFor(o.slug)?.label ?? null;
  const promos = getCasinoBonuses(o.slug).filter((b) => /sport/i.test(`${b.title} ${b.category}`));
  const others = sportsOffers().filter((x) => x.slug !== o.slug).slice(0, 4);
  const titles = s.titles;
  const provider = s.provider?.value ? String(s.provider.value).split(/[.(,;]/)[0].trim() : null;

  const quick: { k: string; v: string }[] = [
    ...(race ? [{ k: "Sports race", v: race.headline }] : []),
    ...(races ? [{ k: "Races", v: races }] : []),
    ...(s.cashout ? [{ k: "Cash-out", v: "Yes" }] : []),
    ...(s.betBuilder ? [{ k: "Bet builder", v: "Yes" }] : []),
    ...(titles.length ? [{ k: "Esports titles", v: String(titles.length) }] : []),
    ...(provider ? [{ k: "Platform", v: provider }] : []),
  ];

  return (
    <main style={{ background: "#07090B", color: "#E8EDF0" }}>
      <section style={{ position: "relative", borderBottom: "1px solid rgba(255,255,255,.07)", background: "#090D0C" }}>
        <SportsAura />
        <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto", padding: "30px 24px 40px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 22 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/sportsbooks" style={{ color: "#83919A" }}>Sportsbooks</Link> /{" "}
            <span style={{ color: "#A8B6BE" }}>{o.name}</span>
          </div>
          <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", marginBottom: 18 }}>
            <div style={{ width: 64, height: 64, flex: "none" }}>
              <BrandMark slug={o.slug} mono={o.mono} tint={tintFor(o.slug)} radius={15} fontSize={16} />
            </div>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: GREEN, marginBottom: 4 }}>Sportsbook profile</div>
              <h1 style={{ margin: 0, fontSize: "clamp(32px, 4.2vw, 48px)", lineHeight: 1.03, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>{o.name} sportsbook</h1>
            </div>
          </div>
          {offer && (
            <p style={{ margin: "0 0 20px", maxWidth: "52ch", fontSize: "clamp(20px, 2.4vw, 27px)", lineHeight: 1.25, letterSpacing: "-.02em", fontWeight: 800, color: rotating ? "#C6D1D7" : "#fff", textWrap: "balance" }}>
              {offer}
            </p>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 22 }}>
            <Cta o={o} big />
            <Link href={`/casinos/${o.slug}`} style={{ padding: "14px 20px", borderRadius: 11, border: "1px solid rgba(255,255,255,.16)", color: "#E8EDF0", fontSize: 14.5, fontWeight: 700 }}>
              Full {o.name} review
            </Link>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: "#77858E" }}>{o.affiliate && o.signupUrl ? "Affiliate link · " : ""}18+ · T&amp;Cs apply</span>
          </div>
          {quick.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
              {quick.map((q) => (
                <div key={q.k} style={{ padding: "13px 15px", borderRadius: 12, background: "rgba(9,13,12,.72)", border: "1px solid rgba(255,255,255,.08)", backdropFilter: "blur(6px)", minWidth: 0 }}>
                  <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#8E9CA5", marginBottom: 4 }}>{q.k}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.35, color: "#fff", overflowWrap: "anywhere" }}>{q.v}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 24px 70px" }}>
        {(race || boosts.length > 0 || promos.length > 0) && (
          <section id="rewards" style={{ marginBottom: 38, scrollMarginTop: 110 }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, letterSpacing: "-.025em", color: "#fff" }}>Sports races and rewards</h2>
            <p style={{ margin: "0 0 16px", maxWidth: "76ch", fontSize: 14, lineHeight: 1.6, color: "#8DA0AA" }}>
              What {o.name} runs for sports bettors beyond the welcome offer, as its own promotion pages describe it.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
              {race && (
                <div style={{ padding: "18px 20px", borderRadius: 15, background: "radial-gradient(120% 120% at 100% 0%, rgba(255,197,49,.12), transparent 55%), #0E1316", border: "1px solid rgba(255,197,49,.32)" }}>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#FFC531", marginBottom: 6 }}>{race.tag}</div>
                  <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{race.headline}</div>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "#A8B6BE" }}>{cap(race.detail)}</p>
                </div>
              )}
              {boosts.map((b) => (
                <div key={b.headline} style={{ padding: "18px 20px", borderRadius: 15, background: "#0E1316", border: "1px solid rgba(87,185,140,.28)" }}>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: GREEN, marginBottom: 6 }}>{b.tag}</div>
                  <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{b.headline}</div>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "#A8B6BE" }}>{cap(b.detail)}</p>
                </div>
              ))}
              {promos
                .filter((p) => !(race && p.title === race.headline) && !boosts.some((b) => b.headline === p.title))
                .map((p) => (
                  <div key={p.title} style={{ padding: "18px 20px", borderRadius: 15, background: "#0E1316", border: "1px solid rgba(255,255,255,.08)" }}>
                    <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#8E9CA5", marginBottom: 6 }}>{p.category}</div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{p.title}</div>
                    <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "#A8B6BE" }}>{p.subCopy}</p>
                  </div>
                ))}
            </div>
          </section>
        )}

        {terms.length > 0 && (
          <section id="offer" style={{ marginBottom: 38, scrollMarginTop: 110 }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, letterSpacing: "-.025em", color: "#fff" }}>{rotating ? "Sports promotions" : "Welcome offer and its terms"}</h2>
            <p style={{ margin: "0 0 6px", maxWidth: "76ch", fontSize: 14, lineHeight: 1.6, color: "#8DA0AA" }}>Each line quoted from {o.name}&rsquo;s own promotion terms, with the page it came from.</p>
            <div style={{ padding: "4px 22px", borderRadius: 16, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
              {terms.map((f) => (
                <FactRow key={f.label} f={f} />
              ))}
            </div>
          </section>
        )}

        {book.length > 0 && (
          <section id="markets" style={{ marginBottom: 38, scrollMarginTop: 110 }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, letterSpacing: "-.025em", color: "#fff" }}>What you can bet on</h2>
            <p style={{ margin: "0 0 6px", maxWidth: "76ch", fontSize: 14, lineHeight: 1.6, color: "#8DA0AA" }}>Sports, esports, cash-out, bet builder and payout limits, from {o.name}&rsquo;s sportsbook and its betting rules.</p>
            <div style={{ padding: "4px 22px", borderRadius: 16, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
              {book.map((f) => (
                <FactRow key={f.label} f={f} />
              ))}
            </div>
          </section>
        )}

        <section style={{ position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap", marginBottom: 38, padding: "24px 26px", borderRadius: 18, border: "1px solid rgba(87,185,140,.3)", background: "#0B110F" }}>
          <SportsAura />
          <div style={{ position: "relative", maxWidth: "60ch" }}>
            <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Ready to bet with {o.name}?</div>
            <div style={{ fontSize: 14, lineHeight: 1.55, color: "#A8B6BE" }}>{offer && !rotating ? offer : `Check ${o.name}'s promotions page for the sports offers live today.`}</div>
          </div>
          <div style={{ position: "relative" }}>
            <Cta o={o} />
          </div>
        </section>

        {others.length > 0 && (
          <section style={{ marginBottom: 30 }}>
            <h2 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>Other sportsbooks with a welcome offer</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10 }}>
              {others.map((x) => (
                <Link key={x.slug} href={sportsbookHref(x.slug)} className="csg-lift" style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px", borderRadius: 13, background: "#0E1316", border: "1px solid rgba(255,255,255,.08)" }}>
                  <div style={{ width: 36, height: 36, flex: "none" }}>
                    <BrandMark slug={x.slug} mono={x.mono} tint={tintFor(x.slug)} radius={9} fontSize={10} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 800, color: "#fff" }}>{x.name}</div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.45, color: "#A8B6BE", marginTop: 2 }}>{x.headline}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <ReportIssue subject={`${o.name} sportsbook`} />
        <NextSteps
          steps={[
            { href: "/sportsbooks", label: "Every sportsbook", hint: "Welcome offers, sports races and boosts across every book we track." },
            { href: `/casinos/${o.slug}`, label: `${o.name}, the full review`, hint: "Payouts, coins, licence and the casino side, each cited." },
            { href: "/esports-casinos", label: "Esports betting", hint: "Books that name the esports titles they cover." },
          ]}
        />
      </div>
    </main>
  );
}
