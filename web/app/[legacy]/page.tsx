import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { LEGACY_ITEMS, legacyBySlug, legacyPosts } from "@/lib/legacy";
import { Article } from "@/components/legacy/Article";

export function generateStaticParams() {
  return LEGACY_ITEMS.map((i) => ({ legacy: i.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ legacy: string }> }) {
  const { legacy } = await params;
  const item = legacyBySlug(legacy);
  if (!item) return {};
  return pageMetadata(item.title, item.excerpt || `${item.title} — a crypto casino guide from CryptoSlotGuide.`, `/${legacy}`);
}

export default async function Page({ params }: { params: Promise<{ legacy: string }> }) {
  const { legacy } = await params;
  const item = legacyBySlug(legacy);
  if (!item) notFound();
  const cat = item.categories[0]?.slug;
  const related = legacyPosts(cat).filter((r) => r.slug !== item.slug).slice(0, 4);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Guides", path: "/blog" }, { name: item.title, path: `/${legacy}` }]),
          articleSchema(item.title, item.excerpt, `/${legacy}`, item.date, item.modified),
        ]}
      />
      <Article item={item} related={related} />
    </>
  );
}
