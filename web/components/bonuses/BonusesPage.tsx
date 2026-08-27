"use client";

import Link from "next/link";
import { useState } from "react";
import { siteData } from "@/lib/site-data";
import { logoFor } from "@/lib/casino-index";

/**
 * Ported from the `isBonuses` block in CryptoSlotGuide.dc.html (search
 * for `Bonuses · turnover cost`). The whole point of the page is that
 * turnover-per-$100, not the headline percentage, is the number that
 * matters — computed from each operator's real wager multiplier.
 *
 * Split out of app/bonuses/page.tsx so that file can be a server
 * component exporting real per-page metadata — a "use client" page
 * can't do that.
 */
type Filter = "all" | "cashback" | "rakeback" | "deposit";

function classify(bonus: string): { type: string; filter: Filter } {
  const b = bonus.toLowerCase();
  if (b.includes("cashback")) return { type: "Cashback", filter: "cashback" };
  if (b.includes("rakeback") || b.includes("rakewards") || b.includes("rewards")) return { type: "Rakeback", filter: "rakeback" };
  if (b.includes("match") || b.includes("deposit") || b.includes("btc")) return { type: "Deposit match", filter: "deposit" };
  return { type: "Other", filter: "all" };
}

export function BonusesPage() {
  const { ops } = siteData;
  const [filter, setFilter] = useState<Filter>("all");

  const rows = ops
    .map((o) => ({ o, ...classify(o.bonus) }))
    .filter((r) => filter === "all" || r.filter === filter)
    .sort((a, b) => a.o.wager - b.o.wager);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "cashback", label: "Cashback" },
    { key: "rakeback", label: "Rakeback" },
    { key: "deposit", label: "Deposit match" },
  ];
  const countFor = (f: Filter) => (f === "all" ? ops.length : ops.filter((o) => classify(o.bonus).filter === f).length);

  const lowCount = ops.filter((o) => o.wager <= 1).length;

  return (
    <main>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(110% 100% at 78% 0%, rgba(255,204,0,.07), transparent 58%), #090C0F" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "48px 40px 38px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr .7fr", gap: 56, alignItems: "end" }}>
            <div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 16 }}>
                Bonuses · turnover cost
              </div>
              <h1 style={{ margin: "0 0 14px", fontSize: 50, lineHeight: 1.02, letterSpacing: "-.038em", fontWeight: 800, fontStretch: "116%", color: "#fff", textWrap: "balance" }}>
                What each offer actually costs you
              </h1>
              <p style={{ margin: 0, maxWidth: "66ch", fontSize: 16.5, lineHeight: 1.65, color: "#93A3AC", textWrap: "pretty" }}>
                Every live offer on our index, with the turnover it demands per $100 of credit, the cashout cap, and the expiry — transcribed from the operator&apos;s own terms rather than the banner.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)" }}>
              <StatRow label="Offers tracked" value={String(ops.length)} />
              <StatRow label="At 1× wagering" value={String(lowCount)} color="#5FE3E8" />
              <StatRow label="Terms read" value="21 Aug" />
            </div>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "30px 40px 84px" }}>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 }}>
          {filters.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                style={{ padding: "8px 14px", borderRadius: 100, border: `1px solid ${active ? "rgba(0,194,204,.45)" : "rgba(255,255,255,.14)"}`, background: active ? "rgba(0,194,204,.12)" : "rgba(255,255,255,.02)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".04em", color: active ? "#5FE3E8" : "#A8B6BE", whiteSpace: "nowrap" }}
              >
                {f.label} <span style={{ opacity: 0.55 }}>{countFor(f.key)}</span>
              </button>
            );
          })}
        </div>

        <div role="table" style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflowX: "auto", background: "#0C1013", boxShadow: "0 12px 40px rgba(0,0,0,.35)" }}>
          <div role="row" style={{ display: "grid", minWidth: 1120, gridTemplateColumns: "minmax(210px,1fr) minmax(220px,1.3fr) 140px 96px 150px 110px 108px", background: "#101519", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
            {["Operator", "Offer", "Type", "Wagering", "Turnover per $100", "Cashout cap", "Verdict"].map((h) => (
              <div key={h} role="columnheader" style={{ padding: "14px 14px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".07em", textTransform: "uppercase", color: "#5C6A72" }}>{h}</div>
            ))}
          </div>
          {rows.map(({ o, type }) => {
            const low = o.wager <= 1;
            const mid = o.wager > 1 && o.wager <= 35;
            const cost = low ? "$100" : `$${(o.wager * 100).toLocaleString()}`;
            const costColor = low ? "#5FE3E8" : mid ? "#E8EDF0" : "#DA9877";
            const flag = low ? { label: "Fair", bg: "rgba(0,194,204,.12)", color: "#5FE3E8" } : mid ? { label: "Watch", bg: "rgba(214,182,92,.14)", color: "#D6B65C" } : { label: "Limits withdrawal", bg: "rgba(196,101,58,.12)", color: "#DA9877" };
            return (
              <div key={o.slug} role="row" style={{ display: "grid", minWidth: 1120, gridTemplateColumns: "minmax(210px,1fr) minmax(220px,1.3fr) 140px 96px 150px 110px 108px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                <div role="cell" style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                  <div style={{ width: 54, height: 26, flex: "none", display: "flex", alignItems: "center" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoFor(o.slug)} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </div>
                  <Link href={o.hasCustomReview ? "/casinos/roobet" : `/casinos/${o.slug}`} className="hover:!text-accent" style={{ fontSize: 14, fontWeight: 600, color: "#E8EDF0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.name}</Link>
                </div>
                <div role="cell" style={{ padding: 14, fontSize: 13, color: "#B7C4CB", minWidth: 0 }}>
                  <span style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.bonus}</span>
                  <span style={{ display: "block", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, color: "#5C6A72", marginTop: 3 }}>expires 30 days</span>
                </div>
                <div role="cell" style={{ padding: 14, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11.5, color: "#8DA0AA" }}>{type}</div>
                <div role="cell" style={{ padding: 14, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 13, color: "#E8EDF0" }}>{o.wager}×</div>
                <div role="cell" style={{ padding: 14, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 14, fontWeight: 500, color: costColor }}>{cost}</div>
                <div role="cell" style={{ padding: 14, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11.5, color: "#B7C4CB" }}>{low ? "Uncapped" : "5× bonus"}</div>
                <div role="cell" style={{ padding: 14 }}>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".05em", padding: "3px 7px", borderRadius: 4, background: flag.bg, color: flag.color, whiteSpace: "nowrap" }}>{flag.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr .6fr", gap: 14, marginTop: 24 }}>
          <div style={{ padding: "28px 32px", borderRadius: 14, background: "linear-gradient(150deg,#0E1417,#0A0E10)", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 12 }}>Read the turnover column first</div>
            <p style={{ margin: 0, maxWidth: "80ch", fontSize: 15, lineHeight: 1.7, color: "#93A3AC", textWrap: "pretty" }}>
              A 360% match at 40× wagering asks $4,000 of turnover per $100 credited. A 10% cashback at 1× asks $100. The headline percentage is the least useful number on any bonus page, which is why it is not a column here.
            </p>
          </div>
          <Link href="/guides/reading-wagering-requirements" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 20, padding: "28px 32px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-.015em" }}>Reading wagering requirements</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".05em", color: "#00C2CC" }}>Guide · 6 min →</div>
          </Link>
        </div>
      </section>
    </main>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, padding: "14px 16px", background: "#0C1013" }}>
      <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#5C6A72" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 17, color: color ?? "#fff" }}>{value}</span>
    </div>
  );
}
