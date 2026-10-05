import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { FiatHub } from "@/components/fiat/FiatHub";

const TITLE = "Licensed casinos and sportsbooks, country by country";
const SUB = "Every site each country's regulator licenses, with its logo and a link to the site — US states, sweepstakes, Ontario, the UK and Europe. The fiat side, kept apart from crypto casinos.";

export const metadata = pageMetadata(TITLE, SUB, "/licensed-casinos");

export default function Page() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Licensed casinos", path: "/licensed-casinos" }]), collectionPageSchema(TITLE, SUB, "/licensed-casinos")]} />
      <FiatHub />
    </>
  );
}
