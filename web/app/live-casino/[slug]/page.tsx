import { notFound } from "next/navigation";
import { siteData } from "@/lib/site-data";
import { LiveGamePage } from "@/components/live-casino/LiveGamePage";
import { pageMetadata } from "@/lib/seo";

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
  return <LiveGamePage g={g} />;
}
