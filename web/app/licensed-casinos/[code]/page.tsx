import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { fiatMarket, fiatMarkets } from "@/lib/fiat";
import { FiatMarketPage } from "@/components/fiat/FiatMarketPage";

export function generateStaticParams() {
  return fiatMarkets().map((m) => ({ code: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const m = fiatMarket(code);
  if (!m) return {};
  // Australia licenses bookmakers only; its page is not about casinos.
  const what = m.brands.length && m.brands.every((b) => b.products.length === 1 && b.products[0] === "sports") ? "sportsbooks" : "casinos";
  return pageMetadata(
    m.brands.length === 1 ? `Licensed online ${what} in ${m.name}: ${m.brands[0].name} only` : `Licensed online ${what} in ${m.name}: all ${m.brands.length} brands`,
    `Every online casino and sportsbook ${m.regulator} licenses in ${m.name}, with the licence holder and a link to each site, read from the regulator's own register.`,
    `/licensed-casinos/${m.slug}`
  );
}

export default async function Page({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ type?: string }> }) {
  const { code } = await params;
  const { type } = await searchParams;
  const m = fiatMarket(code);
  if (!m) notFound();
  const t = type === "casino" || type === "sports" ? type : "all";
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Licensed casinos", path: "/licensed-casinos" }, { name: m.name, path: `/licensed-casinos/${m.slug}` }]),
          itemListSchema(`Licensed online casinos in ${m.name}`, m.brands.map((b) => ({ name: b.name, path: `/licensed-casinos/${m.slug}#${b.id}` }))),
        ]}
      />
      <FiatMarketPage m={m} type={t} />
    </>
  );
}
