import { pageMetadata } from "@/lib/seo";

/**
 * Simple contact routing page — no backend form, just addressed mailto
 * links split by reason so requests land with the right desk. Swap the
 * placeholder addresses for real monitored inboxes before launch.
 */
export const metadata = pageMetadata(
  "Contact",
  "Get in touch with CryptoSlotGuide.",
  "/contact"
);

const CHANNELS: { title: string; desc: string; email: string }[] = [
  {
    title: "Report an inaccuracy",
    desc: "A figure that's out of date, a term that's changed, or something that doesn't match what you saw at an operator. Include the page URL and what you found — reproducible reports get an immediate re-check.",
    email: "corrections@cryptoslotguide.com",
  },
  {
    title: "General questions",
    desc: "Anything about how we work, a review you'd like us to add, or feedback on the site.",
    email: "hello@cryptoslotguide.com",
  },
  {
    title: "Advertising & partnerships",
    desc: "Affiliate program inquiries and partnership proposals. Note that commercial relationships never affect scoring — see Editorial Standards.",
    email: "partnerships@cryptoslotguide.com",
  },
  {
    title: "Press",
    desc: "Media inquiries and interview requests.",
    email: "press@cryptoslotguide.com",
  },
  {
    title: "Privacy requests",
    desc: "Data access, correction, or deletion requests under applicable privacy law.",
    email: "privacy@cryptoslotguide.com",
  },
];

export default function Page() {
  return (
    <main>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(100% 100% at 50% 0%, rgba(0,194,204,.09), transparent 60%), #090C0F" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "56px 40px 44px" }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 18 }}>
            Contact
          </div>
          <h1 style={{ margin: "0 0 16px", fontSize: 44, lineHeight: 1.05, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "114%", color: "#fff", textWrap: "balance" }}>
            Get in touch
          </h1>
          <p style={{ margin: 0, maxWidth: "66ch", fontSize: 16, lineHeight: 1.65, color: "#93A3AC", textWrap: "pretty" }}>
            Pick the desk that matches your reason — it gets there faster than one shared inbox.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "48px 40px 84px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden" }}>
          {CHANNELS.map((c) => (
            <a
              key={c.title}
              href={`mailto:${c.email}`}
              className="hover:!bg-[#111619]"
              style={{ display: "flex", flexDirection: "column", gap: 8, padding: "22px 24px", background: "#0C1013" }}
            >
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <span style={{ fontSize: 16.5, fontWeight: 700, color: "#fff", letterSpacing: "-.015em" }}>{c.title}</span>
                <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 13, color: "#00C2CC" }}>{c.email}</span>
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#8DA0AA", textWrap: "pretty" }}>{c.desc}</p>
            </a>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: "24px 28px", borderRadius: 13, background: "linear-gradient(150deg,#0E1417,#0A0E10)", border: "1px solid rgba(255,255,255,.07)" }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: "#93A3AC" }}>
            If you&apos;re struggling with gambling, this site can&apos;t help directly — contact BeGambleAware on 0808 8020 133, or use the self-exclusion tools linked on any casino review.
          </p>
        </div>
      </section>
    </main>
  );
}
