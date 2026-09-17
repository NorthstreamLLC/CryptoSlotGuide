import Link from "next/link";
import type { Operator } from "@/lib/types";
import { brandFor, casinoFacts } from "@/lib/casino-facts";
import { BrandMark } from "@/components/ui/BrandMark";
import { CoinStack } from "@/components/ui/CoinIcon";
import { Icon } from "@/components/ui/Icon";

const MONO = "var(--font-jetbrains-mono), monospace";

/**
 * Offer-led casino card: headline offer, three key numbers, coins, and a
 * clear action. Used on the homepage and the casino list.
 */
export function CasinoCard({ o, rank }: { o: Operator; rank?: number }) {
  const brand = brandFor(o.slug);
  const c = casinoFacts(o);
  const href = `/casinos/${o.slug}`;
  const stats: [string, string | null][] = [
    ["Withdrawals", c.withdrawals],
    ["Min deposit", c.minDeposit],
    ["Wagering", c.wagering],
  ];
  return (
    <article
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 20,
        borderRadius: 20,
        background: `radial-gradient(120% 70% at 100% 0%, ${brand}1c, transparent 55%), linear-gradient(180deg, #10161A, #0B0F12)`,
        border: `1px solid ${o.featured ? `${brand}55` : "rgba(255,255,255,.08)"}`,
        boxShadow: "0 18px 40px rgba(0,0,0,.35)",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, flex: "none", borderRadius: 11, overflow: "hidden" }}>
          <BrandMark slug={o.slug} mono={o.mono} tint={brand} radius={11} fontSize={12} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Link href={href} style={{ display: "block", fontSize: 16.5, fontWeight: 800, letterSpacing: "-.015em", color: "#fff" }}>
            {o.name}
          </Link>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".06em", color: "#6E7F88", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {[c.licence, c.kyc].filter(Boolean).join(" · ") || "Crypto casino"}
          </div>
        </div>
        {o.featured ? (
          <span style={{ padding: "4px 9px", borderRadius: 100, background: `${brand}1f`, border: `1px solid ${brand}55`, fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: ".06em", color: brand }}>FEATURED</span>
        ) : rank ? (
          <span style={{ fontFamily: MONO, fontSize: 11, color: "#4E5A62" }}>{String(rank).padStart(2, "0")}</span>
        ) : null}
      </div>

      <div>
        <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: brand, marginBottom: 6 }}>Welcome offer</div>
        <Link href={href} style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontSize: 19, lineHeight: 1.2, fontWeight: 800, letterSpacing: "-.02em", color: "#fff", minHeight: 46 }}>
          {c.headline}
        </Link>
      </div>

      <div data-keep-grid style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {stats.map(([label, value]) => (
          <div key={label} style={{ padding: "10px 10px 9px", borderRadius: 12, background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.06)", minWidth: 0 }}>
            <div style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: ".07em", textTransform: "uppercase", color: "#6E7F88", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.2, fontWeight: 800, color: value ? "#fff" : "#4E5A62", overflowWrap: "anywhere" }}>{value ?? "—"}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, minHeight: 22 }}>
        {c.coins.length ? <CoinStack tickers={c.coins} max={7} size={20} /> : <span style={{ fontSize: 12, color: "#4E5A62" }}>Coins not listed</span>}
        {c.fee === "Free" && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: "#7BE0B8" }}>
            <Icon name="percent" size={13} /> Free withdrawals
          </span>
        )}
      </div>

      <Link href={href} style={{ marginTop: "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 14px", borderRadius: 11, background: o.featured ? brand : "#00C2CC", color: "#0A0D0F", fontSize: 14, fontWeight: 800 }}>
        View offer <Icon name="arrow" size={15} />
      </Link>
    </article>
  );
}
