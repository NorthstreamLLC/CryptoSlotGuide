import { notFound } from "next/navigation";
import { CoinsPage } from "@/components/coins/CoinsPage";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteData } from "@/lib/site-data";
import { coinBySlug, coinSlug } from "@/lib/coins";

export function generateStaticParams() {
  return siteData.coinDefs.map((c) => ({ coin: coinSlug(c) }));
}

export async function generateMetadata({ params }: { params: Promise<{ coin: string }> }) {
  const { coin } = await params;
  const c = coinBySlug(coin);
  if (!c) return {};
  const n = siteData.ops.filter((o) => (siteData.coinsBy[o.slug] ?? []).map(String).includes(String(c.ticker))).length;
  return pageMetadata(
    `${c.name} casinos: ${n} that accept ${c.ticker}`,
    `${n} of the ${siteData.ops.length} crypto casinos we track accept ${c.name} (${c.ticker}). How the network confirms and charges for a transfer, from its own documentation, and every casino that takes it.`,
    `/coins/${coin}`
  );
}

export default async function Page({ params }: { params: Promise<{ coin: string }> }) {
  const { coin } = await params;
  const c = coinBySlug(coin);
  if (!c) notFound();
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Coins", path: "/coins" }, { name: c.name, path: `/coins/${coin}` }])} />
      <CoinsPage coin={String(c.ticker)} />
    </>
  );
}
