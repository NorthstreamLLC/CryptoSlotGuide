import Link from "next/link";
import type { ReactNode } from "react";
import { TONE, toneOf, type Source } from "@/lib/legal";

export const MONO = "var(--font-jetbrains-mono), monospace";

export function LegalHero({ crumbs, eyebrow, title, children }: { crumbs: { label: string; href?: string }[]; eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(80% 120% at 85% 0%, rgba(47,182,122,.10), transparent 55%), radial-gradient(60% 80% at 0% 100%, rgba(0,194,204,.07), transparent 60%), #0A0D10" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 24px 34px" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, color: "#5C6A72", marginBottom: 20 }}>
          {crumbs.map((c, i) => (
            <span key={i}>
              {i > 0 && " / "}
              {c.href ? <Link href={c.href} style={{ color: "#5C6A72" }}>{c.label}</Link> : <span style={{ color: "#A8B6BE" }}>{c.label}</span>}
            </span>
          ))}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#2FB67A", marginBottom: 12 }}>{eyebrow}</div>
        <h1 style={{ margin: "0 0 14px", fontSize: "clamp(34px, 4.4vw, 52px)", lineHeight: 1.03, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "114%", color: "#fff", textWrap: "balance" }}>{title}</h1>
        {children}
      </div>
    </section>
  );
}

export function StatusTile({ label, status }: { label: string; status?: string }) {
  const t = toneOf(status);
  return (
    <div style={{ padding: "16px 18px", borderRadius: 14, background: "#0E1316", border: `1px solid ${TONE[t].fill}55` }}>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#6E7F88", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18, fontWeight: 800, color: "#fff", textTransform: "capitalize" }}>
        <span style={{ width: 10, height: 10, borderRadius: 100, background: TONE[t].fill, flex: "none" }} />
        {status ?? "Not covered"}
      </div>
    </div>
  );
}

export function Sources({ sources }: { sources: Source[] }) {
  if (!sources?.length) return null;
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#6E7F88", marginBottom: 8 }}>Sources</div>
      <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
        {sources.map((s) => (
          <li key={s.url} style={{ fontSize: 13.5, color: "#A8B6BE" }}>
            <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#5FE3E8" }}>{s.label} ↗</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Disclaimer() {
  return (
    <p style={{ margin: "26px 0 0", maxWidth: "80ch", fontSize: 12.5, lineHeight: 1.6, color: "#6E7F88" }}>
      This is general information taken from regulators&apos; and governments&apos; own published pages, not legal advice. Gambling law changes; check the regulator&apos;s current rules before you play.
    </p>
  );
}

export function RegionGrid({ items }: { items: { href: string; name: string; status?: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
      {items.map((it) => {
        const t = toneOf(it.status);
        return (
          <Link key={it.href} href={it.href} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", borderRadius: 10, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)", fontSize: 13.5, fontWeight: 600, color: "#E8EDF0" }}>
            <span style={{ width: 9, height: 9, borderRadius: 100, background: TONE[t].fill, flex: "none" }} />
            <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function Tabs({ active }: { active: "world" | "europe" | "us" }) {
  const tab = (key: "world" | "europe" | "us", label: string, href: string) => (
    <Link href={href} style={{ padding: "9px 16px", borderRadius: 100, border: `1px solid ${active === key ? "rgba(47,182,122,.55)" : "rgba(255,255,255,.12)"}`, background: active === key ? "rgba(47,182,122,.14)" : "transparent", fontSize: 13.5, fontWeight: 700, color: active === key ? "#7BE0B8" : "#A8B6BE" }}>
      {label}
    </Link>
  );
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
      {tab("world", "World", "/legal")}
      {tab("europe", "Europe", "/legal/europe")}
      {tab("us", "United States", "/legal/us")}
    </div>
  );
}
