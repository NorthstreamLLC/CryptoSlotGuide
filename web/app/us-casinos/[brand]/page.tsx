import { notFound } from "next/navigation";
import { US_BRANDS, usBrand, countsFor } from "@/lib/us-brands";
import { UsBrandPage } from "@/components/us/UsBrandPage";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

export function generateStaticParams() {
  // Only brands a regulator actually lists. A brand in the registry with no
  // state behind it would be an empty page asserting nothing.
  return US_BRANDS.filter((b) => {
    const c = countsFor(b.slug);
    return c.sportsbook.length + c.casino.length > 0;
  }).map((b) => ({ brand: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  const b = usBrand(brand);
  if (!b) return {};
  const c = countsFor(brand);
  const parts = [
    c.sportsbook.length ? `${c.sportsbook.length} states for sports betting` : null,
    c.casino.length ? `${c.casino.length} for online casino` : null,
  ].filter(Boolean);
  return pageMetadata(
    `Where ${b.name} is licensed in the US`,
    `State regulators list ${b.name} in ${parts.join(" and ")}. Every state linked to the regulator's own published list.`,
    `/us-casinos/${brand}`
  );
}

export default async function Page({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  const b = usBrand(brand);
  if (!b) notFound();
  const c = countsFor(brand);
  if (c.sportsbook.length + c.casino.length === 0) notFound();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "US regulated", path: "/us-casinos" },
            { name: b.name, path: `/us-casinos/${brand}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: b.name,
            url: b.site,
            mainEntityOfPage: `${SITE_URL}/us-casinos/${brand}`,
            // areaServed is the set of states a regulator lists the brand in —
            // what this page can actually stand behind. No rating, no review.
            areaServed: [...new Set([...c.sportsbook, ...c.casino])].sort().map((code) => ({
              "@type": "State",
              name: code,
            })),
          },
        ]}
      />
      <UsBrandPage brand={b} />
    </>
  );
}
