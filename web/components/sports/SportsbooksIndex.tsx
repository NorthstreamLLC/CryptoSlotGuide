import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import { NextSteps } from "@/components/layout/NextSteps";
import { FeaturedPartner } from "@/components/ui/FeaturedPartner";
import { SportsAura } from "@/components/sports/SportsAura";
import { tintFor } from "@/lib/logo";
import {
  sportsFacts,
  sportsOffers,
  sportsRaces,
  sportsBoosts,
  sportsbookOrder,
  sportsPromoLine,
  maxPayoutShort,
  sportsbookHref,
  type SportsHighlight,
} from "@/lib/sports";
import type { Operator } from "@/lib/types";

/**
 * /sportsbooks: the books, led by what a sports bettor chooses on — the
 * standing welcome offers, the races sports bets enter, and the boosts and
 * early payouts — then every book with its sportsbook in a line. Everything
 * links to the book's sportsbook page, never to the casino review.
 */
const MONO = "var(--font-jetbrains-mono), monospace";
const GREEN = "#57B98C";
const GOLD = "#FFC531";

const cap = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);
const firstClause = (v: string) => v.split(/(?<=[a-z0-9)])[.;](?=\s|$)/i)[0].trim();

function BetCta({ o, label }: { o: Pick<Operator, "name" | "affiliate" | "signupUrl"> & { slug: string }; label?: string }) {
  if (o.affiliate && o.signupUrl) {
    return (
      <a href={o.signupUrl} target="_blank" rel="noopener noreferrer sponsored" className="transition-transform hover:-translate-y-px" style={{ padding: "10px 15px", borderRadius: 10, background: GOLD, color: "#141007", fontSize: 13.5, fontWeight: 800, whiteSpace: "nowrap" }}>
        {label ?? `Bet at ${o.name}`}
      </a>
    );
  }
  return null;
}

function Section({ id, kicker, title, sub, children }: { id: string; kicker: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 44, scrollMarginTop: 110 }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: GREEN, marginBottom: 6 }}>{kicker}</div>
      <h2 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, letterSpacing: "-.028em", color: "#fff" }}>{title}</h2>
      <p style={{ margin: "0 0 18px", maxWidth: "76ch", fontSize: 14.5, lineHeight: 1.6, color: "#8DA0AA" }}>{sub}</p>
      {children}
    </section>
  );
}

function HighlightCard({ h, rank, accent, ops }: { h: SportsHighlight; rank: number; accent: string; ops: Map<string, Operator> }) {
  const o = ops.get(h.slug);
  return (
    <div data-reveal className="csg-lift" style={{ ["--reveal-delay" as string]: `${rank * 50}ms`, display: "flex", flexDirection: "column", gap: 10, padding: "18px 20px", borderRadius: 16, background: rank === 0 ? `radial-gradient(120% 120% at 100% 0%, ${accent}1f, transparent 55%), #0E1316` : "#0E1316", border: `1px solid ${rank === 0 ? `${accent}59` : "rgba(255,255,255,.08)"}`, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 44, height: 44, flex: "none" }}>
          <BrandMark slug={h.slug} mono={h.mono} tint={tintFor(h.slug)} radius={10} fontSize={11} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: "#fff" }}>{h.name}</div>
          <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", color: accent }}>{h.tag}</div>
        </div>
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.015em", color: "#fff" }}>{h.headline}</div>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "#A8B6BE" }}>{cap(h.detail)}</p>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: "auto", paddingTop: 6 }}>
        <Link href={sportsbookHref(h.slug)} style={{ padding: "10px 15px", borderRadius: 10, border: "1px solid rgba(255,255,255,.16)", color: "#E8EDF0", fontSize: 13.5, fontWeight: 700 }}>
          Sportsbook profile
        </Link>
        {o && <BetCta o={o} />}
        {h.sourceUrl && (
          <a href={h.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8" }}>
            source ↗
          </a>
        )}
      </div>
    </div>
  );
}

