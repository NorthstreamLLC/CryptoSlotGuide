"use client";

import Link from "next/link";
import { useState } from "react";
import { wagerView, compareWager } from "@/lib/wager";
import { siteData } from "@/lib/site-data";
import { brandFor, casinoFacts } from "@/lib/casino-facts";
import { BrandMark } from "@/components/ui/BrandMark";
import { Icon } from "@/components/ui/Icon";
import type { Operator } from "@/lib/types";

/**
 * Every casino offer side by side, sorted by how much you have to bet to
 * unlock it. Terms come from each casino's own bonus pages.
 */
type Filter = "all" | "deposit" | "rakeback" | "cashback";
const MONO = "var(--font-jetbrains-mono), monospace";
const COLS = "md:grid-cols-[minmax(170px,1fr)_minmax(240px,1.6fr)_96px_140px_96px_110px_130px]";

function classify(o: Operator): { type: string; filter: Filter } {
  const b = (o.bonusShort ?? o.bonus).toLowerCase();
  if (b.includes("cashback")) return { type: "Cashback", filter: "cashback" };
  if (o.noDepositBonus || /rakeback|rewards|race|cashrake/.test(b)) return { type: "Rewards", filter: "rakeback" };
  return { type: "Deposit bonus", filter: "deposit" };
}

function turnover(o: Operator): { text: string; tone: "good" | "mid" | "high" | "none" } {
  const wv = wagerView(o);
  const m = wv.mult;
  if (wv.kind === "none" || m === 0) return { text: "None", tone: "good" };
  if (m === null) return { text: "See terms", tone: "none" };
  const per = m <= 1 ? "$100" : `$${(m * 100).toLocaleString()}`;
  const text = o.wagerBasis === "deposit" ? `${m}× deposit` : o.wagerBasis?.includes("deposit") ? `${per} + dep.` : per;
  return { text, tone: m <= 1 ? "good" : m <= 35 ? "mid" : "high" };
}

const TONE = { good: "#7BE0B8", mid: "#E8EDF0", high: "#F0A77F", none: "#6E7F88" };

