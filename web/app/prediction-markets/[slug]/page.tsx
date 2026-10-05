import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { VenuePage } from "@/components/prediction-markets/VenuePage";
import { allVenues, availabilityOf, venueBySlug } from "@/lib/prediction-markets";

export function generateStaticParams() {
  return allVenues().map(({ v }) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const x = venueBySlug(slug);
  if (!x) return {};
  const a = availabilityOf(slug);
  const where = a?.mode === "blocklist" ? `restricted in ${a.codes.length} countries` : a?.mode === "allowlist" ? `open in ${a.codes.join(", ")} only` : "eligibility by country";
  return pageMetadata(
    `${x.v.name}: fees, settlement and where it's available`,
    `${x.v.name} settles in ${x.v.settle}. Fees, account checks, payouts and ${where}, each from ${x.v.name}'s own pages.`,
    `/prediction-markets/${slug}`
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const x = venueBySlug(slug);
  if (!x) notFound();
  const list = x.tab === "crypto" ? { name: "Prediction markets", path: "/prediction-markets" } : { name: "Regulated prediction markets", path: "/prediction-markets/regulated" };
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, list, { name: x.v.name, path: `/prediction-markets/${slug}` }])} />
      <VenuePage v={x.v} tab={x.tab} />
    </>
  );
}
