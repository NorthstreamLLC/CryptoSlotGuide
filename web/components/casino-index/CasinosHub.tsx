import Link from "next/link";
import type { ReactNode } from "react";
import { FoldedList } from "@/components/casino-index/FoldedList";
import { CasinoRankList } from "@/components/casino-index/CasinoRankList";
import { siteData, siteCounts } from "@/lib/site-data";
import { brandFor, casinoFacts } from "@/lib/casino-facts";
import { inHouseOrder } from "@/lib/house-order";
import { filterFns } from "@/lib/casino-index";
import { raceFor } from "@/lib/races";
import { reviewPath } from "@/lib/outbound";
import { BrandMark } from "@/components/ui/BrandMark";
import { CodeChip } from "@/components/ui/CodeChip";
import { GeoBlockNote } from "@/components/geo/GeoBlockNote";
import { LineIcon, type IconName } from "@/components/ui/LineIcon";

/**
 * The casinos hub: our pick, a short ranked list that leads into each review,
 * ways to narrow it down, then one next step. The full filterable list of
 * every casino is passed in as `allList` and sits folded under the top 10.
 * Same visual system as the homepage: one surface, hairlines, gold only on
 * buttons, a colour per tile instead of emoji.
 */
const CSS = `
.ch-wrap { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
.ch-crumb { font-size: 13px; color: #6F7C84; margin-bottom: 26px; }
.ch-crumb a { color: #8E9CA4; }
.ch-crumb a:hover { color: #fff; }
.ch-hero { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr); gap: 56px; align-items: center; padding: 40px 0 64px; }
.ch-h1 { margin: 0 0 18px; font-size: clamp(36px, 4.6vw, 54px); line-height: 1.04; letter-spacing: -.04em; font-weight: 700; color: #F7F9FA; text-wrap: balance; }
.ch-lead { margin: 0 0 28px; max-width: 50ch; font-size: 17.5px; line-height: 1.6; color: #98A6AE; }
.ch-btns { display: flex; gap: 10px; flex-wrap: wrap; }
.ch-btn { display: inline-flex; align-items: center; justify-content: center; padding: 13px 20px; border-radius: 11px; font-size: 15px; font-weight: 700; white-space: nowrap; transition: background .15s, border-color .15s, transform .15s; }
.ch-btn:hover { transform: translateY(-1px); }
.ch-light { background: #F2F5F7; color: #0A0D0F; }
.ch-light:hover { background: #fff; }
.ch-line { border: 1px solid rgba(255,255,255,.16); color: #E8EDF0; }
.ch-line:hover { border-color: rgba(255,255,255,.32); }
.ch-gold { background: #FFC531; color: #141007; }
.ch-gold:hover { background: #FFD45E; }
.ch-pick { padding: 26px; border: 1px solid rgba(255,197,49,.28); border-radius: 18px; background: #0F1316; }
.ch-pick-top { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
.ch-tag { display: inline-block; padding: 3px 8px; border-radius: 6px; background: rgba(255,197,49,.12); color: #FFC531; font-size: 11.5px; font-weight: 700; }
.ch-pick-title { margin: 0 0 18px; font-size: 22px; line-height: 1.25; letter-spacing: -.02em; font-weight: 700; color: #fff; }
.ch-facts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 0 0 20px; border: 1px solid rgba(255,255,255,.07); border-radius: 12px; }
.ch-facts div { padding: 11px 12px; min-width: 0; }
.ch-facts div + div { border-left: 1px solid rgba(255,255,255,.07); }
.ch-facts small { display: block; font-size: 11.5px; color: #75828A; }
.ch-facts b { display: block; margin-top: 2px; font-size: 14.5px; font-weight: 700; color: #F2F5F7; }
.ch-pick-actions { display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: center; margin-top: 12px; }
.ch-sec { padding-top: 80px; }
.ch-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 22px; }
.ch-h2 { margin: 0; font-size: 26px; letter-spacing: -.025em; font-weight: 700; color: #F2F5F7; }
.ch-muted { font-size: 13.5px; color: #75828A; }
.ch-muted a { color: #AEBAC1; text-decoration: underline; text-underline-offset: 3px; }
.ch-needs { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; }
.ch-need { display: flex; flex-direction: column; gap: 12px; padding: 18px; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; background: #0D1114; transition: border-color .15s, background .15s; }
.ch-need:hover { border-color: color-mix(in srgb, var(--tint) 55%, transparent); background: color-mix(in srgb, var(--tint) 5%, #0D1114); }
.ch-need-ico { display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 10px; background: color-mix(in srgb, var(--tint) 14%, transparent); border: 1px solid color-mix(in srgb, var(--tint) 35%, transparent); color: var(--tint); }
.ch-need b { font-size: 15px; font-weight: 600; color: #F2F5F7; }
.ch-need small { margin-top: -6px; font-size: 13px; color: #8E9CA4; }
.ch-links { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 18px; font-size: 14.5px; font-weight: 600; }
.ch-links a { color: #C9D3D8; }
.ch-links a:hover { color: #fff; }
.ch-next { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; padding: 22px 26px; border: 1px solid rgba(255,255,255,.08); border-radius: 16px; background: #0D1114; transition: border-color .15s; }
.ch-next:hover { border-color: rgba(255,197,49,.4); }
.ch-next b { display: block; font-size: 19px; font-weight: 700; color: #F2F5F7; }
.ch-next small { display: block; margin-top: 4px; font-size: 14.5px; color: #8E9CA4; }
@media (max-width: 960px) {
  .ch-hero { grid-template-columns: 1fr; gap: 36px; padding: 28px 0 48px; }
  .ch-needs { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 560px) {
  .ch-wrap { padding: 0 16px; }
  .ch-sec { padding-top: 60px; }
  .ch-needs { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ch-pick { padding: 20px; }
}
`;

