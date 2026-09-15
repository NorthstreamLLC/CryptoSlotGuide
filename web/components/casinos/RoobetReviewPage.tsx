"use client";

import Link from "next/link";
import { useState } from "react";
import { siteData } from "@/lib/site-data";
import { editorialTake, getEntityView } from "@/lib/entity-view";
import { isStaleReading, liveCon } from "@/lib/derived";
import { comparePayout, payoutView } from "@/lib/payout";
import { tintFor } from "@/lib/logo";
import { BrandMark } from "@/components/ui/BrandMark";
import { TIER_LABEL, TIER_TINT } from "@/lib/review-tier";
import { isFieldTestedOperator, isEditoriallyAudited } from "@/lib/field-tested";
import { faqData } from "@/lib/roobet-faq";
import { GlanceCard } from "@/components/entity/GlanceCard";
import { OnChainActivity } from "@/components/entity/OnChainActivity";
import { CasinoSpecSheet } from "@/components/entity/CasinoSpecSheet";
import { CasinoBonuses } from "@/components/entity/CasinoBonuses";
import { getSpecFact, getCasinoSpecSheet } from "@/lib/spec-sheet";


/**
 * The hand-written flagship review — ported from the `isReview` block in
 * CryptoSlotGuide.dc.html (search for `ROOBET REVIEW (light)`). Per
 * design/README.md's "Canonical routing caveat", this is the one casino
 * with a bespoke review; every other casino uses the generic
 * EntityReviewPage template. The prototype's hand-typed measurements
 * (withdrawal counts, support reply times, esports market counts,
 * per-build RTP deltas) were invented — nothing on this page may read as
 * timed/tested/counted unless isFieldTestedOperator("roobet") or real
 * RTP Watch readings back it. Listed figures come from ops.json /
 * liveCasinos.json and are labelled as listed, not measured.
 */

/** Head-to-head columns, in order. Values are pulled from ops.json / coinsBy / liveCasinos — listed figures, not timed by us. */
const H2H_SLUGS = ["roobet", "stake", "bc-game"] as const;

/** Index (or tied indexes) of the best value in a row. */
function bestIdx(vals: number[], dir: "min" | "max"): number | number[] {
  const target = dir === "min" ? Math.min(...vals) : Math.max(...vals);
  const idx = vals.flatMap((v, i) => (v === target ? [i] : []));
  return idx.length === 1 ? idx[0] : idx;
}


function win(idx: number, w: number | number[]) {
  const isWin = Array.isArray(w) ? w.includes(idx) : idx === w;
  return isWin
    ? { bg: "rgba(0,194,204,.10)", color: "#5FE3E8", weight: 700, mark: Array.isArray(w) ? "=" : "◆" }
    : { bg: "transparent", color: "#8DA0AA", weight: 400, mark: "" };
}