export function BonusesPage() {
  const { ops } = siteData;
  const [filter, setFilter] = useState<Filter>("all");

  const rows = ops
    .filter((o) => filter === "all" || classify(o).filter === filter)
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || compareWager(a, b));

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All offers" },
    { key: "deposit", label: "Deposit bonuses" },
    { key: "rakeback", label: "Rakeback & rewards" },
    { key: "cashback", label: "Cashback" },
  ];
  const countFor = (f: Filter) => (f === "all" ? ops.length : ops.filter((o) => classify(o).filter === f).length);
  const noWager = ops.filter((o) => wagerView(o).kind === "none" || wagerView(o).mult === 0).length;

  return (
    <main style={{ background: "#07090B" }}>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(80% 120% at 85% 0%, rgba(255,204,0,.08), transparent 55%), radial-gradient(60% 80% at 0% 100%, rgba(0,194,204,.07), transparent 60%), #0A0D10" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px 40px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 14 }}>Casino bonuses</div>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(36px, 4.6vw, 54px)", lineHeight: 1.02, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "114%", color: "#fff", textWrap: "balance" }}>
            Every offer, and what it takes to cash out
          </h1>
          <p style={{ margin: "0 0 26px", maxWidth: "62ch", fontSize: 16.5, lineHeight: 1.6, color: "#A8B6BE" }}>
            Welcome bonuses, rakeback and cashback from {ops.length} crypto casinos, sorted by how much you have to bet before you can withdraw. Every term comes from the casino&apos;s own bonus rules.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              ["gift", `${ops.length} offers compared`],
              ["percent", `${noWager} with no wagering`],
              ["bolt", "Wagering, time limit & max cashout"],
            ].map(([icon, text]) => (
              <span key={text} style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "9px 14px", borderRadius: 100, background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)", fontSize: 13.5, fontWeight: 600, color: "#E8EDF0" }}>
                <span style={{ color: "#00C2CC", display: "inline-flex" }}><Icon name={icon as "gift"} size={16} /></span>
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 80px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {filters.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                style={{ padding: "9px 16px", borderRadius: 100, border: `1px solid ${active ? "rgba(0,194,204,.5)" : "rgba(255,255,255,.12)"}`, background: active ? "rgba(0,194,204,.14)" : "rgba(255,255,255,.02)", fontSize: 13.5, fontWeight: 600, color: active ? "#5FE3E8" : "#A8B6BE", cursor: "pointer" }}
              >
                {f.label} <span style={{ opacity: 0.55, marginLeft: 4 }}>{countFor(f.key)}</span>
              </button>
            );
          })}
        </div>

        <div style={{ borderRadius: 20, border: "1px solid rgba(255,255,255,.08)", background: "linear-gradient(180deg,#0E1317,#0A0E11)", overflow: "hidden" }}>
          <div className={`hidden md:grid ${COLS} items-center gap-4`} style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,.07)", fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#6E7F88" }}>
            <span>Casino</span>
            <span>Offer</span>
            <span>Wagering</span>
            <span>Bet per $100 bonus</span>
            <span>Time limit</span>
            <span>Max cashout</span>
            <span />
          </div>
          {rows.map((o, i) => {
            const brand = brandFor(o.slug);
            const c = casinoFacts(o);
            const t = turnover(o);
            const { type } = classify(o);
            const href = `/casinos/${o.slug}`;
            const cell = (label: string, value: string | null, color = "#fff") => (
              <div style={{ minWidth: 0 }}>
                <div className="md:hidden" style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".07em", textTransform: "uppercase", color: "#6E7F88", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: value ? color : "#4E5A62" }}>{value ?? "—"}</div>
              </div>
            );
            return (
              <div
                key={o.slug}
                className={`grid grid-cols-2 ${COLS} items-center gap-x-4 gap-y-3 transition-colors hover:bg-white/[0.025]`}
                style={{ padding: "16px 20px", borderTop: i ? "1px solid rgba(255,255,255,.05)" : undefined, background: o.featured ? `linear-gradient(90deg, ${brand}12, transparent 60%)` : undefined }}
              >
                <Link href={href} className="col-span-2 md:col-span-1" style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <span style={{ width: 36, height: 36, flex: "none", borderRadius: 10, overflow: "hidden" }}>
                    <BrandMark slug={o.slug} mono={o.mono} tint={brand} radius={10} fontSize={11} />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 15.5, fontWeight: 800, color: "#fff" }}>{o.name}</span>
                    <span style={{ display: "inline-block", marginTop: 3, padding: "2px 8px", borderRadius: 100, background: o.featured ? `${brand}1f` : "rgba(255,255,255,.05)", fontFamily: MONO, fontSize: 9, letterSpacing: ".05em", textTransform: "uppercase", color: o.featured ? brand : "#8DA0AA" }}>
                      {o.featured ? "Featured" : type}
                    </span>
                  </span>
                </Link>
                <Link href={href} className="col-span-2 md:col-span-1" style={{ fontSize: 15, lineHeight: 1.3, fontWeight: 700, color: "#E8EDF0", minWidth: 0 }}>
                  {c.headline}
                </Link>
                {cell("Wagering", c.wagering)}
                {cell("Bet per $100 bonus", t.text, TONE[t.tone])}
                {cell("Time limit", c.expiry)}
                {cell("Max cashout", c.maxCashout)}
                <div className="col-span-2 md:col-span-1">
                  <Link href={href} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 12px", borderRadius: 10, background: o.featured ? brand : "#00C2CC", color: "#0A0D0F", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" }}>
                    View offer <Icon name="arrow" size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14, marginTop: 24 }}>
          <div style={{ padding: "26px 28px", borderRadius: 18, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 10 }}>How to read this</div>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "#A8B6BE" }}>
              &ldquo;Bet per $100 bonus&rdquo; is what you must wager before a $100 bonus becomes withdrawable. A 40× bonus asks for $4,000; rakeback with no wagering asks for nothing. Where the multiplier also covers your deposit, that turnover comes on top (&ldquo;+ dep.&rdquo;).
            </p>
          </div>
          <Link href="/guides/reading-wagering-requirements" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 18, padding: "26px 28px", borderRadius: 18, background: "linear-gradient(150deg,#10181B,#0B0F12)", border: "1px solid rgba(0,194,204,.2)" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-.015em" }}>Reading wagering requirements</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 700, color: "#00C2CC" }}>
              Read the guide <Icon name="arrow" size={14} />
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
