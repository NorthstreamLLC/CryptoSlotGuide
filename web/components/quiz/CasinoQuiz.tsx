"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { QuizCasino } from "@/lib/quiz";
import { byHouseOn } from "@/lib/house-order";

const MONO = "var(--font-jetbrains-mono), monospace";

type Priority = "fast" | "nokyc" | "bonus" | "rewards" | "races" | "sports";
const PRIORITIES: { key: Priority; label: string; sub: string }[] = [
  { key: "fast", label: "Fast withdrawals", sub: "Paid out in minutes, not days" },
  { key: "nokyc", label: "No ID checks", sub: "Play without verification" },
  { key: "bonus", label: "A big welcome bonus", sub: "Biggest match, lowest wagering" },
  { key: "rewards", label: "Rakeback & cashback", sub: "Money back on every bet" },
  { key: "races", label: "Races & raffles", sub: "Big recurring prize pools" },
  { key: "sports", label: "Sports & predictions", sub: "A real sportsbook too" },
];

/** Three questions, then the casinos that fit, each with the reasons it scored. */
export function CasinoQuiz({ casinos, countries, coins }: { casinos: QuizCasino[]; countries: { code: string; name: string }[]; coins: { ticker: string; name: string }[] }) {
  const [country, setCountry] = useState("");
  const [coin, setCoin] = useState("");
  const [priority, setPriority] = useState<Priority | "">("");
  const done = !!priority;

  const results = useMemo(() => {
    if (!priority) return [];
    const pool = casinos
      .filter((c) => (country ? !c.restricted.includes(country) : true))
      .filter((c) => (coin ? c.coins.includes(coin) : true));
    const scored = pool.map((c) => {
      const why: string[] = [];
      let score = 0;
      if (country && c.listComplete) { score += 2; why.push(`Accepts players from ${countries.find((x) => x.code === country)?.name}`); }
      if (coin && c.coins.includes(coin)) { score += 2; why.push(`Takes ${coin}`); }
      if (priority === "fast" && c.payoutMins != null) { score += c.payoutMins <= 15 ? 6 : c.payoutMins <= 60 ? 3 : 1; if (c.payoutLabel) why.push(`${c.payoutLabel} withdrawals`); }
      if (priority === "nokyc") { score += c.kyc === "none" ? 6 : c.kyc === "tiered" ? 3 : 0; why.push(c.kyc === "none" ? "No KYC required" : c.kyc === "tiered" ? "KYC only above a threshold" : "KYC required"); }
      if (priority === "bonus") { const w = c.wager; score += w === 0 ? 3 : w == null ? 1 : w <= 30 ? 6 : w <= 40 ? 4 : 2; why.push(`${c.offer}${c.wagerLabel ? ` · ${c.wagerLabel}` : ""}`); }
      if (priority === "rewards") { score += (c.rakeback ? 4 : 0) + (c.cashback ? 3 : 0); if (c.rakeback) why.push("Rakeback on every bet"); if (c.cashback) why.push("Cashback on losses"); }
      if (priority === "races") { score += c.raceMonthly >= 1e6 ? 6 : c.raceMonthly >= 1e5 ? 4 : c.raceMonthly > 0 ? 2 : 0; if (c.raceLabel) why.push(c.raceLabel); }
      if (priority === "sports") { score += (c.sports ? 4 : 0) + (c.predictions ? 3 : 0); if (c.sports) why.push("Sportsbook and esports"); if (c.predictions) why.push("Prediction markets"); }
      if (c.featured) score += 0.5;
      return { c, score, why: why.slice(0, 3) };
    });
    // Fit first, always: the quiz answers decide the order and the house order is
    // only ever the tie-break between two casinos that scored identically.
    return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score || byHouseOn((r: typeof a) => r.c)(a, b)).slice(0, 5);
  }, [casinos, country, coin, priority, countries]);

  return (
    <div>
      <Step n={1} title="Where do you play from?" note="So we only show casinos whose own terms accept you.">
        <select value={country} onChange={(e) => setCountry(e.target.value)} style={select}>
          <option value="">Somewhere else / prefer not to say</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </Step>

      <Step n={2} title="Which coin do you want to use?" note="Optional. We'll only show casinos that take it.">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Chip on={coin === ""} onClick={() => setCoin("")}>Any coin</Chip>
          {coins.map((c) => (
            <Chip key={c.ticker} on={coin === c.ticker} onClick={() => setCoin(c.ticker)}>{c.ticker}</Chip>
          ))}
        </div>
      </Step>

      <Step n={3} title="What matters most to you?" note="Pick the one thing you'd choose a casino for.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10 }}>
          {PRIORITIES.map((p) => (
            <button key={p.key} type="button" onClick={() => setPriority(p.key)} style={{ textAlign: "left", padding: "14px 16px", borderRadius: 14, cursor: "pointer", border: `1px solid ${priority === p.key ? "rgba(0,194,204,.55)" : "rgba(255,255,255,.1)"}`, background: priority === p.key ? "rgba(0,194,204,.12)" : "#0C1013" }}>
              <span style={{ display: "block", fontSize: 15, fontWeight: 800, color: priority === p.key ? "#5FE3E8" : "#fff" }}>{p.label}</span>
              <span style={{ display: "block", marginTop: 3, fontSize: 12.5, color: "#8DA0AA" }}>{p.sub}</span>
            </button>
          ))}
        </div>
      </Step>

      {done && (
        <div style={{ marginTop: 28 }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>{results.length ? "Your matches" : "No match on those answers"}</h2>
          <p style={{ margin: "0 0 16px", fontSize: 14, color: "#8DA0AA" }}>
            {results.length ? "Ranked on your answers, from each casino's own published terms." : "Try a different coin, or leave the coin as Any."}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {results.map(({ c, why }, i) => (
              <div key={c.slug} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 16, alignItems: "center", padding: "16px 18px", borderRadius: 16, background: i === 0 ? "radial-gradient(120% 120% at 0% 0%, rgba(47,182,122,.12), transparent 60%), #0C1013" : "#0C1013", border: `1px solid ${i === 0 ? "rgba(47,182,122,.4)" : "rgba(255,255,255,.08)"}` }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    {c.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.logo} alt="" width={28} height={28} style={{ borderRadius: 8 }} />
                    ) : (
                      <span style={{ width: 28, height: 28, borderRadius: 8, background: "#2A3439" }} />
                    )}
                    <Link href={`/casinos/${c.slug}`} style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>{c.name}</Link>
                    {i === 0 && <span style={{ padding: "2px 8px", borderRadius: 100, background: "rgba(47,182,122,.16)", fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: ".06em", color: "#7BE0B8" }}>BEST MATCH</span>}
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: "#E8EDF0", marginBottom: 4 }}>{c.offer}</div>
                  <div style={{ fontSize: 12.5, color: "#8DA0AA" }}>{why.join(" · ")}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <a href={c.url} target="_blank" rel={c.affiliate ? "nofollow sponsored noopener" : "nofollow noopener"} style={{ padding: "11px 18px", borderRadius: 10, background: "#00C2CC", color: "#0A0D0F", fontSize: 13.5, fontWeight: 800, whiteSpace: "nowrap" }}>
                    Claim offer →
                  </a>
                  {c.code && <span style={{ fontFamily: MONO, fontSize: 10.5, color: "#8DA0AA" }}>code {c.code.toUpperCase()}</span>}
                </div>
              </div>
            ))}
          </div>
          <p style={{ margin: "16px 0 0", fontSize: 12, color: "#8E9CA5" }}>18+ · T&amp;Cs apply · Some links are affiliate links · Matches come from each casino&apos;s own published terms, not from what they pay us.</p>
        </div>
      )}
    </div>
  );
}

const select = { width: "100%", maxWidth: 420, padding: "12px 14px", borderRadius: 11, border: "1px solid rgba(255,255,255,.14)", background: "#080B0D", color: "#fff", fontSize: 15 } as const;

function Step({ n, title, note, children }: { n: number; title: string; note: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "20px 22px", borderRadius: 18, background: "#0B0F12", border: "1px solid rgba(255,255,255,.07)", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
        <span style={{ fontFamily: MONO, fontSize: 11, color: "#00C2CC" }}>0{n}</span>
        <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#fff" }}>{title}</h2>
      </div>
      <p style={{ margin: "0 0 14px", paddingLeft: 26, fontSize: 13, color: "#8DA0AA" }}>{note}</p>
      <div style={{ paddingLeft: 26 }}>{children}</div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} style={{ padding: "8px 14px", borderRadius: 100, cursor: "pointer", border: `1px solid ${on ? "rgba(0,194,204,.5)" : "rgba(255,255,255,.12)"}`, background: on ? "rgba(0,194,204,.14)" : "transparent", color: on ? "#5FE3E8" : "#A8B6BE", fontSize: 13, fontWeight: 700 }}>
      {children}
    </button>
  );
}
