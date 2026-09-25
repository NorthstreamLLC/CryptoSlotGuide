"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { byHouseOn } from "@/lib/house-order";

export interface CalcCasino {
  slug: string;
  name: string;
  logo: string | null;
  featured: boolean;
  url: string;
  ranks: { rank: string; wager: number; rewards: string }[];
}

const MONO = "var(--font-jetbrains-mono), monospace";
const PRESETS = [1000, 10000, 50000, 250000, 1000000];
const money = (n: number) => (n >= 1e9 ? `$${n / 1e9}B` : n >= 1e6 ? `$${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${+(n / 1e3).toFixed(1)}K` : `$${n}`);

/** Enter a total wager; see the rank it reaches at every casino, and how far the next rank is. */
export function VipCalculator({ casinos }: { casinos: CalcCasino[] }) {
  const [wager, setWager] = useState(50000);
  const rows = useMemo(
    () =>
      casinos
        .map((c) => {
          let idx = -1;
          c.ranks.forEach((r, i) => {
            if (wager >= r.wager) idx = i;
          });
          const cur = idx >= 0 ? c.ranks[idx] : null;
          const next = c.ranks[idx + 1] ?? null;
          return { c, cur, next, pos: idx + 1, of: c.ranks.length, toNext: next ? next.wager - wager : 0 };
        })
        .sort(byHouseOn((r) => r.c)),
    [casinos, wager]
  );

  return (
    <div>
      <div style={{ padding: "22px 24px", borderRadius: 18, background: "#0C1013", border: "1px solid rgba(0,194,204,.25)", marginBottom: 16 }}>
        <label htmlFor="vip-wager" style={{ display: "block", fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#8E9CA5", marginBottom: 10 }}>
          Total amount wagered
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 11, background: "#080B0D", border: "1px solid rgba(255,255,255,.14)" }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#8DA0AA" }}>$</span>
            <input
              id="vip-wager"
              type="number"
              min={0}
              step={1000}
              value={wager}
              onChange={(e) => setWager(Math.max(0, Number(e.target.value) || 0))}
              style={{ width: 170, background: "transparent", border: 0, outline: "none", color: "#fff", fontSize: 22, fontWeight: 800 }}
            />
          </div>
          {PRESETS.map((p) => (
            <button key={p} type="button" onClick={() => setWager(p)} style={{ padding: "9px 13px", borderRadius: 100, border: `1px solid ${wager === p ? "rgba(0,194,204,.5)" : "rgba(255,255,255,.12)"}`, background: wager === p ? "rgba(0,194,204,.14)" : "transparent", color: wager === p ? "#5FE3E8" : "#A8B6BE", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {money(p)}
            </button>
          ))}
        </div>
        <input aria-label="Wager slider" type="range" min={0} max={6} step={0.01} value={Math.log10(Math.max(wager, 1))} onChange={(e) => setWager(Math.round(10 ** Number(e.target.value) / 100) * 100)} style={{ width: "100%", marginTop: 16, accentColor: "#00C2CC" }} />
      </div>

      <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,.08)", background: "#0C1013", overflow: "hidden" }}>
        {rows.map(({ c, cur, next, pos, of, toNext }, i) => (
          <div key={c.slug} className="grid grid-cols-1 md:grid-cols-[minmax(170px,1fr)_minmax(150px,.9fr)_minmax(240px,1.6fr)_minmax(150px,.9fr)]" style={{ gap: 14, padding: "15px 18px", borderTop: i ? "1px solid rgba(255,255,255,.05)" : undefined, alignItems: "center" }}>
            <Link href={`/casinos/${c.slug}`} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {c.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.logo} alt="" width={30} height={30} style={{ borderRadius: 8 }} />
              ) : (
                <span style={{ width: 30, height: 30, borderRadius: 8, background: "#2A3439" }} />
              )}
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{c.name}</span>
            </Link>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: cur ? "#7BE0B8" : "#8E9CA5" }}>{cur ? cur.rank : "Below first rank"}</div>
              <div style={{ marginTop: 5, height: 5, borderRadius: 10, background: "rgba(255,255,255,.07)", overflow: "hidden" }}>
                <div style={{ width: `${(pos / of) * 100}%`, height: "100%", background: "#2FB67A" }} />
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: "#8E9CA5", marginTop: 4 }}>rank {pos} of {of}</div>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: "#A8B6BE" }}>{cur?.rewards ?? `First rank at ${money(c.ranks[0].wager)} wagered.`}</div>
            <div style={{ fontSize: 13, color: "#C6D1D7" }}>
              {next ? (
                <>
                  <strong style={{ color: "#fff" }}>{next.rank}</strong> in {money(toNext)} more
                </>
              ) : (
                <span style={{ color: "#D6B65C", fontWeight: 700 }}>Top published rank</span>
              )}
              <div>
                <a href={c.url} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10, color: "#5FE3E8" }}>source ↗</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
