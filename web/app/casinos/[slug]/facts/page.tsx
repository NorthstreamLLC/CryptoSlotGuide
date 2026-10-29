import Link from "next/link";
import { notFound } from "next/navigation";
import { siteData } from "@/lib/site-data";
import { getSpecFact } from "@/lib/spec-sheet";
import { pageMetadata } from "@/lib/seo";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { brandFor } from "@/lib/casino-facts";
import { FACT_ARTICLES } from "@/lib/fact-articles";
import { hasPromoPage } from "@/lib/promo-pages";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandMark } from "@/components/ui/BrandMark";
import { CodeChip } from "@/components/ui/CodeChip";
import { AuthorByline, AuthorBox } from "@/components/ui/AuthorBox";
import { NextSteps } from "@/components/layout/NextSteps";
import { GeoBlockNote } from "@/components/geo/GeoBlockNote";

const MONO = "var(--font-jetbrains-mono), monospace";
const GOLD = "#FFC531";

export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(FACT_ARTICLES).map((slug) => ({ slug }));

/** The article with each fact's source, keeping only facts the spec sheet still holds. */
function load(slug: string) {
  const a = FACT_ARTICLES[slug];
  const o = siteData.ops.find((x) => x.slug === slug);
  if (!a || !o) return null;
  const facts = a.facts.flatMap((f) => {
    const s = getSpecFact(slug, f.group, f.label);
    return s?.sourceUrl ? [{ ...f, href: s.sourceUrl, asOf: s.asOf }] : [];
  });
  const updated = facts.map((f) => f.asOf).filter((d): d is string => !!d).sort().pop() ?? a.published;
  const title = `${facts.length} facts about ${o.name} you should know before you sign up`;
  return { a, o, facts, updated, title };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = load(slug);
  if (!p) return {};
  return pageMetadata(p.title, `Who runs ${p.o.name}, its licence, rakeback, races, VIP levels and withdrawals: ${p.facts.length} facts, each checked against ${p.o.name}'s own pages.`, `/casinos/${slug}/facts`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = load(slug);
  if (!p) notFound();
  const { a, o, facts, updated, title } = p;
  const tint = brandFor(slug);
  const path = `/casinos/${slug}/facts`;
  const code = o.affiliate && o.signupUrl ? o.promoCode : null;

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Casinos", path: "/crypto-casinos" }, { name: "Facts", path: "/casinos/facts" }, { name: o.name, path }]),
          articleSchema(title, a.intro, path, a.published, updated),
        ]}
      />

      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: `radial-gradient(70% 120% at 85% 0%, ${tint}1f, transparent 60%), radial-gradient(60% 90% at 0% 100%, rgba(255,197,49,.07), transparent 60%), #0A0D10` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "34px 24px 40px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 22 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/crypto-casinos" style={{ color: "#83919A" }}>Casinos</Link> / <Link href="/casinos/facts" style={{ color: "#83919A" }}>Facts</Link> / <span style={{ color: "#A8B6BE" }}>{o.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <span style={{ width: 52, height: 52, borderRadius: 14, overflow: "hidden", boxShadow: `0 10px 30px ${tint}33` }}>
              <BrandMark slug={slug} mono={o.mono} tint={tint} radius={14} fontSize={14} />
            </span>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: tint }}>{facts.length} facts · checked {new Date(updated + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
          <h1 style={{ margin: "0 0 16px", fontSize: "clamp(32px, 4.4vw, 52px)", lineHeight: 1.05, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>
            {facts.length} facts about <span style={{ color: tint }}>{o.name}</span> you should know before you sign up
          </h1>
          <p style={{ margin: "0 0 24px", fontSize: 17, lineHeight: 1.65, color: "#B7C4CB" }}>{a.intro}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 24 }}>
            {a.glance.map((g) => (
              <div key={g.k} style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,.04)", border: `1px solid ${tint}33` }}>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#7F8D96", marginBottom: 4 }}>{g.k}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{g.v}</div>
              </div>
            ))}
          </div>
          <AuthorByline updated={updated} />
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 0" }}>
        <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          {facts.map((f, i) => (
            <li key={f.title} id={`fact-${i + 1}`} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 18, padding: "20px 22px", borderRadius: 16, background: `radial-gradient(90% 120% at 0% 0%, ${tint}12, transparent 55%), #0C1013`, border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: MONO, fontSize: 28, fontWeight: 800, lineHeight: 1, color: tint }}>{String(i + 1).padStart(2, "0")}</span>
                <span aria-hidden style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: `${tint}1a`, border: `1px solid ${tint}40` }}>{f.icon}</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ margin: "2px 0 8px", fontSize: 20, lineHeight: 1.25, letterSpacing: "-.015em", fontWeight: 800, color: "#fff" }}>{f.title}</h2>
                <p style={{ margin: "0 0 10px", fontSize: 15, lineHeight: 1.65, color: "#B7C4CB" }}>{f.body}</p>
                <a href={f.href} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8" }}>
                  Source: {new URL(f.href).hostname.replace(/^www\./, "")} ↗
                </a>
              </div>
            </li>
          ))}
        </ol>

        {code && (
          <section aria-label="Next step" style={{ margin: "36px 0 0", padding: "24px 26px", borderRadius: 18, background: "radial-gradient(80% 140% at 0% 50%, rgba(255,197,49,.14), transparent 60%), #0F1418", border: "1px solid rgba(255,197,49,.32)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
              <div style={{ minWidth: 0, flex: "1 1 320px" }}>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".08em", color: GOLD, marginBottom: 6 }}>SIGNING UP?</div>
                <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2, color: "#fff" }}>Use code {code} at {o.name}</div>
                <div style={{ marginTop: 6, fontSize: 14.5, lineHeight: 1.5, color: "#A8B6BE" }}>{o.bonusShort ?? o.bonus}</div>
                <div style={{ marginTop: 12 }}>
                  <CodeChip code={code} tint={GOLD} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: 8 }}>
                <a href={o.signupUrl!} target="_blank" rel="nofollow sponsored noopener" data-copy-code={code} style={{ padding: "14px 22px", borderRadius: 12, background: "linear-gradient(180deg,#FFD866,#FFC531)", color: "#141007", fontSize: 15.5, fontWeight: 800, whiteSpace: "nowrap", textAlign: "center" }}>Sign up at {o.name} ↗</a>
                {hasPromoPage(slug) && <Link href={`/promo-codes/${slug}`} style={{ textAlign: "center", fontSize: 13.5, fontWeight: 700, color: "#FFD36B" }}>How code {code} works →</Link>}
              </div>
            </div>
            <GeoBlockNote slug={slug} name={o.name} compact />
            <p style={{ margin: "12px 0 0", fontFamily: MONO, fontSize: 10.5, color: "#7F8D96" }}>Affiliate link: we may earn a commission, which never changes what we report. 18+ · T&amp;Cs apply.</p>
          </section>
        )}

        <div style={{ margin: "36px 0" }}>
          <AuthorBox />
        </div>
        <NextSteps
          steps={[
            { href: `/casinos/${slug}`, label: `Full ${o.name} review`, hint: "Withdrawals, coins, licence and sportsbook, each linked to its own pages." },
            ...(hasPromoPage(slug) ? [{ href: `/promo-codes/${slug}`, label: `${o.name} promo code`, hint: "What the code gets you and how to claim it." }] : []),
            { href: "/casinos/facts", label: "Facts about other casinos", hint: "Ten sourced facts about each of the casinos we hold codes for." },
          ]}
        />
      </section>
    </main>
  );
}
