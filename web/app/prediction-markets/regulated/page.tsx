import { PredictionMarketsPage } from "@/components/prediction-markets/PredictionMarketsPage";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/lib/schema";
import { WhereAvailable } from "@/components/prediction-markets/WhereAvailable";
import { NextSteps } from "@/components/layout/NextSteps";
import { venuesInOrder, venueHref } from "@/lib/prediction-markets";

const TITLE = "Regulated prediction markets";
const DESC = "US-dollar prediction markets the CFTC oversees — Kalshi, Polymarket US, Robinhood, ForecastEx and PredictIt — with fees, identity checks, payouts and who each one serves.";

export const metadata = pageMetadata(TITLE, DESC, "/prediction-markets/regulated");

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Prediction markets", path: "/prediction-markets" },
            { name: "Regulated", path: "/prediction-markets/regulated" },
          ]),
          collectionPageSchema(TITLE, DESC, "/prediction-markets/regulated"),
          itemListSchema(TITLE, venuesInOrder("fiat").map((m) => ({ name: m.name, path: venueHref(m.slug) }))),
        ]}
      />
      <PredictionMarketsPage tab="fiat" />
      <WhereAvailable tab="fiat" />
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px 70px" }}>
        <NextSteps
          steps={[
            { href: "/prediction-markets", label: "Crypto prediction markets", hint: "Stablecoin venues, with each one's restricted countries." },
            { href: "/exchanges", label: "Exchanges to fund with", hint: "Where to buy the dollars-to-crypto bridge if you need one." },
            { href: "/us-sportsbooks", label: "US sportsbooks", hint: "State-licensed fixed-odds books." },
          ]}
        />
      </div>
    </>
  );
}
