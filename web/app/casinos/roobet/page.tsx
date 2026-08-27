import { RoobetReviewPage } from "@/components/casinos/RoobetReviewPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Roobet review 2026: four-minute payouts, 1× wagering, tiered KYC",
  "Roobet leads our index on published figures — payout speed, wagering and KYC compared against every other operator we track.",
  "/casinos/roobet"
);

export default function Page() {
  return <RoobetReviewPage />;
}
