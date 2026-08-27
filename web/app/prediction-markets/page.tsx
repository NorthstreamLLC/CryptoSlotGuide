import { PredictionMarketsPage } from "@/components/prediction-markets/PredictionMarketsPage";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const isFiat = tab === "fiat";
  return pageMetadata(
    isFiat ? "Regulated fiat prediction markets" : "Crypto-settled prediction markets",
    "Event contracts price probability instead of paying a bookmaker's margin. Two lists, split by settlement asset, never merged.",
    isFiat ? "/prediction-markets?tab=fiat" : "/prediction-markets"
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  return <PredictionMarketsPage initialTab={tab === "fiat" ? "fiat" : "crypto"} />;
}
