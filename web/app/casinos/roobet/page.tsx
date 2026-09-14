import { RoobetReviewPage } from "@/components/casinos/RoobetReviewPage";
import { faqData } from "@/lib/roobet-faq";
import { pageMetadata } from "@/lib/seo";
import { entityBreadcrumbSchema, faqSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = pageMetadata(
  "Roobet review 2026: payout speed, 1× wagering, tiered KYC",
  "Roobet leads our index on listed figures — payout speed, wagering and KYC compared against every other operator we track. Payouts not yet timed by us.",
  "/casinos/roobet"
);

export default function Page() {
  return (
    <>
      <JsonLd data={[entityBreadcrumbSchema("Casino review", "/crypto-casinos", "Roobet", "/casinos/roobet"), faqSchema(faqData)]} />
      <RoobetReviewPage />
    </>
  );
}
