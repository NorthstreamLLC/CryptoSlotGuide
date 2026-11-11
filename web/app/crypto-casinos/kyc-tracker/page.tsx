import Link from "next/link";
import { getSpecFact } from "@/lib/spec-sheet";
import { brandFor } from "@/lib/casino-facts";
import { reviewPath } from "@/lib/outbound";
import { siteData } from "@/lib/site-data";
import { kycByTier, kycCounts, kycRows, kycTierDescription, KYC_TIER_LABEL, KYC_TIER_ORDER, type KycTier } from "@/lib/kyc";
import { pageMetadata } from "@/lib/seo";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandMark } from "@/components/ui/BrandMark";
import { AuthorByline, AuthorBox } from "@/components/ui/AuthorBox";
import { NextSteps } from "@/components/layout/NextSteps";

/**
 * When each crypto casino says it will ask for ID: a citable index of the
 * hand-checked KYC tiers in data/kyc-tiers.json (see lib/kyc.ts), each row
 * with the casino's own wording and the page it is on. Rows follow the tiers;
 * the policy text and source come from the "Compliance / KYC policy" fact.
 */
const PATH = "/crypto-casinos/kyc-tracker";
const TITLE = "Crypto casino KYC tracker: when each casino asks for ID";
const PUBLISHED = "2026-11-11";

const TONE: Record<KycTier, { c: string; bg: string }> = {
  required: { c: "#FF7E7E", bg: "rgba(255,126,126,.12)" },
  threshold: { c: "#FFC531", bg: "rgba(255,197,49,.12)" },
  conflicting: { c: "#FF9F5A", bg: "rgba(255,159,90,.14)" },
  discretionary: { c: "#5FE3E8", bg: "rgba(95,227,232,.12)" },
  never: { c: "#57E39A", bg: "rgba(87,227,154,.12)" },
};

const fmtDate = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const asOf = (slug: string) => getSpecFact(slug, "Compliance", "KYC policy")?.asOf;
const mono = (slug: string) => siteData.ops.find((o) => o.slug === slug)?.mono ?? slug.slice(0, 2).toUpperCase();

export function generateMetadata() {
  const c = kycCounts();
  const n = kycRows().length;
  return pageMetadata(
    TITLE,
    `Of ${n} crypto casinos, ${c.required} make ID checks a step to play or withdraw, ${c.threshold} verify at a published trigger, ${c.discretionary} ask only at their discretion and ${c.never} says it never asks. Each with the casino's own wording and source.`,
    PATH
  );
}

const CSS = `
.kt-wrap { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
.kt-narrow { max-width: 760px; }
.kt-crumb { font-size: 13px; color: #6F7C84; margin-bottom: 24px; }
.kt-crumb a { color: #8E9CA4; }
.kt-h1 { margin: 0 0 16px; font-size: clamp(34px, 4.4vw, 50px); line-height: 1.06; letter-spacing: -.04em; font-weight: 700; color: #F7F9FA; text-wrap: balance; }
.kt-lead { margin: 0 0 22px; max-width: 64ch; font-size: 17.5px; line-height: 1.6; color: #98A6AE; }
.kt-answer { margin: 28px 0 0; padding: 20px 22px; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; background: #0D1114; box-shadow: inset 0 2px 0 #FFC531; }
.kt-answer b { display: block; margin-bottom: 6px; font-size: 15px; color: #F2F5F7; }
.kt-answer p { margin: 0; font-size: 15px; line-height: 1.65; color: #B7C4CB; }
.kt-sec { padding-top: 56px; }
.kt-h2 { margin: 0 0 8px; font-size: 26px; letter-spacing: -.025em; font-weight: 700; color: #F2F5F7; }
.kt-sub { margin: 0 0 18px; max-width: 72ch; font-size: 15px; line-height: 1.6; color: #8E9CA4; }
.kt-p { margin: 0 0 14px; font-size: 16px; line-height: 1.7; color: #C9D3D8; }
.kt-tiers { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; }
.kt-tier { display: block; padding: 14px 16px; border-radius: 13px; background: #0D1114; border: 1px solid rgba(255,255,255,.08); }
.kt-tier b { display: block; font-size: 24px; font-weight: 700; color: #F2F5F7; font-variant-numeric: tabular-nums; }
.kt-tier span { display: block; margin-top: 4px; font-size: 13px; line-height: 1.4; }
.kt-box { border: 1px solid rgba(255,255,255,.08); border-radius: 16px; background: #0D1114; overflow: hidden; }
.kt-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 2.2fr) 92px; gap: 16px; align-items: start; padding: 14px 18px; font-size: 14px; line-height: 1.55; color: #C9D3D8; }
.kt-row + .kt-row { border-top: 1px solid rgba(255,255,255,.06); }
.kt-head { font-size: 12px; color: #75828A; padding-top: 12px; padding-bottom: 12px; }
.kt-name { display: flex; align-items: center; gap: 10px; min-width: 0; font-weight: 600; color: #F2F5F7; }
.kt-name:hover { text-decoration: underline; text-underline-offset: 3px; }
.kt-cell small { display: none; }
.kt-src { font-size: 12px; color: #5FE3E8; }
.kt-group { padding: 12px 18px; font-size: 13px; font-weight: 700; letter-spacing: .02em; border-top: 1px solid rgba(255,255,255,.08); background: rgba(255,255,255,.02); }
.kt-faq details { padding: 16px 0; border-top: 1px solid rgba(255,255,255,.08); }
.kt-faq summary { cursor: pointer; font-size: 16px; font-weight: 600; color: #F2F5F7; }
.kt-faq p { margin: 10px 0 0; font-size: 15px; line-height: 1.65; color: #98A6AE; }
@media (max-width: 900px) {
  .kt-wrap { padding: 0 16px; }
  .kt-tiers { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .kt-head { display: none; }
  .kt-row { grid-template-columns: minmax(0, 1fr); gap: 6px; padding: 14px 16px; }
  .kt-cell small { display: block; font-size: 11.5px; color: #75828A; }
}
`;

