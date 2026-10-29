import Link from "next/link";
import { notFound } from "next/navigation";
import { siteData } from "@/lib/site-data";
import { getSpecFact } from "@/lib/spec-sheet";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { PROMO_CONFIGS, type PromoCard } from "@/lib/promo-configs";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandMark } from "@/components/ui/BrandMark";
import { CodeChip } from "@/components/ui/CodeChip";
import { AuthorByline, AuthorBox } from "@/components/ui/AuthorBox";
import { NextSteps } from "@/components/layout/NextSteps";
import { GeoBlockNote } from "@/components/geo/GeoBlockNote";
import { SourcedCard, SpecFactCard } from "@/components/promo/SourcedCard";

/**
 * Promo code pages driven by lib/promo-configs.ts. Roobet, Stake and Shuffle
 * keep their own hand-built pages, which take precedence over this route.
 */
const MONO = "var(--font-jetbrains-mono), monospace";
const GOLD = "#FFC531";

export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(PROMO_CONFIGS).map((slug) => ({ slug }));

/** The casino and its config, only while we hold a code and a link for it. */
function load(slug: string) {
  const cfg = PROMO_CONFIGS[slug];
  const o = siteData.ops.find((x) => x.slug === slug);
  if (!cfg || !o?.promoCode || !o.signupUrl) return null;
  return { cfg, o, code: o.promoCode, signupUrl: o.signupUrl };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = load(slug);
  if (!p) return {};
  return pageMetadata(p.cfg.title(p.code), p.cfg.description(p.code), `/promo-codes/${slug}`);
}

function Card({ slug, c }: { slug: string; c: PromoCard }) {
  return "href" in c ? <SourcedCard {...c} /> : <SpecFactCard slug={slug} {...c} />;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = load(slug);
  if (!p) notFound();
  const { cfg, o, code, signupUrl } = p;
  const faqs = cfg.faqs(code);
  // "Last updated" is the newest check among the spec-sheet facts the page shows.
  const updated = [...cfg.rewards, ...cfg.terms]
    .flatMap((c) => ("group" in c ? [getSpecFact(slug, c.group, c.label)?.asOf] : []))
    .filter((d): d is string => !!d)
    .sort()
    .pop();

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={[breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Promo codes", path: "/promo-codes" }, { name: o.name, path: `/promo-codes/${slug}` }]), faqSchema(faqs)]} />

      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(70% 120% at 85% 0%, rgba(255,197,49,.12), transparent 60%), radial-gradient(60% 90% at 0% 100%, rgba(0,194,204,.08), transparent 60%), #0A0D10" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 24px 44px", display: "grid", gap: 40, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 22 }}>
              <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/promo-codes" style={{ color: "#83919A" }}>Promo codes</Link> / <span style={{ color: "#A8B6BE" }}>{o.name}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ width: 52, height: 52, borderRadius: 14, overflow: "hidden" }}>
                <BrandMark slug={slug} mono={o.mono} tint={GOLD} radius={14} fontSize={14} />
              </span>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: GOLD }}>{o.name} promo code</span>
            </div>
            <h1 style={{ margin: "0 0 14px", fontSize: "clamp(36px, 4.6vw, 56px)", lineHeight: 1.02, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>
              Use code <span style={{ color: GOLD }}>{code}</span> at {o.name}
            </h1>
            <p style={{ margin: "0 0 24px", maxWidth: "52ch", fontSize: 17, lineHeight: 1.6, color: "#B7C4CB" }}>{cfg.lead(code)}</p>
            <AuthorByline updated={updated} />
          </div>

          <div style={{ padding: 26, borderRadius: 20, background: "radial-gradient(120% 90% at 50% 0%, rgba(255,197,49,.16), transparent 60%), #0F1418", border: "1px solid rgba(255,197,49,.4)", boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
            <div style={{ fontSize: 13, color: "#A8B6BE", marginBottom: 10 }}>Your code, tap to copy</div>
            <div style={{ marginBottom: 20 }}>
              <CodeChip code={code} tint={GOLD} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {cfg.perks.map((k) => (
                <div key={k.t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}>
                  <span style={{ width: 26, height: 26, flex: "none", borderRadius: "50%", background: "rgba(87,227,154,.14)", color: "#57E39A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✓</span>
                  <span>
                    <span style={{ display: "block", fontSize: 15.5, fontWeight: 800, color: "#fff" }}>{k.t}</span>
                    <span style={{ display: "block", fontSize: 13, color: "#A8B6BE" }}>{k.d}</span>
                  </span>
                </div>
              ))}
            </div>
            <a href={signupUrl} target="_blank" rel="nofollow sponsored noopener" data-copy-code={code} className="transition-transform hover:-translate-y-px" style={{ display: "block", textAlign: "center", padding: "16px 18px", borderRadius: 13, background: "linear-gradient(180deg,#FFD866,#FFC531)", color: "#141007", fontSize: 16, fontWeight: 800, boxShadow: "0 12px 30px rgba(255,197,49,.25)" }}>
              Sign up at {o.name} with {code} ↗
            </a>
            <GeoBlockNote slug={slug} name={o.name} />
            <p style={{ margin: "12px 0 0", fontFamily: MONO, fontSize: 10.5, lineHeight: 1.6, color: "#7F8D96" }}>
              Our affiliate code: we may earn a commission, which never changes what we report. 18+ · T&amp;Cs apply · Play responsibly.
            </p>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 0" }}>
        <h2 style={{ margin: "0 0 18px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>How to claim it</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 12 }}>
          {cfg.steps(code).map((s, i) => (
            <div key={s.t} style={{ padding: 20, borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: GOLD, color: "#141007", fontWeight: 800, marginBottom: 12 }}>{i + 1}</div>
              <div style={{ fontSize: 16.5, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{s.t}</div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#A8B6BE" }}>
                {s.d}{" "}
                {s.src && <a href={s.src} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8" }}>{new URL(s.src).hostname.replace(/^www\./, "")} ↗</a>}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 0" }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>{cfg.rewardsTitle}</h2>
        <p style={{ margin: "0 0 18px", fontSize: 15, color: "#8DA0AA" }}>Each from {o.name}&apos;s own pages.</p>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
          {cfg.rewards.map((c, i) => <Card key={i} slug={slug} c={c} />)}
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 0" }}>
        <h2 style={{ margin: "0 0 18px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>{cfg.termsTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12 }}>
          {cfg.terms.map((c, i) => <Card key={i} slug={slug} c={c} />)}
        </div>
      </section>

      <section style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 0" }}>
        <h2 style={{ margin: "0 0 14px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>Questions</h2>
        {faqs.map((f) => (
          <details key={f.q} style={{ padding: "16px 0", borderTop: "1px solid rgba(255,255,255,.08)" }}>
            <summary style={{ cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#fff" }}>{f.q}</summary>
            <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.65, color: "#A8B6BE" }}>{f.a}</p>
          </details>
        ))}
        <div style={{ margin: "36px 0" }}>
          <AuthorBox />
        </div>
        <NextSteps steps={cfg.next} />
      </section>
    </main>
  );
}
