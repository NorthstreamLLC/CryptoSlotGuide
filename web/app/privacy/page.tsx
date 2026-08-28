import { pageMetadata } from "@/lib/seo";

/**
 * Draft privacy policy — not part of the original prototype (footer
 * linked "Privacy" to nothing, href="#"). Written as a reasonable
 * starting point matching what this site actually does (no user
 * accounts, affiliate tracking cookies, a couple of third-party
 * data calls), NOT a substitute for legal review. Gambling-adjacent
 * content carries extra regulatory exposure (age verification, ad
 * standards, region-specific rules) — have this checked by a lawyer
 * licensed in the jurisdictions you operate in before publishing.
 */
export const metadata = pageMetadata(
  "Privacy Policy",
  "What CryptoSlotGuide collects, why, and how to control it.",
  "/privacy"
);

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "What we collect",
    body: [
      "This site does not require an account, and we do not ask visitors for personal information to read a review. What we do collect is limited to standard web analytics — pages viewed, referring site, approximate location from IP address, device and browser type — and functional cookies that keep affiliate link attribution working correctly when you click through to an operator.",
      "If you contact us by email, we keep that correspondence and whatever you choose to include in it for as long as needed to handle the request and for a reasonable period afterward for our own records.",
    ],
  },
  {
    title: "Cookies and similar technology",
    body: [
      "Affiliate tracking cookies: when you click a link to a casino, wallet, or exchange listed here, a cookie may be set so that operator knows the referral came from this site. This is how we earn commission — see How We Rate for the full disclosure. These cookies are set by the operator or their affiliate network, not by us directly, and are governed by that operator's own privacy policy once you're on their site.",
      "Analytics cookies: we use standard web analytics to understand which pages are useful and which aren't. This data is aggregated and not used to identify you individually.",
      "You can block or delete cookies at any time in your browser settings. Doing so may affect whether affiliate links credit us correctly, but won't affect your ability to read the site.",
    ],
  },
  {
    title: "Third-party services",
    body: [
      "Live crypto prices shown on this site are pulled from CoinGecko's public API at the time the page loads. No personal data is sent as part of that request.",
      "Affiliate networks and the operators themselves may independently collect data once you leave this site and land on theirs — that's governed by their privacy policy, not ours.",
    ],
  },
  {
    title: "Your rights",
    body: [
      "Depending on where you're located, you may have rights to access, correct, delete, or export data we hold about you, and to object to or restrict certain processing. Since we don't collect account-level personal data by default, most requests will relate to analytics opt-out or correspondence records. Contact us and we'll respond within a reasonable timeframe.",
      "You can opt out of analytics tracking using your browser's Do Not Track setting or a tracker-blocking extension.",
    ],
  },
  {
    title: "Data retention",
    body: [
      "Aggregated analytics data is retained only as long as useful for understanding site performance. Email correspondence is retained as long as reasonably necessary to resolve the matter and maintain a record.",
    ],
  },
  {
    title: "Children's privacy",
    body: [
      "This site covers gambling and cryptocurrency content and is not directed at anyone under 18 (or the legal gambling/majority age in your jurisdiction, if higher). We don't knowingly collect data from minors.",
    ],
  },
  {
    title: "Changes to this policy",
    body: [
      "If this policy changes materially, we'll update the date below and, where the change is significant, note it on this page. Continued use of the site after a change means you accept the updated policy.",
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
            Privacy Policy
          </h1>
          <p style={{ margin: 0, maxWidth: "66ch", fontSize: 16, lineHeight: 1.65, color: "#93A3AC", textWrap: "pretty" }}>
            Last updated 27 August 2026. This site doesn&apos;t need an account to use, and we&apos;d rather collect less than more — here&apos;s exactly what we do gather and why.
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
            Questions about this policy or a data request? <a href="mailto:privacy@cryptoslotguide.com" style={{ color: "#00C2CC" }}>privacy@cryptoslotguide.com</a>
          </p>
        </div>
      </section>
    </main>
  );
}
