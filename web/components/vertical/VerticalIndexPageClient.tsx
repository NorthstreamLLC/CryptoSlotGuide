"use client";

import type React from "react";
import Link from "next/link";
import type { VerticalKind, VerticalPage, VerticalRow } from "@/lib/vertical-view";
import { CountUp } from "@/components/ui/CountUp";
import { GuideCover } from "@/components/guides/GuideCover";
import { BrandMark } from "@/components/ui/BrandMark";
import { Icon } from "@/components/ui/Icon";
import { NextSteps } from "@/components/layout/NextSteps";
import { FeaturedPartner } from "@/components/ui/FeaturedPartner";

/**
 * One list page for /slots, /providers, /sportsbooks, /wallets, /exchanges
 * and /guides: hero, optional tabs, and a clean list with three fact columns.
 */
const MONO = "var(--font-jetbrains-mono), monospace";

/** Where a reader of each index usually goes next. Written per list, not generated. */
const INDEX_NEXT: Record<VerticalKind, { href: string; label: string; hint: string }[]> = {
  slots: [
    { href: "/rtp-watch", label: "RTP Watch", hint: "Which casinos ship a cut build of the same slot." },
    { href: "/providers", label: "Game studios", hint: "Which studios publish every RTP version, and which publish none." },
    { href: "/crypto-casinos", label: "Where to play", hint: "The casinos we track, with coins, payouts and offers cited." },
  ],
  providers: [
    { href: "/providers/licences", label: "Studio licence map", hint: "Where each studio holds a licence, from its own licence pages." },
    { href: "/slots", label: "Slot RTP index", hint: "Every title we track and its published return." },
    { href: "/rtp-watch", label: "RTP Watch", hint: "The operators shipping cut builds of these games." },
  ],
  sportsbooks: [
    { href: "/prediction-markets", label: "Prediction markets", hint: "The casinos running event markets alongside the book." },
    { href: "/esports-casinos", label: "Esports betting", hint: "Casinos that name the esports titles they cover." },
    { href: "/bonuses", label: "Every bonus", hint: "Sports and casino offers with the wagering each carries." },
  ],
  wallets: [
    { href: "/coins", label: "Coins we track", hint: "Which casinos take each coin, and on which networks." },
    { href: "/exchanges", label: "Exchanges", hint: "Getting on and off chain, with each venue's fee schedule." },
    { href: "/crypto-casinos/no-kyc", label: "No-KYC casinos", hint: "Where a wallet is all you need to deposit and withdraw." },
  ],
  exchanges: [
    { href: "/wallets", label: "Wallets", hint: "Where to hold the balance once it is off the exchange." },
    { href: "/coins", label: "Coins we track", hint: "Which casinos accept each coin, and on which networks." },
    { href: "/fastest-payouts", label: "Fastest payouts", hint: "Ranked on the withdrawal time each operator states." },
  ],
  guides: [
    { href: "/how-we-rate", label: "How we source every fact", hint: "The method behind every figure on the site." },
    { href: "/crypto-casinos", label: "All crypto casinos", hint: "Put the guide to work on the full index." },
    { href: "/find-my-casino", label: "Find my casino", hint: "Three questions, matched against each casino's own terms." },
  ],
};

