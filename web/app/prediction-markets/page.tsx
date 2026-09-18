import { PredictionMarketsPage } from "@/components/prediction-markets/PredictionMarketsPage";
import { pageMetadata } from "@/lib/seo";
import { CasinoPredictions } from "@/components/prediction-markets/CasinoPredictions";

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
  return (
    <>
      <PredictionMarketsPage initialTab={tab === "fiat" ? "fiat" : "crypto"} />
      <CasinoPredictions />
    </>
  );
}
