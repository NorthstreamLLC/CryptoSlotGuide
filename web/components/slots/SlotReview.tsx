import Link from "next/link";
import Image from "next/image";
import type { SlotReview as Review } from "@/lib/slot-reviews";
import { REVIEW_BYLINE, reviewDate } from "@/lib/slot-reviews";
import type { SlotReviewFacts } from "@/lib/slot-page";

/**
 * The long-form review on one of the thirteen picks: our score, the verdict,
 * every figure we hold on the title in one strip, then the argument in
 * sections. Sits under the spec page on both page kinds, so a reader gets the
 * sheet first and the opinion second, in that order.
 *
 * The score is ours and the heading says so. The byline is the games desk,
 * not a person. A review that describes mechanics names the studio page they
 * are described from, and a review without one does not describe them.
 */
const MONO = "var(--font-jetbrains-mono), monospace";

function Score({ value }: { value: number }) {
  // A ring for the score, the arc proportional to it. 9.4 reads as 9.4 — the
  // number is the thing, the ring is only so the eye finds it.
  const r = 34;
  const c = 2 * Math.PI * r;
  const frac = Math.max(0, Math.min(1, value / 10));
  return (
    <div style={{ position: "relative", width: 92, height: 92, flex: "0 0 auto" }} aria-label={`Our score ${value.toFixed(1)} out of 10`}>
      <svg width="92" height="92" viewBox="0 0 92 92" style={{ transform: "rotate(-90deg)" }} aria-hidden>
        <circle cx="46" cy="46" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="6" />
        <circle cx="46" cy="46" r={r} fill="none" stroke="#FFC531" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${c * frac} ${c}`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.04em", color: "#fff", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{value.toFixed(1)}</span>
        <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".08em", color: "#8E9CA5", marginTop: 3 }}>/ 10</span>
      </div>
    </div>
  );
}

export function SlotReview({ slug, review, facts }: { slug: string; review: Review; facts: SlotReviewFacts }) {
  const host = (() => {
    if (!review.featureSource) return null;
    try {
      return new URL(review.featureSource).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  })();

  return (
    <section id="review" style={{ scrollMarginTop: 110, maxWidth: 1100, margin: "0 auto", padding: "44px 40px 0" }}>
      <div data-reveal style={{ borderRadius: 18, border: "1px solid rgba(255,197,49,.22)", background: "radial-gradient(90% 70% at 0% 0%, rgba(255,197,49,.08), transparent 60%), #0C1013", overflow: "hidden" }}>
        {/* header: score + verdict */}
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap", padding: "28px 30px 24px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <Score value={review.score} />
          <div style={{ flex: "1 1 420px", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".09em", textTransform: "uppercase", color: "#FFC531" }}>Our review</span>
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".05em", color: "#6E7A82" }}>
                {REVIEW_BYLINE} · read {reviewDate(review.read)}
              </span>
            </div>
            <h2 style={{ margin: "0 0 10px", fontSize: 26, lineHeight: 1.15, letterSpacing: "-.03em", fontWeight: 800, color: "#fff", textWrap: "balance" }}>
              {facts.name}: our verdict
            </h2>
            <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.6, color: "#C9D3D9", maxWidth: "70ch", textWrap: "pretty" }}>{review.verdict}</p>
          </div>
          {facts.art && (
            <Image
              src={facts.art}
              alt={`${facts.name} game art`}
              width={480}
              height={288}
              sizes="200px"
              style={{ width: 200, height: 120, objectFit: "cover", borderRadius: 12, border: "1px solid rgba(255,255,255,.09)", flex: "0 0 auto" }}
            />
          )}
        </div>

        {/* every figure we hold: the returns first, as chips, then one even row of the rest */}
        {facts.stats.length > 0 && (() => {
          const rtp = facts.stats.find((x) => /return|rtp/i.test(x.k));
          const rest = facts.stats.filter((x) => x !== rtp);
          const builds = rtp ? rtp.v.split(/\s*·\s*/).filter(Boolean) : [];
          return (
            <div style={{ padding: "22px 30px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", flexDirection: "column", gap: 20 }}>
              {rtp && (
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#8E9CA5", marginBottom: 9 }}>{rtp.k}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    {builds.map((b, i) => (
                      <span
                        key={b + i}
                        style={{
                          padding: "7px 13px",
                          borderRadius: 100,
                          fontFamily: MONO,
                          fontSize: i === 0 ? 15 : 13,
                          fontWeight: 700,
                          fontVariantNumeric: "tabular-nums",
                          color: i === 0 ? "#141007" : "#C3CFD5",
                          background: i === 0 ? "#FFC531" : "rgba(255,255,255,.05)",
                          border: i === 0 ? "none" : "1px solid rgba(255,255,255,.1)",
                        }}
                      >
                        {b}
                      </span>
                    ))}
                    {builds.length > 1 && <span style={{ fontSize: 12.5, color: "#8E9CA5", marginLeft: 4 }}>Best build highlighted; the lobby doesn&apos;t say which one is loaded.</span>}
                  </div>
                </div>
              )}
              {rest.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px 0" }}>
                  {rest.map((x, i) => (
                    <div key={x.k} style={{ display: "flex", flexDirection: "column", gap: 4, padding: i === 0 ? "0 26px 0 0" : "0 26px", borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,.08)", minWidth: 0 }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#8E9CA5", whiteSpace: "nowrap" }}>{x.k}</span>
                      <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-.01em", color: "#fff", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{x.v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* the argument: each section its own panel */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14, padding: "24px 30px 26px" }}>
          {review.sections.map((sec, i) => (
            <div key={sec.title} data-reveal style={{ ["--reveal-delay" as string]: `${i * 60}ms`, minWidth: 0, padding: "18px 20px", borderRadius: 14, background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.06)" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 10px", fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: ".09em", textTransform: "uppercase", color: "#FFC531" }}>
                <span style={{ width: 18, height: 2, borderRadius: 2, background: "#FFC531", flex: "none" }} />
                {sec.title}
              </h3>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "#B7C4CB", textWrap: "pretty" }}>{sec.body}</p>
            </div>
          ))}
        </div>

        {/* where it came from, where to go */}
        <div style={{ display: "flex", gap: "10px 12px", flexWrap: "wrap", alignItems: "center", padding: "16px 30px 18px", borderTop: "1px solid rgba(255,255,255,.06)", background: "rgba(0,0,0,.18)" }}>
          <span style={{ flex: "1 1 320px", fontFamily: MONO, fontSize: 10.5, lineHeight: 1.6, letterSpacing: ".03em", color: "#6E7A82" }}>
            {review.featureSource && host ? (
              <>
                Mechanics from{" "}
                <a href={review.featureSource} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#8DA0AA" }}>
                  {facts.studio ?? "the studio"}&rsquo;s game page
                </a>{" "}
                ({host}); figures from the studio&rsquo;s own data.
              </>
            ) : (
              <>Figures from the studio&rsquo;s own data; the score is ours.</>
            )}
          </span>
          {facts.demoUrl && (
            <a href={facts.demoUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ padding: "8px 14px", borderRadius: 100, border: "1px solid rgba(95,227,232,.35)", color: "#5FE3E8", fontFamily: MONO, fontSize: 11, letterSpacing: ".04em" }}>
              Studio demo ↗
            </a>
          )}
          {facts.seLink && (
            <a href={facts.seLink} target="_blank" rel="noopener noreferrer" style={{ padding: "8px 14px", borderRadius: 100, border: "1px solid rgba(255,255,255,.12)", color: "#A8B6BE", fontFamily: MONO, fontSize: 11, letterSpacing: ".04em" }}>
              {facts.seLabel} ↗
            </a>
          )}
          <Link href="/slots" style={{ padding: "8px 14px", borderRadius: 100, border: "1px solid rgba(255,197,49,.3)", background: "rgba(255,197,49,.08)", color: "#FFC531", fontFamily: MONO, fontSize: 11, letterSpacing: ".04em" }}>
            All 13 picks →
          </Link>
          <span hidden data-slug={slug} />
        </div>
      </div>
    </section>
  );
}
