import vip from "@/data/vip.json";
import Link from "next/link";
import type { Operator } from "@/lib/types";
import { casinoFacts, brandFor, licenceLabel } from "@/lib/casino-facts";
import { BrandMark } from "@/components/ui/BrandMark";
import { CoinStack } from "@/components/ui/CoinIcon";
import { CodeChip } from "@/components/ui/CodeChip";
import { GeoBlockNote } from "@/components/geo/GeoBlockNote";
import { VipClaim } from "@/components/ui/VipClaim";
import { reviewPath } from "@/lib/outbound";

const MONO = "var(--font-jetbrains-mono), monospace";

/**
 * The homepage offer list as plain cards: the logo, the offer in big type, four
 * rows a reader actually compares (minimum deposit, minimum withdrawal,
 * withdrawal time, coins), one button to play and one to read the review.
 * Every figure is casinoFacts(), so from the casino's own pages; a row the
 * casino doesn't state reads "See terms" rather than a guess.
 */
export function OfferCards({ ops }: { ops: Operator[] }) {
  return (
    <div>
      <div className="csg-offer-row grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 14 }}>
        {ops.map((o, i) => {
          const f = casinoFacts(o);
          const tint = brandFor(o.slug);
          const pick = !!o.featured;
          const rows: [string, string][] = [
            ["Min deposit", f.minDeposit ?? "See terms"],
            ["Min withdrawal", f.minWithdrawal ?? "See terms"],
            ["Withdrawal time", f.withdrawals ?? "See terms"],
          ];
          const outbound = !!(o.affiliate && o.signupUrl);
          return (
            <div
              key={o.slug}
              className="csg-lift"
              style={{ position: "relative", display: "flex", flexDirection: "column", padding: 18, borderRadius: 18, background: pick ? "radial-gradient(120% 70% at 50% 0%, rgba(255,197,49,.12), transparent 60%), #0D1215" : "#0C1013", border: `1px solid ${pick ? "rgba(255,197,49,.45)" : "rgba(255,255,255,.08)"}` }}
            >
              {pick && (
                <span style={{ position: "absolute", top: -11, left: 16, padding: "4px 10px", borderRadius: 100, background: "#FFC531", color: "#141007", fontFamily: MONO, fontSize: 10, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase" }}>Our pick</span>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <span style={{ width: 72, height: 72, flex: "none", borderRadius: 16, overflow: "hidden", boxShadow: `0 10px 26px ${tint}26` }}>
                  <BrandMark slug={o.slug} mono={o.mono} tint={tint} radius={16} fontSize={18} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: MONO, fontSize: 10.5, color: "#77858E", marginBottom: 2 }}>#{i + 1}</div>
                  <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>{o.name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 10.5, color: "#83919A" }}>{licenceLabel(o.licence)}</div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: "#83919A", marginBottom: 4 }}>{/rakeback|raffle|race/i.test(f.headline) && !/deposit|free spins/i.test(f.headline) ? "Rewards" : "Welcome offer"}</div>
              <div style={{ fontSize: 20, lineHeight: 1.2, fontWeight: 800, letterSpacing: "-.02em", color: pick ? "#FFD36B" : "#57E39A", marginBottom: 6, minHeight: 48 }}>{f.headline}</div>
              {o.promoCode && o.codePerk && outbound && (
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 6, fontSize: 12, color: "#E8EDF0" }}>
                  <CodeChip code={o.promoCode} tint="#FFC531" size="sm" bare />
                  <span>{o.codePerk.short ?? o.codePerk.text}</span>
                  <span style={{ flexBasis: "100%", marginTop: 4 }}>
                    <VipClaim compact label={`Claim via ${vip.name}`} />
                  </span>
                </div>
              )}
              <div style={{ fontFamily: MONO, fontSize: 10, color: "#6E7A82", marginBottom: 14 }}>18+ · T&amp;Cs apply</div>

              <div style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
                {rows.map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "9px 0", borderTop: "1px solid rgba(255,255,255,.06)", fontSize: 13.5 }}>
                    <span style={{ color: "#8E9CA5" }}>{k}</span>
                    <span style={{ fontWeight: 700, color: "#E8EDF0", textAlign: "right" }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "9px 0", borderTop: "1px solid rgba(255,255,255,.06)", borderBottom: "1px solid rgba(255,255,255,.06)", fontSize: 13.5 }}>
                  <span style={{ color: "#8E9CA5" }}>Crypto</span>
                  {f.coins.length ? <CoinStack tickers={f.coins} max={5} size={20} /> : <span style={{ fontWeight: 700, color: "#E8EDF0" }}>See terms</span>}
                </div>
              </div>

              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "stretch", gap: 10 }}>
                {outbound && <GeoBlockNote slug={o.slug} name={o.name} compact />}
                {outbound ? (
                  <a href={o.signupUrl} target="_blank" rel="nofollow sponsored noopener" data-copy-code={o.promoCode} className="transition-transform hover:-translate-y-px" style={{ textAlign: "center", padding: "15px 16px", borderRadius: 12, background: "linear-gradient(180deg,#FFD866,#FFC531)", color: "#141007", fontSize: 15.5, fontWeight: 800, letterSpacing: ".02em", boxShadow: "0 10px 26px rgba(255,197,49,.22)" }}>
                    PLAY NOW
                  </a>
                ) : (
                  <Link href={reviewPath(o.slug)} style={{ textAlign: "center", padding: "15px 16px", borderRadius: 12, background: "#00C2CC", color: "#04191B", fontSize: 15, fontWeight: 800 }}>
                    See the offer
                  </Link>
                )}
                <Link href={reviewPath(o.slug)} style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: "#A8B6BE", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  Read review
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      <p style={{ margin: "14px 0 0", fontFamily: MONO, fontSize: 10.5, lineHeight: 1.6, color: "#77858E" }}>
        Each offer is the casino&apos;s own, from its terms; PLAY NOW links are affiliate links and we may earn a commission, which never changes what a review says. 18+, play responsibly.
      </p>
    </div>
  );
}
