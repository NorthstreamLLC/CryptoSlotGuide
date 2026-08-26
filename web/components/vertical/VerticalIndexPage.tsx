"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { VerticalKind, VerticalRow } from "@/lib/vertical-view";
import { getVerticalPage } from "@/lib/vertical-view";

/**
 * Ported from the `isVertical` block in CryptoSlotGuide.dc.html (search
 * for `<!-- ═══ VERTICAL INDEX`). Powers /slots, /providers,
 * /sportsbooks, /wallets, /exchanges, /guides — "one component, six
 * data sources" per design/README.md's build order.
 */
export function VerticalIndexPage({ kind, tabIdx = 0 }: { kind: VerticalKind; tabIdx?: number }) {
  const router = useRouter();
  const vp = getVerticalPage(kind, tabIdx);
  const hasScore = vp.scoreLabel !== "";

  return (
    <main>
      <section
        style={{
          borderBottom: "1px solid rgba(255,255,255,.07)",
          background: "radial-gradient(110% 100% at 82% 0%, rgba(0,194,204,.08), transparent 58%), #090C0F",
        }}
      >
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "52px 40px 44px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#4E5A62", marginBottom: 22 }}>
            <Link href="/" style={{ color: "#5C6A72" }}>Index</Link>
            <span>/</span>
            <span style={{ color: "#00C2CC" }}>{vp.kicker}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.35fr .65fr", gap: 56, alignItems: "end" }}>
            <div>
              <h1 style={{ margin: "0 0 16px", fontSize: 52, lineHeight: 1.02, letterSpacing: "-.038em", fontWeight: 800, fontStretch: "116%", color: "#fff", textWrap: "balance" }}>
                {vp.title}
              </h1>
              <p style={{ margin: 0, maxWidth: "62ch", fontSize: 16.5, lineHeight: 1.65, color: "#93A3AC", textWrap: "pretty" }}>{vp.sub}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)" }}>
              {vp.stats.map(([value, label]) => (
                <div key={label} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, padding: "13px 16px", background: "#0C1013" }}>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#5C6A72" }}>{label}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 17, fontWeight: 500, color: "#fff" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "34px 40px 20px" }}>
        {vp.tabs && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {vp.tabs.map((t, i) => {
              const active = i === tabIdx;
              return (
                <Link
                  key={t}
                  href={vertHref(kind, i)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 100,
                    border: `1px solid ${active ? "rgba(0,194,204,.45)" : "rgba(255,255,255,.12)"}`,
                    background: active ? "rgba(0,194,204,.12)" : "transparent",
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 11,
                    letterSpacing: ".05em",
                    textTransform: "uppercase",
                    color: active ? "#5FE3E8" : "#A8B6BE",
                  }}
                >
                  {t}
                </Link>
              );
            })}
          </div>
        )}

        <div role="table" style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflowX: "auto", background: "#0C1013", boxShadow: "0 12px 40px rgba(0,0,0,.35)" }}>
          <div
            role="row"
            style={{
              display: "grid",
              minWidth: 1020,
              gridTemplateColumns: `54px minmax(300px,1.5fr) 150px 140px 160px ${hasScore ? "84px" : "0px"} 132px`,
              background: "#101519",
              borderBottom: "1px solid rgba(255,255,255,.07)",
            }}
          >
            <HeadCell muted>#</HeadCell>
            <HeadCell muted>{vp.kicker}</HeadCell>
            <HeadCell>{vp.cols[0]}</HeadCell>
            <HeadCell>{vp.cols[1]}</HeadCell>
            <HeadCell>{vp.cols[2]}</HeadCell>
            {hasScore && <HeadCell muted>{vp.scoreLabel}</HeadCell>}
            <div role="columnheader" style={{ padding: "14px 16px" }} />
          </div>

          {vp.rows.map((r, i) => (
            <VerticalRowView key={r.slug} r={r} pos={i + 1} hasScore={hasScore} onNavigate={() => router.push(r.href)} />
          ))}

          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#4E5A62", whiteSpace: "nowrap" }}>
            <span>{vp.rows.length} entries</span>
            <span>·</span>
            <span>test log updated 24 Aug 2026</span>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "8px 40px 84px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr .6fr", gap: 14 }}>
          <div style={{ padding: "28px 32px", borderRadius: 14, background: "linear-gradient(150deg,#0E1417,#0A0E10)", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 12 }}>
              What this table won&apos;t tell you
            </div>
            <p style={{ margin: 0, maxWidth: "76ch", fontSize: 15, lineHeight: 1.7, color: "#93A3AC", textWrap: "pretty" }}>{vp.note}</p>
          </div>
          <Link
            href="/how-we-rate"
            style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 20, padding: "28px 32px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-.015em" }}>Full scoring sheet</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".05em", color: "#00C2CC" }}>Six criteria, published weights →</div>
          </Link>
        </div>
      </section>
    </main>
  );
}

