import Link from "next/link";
import { ogCardPath } from "@/lib/og";
import { siteData, siteCounts } from "@/lib/site-data";
import { brandFor, casinoFacts, licenceLabel } from "@/lib/casino-facts";
import { inHouseOrder } from "@/lib/house-order";
import { topSlotRows } from "@/lib/slot-page";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { itemListSchema } from "@/lib/schema";
import { CodeChip } from "@/components/ui/CodeChip";
import { GeoBlockNote } from "@/components/geo/GeoBlockNote";
import { GeoListNote } from "@/components/geo/GeoListNote";
import { KevinStrip } from "@/components/promo/KevinStrip";
import { BrandMark } from "@/components/ui/BrandMark";
import { getSpecFact } from "@/lib/spec-sheet";
import { reviewPath } from "@/lib/outbound";
import { PROMO_HUB, PROMO_PAGES } from "@/lib/promo-pages";
import { VERSUS_ANALYSIS } from "@/lib/versus-analysis";
import { parsePair } from "@/lib/versus";
import { FACT_ARTICLES } from "@/lib/fact-articles";
import { NEWS, newsPath } from "@/lib/news";

/**
 * The home page is the one page not built through pageMetadata(), so it was
 * the only page shipping without a canonical — the page most likely to be
 * reached as www, with a trailing slash, or on the deployment URL.
 */
