"use client";

import { useState } from "react";
import { siteData } from "@/lib/site-data";

/**
 * Ported from the `isPredict` block in CryptoSlotGuide.dc.html (search
 * for `PREDICTION MARKETS`). Two lists split by settlement asset —
 * crypto-settled and regulated fiat — never merged.
 */
export function PredictionMarketsPage() {
  const { predMarkets } = siteData;
  const [tab, setTab] = useState<"crypto" | "fiat">("crypto");
  const rows = predMarkets[tab];

  return (
    <main>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "#0B0F12" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "48px 40px 36px" }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 16 }}>
            Prediction markets · event contracts
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr .7fr", gap: 56, alignItems: "end" }}>
            <div>
              <h1 style={{ margin: "0 0 14px", fontSize: 48, lineHeight: 1.02, letterSpacing: "-.038em", fontWeight: 800, fontStretch: "116%", color: "#fff", textWrap: "balance" }}>
                Odds set by people with money on it
              </h1>
              <p style={{ margin: 0, maxWidth: "70ch", fontSize: 16.5, lineHeight: 1.65, color: "#96A6AF", textWrap: "pretty" }}>
                Event contracts price probability instead of paying a bookmaker&apos;s margin — which is why the effective hold is a fee, not a spread. Two lists, because the settlement asset decides everything else: what account you need, whether you pass KYC, and how quickly you get paid.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 13, overflow: "hidden" }}>
              <div style={{ padding: "18px 20px", background: "rgba(12,16,19,.86)" }}>
                <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#5C6A72", marginBottom: 8 }}>Deepest book</div>
                <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 21, color: "#fff" }}>$1.2b</div>
                <div style={{ fontSize: 11.5, color: "#7B8A93", marginTop: 3 }}>Polymarket, monthly</div>
              </div>
              <div style={{ padding: "18px 20px", background: "rgba(12,16,19,.86)" }}>
                <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#5C6A72", marginBottom: 8 }}>Cheapest cost</div>
                <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 21, color: "#fff" }}>$0.01</div>
                <div style={{ fontSize: 11.5, color: "#7B8A93", marginTop: 3 }}>Per contract, brokered</div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 32 }}>
            {(
              [
                { key: "crypto" as const, label: "Crypto-settled", note: "USDC, wallet-only, instant" },
                { key: "fiat" as const, label: "Regulated fiat", note: "USD, full KYC, ACH" },
              ]
            ).map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                    padding: "12px 18px",
                    borderRadius: 11,
                    border: `1px solid ${active ? "rgba(0,194,204,.5)" : "rgba(255,255,255,.10)"}`,
                    background: active ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.02)",
                    color: active ? "#fff" : "#A8B6BE",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-.01em" }}>{t.label}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".05em", color: "#5C6A72" }}>{t.note}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "36px 40px 80px" }}>
        <div style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, overflowX: "auto" }}>
          <div style={{ display: "grid", minWidth: 1020, gridTemplateColumns: "52px minmax(180px,1.1fr) minmax(150px,1fr) 140px 120px 140px 96px", background: "rgba(255,255,255,.03)", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
            {["#", "Venue", "Settlement", "Cost to trade", "Identity", "Payout", "Score"].map((h) => (
              <div key={h} style={{ padding: "14px 16px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".07em", textTransform: "uppercase", color: "#5C6A72" }}>{h}</div>
            ))}
          </div>
          {rows.map((m, i) => (
            <div key={m.name} style={{ display: "grid", minWidth: 1020, gridTemplateColumns: "52px minmax(180px,1.1fr) minmax(150px,1fr) 140px 120px 140px 96px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
              <div style={{ padding: 16, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: "#5C6A72" }}>{String(i + 1).padStart(2, "0")}</div>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: "-.015em", color: "#fff" }}>{m.name}</div>
                <div style={{ fontSize: 12, lineHeight: 1.5, color: "#7B8A93", marginTop: 4, maxWidth: "52ch" }}>{m.note}</div>
              </div>
              <div style={{ padding: "14px 16px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, color: m.tint }}>{m.settle}</div>
              <div style={{ padding: "14px 16px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, color: "#DCE5E9" }}>{m.fee}</div>
              <div style={{ padding: "14px 16px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, color: "#8DA0AA" }}>{m.kyc}</div>
              <div style={{ padding: "14px 16px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, color: "#8DA0AA" }}>{m.payout}</div>
              <div style={{ padding: "14px 16px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 16, color: "#fff" }}>{m.score.toFixed(1)}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