export default function Page() {
  const groups = kycByTier();
  const counts = kycCounts();
  const total = kycRows().length;
  const dates = kycRows().map((r) => asOf(r.slug)).filter((d): d is string => !!d).sort();
  const updated = [PUBLISHED, ...dates].sort().pop()!;
  const name = (slug: string) => siteData.ops.find((o) => o.slug === slug)?.name ?? slug;
  const never = groups.find((g) => g.tier === "never")?.rows.map((r) => r.name) ?? [];
  const conflicting = groups.find((g) => g.tier === "conflicting")?.rows.map((r) => r.name) ?? [];
  const faqs = [
    {
      q: "Which crypto casinos never ask for ID?",
      a: never.length
        ? `Of the ${total} we track, only ${never.join(" and ")} ${never.length === 1 ? "says" : "say"} it will never ask, at any amount. That is the casino's own claim, from its own pages. Every other casino either verifies as a step, at a published trigger, or keeps the right to ask.`
        : `None of the ${total} we track says it will never ask.`,
    },
    {
      q: "Is a \"no-KYC casino\" really no KYC?",
      a: `Usually it means no check at sign-up. ${counts.discretionary} of the ${total} casinos here run no routine check but keep the right to ask for documents, typically at withdrawal or on suspicion. Some go further: ${name("razed")} calls itself a No-KYC casino while its own AML policy says ID documents are requested when you withdraw.`,
    },
    {
      q: "What triggers a KYC check?",
      a: `It depends on the casino. ${counts.threshold} publish a trigger, such as total deposits passing a set amount or a single large withdrawal; ${counts.required} make verification a step before you can play or withdraw; the rest reserve the right without a number.`,
    },
    {
      q: "How is each casino placed?",
      a: "By hand, from each casino's own KYC, AML and terms pages, with the reason recorded for every casino. A rule-based pass over the wording was tried and misfiled casinos that say plainly they don't require KYC, so every row was read instead. Where a casino's own pages disagree, it gets its own tier rather than the friendlier answer.",
    },
  ];
  if (conflicting.length) faqs.push({ q: "Why do some casinos say \"its own pages disagree\"?", a: `Because they do: ${conflicting.join(" and ")} say different things about verification on different pages of their own sites. We record that rather than pick one.` });

  return (
    <main style={{ background: "#080B0D", color: "#E8EDF0", paddingBottom: 80 }}>
      <style>{CSS}</style>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Crypto casinos", path: "/crypto-casinos" }, { name: "KYC tracker", path: PATH }]),
          articleSchema(TITLE, `When each of ${total} crypto casinos says it will ask for ID, from its own pages.`, PATH, PUBLISHED, updated),
          faqSchema(faqs),
        ]}
      />

      <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)", background: "radial-gradient(60% 80% at 15% 0%, rgba(95,227,232,.05), transparent 70%), #0A0D10" }}>
        <div className="kt-wrap" style={{ padding: "30px 24px 44px" }}>
          <div className="kt-crumb">
            <Link href="/">Home</Link> / <Link href="/crypto-casinos">Crypto casinos</Link> / <span style={{ color: "#AEBAC1" }}>KYC tracker</span>
          </div>
          <h1 className="kt-h1">KYC tracker: when each crypto casino asks for ID</h1>
          <p className="kt-lead">&quot;No KYC&quot; on a casino&apos;s homepage rarely means never. This tracker sorts {total} crypto casinos by what their own terms and help pages say about verification, with each casino&apos;s wording and the page it is on.</p>
          <AuthorByline updated={updated} />
          <div className="kt-answer">
            <b>The short answer</b>
            <p>
              {counts.required} of {total} make verification a step to play or withdraw, {counts.threshold} check at a trigger they publish, {counts.discretionary} run no routine check but keep the right to ask, {counts.conflicting} contradict themselves across their own pages, and {counts.never} {counts.never === 1 ? "says" : "say"} it never asks{never.length ? ` (${never.join(", ")})` : ""}.
            </p>
          </div>
        </div>
      </div>

      <div className="kt-wrap">
        <section className="kt-sec">
          <div className="kt-tiers">
            {KYC_TIER_ORDER.map((t) => (
              <a key={t} href={`#tier-${t}`} className="kt-tier" style={{ boxShadow: `inset 0 2px 0 ${TONE[t].c}` }}>
                <b>{counts[t]}</b>
                <span style={{ color: TONE[t].c, fontWeight: 600 }}>{KYC_TIER_LABEL[t]}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="kt-sec">
          <h2 className="kt-h2">Every casino, strictest first</h2>
          <p className="kt-sub">The tier is our reading of the casino&apos;s own pages, with the reason. The wording and the link are the casino&apos;s; the date is when we last read it.</p>
          <div className="kt-box">
            <div className="kt-row kt-head" data-keep-grid>
              <span>Casino</span><span>What it means here</span><span>The casino&apos;s own wording</span><span>Source</span>
            </div>
            {groups.map((g) => (
              <div key={g.tier} id={`tier-${g.tier}`} style={{ scrollMarginTop: 120 }}>
                <div className="kt-group" style={{ color: TONE[g.tier].c }}>
                  {KYC_TIER_LABEL[g.tier]} · {g.rows.length}
                  <span style={{ display: "block", marginTop: 2, fontWeight: 400, letterSpacing: 0, color: "#8E9CA4" }}>{kycTierDescription(g.tier)}</span>
                </div>
                {g.rows.map((r) => (
                  <div key={r.slug} className="kt-row" data-keep-grid>
                    <Link href={reviewPath(r.slug)} className="kt-name">
                      <span style={{ width: 28, height: 28, flex: "none", borderRadius: 7, overflow: "hidden" }}>
                        <BrandMark slug={r.slug} mono={mono(r.slug)} tint={brandFor(r.slug)} radius={7} fontSize={9} />
                      </span>
                      <span style={{ minWidth: 0 }}>{r.name}</span>
                    </Link>
                    <span className="kt-cell"><small>What it means here</small>{r.why}</span>
                    <span className="kt-cell" style={{ color: "#98A6AE" }}><small>The casino&apos;s own wording</small>{r.policy ?? "—"}</span>
                    <span className="kt-cell">
                      {r.sourceUrl ? <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="kt-src">Source ↗</a> : "—"}
                      {asOf(r.slug) && <span style={{ display: "block", fontSize: 11.5, color: "#75828A" }}>{fmtDate(asOf(r.slug)!)}</span>}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="kt-sec kt-narrow">
          <h2 className="kt-h2" style={{ marginBottom: 12 }}>Questions</h2>
          <div className="kt-faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <p style={{ margin: "28px 0 0", fontSize: 14, lineHeight: 1.6, color: "#8E9CA4" }}>
            Using these figures? Cite and link this page; we re-read each casino&apos;s KYC wording every month. Corrections go to our <Link href="/corrections" style={{ color: "#C9D3D8" }}>corrections log</Link>.
          </p>
          <div style={{ margin: "36px 0" }}>
            <AuthorBox />
          </div>
          <NextSteps
            steps={[
              { href: "/crypto-casinos/no-kyc", label: "No-KYC casinos", hint: "The casinos listed as paying without documents." },
              { href: "/guides/how-to-complete-kyc", label: "How to get verified", hint: "What to have ready if a casino does ask." },
              { href: "/legal/curacao-licence-tracker", label: "Curaçao licence tracker", hint: "Where each casino stands on the regulator's register." },
            ]}
          />
        </section>
      </div>
    </main>
  );
}
