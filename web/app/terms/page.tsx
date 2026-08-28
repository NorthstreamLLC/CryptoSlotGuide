import { pageMetadata } from "@/lib/seo";

/**
 * Draft terms of service — same caveat as app/privacy/page.tsx: a
 * reasonable starting point, not a substitute for legal review.
 * "[Jurisdiction]" in the governing-law section is a deliberate
 * placeholder — fill in the actual entity/jurisdiction before publish.
 */
export const metadata = pageMetadata(
  "Terms of Service",
  "The terms that govern using CryptoSlotGuide.",
  "/terms"
);

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "Who this site is for",
    body: [
      "You must be at least 18 years old, or the legal age of majority and legal gambling age in your jurisdiction if higher, to use this site. Gambling is illegal in some jurisdictions and restricted in others — it's your responsibility to know and follow the law where you live before registering with any operator listed here.",
      "Nothing on this site is available to residents of jurisdictions where online gambling is prohibited, regardless of whether an individual operator's own terms claim otherwise.",
    ],
  },
  {
    title: "What this site is (and isn't)",
    body: [
      "CryptoSlotGuide is an independent publisher of reviews, comparisons, and educational content about crypto casinos, wallets, exchanges, and related products. We are not a gambling operator, we do not accept wagers, and we do not hold or move your funds.",
      "We are not affiliated with, and do not speak for, any operator reviewed on this site unless explicitly stated. Any account you open with a listed operator is a separate relationship governed entirely by that operator's own terms, not ours.",
    ],
  },
  {
    title: "Accuracy and no warranty",
    body: [
      "We research and verify what we publish to the standard described in How We Rate, and every review discloses how its figures were sourced. Even so, operator terms, licensing, bonus structures, and payout behavior change without notice, and we cannot guarantee that every figure on this site is current at the moment you read it.",
      "This site is provided \"as is\" without warranties of any kind. Nothing here constitutes financial, legal, or gambling advice. Verify current terms directly with an operator before depositing.",
    ],
  },
  {
    title: "Affiliate relationships",
    body: [
      "We earn commission when a reader signs up through some of the links on this site, including at operators we rank first. This is disclosed on every relevant page. Commission rates differ between operators and are never an input to a score — see How We Rate for how that separation is enforced.",
    ],
  },
  {
    title: "Intellectual property",
    body: [
      "The text, design, scoring methodology, and original content on this site are owned by CryptoSlotGuide unless otherwise credited. Operator logos and trademarks are the property of their respective owners and are used here for identification purposes under fair use.",
      "You may link to this site and quote brief excerpts with attribution. Reproducing substantial portions of our content elsewhere without permission isn't allowed.",
    ],
  },
  {
    title: "Limitation of liability",
    body: [
      "To the fullest extent permitted by law, CryptoSlotGuide is not liable for any loss or damage arising from your use of this site, your reliance on information published here, or your dealings with any third-party operator listed on it — including gambling losses, account disputes, or withdrawal issues at any operator.",
    ],
  },
  {
    title: "Changes to these terms",
    body: [
      "We may update these terms from time to time. Material changes will be reflected in the date below. Continuing to use the site after an update means you accept the revised terms.",
    ],
  },
  {
    title: "Governing law",
    body: [
      "These terms are governed by the laws of [Jurisdiction], without regard to conflict-of-law principles. Any dispute arising from these terms will be resolved in the courts of that jurisdiction.",
    ],
  },
];

export default function Page() {
  return (
    <main>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(100% 100% at 50% 0%, rgba(0,194,204,.09), transparent 60%), #090C0F" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "56px 40px 44px" }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 18 }}>
            Legal
          </div>
          <h1 style={{ margin: "0 0 16px", fontSize: 44, lineHeight: 1.05, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "114%", color: "#fff", textWrap: "balance" }}>
            Terms of Service
          </h1>
          <p style={{ margin: 0, maxWidth: "66ch", fontSize: 16, lineHeight: 1.65, color: "#93A3AC", textWrap: "pretty" }}>
            Last updated 27 August 2026. By using this site you agree to the terms below.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "48px 40px 20px" }}>
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
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 40px 84px" }}>
        <div style={{ padding: "24px 28px", borderRadius: 13, background: "linear-gradient(150deg,#0E1417,#0A0E10)", border: "1px solid rgba(196,101,58,.20)" }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: "#93A3AC" }}>
            Gambling involves risk. If it stops feeling like entertainment, use the tools every operator on this site is required to offer, or contact BeGambleAware on 0808 8020 133.
          </p>
        </div>
      </section>
    </main>
  );
}
