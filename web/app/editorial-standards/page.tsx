import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

/**
 * Editorial integrity policy — distinct from /how-we-rate, which covers
 * the review methodology itself. This page covers the things that
 * apply regardless of category: independence from advertisers,
 * corrections, sourcing standards, conflicts of interest. Cross-links
 * to How We Rate rather than duplicating its content.
 */
export const metadata = pageMetadata(
  "Editorial Standards",
  "How CryptoSlotGuide keeps commercial relationships out of editorial decisions.",
  "/editorial-standards"
);

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "Independence from advertisers",
    body: [
      "We earn commission through affiliate links, disclosed on every page where it applies. No operator is shown a review before publication, and commission rates are kept away from the people who write reviews. If an operator we work with has poor terms or a bad record, that's what gets published.",
      "Some operators get a featured placement, such as a spotlight on the homepage or a position near the top of a casino list, and that placement can reflect a commercial partnership. Featured placements show the same cited facts as the operator's profile and never change what the profile says.",
      "Where a list has no fact to sort on, it opens in our featured order, which is commercial. That order decides position on the page and nothing else: it is never described as a ranking, never called \"best\", and no score, payout time, wagering figure or verdict anywhere on the site is derived from it. Any list that ranks by something measured — withdrawal speed, wagering, bonus size, or your answers in the casino quiz — sorts by that measurement instead, and the sort controls above each table let you re-sort on a cited fact or A–Z at any time. An operator that doesn't qualify for a list is never placed in it: the no-KYC list, for instance, excludes our featured operators because they verify.",
    ],
  },
  {
    title: "How we source what we publish",
    body: [
      "Every figure on this site comes from the operator's own pages (its terms, help centre, promotions and blog), an official regulator or licence register, official network or studio documentation, on-chain data, or our own testing on a funded account. We don't take figures from review, affiliate or comparison sites. Each fact links to its source. See How We Source Information for the details.",
      "We do not publish a figure we can't trace to one of those sources. Where we don't yet have a reliable figure, the page says so rather than estimating one.",
    ],
  },
  {
    title: "Corrections",
    body: [
      "If something on this site is wrong, we want to know before a reader acts on it. Reader-reported inaccuracies that we can reproduce trigger a re-check, and the page is updated with a new date rather than a silent edit — we don't quietly change a number and pretend it was always right.",
      "Significant corrections (a materially wrong figure, a reversed recommendation) are treated as newsworthy in their own right, not buried in a changelog.",
    ],
  },
  {
    title: "Author and reviewer identity",
    body: [
      "Reviews that carry real field-testing are attributed to the person who did the work. Reviews sourced from operators' own pages and public registries are attributed to the desk that assembled them, since no single person is claiming to have personally verified the figures.",
    ],
  },
  {
    title: "Conflicts of interest",
    body: [
      "Anyone involved in reviewing an operator discloses any personal relationship with that operator beyond the standard affiliate arrangement — ownership, employment, or paid consulting. Where a conflict exists, that review is reassigned or the conflict is disclosed directly on the page.",
    ],
  },
  {
    title: "Responsible gambling",
    body: [
      "This site does not encourage gambling as a way to make money, and every casino review links to the deposit limits, cool-off, and self-exclusion tools operators are required to offer. If gambling stops feeling like entertainment, contact BeGambleAware on 0808 8020 133.",
    ],
  },
];

export default function Page() {
  return (
    <main>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(100% 100% at 50% 0%, rgba(0,194,204,.09), transparent 60%), #090C0F" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "56px 40px 44px" }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 18 }}>
            Editorial
          </div>
          <h1 style={{ margin: "0 0 16px", fontSize: 44, lineHeight: 1.05, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "114%", color: "#fff", textWrap: "balance" }}>
            Editorial standards
          </h1>
          <p style={{ margin: 0, maxWidth: "66ch", fontSize: 16, lineHeight: 1.65, color: "#93A3AC", textWrap: "pretty" }}>
            This page covers how we keep commercial relationships out of editorial decisions. For how reviews are put together — the six criteria and how each is sourced — see{" "}
            <Link href="/how-we-rate" style={{ color: "#00C2CC" }}>How we source information</Link>.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "48px 40px 84px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 38 }}>
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 style={{ margin: "0 0 12px", fontSize: 21, letterSpacing: "-.02em", fontWeight: 700, color: "#fff" }}>{s.title}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {s.body.map((p) => (
                  <p key={p.slice(0, 40)} style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "#93A3AC", textWrap: "pretty" }}>
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 44, padding: "24px 28px", borderRadius: 13, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: "#8DA0AA" }}>
            Spotted something wrong, or a conflict we haven&apos;t disclosed? <a href="mailto:hello@cryptoslotguide.com" style={{ color: "#00C2CC" }}>hello@cryptoslotguide.com</a>
          </p>
        </div>
      </section>
    </main>
  );
}