export function CasinosHub({ allList }: { allList: ReactNode }) {
  const { ops } = siteData;
  const c = siteCounts;
  const ranked = inHouseOrder(ops).slice(0, 10);
  const top = ranked[0];
  const tf = top ? casinoFacts(top) : null;

  const needs: { icon: IconName; label: string; href: string; n: number | null; tint: string }[] = [
    { icon: "bolt", label: "Fastest payouts", href: "/fastest-payouts", n: ops.filter(filterFns.fast).length, tint: "#2FD3DA" },
    { icon: "eyeOff", label: "No KYC", href: "/crypto-casinos/no-kyc", n: ops.filter(filterFns.nokyc).length, tint: "#B284FF" },
    { icon: "target", label: "Low wagering", href: "/lowest-wagering", n: ops.filter(filterFns.lowwager).length, tint: "#FF7EB6" },
    { icon: "ball", label: "Casino + sportsbook", href: "/casino-sportsbooks", n: ops.filter(filterFns.sports).length, tint: "#57E39A" },
    { icon: "coin", label: "By coin", href: "/coins", n: null, tint: "#FF9A5C" },
    { icon: "globe", label: "By country", href: "/legal", n: null, tint: "#5FA8FF" },
  ];

  return (
    <main style={{ background: "#080B0D", color: "#E8EDF0", paddingBottom: 96 }}>
      <style>{CSS}</style>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)", background: "radial-gradient(60% 80% at 15% 0%, rgba(0,194,204,.07), transparent 70%), #0A0D10" }}>
        <div className="ch-wrap" style={{ paddingTop: 30 }}>
          <div className="ch-crumb">
            <Link href="/">Home</Link> / <span style={{ color: "#AEBAC1" }}>Crypto casinos</span>
          </div>
          <section className="ch-hero">
            <div>
              <h1 className="ch-h1">
                The best crypto casinos, <span style={{ color: "#FFC531" }}>picked for you</span>
              </h1>
              <p className="ch-lead">We track {c.casinos} crypto casinos and check every bonus, payout time and licence against the casino&apos;s own pages. Start with our pick, or narrow it down below.</p>
              <div className="ch-btns">
                <a href="#top-10" className="ch-btn ch-light">See the top 10</a>
                <Link href="/find-my-casino" className="ch-btn ch-line">Not sure? Answer 3 questions</Link>
              </div>
            </div>

            {top && tf && (
              <aside className="ch-pick" aria-label="Our pick">
                <div className="ch-pick-top">
                  <span style={{ width: 48, height: 48, borderRadius: 12, overflow: "hidden", flex: "none" }}>
                    <BrandMark slug={top.slug} mono={top.mono} tint={brandFor(top.slug)} radius={12} fontSize={14} />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 17, fontWeight: 700, color: "#F2F5F7" }}>{top.name}</span>
                    <span className="ch-tag">Our #1 pick</span>
                  </span>
                </div>
                <p className="ch-pick-title">{tf.headline}</p>
                <div className="ch-facts" data-keep-grid>
                  <div><small>Withdrawals</small><b>{tf.withdrawals ?? "See terms"}</b></div>
                  <div><small>Min deposit</small><b>{tf.minDeposit ?? "See terms"}</b></div>
                  <div><small>Race</small><b>{raceFor(top.slug)?.label.replace(/ weekly raffle/, " raffle") ?? "None"}</b></div>
                </div>
                {top.promoCode && <CodeChip code={top.promoCode} tint="#FFC531" />}
                <div className="ch-pick-actions" data-keep-grid>
                  <Link href={reviewPath(top.slug)} className="ch-btn ch-gold">Read the {top.name} review</Link>
                  {top.signupUrl && top.affiliate && (
                    <a href={top.signupUrl} target="_blank" rel="nofollow sponsored noopener" data-copy-code={top.promoCode ?? undefined} className="ch-btn ch-line">
                      Visit ↗
                    </a>
                  )}
                </div>
                <GeoBlockNote slug={top.slug} name={top.name} compact />
                <p style={{ margin: "12px 0 0", fontSize: 11.5, color: "#67747C" }}>18+ · T&amp;Cs apply · Affiliate link: we may earn a commission.</p>
              </aside>
            )}
          </section>
        </div>
      </div>

      <div className="ch-wrap">
        <section id="top-10" className="ch-sec" style={{ scrollMarginTop: 100 }}>
          <div className="ch-head">
            <h2 className="ch-h2">Our top 10</h2>
            <span className="ch-muted">
              Placement order includes our commercial deals. <Link href="/how-we-rate">How we rate</Link>
            </span>
          </div>
          <CasinoRankList ops={ranked} />
          <div style={{ marginTop: 18 }}>
            <FoldedList hashes={["all-list", "all-casinos"]} summary={<>Show all {c.casinos} casinos, with filters and sorting <span aria-hidden>↓</span></>}>
              {allList}
            </FoldedList>
          </div>
        </section>

        <section className="ch-sec">
          <div className="ch-head">
            <h2 className="ch-h2">What matters most to you?</h2>
            <span className="ch-muted">Each list is built from the casinos&apos; own terms.</span>
          </div>
          <div className="ch-needs">
            {needs.map((n) => (
              <Link key={n.label} href={n.href} className="ch-need" style={{ ["--tint" as string]: n.tint }}>
                <span className="ch-need-ico"><LineIcon name={n.icon} /></span>
                <b>{n.label}</b>
                <small>{n.n !== null ? `${n.n} casinos` : "Browse"} →</small>
              </Link>
            ))}
          </div>
          <div className="ch-links">
            <a href="#all-list">See all {c.casinos} with filters →</a>
            <Link href="/compare">Compare two side by side →</Link>
          </div>
        </section>

        <section className="ch-sec">
          <Link href="/promo-codes" className="ch-next">
            <span>
              <b>Picked a casino? Check its code first.</b>
              <small>What each code gets you, and the wagering on every welcome offer.</small>
            </span>
            <span className="ch-btn ch-line">See the promo codes →</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
