"use client";

import Link from "next/link";
import { useState } from "react";
import { siteData, siteCounts } from "@/lib/site-data";
import { logoFor } from "@/lib/casino-index";

/**
 * Ported from the `isCoins` block in CryptoSlotGuide.dc.html (search for
 * `COINS`) plus the `coinRows`/`coinTicker`/`coinDetail` renderVals logic.
 */
export default function Page() {
  const { coinDefs, ops, coinsBy } = siteData;
  const [sel, setSel] = useState<string>("all");

  const coinOps = (t: string) => ops.filter((o) => (coinsBy[o.slug] ?? []).map(String).includes(t));
  const rows = coinDefs.filter((c) => sel === "all" || c.ticker === sel);

  const detail = sel === "all" ? [] : [...coinOps(sel)].sort((a, b) => b.score - a.score);

  return (
    <main>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "#090C0F" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px", display: "flex", gap: 26, overflowX: "auto" }}>
          {([{ ticker: "all", label: "All" }, ...coinDefs.map((c) => ({ ticker: c.ticker as string, label: c.ticker }))]).map((c) => {
            const active = sel === c.ticker;
            return (
              <button
                key={c.ticker}
                type="button"
                onClick={() => setSel(c.ticker)}
                style={{ padding: "16px 0", border: 0, borderBottom: `2px solid ${active ? "#00C2CC" : "transparent"}`, background: "transparent", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, letterSpacing: ".08em", color: active ? "#fff" : "#8DA0AA", fontWeight: active ? 700 : 500, whiteSpace: "nowrap" }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "46px 40px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32, flexWrap: "wrap", marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 12 }}>
              Cryptocurrencies · {sel === "all" ? "ALL" : sel}
            </div>
            <h1 style={{ margin: "0 0 10px", fontSize: 40, lineHeight: 1.04, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "114%", color: "#fff" }}>
              Deposit and withdraw, coin by coin
            </h1>
            <p style={{ margin: 0, maxWidth: "74ch", fontSize: 16, lineHeight: 1.6, color: "#93A3AC", textWrap: "pretty" }}>
              Which coins the operators on our index actually credit, how long each took to become a playable balance, and what the network charged us to move it. Timed on our own funded accounts.
            </p>
          </div>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#4E5A62", whiteSpace: "nowrap" }}>
            {coinDefs.length} coins · {siteCounts.casinos} operators · 412 transfers
          </div>
        </div>

        <div role="table" style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflowX: "auto", background: "#0C1013", boxShadow: "0 12px 40px rgba(0,0,0,.35)" }}>
          <div role="row" style={{ display: "grid", minWidth: 1120, gridTemplateColumns: "minmax(240px,1.3fr) 120px 130px 116px 116px 150px 168px", background: "#101519", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
            {["Coin", "Accepted at", "Credit time", "Confirms", "Network fee", "Credit spread", ""].map((h) => (
              <div key={h} role="columnheader" style={{ padding: "14px 12px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".07em", textTransform: "uppercase", color: "#5C6A72" }}>{h}</div>
            ))}
          </div>
          {rows.map((c) => {
            const opsForCoin = coinOps(c.ticker);
            const pct = ops.length ? Math.round((opsForCoin.length / ops.length) * 100) : 0;
            const peak = Math.max(1, ...c.distribution);
            return (
              <div key={c.ticker} role="row" style={{ display: "grid", minWidth: 1120, gridTemplateColumns: "minmax(240px,1.3fr) 120px 130px 116px 116px 150px 168px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                <div role="cell" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 13, minWidth: 0 }}>
                  <span style={{ width: 34, height: 34, flex: "none", borderRadius: "50%", background: c.tint, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 8.5, fontWeight: 700, color: "#0A0D0F" }}>{c.ticker}</span>
                  <div style={{ minWidth: 0 }}>
                    <button type="button" onClick={() => setSel(c.ticker)} style={{ display: "block", fontSize: 14.5, fontWeight: 600, color: "#E8EDF0", textAlign: "left" }}>{c.name}</button>
                    <div style={{ fontSize: 12, color: "#6E7F88", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>{c.note}</div>
                  </div>
                </div>
                <div role="cell" style={{ padding: "14px 12px" }}>
                  <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 15, fontWeight: 500, color: "#fff" }}>{opsForCoin.length}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, color: "#5C6A72", marginTop: 2 }}>{pct}% of index</div>
                </div>
                <div role="cell" style={{ padding: "14px 12px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: "#B7C4CB" }}>{c.creditTime}</div>
                <div role="cell" style={{ padding: "14px 12px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: "#B7C4CB" }}>{c.confirms}</div>
                <div role="cell" style={{ padding: "14px 12px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: "#B7C4CB" }}>{c.fee}</div>
                <div role="cell" style={{ padding: "14px 12px" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 34 }}>
                    {c.distribution.map((v, i) => (
                      <span key={i} style={{ width: 6, borderRadius: "2px 2px 0 0", background: c.tint, opacity: 0.55, height: Math.max(3, Math.round((v / peak) * 34)) }} />
                    ))}
                  </div>
                </div>
                <div role="cell" style={{ padding: "12px 18px", display: "flex", gap: 8 }}>
                  <Link href={`/crypto-casinos?coin=${c.ticker}`} className="hover:!border-accent hover:!text-[#5FE3E8]" style={{ flex: 1, textAlign: "center", padding: 9, borderRadius: 7, border: "1px solid rgba(255,255,255,.16)", color: "#DCE5E9", fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap" }}>
                    Casinos
                  </Link>
                  <button type="button" onClick={() => setSel(c.ticker)} style={{ padding: "9px 12px", borderRadius: 7, border: "1px solid rgba(255,255,255,.10)", color: "#8DA0AA", fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" }}>
                    Detail
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {sel !== "all" ? (
        <section style={{ maxWidth: 1400, margin: "0 auto", padding: "38px 40px 84px" }}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ margin: "0 0 7px", fontSize: 26, letterSpacing: "-.028em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>
              Casinos that credit {coinDefs.find((c) => c.ticker === sel)?.name ?? sel}
            </h2>
            <p style={{ margin: 0, fontSize: 14.5, color: "#8DA0AA" }}>{detail.length} operators, ranked by overall score. Payout time is the median across all coins at that operator.</p>
          </div>
          <div style={{ display: "grid", minWidth: 0, gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
            {detail.map((o, i) => (
              <Link key={o.slug} href={o.hasCustomReview ? "/casinos/roobet" : `/casinos/${o.slug}`} style={{ display: "flex", flexDirection: "column", gap: 16, padding: 20, borderRadius: 13, background: "#0C1013", border: "1px solid rgba(255,255,255,.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 56, height: 28, flex: "none", display: "flex", alignItems: "center" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoFor(o.slug)} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: "#E8EDF0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.name}</div>
                    <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, color: "#5C6A72", marginTop: 2 }}>{String(i + 1).padStart(2, "0")} on the index</div>
                  </div>
                  <span style={{ marginLeft: "auto", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 17, fontWeight: 500, color: "#fff" }}>{o.score.toFixed(1)}</span>
                </div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".04em" }}>
                  <span style={{ padding: "4px 8px", borderRadius: 4, background: "rgba(255,255,255,.05)", color: "#B7C4CB" }}>{o.payoutLabel}</span>
                  <span style={{ padding: "4px 8px", borderRadius: 4, background: "rgba(255,255,255,.05)", color: "#B7C4CB" }}>{o.conf} confirms</span>
                  {o.ln && <span style={{ padding: "4px 8px", borderRadius: 4, background: "rgba(0,194,204,.10)", color: "#5FE3E8" }}>Lightning</span>}
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "#7B8A93", textWrap: "pretty" }}>{o.bonus}</div>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section style={{ maxWidth: 1400, margin: "0 auto", padding: "38px 40px 84px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr .6fr", gap: 14 }}>
            <div style={{ padding: "28px 32px", borderRadius: 14, background: "linear-gradient(150deg,#0E1417,#0A0E10)", border: "1px solid rgba(255,255,255,.07)" }}>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 12 }}>How to read credit spread</div>
              <p style={{ margin: 0, maxWidth: "78ch", fontSize: 15, lineHeight: 1.7, color: "#93A3AC", textWrap: "pretty" }}>
                The bars show how our timed deposits for each coin were distributed, fastest on the left. A tall left edge means the coin behaved predictably; a long tail means at least one operator batches deposits on a schedule rather than crediting on confirmation. Pick a ticker above to see which operators sit where.
              </p>
            </div>
            <Link href="/crypto-casinos" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 20, padding: "28px 32px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-.015em" }}>Filter the casino index by coin</div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".05em", color: "#00C2CC" }}>{siteCounts.casinos} operators, {coinDefs.length} coins →</div>
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
