"use client";

import Link from "next/link";
import { useState } from "react";
import { siteData } from "@/lib/site-data";
import { getWatchRows, watchStats, getHouseEdgeRows } from "@/lib/rtp-watch-view";

/**
 * Ported from the `isWatch` block in CryptoSlotGuide.dc.html (search for
 * `RTP WATCH`). The site's differentiator per design/README.md — do this
 * one early, it says, and it shapes the slot models. See
 * lib/rtp-watch-view.ts for how our real per-cell schema feeds this.
 */
export function RtpWatchPage() {
  const [onlyCut, setOnlyCut] = useState(false);
  const { watchOps } = siteData;
  const allRows = getWatchRows();
  const stats = watchStats(allRows);
  const readCells = allRows.reduce((n, r) => n + r.cells.filter((c) => c.checked).length, 0);
  const rows = onlyCut ? allRows.filter((r) => r.cut) : allRows;
  const { cols: houseCols, rows: houseRows } = getHouseEdgeRows();

  return (
    <main>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(110% 100% at 80% 0%, rgba(196,101,58,.10), transparent 58%), #090C0F" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "48px 40px 40px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr .7fr", gap: 56, alignItems: "end" }}>
            <div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#DA9877", marginBottom: 16 }}>
                RTP Watch · live board
              </div>
              <h1 style={{ margin: "0 0 14px", fontSize: 50, lineHeight: 1.02, letterSpacing: "-.038em", fontWeight: 800, fontStretch: "116%", color: "#fff", textWrap: "balance" }}>
                Which casinos ship a cut build
              </h1>
              <p style={{ margin: 0, maxWidth: "66ch", fontSize: 16.5, lineHeight: 1.65, color: "#93A3AC", textWrap: "pretty" }}>
                The same slot can pay 96.5% at one casino and 94.5% at the next, and nothing in the lobby tells you which you loaded. RTP Watch records the return stated in the paytable inside each operator&apos;s own client, per build, with the date it was read.{" "}
                {readCells === 0
                  ? "The board is just starting: no readings are in yet, so every cell is marked as not checked rather than filled with a guess."
                  : `${readCells} cells have a reading so far; the rest are marked as not checked rather than filled with a guess.`}
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)" }}>
              {stats.map((s) => (
                <div key={s.label} style={{ padding: "16px 18px", background: "#0C1013" }}>
                  <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 22, fontWeight: 500, color: "#fff", letterSpacing: "-.02em", marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", color: "#5C6A72" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "30px 40px 84px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <button
            type="button"
            onClick={() => setOnlyCut(false)}
            style={{ padding: "9px 15px", borderRadius: 100, border: "1px solid rgba(255,255,255,.14)", background: !onlyCut ? "rgba(0,194,204,.12)" : "transparent", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase", color: !onlyCut ? "#5FE3E8" : "#A8B6BE" }}
          >
            All tracked titles
          </button>
          <button
            type="button"
            onClick={() => setOnlyCut(true)}
            style={{ padding: "9px 15px", borderRadius: 100, border: "1px solid rgba(255,255,255,.14)", background: onlyCut ? "rgba(196,101,58,.14)" : "transparent", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase", color: onlyCut ? "#DA9877" : "#A8B6BE" }}
          >
            Cut somewhere
          </button>
          <span style={{ marginLeft: "auto", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, color: "#4E5A62" }}>Filled cells read in-client · orange = reduced build · — = no reading</span>
        </div>

        <div role="table" style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflowX: "auto", background: "#0C1013", boxShadow: "0 12px 40px rgba(0,0,0,.35)" }}>
          <div role="row" style={{ display: "grid", minWidth: 1180, gridTemplateColumns: `minmax(240px,1.4fr) 96px repeat(${watchOps.length},1fr) 92px`, background: "#101519", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
            <HeadCell>Title</HeadCell>
            <HeadCell muted={false}>Best</HeadCell>
            {watchOps.map((o) => (
              <div key={o.slug} role="columnheader" style={{ padding: "14px 10px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".05em", textTransform: "uppercase", color: "#8DA0AA", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {o.name}
              </div>
            ))}
            <HeadCell>Clean</HeadCell>
          </div>

          {rows.map((r) => (
            <div
              key={r.slug}
              role="row"
              style={{ display: "grid", minWidth: 1180, gridTemplateColumns: `minmax(240px,1.4fr) 96px repeat(${watchOps.length},1fr) 92px`, alignItems: "center", borderBottom: "1px solid rgba(255,255,255,.05)" }}
              className="hover:!bg-white/[0.028]"
            >
              <div role="cell" style={{ padding: "13px 18px", minWidth: 0 }}>
                <Link href={`/slots/${r.slug}`} className="hover:!text-accent" style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#E8EDF0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {r.name}
                </Link>
                <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, color: "#5C6A72", marginTop: 3 }}>
                  {r.provider} · seen {r.seen}
                </div>
              </div>
              <div role="cell" style={{ padding: "13px 10px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: "#fff" }}>{r.bestLabel}</div>
              {r.cells.map((c, i) => (
                <div key={i} role="cell" style={{ padding: "13px 10px", background: c.bg, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: c.color, fontWeight: Number(c.weight) }}>
                  {c.label}
                </div>
              ))}
              <div role="cell" style={{ padding: "13px 12px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11.5, color: r.worstColor }}>{r.cleanCount}</div>
            </div>
          ))}
        </div>

        <div style={{ margin: "44px 0 16px" }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#DA9877", marginBottom: 10 }}>House games</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 30, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>House edge on each casino&apos;s originals</h2>
          <p style={{ margin: 0, maxWidth: "70ch", fontSize: 15, lineHeight: 1.6, color: "#93A3AC" }}>
            Dice, Crash, Plinko and the rest are built in-house, so each casino sets its own edge. Lower is better for you. Each figure comes from the casino&apos;s own game page, help centre or blog; a range means its own pages give more than one figure, and + means the edge rises on high-risk settings.
          </p>
        </div>
        <div role="table" style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflowX: "auto", background: "#0C1013" }}>
          <div role="row" style={{ display: "grid", minWidth: 1180, gridTemplateColumns: `minmax(240px,1.4fr) 96px repeat(${houseCols.length},1fr) 92px`, background: "#101519", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
            <HeadCell>Game</HeadCell>
            <HeadCell muted={false}>Range</HeadCell>
            {houseCols.map((o) => (
              <div key={o.slug} role="columnheader" style={{ padding: "14px 10px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".05em", textTransform: "uppercase", color: "#8DA0AA", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {o.name}
              </div>
            ))}
            <span />
          </div>
          {houseRows.map((h) => {
            const known = h.cells.filter((c) => c.edge !== null).map((c) => c.edge as number);
            const best = known.length ? Math.min(...known) : null;
            return (
              <div key={h.slug} role="row" style={{ display: "grid", minWidth: 1180, gridTemplateColumns: `minmax(240px,1.4fr) 96px repeat(${houseCols.length},1fr) 92px`, alignItems: "center", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                <div role="cell" style={{ padding: "13px 18px" }}>
                  <Link href={`/house-games/${h.slug}`} style={{ fontSize: 14, fontWeight: 600, color: "#E8EDF0" }}>{h.name}</Link>
                </div>
                <div role="cell" style={{ padding: "13px 10px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: "#fff" }}>{h.range}</div>
                {h.cells.map((c, i) => (
                  <div key={i} role="cell" style={{ padding: "13px 10px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, fontWeight: c.edge !== null && c.edge === best ? 700 : 400, color: c.edge === null ? "#39454C" : c.edge === best ? "#5FE3E8" : c.edge >= 3 ? "#DA9877" : "#E8EDF0" }}>
                    {c.label}
                  </div>
                ))}
                <span />
              </div>
            );
          })}
          <div role="row" style={{ display: "grid", minWidth: 1180, gridTemplateColumns: `minmax(240px,1.4fr) 96px repeat(${houseCols.length},1fr) 92px`, alignItems: "center", background: "#101519", borderTop: "1px solid rgba(255,255,255,.1)" }}>
            <div role="cell" style={{ padding: "15px 18px", fontSize: 14, fontWeight: 800, color: "#fff" }}>Average edge</div>
            <div role="cell" style={{ padding: "15px 10px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, color: "#5C6A72" }}>games listed</div>
            {houseCols.map((o, i) => {
              const known = houseRows.map((h) => h.cells[i].edge).filter((x): x is number => x !== null);
              const avg = known.length ? known.reduce((a, b) => a + b, 0) / known.length : null;
              return (
                <div key={o.slug} role="cell" style={{ padding: "15px 10px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 13.5, fontWeight: 800, color: avg === null ? "#39454C" : avg < 1 ? "#5FE3E8" : avg >= 2 ? "#DA9877" : "#fff" }}>
                  {avg === null ? "—" : `${avg.toFixed(2)}%`}
                  <div style={{ fontSize: 9.5, fontWeight: 400, color: "#5C6A72", marginTop: 2 }}>{known.length} games</div>
                </div>
              );
            })}
            <span />
          </div>
        </div>
        <div style={{ margin: "10px 0 0", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, color: "#4E5A62" }}>Teal = lowest edge on the board · orange = 3% or more · — = no published figure found · average edge = simple average of the games listed for that casino, using its lowest stated figure</div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr .6fr", gap: 14, marginTop: 24 }}>
          <div style={{ padding: "28px 32px", borderRadius: 14, background: "linear-gradient(150deg,#0E1417,#0A0E10)", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#DA9877", marginBottom: 12 }}>
              How this board is maintained
            </div>
            <p style={{ margin: "0 0 12px", maxWidth: "80ch", fontSize: 15, lineHeight: 1.7, color: "#93A3AC", textWrap: "pretty" }}>
              Every filled cell is a figure someone read inside that operator&apos;s client, with the date attached — an em dash means we haven&apos;t reached that operator yet, not that the build is clean. There is no feed to subscribe to — studios do not publish per-operator configurations, and operators do not advertise a reduced one. Which is exactly why the board is worth keeping.
            </p>
            <p style={{ margin: 0, maxWidth: "80ch", fontSize: 15, lineHeight: 1.7, color: "#93A3AC", textWrap: "pretty" }}>
              Cells fill in as our field-testing reaches each operator. A reading older than 30 days drops back to not checked until it is re-read, so a stale figure never sits on the board, and reader reports of a changed build go to the front of the queue.
            </p>
          </div>
          <Link href="/slots" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 20, padding: "28px 32px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-.015em" }}>Every slot we track</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".05em", color: "#00C2CC" }}>RTP index →</div>
          </Link>
        </div>
      </section>
    </main>
  );
}

function HeadCell({ children, muted = true }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <div role="columnheader" style={{ padding: "14px 18px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".07em", textTransform: "uppercase", color: muted ? "#5C6A72" : "#8DA0AA" }}>
      {children}
    </div>
  );
}
