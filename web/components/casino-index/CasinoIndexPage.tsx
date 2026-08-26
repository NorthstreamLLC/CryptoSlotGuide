"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { siteData } from "@/lib/site-data";
import { fill } from "@/lib/derived";
import {
  btcStats,
  btcViews,
  filterFns,
  kycStyle,
  logoFor,
  sortOps,
  type BtcFilterKey,
  type SortDir,
  type SortKey,
} from "@/lib/casino-index";
import type { Operator } from "@/lib/types";

const btcFaqData = [
  { q: "How many confirmations before I can play?", a: "Most operators here credit at one confirmation, which is roughly ten minutes. Three-confirmation sites can leave you waiting half an hour on a busy block." },
  { q: "Should I use Lightning?", a: "If the operator supports it and your amount is small, yes — it settles in seconds and avoids on-chain fees entirely. Above about 0.05 BTC channel capacity starts to be the limiting factor." },
  { q: "Who pays the network fee?", a: "{fee} of the {casinos} operators absorb it. The rest deduct it from your withdrawal, which matters most on small, frequent cash-outs." },
  { q: "Is a Bitcoin-only casino safer?", a: "No. Coin support tells you nothing about licensing, segregation of player funds, or whether the operator honours its own terms. Judge those separately." },
];

export function CasinoIndexPage({ filter }: { filter: BtcFilterKey }) {
  const { ops, coinsBy, coinDefs } = siteData;
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [coinSel, setCoinSel] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const view = btcViews[filter];
  const btcFn = filterFns[filter];
  const coinOk = (o: Operator) => coinSel === "all" || (coinsBy[o.slug] ?? []).map(String).includes(coinSel);

  const roobet = ops.find((o) => o.hasCustomReview);
  const spotlight = !!roobet && btcFn(roobet);

  const filtered = useMemo(
    () => ops.filter((o) => btcFn(o) && coinOk(o) && !(spotlight && o.hasCustomReview)),
    [ops, filter, coinSel, spotlight]
  );
  const sorted = sortOps(filtered, sortKey, sortDir);
  const stats = btcStats(ops.filter((o) => btcFn(o) && coinOk(o)));
  // The plain (non-spotlight) hero promotes row 0 into the "Top of this
  // list" card, so the table below excludes it — same list, same current
  // sort, just sliced — rather than showing it twice.
  const btcTop = spotlight ? null : sorted[0];
  const tableAll = spotlight ? sorted : sorted.slice(1);
  const posOffset = spotlight ? 0 : 1;
  const rows = showAll ? tableAll : tableAll.slice(0, 20);

  const coinFilters = [{ t: "all", label: "All coins" }, ...coinDefs.map((c) => ({ t: c.ticker, label: c.ticker }))].map((c) => ({
    ...c,
    count: c.t === "all" ? ops.length : ops.filter((o) => (coinsBy[o.slug] ?? []).map(String).includes(c.t)).length,
  }));

  function toggleSort(key: SortKey) {
    setSortDir((d) => (sortKey === key && d === "asc" ? "desc" : "asc"));
    setSortKey(key);
  }
  function arrow(key: SortKey) {
    return sortKey !== key ? "" : sortDir === "asc" ? "↓" : "↑";
  }

  return (
    <main style={{ background: "#07090B", color: "#E8EDF0" }}>
      <section style={{ position: "relative", overflow: "hidden", background: "radial-gradient(120% 100% at 78% 0%, rgba(0,194,204,.09), transparent 58%),#0B0F12", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "26px 40px 72px" }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#5C6A72", marginBottom: 34 }}>
            <Link href="/" style={{ color: "#5C6A72" }}>Home</Link> / <Link href="/crypto-casinos" style={{ color: "#5C6A72" }}>Casinos</Link> /{" "}
            <span style={{ color: "#A8B6BE" }}>{view.crumb}</span>
          </div>

          {spotlight && roobet ? (
            <div style={{ display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 64, alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {(coinsBy["roobet"] ?? []).map((t) => (
                      <span key={t} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, marginRight: -9, flex: "none", borderRadius: "50%", background: coinDefs.find((c) => c.ticker === t)?.tint, border: "2px solid #090C0F", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 8.5, fontWeight: 700, color: "#0A0D0F" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC" }}>
                    {filtered.length + 1} {view.kicker}
                  </span>
                </div>
                <h1 style={{ margin: "0 0 20px", fontSize: 54, lineHeight: 1.02, letterSpacing: "-.038em", fontWeight: 800, fontStretch: "116%", color: "#fff", textWrap: "balance" }}>{view.h1}</h1>
                <p style={{ margin: "0 0 30px", maxWidth: 560, fontSize: 17, lineHeight: 1.62, color: "#93A3AC", textWrap: "pretty" }}>{view.p}</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
                  <Link href={`/casinos/${roobet.slug}`} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 24px", borderRadius: 9, background: "#00C2CC", color: "#04191B", fontSize: 14.5, fontWeight: 700, boxShadow: "0 8px 26px rgba(0,194,204,.24)", whiteSpace: "nowrap" }}>
                    Visit Roobet — {roobet.score.toFixed(1)}, our top score <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 13 }}>→</span>
                  </Link>
                  <Link href="/casinos/roobet" style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "15px 24px", borderRadius: 9, border: "1px solid rgba(255,255,255,.16)", color: "#DCE5E9", fontSize: 14.5, fontWeight: 600, whiteSpace: "nowrap" }}>
                    Read the review
                  </Link>
                </div>
              </div>
              <div style={{ position: "relative", padding: 26, borderRadius: 16, background: "linear-gradient(168deg,#141A1E,#0E1215)", border: "1px solid rgba(255,204,0,.22)", boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/roobet-logo.png" alt="Roobet" style={{ height: 30, width: "auto", display: "block" }} />
                  <span style={{ padding: "5px 10px", borderRadius: 5, background: "rgba(255,204,0,.12)", border: "1px solid rgba(255,204,0,.3)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", color: "#FFCC00", whiteSpace: "nowrap" }}>
                    #1 OVERALL
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 22 }}>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 52, fontWeight: 700, lineHeight: 0.9, color: "#fff", letterSpacing: "-.04em" }}>{roobet.score.toFixed(1)}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, color: "#5C6A72", paddingBottom: 7 }}>/ 10 · tested 21 Aug 2026</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(255,255,255,.07)", borderRadius: 10, overflow: "hidden", marginBottom: 22 }}>
                  <StatTile label="Median payout" value={roobet.payoutLabel} />
                  <StatTile label="Confirmations" value={String(roobet.conf)} />
                  <StatTile label="Lightning" value={roobet.ln ? "Yes" : "No"} color={roobet.ln ? "#5FE3E8" : undefined} />
                  <StatTile label="Bonus wagering" value={`${roobet.wager}×`} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".07em", textTransform: "uppercase", color: "#5C6A72", marginBottom: 9 }}>Coins credited</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {(coinsBy["roobet"] ?? []).map((t) => (
                      <span key={t} style={{ padding: "4px 8px", borderRadius: 5, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.10)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".04em", color: coinDefs.find((c) => c.ticker === t)?.tint }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Link href={`/casinos/${roobet.slug}`} style={{ flex: 1, textAlign: "center", padding: 13, borderRadius: 8, background: "#FFCC00", color: "#1A1400", fontSize: 13.5, fontWeight: 700 }}>Visit Roobet</Link>
                  <Link href="/casinos/roobet" style={{ padding: "13px 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,.14)", color: "#DCE5E9", fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap" }}>Full review</Link>
                </div>
                <div style={{ marginTop: 14, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, color: "#4E5A62" }}>Affiliate link · 18+ · T&amp;Cs apply</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 56, alignItems: "end" }}>
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 20 }}>
                  {filtered.length} {view.kicker}
                </div>
                <h1 style={{ margin: "0 0 20px", fontSize: 50, lineHeight: 1.02, letterSpacing: "-.038em", fontWeight: 800, fontStretch: "116%", color: "#fff", textWrap: "balance" }}>{view.h1}</h1>
                <p style={{ margin: 0, maxWidth: "64ch", fontSize: 16.5, lineHeight: 1.62, color: "#93A3AC", textWrap: "pretty" }}>{view.p}</p>
              </div>
              {btcTop && (
                <Link href={`/casinos/${btcTop.slug}`} style={{ display: "block", padding: 24, borderRadius: 15, background: "linear-gradient(168deg,#141A1E,#0E1215)", border: "1px solid rgba(255,255,255,.10)", boxShadow: "0 18px 50px rgba(0,0,0,.45)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 18 }}>
                    <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#5C6A72" }}>Top of this list</span>
                    <span style={{ padding: "4px 9px", borderRadius: 5, background: "rgba(0,194,204,.12)", border: "1px solid rgba(0,194,204,.3)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".05em", color: "#5FE3E8" }}>#1</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 20 }}>
                    <div style={{ width: 56, height: 38, flex: "none", display: "flex", alignItems: "center" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoFor(btcTop.slug)} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.025em", color: "#fff" }}>{btcTop.name}</span>
                    <span style={{ marginLeft: "auto", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 26, color: "#fff" }}>{btcTop.score.toFixed(1)}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.08)" }}>
                    <TopRow label="Median payout" value={btcTop.payoutLabel} />
                    <TopRow label="Licence · KYC" value={`${btcTop.licence} · ${btcTop.kyc}`} />
                    <TopRow label="Offer" value={btcTop.bonus} />
                  </div>
                </Link>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginTop: 34, paddingTop: 26, borderTop: "1px solid rgba(255,255,255,.07)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, color: "#5C6A72" }}>
            {stats.map((s) => (
              <span key={s.l}><strong style={{ color: "#DCE5E9", fontWeight: 500 }}>{s.v}</strong> {s.l}</span>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 24 }}>
            {(["all", "nokyc", "fast", "lowwager", "sports", "esports"] as BtcFilterKey[]).map((k) => {
              const active = k === filter;
              const href = k === "all" ? "/crypto-casinos" : k === "nokyc" ? "/crypto-casinos/no-kyc" : k === "fast" ? "/fastest-payouts" : k === "lowwager" ? "/lowest-wagering" : k === "sports" ? "/casino-sportsbooks" : "/esports-casinos";
              return (
                <Link
                  key={k}
                  href={href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 15px",
                    borderRadius: 100,
                    border: `1px solid ${active ? "rgba(0,194,204,.5)" : "rgba(255,255,255,.12)"}`,
                    background: active ? "rgba(0,194,204,.12)" : "rgba(255,255,255,.03)",
                    fontSize: 13,
                    fontWeight: 600,
                    color: active ? "#5FE3E8" : "#A8B6BE",
                  }}
                >
                  {btcViews[k].crumb}
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, color: "#5C6A72" }}>{ops.filter(filterFns[k]).length}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "44px 40px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, marginBottom: 16, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: "0 0 6px", fontSize: 24, letterSpacing: "-.025em", fontWeight: 800, fontStretch: "112%", color: "#E8EDF0" }}>The rest of the field</h2>
            <p style={{ margin: 0, fontSize: 13.5, color: "#93A3AC" }}>
              {view.note}
              {coinSel === "all" ? "every coin we track" : coinSel}.
            </p>
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            {(["score", "payout", "name"] as SortKey[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => toggleSort(k)}
                className="hover:!border-accent hover:!text-accent"
                style={{ padding: "9px 13px", borderRadius: 7, border: "1px solid rgba(255,255,255,.14)", background: "rgba(12,16,19,.66)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".04em", textTransform: "uppercase", color: "#93A3AC", whiteSpace: "nowrap" }}
              >
                {k === "name" ? "A–Z" : k} {arrow(k)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 16 }}>
          {coinFilters.map((c) => {
            const active = coinSel === c.t;
            return (
              <button
                key={c.t}
                type="button"
                onClick={() => setCoinSel(c.t)}
                style={{
                  padding: "8px 13px",
                  borderRadius: 100,
                  border: `1px solid ${active ? "rgba(0,194,204,.45)" : "rgba(255,255,255,.14)"}`,
                  background: active ? "rgba(0,194,204,.12)" : "rgba(255,255,255,.02)",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 11,
                  letterSpacing: ".04em",
                  color: active ? "#5FE3E8" : "#A8B6BE",
                  whiteSpace: "nowrap",
                }}
              >
                {c.label} <span style={{ opacity: 0.5 }}>{c.count}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
          {rows.map((o, i) => (
            <OpRow key={o.slug} o={o} pos={i + 1 + posOffset} coins={coinsBy[o.slug] ?? []} />
          ))}
        </div>

        {!showAll && tableAll.length > 20 && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="hover:!border-accent hover:!text-accent"
            style={{ width: "100%", marginTop: 12, padding: 15, borderRadius: 12, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.03)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, letterSpacing: ".05em", color: "#A8B6BE", cursor: "pointer" }}
          >
            Show all {tableAll.length + posOffset} casinos →
          </button>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 44 }}>
          <div style={{ padding: 26, borderRadius: 13, background: "rgba(12,16,19,.66)", border: "1px solid rgba(255,255,255,.07)" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 19, letterSpacing: "-.02em", fontWeight: 700, color: "#E8EDF0" }}>Why crypto withdrawal times differ so much</h3>
            <p style={{ margin: "0 0 14px", fontSize: 14.5, lineHeight: 1.65, color: "#93A3AC", textWrap: "pretty" }}>
              Almost none of the variance is the chain. It&apos;s the operator&apos;s internal batching interval and whether a withdrawal trips a manual review. Sites that batch every few minutes and auto-approve under a threshold clear in single-digit minutes; sites that batch hourly and review everything over $500 take an hour or more.
            </p>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: "#93A3AC", textWrap: "pretty" }}>
              We time from confirmed request to first on-chain broadcast, so network congestion is excluded and the number reflects what the operator controls.
            </p>
          </div>
          <div style={{ padding: 26, borderRadius: 13, background: "rgba(12,16,19,.66)", border: "1px solid rgba(255,255,255,.07)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 19, letterSpacing: "-.02em", fontWeight: 700, color: "#E8EDF0" }}>Crypto payments FAQ</h3>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {btcFaqData.map((f, i) => (
                <div key={f.q} style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}>
                  <button
                    type="button"
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 0", border: 0, background: "transparent", textAlign: "left", fontSize: 14.5, fontWeight: 600, color: "#E8EDF0" }}
                  >
                    <span style={{ flex: 1 }}>{f.q}</span>
                    <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", color: "#00C2CC" }}>{faqOpen === i ? "−" : "+"}</span>
                  </button>
                  {faqOpen === i && (
                    <div style={{ padding: "0 0 14px", fontSize: 14, lineHeight: 1.65, color: "#93A3AC" }}>{fill(f.a, siteData)}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatTile({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ padding: "14px 16px", background: "#0F1417" }}>
      <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#5C6A72", marginBottom: 5 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 19, fontWeight: 500, color: color ?? "#fff" }}>{value}</div>
    </div>
  );
}

function TopRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
      <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, letterSpacing: ".07em", textTransform: "uppercase", color: "#4E5A62" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: "#DCE5E9", textAlign: "right" }}>{value}</span>
    </div>
  );
}

function OpRow({ o, pos, coins }: { o: Operator; pos: number; coins: string[] }) {
  const { kycBg, kycColor } = kycStyle(o.kyc);
  const shown = coins.slice(0, 3);
  const more = Math.max(0, coins.length - 3);
  return (
    <div
      style={{
        display: "grid",
        minWidth: 920,
        gridTemplateColumns: "44px minmax(150px,1fr) 74px 100px 186px 72px minmax(140px,1fr) 128px",
        alignItems: "center",
        padding: "0 8px 0 0",
        borderRadius: 12,
        background: o.hasCustomReview ? "rgba(255,204,0,.045)" : "rgba(12,16,19,.66)",
        border: "1px solid rgba(255,255,255,.07)",
        boxShadow: "0 1px 2px rgba(0,0,0,.3)",
      }}
      className="hover:!border-white/20"
    >
      <div style={{ padding: 16, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 13, color: "#5C6A72" }}>{String(pos).padStart(2, "0")}</div>
      <div style={{ padding: "14px 12px 14px 0", display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <div style={{ width: 58, height: 26, flex: "none", display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoFor(o.slug)} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        </div>
        <Link href={o.hasCustomReview ? "/casinos/roobet" : `/casinos/${o.slug}`} className="hover:!text-accent" style={{ fontSize: 14.5, fontWeight: 600, color: "#E8EDF0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {o.name}
        </Link>
      </div>
      <div style={{ padding: "14px 8px" }}>
        <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 15, fontWeight: 500, color: o.hasCustomReview ? "#FFCC00" : "#fff" }}>{o.score.toFixed(1)}</span>
      </div>
      <div style={{ padding: "14px 8px" }}>
        <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: "#B7C4CB" }}>{o.payoutLabel}</div>
        <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, color: "#5C6A72", marginTop: 2 }}>median</div>
      </div>
      <div style={{ padding: "14px 8px", minWidth: 0 }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "nowrap", overflow: "hidden" }}>
          {shown.map((t) => (
            <span key={t} style={{ flex: "none", padding: "3px 6px", borderRadius: 4, background: "rgba(255,255,255,.05)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, letterSpacing: ".03em", color: "#B7C4CB" }}>
              {t}
            </span>
          ))}
          {more > 0 && <span style={{ flex: "none", padding: "3px 6px", borderRadius: 4, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, color: "#5C6A72" }}>+{more}</span>}
        </div>
        <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, color: "#5C6A72", marginTop: 4 }}>{coins.length} coins · {o.conf} confirms</div>
      </div>
      <div style={{ padding: "14px 8px" }}>
        <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, padding: "3px 7px", borderRadius: 4, background: o.ln ? "rgba(0,194,204,.12)" : "rgba(255,255,255,.05)", color: o.ln ? "#5FE3E8" : "#8DA0AA" }}>
          {o.ln ? "Yes" : "No"}
        </span>
      </div>
      <div style={{ padding: "14px 8px", minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: "#B7C4CB", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.bonus}</div>
        <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, color: "#5C6A72", marginTop: 2 }}>
          {o.wager}× wagering · KYC <span style={{ color: kycColor, background: kycBg, padding: "0 4px", borderRadius: 3 }}>{o.kyc}</span>
        </div>
      </div>
      <div style={{ padding: "10px 8px" }}>
        <Link
          href={o.hasCustomReview ? "/casinos/roobet" : `/casinos/${o.slug}`}
          className="hover:!border-accent hover:!text-accent"
          style={{
            display: "block",
            textAlign: "center",
            padding: 11,
            borderRadius: 7,
            border: `1px solid ${o.hasCustomReview ? "#FFCC00" : "rgba(255,255,255,.16)"}`,
            background: o.hasCustomReview ? "#FFCC00" : "transparent",
            color: o.hasCustomReview ? "#1A1400" : "#E8EDF0",
            fontSize: 12.5,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {o.hasCustomReview ? "Visit Roobet" : "Visit site"}
        </Link>
      </div>
    </div>
  );
}
