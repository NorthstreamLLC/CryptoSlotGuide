import Link from "next/link";
import type { Operator } from "@/lib/types";
import { brandFor, casinoFacts } from "@/lib/casino-facts";
import { BrandMark } from "@/components/ui/BrandMark";
import { CoinStack } from "@/components/ui/CoinIcon";
import { Icon } from "@/components/ui/Icon";
import { raceFor, partnerFor, dropFor } from "@/lib/races";
import { reviewPath } from "@/lib/outbound";

/**
 * Offer-led casino card: headline offer, three key numbers, coins, and
 * "Read review" as the main action (Visit, the affiliate link, is secondary).
 * Flat surface with a thin brand-coloured top edge; no glows or mono labels.
 */
export function CasinoCard({ o, rank, coinMax = 7 }: { o: Operator; rank?: number; coinMax?: number }) {
  const brand = brandFor(o.slug);
  const c = casinoFacts(o);
  const href = `/casinos/${o.slug}`;
  const race = raceFor(o.slug);
  const partner = partnerFor(o.slug);
  const drop = dropFor(o.slug);
  const stats: [string, string | null][] = [
    ["Withdrawals", c.withdrawals],
    ["Min deposit", c.minDeposit],
    ["Withdrawal fee", c.fee],
  ];
  return (
    <article
      data-reveal
      className="csg-card"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 20,
        borderRadius: 16,
        background: "#0D1114",
        border: "1px solid rgba(255,255,255,.08)",
        boxShadow: `inset 0 2px 0 ${brand}`,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, flex: "none", borderRadius: 11, overflow: "hidden" }}>
          <BrandMark slug={o.slug} mono={o.mono} tint={brand} radius={11} fontSize={12} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Link href={href} style={{ display: "block", fontSize: 16.5, fontWeight: 700, letterSpacing: "-.015em", color: "#F2F5F7" }}>
            {o.name}
          </Link>
          <div style={{ fontSize: 12.5, color: "#75828A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {[c.licence, c.kyc].filter(Boolean).join(" · ") || "Crypto casino"}
          </div>
        </div>
        {o.featured ? (
          <span style={{ padding: "3px 8px", borderRadius: 6, background: "rgba(255,197,49,.12)", fontSize: 11.5, fontWeight: 700, color: "#FFC531" }}>Featured</span>
        ) : rank ? (
          <span style={{ fontSize: 13, fontWeight: 600, color: "#5E6B73" }}>{rank}</span>
        ) : null}
      </div>

      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: brand, marginBottom: 6 }}>{o.noDepositBonus ? "Rewards" : "Welcome offer"}</div>
        <Link href={href} style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontSize: 18, lineHeight: 1.25, fontWeight: 700, letterSpacing: "-.02em", color: "#F2F5F7", minHeight: 45 }}>
          {c.headline}
        </Link>
      </div>

      <div data-keep-grid style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12 }}>
        {stats.map(([label, value], i) => (
          <div key={label} style={{ padding: "10px 11px", minWidth: 0, borderLeft: i ? "1px solid rgba(255,255,255,.07)" : 0 }}>
            <div style={{ fontSize: 11.5, color: "#75828A", marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.25, fontWeight: 700, color: value ? "#F2F5F7" : "#67747C", overflowWrap: "anywhere" }}>{value ?? "—"}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, minHeight: 22 }}>
        {c.coins.length ? <CoinStack tickers={c.coins} max={coinMax} size={20} /> : <span style={{ fontSize: 12, color: "#77858E" }}>Coins not listed</span>}
        {c.fee === "Free" && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: "#7BE0B8" }}>
            <Icon name="percent" size={13} /> Free withdrawals
          </span>
        )}
      </div>

      {(race || partner || drop) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.06)" }}>
          {race && (
            <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: "#DCE3E7" }}>
              <span style={{ color: brand, display: "inline-flex" }}><Icon name="trophy" size={14} /></span>
              {race.label}
            </span>
          )}
          {drop && (
            <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: "#DCE3E7" }}>
              <span style={{ color: "#7BE0B8", display: "inline-flex" }}><Icon name="clock" size={14} /></span>
              {drop}
            </span>
          )}
          {partner && (
            <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#A8B6BE" }}>
              <span style={{ color: "#8DA0AA", display: "inline-flex" }}><Icon name="handshake" size={14} /></span>
              Official partner of {partner}
            </span>
          )}
        </div>
      )}

      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 14 }}>
        <Link href={reviewPath(o.slug)} className="csg-card-btn" style={{ flex: 1, textAlign: "center", padding: "12px 16px", borderRadius: 11, background: "#FFC531", color: "#141007", fontSize: 14.5, fontWeight: 700 }}>
          Read review
        </Link>
        {o.affiliate && o.signupUrl && (
          <a href={o.signupUrl} target="_blank" rel="nofollow sponsored noopener" data-copy-code={o.promoCode} data-placement="casino-card" style={{ fontSize: 13.5, color: "#93A1A9", whiteSpace: "nowrap" }}>
            Visit ↗
          </a>
        )}
      </div>
    </article>
  );
}
