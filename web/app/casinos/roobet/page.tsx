import { RoobetReviewPage } from "@/components/casinos/RoobetReviewPage";
import { faqData } from "@/lib/roobet-faq";
import { pageMetadata } from "@/lib/seo";
import { entityBreadcrumbSchema, faqSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = pageMetadata(
  "Roobet: stated instant withdrawals, no-wager rakeback, no crypto withdrawal fee",
  "Roobet, from its own terms and help centre: stated instant withdrawals, no fee on crypto withdrawals, rakeback with no wagering multiplier. Payouts not yet timed by us.",
  "/casinos/roobet"
);

export default function Page() {
  return (
    <>
      <JsonLd data={[entityBreadcrumbSchema("Casino profile", "/crypto-casinos", "Roobet", "/casinos/roobet"), faqSchema(faqData)]} />
      <RoobetReviewPage />
    </>
  );
}
