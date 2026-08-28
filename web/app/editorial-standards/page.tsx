import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

/**
 * Editorial integrity policy — distinct from /how-we-rate, which covers
 * the scoring methodology itself. This page covers the things that
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
      "We earn commission through affiliate links, disclosed on every page where it applies. No operator has ever been shown a score before publication, no operator can pay for a higher ranking or placement on any table, and commission rates are kept away from the people who assign scores. If an operator we work with performs badly on our criteria, that's what gets published.",
      "Where we recommend an operator prominently — a homepage feature, a \"#1\" badge — that placement is earned on the same published criteria as everything else, not purchased.",
    ],
  },
  {
    title: "How we source what we publish",
    body: [
      "Every figure on this site traces to one of three sources, and every review says which: field-tested (a real funded account, opened and measured by hand), community-reported (aggregated from public review sites like AskGamblers, Casino.Guru, and Trustpilot, cited as such), or editorially assessed (read from an operator's own public terms, help pages, and licensing registries). See How We Rate for the full breakdown of which criteria use which.",
      "We do not publish a figure we can't trace to one of those three sources. Where we don't yet have a reliable figure, the page says so rather than estimating one.",
    ],
  },
  {
    title: "Corrections",
    body: [
      "If something on this site is wrong, we want to know before a reader acts on it. Reader-reported inaccuracies that we can reproduce trigger a re-check, and the page is updated with a new date rather than a silent edit — we don't quietly change a number and pretend it was always right.",
      "Significant corrections (a materially different score, a reversed recommendation) are treated as newsworthy in their own right, not buried in a changelog.",
    ],
  },
  {
    title: "Author and reviewer identity",
    body: [
      "Reviews that carry real field-testing are attributed to the person who did the work. Reviews sourced editorially or from community reports are attributed to the desk that assembled them, since no single person is claiming to have personally verified the figures.",
    ],
  },
  {
    title: "Conflicts of interest",
    body: [
      "Anyone involved in scoring an operator discloses any personal relationship with that operator beyond the standard affiliate arrangement — ownership, employment, or paid consulting. Where a conflict exists, that review is reassigned or the conflict is disclosed directly on the page.",
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
            This page covers how we keep commercial relationships out of editorial decisions. For the scoring model itself — the six criteria, their weights, and how each is sourced — see{" "}
            <Link href="/how-we-rate" style={{ color: "#00C2CC" }}>How we rate</Link>.
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
            Spotted something wrong, or a conflict we haven&apos;t disclosed? <a href="mailto:editorial@cryptoslotguide.com" style={{ color: "#00C2CC" }}>editorial@cryptoslotguide.com</a>
          </p>
        </div>
      </section>
    </main>
  );
}
