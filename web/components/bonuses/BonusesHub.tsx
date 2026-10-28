import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { inHouseOrder } from "@/lib/house-order";
import { isWelcomeOffer } from "@/lib/casino-bonuses";
import { wagerView } from "@/lib/wager";
import { raceFor, raceSlugs } from "@/lib/races";
import { brandFor } from "@/lib/casino-facts";
import { BrandMark } from "@/components/ui/BrandMark";
import { CodeChip } from "@/components/ui/CodeChip";
import { VipClaim } from "@/components/ui/VipClaim";
import { GeoBlockNote } from "@/components/geo/GeoBlockNote";
import { BonusesPage, toWithdraw } from "@/components/bonuses/BonusesPage";
import { FoldedList } from "@/components/casino-index/FoldedList";
import { kevinLive, KEVIN_PATH } from "@/lib/kevin-promo";
import vip from "@/data/vip.json";

/**
 * The bonuses hub in the four-path pattern: the best offer first, the top
 * offers with their codes and the catch, the full welcome and rewards tables
 * folded (whole in the HTML), ways to narrow it down, then one next step.
 */

const MONO = "var(--font-jetbrains-mono), monospace";
const GOLD = "#FFC531";
const CYAN = "#00C2CC";
/** A code a reader can type; a referral hash is a link parameter, not a code. */
const readable = (code?: string | null) => !!code && /^[A-Za-z]{3,14}$/.test(code);

