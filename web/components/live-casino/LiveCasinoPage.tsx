"use client";

import Link from "next/link";
import { useState } from "react";
import { siteData, siteCounts } from "@/lib/site-data";
import { logoFor } from "@/lib/casino-index";
import type { LiveGame } from "@/lib/types";

const TYPES: LiveGame["type"][] = ["Blackjack", "Roulette", "Baccarat", "Game show", "Card", "Dice"];

/**
 * Ported from the `isLive` block in CryptoSlotGuide.dc.html (search for
 * `Live casino · {{ cLive }} tables`).
 */
export function LiveCasinoPage({ initialType }: { initialType?: LiveGame["type"] }) {
  const { liveCasinos, liveGames } = siteData;
  const [type, setType] = useState<LiveGame["type"] | null>(initialType ?? null);

  const bestReturn = [...liveGames].sort((a, b) => b.rtp - a.rtp)[0];
  const fastest = [...liveCasinos].sort((a, b) => parseInt(a.latency, 10) - parseInt(b.latency, 10))[0];
  const rows = type ? liveGames.filter((g) => g.type === type) : liveGames;

  return (
    <main>
      <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,.07)", background: "#090C0F" }}>
        <div style={{ position: "absolute", inset: "-30% -10% auto -10%", height: "150%", pointerEvents: "none" }} aria-hidden>
          <span style={{ position: "absolute", top: "6%", right: "8%", width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,126,182,.26),transparent 66%)", animation: "csg-drift 22s ease-in-out infinite" }} />
          <span style={{ position: "absolute", top: "24%", left: "12%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,194,204,.20),transparent 66%)", animation: "csg-drift2 27s ease-in-out infinite" }} />
        </div>
        <div style={{ position: "relative", maxWidth: 1400, margin: "0 auto", padding: "64px 40px 52px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "6px 13px", border: "1px solid rgba(255,90,120,.38)", borderRadius: 100, background: "rgba(255,90,120,.10)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".07em", textTransform: "uppercase", color: "#FF9FC7", marginBottom: 22 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF5A78", animation: "csg-live 2s ease-out infinite" }} />
            Live casino · {siteCounts.live} tables · dealt in real time
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.25fr .75fr", gap: 56, alignItems: "end" }}>
            <div>
              <h1 style={{ margin: "0 0 14px", fontSize: 52, lineHeight: 1.02, letterSpacing: "-.038em", fontWeight: 800, fontStretch: "116%", color: "#fff", textWrap: "balance" }}>
                Real dealers, measured limits
              </h1>
              <p style={{ margin: 0, maxWidth: "68ch", fontSize: 16.5, lineHeight: 1.65, color: "#96A6AF", textWrap: "pretty" }}>
                We sat at {siteCounts.live} tables across {siteCounts.liveOps} operators with real balances: clocking stream latency, logging the actual minimum and maximum stake at the seat, and checking which studio is behind the glass. Operators first, then the tables worth your seat.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 13, overflow: "hidden" }}>
              <div style={{ padding: "18px 20px", background: "rgba(12,16,19,.9)" }}>
                <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#5C6A72", marginBottom: 8 }}>Best return live</div>
                <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 23, color: "#fff" }}>{bestReturn.rtp.toFixed(2)}%</div>
                <div style={{ fontSize: 11.5, color: "#7B8A93", marginTop: 3 }}>{bestReturn.name}</div>
              </div>
              <div style={{ padding: "18px 20px", background: "rgba(12,16,19,.9)" }}>
                <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#5C6A72", marginBottom: 8 }}>Fastest stream</div>
                <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 23, color: "#fff" }}>{fastest.latency}</div>
                <div style={{ fontSize: 11.5, color: "#7B8A93", marginTop: 3 }}>{fastest.name}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "56px 40px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32, flexWrap: "wrap", marginBottom: 22 }}>
          <div>
            <h2 style={{ margin: "0 0 8px", fontSize: 30, letterSpacing: "-.03em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>Top live casinos</h2>
            <p style={{ margin: 0, fontSize: 15, color: "#8DA0AA" }}>Scored on studio breadth, seat limits and how quickly the stream reacts.</p>
          </div>
          <Link href="/compare" style={{ fontSize: 14, fontWeight: 600, color: "#00C2CC", whiteSpace: "nowrap" }}>Compare operators →</Link>
        </div>
        <div style={{ display: "grid", minWidth: 0, gridTemplateColumns: "repeat(auto-fit,minmax(292px,1fr))", gap: 14 }}>
          {liveCasinos.map((o) => (
            <Link
              key={o.slug}
              href={`/casinos/${o.slug}`}
              style={{ position: "relative", display: "flex", flexDirection: "column", padding: 22, borderRadius: 15, background: "linear-gradient(168deg,rgba(20,26,31,.95),rgba(11,15,18,.95))", border: "1px solid rgba(255,255,255,.08)", overflow: "hidden" }}
            >
              <span style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${o.tint},transparent)` }} />
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 60, height: 42, flex: "none", display: "flex", alignItems: "center" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoFor(o.slug)} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-.02em", color: "#fff" }}>{o.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", color: o.tint, marginTop: 3 }}>{o.tables} tables</div>
                </div>
                <span style={{ marginLeft: "auto", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 20, color: "#fff" }}>{o.score.toFixed(1)}</span>
              </div>
              <p style={{ margin: "0 0 16px", fontSize: 13, lineHeight: 1.55, color: "#8DA0AA", textWrap: "pretty" }}>{o.note}</p>
              <div style={{ marginTop: "auto", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.07)" }}>
                <MiniStat label="Stakes" value={o.stakes} />
                <MiniStat label="Latency" value={o.latency} />
                <MiniStat label="Studios" value={o.studios.join(", ")} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "56px 40px 84px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32, flexWrap: "wrap", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: "0 0 8px", fontSize: 30, letterSpacing: "-.03em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>Live tables we track</h2>
            <p style={{ margin: 0, fontSize: 15, color: "#8DA0AA" }}>{rows.length} tables · published return, real seat minimum, and the operator we found it cheapest at.</p>
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setType(null)}
              style={{ padding: "7px 13px", borderRadius: 100, border: `1px solid ${!type ? "rgba(0,194,204,.5)" : "rgba(255,255,255,.12)"}`, background: !type ? "rgba(0,194,204,.12)" : "transparent", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: !type ? "#5FE3E8" : "#A8B6BE" }}
            >
              All
            </button>
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                style={{ padding: "7px 13px", borderRadius: 100, border: `1px solid ${type === t ? "rgba(0,194,204,.5)" : "rgba(255,255,255,.12)"}`, background: type === t ? "rgba(0,194,204,.12)" : "transparent", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: type === t ? "#5FE3E8" : "#A8B6BE" }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", minWidth: 0, gridTemplateColumns: "repeat(auto-fit,minmax(232px,1fr))", gap: 12 }}>
          {rows.map((g) => (
            <Link key={g.slug} href={`/live-casino/${g.slug}`} style={{ position: "relative", display: "flex", flexDirection: "column", padding: 18, borderRadius: 14, background: "rgba(12,16,19,.8)", border: "1px solid rgba(255,255,255,.07)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
                <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", color: g.tint }}>{g.type}</span>
                <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, letterSpacing: ".06em", color: "#4E5A62" }}>{g.studio}</span>
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: "-.02em", color: "#fff", marginBottom: 6, textWrap: "balance" }}>{g.name}</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "#7B8A93", marginBottom: 16 }}>{g.edge}</div>
              <div style={{ marginTop: "auto", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, paddingTop: 13, borderTop: "1px solid rgba(255,255,255,.07)" }}>
                <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 16, color: "#fff" }}>{g.rtp.toFixed(2)}%</span>
                <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, color: "#5C6A72" }}>min {g.stake}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 11, fontSize: 11.5, color: "#8DA0AA" }}>
                <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, letterSpacing: ".07em", textTransform: "uppercase", color: "#4E5A62" }}>best at</span>
                {g.best}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9, letterSpacing: ".08em", textTransform: "uppercase", color: "#4E5A62", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11.5, color: "#DCE5E9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
    </div>
  );
}
