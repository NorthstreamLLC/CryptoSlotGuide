"use client";

import Link from "next/link";
import { useState } from "react";
import { siteData } from "@/lib/site-data";
import { getWatchRows, watchStats } from "@/lib/rtp-watch-view";

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
  const rows = onlyCut ? allRows.filter((r) => r.cut) : allRows;

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
                The same slot can pay 96.5% at one casino and 94.5% at the next, and nothing in the lobby tells you which you loaded. We read the paytable inside each operator&apos;s own client as our field-testing covers them, and publish the number, per build, with the date we last checked it — cells we haven&apos;t reached yet are marked, not guessed at.
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
          <span style={{ marginLeft: "auto", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, color: "#4E5A62" }}>Figures read in-client · orange = reduced build · — = not yet checked</span>
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

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr .6fr", gap: 14, marginTop: 24 }}>
          <div style={{ padding: "28px 32px", borderRadius: 14, background: "linear-gradient(150deg,#0E1417,#0A0E10)", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#DA9877", marginBottom: 12 }}>
              How this board is maintained
            </div>
            <p style={{ margin: "0 0 12px", maxWidth: "80ch", fontSize: 15, lineHeight: 1.7, color: "#93A3AC", textWrap: "pretty" }}>
              Every filled cell is a figure someone read inside that operator&apos;s client, with the date attached — an em dash means we haven&apos;t reached that operator yet, not that the build is clean. There is no feed to subscribe to — studios do not publish per-operator configurations, and operators do not advertise a reduced one. Which is exactly why the board is worth keeping.
            </p>
            <p style={{ margin: 0, maxWidth: "80ch", fontSize: 15, lineHeight: 1.7, color: "#93A3AC", textWrap: "pretty" }}>
              Re-checks run on a rolling schedule and immediately on any reader report we can reproduce. A cell older than 30 days gets re-read before it stays on the board.
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