export function RoobetReviewPage() {
  const [faq, setFaq] = useState<number | null>(null);
  const { ops, coinsBy, liveCasinos, rtpWatch, slots } = siteData;

  const roobet = ops.find((o) => o.slug === "roobet")!;
  const coins = coinsBy["roobet"] ?? [];
  // No scores on the site — the sidebar lists the other casinos with the fastest stated withdrawal times instead.
  const alsoConsidered = ops.filter((o) => o.slug !== "roobet" && payoutView(o).mins !== null).sort(comparePayout).slice(0, 4);
  const glance = getEntityView("casino", "roobet")?.glance ?? [];
  const con = liveCon(liveCasinos, "roobet");
  const roobetLive = liveCasinos.find((c) => c.slug === "roobet");
  const tableLeader = [...liveCasinos].sort((a, b) => b.tables - a.tables)[0];

  // Listed figures only — the prototype's esports-market and support-reply
  // rows were first-hand counts/timings we never did, so they're gone.
  const h2hOps = H2H_SLUGS.map((s) => ops.find((o) => o.slug === s));
  const h2hLive = H2H_SLUGS.map((s) => liveCasinos.find((c) => c.slug === s));
  const h2hRaw: [string, string, string, string, number | number[]][] = [];
  if (h2hOps.every(Boolean)) {
    const [r, s, b] = h2hOps as NonNullable<(typeof h2hOps)[number]>[];
    const coinCounts = H2H_SLUGS.map((slug) => (coinsBy[slug] ?? []).length);
    h2hRaw.push(
      // Stated times aren't comparable figures (and Stake/BC.Game don't state one we could reach), so no row winner.
      ["Stated withdrawal time", "Instant", "Not stated", "Not reachable", -1],
      ["Wagering on headline offer", `${r.wager}×`, `${s.wager}×`, `${b.wager}×`, bestIdx([r.wager, s.wager, b.wager], "min")],
      ["Coins accepted", String(coinCounts[0]), String(coinCounts[1]), String(coinCounts[2]), bestIdx(coinCounts, "max")],
    );
    if (h2hLive.every(Boolean)) {
      const tables = h2hLive.map((c) => c!.tables);
      h2hRaw.push(["Live dealer tables (listed)", String(tables[0]), String(tables[1]), String(tables[2]), bestIdx(tables, "max")]);
    }
  }
  const soleWins = h2hRaw.filter((r) => typeof r[4] === "number" && r[4] === 0).length;
  const ties = h2hRaw.filter((r) => Array.isArray(r[4])).length;
  const checked = isFieldTestedOperator("roobet");
  const audited = isEditoriallyAudited("roobet");

  // Only real, non-stale RTP Watch readings taken in Roobet's own client —
  // the prototype's per-build RTP table was invented. Empty today.
  const slotReadings = checked ? rtpWatch.filter((r) => r.operatorSlug === "roobet" && !isStaleReading(r.checkedAt)) : [];
  const readingRows = slotReadings.map((r) => {
    const slot = slots.find((s) => s.slug === r.slotSlug);
    const diff = r.rtp - r.publishedRtp;
    return {
      key: r.id,
      name: slot?.name ?? r.slotSlug,
      provider: slot?.provider ?? "—",
      here: `${r.rtp.toFixed(2)}%`,
      delta: diff >= 0 ? "full" : `−${Math.abs(diff).toFixed(2)}`,
      deltaColor: diff >= 0 ? "#5FE3E8" : "#DA9877",
      cut: diff < 0,
    };
  });
  const cutSlots = readingRows.filter((s) => s.cut).map((s) => s.name);

  const licenceFact = getSpecFact("roobet", "Compliance", "Licence");
  // Bonus terms come from the cited spec sheet, not hand-typed rows — the
  // prototype's rows (7-day cashback expiry, $5 max bet, "several US
  // states") contradicted or weren't in Roobet's own terms when checked.
  const bonusFacts = getCasinoSpecSheet("roobet")?.groups.find((g) => g.title === "Bonus terms")?.facts ?? [];

  // Pulled from the same sourced spec-sheet data as the "The full spec
  // sheet" section below, not re-typed — a second hardcoded "$10" here
  // previously drifted from (and contradicted) the real, cited figure.
  const minDeposit = getSpecFact("roobet", "Coins & deposit limits", "Minimum deposit");
  const minWithdrawal = getSpecFact("roobet", "Coins & deposit limits", "Minimum withdrawal");

  const verdict = `Roobet's edge is operational, not promotional. ${
    checked
      ? `Withdrawals cleared in a median ${roobet.payoutLabel} on our own funded account,`
      : `It says withdrawals are sent instantly on request — not yet timed by us —`
  } and its rakeback carries no stated wagering multiplier, where match bonuses elsewhere often sit at 40×.${con ? ` It loses points on live tables — ${con}.` : ""}`;
  // Real hand-written opinion (data/editorial.json's "casino:roobet"
  // entry) — same lib/entity-view.ts helper EntityReviewPage.tsx uses.
  // Previously unused on Roobet's own page despite existing; now it's
  // the hero lead instead of the funded-account caveat paragraph that
  // used to open the page, same change as the generic template got.
  const take = editorialTake("casino", "roobet");
  const heroLead = take ?? verdict;

  return (
    <main style={{ background: "#07090B", color: "#E8EDF0" }}>
      <section style={{ background: "#0B0F12", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 40px 48px" }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#5C6A72", marginBottom: 26 }}>
            <Link href="/" style={{ color: "#5C6A72" }}>Home</Link> / <Link href="/crypto-casinos" style={{ color: "#5C6A72" }}>Casinos</Link> / <span style={{ color: "#A8B6BE" }}>Roobet</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.25fr .75fr", gap: 56, alignItems: "start" }}>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/roobet-logo.png" alt="Roobet" style={{ height: 38, width: "auto", display: "block", marginBottom: 24 }} />
              <h1 style={{ margin: "0 0 16px", fontSize: 46, lineHeight: 1.05, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "114%", color: "#fff" }}>
                Roobet: stated instant withdrawals, no-wager rakeback, no crypto withdrawal fee
              </h1>
              <div style={{ display: "flex", gap: 16, marginBottom: 22 }}>
                <div style={{ width: 3, flex: "none", borderRadius: 2, background: "#00C2CC" }} />
                <p style={{ margin: 0, maxWidth: "60ch", fontSize: 19, lineHeight: 1.55, fontWeight: 600, color: "#E8EDF0", textWrap: "pretty" }}>{heroLead}</p>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 26 }}>
                <Chip label={checked ? "FUNDED ACCOUNT" : audited ? "DESK-AUDITED" : "LISTED FIGURES"} bg="rgba(255,255,255,.04)" border="rgba(255,255,255,.08)" color="#8DA0AA" />
                {/* Desk-audited is not community-reported (that tier means
                    aggregated review-site data we don't have) — until the
                    funded-account pass happens the honest tier is pending. */}
                <Link href="/how-we-rate">
                  <Chip
                    label={checked ? TIER_LABEL["field-tested"].toUpperCase() : TIER_LABEL.pending.toUpperCase()}
                    bg={`${TIER_TINT[checked ? "field-tested" : "pending"]}18`}
                    border={`${TIER_TINT[checked ? "field-tested" : "pending"]}55`}
                    color={TIER_TINT[checked ? "field-tested" : "pending"]}
                  />
                </Link>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11.5, color: "#5C6A72" }}>
                <span>
                  {checked
                    ? "Field-tested on our own funded account · reviewed by the editorial desk"
                    : audited
                    ? "Desk-audited against public terms and registries · payout timing not yet field-tested"
                    : "Published terms · desk audit and funded-account testing not yet done"}
                </span>
              </div>
            </div>
            <div style={{ padding: 26, borderRadius: 16, background: "#12181C", border: "1px solid rgba(255,255,255,.09)", boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}>
              <GlanceCard rows={glance} />
              <a href="https://roobet.com" target="_blank" rel="nofollow sponsored noopener" style={{ display: "block", textAlign: "center", padding: 14, borderRadius: 9, background: "#FFCC00", color: "#1A1400", fontSize: 14, fontWeight: 700, marginBottom: 9 }}>Visit Roobet</a>
              <Link href="/crypto-casinos" style={{ display: "block", textAlign: "center", padding: 13, borderRadius: 9, border: "1px solid rgba(255,255,255,.14)", color: "#DCE5E9", fontSize: 13.5, fontWeight: 600 }}>Compare against {ops.length - 1} others</Link>
              <div style={{ marginTop: 14, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, lineHeight: 1.5, color: "#4E5A62" }}>Affiliate link. 18+. T&amp;Cs apply. Play within your limits.</div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 40px 80px", display: "grid", gridTemplateColumns: "1fr 300px", gap: 56, alignItems: "start" }}>
        <div>
          {/* Same rule as EntityReviewPage.tsx: when a hand-written take
              exists it's already the hero lead above, so this box shows
              the separate computed verdict rather than repeating it. If
              editorial.json ever lost the roobet entry, heroLead would
              fall back to verdict and this box would correctly disappear
              instead of showing the same sentence twice. */}
          {take && (
            <div style={{ padding: 28, borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)", marginBottom: 34 }}>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 12 }}>Verdict</div>
              <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, color: "#DCE5E9", textWrap: "pretty" }}>{verdict}</p>
            </div>
          )}

          <SectionHeading
            title={checked ? "What we measured" : "Listed figures, not yet timed"}
            sub={
              checked
                ? "Timed on our own funded account — see how we source information for the protocol."
                : audited
                ? "Bonus terms, coin support and licence are checked against Roobet's own pages and public registries. Nothing below is timed or counted on our own funded account yet — see how we source information."
                : "Figures below are listed, not yet desk-audited or timed on our own funded account — see how we source information."
            }
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 13, overflow: "hidden", marginBottom: 38 }}>
            <Measurement
              label={checked ? "Median withdrawal" : "Stated withdrawal time"}
              value={payoutView(roobet).label}
              note={checked ? "Timed on our own funded account." : "Roobet's help centre: sent on request; arrival depends on blockchain confirmations. Not yet timed by us."}
            />
            <Measurement label="Slowest withdrawal" value="Not yet timed" note={checked ? "Not published here yet." : "Needs withdrawals from our own funded account."} />
            <Measurement
              label="Deposit credit"
              value={`${roobet.conf} confirm${roobet.conf === 1 ? "" : "s"}`}
              note={`Listed: BTC credits at ${roobet.conf === 1 ? "first confirmation" : `${roobet.conf} confirmations`}${roobet.ln ? "; Lightning supported" : ""}.`}
            />
            <Measurement label="Support first reply" value="Not yet timed" note={checked ? "Not published here yet." : "Live chat listed as 24/7. Reply times need our own tickets."} />
            <Measurement
              label="Esports markets"
              value={roobet.esports ? "Offered" : "None"}
              note={roobet.esports ? "Market depth not yet counted by us." : "No esports book listed."}
            />
            <Measurement
              label="Live dealer tables"
              value={roobetLive ? String(roobetLive.tables) : "—"}
              note={tableLeader && tableLeader.slug !== "roobet" ? `Listed, not yet counted by us. ${tableLeader.name} lists ${tableLeader.tables}.` : "Listed, not yet counted by us. The highest listed count we track."}
            />
          </div>

          <CasinoBonuses slug="roobet" />
          <OnChainActivity slug="roobet" />
          <CasinoSpecSheet slug="roobet" />

          <SectionHeading title="Head to head" sub="Against Stake and BC.Game. Listed figures, not yet timed by us. Winner marked per row." />
          <div style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 13, overflow: "hidden", background: "#0C1013", marginBottom: 38 }}>
            <div data-keep-grid style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr 1fr 1fr", background: "#101519", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
              <div style={{ padding: "15px 18px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".07em", textTransform: "uppercase", color: "#5C6A72" }}>Criterion</div>
              <div style={{ padding: "15px 18px", fontSize: 13.5, fontWeight: 700, color: "#E8EDF0", borderLeft: "1px solid rgba(255,255,255,.06)", background: "rgba(255,204,0,.07)" }}>Roobet</div>
              <div style={{ padding: "15px 18px", fontSize: 13.5, fontWeight: 700, color: "#E8EDF0", borderLeft: "1px solid rgba(255,255,255,.06)" }}>Stake</div>
              <div style={{ padding: "15px 18px", fontSize: 13.5, fontWeight: 700, color: "#E8EDF0", borderLeft: "1px solid rgba(255,255,255,.06)" }}>BC.Game</div>
            </div>
            {h2hRaw.map(([k, a, b, c, w]) => {
              const A = win(0, w), B = win(1, w), C = win(2, w);
              return (
                <div key={k} data-keep-grid style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr 1fr 1fr", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                  <div style={{ padding: "15px 18px", fontSize: 13.5, fontWeight: 600, color: "#B7C4CB" }}>{k}</div>
                  <div style={{ padding: "15px 18px", borderLeft: "1px solid rgba(255,255,255,.05)", background: w === 0 ? "rgba(255,204,0,.08)" : A.bg, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: A.color, fontWeight: A.weight }}>{a} {A.mark}</div>
                  <div style={{ padding: "15px 18px", borderLeft: "1px solid rgba(255,255,255,.05)", background: B.bg, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: B.color, fontWeight: B.weight }}>{b} {B.mark}</div>
                  <div style={{ padding: "15px 18px", borderLeft: "1px solid rgba(255,255,255,.05)", background: C.bg, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: C.color, fontWeight: C.weight }}>{c} {C.mark}</div>
                </div>
              );
            })}
            <div style={{ padding: "13px 18px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, color: "#5C6A72" }}>
              ◆ row winner · = tie · {soleWins} of {h2hRaw.length} rows to Roobet, {ties} tied · listed figures, not yet timed by us
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 38 }}>
            <div style={{ padding: 24, borderRadius: 13, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 14 }}>Holds up</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {[
                  "No wagering multiplier on rakeback — the only turnover rule is wagering a deposit once before withdrawing it.",
                  "No Roobet fee on crypto withdrawals; network fees only.",
                  readingRows.length > 0
                    ? `Ships the full published RTP on ${readingRows.length - cutSlots.length} of the ${readingRows.length} slots we checked in its own client.`
                    : null,
                  roobet.sports && roobet.esports ? "Casino, sportsbook and esports markets on one account." : null,
                ]
                  .filter((x): x is string => Boolean(x))
                  .map((p) => (
                  <div key={p} style={{ display: "flex", gap: 11, fontSize: 14, lineHeight: 1.5, color: "#B7C4CB" }}>
                    <span style={{ color: "#00C2CC", fontFamily: "var(--font-jetbrains-mono), monospace", flex: "none" }}>+</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: 24, borderRadius: 13, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#DA9877", marginBottom: 14 }}>Falls short</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {[
                  con,
                  coins.length < siteData.coinDefs.length ? `Only ${coins.length} of the ${siteData.coinDefs.length} coins we track accepted on the cashier.` : null,
                  cutSlots.length > 0 ? `${cutSlots.join(", ")} ${cutSlots.length === 1 ? "ships" : "ship"} at a reduced RTP here.` : null,
                  // Sourced: the spec sheet confirms geo-blocking is active. The
                  // exact country list isn't independently checked, so it isn't named.
                  "Geo-blocking is enforced — check the restricted-country list in the terms before depositing.",
                ]
                  .filter((x): x is string => Boolean(x))
                  .map((c) => (
                    <div key={c} style={{ display: "flex", gap: 11, fontSize: 14, lineHeight: 1.5, color: "#B7C4CB" }}>
                      <span style={{ color: "#DA9877", fontFamily: "var(--font-jetbrains-mono), monospace", flex: "none" }}>−</span>
                      <span>{c}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <SectionHeading
            title={readingRows.length > 0 ? "Slots we tested here" : "Slot RTP here"}
            sub={
              readingRows.length > 0
                ? "RTP as shipped in Roobet's own build, read from the in-client paytable, against the studio's published figure."
                : "Not yet checked. Reading Roobet's own build needs a paytable read inside a funded account, which we haven't done — see how we source information."
            }
          />
          <div style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 13, overflow: "hidden", background: "#0C1013", marginBottom: 38 }}>
            {readingRows.map((s) => (
              <div key={s.key} style={{ display: "grid", gridTemplateColumns: "minmax(160px,1.4fr) minmax(120px,1fr) 92px 92px", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ padding: "14px 18px", fontSize: 13.5, fontWeight: 600, color: "#B7C4CB" }}>{s.name}</div>
                <div style={{ padding: "14px 18px", fontSize: 13, color: "#7B8A93" }}>{s.provider}</div>
                <div style={{ padding: "14px 18px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: "#E8EDF0" }}>{s.here}</div>
                <div style={{ padding: "14px 18px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: s.deltaColor }}>{s.delta}</div>
              </div>
            ))}
            {readingRows.length === 0 && (
              <div style={{ padding: "14px 18px", fontSize: 13.5, color: "#7B8A93", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                No RTP readings from Roobet&apos;s client yet.
              </div>
            )}
            <div style={{ padding: "13px 18px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, color: "#5C6A72" }}>
              {readingRows.length > 0 ? "Left column: RTP here · right: difference vs the studio's published RTP" : "Per-build RTP appears here once we read it in a funded account"}
            </div>
          </div>

          {bonusFacts.length > 0 && (
            <>
              <SectionHeading title="Bonus terms, in full" sub="Read from Roobet's own terms and bonus policy — each row links to the page it came from." />
              <div style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 13, overflow: "hidden", background: "#0C1013", marginBottom: 38 }}>
                {bonusFacts.map((t) => (
                  <div key={t.label} style={{ display: "grid", gridTemplateColumns: "200px 1fr", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                    <div style={{ padding: "14px 18px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase", color: "#5C6A72" }}>{t.label}</div>
                    <div style={{ padding: "14px 18px", fontSize: 13.5, lineHeight: 1.5, color: "#B7C4CB" }}>
                      {t.value}
                      {t.sourceUrl && (
                        <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ marginLeft: 8, fontSize: 11.5, color: "#5FE3E8" }}>
                          {new URL(t.sourceUrl).hostname.replace(/^www./, "")} ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <h2 style={{ margin: "0 0 20px", fontSize: 28, letterSpacing: "-.028em", fontWeight: 800, fontStretch: "112%", color: "#E8EDF0" }}>Questions readers ask</h2>
          <div style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 13, overflow: "hidden", background: "#0C1013" }}>
            {faqData.map((q, i) => (
              <div key={q.q} style={{ borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                <button
                  type="button"
                  onClick={() => setFaq(faq === i ? null : i)}
                  style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "17px 20px", border: 0, background: "transparent", textAlign: "left", fontSize: 15, fontWeight: 600, color: "#E8EDF0" }}
                >
                  <span style={{ flex: 1 }}>{q.q}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 15, color: "#00C2CC", flex: "none" }}>{faq === i ? "−" : "+"}</span>
                </button>
                {faq === i && <div style={{ padding: "0 20px 20px", fontSize: 14.5, lineHeight: 1.65, color: "#93A3AC", maxWidth: "70ch" }}>{q.a}</div>}
              </div>
            ))}
          </div>
        </div>

        <aside style={{ position: "sticky", top: 110, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ padding: 20, borderRadius: 13, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#5C6A72", marginBottom: 14 }}>At a glance</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { k: "Launched", v: "2019" },
                { k: "Licence", v: licenceFact?.value ?? roobet.licence },
                { k: "Coins", v: String(coins.length) },
                { k: "Games", v: "4,200+" },
                { k: "Sportsbook", v: roobet.sports ? "Yes" : "No" },
                { k: "Esports", v: roobet.esports ? "Yes" : "No" },
                // Min deposit/withdrawal need a funded account to confirm
                // (they're per-coin, shown only in the logged-in cashier) —
                // left out rather than shown as "—" until that's real.
                ...(minDeposit ? [{ k: "Min deposit", v: minDeposit.value! }] : []),
                ...(minWithdrawal ? [{ k: "Min withdrawal", v: minWithdrawal.value! }] : []),
                { k: "Live chat", v: "24/7" },
              ].map((g) => (
                <div key={g.k} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12.5 }}>
                  <span style={{ color: "#5C6A72" }}>{g.k}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", color: "#E8EDF0", textAlign: "right" }}>{g.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: 20, borderRadius: 13, background: "#0E1316", border: "1px solid rgba(255,255,255,.09)" }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#FFCC00", marginBottom: 10 }}>Roobet in brief</div>
            <p style={{ margin: "0 0 16px", fontSize: 13.5, lineHeight: 1.55, color: "#93A3AC" }}>
              Instant withdrawals by its own account, no fee on crypto withdrawals, and no wagering multiplier on rakeback — all cited in the spec sheet.
            </p>
            <a href="https://roobet.com" target="_blank" rel="nofollow sponsored noopener" style={{ display: "block", textAlign: "center", padding: 12, borderRadius: 8, background: "#FFCC00", color: "#1A1400", fontSize: 13, fontWeight: 700 }}>Visit Roobet</a>
          </div>
          <div style={{ padding: 20, borderRadius: 13, background: "#0F1417", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#5C6A72", marginBottom: 12 }}>Also fast, by stated withdrawal time</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {alsoConsidered.map((o) => (
                <Link key={o.slug} href={`/casinos/${o.slug}`} className="hover:!text-accent" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#B7C4CB" }}>
                  <div style={{ width: 22, height: 22, flex: "none" }}>
                    <BrandMark slug={o.slug} mono={o.mono} tint={tintFor(o.slug)} fontSize={8} />
                  </div>
                  <span style={{ flex: 1 }}>{o.name}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#5C6A72" }}>{payoutView(o).label}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Chip({ label, bg, border, color }: { label: string; bg: string; border: string; color: string }) {
  return (
    <span style={{ padding: "5px 10px", borderRadius: 5, background: bg, border: `1px solid ${border}`, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", color }}>
      {label}
    </span>
  );
}

function SectionHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <>
      <h2 style={{ margin: "0 0 8px", fontSize: 28, letterSpacing: "-.028em", fontWeight: 800, fontStretch: "112%", color: "#E8EDF0" }}>{title}</h2>
      <p style={{ margin: "0 0 20px", fontSize: 15, color: "#8DA0AA" }}>{sub}</p>
    </>
  );
}

function Measurement({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div style={{ padding: "20px 22px", background: "#0C1013" }}>
      <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".07em", textTransform: "uppercase", color: "#5C6A72", marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 24, fontWeight: 500, color: "#E8EDF0", letterSpacing: "-.02em", marginBottom: 5 }}>{value}</div>
      <div style={{ fontSize: 12.5, color: "#7B8A93" }}>{note}</div>
    </div>
  );
}
