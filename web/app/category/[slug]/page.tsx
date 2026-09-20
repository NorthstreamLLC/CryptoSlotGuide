import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { LEGACY_CATEGORIES, legacyCategory, legacyPosts, readingMinutes } from "@/lib/legacy";
import { LandingShell } from "@/components/landing/LandingShell";
import { PostGrid } from "@/components/legacy/PostGrid";

export function generateStaticParams() {
  return LEGACY_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = legacyCategory(slug);
  if (!c) return {};
  return pageMetadata(c.name, c.description || `${c.name} guides from CryptoSlotGuide: ${c.count} articles.`, `/category/${slug}`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = legacyCategory(slug);
  if (!c) notFound();
  const posts = legacyPosts(slug);
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Guides", path: "/blog" }, { name: c.name, path: `/category/${slug}` }])} />
      <LandingShell crumbs={[{ label: "Home", href: "/" }, { label: "Guides", href: "/blog" }, { label: c.name }]} eyebrow="Guides" title={c.name} intro={c.description || `${posts.length} guides in ${c.name}.`}>
        <PostGrid posts={posts} readingMinutes={readingMinutes} />
      </LandingShell>
    </>
  );
}
