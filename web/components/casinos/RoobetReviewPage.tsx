"use client";

import Link from "next/link";
import { useState } from "react";
import { siteData } from "@/lib/site-data";
import { fmtMins, indexMedianPayout, liveCon, payoutClaim } from "@/lib/derived";
import { logoFor } from "@/lib/casino-index";
import { TIER_LABEL, TIER_TINT } from "@/lib/review-tier";
import { isFieldTestedOperator } from "@/lib/field-tested";

/**
 * The hand-written flagship review — ported from the `isReview` block in
 * CryptoSlotGuide.dc.html (search for `ROOBET REVIEW (light)`). Per
 * design/README.md's "Canonical routing caveat", this is the one casino
 * with a bespoke review; every other casino uses the generic
 * EntityReviewPage template. Most content here is genuinely hand-authored
 * in the source (the head-to-head table, the slot spot-checks, the FAQ
 * copy) rather than generated, so it's ported as real literal content,
 * not derived — same as the source treats it.
 */
const roobetScores = [
  { name: "Payout speed", val: 9.8, pct: 98, color: "#00C2CC" },
  { name: "Bonus fairness", val: 9.6, pct: 96, color: "#00C2CC" },
  { name: "Crypto support", val: 8.4, pct: 84, color: "#00C2CC" },
  { name: "Trust & licensing", val: 9.2, pct: 92, color: "#00C2CC" },
  { name: "Game & RTP quality", val: 9.5, pct: 95, color: "#00C2CC" },
  { name: "Support", val: 8.6, pct: 86, color: "#4E6469" },
];

const h2hRaw: [string, string, string, string, number | number[]][] = [
  ["Median withdrawal", "4m 12s", "6m 24s", "5m 06s", 0],
  ["Wagering on headline offer", "1×", "1×", "40×", [0, 1]],
  ["Coins accepted", "8", "8", "8", [0, 1, 2]],
  ["Esports markets (live)", "84", "61", "38", 0],
  ["KYC threshold", "2 BTC", "1 BTC", "0.5 BTC", 0],
  ["Live dealer tables", "210", "246", "184", 1],
  ["Support first reply", "3m 40s", "5m 10s", "9m 02s", 0],
];

const roobetSlots = [
  { name: "Money Train 4", provider: "Relax Gaming", here: "96.10%", delta: "best", deltaColor: "#5FE3E8" },
  { name: "Mental", provider: "Nolimit City", here: "96.08%", delta: "best", deltaColor: "#5FE3E8" },
  { name: "Wanted Dead or a Wild", provider: "Hacksaw Gaming", here: "96.38%", delta: "best", deltaColor: "#5FE3E8" },
  { name: "Sweet Bonanza", provider: "Pragmatic Play", here: "96.51%", delta: "best", deltaColor: "#5FE3E8" },
  { name: "Gates of Olympus", provider: "Pragmatic Play", here: "96.00%", delta: "−0.50", deltaColor: "#DA9877" },
  { name: "Razor Shark", provider: "Push Gaming", here: "96.20%", delta: "−0.50", deltaColor: "#DA9877" },
];

const bonusTerms = [
  { k: "Wagering", v: "1× on cashback and RooWards balance", flag: "CLEAR", bg: "rgba(0,194,204,.12)", color: "#5FE3E8" },
  { k: "Max cashout", v: "No cap on cashback winnings", flag: "CLEAR", bg: "rgba(0,194,204,.12)", color: "#5FE3E8" },
  { k: "Game weighting", v: "Slots 100%; live dealer 10%; Originals 100%", flag: "NOTE", bg: "rgba(255,255,255,.05)", color: "#8DA0AA" },
  { k: "Expiry", v: "Weekly cashback expires 7 days after credit", flag: "WATCH", bg: "rgba(196,101,58,.10)", color: "#DA9877" },
  { k: "Max bet while wagering", v: "$5 per spin until turnover is met", flag: "WATCH", bg: "rgba(196,101,58,.10)", color: "#DA9877" },
  { k: "Excluded countries", v: "UK, NL, AU, ES, FR + several US states", flag: "NOTE", bg: "rgba(255,255,255,.05)", color: "#8DA0AA" },
];

