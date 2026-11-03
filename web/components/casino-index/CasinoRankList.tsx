import Link from "next/link";
import type { Operator } from "@/lib/types";
import { brandFor, casinoFacts, licenceLabel } from "@/lib/casino-facts";
import { reviewPath } from "@/lib/outbound";
import { BrandMark } from "@/components/ui/BrandMark";
import { GeoListNote } from "@/components/geo/GeoListNote";

/**
 * A ranked casino list as plain rows: logo, offer, withdrawal time, minimum
 * deposit, and "Read review" as the main button (Visit, the affiliate link, is
 * secondary). One location note above the list replaces a warning per row.
 * Used on the homepage and the /crypto-casinos hub.
 */
const CSS = `
.rl-box { border: 1px solid rgba(255,255,255,.08); border-radius: 16px; background: #0D1114; overflow: hidden; }
.rl-row { display: grid; grid-template-columns: 22px minmax(0, 1.2fr) minmax(0, 1.6fr) minmax(0, .7fr) minmax(0, .7fr) auto; gap: 20px; align-items: center; padding: 16px 20px; transition: background .15s; }
.rl-row:hover { background: rgba(255,255,255,.02); }
.rl-row + .rl-row { border-top: 1px solid rgba(255,255,255,.06); }
.rl-rank { font-size: 13px; font-weight: 600; color: #5E6B73; font-variant-numeric: tabular-nums; }
.rl-name { display: flex; align-items: center; gap: 12px; min-width: 0; }
.rl-name b { display: block; font-size: 16px; font-weight: 700; color: #F2F5F7; }
.rl-name small { display: block; margin-top: 1px; font-size: 12.5px; color: #75828A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rl-offer b { display: block; font-size: 15px; line-height: 1.35; font-weight: 600; color: #E8EDF0; }
.rl-stat small { display: block; font-size: 12px; color: #6F7C84; }
.rl-stat b { display: block; margin-top: 2px; font-size: 14.5px; font-weight: 600; color: #E8EDF0; }
.rl-act { display: flex; align-items: center; gap: 14px; }
.rl-btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 18px; border-radius: 11px; background: #FFC531; color: #141007; font-size: 14px; font-weight: 700; white-space: nowrap; transition: background .15s, transform .15s; }
.rl-btn:hover { background: #FFD45E; transform: translateY(-1px); }
.rl-visit { font-size: 13.5px; color: #93A1A9; white-space: nowrap; }
.rl-visit:hover { color: #fff; }
.rl-note { margin: 12px 0 0; font-size: 12px; line-height: 1.55; color: #67747C; }
@media (max-width: 960px) {
  .rl-row { grid-template-columns: 18px minmax(0, 1fr) auto; grid-template-areas: "r n a" "r o o"; row-gap: 10px; gap: 14px; padding: 16px; }
  .rl-rank { grid-area: r; align-self: start; padding-top: 10px; }
  .rl-name { grid-area: n; }
  .rl-offer { grid-area: o; }
  .rl-stat { display: none; }
  .rl-act { grid-area: a; }
  .rl-visit { display: none; }
}
`;

export function CasinoRankList({ ops, note = true }: { ops: Operator[]; note?: boolean }) {
  return (
    <>
      <style>{CSS}</style>
      <div className="rl-box">
        <GeoListNote casinos={ops.map((o) => ({ slug: o.slug, name: o.name }))} />
        {ops.map((o, i) => {
          const f = casinoFacts(o);
          const outbound = !!(o.affiliate && o.signupUrl);
          const sub = [licenceLabel(o.licence), f.kyc].filter(Boolean).join(" · ");
          return (
            <div key={o.slug} className="rl-row">
              <span className="rl-rank" style={i === 0 ? { color: "#FFC531" } : undefined}>{i + 1}</span>
              <Link href={reviewPath(o.slug)} className="rl-name">
                <span style={{ width: 40, height: 40, flex: "none", borderRadius: 10, overflow: "hidden" }}>
                  <BrandMark slug={o.slug} mono={o.mono} tint={brandFor(o.slug)} radius={10} fontSize={12} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <b>{o.name}</b>
                  <small>{sub}</small>
                </span>
              </Link>
              <Link href={reviewPath(o.slug)} className="rl-offer">
                <b>{f.headline}</b>
              </Link>
              <div className="rl-stat">
                <small>Withdrawals</small>
                <b>{f.withdrawals ?? "See terms"}</b>
              </div>
              <div className="rl-stat">
                <small>Min deposit</small>
                <b>{f.minDeposit ?? "See terms"}</b>
              </div>
              <div className="rl-act">
                <Link href={reviewPath(o.slug)} className="rl-btn">Read review</Link>
                {outbound && (
                  <a href={o.signupUrl} target="_blank" rel="nofollow sponsored noopener" data-copy-code={o.promoCode} className="rl-visit">
                    Visit ↗
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {note && <p className="rl-note">Offers are the casinos&apos; own, from their terms. Each review links every figure to its source. Visit links are affiliate links: we may earn a commission, which never changes what a review says. 18+, play responsibly.</p>}
    </>
  );
}
