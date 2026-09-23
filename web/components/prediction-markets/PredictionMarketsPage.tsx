"use client";

import { useState } from "react";
import { siteData } from "@/lib/site-data";

/**
 * Ported from the `isPredict` block in CryptoSlotGuide.dc.html (search
 * for `PREDICTION MARKETS`). Two lists split by settlement asset —
 * crypto-settled and regulated fiat — never merged.
 *
 * `initialTab` deep-links to the Regulated fiat list — the source's
 * `predTab` state that the mega-menu's Regulated fiat rail item and its
 * venue links (Kalshi, Polymarket US, ...) jump straight to. Read
 * server-side in app/prediction-markets/page.tsx (same pattern as
 * /search's `q` param) rather than via useSearchParams, so the page
 * stays statically prerenderable.
 */
export function PredictionMarketsPage({ initialTab = "crypto" }: { initialTab?: "crypto" | "fiat" }) {
  const { predMarkets } = siteData;
  const [tab, setTab] = useState<"crypto" | "fiat">(initialTab);
  const [open, setOpen] = useState<string | null>(null);
  // Listed A–Z; venues are not ranked. Every figure is from the venue's own pages (see facts).
  const rows = [...predMarkets[tab]].sort((a, b) => a.name.localeCompare(b.name));

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
                <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#83919A", marginBottom: 8 }}>Crypto-settled</div>
                <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 21, color: "#fff" }}>{predMarkets.crypto.length}</div>
                <div style={{ fontSize: 11.5, color: "#7B8A93", marginTop: 3 }}>Venues listed</div>
              </div>
              <div style={{ padding: "18px 20px", background: "rgba(12,16,19,.86)" }}>
                <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#83919A", marginBottom: 8 }}>Regulated fiat</div>
                <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 21, color: "#fff" }}>{predMarkets.fiat.length}</div>
                <div style={{ fontSize: 11.5, color: "#7B8A93", marginTop: 3 }}>Venues listed</div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 32 }}>
            {(
              [
                { key: "crypto" as const, label: "Crypto-settled", note: "Stablecoins, wallet or email login" },
                { key: "fiat" as const, label: "Regulated fiat", note: "USD, identity checks" },
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
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".05em", color: "#83919A" }}>{t.note}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "36px 40px 80px" }}>
        <div style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, overflowX: "auto" }}>
          <div style={{ display: "grid", minWidth: 1020, gridTemplateColumns: "minmax(220px,1.3fr) minmax(150px,1fr) minmax(150px,1fr) 150px 170px 90px", background: "rgba(255,255,255,.03)", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
            {["Venue", "Settlement", "Cost to trade", "Account", "Payout", ""].map((h) => (
              <div key={h} style={{ padding: "14px 16px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".07em", textTransform: "uppercase", color: "#83919A" }}>{h}</div>
            ))}
          </div>
          {rows.map((m) => (
            <div key={m.name}>
            <div style={{ display: "grid", minWidth: 1020, gridTemplateColumns: "minmax(220px,1.3fr) minmax(150px,1fr) minmax(150px,1fr) 150px 170px 90px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: "-.015em", color: "#fff" }}>{m.name}</div>
                <div style={{ fontSize: 12, lineHeight: 1.5, color: "#7B8A93", marginTop: 4, maxWidth: "52ch" }}>{m.note}</div>
              </div>
              <div style={{ padding: "14px 16px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, color: m.tint }}>{m.settle}</div>
              <div style={{ padding: "14px 16px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, color: "#DCE5E9" }}>{m.fee}</div>
              <div style={{ padding: "14px 16px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, color: "#8DA0AA" }}>{m.kyc}</div>
              <div style={{ padding: "14px 16px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, color: "#8DA0AA" }}>{m.payout}</div>
              <div style={{ padding: "14px 16px" }}>
                <button type="button" onClick={() => setOpen(open === m.name ? null : m.name)} aria-expanded={open === m.name} style={{ padding: "7px 10px", borderRadius: 7, border: "1px solid rgba(255,255,255,.14)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#A8B6BE", whiteSpace: "nowrap" }}>
                  {open === m.name ? "Hide" : "Sources"}
                </button>
              </div>
            </div>
            {open === m.name && (
              <div style={{ minWidth: 1020, padding: "4px 16px 18px", borderBottom: "1px solid rgba(255,255,255,.05)", background: "rgba(255,255,255,.015)" }}>
                {m.facts.map((f) => (
                  <div key={f.label} style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 14, padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                    <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".05em", textTransform: "uppercase", color: "#83919A" }}>{f.label}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.55, color: "#B7C4CB" }}>
                      {f.text}{" "}
                      <a href={f.url} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#5FE3E8", whiteSpace: "nowrap" }}>{new URL(f.url).hostname.replace(/^www./, "")} ↗</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
