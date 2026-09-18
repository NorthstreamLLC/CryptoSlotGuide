import Link from "next/link";
import type { Operator } from "@/lib/types";
import { brandFor, casinoFacts } from "@/lib/casino-facts";
import { BrandMark } from "@/components/ui/BrandMark";
import { CoinStack } from "@/components/ui/CoinIcon";
import { Icon } from "@/components/ui/Icon";
import { raceFor } from "@/lib/races";

const MONO = "var(--font-jetbrains-mono), monospace";
const COLS = "md:grid-cols-[36px_minmax(180px,1.1fr)_minmax(220px,1.6fr)_96px_96px_96px_150px_140px]";

/** Clean ranked list of casino offers: one row per casino, key numbers in columns. */
export function CasinoOfferList({ ops }: { ops: Operator[] }) {
  return (
    <div style={{ borderRadius: 20, border: "1px solid rgba(255,255,255,.08)", background: "linear-gradient(180deg,#0E1317,#0A0E11)", overflow: "hidden" }}>
      <div className={`hidden md:grid ${COLS} items-center gap-4`} style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,.07)", fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#6E7F88" }}>
        <span>#</span>
        <span>Casino</span>
        <span>Welcome offer</span>
        <span>Withdrawals</span>
        <span>Min deposit</span>
        <span>Wagering</span>
        <span>Coins</span>
        <span />
      </div>
      {ops.map((o, i) => (
        <Row key={o.slug} o={o} pos={i + 1} />
      ))}
    </div>
  );
}

function Row({ o, pos }: { o: Operator; pos: number }) {
  const brand = brandFor(o.slug);
  const c = casinoFacts(o);
  const href = `/casinos/${o.slug}`;
  const cell = (label: string, value: string | null) => (
    <div style={{ minWidth: 0 }}>
      <div className="md:hidden" style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".07em", textTransform: "uppercase", color: "#6E7F88", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: value ? "#fff" : "#4E5A62" }}>{value ?? "—"}</div>
    </div>
  );
  return (
    <div
      className={`grid grid-cols-3 ${COLS} items-center gap-x-4 gap-y-3 transition-colors hover:bg-white/[0.025]`}
      style={{ padding: "16px 20px", borderTop: pos > 1 ? "1px solid rgba(255,255,255,.05)" : undefined, background: o.featured ? `linear-gradient(90deg, ${brand}12, transparent 60%)` : undefined }}
    >
      <span className="hidden md:block" style={{ fontFamily: MONO, fontSize: 12, color: o.featured ? brand : "#4E5A62" }}>{String(pos).padStart(2, "0")}</span>

      <Link href={href} className="col-span-3 md:col-span-1" style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <span style={{ width: 36, height: 36, flex: "none", borderRadius: 10, overflow: "hidden" }}>
          <BrandMark slug={o.slug} mono={o.mono} tint={brand} radius={10} fontSize={11} />
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 15.5, fontWeight: 800, letterSpacing: "-.01em", color: "#fff" }}>{o.name}</span>
            {o.featured && <span style={{ padding: "2px 7px", borderRadius: 100, background: `${brand}1f`, fontFamily: MONO, fontSize: 8.5, fontWeight: 700, letterSpacing: ".06em", color: brand }}>FEATURED</span>}
          </span>
          <span style={{ display: "block", fontFamily: MONO, fontSize: 10, color: "#6E7F88", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.licence ?? "Crypto casino"}</span>
        </span>
      </Link>

      <Link href={href} className="col-span-3 md:col-span-1" style={{ fontSize: 15, lineHeight: 1.3, fontWeight: 700, color: "#E8EDF0", minWidth: 0 }}>
        {c.headline}
        <span style={{ display: "flex", flexWrap: "wrap", gap: "2px 12px", marginTop: 4 }}>
          {raceFor(o.slug) && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: "#D6B65C" }}>
              <Icon name="trophy" size={12} /> {raceFor(o.slug)!.label}
            </span>
          )}
          {c.fee === "Free" && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: "#7BE0B8" }}>
              <Icon name="percent" size={12} /> Free withdrawals
            </span>
          )}
        </span>
      </Link>

      {cell("Withdrawals", c.withdrawals)}
      {cell("Min deposit", c.minDeposit)}
      {cell("Wagering", c.wagering)}

      <div className="col-span-3 md:col-span-1">{c.coins.length ? <CoinStack tickers={c.coins} max={5} size={22} /> : <span style={{ fontSize: 12, color: "#4E5A62" }}>—</span>}</div>

      <div className="col-span-3 md:col-span-1" style={{ display: "flex", gap: 8 }}>
        <Link href={href} style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 12px", borderRadius: 10, background: o.featured ? brand : "#00C2CC", color: "#0A0D0F", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" }}>
          View offer <Icon name="arrow" size={14} />
        </Link>
      </div>
    </div>
  );
}
