import { notFound } from "next/navigation";
import { getEntityView, backLink } from "@/lib/entity-view";
import { CasinoReport } from "@/components/casino/CasinoReport";
import { pageMetadata } from "@/lib/seo";
import { siteData } from "@/lib/site-data";
import { hasPromoPage } from "@/lib/promo-pages";
import { entityBreadcrumbSchema, faqSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const view = getEntityView("casino", slug);
  if (!view) return {};
  // Where we hold a code, the title matches what people search for: the
  // bonus, withdrawals and the code (Search Console, November 2026). The H1
  // and the rest of the page are unchanged.
  const o = siteData.ops.find((x) => x.slug === slug);
  const code = o?.affiliate && o.signupUrl && o.promoCode && /^[A-Za-z]{3,14}$/.test(o.promoCode) && hasPromoPage(slug) ? o.promoCode : null;
  if (o && code) {
    return pageMetadata(
      `${o.name} review: bonus, withdrawals and code ${code}`,
      `${o.name}'s welcome offer (${o.bonusShort ?? o.bonus}), its wagering, how fast withdrawals are and what code ${code} gets you, each checked against ${o.name}'s own pages.`,
      `/casinos/${slug}`
    );
  }
  return pageMetadata(view.headline, view.standfirst, `/casinos/${slug}`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const view = getEntityView("casino", slug);
  if (!view) notFound();
  return (
    <>
      <JsonLd data={[entityBreadcrumbSchema(view.kicker, backLink("casino").href, view.name, `/casinos/${slug}`), faqSchema(view.faqs)]} />
      <CasinoReport e={view} />
    </>
  );
}
