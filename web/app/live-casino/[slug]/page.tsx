import { notFound } from "next/navigation";
import { siteData } from "@/lib/site-data";
import { LiveGamePage } from "@/components/live-casino/LiveGamePage";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = siteData.liveGames.find((x) => x.slug === slug);
  if (!g) return {};
  return pageMetadata(
    `${g.name} review 2026: ${g.rtp.toFixed(2)}% return, ${g.stake} stakes, ${g.studio}`,
    g.why,
    `/live-casino/${slug}`
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = siteData.liveGames.find((x) => x.slug === slug);
  if (!g) notFound();
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Live casino", path: "/live-casino" }, { name: g.name, path: `/live-casino/${slug}` }])} />
      <LiveGamePage g={g} />
    </>
  );
}
