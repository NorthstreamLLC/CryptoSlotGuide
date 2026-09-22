"use client";

import Link from "next/link";
import { useState } from "react";
import type { EntityView } from "@/lib/entity-view";
import { backLink, ctaLabel, editorialTake, nextStepsFor } from "@/lib/entity-view";
import { NextSteps } from "@/components/layout/NextSteps";
import { reviewTierFor, TIER_LABEL, TIER_TINT } from "@/lib/review-tier";
import { isEditoriallyAudited } from "@/lib/field-tested";
import { OnChainActivity } from "./OnChainActivity";
import { CasinoSpecSheet } from "./CasinoSpecSheet";
import { CasinoBonuses } from "./CasinoBonuses";
import { BrandMark } from "@/components/ui/BrandMark";
import { GlanceCard } from "./GlanceCard";

/**
 * Ported from the `isEntity` block in CryptoSlotGuide.dc.html — the
 * generic review page (search that file for
 * `<sc-if value="{{ isEntity }}"`). One template, six entity types (five
 * wired so far: casino/slot/wallet/exchange/provider — see lib/entity-view.ts).
 */
export function EntityReviewPage({ e }: { e: EntityView }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const back = backLink(e.type);
  const take = editorialTake(e.type, e.slug);
  // What leads the hero now — real hand-written opinion where one exists
  // (6 entities total, see data/editorial.json), else the same computed
  // verdict that used to sit in a box below the fold. Either way it's
  // real content, never a guessed take. Promoting it here — instead of
  // the old standfirst, which opened every review with the funded-
  // account caveat — is deliberate: that caveat isn't going away (it's
  // still in the byline below), it just stops being the first thing a
  // reader sees before the site's actual opinion.
  const heroLead = take ?? e.verdict;
  const isCasino = e.type === "casino";
  const tier = reviewTierFor(e.type, e.slug);
  const audited = tier === "pending" && isEditoriallyAudited(e.slug);
  const statCols = e.stats.length === 4 ? 2 : Math.min(3, e.stats.length);

  return (
    <main style={{ background: "#07090B", color: "#E8EDF0" }}>
      <section style={{ background: "#0B0F12", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 40px 48px" }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#5C6A72", marginBottom: 26 }}>
            <Link href="/" style={{ color: "#5C6A72" }}>Index</Link> / <Link href={back.href} style={{ color: "#5C6A72" }}>{e.kicker}</Link> /{" "}
            <span style={{ color: "#A8B6BE" }}>{e.name}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.25fr .75fr", gap: 56, alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                <div style={{ width: 38, height: 38, flex: "none" }}>
                  <BrandMark slug={e.slug} mono={e.mono} tint={e.tint} radius={9} />
                </div>
                <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC" }}>
                  {e.kicker}
                </span>
              </div>
              <h1 style={{ margin: "0 0 16px", fontSize: 44, lineHeight: 1.06, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "114%", color: "#fff", textWrap: "balance" }}>
                {e.headline}
              </h1>
              <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                <div style={{ width: 3, flex: "none", borderRadius: 2, background: "#00C2CC" }} />
                <p style={{ margin: 0, maxWidth: "60ch", fontSize: 19, lineHeight: 1.55, fontWeight: 600, color: "#E8EDF0", textWrap: "pretty" }}>{heroLead}</p>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
                {e.tags.map((t) => (
                  <span key={t} style={{ padding: "5px 10px", borderRadius: 5, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".05em", color: "#A8B6BE" }}>
                    {t}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {tier === "field-tested" && <Link
                  href="/how-we-rate"
                  style={{
                    padding: "3px 8px",
                    borderRadius: 4,
                    border: `1px solid ${TIER_TINT[tier]}55`,
                    background: `${TIER_TINT[tier]}18`,
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    color: TIER_TINT[tier],
                  }}
                >
                  {TIER_LABEL[tier]}
                </Link>}
                <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11.5, color: "#5C6A72" }}>{e.byline}</div>
              </div>
            </div>

            <div style={{ padding: 26, borderRadius: 16, background: "#12181C", border: "1px solid rgba(255,255,255,.09)", boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}>
              <GlanceCard rows={e.glance} />
              {e.signupUrl ? (
                <a
                  href={e.signupUrl}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  style={{ display: "block", textAlign: "center", padding: 14, borderRadius: 9, background: "#00C2CC", color: "#04191B", fontSize: 14, fontWeight: 700, marginBottom: 9 }}
                >
                  {ctaLabel(e.type, e.name)}
                </a>
              ) : (
                <span style={{ display: "block", textAlign: "center", padding: 14, borderRadius: 9, background: "#00C2CC", color: "#04191B", fontSize: 14, fontWeight: 700, marginBottom: 9 }}>
                  {ctaLabel(e.type, e.name)}
                </span>
              )}
              <Link href={back.href} style={{ display: "block", textAlign: "center", padding: 13, borderRadius: 9, border: "1px solid rgba(255,255,255,.14)", color: "#DCE5E9", fontSize: 13.5, fontWeight: 600 }}>
                {back.label}
              </Link>
              <div style={{ marginTop: 14, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, lineHeight: 1.5, color: "#4E5A62" }}>
                {isCasino
                  ? e.signupUrl && e.affiliate
                    ? "Affiliate link. 18+. T&Cs apply. Play within your limits."
                    : e.signupUrl
                    ? "18+. T&Cs apply. Play within your limits."
                    : "18+. T&Cs apply. Play within your limits. Sign-up link not yet added for this operator."
                  : "Not financial advice. We hold no position in any asset named here."}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 40px 80px" }}>
        {/* When a hand-written take exists, it's now the hero lead above —
            this box shows the separate computed verdict so nothing repeats.
            When there's no take, the verdict IS the hero lead already, so
            this box is skipped rather than showing the same sentence twice. */}
        {take && (
          <div style={{ padding: 28, borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)", marginBottom: 38 }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 12 }}>
              Verdict
            </div>
            <p style={{ margin: 0, maxWidth: "88ch", fontSize: 18, lineHeight: 1.6, color: "#DCE5E9", textWrap: "pretty" }}>{e.verdict}</p>
          </div>
        )}

        <SectionHeading
          title={tier === "field-tested" ? "What we measured" : "Key figures"}
          sub={
            e.measuredSub ??
            (tier === "field-tested"
              ? "Every figure below came from our own funded account."
              : "Each figure links to its source in the fact table below.")
          }
        />
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${statCols}, 1fr)`, gap: 1, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 13, overflow: "hidden", marginBottom: 38 }}>
          {e.stats.map((m, i) => (
            <div
              key={m.label}
              // Last tile spans whatever's left of its row, so an uneven
              // count never leaves a bare gap-colored cell.
              style={{ padding: "20px 22px", background: "#0C1013", gridColumn: i === e.stats.length - 1 ? `span ${statCols - (i % statCols)}` : undefined }}
            >
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".07em", textTransform: "uppercase", color: "#5C6A72", marginBottom: 8 }}>
                {m.label}
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: m.value.length > 16 ? 15 : 22, lineHeight: 1.35, fontWeight: 500, color: "#E8EDF0", letterSpacing: "-.02em", marginBottom: 5 }}>
                {m.value}
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.45, color: "#7B8A93", textWrap: "pretty" }}>{m.note}</div>
            </div>
          ))}
        </div>

        {isCasino && <CasinoBonuses slug={e.slug} />}
        {isCasino && <OnChainActivity slug={e.slug} />}
        {(isCasino || e.type === "wallet" || e.type === "exchange") && <CasinoSpecSheet slug={e.slug} kind={e.type === "wallet" ? "wallet" : e.type === "exchange" ? "exchange" : "casino"} />}

        {e.chips.length > 0 && <div style={{ padding: "20px 24px", borderRadius: 13, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)", marginBottom: 38 }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 13 }}>
            {e.chipLabel}
          </div>
          {e.chips.length > 0 ? (
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {e.chips.map((c) => (
                <span key={c.t} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 11px", borderRadius: 100, background: "rgba(255,255,255,.04)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".04em", color: "#B7C4CB" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.tint }} />
                  {c.t}
                </span>
              ))}
            </div>
          ) : (
            null
          )}
        </div>}

        <div style={{ display: "grid", gridTemplateColumns: e.cons.length && e.pros.length ? "1fr 1fr" : "1fr", gap: 14, marginBottom: 38 }}>
          {e.pros.length > 0 && (
          <div style={{ padding: 24, borderRadius: 13, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 14 }}>
              Holds up
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {e.pros.map((p) => (
                <div key={p} style={{ display: "flex", gap: 11, fontSize: 14, lineHeight: 1.5, color: "#B7C4CB" }}>
                  <span style={{ color: "#00C2CC", fontFamily: "var(--font-jetbrains-mono), monospace", flex: "none" }}>+</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
          )}
          {e.cons.length > 0 && (
          <div style={{ padding: 24, borderRadius: 13, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#DA9877", marginBottom: 14 }}>
              Falls short
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {e.cons.map((c) => (
                <div key={c} style={{ display: "flex", gap: 11, fontSize: 14, lineHeight: 1.5, color: "#B7C4CB" }}>
                  <span style={{ color: "#DA9877", fontFamily: "var(--font-jetbrains-mono), monospace", flex: "none" }}>−</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>

        {e.spec.length > 0 && <SectionHeading title={e.specTitle} sub={e.specSub} maxWidth="80ch" />}
        {e.spec.length > 0 && e.specSource && (
          <div style={{ margin: "-6px 0 14px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11 }}>
            <a href={e.specSource} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#5FE3E8" }}>
              Source: {new URL(e.specSource).hostname.replace(/^www./, "")} ↗
            </a>
          </div>
        )}
        {e.spec.length > 0 && (
        <div style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 13, overflow: "hidden", background: "#0C1013", marginBottom: 38 }}>
          {e.spec.map((row) => (
            <div key={row.k} style={{ display: "grid", gridTemplateColumns: "210px 1fr 150px", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
              <div style={{ padding: "14px 18px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase", color: "#5C6A72" }}>{row.k}</div>
              <div style={{ padding: "14px 18px", fontSize: 13.5, lineHeight: 1.5, color: "#B7C4CB" }}>{row.v}</div>
              <div style={{ padding: "14px 18px" }}>
                <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".05em", padding: "3px 7px", borderRadius: 4, background: row.background, color: row.color, whiteSpace: "nowrap" }}>
                  {row.label}
                </span>
              </div>
            </div>
          ))}
        </div>
        )}

        {(e.extraSpecs ?? []).map((block) => (
          <div key={block.title}>
            <SectionHeading title={block.title} sub={block.sub} maxWidth="80ch" />
            <div style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 13, overflow: "hidden", background: "#0C1013", marginBottom: 38 }}>
              {block.rows.map((row) => (
                <div key={row.k} style={{ display: "grid", gridTemplateColumns: "210px 1fr 150px", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                  <div style={{ padding: "14px 18px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase", color: "#5C6A72" }}>{row.k}</div>
                  <div style={{ padding: "14px 18px", fontSize: 13.5, lineHeight: 1.5, color: "#B7C4CB" }}>{row.v}</div>
                  <div style={{ padding: "14px 18px" }}>
                    <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".05em", padding: "3px 7px", borderRadius: 4, background: row.background, color: row.color, whiteSpace: "nowrap" }}>{row.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {e.tableRows.length > 0 && <SectionHeading title={e.tableTitle} sub={e.tableSub} maxWidth="80ch" />}
        {e.tableRows.length > 0 && (
        <div style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 13, overflow: "hidden", background: "#0C1013", marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(240px,1.5fr) 130px 150px 130px", background: "#101519", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
            {["Item", ...e.tableCols].map((h) => (
              <div key={h} style={{ padding: "13px 18px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".07em", textTransform: "uppercase", color: "#5C6A72" }}>
                {h}
              </div>
            ))}
          </div>
          {e.tableRows.map((r) => (
            <div key={r.name} style={{ display: "grid", gridTemplateColumns: "minmax(240px,1.5fr) 130px 150px 130px", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
              <div style={{ padding: "14px 18px", minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#E8EDF0" }}>{r.name}</div>
                <div style={{ fontSize: 12, color: "#5C6A72", marginTop: 2 }}>{r.note}</div>
              </div>
              <div style={{ padding: "14px 18px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: "#B7C4CB" }}>{r.m1}</div>
              <div style={{ padding: "14px 18px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: "#B7C4CB" }}>{r.m2}</div>
              <div style={{ padding: "14px 18px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: "#B7C4CB" }}>{r.m3}</div>
            </div>
          ))}
        </div>
        )}
        {e.tableRows.length > 0 && <p style={{ margin: "0 0 38px", fontSize: 13.5, lineHeight: 1.6, color: "#7B8A93", maxWidth: "84ch", textWrap: "pretty" }}>{e.tableNote}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 14 }}>
          <div style={{ padding: 28, borderRadius: 13, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 20, letterSpacing: "-.02em", fontWeight: 700, color: "#E8EDF0" }}>Questions readers ask</h3>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {e.faqs.map((q, i) => (
                <div key={q.q} style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "15px 0", border: 0, background: "transparent", textAlign: "left", fontSize: 14.5, fontWeight: 600, color: "#E8EDF0" }}
                  >
                    <span style={{ flex: 1 }}>{q.q}</span>
                    <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", color: "#00C2CC" }}>{openFaq === i ? "−" : "+"}</span>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: "0 0 15px", maxWidth: "82ch", fontSize: 14, lineHeight: 1.7, color: "#93A3AC", textWrap: "pretty" }}>{q.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link href={back.href} style={{ display: "flex", flexDirection: "column", gap: 14, padding: 24, borderRadius: 13, background: "#101519", border: "1px solid rgba(255,255,255,.07)" }}>
              <span style={{ fontSize: 15.5, fontWeight: 700, color: "#fff", letterSpacing: "-.015em" }}>{back.label}</span>
              <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".05em", color: "#5FE3E8" }}>Same facts, side by side →</span>
            </Link>
            <Link href="/how-we-rate" style={{ display: "flex", flexDirection: "column", gap: 14, padding: 24, borderRadius: 13, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
              <span style={{ fontSize: 15.5, fontWeight: 700, color: "#E8EDF0", letterSpacing: "-.015em" }}>How we source information</span>
              <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".05em", color: "#00C2CC" }}>Where each fact comes from →</span>
            </Link>
          </div>
        </div>

        <NextSteps steps={nextStepsFor(e.type)} />
      </div>
    </main>
  );
}

function SectionHeading({ title, sub, maxWidth }: { title: string; sub: string; maxWidth?: string }) {
  return (
    <>
      <h2 style={{ margin: "0 0 8px", fontSize: 28, letterSpacing: "-.028em", fontWeight: 800, fontStretch: "112%", color: "#E8EDF0" }}>{title}</h2>
      <p style={{ margin: "0 0 20px", fontSize: 15, color: "#8DA0AA", maxWidth, textWrap: "pretty" }}>{sub}</p>
    </>
  );
}
