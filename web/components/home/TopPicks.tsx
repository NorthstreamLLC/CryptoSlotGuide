"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import { CoinStack } from "@/components/ui/CoinIcon";
import { Icon, type IconName } from "@/components/ui/Icon";

const MONO = "var(--font-jetbrains-mono), monospace";

/**
 * The hero's rotating pick, one per vertical: casino, sportsbook, prediction
 * market, exchange. Shows the breadth of what the site covers instead of
 * leading on casinos alone.
 *
 * The eyebrow is the CATEGORY, not "top" or "best". A rotation whose order is
 * partly commercial cannot call its first card the top casino — /editorial-
 * standards states that the featured order is never described as a ranking —
 * so the commercial ones carry a FEATURED chip and the rest carry nothing.
 * Every figure on a card is the same cited fact as the entity's own page.
 *
 * Roobet is index 0 deliberately: every first visit sees it before the
 * rotation begins, so breadth costs nothing at the top of the funnel.
 */

export interface Pick {
  slug: string;
  name: string;
  mono: string;
  tint: string;
  /** "Crypto casino", "Sportsbook", … — what this is, not how good it is. */
  category: string;
  /** Licence or operating entity, as the source states it. */
  sub: string;
  headline: string;
  stats: { label: string; value: string }[];
  coins?: string[];
  notes?: { icon: IconName; text: string }[];
  href: string;
  /** Present only when a real affiliate link exists; drives the disclosure. */
  signupUrl?: string;
  featured?: boolean;
  cta: string;
}

const ROTATE_MS = 7000;

export function TopPicks({ picks }: { picks: Pick[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const region = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused || picks.length < 2) return;
    // Anyone who has asked for less motion gets the first card and no
    // rotation — the same rule the rest of the site follows.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % picks.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [paused, picks.length]);

  if (!picks.length) return null;
  const p = picks[i];

  return (
    <div
      ref={region}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      style={{ position: "relative" }}
    >
      {/* Tabs, not dots: the category is the useful label, and it tells a
          reader the site covers four things before they click anything. */}
      <div role="tablist" aria-label="Featured picks" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {picks.map((x, n) => (
          <button
            key={x.slug}
            role="tab"
            aria-selected={n === i}
            aria-controls={`pick-${x.slug}`}
            type="button"
            onClick={() => { setI(n); setPaused(true); }}
            className="transition-colors"
            style={{
              padding: "6px 11px",
              borderRadius: 100,
              border: `1px solid ${n === i ? "rgba(0,194,204,.45)" : "rgba(255,255,255,.12)"}`,
              background: n === i ? "rgba(0,194,204,.12)" : "rgba(12,16,19,.6)",
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: n === i ? "#5FE3E8" : "#8E9CA5",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {x.category}
          </button>
        ))}
      </div>

      <div
        id={`pick-${p.slug}`}
        role="tabpanel"
        aria-live="polite"
        style={{
          padding: "22px 24px 24px",
          borderRadius: 20,
          background: `linear-gradient(180deg, ${p.tint}0E, rgba(12,16,19,.94) 42%), #0C1013`,
          border: `1px solid ${p.tint}3a`,
          boxShadow: "0 18px 48px rgba(0,0,0,.36)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 16 }}>
          <span style={{ width: 46, height: 46, flex: "none", borderRadius: 13, overflow: "hidden" }}>
            <BrandMark slug={p.slug} mono={p.mono} tint={p.tint} radius={13} fontSize={15} />
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>{p.name}</span>
              {p.featured && (
                <span style={{ padding: "2px 8px", borderRadius: 100, background: "rgba(214,182,92,.14)", fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: ".07em", color: "#D6B65C" }}>
                  FEATURED
                </span>
              )}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: "#8E9CA5", marginTop: 2 }}>{p.sub}</div>
          </div>
        </div>

        <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: p.tint, marginBottom: 6 }}>
          {p.category}
        </div>
        <p style={{ margin: "0 0 18px", fontSize: 19, lineHeight: 1.3, fontWeight: 800, letterSpacing: "-.02em", color: "#fff", textWrap: "balance" }}>
          {p.headline}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(p.stats.length, 3)}, minmax(0,1fr))`, gap: 9, marginBottom: 14 }}>
          {p.stats.slice(0, 3).map((s) => (
            <div key={s.label} style={{ padding: "10px 12px", borderRadius: 11, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", minWidth: 0 }}>
              <div style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#8E9CA5", marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", overflowWrap: "anywhere" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {p.coins && p.coins.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <CoinStack tickers={p.coins} max={7} size={22} />
          </div>
        )}

        {p.notes && p.notes.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
            {p.notes.slice(0, 3).map((n) => (
              <span key={n.text} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, lineHeight: 1.45, color: "#A9B8C0" }}>
                <span style={{ color: p.tint, display: "inline-flex", flex: "none" }}><Icon name={n.icon} size={13} /></span>
                {n.text}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          {p.signupUrl ? (
            <a
              href={p.signupUrl}
              target="_blank"
              rel="noopener sponsored nofollow"
              className="transition-transform hover:-translate-y-px"
              style={{ flex: "1 1 180px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 18px", borderRadius: 11, background: "#FFC531", color: "#141007", fontSize: 14.5, fontWeight: 800, whiteSpace: "nowrap" }}
            >
              {p.cta} <Icon name="arrow" size={15} />
            </a>
          ) : (
            <Link
              href={p.href}
              className="transition-transform hover:-translate-y-px"
              style={{ flex: "1 1 180px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 18px", borderRadius: 11, background: "#00C2CC", color: "#04191B", fontSize: 14.5, fontWeight: 800, whiteSpace: "nowrap" }}
            >
              {p.cta} <Icon name="arrow" size={15} />
            </Link>
          )}
          <Link
            href={p.href}
            className="transition-colors hover:!border-white/25"
            style={{ display: "inline-flex", alignItems: "center", padding: "13px 16px", borderRadius: 11, border: "1px solid rgba(255,255,255,.14)", fontSize: 13.5, fontWeight: 600, color: "#C6D1D7", whiteSpace: "nowrap" }}
          >
            Read the review
          </Link>
        </div>
      </div>
    </div>
  );
}