export function VerticalIndexPageClient({ kind, tabIdx, vp, after, heroVisual }: { kind: VerticalKind; tabIdx: number; vp: VerticalPage; after?: React.ReactNode; heroVisual?: React.ReactNode }) {
  const hasStat = vp.statLabel !== "";
  const cols = hasStat
    ? "md:grid-cols-[minmax(220px,1.5fr)_minmax(110px,1fr)_minmax(110px,1fr)_minmax(110px,1fr)_90px_130px]"
    : "md:grid-cols-[minmax(220px,1.5fr)_minmax(110px,1fr)_minmax(110px,1fr)_minmax(110px,1fr)_130px]";

  return (
    <main style={{ background: "#07090B" }}>
      <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(80% 120% at 85% 0%, rgba(0,194,204,.09), transparent 55%), radial-gradient(60% 80% at 0% 100%, rgba(155,143,196,.06), transparent 60%), #0A0D10" }}>
        {heroVisual}
        <div className={heroVisual ? "csg-hero-pad" : undefined} style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "40px 24px 40px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 22 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <span style={{ color: "#A8B6BE" }}>{vp.kicker}</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 12 }}>{vp.kicker}</div>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(36px, 4.6vw, 54px)", lineHeight: 1.02, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "114%", color: "#fff", textWrap: "balance" }}>{vp.title}</h1>
          <p style={{ margin: "0 0 26px", maxWidth: "62ch", fontSize: 16.5, lineHeight: 1.6, color: "#A8B6BE", textWrap: "pretty" }}>{vp.sub}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {vp.stats.map(([value, label]) => (
              <span key={label} style={{ display: "inline-flex", alignItems: "baseline", gap: 8, padding: "9px 14px", borderRadius: 100, background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)", fontSize: 13.5, color: "#A8B6BE" }}>
                <strong style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{countable(value)}</strong>
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 24px" }}>
        {vp.links && vp.links.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            {vp.links.map((l, i) => {
              const here = i === 0 && l.href === `/${kind}`;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{ padding: "8px 14px", borderRadius: 100, border: `1px solid ${here ? "rgba(0,194,204,.5)" : "rgba(255,255,255,.12)"}`, background: here ? "rgba(0,194,204,.14)" : "rgba(255,255,255,.02)", fontSize: 13, fontWeight: 600, color: here ? "#5FE3E8" : "#A8B6BE" }}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        )}

        {vp.tabs && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            {vp.tabs.map((t, i) => {
              const active = i === tabIdx;
              return (
                <Link
                  key={t}
                  href={vertHref(kind, i)}
                  style={{ padding: "9px 16px", borderRadius: 100, border: `1px solid ${active ? "rgba(0,194,204,.5)" : "rgba(255,255,255,.12)"}`, background: active ? "rgba(0,194,204,.14)" : "rgba(255,255,255,.02)", fontSize: 13.5, fontWeight: 600, color: active ? "#5FE3E8" : "#A8B6BE" }}
                >
                  {t}
                </Link>
              );
            })}
          </div>
        )}

        {vp.offers && vp.offers.length > 0 && (
          <div id="best-offers" style={{ marginBottom: 22, scrollMarginTop: 110 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>Best sports offers</h2>
              <span style={{ fontFamily: MONO, fontSize: 11, color: "#8E9CA5" }}>Standing welcome offers, as each book publishes them · races from the same pages</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
              {vp.offers.map((o, i) => {
                const lead = i === 0;
                return (
                  <div
                    key={o.slug}
                    data-reveal
                    className="csg-lift"
                    style={{
                      ["--reveal-delay" as string]: `${i * 60}ms`,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      padding: "18px 20px",
                      borderRadius: 16,
                      background: lead ? "radial-gradient(120% 120% at 100% 0%, rgba(255,197,49,.12), transparent 55%), #0E1317" : "#0E1317",
                      border: `1px solid ${lead ? "rgba(255,197,49,.35)" : "rgba(255,255,255,.08)"}`,
                      minWidth: 0,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {/* BrandMark fills whatever box it is given; the box is fixed here so a logo stays a mark and not a hero. */}
                      <div style={{ width: 48, height: 48, flex: "0 0 auto" }}>
                        <BrandMark slug={o.slug} mono={o.mono} tint={lead ? "#FFC531" : "#00C2CC"} radius={10} fontSize={11} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-.015em" }}>{o.name}</div>
                        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".07em", textTransform: "uppercase", color: lead ? "#FFC531" : "#8E9CA5" }}>{lead ? "Our top sports pick" : `#${i + 1} sports offer`}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 15, lineHeight: 1.45, fontWeight: 700, color: "#E8EDF0", textWrap: "pretty" }}>{o.headline}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5, lineHeight: 1.5, color: "#A8B6BE" }}>
                      {o.wagering && <div><span style={{ color: "#8E9CA5" }}>Wagering · </span>{o.wagering}</div>}
                      {o.minOdds && <div><span style={{ color: "#8E9CA5" }}>Minimum odds · </span>{o.minOdds}</div>}
                      {o.sportsRace && <div style={{ color: "#DCE5E9" }}><span style={{ color: "#8E9CA5" }}>Sports race · </span>{o.sportsRace}</div>}
                      {o.race && <div><span style={{ color: "#8E9CA5" }}>Races · </span>{o.race}</div>}
                      {o.promos && <div><span style={{ color: "#8E9CA5" }}>Also · </span>{o.promos}</div>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "auto", paddingTop: 6, flexWrap: "wrap" }}>
                      {o.signupUrl ? (
                        <a href={o.signupUrl} target="_blank" rel="noopener noreferrer sponsored" style={{ padding: "10px 16px", borderRadius: 10, background: lead ? "#FFC531" : "#00C2CC", color: "#0A0D0F", fontSize: 13.5, fontWeight: 800 }}>
                          Claim at {o.name}
                        </a>
                      ) : (
                        <Link href={o.href} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,.14)", color: "#E8EDF0", fontSize: 13.5, fontWeight: 700 }}>
                          Read the review
                        </Link>
                      )}
                      <Link href={`${o.href}#offer`} style={{ fontFamily: MONO, fontSize: 10.5, color: "#8DA0AA" }}>Full terms</Link>
                      {o.sourceUrl && (
                        <a href={o.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8", marginLeft: "auto" }}>
                          source ↗
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ borderRadius: 20, border: "1px solid rgba(255,255,255,.08)", background: "linear-gradient(180deg,#0E1317,#0A0E11)", overflow: "hidden" }}>
          <div className={`hidden md:grid ${cols} items-center gap-4`} style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,.07)", fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#8E9CA5" }}>
            <span>{vp.kicker}</span>
            <span>{vp.cols[0]}</span>
            <span>{vp.cols[1]}</span>
            <span>{vp.cols[2]}</span>
            {hasStat && <span>{vp.statLabel}</span>}
            <span />
          </div>
          {vp.rows.map((r, i) => (
            <Row key={r.slug} r={r} first={i === 0} cols={cols} labels={[...vp.cols, vp.statLabel]} hasStat={hasStat} />
          ))}
        </div>
      </section>

      {after}

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
          <div style={{ padding: "26px 28px", borderRadius: 18, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 10 }}>Good to know</div>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "#A8B6BE", textWrap: "pretty" }}>{vp.note}</p>
          </div>
          <Link href="/how-we-rate" style={{ display: "flex", flexDirection: "column", gap: 10, padding: "26px 28px", borderRadius: 18, background: "linear-gradient(150deg,#10181B,#0B0F12)", border: "1px solid rgba(0,194,204,.2)" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-.015em" }}>How we source every fact</div>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "#A8B6BE", textWrap: "pretty" }}>
              Every figure on this page comes from the operator&apos;s, regulator&apos;s or studio&apos;s own page, and links back to it. Nothing is taken from another review site.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: "auto", paddingTop: 8, fontSize: 13.5, fontWeight: 700, color: "#00C2CC" }}>
              Our method <Icon name="arrow" size={14} />
            </div>
          </Link>
        </div>
        <FeaturedPartner context={kind === "providers" || kind === "slots" ? { kind: "slots" } : kind === "sportsbooks" ? { kind: "sports" } : kind === "guides" ? { kind: "general" } : { kind: "wallet" }} />
        <NextSteps steps={INDEX_NEXT[kind]} />
      </section>
    </main>
  );
}

function Row({ r, first, cols, labels, hasStat }: { r: VerticalRow; first: boolean; cols: string; labels: string[]; hasStat: boolean }) {
  const cell = (label: string, value: string) => (
    <div style={{ minWidth: 0 }}>
      <div className="md:hidden" style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".07em", textTransform: "uppercase", color: "#8E9CA5", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, color: value === "—" || /^not /i.test(value) ? "#77858E" : "#fff", overflowWrap: "anywhere" }}>{value}</div>
    </div>
  );
  return (
    <div data-reveal className={`grid grid-cols-2 ${cols} items-center gap-x-4 gap-y-3 transition-colors hover:bg-white/[0.025]`} style={{ padding: "16px 20px", borderTop: first ? undefined : "1px solid rgba(255,255,255,.05)" }}>
      <div className="col-span-2 md:col-span-1" style={{ minWidth: 0 }}>
      <Link href={r.href} style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        {r.image ? (
          // A game tile, 4:3 like the art, so the title is not cropped off it.
          <span style={{ width: 52, height: 39, flex: "none", borderRadius: 8, overflow: "hidden", background: "#0E1316" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.image} alt="" width={52} height={39} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </span>
        ) : r.cover ? (
          <span style={{ width: 64, height: 36, flex: "none", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)" }}>
            <GuideCover category={r.cover.category} tint={r.tint} label={false} rounded={0} tile />
          </span>
        ) : (
          <span style={{ width: 36, height: 36, flex: "none", borderRadius: 10, overflow: "hidden" }}>
            <BrandMark slug={r.slug} mono={r.mono} tint={r.tint} radius={10} fontSize={11} />
          </span>
        )}
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 15.5, fontWeight: 800, color: "#fff" }}>{r.name}</span>
          {r.note && <span style={{ display: "block", fontSize: 12.5, lineHeight: 1.4, color: "#8DA0AA", marginTop: 2 }}>{r.note}</span>}
        </span>
      </Link>
      {r.thumbs && r.thumbs.length > 0 && (
        <span style={{ display: "flex", gap: 6, marginTop: 8, marginLeft: 48 }}>
          {r.thumbs.map((t) => (
            <Link key={t.href} href={t.href} title={t.name} className="csg-lift" style={{ display: "block", width: 62, height: 39, borderRadius: 7, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.src} alt={t.name} width={62} height={39} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </Link>
          ))}
        </span>
      )}
      {r.extLink && (
        // Outside the row's own link: an anchor cannot sit inside another.
        <a href={r.extLink.href} target="_blank" rel="noopener" className="hover:!text-accent" style={{ display: "inline-block", marginTop: 6, marginLeft: 48, fontFamily: MONO, fontSize: 10.5, letterSpacing: ".04em", color: "#5FE3E8" }}>
          {r.extLink.label} ↗
        </a>
      )}
      </div>
      {cell(labels[0], r.m1)}
      {cell(labels[1], r.m2)}
      {cell(labels[2], r.m3)}
      {hasStat && cell(labels[3], r.stat)}
      <div className="col-span-2 md:col-span-1">
        {r.signupUrl ? (
          <a href={r.signupUrl} target="_blank" rel="noopener sponsored nofollow" className="transition-transform hover:-translate-y-px" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 12px", borderRadius: 10, background: "#FFC531", color: "#141007", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" }}>
            {r.cta} <Icon name="arrow" size={14} />
          </a>
        ) : (
          <Link href={r.href} className="transition-colors hover:!border-white/25" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,.16)", color: "#DCE5E9", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
            {r.cta} <Icon name="arrow" size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}

function vertHref(kind: VerticalKind, tab: number): string {
  if (kind !== "sportsbooks") return `/${kind}`;
  // /casino-sportsbooks and /esports-casinos are casino-list filters, so the
  // sportsbook tabs live under a query param instead of their own URL.
  return tab === 0 ? "/sportsbooks" : "/sportsbooks?tab=2";
}

/** A whole-number stat ("2,427", "46", "12 min") counts up; anything else ("96.8%", "Yes") shows as is. */
function countable(value: string) {
  const m = /^(\d{1,3}(?:,\d{3})*|\d+)(\s.*)?$/.exec(value);
  return m ? <CountUp value={Number(m[1].replace(/,/g, ""))} suffix={m[2] ?? ""} ms={1100} /> : value;
}
