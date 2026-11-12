import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { pickPartners } from "@/lib/partner-fit";
import { GeoRanked } from "@/components/geo/GeoRanked";
import { topSlotRows, slotArtBySlug } from "@/lib/slot-page";
import { catalogueTotals } from "@/lib/slot-db";
import { topSlotRank } from "@/lib/top-slots";
import { SlotArtCards } from "@/components/home/SlotArtCards";
import { FoldedList } from "@/components/casino-index/FoldedList";
import { BrandMark } from "@/components/ui/BrandMark";
import { thumbOf } from "@/lib/thumb";
import { GeoBlockNote } from "@/components/geo/GeoBlockNote";
import { LineIcon, type IconName } from "@/components/ui/LineIcon";

/**
 * The slots hub: our #1 slot first, the top picks as art, every reviewed slot
 * folded (whole in the HTML), ways to narrow it down, then one next step.
 * Same visual system as the homepage: flat panels, hairlines, gold only on
 * buttons, a colour and line icon per tile instead of emoji.
 */

const PINK = "#FF7EB6";
const VOL: Record<string, string> = { low: "Low", medium: "Medium", high: "High", "very-high": "Very high", extreme: "Extreme" };

const CSS = `
.sh-wrap { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
.sh-crumb { font-size: 13px; color: #6F7C84; margin-bottom: 26px; }
.sh-crumb a { color: #8E9CA4; }
.sh-crumb a:hover { color: #fff; }
.sh-hero { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr); gap: 56px; align-items: center; padding: 40px 0 64px; }
.sh-h1 { margin: 0 0 18px; font-size: clamp(36px, 4.6vw, 54px); line-height: 1.04; letter-spacing: -.04em; font-weight: 700; color: #F7F9FA; text-wrap: balance; }
.sh-lead { margin: 0 0 28px; max-width: 50ch; font-size: 17.5px; line-height: 1.6; color: #98A6AE; }
.sh-btn { display: inline-flex; align-items: center; justify-content: center; padding: 13px 20px; border-radius: 11px; font-size: 15px; font-weight: 700; white-space: nowrap; transition: background .15s, border-color .15s, transform .15s; }
.sh-btn:hover { transform: translateY(-1px); }
.sh-light { background: #F2F5F7; color: #0A0D0F; }
.sh-light:hover { background: #fff; }
.sh-line { border: 1px solid rgba(255,255,255,.16); color: #E8EDF0; }
.sh-line:hover { border-color: rgba(255,255,255,.32); }
.sh-gold { background: #FFC531; color: #141007; }
.sh-gold:hover { background: #FFD45E; }
.sh-pick { border: 1px solid rgba(255,255,255,.09); border-radius: 18px; background: #0F1316; overflow: hidden; }
.sh-pick-art { display: block; aspect-ratio: 16 / 8; background: #11161A; overflow: hidden; }
.sh-pick-art img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
.sh-pick-art:hover img { transform: scale(1.02); }
.sh-tag { display: inline-block; padding: 3px 8px; border-radius: 6px; background: rgba(255,126,182,.12); color: #FF7EB6; font-size: 11.5px; font-weight: 700; }
.sh-facts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 16px 0 18px; border: 1px solid rgba(255,255,255,.07); border-radius: 12px; }
.sh-facts div { padding: 11px 12px; min-width: 0; }
.sh-facts div + div { border-left: 1px solid rgba(255,255,255,.07); }
.sh-facts small { display: block; font-size: 11.5px; color: #75828A; }
.sh-facts b { display: block; margin-top: 2px; font-size: 14.5px; font-weight: 700; color: #F2F5F7; }
.sh-sec { padding-top: 80px; scroll-margin-top: 100px; }
.sh-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 22px; }
.sh-h2 { margin: 0; font-size: 26px; letter-spacing: -.025em; font-weight: 700; color: #F2F5F7; }
.sh-muted { font-size: 13.5px; color: #75828A; }
.sh-box { border: 1px solid rgba(255,255,255,.08); border-radius: 16px; background: #0D1114; overflow: hidden; }
.sh-row { display: grid; grid-template-columns: 56px minmax(0, 1.6fr) minmax(0, .7fr) minmax(0, .8fr) minmax(0, .8fr) auto; gap: 16px; align-items: center; padding: 11px 18px; transition: background .15s; }
.sh-row + .sh-row { border-top: 1px solid rgba(255,255,255,.06); }
.sh-row:hover { background: rgba(255,255,255,.025); }
.sh-row b { display: block; font-size: 14.5px; font-weight: 600; color: #F2F5F7; }
.sh-row small { display: block; font-size: 12.5px; color: #75828A; }
.sh-ways { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.sh-way { display: flex; align-items: center; gap: 12px; padding: 16px; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; background: #0D1114; transition: border-color .15s, background .15s; }
.sh-way:hover { border-color: color-mix(in srgb, var(--tint) 55%, transparent); background: color-mix(in srgb, var(--tint) 5%, #0D1114); }
.sh-ico { display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; flex: none; border-radius: 10px; background: color-mix(in srgb, var(--tint) 14%, transparent); border: 1px solid color-mix(in srgb, var(--tint) 35%, transparent); color: var(--tint); }
.sh-way b { font-size: 15px; font-weight: 600; color: #F2F5F7; }
.sh-way i { margin-left: auto; font-style: normal; color: #5E6B73; transition: transform .15s, color .15s; }
.sh-way:hover i { transform: translateX(3px); color: var(--tint); }
.sh-next { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; padding: 22px 26px; border: 1px solid rgba(255,255,255,.08); border-radius: 16px; background: #0D1114; transition: border-color .15s; }
.sh-next:hover { border-color: rgba(255,197,49,.4); }
.sh-next b { display: block; font-size: 19px; font-weight: 700; color: #F2F5F7; }
.sh-next small { display: block; margin-top: 4px; font-size: 14.5px; color: #8E9CA4; }
@media (max-width: 960px) {
  .sh-hero { grid-template-columns: 1fr; gap: 36px; padding: 28px 0 48px; }
  .sh-ways { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sh-row { grid-template-columns: 48px minmax(0, 1fr) auto; }
  .sh-row .sh-x { display: none; }
}
@media (max-width: 560px) {
  .sh-wrap { padding: 0 16px; }
  .sh-sec { padding-top: 60px; }
  .sh-way { padding: 14px 12px; gap: 10px; }
  .sh-way i { display: none; }
}
`;

