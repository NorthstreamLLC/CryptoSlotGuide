import Link from "next/link";
import { notFound } from "next/navigation";
import { siteData } from "@/lib/site-data";
import { fill } from "@/lib/derived";
import { pageMetadata } from "@/lib/seo";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps } from "@/components/layout/NextSteps";
import { FeaturedPartner } from "@/components/ui/FeaturedPartner";
import { EmailSignup } from "@/components/ui/EmailSignup";
import { GuideCover } from "@/components/guides/GuideCover";
import { KycTiersTable } from "@/components/guides/KycTiersTable";

/**
 * Ported from the `isGuide` block in CryptoSlotGuide.dc.html (search for
 * `GUIDE ARTICLE`). {token} placeholders in body copy resolve through
 * fill() so a claim like "{fee} of {casinos} operators" can't drift out
 * of step with the live data.
 */
/**
 * **Bold** in guide copy. The bodies are plain strings rendered straight into
 * a <p>, so a how-to written with bold lead-ins shipped its asterisks — 33 of
 * them on the KYC guide. A step-by-step genuinely reads better with the step
 * itself picked out, so the markers are honoured rather than stripped.
 *
 * Deliberately the one marker and nothing else: a guide body is our own copy,
 * not user input, and a full markdown parser here would be a dependency and a
 * sanitising problem in exchange for syntax nobody has asked for.
 */
function emphasise(text: string) {
  const parts = text.split("**");
  if (parts.length < 3) return text;
  return parts.map((part, i) =>
    i % 2 ? (
      <strong key={i} style={{ color: "#E8EDF0", fontWeight: 700 }}>
        {part}
      </strong>
    ) : (
      part
    )
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { guideRows } = siteData;
  const g = guideRows.find((r) => r.slug === slug);
  if (!g) return {};
  return pageMetadata(g.title, fill(g.standfirst, siteData), `/guides/${slug}`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { guideRows, guideBodies } = siteData;
  const g = guideRows.find((r) => r.slug === slug);
  const body = guideBodies[slug];
  if (!g || !body) notFound();

  const related = guideRows.filter((r) => r.slug !== g.slug).slice(0, 4);
  // A guide may render a dataset under its prose. Named rather than inferred,
  // so a guide only gets a table when it was written to have one.
  const DATA_BLOCKS: Record<string, () => React.ReactNode> = { "kyc-tiers": () => <KycTiersTable /> };
  const dataBlock = body.data ? DATA_BLOCKS[body.data] : undefined;

  return (
    <main>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }, { name: g.title, path: `/guides/${slug}` }]),
          ...(body.published ? [articleSchema(g.title, fill(g.standfirst, siteData), `/guides/${slug}`, body.published, body.published)] : []),
        ]}
      />
      <article style={{ maxWidth: 820, margin: "0 auto", padding: "52px 40px 40px" }}>
        <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#83919A", marginBottom: 26 }}>
          <Link href="/" style={{ color: "#83919A" }}>Index</Link> / <Link href="/guides" style={{ color: "#83919A" }}>Guides</Link> / <span style={{ color: "#A8B6BE" }}>{g.category}</span>
        </div>
        <div className="csg-guide-cover" style={{ position: "relative", aspectRatio: "16 / 6", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)", marginBottom: 24 }}>
          <GuideCover category={g.category} tint={g.tint} label={false} rounded={0} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC" }}>{g.category} · {g.readMins} min read</span>
        </div>
        <h1 style={{ margin: "0 0 18px", fontSize: 44, lineHeight: 1.06, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "114%", color: "#fff", textWrap: "balance" }}>{g.title}</h1>
        <p style={{ margin: "0 0 26px", fontSize: 19, lineHeight: 1.6, color: "#B7C4CB", textWrap: "pretty" }}>{fill(g.standfirst, siteData)}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: "1px solid rgba(255,255,255,.07)", borderBottom: "1px solid rgba(255,255,255,.07)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#83919A", marginBottom: 32 }}>
          <span style={{ width: 26, height: 26, flex: "none", borderRadius: "50%", background: "#1B2226", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#8DA0AA" }}>CS</span>
          <span>CryptoSlotGuide editorial desk</span>
        </div>

        <div style={{ padding: "24px 28px", borderRadius: 13, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)", marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 14 }}>The short version</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {body.key.map((k) => (
              <div key={k} style={{ display: "flex", gap: 12, fontSize: 15, lineHeight: 1.55, color: "#DCE5E9" }}>
                <span style={{ color: "#00C2CC", fontFamily: "var(--font-jetbrains-mono), monospace", flex: "none" }}>→</span>
                <span>{fill(k, siteData)}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22, marginBottom: 38 }}>
          {/* "## " starts a section heading; everything else is a paragraph. */}
          {body.body.map((p) =>
            p.startsWith("## ") ? (
              <h2 key={p} style={{ margin: "12px 0 -6px", fontSize: 24, lineHeight: 1.2, letterSpacing: "-.022em", fontWeight: 800, color: "#fff", textWrap: "balance" }}>
                {p.slice(3)}
              </h2>
            ) : (
              <p key={p.slice(0, 40)} style={{ margin: 0, fontSize: 17, lineHeight: 1.75, color: "#B0BEC5", textWrap: "pretty" }}>{emphasise(fill(p, siteData))}</p>
            )
          )}
        </div>

        {/* The dataset the prose is arguing from, where a guide names one. */}
        {dataBlock?.()}

        {body.sources && body.sources.length > 0 && (
          <section style={{ marginBottom: 38, padding: "20px 24px", borderRadius: 13, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 12 }}>Sources</div>
            <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              {body.sources.map((s) => (
                <li key={s.url} style={{ fontSize: 14, lineHeight: 1.5, color: "#B0BEC5" }}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#5FE3E8" }}>
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ol>
          </section>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {related.map((r) => (
            <Link key={r.slug} href={`/guides/${r.slug}`} style={{ display: "flex", flexDirection: "column", gap: 10, padding: 20, borderRadius: 13, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
              <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: ".07em", textTransform: "uppercase", color: "#83919A" }}>{r.category} · {r.readMins} min</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#E8EDF0", lineHeight: 1.35, textWrap: "pretty" }}>{r.title}</span>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: 32 }}>
          {g.category === "Law" ? (
            <EmailSignup
              source={`guide:${g.slug}`.slice(0, 40)}
              eyebrow="Law changes"
              title="Hear when the rules change"
              sub="Bans, new licences and casinos leaving a country: when a law we cover changes, it's at the top of our weekly email, with the source. One email a week, unsubscribe any time."
              button="Get law updates"
            />
          ) : (
            <EmailSignup
              source={`guide:${g.slug}`.slice(0, 40)}
              eyebrow="Weekly email"
              title="Guides like this, once a week"
              sub="New guides, what changed at each casino this week and the week's biggest races. One email a week, unsubscribe any time."
            />
          )}
        </div>
        <FeaturedPartner context={{ kind: "general" }} />
        <NextSteps
          steps={body.next ?? [
            { href: "/guides", label: "All guides", hint: "The operational detail behind the reviews, kept current." },
            { href: "/crypto-casinos", label: "All crypto casinos", hint: "Put this guide to work on the full index." },
            { href: "/how-we-rate", label: "How we source every fact", hint: "The method behind every figure on the site." },
          ]}
        />
      </article>
    </main>
  );
}
