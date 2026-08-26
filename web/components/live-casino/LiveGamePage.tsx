import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { logoFor } from "@/lib/casino-index";
import type { LiveGame } from "@/lib/types";

/**
 * Ported from the `isLiveGame` block in CryptoSlotGuide.dc.html (search
 * for `LIVE GAME (how to play a table)`). "Where to play it" uses our
 * liveCasinos operator stats rather than an exact per-game seat table —
 * our data model doesn't carry a game↔operator cross-reference (the
 * source's `lgWhere` implies one that isn't in the arrays we ported).
 */
export function LiveGamePage({ g }: { g: LiveGame }) {
  const { liveCasinos } = siteData;
  const sameType = siteData.liveGames.filter((x) => x.type === g.type && x.slug !== g.slug).slice(0, 5);

  return (
    <main>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "#0B0F12" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 40px 44px" }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#5C6A72", marginBottom: 26 }}>
            <Link href="/" style={{ color: "#5C6A72" }}>Index</Link> / <Link href="/live-casino" style={{ color: "#5C6A72" }}>Live casino</Link> / {g.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <span style={{ padding: "5px 11px", borderRadius: 100, border: "1px solid rgba(255,255,255,.14)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".07em", textTransform: "uppercase", color: g.tint }}>{g.type}</span>
            <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#5C6A72" }}>{g.studio}</span>
          </div>
          <h1 style={{ margin: "0 0 14px", fontSize: 46, lineHeight: 1.03, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "116%", color: "#fff", textWrap: "balance" }}>{g.name}</h1>
          <p style={{ margin: "0 0 30px", maxWidth: "70ch", fontSize: 16.5, lineHeight: 1.65, color: "#96A6AF", textWrap: "pretty" }}>{g.why}</p>
          <div style={{ display: "grid", minWidth: 0, gridTemplateColumns: "repeat(auto-fit,minmax(168px,1fr))", gap: 1, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 13, overflow: "hidden" }}>
            <StatTile label="Published return" value={`${g.rtp.toFixed(2)}%`} />
            <StatTile label="Min stake" value={g.stake} />
            <StatTile label="Max stake" value={g.max} />
            <div style={{ padding: "18px 20px", background: "rgba(12,16,19,.86)" }}>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#5C6A72", marginBottom: 8 }}>What it adds</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.4, color: "#DCE5E9", marginTop: 3 }}>{g.edge}</div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1.35fr .65fr", gap: 52, maxWidth: 1180, margin: "0 auto", padding: "48px 40px 76px", alignItems: "start" }}>
        <div>
          <h2 style={{ margin: "0 0 20px", fontSize: 26, letterSpacing: "-.03em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>How to play</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 44 }}>
            {g.how.map((s, i) => (
              <div key={s} style={{ display: "flex", gap: 16, padding: "18px 20px", borderRadius: 13, background: "rgba(12,16,19,.7)", border: "1px solid rgba(255,255,255,.07)" }}>
                <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, color: g.tint, paddingTop: 2 }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontSize: 14.5, lineHeight: 1.6, color: "#C3CFD5", textWrap: "pretty" }}>{s}</span>
              </div>
            ))}
          </div>

          <h2 style={{ margin: "0 0 8px", fontSize: 26, letterSpacing: "-.03em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>Where to play it</h2>
          <p style={{ margin: "0 0 18px", fontSize: 14.5, color: "#8DA0AA" }}>Seat limits and stream latency as we found them, logged from a funded account.</p>
          <div style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 13, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(160px,1.2fr) 96px 110px 96px 92px", background: "rgba(255,255,255,.03)", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
              {["Casino", "Min", "Max", "Latency", ""].map((h) => (
                <div key={h} style={{ padding: "13px 16px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".07em", textTransform: "uppercase", color: "#5C6A72" }}>{h}</div>
              ))}
            </div>
            {liveCasinos.map((c) => {
              const [min, max] = c.stakes.split("–").map((s) => s.trim());
              return (
                <div key={c.slug} style={{ display: "grid", gridTemplateColumns: "minmax(160px,1.2fr) 96px 110px 96px 92px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "13px 16px" }}>
                    <div style={{ width: 44, height: 30, flex: "none", display: "flex", alignItems: "center" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoFor(c.slug)} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#E8EDF0" }}>{c.name}</span>
                  </div>
                  <div style={{ padding: "13px 16px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: "#DCE5E9" }}>{min ?? "—"}</div>
                  <div style={{ padding: "13px 16px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: "#DCE5E9" }}>{max ?? "—"}</div>
                  <div style={{ padding: "13px 16px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: "#8DA0AA" }}>{c.latency}</div>
                  <div style={{ padding: "13px 16px" }}>
                    <Link href={`/casinos/${c.slug}`} className="hover:!text-accent" style={{ fontSize: 12.5, fontWeight: 600, color: "#00C2CC", whiteSpace: "nowrap" }}>Review →</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ padding: 22, borderRadius: 14, background: "rgba(12,16,19,.75)", border: "1px solid rgba(255,255,255,.08)" }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".09em", textTransform: "uppercase", color: "#5C6A72", marginBottom: 16 }}>Returns by bet</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {g.side.map(([k, v]) => (
                <div key={k} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14, paddingBottom: 11, borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                  <span style={{ fontSize: 13, color: "#96A6AF" }}>{k}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 13, color: "#fff", whiteSpace: "nowrap" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          {sameType.length > 0 && (
            <div style={{ padding: 22, borderRadius: 14, background: "rgba(12,16,19,.75)", border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".09em", textTransform: "uppercase", color: "#5C6A72", marginBottom: 14 }}>Other {g.type} tables</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {sameType.map((s) => (
                  <Link key={s.slug} href={`/live-casino/${s.slug}`} className="hover:!text-accent" style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "9px 0", fontSize: 13.5, fontWeight: 500, color: "#C3CFD5" }}>
                    {s.name}
                    <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, color: "#5C6A72" }}>{s.rtp.toFixed(2)}%</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <Link href="/live-casino" style={{ padding: "18px 22px", borderRadius: 14, background: "rgba(255,126,182,.08)", border: "1px solid rgba(255,126,182,.28)", fontSize: 13.5, fontWeight: 600, color: "#FF9FC7" }}>
            All live tables →
          </Link>
        </aside>
      </div>
    </main>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "18px 20px", background: "rgba(12,16,19,.86)" }}>
      <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#5C6A72", marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 23, color: "#fff" }}>{value}</div>
    </div>
  );
}