export function SlotsHub() {
  const rows = topSlotRows();
  const top = rows[0];
  const art = top ? slotArtBySlug(top.slug) : null;
  // The #1 slot's "play" button: the partner that fits it, swapped for the next
  // fit where the visitor's location is shut to it (lib/partner-fit.ts).
  const playAt = pickPartners({ context: { kind: "slots" }, seed: "slots-hub", limit: 4 });
  const totals = catalogueTotals();
  const reviewed = [...siteData.slots].sort((a, b) => topSlotRank(a.slug) - topSlotRank(b.slug) || a.name.localeCompare(b.name));

  const ways: { icon: IconName; label: string; href: string; tint: string }[] = [
    { icon: "gift", label: "Bonus buy", href: "/slots/bonus-buy", tint: "#FFC531" },
    { icon: "layers", label: "Megaways", href: "/slots/megaways", tint: "#B284FF" },
    { icon: "flame", label: "High volatility", href: "/slots/high-volatility", tint: "#FF9A5C" },
    { icon: "coin", label: "Jackpot slots", href: "/slots/jackpot", tint: "#57E39A" },
    { icon: "grid", label: "Cluster pays", href: "/slots/cluster-pays", tint: "#2FD3DA" },
    { icon: "lock", label: "Hold & Win", href: "/slots/hold-and-win", tint: "#FF7EB6" },
    { icon: "sparkle", label: "By series", href: "/slots/series", tint: "#B79CFF" },
    { icon: "building", label: "By studio", href: "/providers", tint: "#5FA8FF" },
    { icon: "search", label: `All ${totals.slots.toLocaleString()} slots`, href: "/slots/database", tint: "#C9D3D8" },
  ];

  return (
    <main style={{ background: "#080B0D", color: "#E8EDF0", paddingBottom: 96 }}>
      <style>{CSS}</style>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)", background: "radial-gradient(60% 80% at 15% 0%, rgba(255,126,182,.06), transparent 70%), #0A0D10" }}>
        <div className="sh-wrap" style={{ paddingTop: 30 }}>
          <div className="sh-crumb">
            <Link href="/">Home</Link> / <span style={{ color: "#AEBAC1" }}>Slots</span>
          </div>
          <section className="sh-hero">
            <div>
              <h1 className="sh-h1">
                The best slots to play, <span style={{ color: PINK }}>with the real RTP</span>
              </h1>
              <p className="sh-lead">Our {rows.length} top slots, each with a full review and the return the studio publishes. Casinos can run a lower build of the same game, so we show you how to check before you spin.</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a href="#top-slots" className="sh-btn sh-light">See our top slots</a>
                <Link href="/guides/how-casino-rtp-versions-work" className="sh-btn sh-line">What is RTP?</Link>
              </div>
            </div>

            {top && (
              <aside className="sh-pick" aria-label="Our number one slot">
                {art && (
                  <Link href={`/slots/${top.slug}`} className="sh-pick-art">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={art} alt={top.name} width={640} height={320} />
                  </Link>
                )}
                <div style={{ padding: 22 }}>
                  <span className="sh-tag">Our #1 slot</span>
                  <span style={{ display: "block", marginTop: 8, fontSize: 22, fontWeight: 700, letterSpacing: "-.02em", color: "#F2F5F7" }}>{top.name}</span>
                  <span style={{ display: "block", fontSize: 13.5, color: "#8E9CA4" }}>{top.provider}</span>
                  <div className="sh-facts" data-keep-grid>
                    <div><small>RTP</small><b style={{ color: "#57E39A" }}>{top.rtp}</b></div>
                    <div><small>Max win</small><b>{top.maxWin}</b></div>
                    <div><small>Volatility</small><b>{top.volatility}</b></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center" }} data-keep-grid>
                    <Link href={`/slots/${top.slug}`} className="sh-btn sh-gold">Read the review</Link>
                    {playAt.length > 0 && (
                      <GeoRanked
                        count={1}
                        note={null}
                        items={playAt.map(({ o }) => ({
                          slug: o.slug,
                          node: <a href={o.signupUrl as string} target="_blank" rel="nofollow sponsored noopener" data-copy-code={o.promoCode ?? undefined} data-placement="slots-hero" className="sh-btn sh-line">Play at {o.name} ↗</a>,
                        }))}
                      />
                    )}
                  </div>
                  {playAt[0] && <GeoBlockNote slug={playAt[0].o.slug} name="" none compact allOf={playAt.map((x) => x.o.slug)} />}
                </div>
              </aside>
            )}
          </section>
        </div>
      </div>

      <div className="sh-wrap">
        <section id="top-slots" className="sh-sec">
          <div className="sh-head">
            <h2 className="sh-h2">Our top {Math.min(8, rows.length)} slots right now</h2>
            <span className="sh-muted">RTPs are the studio&apos;s published figures.</span>
          </div>
          <SlotArtCards rows={rows.slice(0, 8)} />
          <div style={{ marginTop: 24 }}>
            <FoldedList hashes={["all-slots"]} summary={<>Show every slot we&apos;ve reviewed ({reviewed.length}), with RTP and max win <span aria-hidden>↓</span></>}>
              <div className="sh-box">
                {reviewed.map((s) => {
                  const img = slotArtBySlug(s.slug);
                  const un = (k: "rtp" | "vol" | "maxWin") => !!s.unpublished?.includes(k);
                  return (
                    <Link key={s.slug} href={`/slots/${s.slug}`} className="sh-row" data-keep-grid>
                      <span style={{ width: 56, height: 36, borderRadius: 8, overflow: "hidden", background: "#11161A" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {img ? <img src={thumbOf(img)} alt="" width={56} height={36} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <BrandMark slug={s.slug} mono={s.mono} tint={s.tint} radius={8} fontSize={10} />}
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <b>{s.name}</b>
                        <small>{s.provider}</small>
                      </span>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "#57E39A" }}>{un("rtp") ? "Not published" : `${s.rtp.toFixed(2)}%`}</span>
                      <span className="sh-x" style={{ fontSize: 13.5, color: "#AEBAC1" }}>{un("maxWin") ? "Not published" : s.maxWin}</span>
                      <span className="sh-x" style={{ fontSize: 13.5, color: "#AEBAC1" }}>{un("vol") ? "Not published" : VOL[s.vol] ?? s.vol}</span>
                      <span className="sh-x" style={{ fontSize: 13.5, fontWeight: 600, color: "#C9D3D8" }}>Review →</span>
                    </Link>
                  );
                })}
              </div>
            </FoldedList>
          </div>
        </section>

        <section className="sh-sec">
          <div className="sh-head">
            <h2 className="sh-h2">How do you like to play?</h2>
            <span className="sh-muted">Every list is built from the studios&apos; own game pages.</span>
          </div>
          <div className="sh-ways">
            {ways.map((w, i) => (
              // The last tile ("All N slots") spans the row, so an odd count never leaves it stranded.
              <Link key={w.label} href={w.href} className="sh-way" style={{ ["--tint" as string]: w.tint, ...(i === ways.length - 1 ? { gridColumn: "1 / -1" } : {}) }}>
                <span className="sh-ico"><LineIcon name={w.icon} /></span>
                <b>{w.label}</b>
                <i aria-hidden>→</i>
              </Link>
            ))}
          </div>
        </section>

        <section className="sh-sec">
          <Link href="/slots/best-crypto-slot-sites" className="sh-next">
            <span>
              <b>Found a slot? Play it at a top crypto slot site.</b>
              <small>The best crypto slot sites: big game libraries, fast withdrawals, and the bonus that fits slots.</small>
            </span>
            <span className="sh-btn sh-gold">Best crypto slot sites →</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
