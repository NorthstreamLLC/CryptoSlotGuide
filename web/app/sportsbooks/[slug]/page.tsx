import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { sportsbookOps, sportsFacts } from "@/lib/sports";
import { SportsbookPage } from "@/components/sports/SportsbookPage";

export function generateStaticParams() {
  return sportsbookOps().map((o) => ({ slug: o.slug }));
}

const bookBy = (slug: string) => sportsbookOps().find((o) => o.slug === slug) ?? null;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const o = bookBy(slug);
  if (!o) return {};
  const offer = sportsFacts(slug).offer?.value;
  const lead = offer && !/^(rotating|no )/i.test(String(offer)) ? String(offer).split(/[.:;]/)[0] : "sports promotions";
  return pageMetadata(
    `${o.name} sportsbook: welcome bonus, races and markets`,
    `${o.name}'s sportsbook: ${lead}, the sports races and boosts it runs, and what you can bet on — each line from ${o.name}'s own terms.`,
    `/sportsbooks/${slug}`
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const o = bookBy(slug);
  if (!o) notFound();
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Sportsbooks", path: "/sportsbooks" }, { name: `${o.name} sportsbook`, path: `/sportsbooks/${slug}` }])} />
      <SportsbookPage o={o} />
    </>
  );
}