export function BonusesHub() {
  const { ops } = siteData;
  const roobet = ops.find((o) => o.slug === "roobet");
  // Casinos whose code we would rather not show on the hub (500 Casino's code belongs to another project).
  const HIDE = new Set(["roobet", "500-casino"]);
  const top = inHouseOrder(ops.filter((o) => o.affiliate && o.signupUrl && !HIDE.has(o.slug))).slice(0, 8);
  const welcome = ops.filter(isWelcomeOffer);
  const lowWager = ops.filter((o) => { const w = wagerView(o); return w.kind === "none" || (w.mult !== null && w.mult <= 1); });

  const types = [
    { icon: "🎁", label: "Welcome bonuses", href: "#welcome", n: `${welcome.length} offers` },
    { icon: "♻️", label: "Rakeback & cashback", href: "#rewards", n: `${ops.length - welcome.length} casinos` },
    { icon: "🎯", label: "Lowest wagering", href: "/lowest-wagering", n: `${lowWager.length} casinos` },
    { icon: "🏁", label: "Races & raffles", href: "/races", n: `${raceSlugs().length} casinos` },
    { icon: "🏷️", label: "Roobet code ELITE", href: "/promo-codes/roobet", n: "Welcome package" },
    ...(kevinLive() ? [{ icon: "🎤", label: "Kevin Hart promo", href: KEVIN_PATH, n: "Until 7 Nov" }] : [{ icon: "📈", label: "VIP calculator", href: "/vip-calculator", n: "What your play earns" }]),
  ];

  return (
    <main style={{ background: "#07090B", color: "#E8EDF0" }}>
      {/* 1. The best offer first */}
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(70% 90% at 85% 0%, rgba(255,197,49,.12), transparent 60%), radial-gradient(60% 80% at 0% 100%, rgba(0,194,204,.08), transparent 60%), #090C0F" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 24px 44px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 18 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <span style={{ color: "#A8B6BE" }}>Bonuses</span>
          </div>
          <div style={{ display: "grid", gap: 36, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", alignItems: "center" }}>
            <div>
              <h1 style={{ margin: "0 0 14px", fontSize: "clamp(34px, 4.4vw, 52px)", lineHeight: 1.04, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>
                The best crypto casino bonuses, <span style={{ color: GOLD }}>with the catch spelled out</span>
              </h1>
              <p style={{ margin: "0 0 22px", maxWidth: "52ch", fontSize: 17, lineHeight: 1.6, color: "#9AAAB3" }}>
                Codes, welcome offers and rewards from {ops.length} crypto casinos. Next to every offer: how much you have to bet before you can withdraw, from the casino&apos;s own terms.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a href="#top-offers" style={{ padding: "13px 20px", borderRadius: 12, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.14)", color: "#fff", fontSize: 15, fontWeight: 700 }}>See the top offers ↓</a>
                <Link href="/guides/reading-wagering-requirements" style={{ padding: "13px 20px", borderRadius: 12, color: CYAN, fontSize: 15, fontWeight: 700 }}>What is wagering? →</Link>
              </div>
            </div>

            {roobet?.promoCode && (
              <div style={{ padding: 24, borderRadius: 20, background: "radial-gradient(120% 90% at 50% 0%, rgba(255,197,49,.16), transparent 60%), #0F1418", border: "1px solid rgba(255,197,49,.42)", boxShadow: "0 30px 70px rgba(0,0,0,.45)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <span style={{ width: 56, height: 56, borderRadius: 14, overflow: "hidden", flex: "none" }}>
                    <BrandMark slug="roobet" mono={roobet.mono} tint={GOLD} radius={14} fontSize={15} />
                  </span>
                  <span>
                    <span style={{ display: "block", fontFamily: MONO, fontSize: 11, color: GOLD }}>BEST OFFER THIS WEEK</span>
                    <span style={{ display: "block", fontSize: 24, fontWeight: 800, color: "#fff" }}>Roobet welcome package</span>
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: 14 }} data-keep-grid>
                  {[
                    { t: "20%", d: "deposit match up to $500" },
                    { t: "100 spins", d: "at $10,000 wagered" },
                    { t: "500 spins", d: "at $50,000 wagered" },
                  ].map((x) => (
                    <span key={x.t} style={{ padding: "10px 10px", borderRadius: 12, background: "rgba(255,197,49,.06)", border: "1px solid rgba(255,197,49,.22)" }}>
                      <span style={{ display: "block", fontSize: 17, fontWeight: 800, color: GOLD }}>{x.t}</span>
                      <span style={{ display: "block", fontSize: 11.5, lineHeight: 1.35, color: "#A8B6BE" }}>{x.d}</span>
                    </span>
                  ))}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <CodeChip code={roobet.promoCode} tint={GOLD} />
                </div>
                {roobet.signupUrl && (
                  <a href={roobet.signupUrl} target="_blank" rel="nofollow sponsored noopener" data-copy-code={roobet.promoCode} style={{ display: "block", textAlign: "center", padding: "14px 16px", borderRadius: 12, background: "linear-gradient(180deg,#FFD866,#FFC531)", color: "#141007", fontSize: 15.5, fontWeight: 800 }}>
                    1. Sign up with code {roobet.promoCode} ↗
                  </a>
                )}
                <div style={{ display: "flex", flexDirection: "column", marginTop: 10 }}>
                  <VipClaim label={`2. Claim it with ${vip.name}`} />
                </div>
                <GeoBlockNote slug="roobet" name={roobet.name} compact />
                <Link href="/promo-codes/roobet" style={{ display: "block", marginTop: 12, textAlign: "center", fontSize: 13.5, fontWeight: 700, color: "#FFD36B" }}>Full terms and how to claim →</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Top offers with the catch */}
      <section id="top-offers" style={{ maxWidth: 1180, margin: "0 auto", padding: "52px 24px 0", scrollMarginTop: 100 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 30, letterSpacing: "-.025em", fontWeight: 800, color: "#fff" }}>More top offers</h2>
          <span style={{ fontSize: 13, color: "#7F8D96" }}>Offers and codes are the casinos&apos; own. Placement includes our commercial deals.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {top.map((o) => {
            const w = toWithdraw(o);
            const race = raceFor(o.slug);
            return (
              <div key={o.slug} style={{ padding: "14px 18px", borderRadius: 16, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
                <div className="csg-bonusrow" style={{ display: "grid", gridTemplateColumns: "48px minmax(0,1.9fr) minmax(0,1fr) minmax(0,.9fr) auto", gap: 14, alignItems: "center" }} data-keep-grid>
                  <span style={{ width: 48, height: 48, borderRadius: 12, overflow: "hidden" }}>
                    <BrandMark slug={o.slug} mono={o.mono} tint={brandFor(o.slug)} radius={12} fontSize={13} />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#A8B6BE" }}>{o.name} · {isWelcomeOffer(o) ? "Welcome offer" : "Rewards"}</span>
                    <span style={{ display: "block", fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>{o.bonusShort ?? o.bonus}</span>
                    {race && <span style={{ display: "block", fontSize: 12, color: "#57E39A" }}>🏁 {race.label}</span>}
                  </span>
                  <span className="csg-bonusrow-code">{readable(o.promoCode) ? <CodeChip code={o.promoCode!} tint={GOLD} size="sm" /> : <span style={{ fontSize: 12.5, color: "#A8B6BE" }}>{o.promoCode ? "Code added by our link" : "No code needed"}</span>}</span>
                  <span className="csg-bonusrow-wager" style={{ fontSize: 13 }}>
                    <span style={{ display: "block", fontFamily: MONO, fontSize: 9.5, color: "#7F8D96", textTransform: "uppercase" }}>Wager to withdraw</span>
                    <span style={{ fontWeight: 700, color: w.color }}>{w.text}</span>
                  </span>
                  <span style={{ display: "flex", gap: 8 }}>
                    <a href={o.signupUrl!} target="_blank" rel="nofollow sponsored noopener" data-copy-code={readable(o.promoCode) ? o.promoCode! : undefined} style={{ padding: "10px 16px", borderRadius: 10, background: "linear-gradient(180deg,#FFD866,#FFC531)", color: "#141007", fontSize: 14, fontWeight: 800, whiteSpace: "nowrap" }}>Claim ↗</a>
                    <Link href={`/casinos/${o.slug}`} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.14)", color: "#E8EDF0", fontSize: 14, fontWeight: 700 }}>Review</Link>
                  </span>
                </div>
                <GeoBlockNote slug={o.slug} name={o.name} compact />
              </div>
            );
          })}
        </div>
        <p style={{ margin: "10px 0 0", fontFamily: MONO, fontSize: 10.5, color: "#7F8D96" }}>Claim links are affiliate links: we may earn a commission, which never changes what a review says. 18+ · T&amp;Cs apply.</p>
        <div style={{ marginTop: 18 }}>
          <FoldedList hashes={["all-bonuses", "welcome", "rewards"]} summary={<>Show every bonus from all {ops.length} casinos, with the full terms <span aria-hidden>↓</span></>}>
            <BonusesPage embedded />
          </FoldedList>
        </div>
      </section>

      {/* 3. By type */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "52px 24px 0" }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 26, letterSpacing: "-.02em", fontWeight: 800, color: "#fff" }}>What kind of bonus are you after?</h2>
        <p style={{ margin: "0 0 16px", fontSize: 15, color: "#8DA0AA" }}>A welcome bonus is paid up front and has to be wagered. Rakeback, cashback and races are earned as you play.</p>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
          {types.map((t) => (
            <a key={t.label} href={t.href} className="csg-lift" style={{ display: "flex", flexDirection: "column", gap: 6, padding: "16px 16px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.09)" }}>
              <span style={{ fontSize: 24 }} aria-hidden>{t.icon}</span>
              <span style={{ fontSize: 15.5, fontWeight: 800, color: "#fff" }}>{t.label}</span>
              <span style={{ fontSize: 12.5, color: CYAN }}>{t.n} →</span>
            </a>
          ))}
        </div>
      </section>

      {/* 4. One next step */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 24px 80px" }}>
        <Link href="/guides/reading-wagering-requirements" className="csg-lift" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "24px 28px", borderRadius: 18, background: "radial-gradient(80% 140% at 0% 50%, rgba(0,194,204,.14), transparent 60%), #0F1418", border: "1px solid rgba(0,194,204,.3)" }}>
          <span>
            <span style={{ display: "block", fontFamily: MONO, fontSize: 11, color: CYAN, marginBottom: 6 }}>BEFORE YOU CLAIM</span>
            <span style={{ display: "block", fontSize: 22, fontWeight: 800, color: "#fff" }}>Know what &ldquo;40× wagering&rdquo; really costs</span>
            <span style={{ display: "block", fontSize: 14.5, color: "#A8B6BE", marginTop: 4 }}>A two-minute guide to reading any bonus&apos;s terms, so a big number doesn&apos;t fool you.</span>
          </span>
          <span style={{ padding: "13px 20px", borderRadius: 12, background: CYAN, color: "#04201F", fontSize: 15, fontWeight: 800 }}>Read the guide →</span>
        </Link>
      </section>

      <style>{`@media (max-width: 760px){
        .csg-bonusrow{grid-template-columns:44px minmax(0,1fr) !important;row-gap:10px !important}
        .csg-bonusrow > span:last-child{grid-column:1 / -1}
        .csg-bonusrow-wager{grid-column:2}
        .csg-bonusrow-code{grid-column:2}
      }`}</style>
    </main>
  );
}