export function SportsbooksIndex() {
  const books = sportsbookOrder();
  const ops = new Map(books.map((o) => [o.slug, o]));
  const offers = sportsOffers();
  const races = sportsRaces();
  const boosts = sportsBoosts();
  const esportsMax = Math.max(0, ...books.map((o) => sportsFacts(o.slug).titles.length));

  return (
    <main style={{ background: "#07090B", color: "#E8EDF0" }}>
      <section style={{ position: "relative", borderBottom: "1px solid rgba(255,255,255,.07)", background: "#090D0C" }}>
        <SportsAura />
        <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "34px 24px 40px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 22 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <span style={{ color: "#A8B6BE" }}>Sportsbooks</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: GREEN, marginBottom: 12 }}>Crypto sportsbooks</div>
          <h1 style={{ margin: "0 0 14px", maxWidth: "20ch", fontSize: "clamp(36px, 4.8vw, 58px)", lineHeight: 1.02, letterSpacing: "-.038em", fontWeight: 800, color: "#fff", textWrap: "balance" }}>
            The best sports welcome offers, races and boosts
          </h1>
          <p style={{ margin: "0 0 24px", maxWidth: "62ch", fontSize: 16.5, lineHeight: 1.6, color: "#A8B6BE", textWrap: "pretty" }}>
            Every crypto sportsbook we track, ranked on what a bettor picks a book for — the standing welcome offer, the races sports bets enter, early payout and multiples
            boosts — each taken from the book&rsquo;s own promotion terms.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 22 }}>
            {[
              [String(books.length), "sportsbooks"],
              [String(offers.length), "standing welcome offers"],
              [String(races.length), "races sports bets enter"],
              [String(boosts.length), "boosts & early payouts"],
              [String(esportsMax), "esports titles at the widest book"],
            ].map(([v, l]) => (
              <span key={l} style={{ display: "inline-flex", alignItems: "baseline", gap: 8, padding: "9px 14px", borderRadius: 100, background: "rgba(9,13,12,.7)", border: "1px solid rgba(255,255,255,.1)", backdropFilter: "blur(6px)", fontSize: 13.5, color: "#A8B6BE" }}>
                <strong style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{v}</strong>
                {l}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              ["#welcome-offers", "Top welcome bonuses"],
              ["#sports-races", "Top sports races"],
              ["#boosts", "Boosts & early payout"],
              ["#every-book", "Every sportsbook"],
              ["/sportsbooks?tab=2", "Esports"],
            ].map(([href, label]) => (
              <Link key={href} href={href} style={{ padding: "9px 16px", borderRadius: 100, border: `1px solid ${GREEN}66`, background: `${GREEN}1a`, fontSize: 13.5, fontWeight: 600, color: "#BDE8D2" }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px 24px" }}>
        <Section id="welcome-offers" kicker="Top welcome bonus" title="The best sports welcome offers" sub="The books that publish a standing sports welcome offer, in the order we put them forward. Most books run rotating promotions instead; those are in the full list below.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 12 }}>
            {offers.map((x, i) => (
              <div key={x.slug} data-reveal className="csg-lift" style={{ ["--reveal-delay" as string]: `${i * 50}ms`, display: "flex", flexDirection: "column", gap: 10, padding: "18px 20px", borderRadius: 16, background: i === 0 ? `radial-gradient(120% 120% at 100% 0%, ${GOLD}1f, transparent 55%), #0E1316` : "#0E1316", border: `1px solid ${i === 0 ? `${GOLD}59` : "rgba(255,255,255,.08)"}`, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, flex: "none" }}>
                    <BrandMark slug={x.slug} mono={x.mono} tint={tintFor(x.slug)} radius={10} fontSize={11} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15.5, fontWeight: 800, color: "#fff" }}>{x.name}</div>
                    <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", color: i === 0 ? GOLD : "#8E9CA5" }}>{i === 0 ? "Our top sports pick" : `#${i + 1} sports offer`}</div>
                  </div>
                </div>
                <div style={{ fontSize: 16, lineHeight: 1.4, fontWeight: 800, color: "#fff", textWrap: "pretty" }}>{x.headline}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 12.5, lineHeight: 1.5, color: "#A8B6BE" }}>
                  {x.wagering && <div><span style={{ color: "#8E9CA5" }}>Wagering · </span>{x.wagering}</div>}
                  {x.minOdds && <div><span style={{ color: "#8E9CA5" }}>Minimum odds · </span>{x.minOdds}</div>}
                  {x.sportsRace && <div style={{ color: "#DCE5E9" }}><span style={{ color: "#8E9CA5" }}>Sports race · </span>{x.sportsRace.split(":")[0]}</div>}
                  {x.race && <div><span style={{ color: "#8E9CA5" }}>Races · </span>{x.race}</div>}
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: "auto", paddingTop: 6 }}>
                  <BetCta o={{ slug: x.slug, name: x.name, affiliate: !!x.signupUrl, signupUrl: x.signupUrl }} label={`Claim at ${x.name}`} />
                  <Link href={sportsbookHref(x.slug)} style={{ padding: "10px 15px", borderRadius: 10, border: "1px solid rgba(255,255,255,.16)", color: "#E8EDF0", fontSize: 13.5, fontWeight: 700 }}>
                    {x.signupUrl ? "Full terms" : "Sportsbook profile"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {races.length > 0 && (
          <Section id="sports-races" kicker="Top races" title="Races your sports bets enter" sub="Leaderboards and raffles where sports bets count — two run on sports bets alone. Read from each book's own race and promotion pages.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 12 }}>
              {races.map((h, i) => (
                <HighlightCard key={h.slug} h={h} rank={i} accent={GOLD} ops={ops} />
              ))}
            </div>
          </Section>
        )}

        {boosts.length > 0 && (
          <Section id="boosts" kicker="Boosts & early payout" title="Early payout and multiples boosts" sub="Standing sportsbook features worth picking a book for: bets settled as winners once your team is far enough ahead, and extra winnings on accumulators.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 12 }}>
              {boosts.map((h, i) => (
                <HighlightCard key={h.slug} h={h} rank={i} accent={GREEN} ops={ops} />
              ))}
            </div>
          </Section>
        )}

        <Section id="every-book" kicker="Every sportsbook" title={`All ${books.length} crypto sportsbooks`} sub="Each book's sports offer, the features it runs and the limits in its betting rules. Open a book for its full sportsbook profile.">
          <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,.08)", background: "linear-gradient(180deg,#0E1317,#0A0E11)", overflow: "hidden" }}>
            {books.map((o, i) => {
              const s = sportsFacts(o.slug);
              const offer = s.offer?.value ? firstClause(String(s.offer.value)) : null;
              const promo = sportsPromoLine(o.slug);
              const facts = [
                s.titles.length ? `${s.titles.length} esports ${s.titles.length === 1 ? "title" : "titles"}` : null,
                s.cashout ? "Cash-out" : null,
                s.betBuilder ? "Bet builder" : null,
                (() => {
                  const m = maxPayoutShort(o.slug);
                  // Only a figure or a rule worth reading; "See profile" and
                  // "Sources disagree" say nothing on a one-line row.
                  return m && !/not found|not stated|see profile|disagree|—/i.test(m) ? `Max payout: ${m}` : null;
                })(),
              ].filter(Boolean) as string[];
              return (
                <div key={o.slug} data-reveal className="grid grid-cols-[44px_minmax(0,1fr)] md:grid-cols-[44px_minmax(0,1fr)_auto]" style={{ gap: "10px 16px", alignItems: "center", padding: "16px 20px", borderTop: i ? "1px solid rgba(255,255,255,.05)" : undefined }}>
                  <Link href={sportsbookHref(o.slug)} style={{ width: 44, height: 44 }}>
                    <BrandMark slug={o.slug} mono={o.mono} tint={tintFor(o.slug)} radius={10} fontSize={11} />
                  </Link>
                  <div style={{ minWidth: 0 }}>
                    <Link href={sportsbookHref(o.slug)} className="hover:!text-accent" style={{ fontSize: 15.5, fontWeight: 800, color: "#fff" }}>{o.name}</Link>
                    <div style={{ fontSize: 13.5, lineHeight: 1.45, color: offer && !/^(rotating|no )/i.test(offer) ? "#DCE5E9" : "#8DA0AA", marginTop: 2 }}>{offer ?? "No sports offer recorded"}</div>
                    {promo && !/^(rotating|no )/i.test(promo) && <div style={{ fontSize: 12.5, lineHeight: 1.45, color: "#BDE8D2", marginTop: 2 }}>{promo.replace(/^(Rotating sports promotions|No sports welcome offer) · /, "")}</div>}
                    {facts.length > 0 && <div style={{ fontFamily: MONO, fontSize: 10.5, color: "#83919A", marginTop: 5 }}>{facts.join(" · ")}</div>}
                  </div>
                  <div className="col-span-2 md:col-span-1" style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <Link href={sportsbookHref(o.slug)} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.16)", color: "#DCE5E9", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                      Sportsbook profile
                    </Link>
                    <BetCta o={o} />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <FeaturedPartner context={{ kind: "sports" }} />
        <NextSteps
          steps={[
            { href: "/sportsbooks?tab=2", label: "Esports betting", hint: "Every esports title and the books that cover it." },
            { href: "/prediction-markets", label: "Prediction markets", hint: "Event markets on crypto-settled venues." },
            { href: "/guides/sportsbook-margin-explained", label: "Sportsbook margin, explained", hint: "Why the same bet pays differently at two books." },
          ]}
        />
      </div>
    </main>
  );
}