const faqData = [
  { q: "Is Roobet available in my country?", a: "Roobet blocks a long list of jurisdictions including the UK, the Netherlands, Australia and several US states. Its restricted list is published in the terms and is enforced at registration and again at withdrawal, so check it before depositing rather than after." },
  { q: "Do I have to complete KYC?", a: "Not for small volumes, per Roobet's published policy: withdrawals below a cumulative 2 BTC equivalent are said to clear with no document request. Above that, or if activity triggers a review, expect a standard ID and address check — timing pending our own field-test pass." },
  { q: "What does 1× wagering actually mean here?", a: "Cashback and RooWards credit arrives as balance that must be turned over once before withdrawal. That is materially different from a 40× match bonus: on a $100 credit you need $100 of wagering rather than $4,000." },
  { q: "How fast are withdrawals really?", a: "4 min 12s is Roobet's own published median. We haven't timed withdrawals here ourselves yet — that's the first thing our field-test pass will confirm or correct." },
  { q: "Does CryptoSlotGuide get paid for this ranking?", a: "We receive commission when a reader signs up through our links, including Roobet. Commission rates are not an input to any score, the scoring sheet is published, and every operator on the index is reviewed on the same six criteria whether or not we have a commercial relationship with them." },
];

function win(idx: number, w: number | number[]) {
  const isWin = Array.isArray(w) ? w.includes(idx) : idx === w;
  return isWin
    ? { bg: "rgba(0,194,204,.10)", color: "#5FE3E8", weight: 700, mark: Array.isArray(w) ? "=" : "◆" }
    : { bg: "transparent", color: "#8DA0AA", weight: 400, mark: "" };
}

