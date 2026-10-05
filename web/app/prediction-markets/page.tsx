import { PredictionMarketsPage } from "@/components/prediction-markets/PredictionMarketsPage";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/lib/schema";
import { CasinoPredictions } from "@/components/prediction-markets/CasinoPredictions";
import { WhereAvailable } from "@/components/prediction-markets/WhereAvailable";
import { venuesInOrder, venueHref } from "@/lib/prediction-markets";

/**
 * The crypto-settled venues. The regulated (fiat) list has its own page at
 * /prediction-markets/regulated; ?tab=fiat redirects there (next.config.ts).
 */
const TITLE = "Crypto prediction markets";
const DESC = "Crypto-settled prediction markets — Polymarket, Limitless, Overtime and Myriad — with fees, settlement and each venue's own restricted countries, plus the crypto casinos that run their own markets.";

export const metadata = pageMetadata(TITLE, DESC, "/prediction-markets");

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Prediction markets", path: "/prediction-markets" }]),
          collectionPageSchema(TITLE, DESC, "/prediction-markets"),
          itemListSchema(TITLE, venuesInOrder("crypto").map((m) => ({ name: m.name, path: venueHref(m.slug) }))),
        ]}
      />
      <PredictionMarketsPage tab="crypto" />
      <WhereAvailable tab="crypto" />
      <CasinoPredictions />
    </>
  );
}