function vertHref(kind: VerticalKind, tab: number): string {
  if (kind !== "sportsbooks") return `/${kind}`;
  // Note: /casino-sportsbooks and /esports-casinos are reserved for the
  // casino-index filtered views (see lib/casino-index.ts) — a different
  // page from this vertical's Sports/Esports market-list tabs, so those
  // tabs live under a query param on /sportsbooks instead of their own URL.
  return tab === 0 ? "/sportsbooks" : `/sportsbooks?tab=${tab}`;
}

function HeadCell({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <div
      role="columnheader"
      style={{
        padding: "14px 16px",
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: 10.5,
        letterSpacing: ".07em",
        textTransform: "uppercase",
        color: muted ? "#5C6A72" : "#8DA0AA",
      }}
    >
      {children}
    </div>
  );
}

function VerticalRowView({ r, pos, hasScore, onNavigate }: { r: VerticalRow; pos: number; hasScore: boolean; onNavigate: () => void }) {
  return (
    <div
      role="row"
      onClick={onNavigate}
      style={{
        display: "grid",
        minWidth: 1020,
        gridTemplateColumns: `54px minmax(300px,1.5fr) 150px 140px 160px ${hasScore ? "84px" : "0px"} 132px`,
        alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,.05)",
        cursor: "pointer",
      }}
      className="hover:!bg-white/[0.028]"
    >
      <div role="cell" style={{ padding: 16, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 13, color: "#5C6A72" }}>
        {String(pos).padStart(2, "0")}
      </div>
      <div role="cell" style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        {r.hasLogo && r.logo ? (
          <div style={{ width: 56, height: 30, flex: "none", display: "flex", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.logo} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          </div>
        ) : (
          <span
            style={{
              width: 30,
              height: 30,
              flex: "none",
              borderRadius: 7,
              background: r.tint,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 9,
              fontWeight: 700,
              color: "#0A0D0F",
            }}
          >
            {r.mono}
          </span>
        )}
        <div style={{ minWidth: 0 }}>
          <Link
            href={r.href}
            onClick={(e) => e.stopPropagation()}
            className="hover:!text-accent"
            style={{ display: "block", fontSize: 14.5, fontWeight: 600, color: "#E8EDF0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {r.name}
          </Link>
          <div style={{ fontSize: 12, color: "#6E7F88", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>{r.note}</div>
        </div>
      </div>
      <Cell>{r.m1}</Cell>
      <Cell>{r.m2}</Cell>
      <Cell>{r.m3}</Cell>
      {hasScore && (
        <div role="cell" style={{ padding: 16, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 15, fontWeight: 500, color: r.score === "—" ? "#4E5A62" : "#fff" }}>
          {r.score}
        </div>
      )}
      <div role="cell" style={{ padding: "12px 16px" }}>
        <Link
          href={r.href}
          onClick={(e) => e.stopPropagation()}
          className="hover:!border-accent hover:!text-[#5FE3E8]"
          style={{ display: "block", textAlign: "center", padding: 9, borderRadius: 7, border: "1px solid rgba(255,255,255,.16)", color: "#DCE5E9", fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap" }}
        >
          {r.cta}
        </Link>
      </div>
    </div>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <div role="cell" style={{ padding: 16, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: "#B7C4CB", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
      {children}
    </div>
  );
}