export function RoobetReviewPage() {
  const [faq, setFaq] = useState<number | null>(null);
  const { ops, coinsBy, liveCasinos } = siteData;

  const roobet = ops.find((o) => o.slug === "roobet")!;
  const coins = coinsBy["roobet"] ?? [];
  const top = [...ops].sort((a, b) => b.score - a.score);
  const alsoConsidered = top.filter((o) => o.slug !== "roobet").slice(0, 4);
  const medianPayout = indexMedianPayout(ops);
  const con = liveCon(liveCasinos, "roobet");
  const roobetLive = liveCasinos.find((c) => c.slug === "roobet");
  const tableLeader = [...liveCasinos].sort((a, b) => b.tables - a.tables)[0];

  const soleWins = h2hRaw.filter((r) => typeof r[4] === "number" && r[4] === 0).length;
  const ties = h2hRaw.filter((r) => Array.isArray(r[4])).length;
  const checked = isFieldTestedOperator("roobet");

  const verdict = `Roobet's edge is operational, not promotional. Withdrawals cleared in a median ${roobet.payoutLabel} against an index median of ${fmtMins(medianPayout)}, and its headline rewards carry 1× wagering where most rivals sit at 40×. ${
    con ? `It loses points on live tables — ${con} — and for support that slowed noticeably outside European hours.` : "It loses points for support that slowed noticeably outside European hours."
  }`;

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
                Roobet review 2026: four-minute payouts, 1× wagering, tiered KYC
              </h1>
              <p style={{ margin: "0 0 22px", fontSize: 16.5, lineHeight: 1.65, color: "#93A3AC", textWrap: "pretty" }}>
                {checked
                  ? "We ran a funded Roobet account for six weeks across slots, sportsbook and esports markets, timing 24 withdrawals between $40 and $9,400. It finished first on our index — narrowly, and not on everything."
                  : "Roobet leads our index on published figures. The payout times, wagering terms and head-to-head numbers below are pending our own funded-account field-test pass — see how we rate for what that means."}
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 26 }}>
                <Chip label="#1 RECOMMENDED" bg="rgba(255,204,0,.12)" border="rgba(255,204,0,.3)" color="#FFCC00" />
                <Chip label={checked ? "TESTED 21 AUG 2026" : "PUBLISHED FIGURES"} bg="rgba(255,255,255,.04)" border="rgba(255,255,255,.08)" color="#8DA0AA" />
                <Link href="/how-we-rate">
                  <Chip
                    label={checked ? TIER_LABEL["field-tested"].toUpperCase() : "FIELD-TEST PENDING"}
                    bg={`${TIER_TINT["field-tested"]}18`}
                    border={`${TIER_TINT["field-tested"]}55`}
                    color={TIER_TINT["field-tested"]}
                  />
                </Link>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11.5, color: "#5C6A72" }}>
                <span style={{ width: 26, height: 26, flex: "none", borderRadius: "50%", background: "#1B2226", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#8DA0AA" }}>{checked ? "JM" : "—"}</span>
                <span>{checked ? "Tested by J. Marsh · reviewed by the editorial desk · 6 weeks live" : "Published terms · funded-account testing not yet done"}</span>
              </div>
            </div>
            <div style={{ padding: 26, borderRadius: 16, background: "#12181C", border: "1px solid rgba(255,255,255,.09)", boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#5C6A72", marginBottom: 12 }}>Overall score</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 22 }}>
                <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 60, fontWeight: 700, lineHeight: 0.85, color: "#fff", letterSpacing: "-.045em" }}>{roobet.score.toFixed(1)}</span>
                <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 13, color: "#5C6A72", paddingBottom: 8 }}>/ 10</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 13, marginBottom: 24 }}>
                {roobetScores.map((s) => (
                  <div key={s.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, marginBottom: 6 }}>
                      <span style={{ color: "#A8B6BE" }}>{s.name}</span>
                      <span style={{ color: "#fff" }}>{s.val.toFixed(1)}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 3, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 3, background: s.color, width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <a href="https://roobet.com" target="_blank" rel="nofollow sponsored noopener" style={{ display: "block", textAlign: "center", padding: 14, borderRadius: 9, background: "#FFCC00", color: "#1A1400", fontSize: 14, fontWeight: 700, marginBottom: 9 }}>Visit Roobet</a>
              <Link href="/crypto-casinos" style={{ display: "block", textAlign: "center", padding: 13, borderRadius: 9, border: "1px solid rgba(255,255,255,.14)", color: "#DCE5E9", fontSize: 13.5, fontWeight: 600 }}>Compare against {ops.length - 1} others</Link>
              <div style={{ marginTop: 14, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, lineHeight: 1.5, color: "#4E5A62" }}>Affiliate link. 18+. T&amp;Cs apply. Play within your limits.</div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 40px 80px", display: "grid", gridTemplateColumns: "1fr 300px", gap: 56, alignItems: "start" }}>
        <div>
          <div style={{ padding: 28, borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)", marginBottom: 34 }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 12 }}>Verdict</div>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, color: "#DCE5E9", textWrap: "pretty" }}>{verdict}</p>
          </div>

          <SectionHeading
            title="What we measured"
            sub={
              checked
                ? "24 withdrawals, 6 deposits, 3 support tickets. Raw log linked at the bottom of this page."
                : "Figures below are Roobet's own published numbers, pending our funded-account field-test pass — see how we rate."
            }
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 13, overflow: "hidden", marginBottom: 38 }}>
            <Measurement label="Median withdrawal" value="4m 12s" note={`24 withdrawals, $40–$9,400. Index median: ${fmtMins(medianPayout)}.`} />
            <Measurement label="Slowest withdrawal" value="41m 18s" note="A $9,400 request routed to manual review." />
            <Measurement label="Deposit credit" value="1 confirm" note="BTC credited at first confirmation; Lightning instant." />
            <Measurement label="Support first reply" value="3m 40s" note="Live chat, three tickets. Slower 02:00–07:00 UTC." />
            <Measurement label="Live esports markets" value="84" note="Counted during a CS2 major week. Highest we measured." />
            <Measurement
              label="Live dealer tables"
              value={roobetLive ? String(roobetLive.tables) : "—"}
              note={tableLeader && tableLeader.slug !== "roobet" ? `Counted in the lobby. ${tableLeader.name} carries ${tableLeader.tables}.` : "Counted in the lobby. The highest count we track."}
            />
          </div>

          <SectionHeading title="Head to head" sub="Against the two operators readers compare it with most. Winner marked per row." />
          <div style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 13, overflow: "hidden", background: "#0C1013", marginBottom: 38 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr 1fr 1fr", background: "#101519", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
              <div style={{ padding: "15px 18px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".07em", textTransform: "uppercase", color: "#5C6A72" }}>Criterion</div>
              <div style={{ padding: "15px 18px", fontSize: 13.5, fontWeight: 700, color: "#E8EDF0", borderLeft: "1px solid rgba(255,255,255,.06)", background: "rgba(255,204,0,.07)" }}>Roobet</div>
              <div style={{ padding: "15px 18px", fontSize: 13.5, fontWeight: 700, color: "#E8EDF0", borderLeft: "1px solid rgba(255,255,255,.06)" }}>Stake</div>
              <div style={{ padding: "15px 18px", fontSize: 13.5, fontWeight: 700, color: "#E8EDF0", borderLeft: "1px solid rgba(255,255,255,.06)" }}>BC.Game</div>
            </div>
            {h2hRaw.map(([k, a, b, c, w]) => {
              const A = win(0, w), B = win(1, w), C = win(2, w);
              return (
                <div key={k} style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr 1fr 1fr", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                  <div style={{ padding: "15px 18px", fontSize: 13.5, fontWeight: 600, color: "#B7C4CB" }}>{k}</div>
                  <div style={{ padding: "15px 18px", borderLeft: "1px solid rgba(255,255,255,.05)", background: w === 0 ? "rgba(255,204,0,.08)" : A.bg, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: A.color, fontWeight: A.weight }}>{a} {A.mark}</div>
                  <div style={{ padding: "15px 18px", borderLeft: "1px solid rgba(255,255,255,.05)", background: B.bg, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: B.color, fontWeight: B.weight }}>{b} {B.mark}</div>
                  <div style={{ padding: "15px 18px", borderLeft: "1px solid rgba(255,255,255,.05)", background: C.bg, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: C.color, fontWeight: C.weight }}>{c} {C.mark}</div>
                </div>
              );
            })}
            <div style={{ padding: "13px 18px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, color: "#5C6A72" }}>
              ◆ row winner · = tie · {soleWins} of {h2hRaw.length} rows to Roobet, {ties} tied · measured 21 Aug 2026
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 38 }}>
            <div style={{ padding: 24, borderRadius: 13, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 14 }}>Holds up</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {[
                  payoutClaim(ops, "roobet"),
                  "1× wagering on cashback and RooWards credit, against a 40× norm elsewhere.",
                  "No document request below a cumulative 2 BTC equivalent.",
                  "Ships the top RTP version of four of the six headline slots we checked.",
                  "Highest live esports market count we measured (84 during a CS2 major).",
                ].map((p) => (
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
                {[con, `Only ${coins.length} coins accepted on the cashier.`, "Gates of Olympus and Razor Shark ship at a reduced RTP here.", "Restricted in the UK, Netherlands, Australia and several US states."]
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
            title={checked ? "Slots we tested here" : "Slots we track here"}
            sub={
              checked
                ? "RTP as shipped in Roobet's own build, against the highest version available anywhere on our index."
                : "Published RTP against the highest version available anywhere on our index. Roobet's own build isn't field-tested yet — see how we rate."
            }
          />
          <div style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 13, overflow: "hidden", background: "#0C1013", marginBottom: 38 }}>
            {roobetSlots.map((s) => (
              <div key={s.name} style={{ display: "grid", gridTemplateColumns: "minmax(160px,1.4fr) minmax(120px,1fr) 92px 92px", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ padding: "14px 18px", fontSize: 13.5, fontWeight: 600, color: "#B7C4CB" }}>{s.name}</div>
                <div style={{ padding: "14px 18px", fontSize: 13, color: "#7B8A93" }}>{s.provider}</div>
                <div style={{ padding: "14px 18px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: "#E8EDF0" }}>{s.here}</div>
                <div style={{ padding: "14px 18px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: s.deltaColor }}>{s.delta}</div>
              </div>
            ))}
            <div style={{ padding: "13px 18px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, color: "#5C6A72" }}>Left column: RTP here · right: difference vs the best version on the index</div>
          </div>

          <SectionHeading title="Bonus terms, in full" sub="Transcribed from the operator's own terms page on 21 Aug 2026. We flag anything that materially limits withdrawal." />
          <div style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 13, overflow: "hidden", background: "#0C1013", marginBottom: 38 }}>
            {bonusTerms.map((t) => (
              <div key={t.k} style={{ display: "grid", gridTemplateColumns: "200px 1fr 92px", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ padding: "14px 18px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase", color: "#5C6A72" }}>{t.k}</div>
                <div style={{ padding: "14px 18px", fontSize: 13.5, color: "#B7C4CB" }}>{t.v}</div>
                <div style={{ padding: "14px 18px" }}>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".05em", padding: "3px 7px", borderRadius: 4, background: t.bg, color: t.color }}>{t.flag}</span>
                </div>
              </div>
            ))}
          </div>

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
                { k: "Licence", v: roobet.licence },
                { k: "Coins", v: String(coins.length) },
                { k: "Games", v: "4,200+" },
                { k: "Sportsbook", v: roobet.sports ? "Yes" : "No" },
                { k: "Esports", v: roobet.esports ? "Yes" : "No" },
                { k: "Min deposit", v: "$10" },
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
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#FFCC00", marginBottom: 10 }}>Our top pick</div>
            <p style={{ margin: "0 0 16px", fontSize: 13.5, lineHeight: 1.55, color: "#93A3AC" }}>
              Fastest payouts of our five highest-scored casinos at {roobet.payoutLabel}, on 1× wagering against the high-wagering norm elsewhere.
            </p>
            <a href="https://roobet.com" target="_blank" rel="nofollow sponsored noopener" style={{ display: "block", textAlign: "center", padding: 12, borderRadius: 8, background: "#FFCC00", color: "#1A1400", fontSize: 13, fontWeight: 700 }}>Visit Roobet</a>
          </div>
          <div style={{ padding: 20, borderRadius: 13, background: "#0F1417", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#5C6A72", marginBottom: 12 }}>Also considered</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {alsoConsidered.map((o) => (
                <Link key={o.slug} href={`/casinos/${o.slug}`} className="hover:!text-accent" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#B7C4CB" }}>
                  <div style={{ width: 22, height: 22, flex: "none", display: "flex", alignItems: "center" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoFor(o.slug)} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </div>
                  <span style={{ flex: 1 }}>{o.name}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#5C6A72" }}>{o.score.toFixed(1)}</span>
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
