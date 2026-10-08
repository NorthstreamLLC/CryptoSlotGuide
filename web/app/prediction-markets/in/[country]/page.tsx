import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { PredCountryPage } from "@/components/prediction-markets/PredCountryPage";
import { openCount, predCountries, predCountry, statusIn, venuesInOrder } from "@/lib/prediction-markets";

export function generateStaticParams() {
  return predCountries().map((c) => ({ country: c.code.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const c = predCountry(country);
  if (!c) return {};
  const n = openCount("crypto", c.code);
  const total = venuesInOrder("crypto").length;
  // Every crypto venue refuses the US; the regulated venues are the answer there.
  const fiat = venuesInOrder("fiat").filter((v) => statusIn(v.slug, c.code).kind === "open").length;
  return pageMetadata(
    c.code === "US" ? `Prediction markets in the United States: ${fiat} regulated venues` : `Prediction markets in ${c.name}: ${n} of ${total} crypto venues available`,
    `Which prediction markets accept users in ${c.name} — Polymarket, Limitless, Overtime, Myriad, Kalshi and the regulated US venues — each from the venue's own restricted list.`,
    `/prediction-markets/in/${country}`,
    undefined,
    // The US page has its own regulated-venue content; the rest are one
    // template with a country swapped in, so they stay out of the index.
    { noindex: c.code !== "US" }
  );
}

export default async function Page({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const c = predCountry(country);
  if (!c) notFound();
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Prediction markets", path: "/prediction-markets" }, { name: c.name, path: `/prediction-markets/in/${country}` }])} />
      <PredCountryPage code={c.code} name={c.name} />
    </>
  );
}
