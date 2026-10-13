import Link from "next/link";
import author from "@/data/author.json";
import vip from "@/data/vip.json";
import { pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AuthorBadge } from "@/components/ui/AuthorBox";

export const metadata = pageMetadata(
  `${author.name}, ${author.role}`,
  `${author.name} runs ${SITE_NAME} and edits every review and guide on it, after working in the casino industry and an affiliate network. Background, what the job involves and the site's commercial ties.`,
  `/authors/${author.slug}`
);

const MONO = "var(--font-jetbrains-mono), monospace";

export default function Page() {
  const path = `/authors/${author.slug}`;
  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: author.name, path }]),
          {
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            url: `${SITE_URL}${path}`,
            mainEntity: { "@type": "Person", name: author.name, jobTitle: author.role, worksFor: { "@type": "Organization", name: SITE_NAME, url: SITE_URL } },
          },
        ]}
      />
      <section style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 26 }}>
          <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <span style={{ color: "#A8B6BE" }}>{author.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 26 }}>
          <AuthorBadge size={84} />
          <div>
            <h1 style={{ margin: "0 0 6px", fontSize: 40, lineHeight: 1.05, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>{author.name}</h1>
            <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: "#FFC531" }}>{author.role}</div>
          </div>
        </div>
        <p style={{ margin: "0 0 28px", fontSize: 17, lineHeight: 1.65, color: "#C3CFD5" }}>{author.bio}</p>

        <h2 style={{ margin: "8px 0 14px", fontSize: 24, fontWeight: 800, color: "#fff" }}>Background</h2>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12, marginBottom: 30 }}>
          {author.background.map((b) => (
            <div key={b.t} style={{ padding: 18, borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,197,49,.2)" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#FFD36B", marginBottom: 8 }}>{b.t}</div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#A8B6BE" }}>{b.d}</p>
            </div>
          ))}
        </div>

        {[
          {
            t: "What the job involves",
            b: "Every review, guide and slot page on the site passes through Lars before it goes live. The job is checking that each figure — a withdrawal time, a wagering multiple, an RTP — matches the casino's, studio's or regulator's own page it is linked to, and that nothing on the page claims more than that page says.",
          },
          {
            t: "Commercial ties",
            b: `The site earns affiliate commission from some of the casinos it lists, Roobet included, and works with ${vip.name}, the VIP team we partner with for Roobet players. Those ties are disclosed on every page with an affiliate link. They decide which casinos we feature, never what a review reports.`,
          },
          {
            t: "Why a pen name",
            b: `${author.name} is the pen name the founder writes under: a real person, with the name keeping private life apart from the work. Corrections and questions reach Lars directly through the contact page.`,
          },
        ].map((s) => (
          <div key={s.t} style={{ padding: "20px 0", borderTop: "1px solid rgba(255,255,255,.08)" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 19, fontWeight: 800, color: "#fff" }}>{s.t}</h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: "#A8B6BE" }}>{s.b}</p>
          </div>
        ))}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <Link href="/how-we-rate" style={{ padding: "11px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,.14)", color: "#DCE5E9", fontSize: 14, fontWeight: 700 }}>How we source information →</Link>
          <Link href="/editorial-standards" style={{ padding: "11px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,.14)", color: "#DCE5E9", fontSize: 14, fontWeight: 700 }}>Editorial standards →</Link>
          <Link href="/contact" style={{ padding: "11px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,.14)", color: "#DCE5E9", fontSize: 14, fontWeight: 700 }}>Contact →</Link>
        </div>
      </section>
    </main>
  );
}
