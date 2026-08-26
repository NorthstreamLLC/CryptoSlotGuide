import { notFound } from "next/navigation";
import { siteData } from "@/lib/site-data";
import { LiveGamePage } from "@/components/live-casino/LiveGamePage";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = siteData.liveGames.find((x) => x.slug === slug);
  if (!g) notFound();
  return <LiveGamePage g={g} />;
}
