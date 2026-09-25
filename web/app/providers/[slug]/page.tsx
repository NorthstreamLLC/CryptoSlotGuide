import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntityView, backLink, nextStepsFor } from "@/lib/entity-view";
import { NextSteps } from "@/components/layout/NextSteps";
import { EntityReviewPage } from "@/components/entity/EntityReviewPage";
import { pageMetadata } from "@/lib/seo";
import { entityBreadcrumbSchema, faqSchema, breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { studioBy, countryOf } from "@/lib/studios";
import { StudioLicences } from "@/components/studios/StudioLicences";
import { BrandMark } from "@/components/ui/BrandMark";
import { tintFor } from "@/lib/logo";
import { FeaturedPartner } from "@/components/ui/FeaturedPartner";
import { ReportIssue } from "@/components/ui/ReportIssue";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const view = getEntityView("provider", slug);
  if (view) return pageMetadata(view.headline, view.standfirst, `/providers/${slug}`);
  const s = studioBy(slug);
  if (!s) return {};
  const n = new Set(s.licences.map((l) => countryOf(l.code))).size;
  return pageMetadata(`${s.name}: licences in ${n} countries`, `Where ${s.name} is licensed: every country, US state and province it lists, with the regulator and licence number, from ${s.name}'s own site.`, `/providers/${slug}`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const view = getEntityView("provider", slug);
  const studio = studioBy(slug);
  if (!view && !studio) notFound();

  if (view) {
    return (
      <>
        <JsonLd data={[entityBreadcrumbSchema(view.kicker, backLink("provider").href, view.name, `/providers/${slug}`), faqSchema(view.faqs)]} />
        <EntityReviewPage e={view} />
        {studio && <StudioLicences studio={studio} />}
      </>
    );
  }

  const s = studio!;
  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Game providers", path: "/providers" }, { name: s.name, path: `/providers/${slug}` }])} />
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(80% 120% at 85% 0%, rgba(0,194,204,.09), transparent 55%), #0A0D10" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 34px" }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#83919A", marginBottom: 20 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/providers" style={{ color: "#83919A" }}>Game providers</Link> / <span style={{ color: "#A8B6BE" }}>{s.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ width: 56, height: 56, flex: "none", borderRadius: 14, overflow: "hidden" }}>
              <BrandMark slug={s.slug} mono={s.name.slice(0, 2).toUpperCase()} tint={tintFor(s.slug)} radius={14} fontSize={16} />
            </span>
            <div>
              <h1 style={{ margin: 0, fontSize: "clamp(32px, 4vw, 46px)", lineHeight: 1.05, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>{s.name}</h1>
              <div style={{ marginTop: 6, fontSize: 14.5, color: "#A8B6BE" }}>
                Game studio{s.parent ? ` · part of ${s.parent}` : ""}{s.founded ? ` · founded ${s.founded}` : ""} ·{" "}
                <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#5FE3E8" }}>{new URL(s.sourceUrl).hostname.replace(/^www\./, "")} ↗</a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div style={{ height: 28 }} />
      <StudioLicences studio={s} />
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px 64px" }}>
        <FeaturedPartner context={{ kind: "slots" }} />
        <ReportIssue subject={s.name} />
        <NextSteps steps={nextStepsFor("provider")} />
      </section>
    </main>
  );
}
