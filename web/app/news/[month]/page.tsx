import Link from "next/link";
import { notFound } from "next/navigation";
import { siteData } from "@/lib/site-data";
import { getSpecFact } from "@/lib/spec-sheet";
import { pageMetadata } from "@/lib/seo";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { brandFor } from "@/lib/casino-facts";
import { NEWS, NEWS_KIND, newsPath } from "@/lib/news";
import { hasPromoPage } from "@/lib/promo-pages";
import { hasFactArticle } from "@/lib/fact-articles";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandMark } from "@/components/ui/BrandMark";
import { AuthorByline, AuthorBox } from "@/components/ui/AuthorBox";
import { NextSteps } from "@/components/layout/NextSteps";
import { EmailSignup } from "@/components/ui/EmailSignup";

const MONO = "var(--font-jetbrains-mono), monospace";

export const dynamicParams = false;
export const generateStaticParams = () => NEWS.map((n) => ({ month: n.month }));

const issueFor = (month: string) => NEWS.find((n) => n.month === month);

export async function generateMetadata({ params }: { params: Promise<{ month: string }> }) {
  const { month } = await params;
  const n = issueFor(month);
  if (!n) return {};
  return pageMetadata(n.title, n.intro, newsPath(month));
}

export default async function Page({ params }: { params: Promise<{ month: string }> }) {
  const { month } = await params;
  const n = issueFor(month);
  if (!n) notFound();
  // An item shows only while its fact (and so its source) is on record.
  const items = n.items.flatMap((it) => {
    const o = siteData.ops.find((x) => x.slug === it.slug);
    const f = getSpecFact(it.slug, it.group, it.label);
    return o && f?.sourceUrl ? [{ it, o, href: f.sourceUrl }] : [];
  });
  const casinos = new Set(items.map((x) => x.o.slug)).size;
  const older = NEWS.filter((x) => x.month !== month);

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={[breadcrumbSchema([{ name: "Home", path: "/" }, { name: "News", path: "/news" }, { name: n.title, path: newsPath(month) }]), articleSchema(n.title, n.intro, newsPath(month), n.published, n.published)]} />

      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(70% 120% at 85% 0%, rgba(255,126,182,.12), transparent 60%), radial-gradient(60% 90% at 0% 100%, rgba(95,227,232,.08), transparent 60%), #0A0D10" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "34px 24px 40px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 22 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/news" style={{ color: "#83919A" }}>News</Link> / <span style={{ color: "#A8B6BE" }}>{month}</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#FF9CC6", marginBottom: 12 }}>
            {items.length} changes · {casinos} casinos · every one sourced
          </div>
          <h1 style={{ margin: "0 0 16px", fontSize: "clamp(32px, 4.4vw, 52px)", lineHeight: 1.05, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>{n.title}</h1>
          <p style={{ margin: "0 0 22px", fontSize: 17, lineHeight: 1.65, color: "#B7C4CB" }}>{n.intro}</p>
          <AuthorByline updated={n.published} />
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px 0" }}>
        <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          {items.map(({ it, o, href }, i) => {
            const tint = brandFor(o.slug);
            const k = NEWS_KIND[it.kind];
            return (
              <li key={i} id={`item-${i + 1}`} style={{ padding: "20px 22px", borderRadius: 16, background: `radial-gradient(90% 120% at 0% 0%, ${tint}12, transparent 55%), #0C1013`, border: "1px solid rgba(255,255,255,.08)", borderLeft: `3px solid ${tint}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ width: 32, height: 32, flex: "none", borderRadius: 9, overflow: "hidden" }}>
                    <BrandMark slug={o.slug} mono={o.mono} tint={tint} radius={9} fontSize={11} />
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{o.name}</span>
                  <span style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 100, background: `${k.tint}1c`, border: `1px solid ${k.tint}55`, fontFamily: MONO, fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: k.tint }}>{k.label}</span>
                </div>
                <h2 style={{ margin: "0 0 12px", fontSize: 20, lineHeight: 1.3, letterSpacing: "-.015em", fontWeight: 800, color: "#fff" }}>{it.headline}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 10, marginBottom: 12 }}>
                  {it.before && (
                    <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.07)" }}>
                      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", color: "#7F8D96", marginBottom: 4 }}>BEFORE</div>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#8DA0AA" }}>{it.before}</p>
                    </div>
                  )}
                  <div style={{ gridColumn: it.before ? undefined : "1 / -1", padding: "12px 14px", borderRadius: 12, background: `${tint}0d`, border: `1px solid ${tint}33` }}>
                    <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", color: tint, marginBottom: 4 }}>{it.before ? "NOW" : "WHAT HAPPENED"}</div>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#DCE5E9" }}>{it.after}</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, fontSize: 13, fontWeight: 700 }}>
                  <a href={href} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 400, color: "#5FE3E8" }}>Source: {new URL(href).hostname.replace(/^www\./, "")} ↗</a>
                  <Link href={`/casinos/${o.slug}`} style={{ color: "#E8EDF0" }}>{o.name} review →</Link>
                  {hasFactArticle(o.slug) && <Link href={`/casinos/${o.slug}/facts`} style={{ color: "#E8EDF0" }}>10 facts →</Link>}
                  {hasPromoPage(o.slug) && o.promoCode && <Link href={`/promo-codes/${o.slug}`} style={{ color: "#FFD36B" }}>Code {o.promoCode} →</Link>}
                </div>
              </li>
            );
          })}
        </ol>

        <div style={{ marginTop: 30, padding: "18px 20px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,197,49,.25)" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".08em", color: "#FFC531", marginBottom: 6 }}>HOW WE FIND THESE</div>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: "#B7C4CB" }}>
            Every month we re-read the terms, help articles and licence registers behind each casino we hold a code for. When something has moved, the fact on our site changes and it lands here, with the page it came from.{" "}
            <Link href="/editorial-standards" style={{ color: "#5FE3E8", fontWeight: 700 }}>Our editorial standards →</Link>
          </p>
        </div>

        {older.length > 0 && (
          <div style={{ marginTop: 26 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 800, color: "#fff" }}>Earlier months</h2>
            {older.map((x) => (
              <Link key={x.month} href={newsPath(x.month)} style={{ display: "block", padding: "8px 0", fontSize: 15, fontWeight: 700, color: "#5FE3E8" }}>{x.title} →</Link>
            ))}
          </div>
        )}

        <div style={{ margin: "36px 0" }}>
          <AuthorBox />
        </div>
        <div style={{ margin: "28px 0 8px" }}>
          <EmailSignup
            compact
            source={`news:${month}`}
            eyebrow="Monthly email"
            title={"Get next month's changes by email"}
            sub={"This page in your inbox once a month: new bonuses, fee and rule changes and licence updates at the casinos we cover, each with its source. Unsubscribe any time."}
            button={"Email me next month's changes"}
          />
        </div>
        <NextSteps
          steps={[
            { href: "/promo-codes", label: "Every promo code", hint: "What each casino's code gets you, after this month's changes." },
            { href: "/casinos/facts", label: "10 facts about each casino", hint: "Who runs it, its licence and the rules that catch players out." },
            { href: "/compare", label: "Head-to-head verdicts", hint: "Two casinos, one verdict, every claim sourced." },
          ]}
        />
      </section>
    </main>
  );
}
