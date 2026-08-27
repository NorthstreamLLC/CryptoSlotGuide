import { ComparePage } from "@/components/compare/ComparePage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Compare operators side by side",
  "Pick any two or three operators — casinos, wallets, exchanges, sportsbooks — and compare their measured figures column by column.",
  "/compare"
);

export default function Page() {
  return <ComparePage />;
}
