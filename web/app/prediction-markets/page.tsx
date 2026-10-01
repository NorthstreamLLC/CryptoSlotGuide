import { PredictionMarketsPage } from "@/components/prediction-markets/PredictionMarketsPage";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/lib/schema";
import { CasinoPredictions } from "@/components/prediction-markets/CasinoPredictions";
import { venuesInOrder } from "@/lib/prediction-markets";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const isFiat = tab === "fiat";
  return pageMetadata(
    isFiat ? "Regulated fiat prediction markets" : "Crypto-settled prediction markets",
    "Event contracts price probability instead of paying a bookmaker's margin. Crypto-settled and regulated venues, plus the crypto casinos that run their own prediction markets.",
    isFiat ? "/prediction-markets?tab=fiat" : "/prediction-markets"
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const isFiat = tab === "fiat";
  const path = isFiat ? "/prediction-markets?tab=fiat" : "/prediction-markets";
  const title = isFiat ? "Regulated fiat prediction markets" : "Crypto-settled prediction markets";
  // These venues are external sites, not pages of ours, so the ItemList
  // points at each market's own URL — which is what the table links to. The
  // order is the table's order, from the same helper, never a second sort.
  const venues = venuesInOrder(isFiat ? "fiat" : "crypto").map((m) => ({ name: m.name, path: m.site }));
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Prediction markets", path: "/prediction-markets" }]),
          collectionPageSchema(title, "Event contracts price probability instead of paying a bookmaker's margin.", path),
          itemListSchema(title, venues),
        ]}
      />
      <PredictionMarketsPage initialTab={tab === "fiat" ? "fiat" : "crypto"} />
      <CasinoPredictions />
    </>
  );
}