export const metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    title: "CryptoSlotGuide — crypto casino, slot and wallet information",
    description:
      "Crypto casinos, sportsbooks, wallets and exchanges reviewed against their own terms, with every fact linked to its source.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website" as const,
    images: [{ url: ogCardPath("Crypto casinos, slots and sportsbooks — every figure sourced", "/"), width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" as const },
};

/** The facts the homepage teases: one fact from three articles, by slug and fact title. */
const FACT_PICKS: [string, string][] = [
  ["duel", "Its operator used to run CSGOEmpire"],
  ["razed", "The first players to reach its top ranks win a car"],
  ["roobet", "An affiliate code boosts your rakeback by 20% for 72 hours"],
];

/**
 * One visual system for the whole page: a single surface colour, hairline
 * borders, one accent (gold) kept for the buttons that lead to an offer, and
 * no glows or gradients behind content. Layout lives here as classes so the
 * markup below stays readable; the sitewide reduced-motion rule still applies.
 */
const CSS = `
.h-wrap { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
.h-sec { padding-top: 88px; }
.h-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 22px; }
.h-h2 { margin: 0; font-size: 26px; line-height: 1.2; letter-spacing: -.025em; font-weight: 700; color: #F2F5F7; }
.h-more { font-size: 14.5px; font-weight: 600; color: #C9D3D8; white-space: nowrap; }
.h-more:hover { color: #fff; }
.h-box { border: 1px solid rgba(255,255,255,.08); border-radius: 16px; background: #0D1114; overflow: hidden; }
.h-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 13px 20px; border-radius: 11px; font-size: 15px; font-weight: 700; white-space: nowrap; transition: background .15s, border-color .15s, transform .15s; }
.h-btn:hover { transform: translateY(-1px); }
.h-btn-gold { background: #FFC531; color: #141007; }
.h-btn-gold:hover { background: #FFD45E; }
.h-btn-light { background: #F2F5F7; color: #0A0D0F; }
.h-btn-light:hover { background: #fff; }
.h-btn-line { border: 1px solid rgba(255,255,255,.16); color: #E8EDF0; }
.h-btn-line:hover { border-color: rgba(255,255,255,.32); }

/* Hero */
.h-hero { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr); gap: 56px; align-items: center; padding: 72px 0 64px; }
.h-h1 { margin: 0 0 18px; font-size: clamp(38px, 5vw, 58px); line-height: 1.04; letter-spacing: -.04em; font-weight: 700; color: #F7F9FA; text-wrap: balance; }
.h-lead { margin: 0 0 30px; max-width: 50ch; font-size: 18px; line-height: 1.6; color: #98A6AE; }
.h-ctas { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 40px; }
.h-paths { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid rgba(255,255,255,.08); }
.h-path { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 15px 4px; border-bottom: 1px solid rgba(255,255,255,.08); }
.h-path:nth-child(odd) { padding-right: 20px; }
.h-path:nth-child(even) { padding-left: 20px; border-left: 1px solid rgba(255,255,255,.08); }
.h-path b { display: block; font-size: 15.5px; font-weight: 600; color: #EEF2F4; }
.h-path small { display: block; margin-top: 2px; font-size: 13px; color: #7E8C94; }
.h-path i { font-style: normal; color: #5E6B73; transition: transform .15s, color .15s; }
.h-path:hover i { transform: translateX(3px); color: #fff; }
.h-also { margin-top: 18px; font-size: 13.5px; color: #6F7C84; }
.h-also a { color: #AEBAC1; }
.h-also a:hover { color: #fff; }

.h-pick { padding: 26px; border: 1px solid rgba(255,197,49,.28); border-radius: 18px; background: #0F1316; }
.h-pick-top { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.h-tag { display: inline-block; padding: 3px 8px; border-radius: 6px; background: rgba(255,197,49,.12); color: #FFC531; font-size: 11.5px; font-weight: 700; letter-spacing: .02em; }
.h-pick-title { margin: 0 0 8px; font-size: 24px; line-height: 1.2; letter-spacing: -.02em; font-weight: 700; color: #fff; }
.h-pick-line { margin: 0 0 20px; font-size: 14.5px; line-height: 1.55; color: #98A6AE; }
.h-pick-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 0 0 22px; border: 1px solid rgba(255,255,255,.07); border-radius: 12px; }
.h-pick-steps div { padding: 11px 12px; }
.h-pick-steps div + div { border-left: 1px solid rgba(255,255,255,.07); }
.h-pick-steps b { display: block; font-size: 15px; font-weight: 700; color: #F2F5F7; }
.h-pick-steps small { display: block; margin-top: 2px; font-size: 11.5px; line-height: 1.35; color: #7E8C94; }
.h-pick-actions { display: flex; flex-direction: column; gap: 10px; }
.h-fine { margin: 12px 0 0; font-size: 11.5px; line-height: 1.55; color: #67747C; }

/* Promo strip */
.h-strip { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; padding: 14px 18px; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; background: #0D1114; font-size: 14.5px; color: #A9B5BC; transition: border-color .15s; }
.h-strip:hover { border-color: rgba(255,255,255,.18); }
.h-strip strong { color: #F2F5F7; font-weight: 600; }
.csg-strip-tag { padding: 3px 8px; border-radius: 6px; background: rgba(255,255,255,.07); color: #DCE3E7; font-size: 11.5px; font-weight: 700; white-space: nowrap; }
.csg-strip-text { flex: 1 1 320px; }
.csg-strip-cta { font-weight: 600; color: #E8EDF0; white-space: nowrap; }

/* Casino list */
.h-row { display: grid; grid-template-columns: 22px minmax(0, 1.25fr) minmax(0, 1.7fr) minmax(0, .8fr) auto; gap: 20px; align-items: center; padding: 16px 20px; }
.h-row + .h-row { border-top: 1px solid rgba(255,255,255,.06); }
.h-rank { font-size: 13px; font-weight: 600; color: #5E6B73; font-variant-numeric: tabular-nums; }
.h-name { display: flex; align-items: center; gap: 12px; min-width: 0; }
.h-name b { display: block; font-size: 16px; font-weight: 700; color: #F2F5F7; }
.h-name small { display: block; margin-top: 1px; font-size: 12.5px; color: #75828A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.h-offer b { display: block; font-size: 15px; line-height: 1.35; font-weight: 600; color: #E8EDF0; }
.h-offer span { display: inline-flex; margin-top: 7px; }
.h-stat small { display: block; font-size: 12px; color: #6F7C84; }
.h-stat b { display: block; margin-top: 2px; font-size: 14.5px; font-weight: 600; color: #E8EDF0; }
.h-act { display: flex; align-items: center; gap: 14px; }
.h-act .h-btn { padding: 10px 18px; font-size: 14px; }
.h-act a.h-link { font-size: 13.5px; color: #93A1A9; }
.h-act a.h-link:hover { color: #fff; }
.h-note { margin: 12px 0 0; font-size: 12px; line-height: 1.55; color: #67747C; }

/* Codes + comparisons */
.h-two { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); gap: 20px; }
.h-sub { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,.06); }
.h-sub h3 { margin: 0; font-size: 16px; font-weight: 700; color: #F2F5F7; }
.h-li { display: flex; align-items: center; gap: 12px; padding: 12px 20px; }
.h-li + .h-li { border-top: 1px solid rgba(255,255,255,.05); }
.h-li-main { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
.h-li-main b { display: block; font-size: 15px; font-weight: 600; color: #EEF2F4; }
.h-li-main small { display: block; font-size: 13px; line-height: 1.4; color: #7E8C94; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
a.h-li:hover b, .h-li-main:hover b { color: #fff; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: rgba(255,255,255,.3); }
.h-vs { color: #6F7C84; font-weight: 500; }
.h-pair { display: flex; flex: none; }
.h-pair span { width: 26px; height: 26px; border-radius: 50%; overflow: hidden; border: 2px solid #0D1114; background: #0D1114; }
.h-pair span + span { margin-left: -8px; }

/* Slots */
.h-slots { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.h-slot { display: block; }
.h-slot-art { display: block; aspect-ratio: 16 / 10; border-radius: 12px; overflow: hidden; background: #11161A; border: 1px solid rgba(255,255,255,.06); }
.h-slot-art img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .4s ease; }
.h-slot:hover .h-slot-art img { transform: scale(1.03); }
.h-slot b { display: block; margin-top: 12px; font-size: 15px; font-weight: 600; color: #EEF2F4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.h-slot small { display: block; margin-top: 2px; font-size: 13px; color: #75828A; }

/* Facts */
.h-facts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.h-fact { display: flex; flex-direction: column; gap: 10px; padding: 20px; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; background: #0D1114; transition: border-color .15s; }
.h-fact:hover { border-color: rgba(255,255,255,.18); }
.h-fact-who { display: flex; align-items: center; gap: 9px; font-size: 13px; color: #8E9CA4; }
.h-fact b { font-size: 17px; line-height: 1.35; font-weight: 600; color: #F2F5F7; }
.h-fact small { margin-top: auto; font-size: 13.5px; color: #A9B5BC; }

/* Trust */
.h-trust { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px; padding: 28px 0 0; border-top: 1px solid rgba(255,255,255,.08); }
.h-trust b { display: block; margin-bottom: 6px; font-size: 15.5px; font-weight: 600; color: #F2F5F7; }
.h-trust p { margin: 0; font-size: 14px; line-height: 1.55; color: #8A98A0; }

@media (max-width: 960px) {
  .h-hero { grid-template-columns: 1fr; gap: 40px; padding: 48px 0 40px; }
  .h-two { grid-template-columns: 1fr; }
  .h-slots { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .h-facts, .h-trust { grid-template-columns: 1fr; gap: 14px; }
  .h-trust { gap: 22px; }
  .h-row { grid-template-columns: 18px minmax(0, 1fr) auto; grid-template-areas: "r n a" "r o o"; row-gap: 10px; gap: 14px; padding: 16px; }
  .h-rank { grid-area: r; align-self: start; padding-top: 10px; }
  .h-name { grid-area: n; }
  .h-offer { grid-area: o; }
  .h-stat { display: none; }
  .h-act { grid-area: a; }
  .h-act a.h-link { display: none; }
}
@media (max-width: 560px) {
  .h-wrap { padding: 0 16px; }
  .h-sec { padding-top: 64px; }
  .h-paths { grid-template-columns: 1fr; }
  .h-path:nth-child(odd), .h-path:nth-child(even) { padding: 14px 2px; border-left: 0; }
  .h-pick { padding: 20px; }
  .h-li { padding: 12px 16px; }
  .h-sub { padding: 14px 16px; }
  .h-li .csg-code-chip { display: none; }
}
`;

export default function HomePage() {
  const { ops } = siteData;
  const c = siteCounts;
  const top = inHouseOrder(ops.filter((o) => !!casinoFacts(o).offer && !/^advertised/i.test(casinoFacts(o).headline))).slice(0, 6);
  const roobet = ops.find((o) => o.slug === "roobet");

  const rooJackpots = !!getSpecFact("roobet", "Bonus terms", "Roo Jackpots");
  const jackpotStrip = rooJackpots ? (
    <Link href="/guides/roo-jackpots-explained" className="h-strip">
      <span className="csg-strip-tag">New at Roobet</span>
      <span className="csg-strip-text">
        <strong>Roo Jackpots</strong> — four jackpots, the biggest starting at $250,000, with no wagering on wins.
      </span>
      <span className="csg-strip-cta">How they work →</span>
    </Link>
  ) : null;

  const rank = { perk: 0, welcome: 1, rewards: 2 } as const;
  const codes = inHouseOrder(ops.filter((o) => PROMO_PAGES.includes(o.slug) && PROMO_HUB[o.slug] && o.promoCode && o.signupUrl))
    .sort((a, b) => rank[PROMO_HUB[a.slug].kind] - rank[PROMO_HUB[b.slug].kind])
    .slice(0, 6);
  const pairs = Object.keys(VERSUS_ANALYSIS)
    .slice(0, 6)
    .flatMap((k) => {
      const p = parsePair(k);
      return p ? [{ k, a: p[0], b: p[1] }] : [];
    });

  const facts = FACT_PICKS.flatMap(([slug, title]) => {
    const o = ops.find((x) => x.slug === slug);
    const a = FACT_ARTICLES[slug];
    const f = a?.facts.find((x) => x.title === title);
    // A teaser only shows while its fact and source are still on the article.
    return o && f && getSpecFact(slug, f.group, f.label)?.sourceUrl ? [{ o, f, n: a.facts.indexOf(f) + 1 }] : [];
  });
  const factTotal = Object.values(FACT_ARTICLES).reduce((n, a) => n + a.facts.length, 0);

  const paths = [
    { t: "Find a casino", d: `${c.casinos} crypto casinos, compared`, href: "/crypto-casinos" },
    { t: "Bonuses & codes", d: "Wagering spelled out", href: "/bonuses" },
    { t: "Top slots", d: "Published RTP and where to play", href: "/slots" },
    { t: "Can I play here?", d: "The law where you live", href: "/legal" },
  ];

  return (
    <>
      {/* Organization and WebSite are sitewide in layout.tsx; the home page
          adds the casino list it leads with, in the same order. */}
      <JsonLd data={[itemListSchema("Crypto casinos we recommend", top.map((o) => ({ name: o.name, path: `/casinos/${o.slug}` })))]} />
      <style>{CSS}</style>
      <main style={{ background: "#080B0D", paddingBottom: 96 }}>
        <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)", background: "radial-gradient(60% 80% at 15% 0%, rgba(0,194,204,.07), transparent 70%), #0A0D10" }}>
          <div className="h-wrap">
            <section className="h-hero">
              <div>
                <h1 className="h-h1">Crypto casinos, checked against their own terms.</h1>
                <p className="h-lead">Bonuses, payout times and RTP from each casino&apos;s and studio&apos;s own pages, with the source linked beside every figure.</p>
                <div className="h-ctas">
                  <Link href="/crypto-casinos" className="h-btn h-btn-light">Compare casinos</Link>
                  <Link href="/promo-codes" className="h-btn h-btn-line">Promo codes</Link>
                </div>
                <nav aria-label="Start here" className="h-paths">
                  {paths.map((p) => (
                    <Link key={p.href} href={p.href} className="h-path">
                      <span>
                        <b>{p.t}</b>
                        <small>{p.d}</small>
                      </span>
                      <i aria-hidden>→</i>
                    </Link>
                  ))}
                </nav>
                <div className="h-also">
                  Also: <Link href="/sportsbooks">Sportsbooks</Link> · <Link href="/prediction-markets">Prediction markets</Link> · <Link href="/wallets">Wallets</Link> · <Link href="/races">Races</Link> · <Link href="/guides">Guides</Link>
                </div>
              </div>

              {roobet?.promoCode && (
                <aside className="h-pick" aria-label="Our pick">
                  <div className="h-pick-top">
                    <span style={{ width: 44, height: 44, flex: "none", borderRadius: 12, overflow: "hidden" }}>
                      <BrandMark slug="roobet" mono={roobet.mono} tint={brandFor("roobet")} radius={12} fontSize={13} />
                    </span>
                    <span>
                      <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: "#F2F5F7" }}>Roobet</span>
                      <span className="h-tag">Our pick</span>
                    </span>
                  </div>
                  <p className="h-pick-title">20% up to $500 + up to 600 free spins</p>
                  <p className="h-pick-line">Sign up with code {roobet.promoCode}, then claim the package through CasinoPerks, the casino VIP team, on Telegram.</p>
                  <div className="h-pick-steps" data-keep-grid>
                    <div><b>20%</b><small>deposit match to $500</small></div>
                    <div><b>100 spins</b><small>at $10,000 wagered</small></div>
                    <div><b>500 spins</b><small>at $50,000 wagered</small></div>
                  </div>
                  <div className="h-pick-actions">
                    <CodeChip code={roobet.promoCode} tint="#FFC531" />
                    <Link href="/promo-codes/roobet" className="h-btn h-btn-gold">Get the Roobet offer</Link>
                  </div>
                  <GeoBlockNote slug="roobet" name={roobet.name} compact />
                  <p className="h-fine">18+ · T&amp;Cs apply · Affiliate offer: we may earn a commission.</p>
                </aside>
              )}
            </section>
          </div>
        </div>

        <div className="h-wrap">
          <div style={{ paddingTop: 28 }}>
            <KevinStrip className="h-strip" fallback={jackpotStrip} />
          </div>

          {/* Top casinos */}
          <section className="h-sec" id="top-offers" style={{ scrollMarginTop: 120 }}>
            <div className="h-head">
              <h2 className="h-h2">Top crypto casinos</h2>
              <Link href="/crypto-casinos" className="h-more">Compare all {c.casinos} →</Link>
            </div>
            <div className="h-box">
              <GeoListNote casinos={top.map((o) => ({ slug: o.slug, name: o.name }))} />
              {top.map((o, i) => {
                const f = casinoFacts(o);
                const outbound = !!(o.affiliate && o.signupUrl);
                return (
                  <div key={o.slug} className="h-row">
                    <span className="h-rank">{i + 1}</span>
                    <Link href={reviewPath(o.slug)} className="h-name">
                      <span style={{ width: 40, height: 40, flex: "none", borderRadius: 10, overflow: "hidden" }}>
                        <BrandMark slug={o.slug} mono={o.mono} tint={brandFor(o.slug)} radius={10} fontSize={12} />
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <b>{o.name}</b>
                        <small>{licenceLabel(o.licence)}</small>
                      </span>
                    </Link>
                    <div className="h-offer">
                      <b>{f.headline}</b>
                      {o.promoCode && outbound && (
                        <span>
                          <CodeChip code={o.promoCode} tint="#FFC531" size="sm" />
                        </span>
                      )}
                    </div>
                    <div className="h-stat">
                      <small>Withdrawals</small>
                      <b>{f.withdrawals ?? "See terms"}</b>
                    </div>
                    <div className="h-act">
                      {outbound ? (
                        <a href={o.signupUrl} target="_blank" rel="nofollow sponsored noopener" data-copy-code={o.promoCode} className="h-btn h-btn-gold">
                          Visit
                        </a>
                      ) : (
                        <Link href={reviewPath(o.slug)} className="h-btn h-btn-line">Review</Link>
                      )}
                      {outbound && <Link href={reviewPath(o.slug)} className="h-link">Review</Link>}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="h-note">Offers are the casinos&apos; own, from their terms. Visit links are affiliate links: we may earn a commission, which never changes what a review says. 18+, play responsibly.</p>
          </section>

          {/* Codes and comparisons */}
          <section className="h-sec">
            <div className="h-head">
              <h2 className="h-h2">Codes and comparisons</h2>
            </div>
            <div className="h-two">
              <div className="h-box">
                <div className="h-sub">
                  <h3>Promo codes</h3>
                  <Link href="/promo-codes" className="h-more" style={{ fontSize: 13.5 }}>All {PROMO_PAGES.length} →</Link>
                </div>
                {codes.map((o) => (
                  <div key={o.slug} className="h-li">
                    <Link href={`/promo-codes/${o.slug}`} className="h-li-main">
                      <span style={{ width: 34, height: 34, flex: "none", borderRadius: 9, overflow: "hidden" }}>
                        <BrandMark slug={o.slug} mono={o.mono} tint={brandFor(o.slug)} radius={9} fontSize={11} />
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <b>{o.name}</b>
                        <small>{o.codePerk?.short ?? PROMO_HUB[o.slug].line}</small>
                      </span>
                    </Link>
                    <CodeChip code={o.promoCode!} tint="#FFC531" size="sm" />
                  </div>
                ))}
              </div>
              <div className="h-box">
                <div className="h-sub">
                  <h3>Head to head</h3>
                  <Link href="/compare" className="h-more" style={{ fontSize: 13.5 }}>All comparisons →</Link>
                </div>
                {pairs.map(({ k, a, b }) => (
                  <Link key={k} href={`/compare/${k}`} className="h-li">
                    <span className="h-pair" aria-hidden>
                      {[a, b].map((o) => (
                        <span key={o.slug}>
                          <BrandMark slug={o.slug} mono={o.mono} tint={brandFor(o.slug)} radius={13} fontSize={9} />
                        </span>
                      ))}
                    </span>
                    <span className="h-li-main">
                      <b>
                        {a.name} <span className="h-vs">vs</span> {b.name}
                      </b>
                    </span>
                    <span aria-hidden style={{ color: "#5E6B73" }}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Top slots */}
          <section className="h-sec">
            <div className="h-head">
              <h2 className="h-h2">Top slots right now</h2>
              <Link href="/slots" className="h-more">All top slots →</Link>
            </div>
            <div className="h-slots">
              {topSlotRows()
                .slice(0, 4)
                .map((r) => (
                  <Link key={r.slug} href={`/slots/${r.slug}`} className="h-slot">
                    <span className="h-slot-art">
                      {r.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.image} alt={r.name} width={320} height={200} loading="lazy" decoding="async" />
                      )}
                    </span>
                    <b>{r.name}</b>
                    <small>
                      {r.provider} · {r.rtp} RTP
                    </small>
                  </Link>
                ))}
            </div>
          </section>

          {/* Facts */}
          {facts.length > 0 && (
            <section className="h-sec">
              <div className="h-head">
                <h2 className="h-h2">Worth knowing before you sign up</h2>
                <span style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {NEWS[0] && <Link href={newsPath(NEWS[0].month)} className="h-more">What changed this month →</Link>}
                  <Link href="/casinos/facts" className="h-more">All {factTotal} facts →</Link>
                </span>
              </div>
              <div className="h-facts">
                {facts.map(({ o, f, n }) => (
                  <Link key={o.slug} href={`/casinos/${o.slug}/facts#fact-${n}`} className="h-fact">
                    <span className="h-fact-who">
                      <span style={{ width: 24, height: 24, flex: "none", borderRadius: 6, overflow: "hidden" }}>
                        <BrandMark slug={o.slug} mono={o.mono} tint={brandFor(o.slug)} radius={6} fontSize={8} />
                      </span>
                      {o.name}
                    </span>
                    <b>{f.title}</b>
                    <small>More about {o.name} →</small>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* How we work */}
          <section className="h-sec">
            <div className="h-trust">
              {[
                { t: "Sourced, not copied", d: "Every fact links to the casino's, studio's or regulator's own page." },
                { t: "Re-checked every month", d: "Bonuses and payout terms are re-read, and every change is logged." },
                { t: "Paid links, clearly marked", d: "We earn from some links. It never changes what a review says." },
              ].map((x) => (
                <div key={x.t}>
                  <b>{x.t}</b>
                  <p>{x.d}</p>
                </div>
              ))}
            </div>
            <p style={{ margin: "20px 0 0" }}>
              <Link href="/how-we-rate" className="h-more">How we rate →</Link>
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
