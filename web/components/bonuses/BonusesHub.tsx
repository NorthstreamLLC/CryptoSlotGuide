import Link from "next/link";
import { PROMO_PAGES, typeableCode } from "@/lib/promo-pages";
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
import { GeoListNote } from "@/components/geo/GeoListNote";
import { LineIcon, type IconName } from "@/components/ui/LineIcon";
import { reviewPath } from "@/lib/outbound";
import { BonusesPage, toWithdraw } from "@/components/bonuses/BonusesPage";
import { FoldedList } from "@/components/casino-index/FoldedList";
import { kevinLive, KEVIN_PATH, KEVIN_END } from "@/lib/kevin-promo";
import { Until } from "@/components/ui/Until";
import { OfferStack } from "@/components/bonuses/OfferStack";
import { hasPromoPage as hasPromo } from "@/lib/promo-pages";
import vip from "@/data/vip.json";

/**
 * The bonuses hub: the best offer first, the top offers with their codes and
 * the catch, the full welcome and rewards tables folded (whole in the HTML),
 * ways to narrow it down, then one next step. Same visual system as the
 * homepage: flat panels, hairlines, gold only on buttons, one location note
 * per list, a colour and line icon per tile instead of emoji.
 */

const GOLD = "#FFC531";
/** A code a reader can type; a referral hash is a link parameter, not a code. */
const readable = (code: string | null | undefined, slug = "") => !!typeableCode(slug, code);

const CSS = `
.bh-wrap { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
.bh-crumb { font-size: 13px; color: #6F7C84; margin-bottom: 26px; }
.bh-crumb a { color: #8E9CA4; }
.bh-crumb a:hover { color: #fff; }
.bh-hero { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr); gap: 56px; align-items: center; padding: 40px 0 64px; }
.bh-h1 { margin: 0 0 18px; font-size: clamp(36px, 4.6vw, 54px); line-height: 1.04; letter-spacing: -.04em; font-weight: 700; color: #F7F9FA; text-wrap: balance; }
.bh-lead { margin: 0 0 28px; max-width: 50ch; font-size: 17.5px; line-height: 1.6; color: #98A6AE; }
.bh-btn { display: inline-flex; align-items: center; justify-content: center; padding: 13px 20px; border-radius: 11px; font-size: 15px; font-weight: 700; white-space: nowrap; transition: background .15s, border-color .15s, transform .15s; }
.bh-btn:hover { transform: translateY(-1px); }
.bh-light { background: #F2F5F7; color: #0A0D0F; }
.bh-light:hover { background: #fff; }
.bh-line { border: 1px solid rgba(255,255,255,.16); color: #E8EDF0; }
.bh-line:hover { border-color: rgba(255,255,255,.32); }
.bh-gold { background: #FFC531; color: #141007; }
.bh-gold:hover { background: #FFD45E; }
.bh-pick { padding: 26px; border: 1px solid rgba(255,197,49,.28); border-radius: 18px; background: #0F1316; }
.bh-tag { display: inline-block; padding: 3px 8px; border-radius: 6px; background: rgba(255,197,49,.12); color: #FFC531; font-size: 11.5px; font-weight: 700; }
.bh-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 0 0 18px; border: 1px solid rgba(255,255,255,.07); border-radius: 12px; }
.bh-steps div { padding: 11px 12px; }
.bh-steps div + div { border-left: 1px solid rgba(255,255,255,.07); }
.bh-steps b { display: block; font-size: 15px; font-weight: 700; color: #F2F5F7; }
.bh-steps small { display: block; margin-top: 2px; font-size: 11.5px; line-height: 1.35; color: #7E8C94; }
.bh-sec { padding-top: 80px; scroll-margin-top: 100px; }
.bh-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 22px; }
.bh-h2 { margin: 0; font-size: 26px; letter-spacing: -.025em; font-weight: 700; color: #F2F5F7; }
.bh-muted { font-size: 13.5px; color: #75828A; }
.bh-box { border: 1px solid rgba(255,255,255,.08); border-radius: 16px; background: #0D1114; overflow: hidden; }
.bh-row { display: grid; grid-template-columns: minmax(0, 1.9fr) minmax(0, .9fr) minmax(0, .8fr) auto; gap: 20px; align-items: center; padding: 15px 20px; transition: background .15s; }
.bh-row + .bh-row { border-top: 1px solid rgba(255,255,255,.06); }
.bh-row:hover { background: rgba(255,255,255,.02); }
.bh-name { display: flex; align-items: center; gap: 13px; min-width: 0; }
.bh-name small { display: block; font-size: 12.5px; color: #75828A; }
.bh-name b { display: block; margin-top: 1px; font-size: 15.5px; line-height: 1.35; font-weight: 600; color: #F2F5F7; }
.bh-race { display: flex; align-items: center; gap: 6px; margin-top: 3px; font-size: 12.5px; color: #8E9CA4; }
.bh-stat small { display: block; font-size: 12px; color: #6F7C84; }
.bh-stat b { display: block; margin-top: 2px; font-size: 14.5px; font-weight: 600; }
.bh-act { display: flex; align-items: center; gap: 14px; }
.bh-act .bh-btn { padding: 10px 18px; font-size: 14px; }
.bh-claim { font-size: 13.5px; color: #93A1A9; white-space: nowrap; }
.bh-claim:hover { color: #fff; }
.bh-note { margin: 12px 0 0; font-size: 12px; line-height: 1.55; color: #67747C; }
.bh-types { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; }
.bh-type { display: flex; flex-direction: column; gap: 12px; padding: 18px; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; background: #0D1114; transition: border-color .15s, background .15s; height: 100%; }
.bh-type:hover { border-color: color-mix(in srgb, var(--tint) 55%, transparent); background: color-mix(in srgb, var(--tint) 5%, #0D1114); }
.bh-ico { display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 10px; background: color-mix(in srgb, var(--tint) 14%, transparent); border: 1px solid color-mix(in srgb, var(--tint) 35%, transparent); color: var(--tint); }
.bh-type b { font-size: 15px; font-weight: 600; color: #F2F5F7; }
.bh-type small { margin-top: -6px; font-size: 13px; color: #8E9CA4; }
.bh-next { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; padding: 22px 26px; border: 1px solid rgba(255,255,255,.08); border-radius: 16px; background: #0D1114; transition: border-color .15s; }
.bh-next:hover { border-color: rgba(255,255,255,.2); }
.bh-next b { display: block; font-size: 19px; font-weight: 700; color: #F2F5F7; }
.bh-next small { display: block; margin-top: 4px; font-size: 14.5px; color: #8E9CA4; }
@media (max-width: 960px) {
  .bh-hero { grid-template-columns: 1fr; gap: 36px; padding: 28px 0 48px; }
  .bh-types { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .bh-row { grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "n n" "c a"; row-gap: 12px; padding: 15px 16px; }
  .bh-name { grid-area: n; }
  .bh-code { grid-area: c; justify-self: start; }
  .bh-stat { display: none; }
  .bh-act { grid-area: a; }
  .bh-claim { display: none; }
}
@media (max-width: 560px) {
  .bh-wrap { padding: 0 16px; }
  .bh-sec { padding-top: 60px; }
  .bh-types { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .bh-pick { padding: 20px; }
}
`;

