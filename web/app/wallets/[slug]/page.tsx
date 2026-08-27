import { notFound } from "next/navigation";
import { getEntityView } from "@/lib/entity-view";
import { EntityReviewPage } from "@/components/entity/EntityReviewPage";
import { pageMetadata } from "@/lib/seo";

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
  return <EntityReviewPage e={view} />;
}
