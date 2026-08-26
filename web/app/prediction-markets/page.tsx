import { PredictionMarketsPage } from "@/components/prediction-markets/PredictionMarketsPage";

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  return <PredictionMarketsPage initialTab={tab === "fiat" ? "fiat" : "crypto"} />;
}
