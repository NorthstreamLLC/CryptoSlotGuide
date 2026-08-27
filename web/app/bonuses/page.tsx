import { BonusesPage } from "@/components/bonuses/BonusesPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "What each offer actually costs you",
  "Every live bonus on our index, with the turnover it demands per $100 of credit, the cashout cap, and the expiry — transcribed from the operator's own terms rather than the banner.",
  "/bonuses"
);

export default function Page() {
  return <BonusesPage />;
}