export function BonusesHub() {
  const { ops } = siteData;
  const roobet = ops.find((o) => o.slug === "roobet");
  // Casinos whose code we would rather not show on the hub (500 Casino's code belongs to another project).
  const HIDE = new Set(["roobet", "500-casino"]);
  const top = inHouseOrder(ops.filter((o) => o.affiliate && o.signupUrl && !HIDE.has(o.slug))).slice(0, 8);
  const welcome = ops.filter(isWelcomeOffer);
  // The hero stack: our pick first, then the next offers in placement order,
  // with spares so a casino the visitor's location shuts is replaced.
  const stack = [...(roobet?.promoCode && roobet.signupUrl ? [roobet] : []), ...top].slice(0, 6);
  const face = (o: (typeof ops)[number]) => {
    const code = readable(o.promoCode, o.slug) ? o.promoCode : null;
    const wv = wagerView(o);
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ width: 52, height: 52, borderRadius: 13, overflow: "hidden", flex: "none", boxShadow: "0 8px 22px rgba(0,0,0,.4)" }}>
            <BrandMark slug={o.slug} mono={o.mono} tint={brandFor(o.slug)} radius={13} fontSize={15} />
          </span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 17, fontWeight: 700, color: "#F2F5F7" }}>{o.slug === "roobet" ? "Roobet welcome package" : o.name}</span>
            <span className="bh-tag">{o.slug === "roobet" ? "Our pick this week" : isWelcomeOffer(o) ? "Welcome offer" : "Rewards"}</span>
          </span>
        </div>
        {o.slug === "roobet" ? (
          <div className="bh-steps" data-keep-grid>
            <div><b>20%</b><small>deposit match to $500</small></div>
            <div><b>100 spins</b><small>at $10,000 wagered</small></div>
            <div><b>500 spins</b><small>at $50,000 wagered</small></div>
          </div>
        ) : (
          <div style={{ margin: "0 0 16px" }}>
            <div style={{ fontSize: 22, lineHeight: 1.25, fontWeight: 700, letterSpacing: "-.02em", color: "#fff", textWrap: "balance" }}>{o.bonusShort ?? o.bonus}</div>
            <div style={{ marginTop: 6, fontSize: 13, color: "#8E9CA4" }}>Wagering: {wv.label.toLowerCase()} · from {o.name}&apos;s own terms</div>
          </div>
        )}
        {code && <CodeChip code={code} tint={GOLD} />}
        <a href={o.signupUrl as string} target="_blank" rel="nofollow sponsored noopener" data-copy-code={code ?? undefined} className="bh-btn bh-gold" style={{ display: "flex", marginTop: 12 }}>
          {o.slug === "roobet" ? "1. " : ""}Sign up{code ? ` with code ${code}` : ` at ${o.name}`} ↗
        </a>
        {o.slug === "roobet" && (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 10 }}>
            <VipClaim label={`2. Claim it with ${vip.name}`} />
          </div>
        )}
        <Link href={hasPromo(o.slug) ? `/promo-codes/${o.slug}` : reviewPath(o.slug)} style={{ display: "block", marginTop: 14, textAlign: "center", fontSize: 13.5, fontWeight: 600, color: "#C9D3D8" }}>
          {hasPromo(o.slug) ? "Full terms and how to claim →" : `Read our ${o.name} review →`}
        </Link>
      </div>
    );
  };
  const peek = (o: (typeof ops)[number]) => (
    <span style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
      <span style={{ width: 20, height: 20, borderRadius: 6, overflow: "hidden", flex: "none" }}>
        <BrandMark slug={o.slug} mono={o.mono} tint={brandFor(o.slug)} radius={6} fontSize={8} />
      </span>
      <b style={{ fontSize: 13, color: "#F2F5F7", flex: "none" }}>{o.name}</b>
      <span style={{ fontSize: 12.5, color: "#A9B8C0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.bonusShort ?? o.bonus}</span>
    </span>
  );
  const lowWager = ops.filter((o) => { const w = wagerView(o); return w.kind === "none" || (w.mult !== null && w.mult <= 1); });

  const types: { icon: IconName; label: string; href: string; n: string; tint: string }[] = [
    { icon: "gift", label: "Welcome bonuses", href: "#welcome", n: `${welcome.length} offers`, tint: "#57E39A" },
    { icon: "coin", label: "Best rakeback", href: "/rakeback-casinos", n: "14 compared", tint: "#2FD3DA" },
    { icon: "target", label: "Lowest wagering", href: "/lowest-wagering", n: `${lowWager.length} casinos`, tint: "#FF7EB6" },
    { icon: "bolt", label: "Races & raffles", href: "/races", n: `${raceSlugs().length} casinos`, tint: "#FF9A5C" },
    { icon: "sparkle", label: "Promo codes", href: "/promo-codes", n: `${PROMO_PAGES.length} codes`, tint: GOLD },
    { icon: "scale", label: "VIP calculator", href: "/vip-calculator", n: "What your play earns", tint: "#B284FF" },
  ];
  const tile = (x: (typeof types)[number]) => (
    <a key={x.label} href={x.href} className="bh-type" style={{ ["--tint" as string]: x.tint }}>
      <span className="bh-ico"><LineIcon name={x.icon} /></span>
      <b>{x.label}</b>
      <small>{x.n} →</small>
    </a>
  );

  return (
    <main style={{ background: "#080B0D", color: "#E8EDF0", paddingBottom: 96 }}>
      <style>{CSS}</style>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)", background: "radial-gradient(60% 80% at 15% 0%, rgba(255,197,49,.06), transparent 70%), #0A0D10" }}>
        <div className="bh-wrap" style={{ paddingTop: 30 }}>
          <div className="bh-crumb">
            <Link href="/">Home</Link> / <span style={{ color: "#AEBAC1" }}>Bonuses</span>
          </div>
          <section className="bh-hero">
            <div>
              <h1 className="bh-h1">
                The best crypto casino bonuses, <span style={{ color: GOLD }}>with the catch spelled out</span>
              </h1>
              <p className="bh-lead">Codes, welcome offers and rewards from {ops.length} crypto casinos. Next to every offer: how much you have to bet before you can withdraw, from the casino&apos;s own terms.</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a href="#top-offers" className="bh-btn bh-light">See the top offers</a>
                <Link href="/guides/reading-wagering-requirements" className="bh-btn bh-line">What is wagering?</Link>
              </div>
            </div>

            <aside aria-label="Top offers this week">
              <OfferStack
                items={stack.map((o) => ({ slug: o.slug, name: o.name, tint: brandFor(o.slug), face: face(o), peek: peek(o) }))}
                note={<GeoBlockNote slug={stack[0]?.slug ?? "roobet"} name="" none allOf={stack.map((o) => o.slug)} />}
              />
            </aside>
          </section>
        </div>
      </div>

      <div className="bh-wrap">
        <section id="top-offers" className="bh-sec">
          <div className="bh-head">
            <h2 className="bh-h2">More top offers</h2>
            <span className="bh-muted">Offers and codes are the casinos&apos; own. Placement includes our commercial deals.</span>
          </div>
          <div className="bh-box">
            <GeoListNote casinos={top.map((o) => ({ slug: o.slug, name: o.name }))} />
            {top.map((o) => {
              const w = toWithdraw(o);
              const race = raceFor(o.slug);
              return (
                <div key={o.slug} className="bh-row">
                  <Link href={reviewPath(o.slug)} className="bh-name">
                    <span style={{ width: 42, height: 42, flex: "none", borderRadius: 11, overflow: "hidden" }}>
                      <BrandMark slug={o.slug} mono={o.mono} tint={brandFor(o.slug)} radius={11} fontSize={12} />
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <small>{o.name} · {isWelcomeOffer(o) ? "Welcome offer" : "Rewards"}</small>
                      <b>{o.bonusShort ?? o.bonus}</b>
                      {race && (
                        <span className="bh-race">
                          <span style={{ color: brandFor(o.slug), display: "inline-flex" }}><LineIcon name="bolt" size={13} /></span>
                          {race.label}
                        </span>
                      )}
                    </span>
                  </Link>
                  <span className="bh-code">{readable(o.promoCode, o.slug) ? <CodeChip code={o.promoCode!} tint={GOLD} size="sm" /> : <span style={{ fontSize: 12.5, color: "#8E9CA4" }}>{o.promoCode ? "Code added by our link" : "No code needed"}</span>}</span>
                  <span className="bh-stat">
                    <small>Wager to withdraw</small>
                    <b style={{ color: w.color }}>{w.text}</b>
                  </span>
                  <span className="bh-act">
                    <Link href={reviewPath(o.slug)} className="bh-btn bh-gold">Read review</Link>
                    <a href={o.signupUrl!} target="_blank" rel="nofollow sponsored noopener" data-copy-code={readable(o.promoCode, o.slug) ? o.promoCode! : undefined} data-placement="bonus-list" className="bh-claim">Claim ↗</a>
                  </span>
                </div>
              );
            })}
          </div>
          <p className="bh-note">Claim links are affiliate links: we may earn a commission, which never changes what a review says. 18+ · T&amp;Cs apply.</p>
          <div style={{ marginTop: 18 }}>
            <FoldedList hashes={["all-bonuses", "welcome", "rewards"]} summary={<>Show every bonus from all {ops.length} casinos, with the full terms <span aria-hidden>↓</span></>}>
              <BonusesPage embedded />
            </FoldedList>
          </div>
        </section>

        <section className="bh-sec">
          <div className="bh-head">
            <h2 className="bh-h2">What kind of bonus are you after?</h2>
            <span className="bh-muted">A welcome bonus is paid up front and has to be wagered. Rakeback, cashback and races are earned as you play.</span>
          </div>
          <div className="bh-types">
            {types.map((t, i) =>
              // The last tile is the Kevin Hart promo while it runs, then the VIP calculator, switched in the browser.
              i === types.length - 1 && kevinLive() ? (
                <Until key={t.label} until={KEVIN_END} after={tile(t)}>
                  {tile({ icon: "sparkle", label: "Kevin Hart promo", href: KEVIN_PATH, n: "Until 7 Nov", tint: GOLD })}
                </Until>
              ) : (
                tile(t)
              )
            )}
          </div>
        </section>

        <section className="bh-sec">
          <Link href="/guides/reading-wagering-requirements" className="bh-next">
            <span>
              <b>Know what &ldquo;40× wagering&rdquo; really costs</b>
              <small>A two-minute guide to reading any bonus&apos;s terms, so a big number doesn&apos;t fool you.</small>
            </span>
            <span className="bh-btn bh-line">Read the guide →</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
