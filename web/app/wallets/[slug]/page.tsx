import { notFound } from "next/navigation";
import { getEntityView, backLink } from "@/lib/entity-view";
import { EntityReviewPage } from "@/components/entity/EntityReviewPage";
import { pageMetadata } from "@/lib/seo";
import { entityBreadcrumbSchema, faqSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const view = getEntityView("wallet", slug);
  if (!view) return {};
  return pageMetadata(view.headline, view.standfirst, `/wallets/${slug}`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const view = getEntityView("wallet", slug);
  if (!view) notFound();
  return (
    <>
      <JsonLd data={[entityBreadcrumbSchema(view.kicker, backLink("wallet").href, view.name, `/wallets/${slug}`), faqSchema(view.faqs)]} />
      <EntityReviewPage e={view} />
    </>
  );
}
